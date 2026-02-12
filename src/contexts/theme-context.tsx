import { getCurrentWindow } from '@tauri-apps/api/window'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Initial theme detection
    async function detectTheme() {
      try {
        const appWindow = getCurrentWindow()
        const systemTheme = await appWindow.theme()
        setTheme(systemTheme || 'light')
      } catch {
        // Fallback to media query if Tauri fails
        const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(darkMode ? 'dark' : 'light')
      }
    }

    detectTheme()

    // Listen for system theme changes
    let unlistenPromise: Promise<() => void> | null = null
    try {
      unlistenPromise = getCurrentWindow().onThemeChanged(({ payload: newTheme }: { payload: Theme }) => {
        setTheme(newTheme)
      })
    } catch {
      // Tauri not available, skip listener
    }

    return () => {
      if (unlistenPromise) {
        unlistenPromise
          .then((fn) => fn())
          .catch(() => {
            // Ignore cleanup errors
          })
      }
    }
  }, [])

  // Apply theme class to document root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
