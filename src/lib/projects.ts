import { open } from '@tauri-apps/plugin-dialog'
import { Store } from '@tauri-apps/plugin-store'
import type { Project } from '@/types/project'

const STORE_KEY = 'projects'
let store: Store | null = null

async function getStore() {
  if (!store) {
    store = await Store.load('skillchang.json')
  }
  return store
}

export async function getProjects(): Promise<Project[]> {
  const s = await getStore()
  return (await s.get<Project[]>(STORE_KEY)) || []
}

export async function addProject(path: string): Promise<Project> {
  const name = path.split('/').pop() || path
  const project: Project = {
    id: crypto.randomUUID(),
    name,
    path,
  }

  const projects = await getProjects()
  projects.push(project)

  const s = await getStore()
  await s.set(STORE_KEY, projects)
  await s.save()

  return project
}

export async function removeProject(id: string): Promise<void> {
  const projects = await getProjects()
  const filtered = projects.filter((p) => p.id !== id)

  const s = await getStore()
  await s.set(STORE_KEY, filtered)
  await s.save()
}

export async function reorderProjects(projects: Project[]): Promise<void> {
  const s = await getStore()
  await s.set(STORE_KEY, projects)
  await s.save()
}

export async function importProject(): Promise<Project | null> {
  const selected = await open({
    directory: true,
    multiple: false,
  })

  if (!selected || typeof selected !== 'string') {
    return null
  }

  return addProject(selected)
}
