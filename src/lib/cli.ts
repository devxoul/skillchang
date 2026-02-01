import { Command } from '@tauri-apps/plugin-shell'
import { stripAnsi } from './ansi'

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
}

export interface RemoveSkillOptions {
  global?: boolean
  agents?: string[]
}

export async function listSkills(global: boolean = false, agents?: string[]): Promise<SkillInfo[]> {
  const args = ['skills', 'list']
  if (global) args.push('-g')
  if (agents?.length) {
    args.push('-a', agents.join(','))
  }

  try {
    const result = await Command.create('npx', args).execute()

    if (result.code !== 0) {
      throw new Error(`CLI error: ${result.stderr}`)
    }

    const output = stripAnsi(result.stdout)
    return parseSkillList(output)
  } catch (error) {
    throw new Error(`Failed to list skills: ${error}`)
  }
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

  try {
    const result = await Command.create('npx', args).execute()

    if (result.code !== 0) {
      throw new Error(`Failed to add skill: ${stripAnsi(result.stderr)}`)
    }
  } catch (error) {
    throw new Error(`Failed to add skill: ${error}`)
  }
}

export async function removeSkill(name: string, options: RemoveSkillOptions = {}): Promise<void> {
  const args = ['skills', 'remove', name]

  if (options.global) args.push('-g')
  if (options.agents?.length) {
    args.push('-a', options.agents.join(','))
  }

  try {
    const result = await Command.create('npx', args).execute()

    if (result.code !== 0) {
      throw new Error(`Failed to remove skill: ${stripAnsi(result.stderr)}`)
    }
  } catch (error) {
    throw new Error(`Failed to remove skill: ${error}`)
  }
}

export async function checkUpdates(): Promise<string> {
  try {
    const result = await Command.create('npx', ['skills', 'check']).execute()

    if (result.code !== 0) {
      throw new Error(`Failed to check updates: ${stripAnsi(result.stderr)}`)
    }

    return stripAnsi(result.stdout)
  } catch (error) {
    throw new Error(`Failed to check updates: ${error}`)
  }
}

function parseSkillList(output: string): SkillInfo[] {
  return []
}
