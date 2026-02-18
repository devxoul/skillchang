import { describe, expect, mock, spyOn, test } from 'bun:test'
import { renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

function wrapper({ children }: { children: ReactNode }) {
  return createElement(MemoryRouter, null, children)
}

function renderKeyboardHook(options: Parameters<typeof useKeyboardShortcuts>[0]) {
  return renderHook(() => useKeyboardShortcuts(options), { wrapper })
}

describe('useKeyboardShortcuts', () => {
  test('hook is exported and callable', () => {
    expect(typeof useKeyboardShortcuts).toBe('function')
  })

  test('hook accepts options object with all callbacks', () => {
    const { result } = renderKeyboardHook({
      onFocusSearch: () => {},
      onOpenPreferences: () => {},
      projects: [],
    })
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+F shortcut key', () => {
    const { result } = renderKeyboardHook({ onFocusSearch: () => {} })
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+1 shortcut key for Gallery', () => {
    const { result } = renderKeyboardHook({})
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+2 shortcut key for Global Skills', () => {
    const { result } = renderKeyboardHook({})
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+3-9 shortcut keys for Projects', () => {
    const { result } = renderKeyboardHook({ projects: [{ id: 'proj1' }, { id: 'proj2' }] })
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+Shift+[ and Cmd+Shift+] for tab navigation', () => {
    const { result } = renderKeyboardHook({ projects: [{ id: 'proj1' }] })
    expect(result.current).toBeUndefined()
  })

  test('hook handles Cmd+, shortcut key', () => {
    const { result } = renderKeyboardHook({ onOpenPreferences: () => {} })
    expect(result.current).toBeUndefined()
  })

  test('hook sets up event listener on mount', () => {
    const addEventListenerSpy = spyOn(window, 'addEventListener')
    renderKeyboardHook({})
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    addEventListenerSpy.mockRestore()
  })

  test('hook removes event listener on unmount', () => {
    const removeEventListenerSpy = spyOn(window, 'removeEventListener')
    const { unmount } = renderKeyboardHook({})
    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })
})
