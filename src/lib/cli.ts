import { homeDir } from '@tauri-apps/api/path'
import { fetch } from '@tauri-apps/plugin-http'
import { Command } from '@tauri-apps/plugin-shell'
import { Store } from '@tauri-apps/plugin-store'
import type { PackageManager, Preferences } from '@/types/preferences'
import { stripAnsi } from './ansi'
import { executeExclusive } from './command-queue'

let store: Store | null = null

async function getStore() {
  if (!store) {
    store = await Store.load('skillpad.json')
  }
  return store
}

async function getPackageManager(): Promise<PackageManager> {
  const s = await getStore()
  const prefs = await s.get<Preferences>('preferences')
  return prefs?.packageManager ?? 'npx'
}

export interface SkillInfo {
  name: string
  path: string
  agents: string[]
}

export interface AddSkillOptions {
  global?: boolean
  agents?: string[]
  skills?: string[]
  yes?: boolean
  cwd?: string
}

export interface RemoveSkillOptions {
  global?: boolean
  agents?: string[]
  cwd?: string
}

export interface ListSkillsOptions {
  global?: boolean
  agents?: string[]
  cwd?: string
}

function buildSkillsArgs(pm: PackageManager, subcommand: string[]): string[] {
  if (pm === 'npx') {
    return ['-y', 'skills', ...subcommand]
  }
  return ['skills', ...subcommand]
}

function isNoSuchDirectoryError(message: string): boolean {
  return message.includes('No such file or directory')
}

export async function listSkills(options: ListSkillsOptions = {}): Promise<SkillInfo[]> {
  const { global = false, agents, cwd } = options
  const pm = await getPackageManager()
  const args = buildSkillsArgs(pm, ['list'])
  if (global) args.push('-g')
  if (agents?.length) {
    args.push('-a', agents.join(','))
  }

  const commandOptions = cwd ? { cwd } : undefined
  let result: Awaited<ReturnType<ReturnType<typeof Command.create>['execute']>>
  try {
    result = await executeExclusive(pm, args, commandOptions)
  } catch (error) {
    if (isNoSuchDirectoryError(String(error))) return []
    throw new Error(`Failed to list skills: ${error}`)
  }

  if (result.code !== 0) {
    const stderr = stripAnsi(result.stderr).trim()
    const stdout = stripAnsi(result.stdout).trim()
    const message = stderr || stdout || `Command exited with code ${result.code}`
    if (isNoSuchDirectoryError(message)) return []
    throw new Error(`Failed to list skills: ${message}`)
  }

  const output = stripAnsi(result.stdout)
  return parseSkillList(output)
}

export async function addSkill(source: string, options: AddSkillOptions = {}): Promise<void> {
  const pm = await getPackageManager()
  const args = buildSkillsArgs(pm, ['add', source])

  if (options.global) args.push('-g')
  if (options.agents?.length) {
    args.push('-a', options.agents.join(','))
  }
  if (options.skills?.length) {
    args.push('-s', options.skills.join(','))
  }
  if (options.yes) args.push('-y')

  const commandOptions = options.cwd ? { cwd: options.cwd } : undefined
  let result: Awaited<ReturnType<ReturnType<typeof Command.create>['execute']>>
  try {
    result = await executeExclusive(pm, args, commandOptions)
  } catch (error) {
    throw new Error(`Failed to add skill: ${error}`)
  }

  if (result.code !== 0) {
    const stderr = stripAnsi(result.stderr).trim()
    const stdout = stripAnsi(result.stdout).trim()
    const message = stderr || stdout || `Command exited with code ${result.code}`
    throw new Error(`Failed to add skill: ${message}`)
  }
}

export async function removeSkill(name: string, options: RemoveSkillOptions = {}): Promise<void> {
  const pm = await getPackageManager()
  const args = buildSkillsArgs(pm, ['remove', name, '-y'])

  if (options.global) args.push('-g')
  if (options.agents?.length) {
    args.push('-a', options.agents.join(','))
  }

  const commandOptions = options.cwd ? { cwd: options.cwd } : undefined
  let result: Awaited<ReturnType<ReturnType<typeof Command.create>['execute']>>
  try {
    result = await executeExclusive(pm, args, commandOptions)
  } catch (error) {
    throw new Error(`Failed to remove skill: ${error}`)
  }

  if (result.code !== 0) {
    const stderr = stripAnsi(result.stderr).trim()
    const stdout = stripAnsi(result.stdout).trim()
    const message = stderr || stdout || `Command exited with code ${result.code}`
    throw new Error(`Failed to remove skill: ${message}`)
  }
}

