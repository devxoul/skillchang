import { useProjects } from '@/contexts/projects-context'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useState } from 'react'
import { MainContent } from './main-content'
import { PreferencesDialog } from './preferences-dialog'
import { Sidebar } from './sidebar'

export function Layout() {
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const { projects } = useProjects()

  useKeyboardShortcuts({
    onFocusSearch: () => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
      searchInput?.focus()
    },
    onOpenPreferences: () => {
      setPreferencesOpen(true)
    },
    projects,
  })

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <MainContent />
      <PreferencesDialog open={preferencesOpen} onOpenChange={setPreferencesOpen} />
    </div>
  )
}
