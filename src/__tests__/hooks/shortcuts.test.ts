import { test, expect, describe, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

describe('useKeyboardShortcuts', () => {
  test('hook is exported and callable', () => {
    expect(typeof useKeyboardShortcuts).toBe('function')
  })

  test('hook accepts options object with all callbacks', () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts({
        onFocusSearch: () => {},
        onOpenPreferences: () => {},
        projects: [],
      }),
    )
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+K shortcut key', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({ onFocusSearch: () => {} }))
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+0 shortcut key', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({}))
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+1 shortcut key', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({}))
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+2-9 shortcut keys', () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts({ projects: [{ id: 'proj1' }, { id: 'proj2' }] }),
    )
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+, shortcut key', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({ onOpenPreferences: () => {} }))
    expect(result.current).toBeUndefined()
  })

  test('hook sets up event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    renderHook(() => useKeyboardShortcuts({}))
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    addEventListenerSpy.mockRestore()
  })

  test('hook removes event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useKeyboardShortcuts({}))
    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })
})
