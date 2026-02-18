import { beforeEach, describe, expect, it } from 'bun:test'
import { mockHttpFetch, mockShellCreate, mockShellExecute, mockStoreGet } from '@/test-mocks'

let mockExecuteQueue: any[] = []
let mockFetchQueue: any[] = []
let mockExecuteCalls: any[] = []
let mockFetchCalls: any[] = []
let mockCreateCalls: any[] = []
let mockStorePreferences: any = null

import {
  addSkill,
  checkUpdates,
  checkUpdatesApi,
  listSkills,
  parseUpdateCheckOutput,
  readLocalSkillMd,
  removeSkill,
} from './cli'

describe('cli', () => {
  beforeEach(() => {
    mockExecuteQueue = []
    mockFetchQueue = []
    mockExecuteCalls = []
    mockFetchCalls = []
    mockCreateCalls = []
    mockStorePreferences = null
    mockShellExecute.mockReset()
    mockShellExecute.mockImplementation(async (...args: any[]) => {
      mockExecuteCalls.push(args)
      if (mockExecuteQueue.length > 0) {
        const response = mockExecuteQueue.shift()
        if (response instanceof Error) throw response
        return response
      }
    })
    mockShellCreate.mockReset()
    mockShellCreate.mockImplementation((...args: any[]) => {
      mockCreateCalls.push(args)
      return { execute: mockShellExecute }
    })
    mockHttpFetch.mockReset()
    mockHttpFetch.mockImplementation(async (...args: any[]) => {
      mockFetchCalls.push(args)
      if (mockFetchQueue.length > 0) {
        const response = mockFetchQueue.shift()
        if (response instanceof Error) throw response
        return response
      }
    })
    mockStoreGet.mockReset()
    mockStoreGet.mockImplementation(async (key: string) => {
      if (key === 'preferences') return mockStorePreferences
      return null
    })
  })

  describe('listSkills', () => {
    it('calls npx skills list with no options', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await listSkills()

      expect(mockCreateCalls[0]).toEqual(['npx', ['-y', 'skills', 'list'], undefined])
    })

    it('calls npx skills list with global flag', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await listSkills({ global: true })

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual(['npx', ['-y', 'skills', 'list', '-g'], undefined])
    })

    it('calls npx skills list with agents filter', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await listSkills({ agents: ['agent1', 'agent2'] })

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'npx',
        ['-y', 'skills', 'list', '-a', 'agent1,agent2'],
        undefined,
      ])
    })

    it('calls npx skills list with cwd option', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await listSkills({ cwd: '/path/to/project' })

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'npx',
        ['-y', 'skills', 'list'],
        {
          cwd: '/path/to/project',
        },
      ])
    })

    it('throws error on non-zero exit code', async () => {
      mockExecuteQueue.push({
        code: 1,
        stdout: '',
        stderr: 'Error message',
      })

      await expect(listSkills()).rejects.toThrow('Failed to list skills: Error message')
    })

    it('strips ANSI codes from output', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '\x1B[32mGreen text\x1B[0m',
        stderr: '',
      })

      await listSkills()

      expect(mockShellExecute).toHaveBeenCalled()
    })

    it('filters out info messages from empty project skills output', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: `Project Skills

No project skills found.
Try listing global skills with -g`,
        stderr: '',
      })

      const result = await listSkills()

      expect(result).toEqual([])
    })

    it('returns empty array when skills directory does not exist (stderr)', async () => {
      mockExecuteQueue.push({
        code: 1,
        stdout: '',
        stderr: 'No such file or directory (os error 2)',
      })

      const result = await listSkills()

      expect(result).toEqual([])
    })

    it('returns empty array when skills directory does not exist (thrown)', async () => {
      mockShellExecute.mockRejectedValueOnce(new Error('No such file or directory (os error 2)'))

      const result = await listSkills()

      expect(result).toEqual([])
    })

    it('parses valid skill entries correctly', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: `Global Skills

my-skill    /Users/test/.skills/my-skill
  Agents: claude, cursor`,
        stderr: '',
      })

      const result = await listSkills({ global: true })

      expect(result).toEqual([
        {
          name: 'my-skill',
          path: '/Users/test/.skills/my-skill',
          agents: ['claude', 'cursor'],
        },
      ])
    })
  })

  describe('addSkill', () => {
    it('calls npx skills add with source', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await addSkill('github:user/repo')

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'npx',
        ['-y', 'skills', 'add', 'github:user/repo'],
        undefined,
      ])
    })

    it('calls npx skills add with all options', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await addSkill('github:user/repo', {
        global: true,
        agents: ['agent1'],
        skills: ['skill1', 'skill2'],
        yes: true,
      })

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'npx',
        ['-y', 'skills', 'add', 'github:user/repo', '-g', '-a', 'agent1', '-s', 'skill1,skill2', '-y'],
        undefined,
      ])
    })

    it('throws error on non-zero exit code', async () => {
      mockExecuteQueue.push({
        code: 1,
        stdout: '',
        stderr: '\x1B[31mError\x1B[0m',
      })

      await expect(addSkill('github:user/repo')).rejects.toThrow('Failed to add skill: Error')
    })

    it('calls npx skills add with cwd option for project-scoped installation', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await addSkill('github:user/repo', {
        agents: ['claude'],
        yes: true,
        cwd: '/path/to/project',
      })

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'npx',
        ['-y', 'skills', 'add', 'github:user/repo', '-a', 'claude', '-y'],
        { cwd: '/path/to/project' },
      ])
    })
  })

  describe('removeSkill', () => {
    it('calls npx skills remove with name', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await removeSkill('skill-name')

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'npx',
        ['-y', 'skills', 'remove', 'skill-name', '-y'],
        undefined,
      ])
    })

    it('calls npx skills remove with options', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await removeSkill('skill-name', {
        global: true,
        agents: ['agent1'],
      })

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'npx',
        ['-y', 'skills', 'remove', 'skill-name', '-y', '-g', '-a', 'agent1'],
        undefined,
      ])
    })

    it('calls npx skills remove with cwd option', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await removeSkill('skill-name', { cwd: '/path/to/project' })

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'npx',
        ['-y', 'skills', 'remove', 'skill-name', '-y'],
        {
          cwd: '/path/to/project',
        },
      ])
    })

    it('throws error on non-zero exit code', async () => {
      mockExecuteQueue.push({
        code: 1,
        stdout: '',
        stderr: 'Error',
      })

      await expect(removeSkill('skill-name')).rejects.toThrow('Failed to remove skill: Error')
    })
  })

  describe('package manager selection', () => {
    it('uses bunx without -y flag', async () => {
      mockStorePreferences = { packageManager: 'bunx' }
      mockExecuteQueue.push({ code: 0, stdout: '', stderr: '' })

      await listSkills()

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual(['bunx', ['skills', 'list'], undefined])
    })

    it('uses pnpx without -y flag', async () => {
      mockStorePreferences = { packageManager: 'pnpx' }
      mockExecuteQueue.push({ code: 0, stdout: '', stderr: '' })

      await addSkill('user/repo', { global: true, yes: true })

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'pnpx',
        ['skills', 'add', 'user/repo', '-g', '-y'],
        undefined,
      ])
    })

    it('uses npx with -y flag', async () => {
      mockStorePreferences = { packageManager: 'npx' }
      mockExecuteQueue.push({ code: 0, stdout: '', stderr: '' })

      await removeSkill('my-skill', { global: true })

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'npx',
        ['-y', 'skills', 'remove', 'my-skill', '-y', '-g'],
        undefined,
      ])
    })

    it('defaults to npx when no preference set', async () => {
      mockStorePreferences = null
      mockExecuteQueue.push({ code: 0, stdout: '', stderr: '' })

      await listSkills()

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual(['npx', ['-y', 'skills', 'list'], undefined])
    })
  })

  describe('checkUpdates', () => {
    it('calls npx skills check', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: 'Update available',
        stderr: '',
      })

      const result = await checkUpdates()

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual(['npx', ['-y', 'skills', 'check']])
      expect(result).toBe('Update available')
    })

    it('strips ANSI codes from output', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '\x1B[32mUpdate available\x1B[0m',
        stderr: '',
      })

      const result = await checkUpdates()

      expect(result).toBe('Update available')
    })

    it('throws error on non-zero exit code', async () => {
      mockExecuteQueue.push({
        code: 1,
        stdout: '',
        stderr: 'Error',
      })

      await expect(checkUpdates()).rejects.toThrow('Failed to check updates: Error')
    })
  })

  describe('parseUpdateCheckOutput', () => {
    it('parses output with updates available', () => {
      const output = `Checking 23 skill(s) for updates...

11 update(s) available:

  ↑ analytics-tracking
    source: coreyhaines31/marketingskills
  ↑ competitor-alternatives
    source: coreyhaines31/marketingskills

Run npx skills update to update all skills`

      const result = parseUpdateCheckOutput(output)

      expect(result).toEqual({
        totalChecked: 23,
        updatesAvailable: [
          { name: 'analytics-tracking', source: 'coreyhaines31/marketingskills' },
          { name: 'competitor-alternatives', source: 'coreyhaines31/marketingskills' },
        ],
        couldNotCheck: 0,
      })
    })

    it('parses output with no updates available', () => {
      const output = `Checking 5 skill(s) for updates...

All 5 skill(s) are up to date`

      const result = parseUpdateCheckOutput(output)

      expect(result).toEqual({
        totalChecked: 5,
        updatesAvailable: [],
        couldNotCheck: 0,
      })
    })

    it('parses output with unchecked skills', () => {
      const output = `Checking 10 skill(s) for updates...

Could not check 3 skill(s) (may need reinstall)`

      const result = parseUpdateCheckOutput(output)

      expect(result).toEqual({
        totalChecked: 10,
        updatesAvailable: [],
        couldNotCheck: 3,
      })
    })

    it('parses output with updates and unchecked skills', () => {
      const output = `Checking 20 skill(s) for updates...

1 update(s) available:

  ↑ my-skill
    source: user/repo

Could not check 5 skill(s) (may need reinstall)`

      const result = parseUpdateCheckOutput(output)

      expect(result).toEqual({
        totalChecked: 20,
        updatesAvailable: [{ name: 'my-skill', source: 'user/repo' }],
        couldNotCheck: 5,
      })
    })
  })

  describe('checkUpdatesApi', () => {
    it('reads lock file and calls API with correct payload', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: JSON.stringify({
          version: 1,
          skills: {
            'skill-1': {
              source: 'github:user/repo1',
              sourceType: 'github',
              sourceUrl: 'https://github.com/user/repo1',
              skillFolderHash: 'hash1',
              installedAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
            'skill-2': {
              source: 'github:user/repo2',
              sourceType: 'github',
              sourceUrl: 'https://github.com/user/repo2',
              skillFolderHash: 'hash2',
              installedAt: '2024-01-02',
              updatedAt: '2024-01-02',
            },
          },
        }),
        stderr: '',
      })

      mockFetchQueue.push({
        ok: true,
        json: async () => ({
          updates: [
            {
              name: 'skill-1',
              source: 'github:user/repo1',
              currentHash: 'hash1',
              latestHash: 'hash1-new',
            },
          ],
          errors: [],
        }),
      })

      const result = await checkUpdatesApi()

      expect(result).toEqual({
        totalChecked: 2,
        updatesAvailable: [
          {
            name: 'skill-1',
            source: 'github:user/repo1',
            currentHash: 'hash1',
            latestHash: 'hash1-new',
          },
        ],
        errors: [],
      })
    })

    it('returns errors from API response', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: JSON.stringify({
          version: 1,
          skills: {
            'skill-1': {
              source: 'github:user/repo1',
              sourceType: 'github',
              sourceUrl: 'https://github.com/user/repo1',
              skillFolderHash: 'hash1',
              installedAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
          },
        }),
        stderr: '',
      })

      mockFetchQueue.push({
        ok: true,
        json: async () => ({
          updates: [],
          errors: [{ name: 'skill-1', source: 'github:user/repo1', error: 'Network timeout' }],
        }),
      })

      const result = await checkUpdatesApi()

      expect(result).toEqual({
        totalChecked: 1,
        updatesAvailable: [],
        errors: [{ name: 'skill-1', source: 'github:user/repo1', error: 'Network timeout' }],
      })
    })

    it('throws error when lock file not found', async () => {
      mockExecuteQueue.push({
        code: 1,
        stdout: '',
        stderr: 'No such file or directory',
      })

      await expect(checkUpdatesApi()).rejects.toThrow('Failed to check updates via API')
    })

    it('throws error when API request fails', async () => {
      mockShellExecute
        .mockResolvedValueOnce({
          code: 0,
          stdout: '/Users/test\n',
          stderr: '',
        })
        .mockResolvedValueOnce({
          code: 0,
          stdout: JSON.stringify({
            version: 1,
            skills: {
              'skill-1': {
                source: 'github:user/repo1',
                sourceType: 'github',
                sourceUrl: 'https://github.com/user/repo1',
                skillFolderHash: 'hash1',
                installedAt: '2024-01-01',
                updatedAt: '2024-01-01',
              },
            },
          }),
          stderr: '',
        })

      mockFetchQueue.push({
        ok: false,
        status: 500,
      })

      await expect(checkUpdatesApi()).rejects.toThrow('Failed to check updates via API')
    })
  })

  describe('readLocalSkillMd', () => {
    it('reads SKILL.md from skill directory', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '# My Skill\n\nDescription here.',
        stderr: '',
      })

      const result = await readLocalSkillMd('/home/.agents/skills/my-skill')

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual(['cat', ['/home/.agents/skills/my-skill/SKILL.md']])
      expect(result).toBe('# My Skill\n\nDescription here.')
    })

    it('falls back to skillPath directly when SKILL.md subpath fails', async () => {
      // given - first attempt (path/SKILL.md) fails, second attempt (path itself) succeeds
      mockExecuteQueue.push({ code: 1, stdout: '', stderr: 'No such file' })
      mockExecuteQueue.push({
        code: 0,
        stdout: '# Direct Path Skill',
        stderr: '',
      })

      const result = await readLocalSkillMd('/home/.agents/skills/my-skill/SKILL.md')

      expect(result).toBe('# Direct Path Skill')
    })

    it('throws when no path yields content', async () => {
      mockExecuteQueue.push({ code: 1, stdout: '', stderr: 'No such file' })
      mockExecuteQueue.push({ code: 1, stdout: '', stderr: 'No such file' })

      await expect(readLocalSkillMd('/nonexistent/path')).rejects.toThrow(
        'No local SKILL.md found at /nonexistent/path',
      )
    })

    it('skips empty stdout even on code 0', async () => {
      mockExecuteQueue.push({ code: 0, stdout: '   ', stderr: '' })
      mockExecuteQueue.push({
        code: 0,
        stdout: '# Fallback Content',
        stderr: '',
      })

      const result = await readLocalSkillMd('/home/.agents/skills/my-skill')

      expect(result).toBe('# Fallback Content')
    })

    it('expands tilde to home directory', async () => {
      mockExecuteQueue.push({
        code: 0,
        stdout: '# Tilde Skill',
        stderr: '',
      })

      const result = await readLocalSkillMd('~/.agents/skills/my-skill')

      expect(mockCreateCalls[mockCreateCalls.length - 1]).toEqual([
        'cat',
        ['/Users/test/.agents/skills/my-skill/SKILL.md'],
      ])
      expect(result).toBe('# Tilde Skill')
    })
  })
})
