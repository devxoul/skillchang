import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { act, renderHook } from '@testing-library/react'

let mockCheckFn = mock(async () => null as any)
let mockRelaunchFn = mock(async () => undefined)
let mockFetchFn = mock(async (_url?: string, _opts?: any) => ({ ok: true, status: 200 }) as any)
let mockStoreData: Record<string, any> = {}

const mockStoreGet = mock(async (key: string) => mockStoreData[key] ?? null)
const mockStoreSet = mock(async (key: string, value: any) => {
  mockStoreData[key] = value
})
const mockStoreSave = mock(async () => undefined)

mock.module('@tauri-apps/plugin-updater', () => ({
  check: () => mockCheckFn(),
}))

mock.module('@tauri-apps/plugin-process', () => ({
  relaunch: () => mockRelaunchFn(),
}))

mock.module('@tauri-apps/plugin-http', () => ({
  fetch: (url: string, opts?: any) => mockFetchFn(url, opts),
}))

mock.module('@tauri-apps/plugin-store', () => ({
  Store: {
    load: mock(async () => ({
      get: mockStoreGet,
      set: mockStoreSet,
      save: mockStoreSave,
    })),
  },
}))

import { useAppUpdate } from '@/hooks/use-app-update'

function createMockUpdate(version = '2.0.0') {
  return {
    version,
    body: 'release notes',
    date: '2026-01-01',
    rawJson: {
      platforms: {
        'darwin-aarch64': {
          url: 'https://github.com/example/releases/download/v2.0.0/app.tar.gz',
          signature: 'sig',
        },
      },
    },
    downloadAndInstall: mock(async () => undefined),
  }
}

beforeEach(() => {
  mockCheckFn = mock(async () => null)
  mockRelaunchFn = mock(async () => undefined)
  mockFetchFn = mock(async () => ({ ok: true, status: 200 }) as any)
  mockStoreData = {}
  mockStoreGet.mockClear()
  mockStoreSet.mockClear()
  mockStoreSave.mockClear()
})

describe('useAppUpdate', () => {
  test('initial state is idle', () => {
    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: false }))
    expect(result.current.state).toEqual({ status: 'idle' })
  })

  test('checkForUpdate transitions idle → checking → available', async () => {
    const mockUpdate = createMockUpdate()
    mockCheckFn = mock(async () => mockUpdate)
    mockFetchFn = mock(async () => ({ ok: true, status: 200 }) as any)

    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: false }))

    await act(async () => {
      await result.current.checkForUpdate()
    })

    expect(result.current.state).toEqual({ status: 'available', version: '2.0.0' })
  })

  test('checkForUpdate transitions to idle when no update available', async () => {
    mockCheckFn = mock(async () => null)

    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: false }))

    await act(async () => {
      await result.current.checkForUpdate()
    })

    expect(result.current.state).toEqual({ status: 'idle' })
  })

  test('checkForUpdate transitions to error on network failure', async () => {
    mockCheckFn = mock(async () => {
      throw new Error('Network error')
    })

    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: false }))

    await act(async () => {
      await result.current.checkForUpdate()
    })

    expect(result.current.state.status).toBe('error')
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe('Network error')
    }
  })

  test('downloadUpdate transitions available → downloading → ready', async () => {
    const mockUpdate = createMockUpdate()
    mockCheckFn = mock(async () => mockUpdate)
    mockFetchFn = mock(async () => ({ ok: true, status: 200 }) as any)

    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: false }))

    // given - update available
    await act(async () => {
      await result.current.checkForUpdate()
    })
    expect(result.current.state.status).toBe('available')

    // when - download
    await act(async () => {
      await result.current.downloadUpdate()
    })

    // then
    expect(result.current.state).toEqual({ status: 'ready' })
    expect(mockUpdate.downloadAndInstall).toHaveBeenCalled()
  })

  test('downloadUpdate transitions to error on download failure', async () => {
    const mockUpdate = createMockUpdate()
    mockUpdate.downloadAndInstall = mock(async () => {
      throw new Error('Download failed')
    })
    mockCheckFn = mock(async () => mockUpdate)
    mockFetchFn = mock(async () => ({ ok: true, status: 200 }) as any)

    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: false }))

    // given - update available
    await act(async () => {
      await result.current.checkForUpdate()
    })

    // when - download fails
    await act(async () => {
      await result.current.downloadUpdate()
    })

    // then
    expect(result.current.state.status).toBe('error')
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe('Download failed')
    }
  })

  test('restartToUpdate calls relaunch', async () => {
    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: false }))

    await act(async () => {
      await result.current.restartToUpdate()
    })

    expect(mockRelaunchFn).toHaveBeenCalled()
  })

  test('auto-checks on mount when autoCheckUpdates is true', async () => {
    const mockUpdate = createMockUpdate()
    mockCheckFn = mock(async () => mockUpdate)
    mockFetchFn = mock(async () => ({ ok: true, status: 200 }) as any)

    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: true }))

    // wait for mount effect + async check to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    // auto-check found update and auto-downloaded it → ready
    expect(result.current.state.status).toBe('ready')
    expect(mockCheckFn).toHaveBeenCalled()
  })

  test('no auto-check when autoCheckUpdates is false', async () => {
    mockCheckFn = mock(async () => createMockUpdate())

    renderHook(() => useAppUpdate({ autoCheckUpdates: false }))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(mockCheckFn).not.toHaveBeenCalled()
  })

  test('cooldown: skips auto-check if last check < 1 hour ago', async () => {
    mockCheckFn = mock(async () => createMockUpdate())
    // set last check to 30 minutes ago
    mockStoreData['lastUpdateCheck'] = Date.now() - 30 * 60 * 1000

    renderHook(() => useAppUpdate({ autoCheckUpdates: true }))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(mockCheckFn).not.toHaveBeenCalled()
  })

  test('cooldown: allows auto-check if last check > 1 hour ago', async () => {
    const mockUpdate = createMockUpdate()
    mockCheckFn = mock(async () => mockUpdate)
    mockFetchFn = mock(async () => ({ ok: true, status: 200 }) as any)
    // set last check to 2 hours ago
    mockStoreData['lastUpdateCheck'] = Date.now() - 2 * 60 * 60 * 1000

    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: true }))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(mockCheckFn).toHaveBeenCalled()
  })

  test('binary verification: stays idle when HEAD returns 404', async () => {
    const mockUpdate = createMockUpdate()
    mockCheckFn = mock(async () => mockUpdate)
    mockFetchFn = mock(async () => ({ ok: false, status: 404 }) as any)

    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: false }))

    await act(async () => {
      await result.current.checkForUpdate()
    })

    // binary not ready — releasing phase, stay idle
    expect(result.current.state).toEqual({ status: 'idle' })
  })

  test('binary verification: stays idle when HEAD request throws', async () => {
    const mockUpdate = createMockUpdate()
    mockCheckFn = mock(async () => mockUpdate)
    mockFetchFn = mock(async () => {
      throw new Error('Network error')
    })

    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: false }))

    await act(async () => {
      await result.current.checkForUpdate()
    })

    // binary not ready — stay idle
    expect(result.current.state).toEqual({ status: 'idle' })
  })

  test('checkForUpdate persists lastUpdateCheck timestamp', async () => {
    mockCheckFn = mock(async () => null)

    const { result } = renderHook(() => useAppUpdate({ autoCheckUpdates: false }))

    await act(async () => {
      await result.current.checkForUpdate()
    })

    expect(mockStoreSet).toHaveBeenCalledWith('lastUpdateCheck', expect.any(Number))
    expect(mockStoreSave).toHaveBeenCalled()
  })
})
