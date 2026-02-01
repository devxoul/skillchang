import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface UseKeyboardShortcutsOptions {
  onOpenPreferences?: () => void
  onFocusSearch?: () => void
  projects?: Array<{ id: string }>
}

export function useKeyboardShortcuts({
  onOpenPreferences,
  onFocusSearch,
  projects = [],
}: UseKeyboardShortcutsOptions) {
  const navigate = useNavigate()

  useEffect(() => {
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

      // Cmd/Ctrl + 0: Gallery
      if (event.key === '0') {
        event.preventDefault()
        navigate('/')
        return
      }

      // Cmd/Ctrl + 1: Global Skills
      if (event.key === '1') {
        event.preventDefault()
        navigate('/global')
        return
      }

      // Cmd/Ctrl + 2-9: Projects
      const num = parseInt(event.key)
      if (num >= 2 && num <= 9) {
        event.preventDefault()
        const projectIndex = num - 2
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
  }, [navigate, onOpenPreferences, onFocusSearch, projects])
}
