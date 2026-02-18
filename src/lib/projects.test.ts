import { beforeEach, describe, expect, it } from 'bun:test'
import { addProject, getProjects, importProject, removeProject, reorderProjects } from '@/lib/projects'
import { mockDialogOpen, mockStoreGet, mockStoreSave, mockStoreSet } from '@/test-mocks'

let mockGetQueue: any[] = []
let mockGetCalls: any[] = []
let mockSetCalls: any[] = []
let mockSaveCalls: any[] = []
let mockOpenCalls: any[] = []
let mockOpenQueue: any[] = []

describe('projects', () => {
  beforeEach(async () => {
    mockGetQueue = []
    mockGetCalls = []
    mockSetCalls = []
    mockSaveCalls = []
    mockOpenCalls = []
    mockOpenQueue = []
    mockStoreGet.mockReset()
    mockStoreGet.mockImplementation(async (...args: any[]) => {
      mockGetCalls.push(args)
      if (mockGetQueue.length > 0) return mockGetQueue.shift()
      return null
    })
    mockStoreSet.mockReset()
    mockStoreSet.mockImplementation(async (...args: any[]) => {
      mockSetCalls.push(args)
    })
    mockStoreSave.mockReset()
    mockStoreSave.mockImplementation(async () => {
      mockSaveCalls.push([])
    })
    mockDialogOpen.mockReset()
    mockDialogOpen.mockImplementation(async (...args: any[]) => {
      mockOpenCalls.push(args)
      if (mockOpenQueue.length > 0) return mockOpenQueue.shift()
      return null
    })
  })

  describe('getProjects', () => {
    it('returns empty array when no projects stored', async () => {
      mockGetQueue.push(null)

      const projects = await getProjects()

      expect(projects).toEqual([])
      expect(mockGetCalls[0]).toEqual(['projects'])
    })

    it('returns stored projects', async () => {
      const storedProjects = [
        { id: '1', name: 'Project 1', path: '/path/to/project1' },
        { id: '2', name: 'Project 2', path: '/path/to/project2' },
      ]
      mockGetQueue.push(storedProjects)

      const projects = await getProjects()

      expect(projects).toEqual(storedProjects)
    })
  })

  describe('addProject', () => {
    it('adds project and saves to store', async () => {
      mockGetQueue.push([])

      const project = await addProject('/path/to/myproject')

      expect(project.name).toBe('myproject')
      expect(project.path).toBe('/path/to/myproject')
      expect(project.id).toBeDefined()
      expect(mockSetCalls[0]).toEqual(['projects', [project]])
      expect(mockSaveCalls.length).toBeGreaterThan(0)
    })

    it('extracts project name from path', async () => {
      mockGetQueue.push([])

      const project = await addProject('/Users/test/workspace/my-app')

      expect(project.name).toBe('my-app')
    })

    it('appends to existing projects', async () => {
      const existing = [{ id: '1', name: 'Existing', path: '/existing' }]
      mockGetQueue.push([...existing])

      const project = await addProject('/new/project')

      expect(mockSetCalls[0]).toEqual(['projects', [...existing, project]])
    })
  })

  describe('removeProject', () => {
    it('removes project by id', async () => {
      const projects = [
        { id: '1', name: 'Project 1', path: '/path1' },
        { id: '2', name: 'Project 2', path: '/path2' },
        { id: '3', name: 'Project 3', path: '/path3' },
      ]
      mockGetQueue.push(projects)

      await removeProject('2')

      expect(mockSetCalls[0]).toEqual(['projects', [projects[0], projects[2]]])
      expect(mockSaveCalls.length).toBeGreaterThan(0)
    })

    it('handles removing non-existent project', async () => {
      const projects = [{ id: '1', name: 'Project 1', path: '/path1' }]
      mockGetQueue.push(projects)

      await removeProject('999')

      expect(mockSetCalls[0]).toEqual(['projects', projects])
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

      expect(mockSetCalls[0]).toEqual(['projects', newOrder])
      expect(mockSaveCalls.length).toBeGreaterThan(0)
    })
  })

  describe('importProject', () => {
    it('opens dialog and adds selected project', async () => {
      const selectedPath = '/Users/test/my-project'
      mockOpenQueue.push(selectedPath)
      mockGetQueue.push([])

      const project = await importProject()

      expect(mockOpenCalls[0]).toEqual([
        {
          directory: true,
          multiple: false,
        },
      ])
      expect(project).toBeDefined()
      expect(project?.path).toBe(selectedPath)
      expect(project?.name).toBe('my-project')
    })

    it('returns null when dialog is cancelled', async () => {
      mockOpenQueue.push(null)

      const project = await importProject()

      expect(project).toBeNull()
      expect(mockSetCalls.length).toBe(0)
    })

    it('returns null when multiple paths selected', async () => {
      mockOpenQueue.push(['/path1', '/path2'])

      const project = await importProject()

      expect(project).toBeNull()
      expect(mockSetCalls.length).toBe(0)
    })
  })
})
