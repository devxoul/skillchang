import { createContext, type ReactNode, useContext, useRef } from 'react'

interface ScrollRestorationContextValue {
  saveScrollPosition: (pathname: string, scrollTop: number) => void
  getScrollPosition: (pathname: string) => number | undefined
  clearScrollPosition: (pathname: string) => void
}

const ScrollRestorationContext = createContext<ScrollRestorationContextValue | null>(null)

export function ScrollRestorationProvider({ children }: { children: ReactNode }) {
  const scrollPositions = useRef<Map<string, number>>(new Map())

  const saveScrollPosition = (pathname: string, scrollTop: number) => {
    scrollPositions.current.set(pathname, scrollTop)
  }

  const getScrollPosition = (pathname: string) => {
    return scrollPositions.current.get(pathname)
  }

  const clearScrollPosition = (pathname: string) => {
    scrollPositions.current.delete(pathname)
  }

  return (
    <ScrollRestorationContext.Provider value={{ saveScrollPosition, getScrollPosition, clearScrollPosition }}>
      {children}
    </ScrollRestorationContext.Provider>
  )
}

export function useScrollRestorationContext() {
  const context = useContext(ScrollRestorationContext)
  if (!context) {
    throw new Error('useScrollRestorationContext must be used within ScrollRestorationProvider')
  }
  return context
}
