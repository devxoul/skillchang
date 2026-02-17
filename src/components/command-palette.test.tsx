import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// cmdk uses ResizeObserver internally
globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

const mockNavigate = mock(() => {})
let mockProjects: any[] = []
let mockGallerySkills: any[] = []
let mockInstalledSkills: any[] = []

mock.module('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

mock.module('@/contexts/projects-context', () => ({
  useProjects: () => ({
    projects: mockProjects,
    loading: false,
    importProject: mock(() => {}),
    removeProject: mock(() => {}),
    reorderProjects: mock(() => {}),
  }),
}))

mock.module('@/contexts/skills-context', () => ({
  useGallerySkills: () => ({
    skills: mockGallerySkills,
    loading: false,
    error: null,
    refresh: mock(() => {}),
    fetch: mock(() => {}),
  }),
  useInstalledSkills: () => ({
    skills: mockInstalledSkills,
    loading: false,
    error: null,
    refresh: mock(() => {}),
    fetch: mock(() => {}),
    remove: mock(() => {}),
    invalidateCache: mock(() => {}),
    checkUpdates: mock(() => {}),
    updateAll: mock(() => {}),
    updateStatuses: {},
    checkErrors: [],
    isCheckingUpdates: false,
    isUpdatingAll: false,
    refetching: false,
  }),
}))

import { CommandPalette } from './command-palette'

describe('CommandPalette', () => {
  let mockOnOpenChange: ReturnType<typeof mock>
  let mockOnOpenPreferences: ReturnType<typeof mock>
  let mockCheckForUpdate: ReturnType<typeof mock>

  beforeEach(() => {
    mockNavigate.mockReset()
    mockOnOpenChange = mock(() => {})
    mockOnOpenPreferences = mock(() => {})
    mockCheckForUpdate = mock(() => {})
    mockProjects = [{ id: 'test-id', name: 'Test Project', path: '/path/to/test' }]
    mockGallerySkills = [{ id: 'owner/repo/skillname', name: 'skillname', installs: 100, topSource: 'github' }]
    mockInstalledSkills = [{ name: 'local-skill', path: '/path/to/local-skill', agents: ['opencode'] }]
  })

  const renderPalette = (open = true) =>
    render(
      <CommandPalette
        open={open}
        onOpenChange={mockOnOpenChange}
        onOpenPreferences={mockOnOpenPreferences}
        checkForUpdate={mockCheckForUpdate}
      />,
    )

  it('renders when open={true}, does not render when open={false}', () => {
    const { unmount } = renderPalette(true)
    expect(document.querySelector('[cmdk-root]')).not.toBeNull()
    unmount()

    renderPalette(false)
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('shows navigation items: Skills Directory, Global Skills', () => {
    const { getByText } = renderPalette()
    expect(getByText('Skills Directory')).toBeDefined()
    expect(getByText('Global Skills')).toBeDefined()
  })

  it('shows dynamic project items from mock useProjects', () => {
    const { getByText } = renderPalette()
    expect(getByText('Test Project')).toBeDefined()
  })

  it('shows skill items from mock useGallerySkills and useInstalledSkills', () => {
    const { getByText } = renderPalette()
    expect(getByText('skillname')).toBeDefined()
    expect(getByText('local-skill')).toBeDefined()
  })

  it('shows empty state when no results match', async () => {
    const user = userEvent.setup()
    const { getByRole, getByText } = renderPalette()
    const input = getByRole('combobox')

    await user.type(input, 'xyznonexistent')

    await waitFor(() => {
      expect(getByText('No results found.')).toBeDefined()
    })
  })

  it('calls navigate("/") when Skills Directory is selected', () => {
    const { getByText } = renderPalette()
    fireEvent.click(getByText('Skills Directory'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls navigate("/global") when Global Skills is selected', () => {
    const { getByText } = renderPalette()
    fireEvent.click(getByText('Global Skills'))
    expect(mockNavigate).toHaveBeenCalledWith('/global')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls navigate("/project/test-id") for project item selection', () => {
    const { getByText } = renderPalette()
    fireEvent.click(getByText('Test Project'))
    expect(mockNavigate).toHaveBeenCalledWith('/project/test-id')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls navigate("/skill/owner/repo/skillname") for gallery skill', () => {
    const { getByText } = renderPalette()
    fireEvent.click(getByText('skillname'))
    expect(mockNavigate).toHaveBeenCalledWith('/skill/owner/repo/skillname')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls navigate("/skill/local-skill") for installed-only skill', () => {
    const { getByText } = renderPalette()
    fireEvent.click(getByText('local-skill'))
    expect(mockNavigate).toHaveBeenCalledWith('/skill/local-skill')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenPreferences when Preferences is selected', () => {
    const { getByText } = renderPalette()
    fireEvent.click(getByText('Preferences'))
    expect(mockOnOpenPreferences).toHaveBeenCalled()
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls checkForUpdate when Check for update is selected', () => {
    const { getByText } = renderPalette()
    fireEvent.click(getByText('Check for update'))
    expect(mockCheckForUpdate).toHaveBeenCalled()
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('deduplicates skills — gallery preferred when name matches installed', () => {
    mockGallerySkills = [{ id: 'owner/repo/shared-skill', name: 'shared-skill', installs: 50, topSource: 'github' }]
    mockInstalledSkills = [{ name: 'shared-skill', path: '/path/to/shared-skill', agents: ['opencode'] }]

    const { getAllByText, getByText } = renderPalette()
    const items = getAllByText('shared-skill')
    expect(items.length).toBe(1)

    fireEvent.click(getByText('shared-skill'))
    expect(mockNavigate).toHaveBeenCalledWith('/skill/owner/repo/shared-skill')
  })
})
