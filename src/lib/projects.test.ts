import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
  save: vi.fn(),
}

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-store', () => ({
  Store: {
    load: vi.fn(() => Promise.resolve(mockStore)),
  },
}))

import { open } from '@tauri-apps/plugin-dialog'
import {
  getProjects,
  addProject,
  removeProject,
  reorderProjects,
  importProject,
} from '@/lib/projects'

describe('projects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.get.mockResolvedValue(null)
  })

  describe('getProjects', () => {
    it('returns empty array when no projects stored', async () => {
      mockStore.get.mockResolvedValue(null)

      const projects = await getProjects()

      expect(projects).toEqual([])
      expect(mockStore.get).toHaveBeenCalledWith('projects')
    })

    it('returns stored projects', async () => {
      const storedProjects = [
        { id: '1', name: 'Project 1', path: '/path/to/project1' },
        { id: '2', name: 'Project 2', path: '/path/to/project2' },
      ]
      mockStore.get.mockResolvedValue(storedProjects)

      const projects = await getProjects()

      expect(projects).toEqual(storedProjects)
    })
  })

  describe('addProject', () => {
    it('adds project and saves to store', async () => {
      mockStore.get.mockResolvedValue([])

      const project = await addProject('/path/to/myproject')

      expect(project.name).toBe('myproject')
      expect(project.path).toBe('/path/to/myproject')
      expect(project.id).toBeDefined()
      expect(mockStore.set).toHaveBeenCalledWith('projects', [project])
      expect(mockStore.save).toHaveBeenCalled()
    })

    it('extracts project name from path', async () => {
      mockStore.get.mockResolvedValue([])

      const project = await addProject('/Users/test/workspace/my-app')

      expect(project.name).toBe('my-app')
    })

    it('appends to existing projects', async () => {
      const existing = [{ id: '1', name: 'Existing', path: '/existing' }]
      mockStore.get.mockImplementation(() => Promise.resolve([...existing]))

      const project = await addProject('/new/project')

      expect(mockStore.set).toHaveBeenCalledWith('projects', [...existing, project])
    })
  })

  describe('removeProject', () => {
    it('removes project by id', async () => {
      const projects = [
        { id: '1', name: 'Project 1', path: '/path1' },
        { id: '2', name: 'Project 2', path: '/path2' },
        { id: '3', name: 'Project 3', path: '/path3' },
      ]
      mockStore.get.mockResolvedValue(projects)

      await removeProject('2')

      expect(mockStore.set).toHaveBeenCalledWith('projects', [projects[0], projects[2]])
      expect(mockStore.save).toHaveBeenCalled()
    })

    it('handles removing non-existent project', async () => {
      const projects = [{ id: '1', name: 'Project 1', path: '/path1' }]
      mockStore.get.mockResolvedValue(projects)

      await removeProject('999')

      expect(mockStore.set).toHaveBeenCalledWith('projects', projects)
    })
  })

  describe('reorderProjects', () => {
    it('saves new project order', async () => {
      const newOrder = [
        { id: '3', name: 'Project 3', path: '/path3' },
        { id: '1', name: 'Project 1', path: '/path1' },
        { id: '2', name: 'Project 2', path: '/path2' },
      ]

      await reorderProjects(newOrder)

      expect(mockStore.set).toHaveBeenCalledWith('projects', newOrder)
      expect(mockStore.save).toHaveBeenCalled()
    })
  })

  describe('importProject', () => {
    it('opens dialog and adds selected project', async () => {
      const selectedPath = '/Users/test/my-project'
      ;(open as Mock).mockResolvedValue(selectedPath)
      mockStore.get.mockResolvedValue([])

      const project = await importProject()

      expect(open).toHaveBeenCalledWith({
        directory: true,
        multiple: false,
      })
      expect(project).toBeDefined()
      expect(project?.path).toBe(selectedPath)
      expect(project?.name).toBe('my-project')
    })

    it('returns null when dialog is cancelled', async () => {
      ;(open as Mock).mockResolvedValue(null)

      const project = await importProject()

      expect(project).toBeNull()
      expect(mockStore.set).not.toHaveBeenCalled()
    })

    it('returns null when multiple paths selected', async () => {
      ;(open as Mock).mockResolvedValue(['/path1', '/path2'])

      const project = await importProject()

      expect(project).toBeNull()
      expect(mockStore.set).not.toHaveBeenCalled()
    })
  })
})
