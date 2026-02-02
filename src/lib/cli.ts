import type { PackageManager, Preferences } from '@/types/preferences'
import { Command } from '@tauri-apps/plugin-shell'
import { Store } from '@tauri-apps/plugin-store'
import { stripAnsi } from './ansi'

let store: Store | null = null

async function getStore() {
  if (!store) {
    store = await Store.load('skillchang.json')
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

export async function listSkills(options: ListSkillsOptions = {}): Promise<SkillInfo[]> {
  const { global = false, agents, cwd } = options
  const args = ['skills', 'list']
  if (global) args.push('-g')
  if (agents?.length) {
    args.push('-a', agents.join(','))
  }

  const commandOptions = cwd ? { cwd } : undefined
  const pm = await getPackageManager()
  let result: Awaited<ReturnType<ReturnType<typeof Command.create>['execute']>>
  try {
    result = await Command.create(pm, args, commandOptions).execute()
  } catch (error) {
    throw new Error(`Failed to list skills: ${error}`)
  }

  if (result.code !== 0) {
    const stderr = stripAnsi(result.stderr).trim()
    const stdout = stripAnsi(result.stdout).trim()
    const message = stderr || stdout || `Command exited with code ${result.code}`
    throw new Error(`Failed to list skills: ${message}`)
  }

  const output = stripAnsi(result.stdout)
  return parseSkillList(output)
}

export async function addSkill(source: string, options: AddSkillOptions = {}): Promise<void> {
  const args = ['skills', 'add', source]

  if (options.global) args.push('-g')
  if (options.agents?.length) {
    args.push('-a', options.agents.join(','))
  }
  if (options.skills?.length) {
    args.push('-s', options.skills.join(','))
  }
  if (options.yes) args.push('-y')

  const commandOptions = options.cwd ? { cwd: options.cwd } : undefined
  const pm = await getPackageManager()
  let result: Awaited<ReturnType<ReturnType<typeof Command.create>['execute']>>
  try {
    result = await Command.create(pm, args, commandOptions).execute()
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
  const args = ['skills', 'remove', name, '-y']

  if (options.global) args.push('-g')
  if (options.agents?.length) {
    args.push('-a', options.agents.join(','))
  }

  const commandOptions = options.cwd ? { cwd: options.cwd } : undefined
  const pm = await getPackageManager()
  let result: Awaited<ReturnType<ReturnType<typeof Command.create>['execute']>>
  try {
    result = await Command.create(pm, args, commandOptions).execute()
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
  let result: Awaited<ReturnType<ReturnType<typeof Command.create>['execute']>>
  try {
    result = await Command.create(pm, ['skills', 'check']).execute()
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
      currentSkill.agents =
        agentsStr && agentsStr !== 'not linked' ? agentsStr.split(',').map((a) => a.trim()) : []
      if (currentSkill.name && currentSkill.path) {
        skills.push(currentSkill as SkillInfo)
      }
      currentSkill = null
      continue
    }

    const skillLineMatch = trimmed.match(/^(\S+)\s+(.+)$/)
    if (skillLineMatch) {
      const [, name, path] = skillLineMatch
      const isInfoMessage =
        name === 'No' || name === 'Try' || (!path?.startsWith('/') && !path?.startsWith('~'))
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
