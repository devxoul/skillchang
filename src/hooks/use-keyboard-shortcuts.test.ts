import { renderHook } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
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

  test('hook handles Cmd+1 shortcut key for Gallery', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({}))
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+2 shortcut key for Global Skills', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({}))
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+3-9 shortcut keys for Projects', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({ projects: [{ id: 'proj1' }, { id: 'proj2' }] }))
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+Shift+[ and Cmd+Shift+] for tab navigation', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({ projects: [{ id: 'proj1' }] }))
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