export async function checkUpdates(): Promise<string> {
  const pm = await getPackageManager()
  const args = buildSkillsArgs(pm, ['check'])
  let result: Awaited<ReturnType<ReturnType<typeof Command.create>['execute']>>
  try {
    result = await executeExclusive(pm, args)
  } catch (error) {
    throw new Error(`Failed to check updates: ${error}`)
  }

  if (result.code !== 0) {
    const stderr = stripAnsi(result.stderr).trim()
    const stdout = stripAnsi(result.stdout).trim()
    const message = stderr || stdout || `Command exited with code ${result.code}`
    throw new Error(`Failed to check updates: ${message}`)
  }

  return stripAnsi(result.stdout)
}

export async function checkUpdatesApi(): Promise<CheckUpdatesApiResult> {
  try {
    const home = await homeDir()
    const lockFilePath = `${home}/.agents/.skill-lock.json`

    const readResult = await Command.create('cat', [lockFilePath]).execute()
    if (readResult.code !== 0) {
      throw new Error('Skill lock file not found')
    }

    const lockFileContent = readResult.stdout.trim()
    const lockFile: SkillLockFile = JSON.parse(lockFileContent)

    const skillsToCheck = Object.entries(lockFile.skills).map(([name, skill]) => ({
      name,
      source: skill.source,
      path: skill.skillPath,
      skillFolderHash: skill.skillFolderHash,
    }))

    const response = await fetch('https://add-skill.vercel.sh/check-updates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skills: skillsToCheck }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = (await response.json()) as {
      updates?: Array<{ name: string; source: string; currentHash: string; latestHash: string }>
      errors?: Array<{ name: string; source: string; error: string }>
    }

    return {
      totalChecked: skillsToCheck.length,
      updatesAvailable: data.updates ?? [],
      errors: data.errors ?? [],
    }
  } catch (error) {
    throw new Error(`Failed to check updates via API: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function parseSkillList(output: string): SkillInfo[] {
  const skills: SkillInfo[] = []
  const lines = output.split('\n')
  let currentSkill: Partial<SkillInfo> | null = null

  for (const line of lines) {
    const trimmed = line.trim()

    const isHeaderOrEmpty = !trimmed || trimmed === 'Global Skills' || trimmed === 'Project Skills'
    if (isHeaderOrEmpty) continue

    const isAgentsLine = trimmed.startsWith('Agents:')
    if (isAgentsLine && currentSkill) {
      const agentsStr = trimmed.replace('Agents:', '').trim()
      currentSkill.agents = agentsStr && agentsStr !== 'not linked' ? agentsStr.split(',').map((a) => a.trim()) : []
      if (currentSkill.name && currentSkill.path) {
        skills.push(currentSkill as SkillInfo)
      }
      currentSkill = null
      continue
    }

    const skillLineMatch = trimmed.match(/^(\S+)\s+(.+)$/)
    if (skillLineMatch) {
      const [, name, path] = skillLineMatch
      const isInfoMessage = name === 'No' || name === 'Try' || (!path?.startsWith('/') && !path?.startsWith('~'))
      if (isInfoMessage) continue

      if (currentSkill?.name && currentSkill?.path) {
        currentSkill.agents = currentSkill.agents || []
        skills.push(currentSkill as SkillInfo)
      }
      currentSkill = {
        name: name!,
        path: path!,
        agents: [],
      }
    }
  }

  if (currentSkill?.name && currentSkill?.path) {
    currentSkill.agents = currentSkill.agents || []
    skills.push(currentSkill as SkillInfo)
  }

  return skills
}

export interface UpdateCheckResult {
  totalChecked: number
  updatesAvailable: SkillUpdate[]
  couldNotCheck: number
  errors?: Array<{
    name: string
    source: string
    error: string
  }>
}

export interface SkillUpdate {
  name: string
  source: string
}

export interface SkillLockFile {
  version: number
  skills: Record<
    string,
    {
      source: string
      sourceType: string
      sourceUrl: string
      skillPath?: string
      skillFolderHash: string
      installedAt: string
      updatedAt: string
    }
  >
}

export interface CheckUpdatesApiResult {
  totalChecked: number
  updatesAvailable: Array<{
    name: string
    source: string
    currentHash: string
    latestHash: string
  }>
  errors: Array<{
    name: string
    source: string
    error: string
  }>
}

export interface UpdateSkillsResult {
  updatedCount: number
  updatedSkills: string[]
}

export async function updateSkills(): Promise<UpdateSkillsResult> {
  const pm = await getPackageManager()
  const args = buildSkillsArgs(pm, ['update'])

  let result: Awaited<ReturnType<ReturnType<typeof Command.create>['execute']>>
  try {
    result = await executeExclusive(pm, args)
  } catch (error) {
    throw new Error(`Failed to update skills: ${error}`)
  }

  if (result.code !== 0) {
    const stderr = stripAnsi(result.stderr).trim()
    const stdout = stripAnsi(result.stdout).trim()
    const message = stderr || stdout || `Command exited with code ${result.code}`
    throw new Error(`Failed to update skills: ${message}`)
  }

  const output = stripAnsi(result.stdout)
  return parseUpdateOutput(output)
}

export function parseUpdateOutput(output: string): UpdateSkillsResult {
  const result: UpdateSkillsResult = {
    updatedCount: 0,
    updatedSkills: [],
  }

  const lines = output.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const updatedMatch = trimmed.match(/✓\s+Updated\s+(\S+)/)
    if (updatedMatch) {
      result.updatedSkills.push(updatedMatch[1]!)
      continue
    }

    const totalMatch = trimmed.match(/✓\s+Updated\s+(\d+)\s+skill\(s\)/)
    if (totalMatch) {
      result.updatedCount = Number.parseInt(totalMatch[1]!, 10)
    }
  }

  if (result.updatedCount === 0 && result.updatedSkills.length > 0) {
    result.updatedCount = result.updatedSkills.length
  }

  return result
}

export async function readLocalSkillMd(skillPath: string): Promise<string> {
  const resolvedPath = skillPath.startsWith('~') ? skillPath.replace('~', await homeDir()) : skillPath
  const paths = [`${resolvedPath}/SKILL.md`, resolvedPath]

  for (const path of paths) {
    try {
      const result = await Command.create('cat', [path]).execute()
      if (result.code === 0 && result.stdout.trim()) {
        return result.stdout
      }
    } catch {}
  }

  throw new Error(`No local SKILL.md found at ${skillPath}`)
}

export function parseUpdateCheckOutput(output: string): UpdateCheckResult {
  const result: UpdateCheckResult = {
    totalChecked: 0,
    updatesAvailable: [],
    couldNotCheck: 0,
  }

  const lines = output.split('\n')
  let currentUpdate: Partial<SkillUpdate> | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const totalCheckedMatch = trimmed.match(/Checking (\d+) skill\(s\) for updates/)
    if (totalCheckedMatch) {
      result.totalChecked = Number.parseInt(totalCheckedMatch[1]!, 10)
      continue
    }

    const couldNotCheckMatch = trimmed.match(/Could not check (\d+) skill\(s\)/)
    if (couldNotCheckMatch) {
      result.couldNotCheck = Number.parseInt(couldNotCheckMatch[1]!, 10)
      continue
    }

    if (trimmed.startsWith('↑')) {
      if (currentUpdate?.name && currentUpdate?.source) {
        result.updatesAvailable.push(currentUpdate as SkillUpdate)
      }
      currentUpdate = {
        name: trimmed.substring(1).trim(),
      }
      continue
    }

    if (trimmed.startsWith('source:') && currentUpdate) {
      currentUpdate.source = trimmed.substring(7).trim()
      result.updatesAvailable.push(currentUpdate as SkillUpdate)
      currentUpdate = null
    }
  }

  return result
}
