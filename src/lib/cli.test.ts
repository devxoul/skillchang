import { beforeEach, describe, expect, it, vi } from 'vitest'

// @vitest-environment jsdom

const mockExecute = vi.fn()

vi.mock('@tauri-apps/plugin-shell', () => ({
  Command: {
    create: vi.fn(() => ({
      execute: mockExecute,
    })),
  },
}))

vi.mock('@tauri-apps/plugin-http', () => {
  const mockFetch = vi.fn()
  return { fetch: mockFetch }
})

vi.mock('@tauri-apps/api/path', () => ({
  homeDir: vi.fn().mockResolvedValue('/Users/test'),
}))

import { fetch } from '@tauri-apps/plugin-http'
import { addSkill, checkUpdates, checkUpdatesApi, listSkills, parseUpdateCheckOutput, removeSkill } from './cli'

const mockFetch = fetch as ReturnType<typeof vi.fn>

describe('cli', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listSkills', () => {
    it('calls npx skills list with no options', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await listSkills()

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith('npx', ['-y', 'skills', 'list'], undefined)
    })

    it('calls npx skills list with global flag', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await listSkills({ global: true })

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith('npx', ['-y', 'skills', 'list', '-g'], undefined)
    })

    it('calls npx skills list with agents filter', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await listSkills({ agents: ['agent1', 'agent2'] })

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith('npx', ['-y', 'skills', 'list', '-a', 'agent1,agent2'], undefined)
    })

    it('calls npx skills list with cwd option', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await listSkills({ cwd: '/path/to/project' })

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith('npx', ['-y', 'skills', 'list'], {
        cwd: '/path/to/project',
      })
    })

    it('throws error on non-zero exit code', async () => {
      mockExecute.mockResolvedValue({
        code: 1,
        stdout: '',
        stderr: 'Error message',
      })

      await expect(listSkills()).rejects.toThrow('Failed to list skills: Error message')
    })

    it('strips ANSI codes from output', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '\x1B[32mGreen text\x1B[0m',
        stderr: '',
      })

      await listSkills()

      expect(mockExecute).toHaveBeenCalled()
    })

    it('filters out info messages from empty project skills output', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: `Project Skills

No project skills found.
Try listing global skills with -g`,
        stderr: '',
      })

      const result = await listSkills()

      expect(result).toEqual([])
    })

    it('parses valid skill entries correctly', async () => {
      mockExecute.mockResolvedValue({
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
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await addSkill('github:user/repo')

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith('npx', ['-y', 'skills', 'add', 'github:user/repo'], undefined)
    })

    it('calls npx skills add with all options', async () => {
      mockExecute.mockResolvedValue({
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

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith(
        'npx',
        ['-y', 'skills', 'add', 'github:user/repo', '-g', '-a', 'agent1', '-s', 'skill1,skill2', '-y'],
        undefined,
      )
    })

    it('throws error on non-zero exit code', async () => {
      mockExecute.mockResolvedValue({
        code: 1,
        stdout: '',
        stderr: '\x1B[31mError\x1B[0m',
      })

      await expect(addSkill('github:user/repo')).rejects.toThrow('Failed to add skill: Error')
    })

    it('calls npx skills add with cwd option for project-scoped installation', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await addSkill('github:user/repo', {
        agents: ['claude'],
        yes: true,
        cwd: '/path/to/project',
      })

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith(
        'npx',
        ['-y', 'skills', 'add', 'github:user/repo', '-a', 'claude', '-y'],
        { cwd: '/path/to/project' },
      )
    })
  })

  describe('removeSkill', () => {
    it('calls npx skills remove with name', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await removeSkill('skill-name')

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith('npx', ['-y', 'skills', 'remove', 'skill-name', '-y'], undefined)
    })

    it('calls npx skills remove with options', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await removeSkill('skill-name', {
        global: true,
        agents: ['agent1'],
      })

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith(
        'npx',
        ['-y', 'skills', 'remove', 'skill-name', '-y', '-g', '-a', 'agent1'],
        undefined,
      )
    })

    it('calls npx skills remove with cwd option', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await removeSkill('skill-name', { cwd: '/path/to/project' })

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith('npx', ['-y', 'skills', 'remove', 'skill-name', '-y'], {
        cwd: '/path/to/project',
      })
    })

    it('throws error on non-zero exit code', async () => {
      mockExecute.mockResolvedValue({
        code: 1,
        stdout: '',
        stderr: 'Error',
      })

      await expect(removeSkill('skill-name')).rejects.toThrow('Failed to remove skill: Error')
    })
  })

  describe('checkUpdates', () => {
    it('calls npx skills check', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: 'Update available',
        stderr: '',
      })

      const result = await checkUpdates()

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith('npx', ['-y', 'skills', 'check'])
      expect(result).toBe('Update available')
    })

    it('strips ANSI codes from output', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '\x1B[32mUpdate available\x1B[0m',
        stderr: '',
      })

      const result = await checkUpdates()

      expect(result).toBe('Update available')
    })

    it('throws error on non-zero exit code', async () => {
      mockExecute.mockResolvedValue({
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
      mockExecute.mockResolvedValueOnce({
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

      mockFetch.mockResolvedValue({
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
      mockExecute.mockResolvedValueOnce({
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

      mockFetch.mockResolvedValue({
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
      mockExecute.mockResolvedValueOnce({
        code: 1,
        stdout: '',
        stderr: 'No such file or directory',
      })

      await expect(checkUpdatesApi()).rejects.toThrow('Failed to check updates via API')
    })

    it('throws error when API request fails', async () => {
      mockExecute
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

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(checkUpdatesApi()).rejects.toThrow('Failed to check updates via API')
    })
  })
})
