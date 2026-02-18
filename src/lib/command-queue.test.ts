import { beforeEach, describe, expect, it } from 'bun:test'
import { mockShellCreate, mockShellExecute } from '@/test-mocks'

const { executeExclusive } = await import('./command-queue')

let executionOrder: number[] = []
let callCount = 0

describe('executeExclusive', () => {
  beforeEach(() => {
    executionOrder = []
    callCount = 0
    mockShellExecute.mockReset()
    mockShellExecute.mockImplementation(async () => {
      const id = ++callCount
      executionOrder.push(id)
      await new Promise((r) => setTimeout(r, 50))
      return { code: 0, stdout: `result-${id}`, stderr: '' }
    })
    mockShellCreate.mockReset()
    mockShellCreate.mockImplementation((..._args: any[]) => ({
      execute: mockShellExecute,
    }))
  })

  it('serializes concurrent calls', async () => {
    // given: three commands fired concurrently
    const [r1, r2, r3] = await Promise.all([
      executeExclusive('bunx', ['skills', 'list']),
      executeExclusive('bunx', ['skills', 'list', '-g']),
      executeExclusive('bunx', ['skills', 'list']),
    ])

    // then: all complete successfully and ran sequentially
    expect(r1.stdout).toBe('result-1')
    expect(r2.stdout).toBe('result-2')
    expect(r3.stdout).toBe('result-3')
    expect(executionOrder).toEqual([1, 2, 3])
  })

  it('continues queue after a failure', async () => {
    // given: first call fails, second succeeds
    mockShellExecute
      .mockImplementationOnce(async () => {
        executionOrder.push(++callCount)
        throw new Error('EEXIST')
      })
      .mockImplementationOnce(async () => {
        executionOrder.push(++callCount)
        return { code: 0, stdout: 'ok', stderr: '' }
      })

    const p1 = executeExclusive('bunx', ['skills', 'list'])
    const p2 = executeExclusive('bunx', ['skills', 'list', '-g'])

    // then: first rejects, second still succeeds
    await expect(p1).rejects.toThrow('EEXIST')
    const r2 = await p2
    expect(r2.stdout).toBe('ok')
    expect(executionOrder).toEqual([1, 2])
  })

  it('passes arguments through to Command.create', async () => {
    await executeExclusive('npx', ['-y', 'skills', 'list'], { cwd: '/tmp' })

    expect(mockShellCreate).toHaveBeenCalledWith('npx', ['-y', 'skills', 'list'], { cwd: '/tmp' })
  })
})
