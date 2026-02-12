import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getProjects, importProject, removeProject, reorderProjects } from '@/lib/projects'
import type { Project } from '@/types/project'

interface ProjectsContextValue {
  projects: Project[]
  loading: boolean
  importProject: () => Promise<void>
  removeProject: (id: string) => Promise<void>
  reorderProjects: (newOrder: Project[]) => void
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjects = useCallback(async () => {
    const data = await getProjects()
    setProjects(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleImport = useCallback(async () => {
    const project = await importProject()
    if (project) {
      await loadProjects()
    }
  }, [loadProjects])

  const handleRemove = useCallback(
    async (id: string) => {
      await removeProject(id)
      await loadProjects()
    },
    [loadProjects],
  )

  const handleReorder = useCallback((newOrder: Project[]) => {
    setProjects(newOrder)
    reorderProjects(newOrder)
  }, [])

  const value = useMemo(
    () => ({
      projects,
      loading,
      importProject: handleImport,
      removeProject: handleRemove,
      reorderProjects: handleReorder,
    }),
    [projects, loading, handleImport, handleRemove, handleReorder],
  )

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjects must be used within ProjectsProvider')
  }
  return context
}
