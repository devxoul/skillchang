import { describe, expect, it, mock } from 'bun:test'

mock.module('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    theme: mock(() => Promise.resolve('light')),
    onThemeChanged: mock(() => Promise.resolve(() => {})),
  }),
}))

import { render, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/contexts/theme-context'

describe('ThemeContext', () => {
  it('provides theme context to children', async () => {
    let themeValue: string | undefined

    function TestComponent() {
      const { theme } = useTheme()
      themeValue = theme
      return <div>{theme}</div>
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(themeValue).toBeDefined()
      expect(['light', 'dark']).toContain(themeValue)
    })
  })

  it('throws error when useTheme is used outside provider', () => {
    function TestComponent() {
      useTheme()
      return <div>Test</div>
    }

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useTheme must be used within ThemeProvider')
  })

  it('exports useTheme hook', () => {
    expect(useTheme).toBeDefined()
    expect(typeof useTheme).toBe('function')
  })

  it('exports ThemeProvider component', () => {
    expect(ThemeProvider).toBeDefined()
    expect(typeof ThemeProvider).toBe('function')
  })
})
