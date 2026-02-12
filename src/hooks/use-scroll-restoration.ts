import { type RefObject, useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { useScrollRestorationContext } from '@/contexts/scroll-context'

interface UseScrollRestorationOptions {
  resetOnMount?: boolean
}

export function useScrollRestoration<T extends HTMLElement>(options: UseScrollRestorationOptions = {}): RefObject<T> {
  const { resetOnMount = false } = options
  const scrollRef = useRef<T>(null!)
  const location = useLocation()
  const navigationType = useNavigationType()
  const { saveScrollPosition, getScrollPosition, clearScrollPosition } = useScrollRestorationContext()

  useEffect(() => {
    const element = scrollRef.current
    const pathname = location.pathname

    return () => {
      if (element && !resetOnMount) {
        saveScrollPosition(pathname, element.scrollTop)
      }
    }
  }, [location.pathname, saveScrollPosition, resetOnMount])

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    if (resetOnMount) {
      element.scrollTop = 0
      return
    }

    if (navigationType === 'POP') {
      const savedPosition = getScrollPosition(location.pathname)
      if (savedPosition !== undefined) {
        requestAnimationFrame(() => {
          element.scrollTop = savedPosition
        })
        clearScrollPosition(location.pathname)
      }
    }
  }, [location.pathname, navigationType, getScrollPosition, clearScrollPosition, resetOnMount])

  return scrollRef
}
