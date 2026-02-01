import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listSkills, addSkill, removeSkill, checkUpdates } from '../../lib/cli'

const mockExecute = vi.fn()

vi.mock('@tauri-apps/plugin-shell', () => ({
  Command: {
    create: vi.fn(() => ({
      execute: mockExecute,
    })),
  },
}))

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
      expect(Command.create).toHaveBeenCalledWith('npx', ['skills', 'list'])
    })

    it('calls npx skills list with global flag', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await listSkills(true)

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith('npx', ['skills', 'list', '-g'])
    })

    it('calls npx skills list with agents filter', async () => {
      mockExecute.mockResolvedValue({
        code: 0,
        stdout: '',
        stderr: '',
      })

      await listSkills(false, ['agent1', 'agent2'])

      const { Command } = await import('@tauri-apps/plugin-shell')
      expect(Command.create).toHaveBeenCalledWith('npx', [
        'skills',
        'list',
        '-a',
        'agent1,agent2',
      ])
    })

    it('throws error on non-zero exit code', async () => {
      mockExecute.mockResolvedValue({
        code: 1,
        stdout: '',
        stderr: 'Error message',
      })

      await expect(listSkills()).rejects.toThrow('CLI error: Error message')
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
      expect(Command.create).toHaveBeenCalledWith('npx', [
        'skills',
        'add',
        'github:user/repo',
      ])
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
      expect(Command.create).toHaveBeenCalledWith('npx', [
        'skills',
        'add',
        'github:user/repo',
        '-g',
        '-a',
        'agent1',
        '-s',
        'skill1,skill2',
        '-y',
      ])
    })

    it('throws error on non-zero exit code', async () => {
      mockExecute.mockResolvedValue({
        code: 1,
        stdout: '',
        stderr: '\x1B[31mError\x1B[0m',
      })

      await expect(addSkill('github:user/repo')).rejects.toThrow(
        'Failed to add skill: Error'
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
      expect(Command.create).toHaveBeenCalledWith('npx', [
        'skills',
        'remove',
        'skill-name',
      ])
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
      expect(Command.create).toHaveBeenCalledWith('npx', [
        'skills',
        'remove',
        'skill-name',
        '-g',
        '-a',
        'agent1',
      ])
    })

    it('throws error on non-zero exit code', async () => {
      mockExecute.mockResolvedValue({
        code: 1,
        stdout: '',
        stderr: 'Error',
      })

      await expect(removeSkill('skill-name')).rejects.toThrow(
        'Failed to remove skill: Error'
      )
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
      expect(Command.create).toHaveBeenCalledWith('npx', ['skills', 'check'])
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
})
