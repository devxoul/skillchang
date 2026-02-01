import { useState, useEffect } from 'react'
import { getProjects, importProject, removeProject, reorderProjects } from '@/lib/projects'
import type { Project } from '@/types/project'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    const data = await getProjects()
    setProjects(data)
    setLoading(false)
  }

  async function handleImport() {
    const project = await importProject()
    if (project) {
      await loadProjects()
    }
  }

  async function handleRemove(id: string) {
    await removeProject(id)
    await loadProjects()
  }

  async function handleReorder(newOrder: Project[]) {
    await reorderProjects(newOrder)
    setProjects(newOrder)
  }

  return {
    projects,
    loading,
    importProject: handleImport,
    removeProject: handleRemove,
    reorderProjects: handleReorder,
  }
}
