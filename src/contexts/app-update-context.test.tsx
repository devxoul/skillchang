import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as useAppUpdateModule from '@/hooks/use-app-update'

import { AppUpdateProvider, useAppUpdateContext } from './app-update-context'

let useAppUpdateSpy: ReturnType<typeof spyOn>

beforeEach(() => {
  useAppUpdateSpy = spyOn(useAppUpdateModule, 'useAppUpdate').mockReturnValue({
    state: { status: 'idle' as const },
    checkForUpdate: mock(() => Promise.resolve(false)),
    downloadUpdate: mock(() => Promise.resolve()),
    restartToUpdate: mock(() => Promise.resolve()),
  })
})

afterEach(() => {
  useAppUpdateSpy.mockRestore()
})

function wrapper({ children }: { children: ReactNode }) {
  return <AppUpdateProvider autoCheckUpdates={false}>{children}</AppUpdateProvider>
}

describe('AppUpdateProvider', () => {
  it('provides update state and actions via context', () => {
    const { result } = renderHook(() => useAppUpdateContext(), { wrapper })

    expect(result.current.state).toEqual({ status: 'idle' })
    expect(typeof result.current.checkForUpdate).toBe('function')
    expect(typeof result.current.downloadUpdate).toBe('function')
    expect(typeof result.current.restartToUpdate).toBe('function')
  })

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAppUpdateContext())
    }).toThrow('useAppUpdateContext must be used within AppUpdateProvider')
  })
})
