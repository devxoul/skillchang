import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface UseKeyboardShortcutsOptions {
  onOpenPreferences?: () => void
  onFocusSearch?: () => void
  projects?: Array<{ id: string }>
}

export function useKeyboardShortcuts({ onOpenPreferences, onFocusSearch, projects = [] }: UseKeyboardShortcutsOptions) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function getRoutes() {
      const routes = ['/', '/global']
      for (const project of projects) {
        routes.push(`/project/${project.id}`)
      }
      return routes
    }

    function getCurrentRouteIndex(routes: string[]) {
      const path = location.pathname
      const exactIndex = routes.indexOf(path)
      if (exactIndex !== -1) return exactIndex

      if (path.startsWith('/project/')) {
        return routes.indexOf(path)
      }
      return 0
    }

    function handleKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? event.metaKey : event.ctrlKey

      if (!modifier) return

      // Cmd/Ctrl + K: Focus search
      if (event.key === 'k' || event.key === 'K') {
        event.preventDefault()
        onFocusSearch?.()
        return
      }

      // Cmd/Ctrl + Shift + [: Previous tab
      if (event.shiftKey && event.key === '[') {
        event.preventDefault()
        const routes = getRoutes()
        const currentIndex = getCurrentRouteIndex(routes)
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : routes.length - 1
        navigate(routes[prevIndex]!)
        return
      }

      // Cmd/Ctrl + Shift + ]: Next tab
      if (event.shiftKey && event.key === ']') {
        event.preventDefault()
        const routes = getRoutes()
        const currentIndex = getCurrentRouteIndex(routes)
        const nextIndex = currentIndex < routes.length - 1 ? currentIndex + 1 : 0
        navigate(routes[nextIndex]!)
        return
      }

      // Cmd/Ctrl + 1: Gallery
      if (event.key === '1') {
        event.preventDefault()
        navigate('/')
        return
      }

      // Cmd/Ctrl + 2: Global Skills
      if (event.key === '2') {
        event.preventDefault()
        navigate('/global')
        return
      }

      // Cmd/Ctrl + 3-9: Projects
      const num = Number.parseInt(event.key, 10)
      if (num >= 3 && num <= 9) {
        event.preventDefault()
        const projectIndex = num - 3
        if (projects[projectIndex]) {
          navigate(`/project/${projects[projectIndex].id}`)
        }
        return
      }

      // Cmd/Ctrl + ,: Preferences
      if (event.key === ',') {
        event.preventDefault()
        onOpenPreferences?.()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, location.pathname, onOpenPreferences, onFocusSearch, projects])
}
