import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { ProjectsProvider } from '@/contexts/projects-context'
import { SkillsProvider } from '@/contexts/skills-context'
import * as api from '@/lib/api'
import * as cli from '@/lib/cli'
import * as projects from '@/lib/projects'

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

import { useGallerySkills, useInstalledSkills } from '@/contexts/skills-context'
import { CommandPalette } from './command-palette'

let currentLocation = '/'
function LocationTracker() {
  const location = useLocation()
  currentLocation = location.pathname
  return null
}

function DataLoader() {
  const { fetch: fetchGallery } = useGallerySkills()
  const { fetch: fetchInstalled } = useInstalledSkills()
  React.useEffect(() => {
    fetchGallery()
    fetchInstalled()
  }, [fetchGallery, fetchInstalled])
  return null
}

let fetchSkillsSpy: ReturnType<typeof spyOn>
let listSkillsSpy: ReturnType<typeof spyOn>
let searchSkillsSpy: ReturnType<typeof spyOn>
let checkUpdatesApiSpy: ReturnType<typeof spyOn>
let getProjectsSpy: ReturnType<typeof spyOn>
let importProjectSpy: ReturnType<typeof spyOn>
let removeProjectSpy: ReturnType<typeof spyOn>
let reorderProjectsSpy: ReturnType<typeof spyOn>

describe('CommandPalette', () => {
  let mockOnOpenChange: ReturnType<typeof mock>
  let mockOnOpenPreferences: ReturnType<typeof mock>
  let mockCheckForUpdate: ReturnType<typeof mock>

  beforeEach(() => {
    currentLocation = '/'
    mockOnOpenChange = mock(() => {})
    mockOnOpenPreferences = mock(() => {})
    mockCheckForUpdate = mock(() => {})

    fetchSkillsSpy = spyOn(api, 'fetchSkills').mockResolvedValue([
      { id: 'owner/repo/skillname', name: 'skillname', installs: 100, topSource: 'github' },
    ])
    searchSkillsSpy = spyOn(api, 'searchSkills').mockResolvedValue([])
    listSkillsSpy = spyOn(cli, 'listSkills').mockResolvedValue([
      { name: 'local-skill', path: '/path/to/local-skill', agents: ['opencode'] },
    ])
    checkUpdatesApiSpy = spyOn(cli, 'checkUpdatesApi').mockResolvedValue({
      totalChecked: 0,
      updatesAvailable: [],
      errors: [],
    })
    getProjectsSpy = spyOn(projects, 'getProjects').mockResolvedValue([
      { id: 'test-id', name: 'Test Project', path: '/path/to/test' },
    ])
    importProjectSpy = spyOn(projects, 'importProject').mockResolvedValue(null)
    removeProjectSpy = spyOn(projects, 'removeProject').mockResolvedValue(undefined)
    reorderProjectsSpy = spyOn(projects, 'reorderProjects').mockResolvedValue(undefined)
  })

  afterEach(() => {
    fetchSkillsSpy.mockRestore()
    searchSkillsSpy.mockRestore()
    listSkillsSpy.mockRestore()
    checkUpdatesApiSpy.mockRestore()
    getProjectsSpy.mockRestore()
    importProjectSpy.mockRestore()
    removeProjectSpy.mockRestore()
    reorderProjectsSpy.mockRestore()
  })

  const renderPalette = (open = true) =>
    render(
      <MemoryRouter>
        <ProjectsProvider>
          <SkillsProvider>
            <DataLoader />
            <LocationTracker />
            <CommandPalette
              open={open}
              onOpenChange={mockOnOpenChange}
              onOpenPreferences={mockOnOpenPreferences}
              checkForUpdate={mockCheckForUpdate}
            />
          </SkillsProvider>
        </ProjectsProvider>
      </MemoryRouter>,
    )

  it('renders when open={true}, does not render when open={false}', async () => {
    const { unmount } = renderPalette(true)
    await waitFor(() => {
      expect(document.querySelector('[cmdk-root]')).not.toBeNull()
    })
    unmount()

    renderPalette(false)
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('shows navigation items: Skills Directory, Global Skills', async () => {
    const { getByText } = renderPalette()
    await waitFor(() => {
      expect(getByText('Skills Directory')).toBeDefined()
      expect(getByText('Global Skills')).toBeDefined()
    })
  })

  it('shows dynamic project items from useProjects', async () => {
    const { getByText } = renderPalette()
    await waitFor(() => {
      expect(getByText('Test Project')).toBeDefined()
    })
  })

  it('shows skill items from useGallerySkills and useInstalledSkills', async () => {
    const { getByText } = renderPalette()
    await waitFor(() => {
      expect(getByText('skillname')).toBeDefined()
      expect(getByText('local-skill')).toBeDefined()
    })
  })

  it('shows empty state when no results match', async () => {
    const user = userEvent.setup()
    const { getByRole, getByText } = renderPalette()

    await waitFor(() => expect(getByText('Skills Directory')).toBeDefined())

    const input = getByRole('combobox')
    await user.type(input, 'xyznonexistent')

    await waitFor(() => {
      expect(getByText('No results found.')).toBeDefined()
    })
  })

  it('navigates to "/" when Skills Directory is selected', async () => {
    const { getByText } = renderPalette()
    await waitFor(() => expect(getByText('Skills Directory')).toBeDefined())
    fireEvent.click(getByText('Skills Directory'))
    expect(currentLocation).toBe('/')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('navigates to "/global" when Global Skills is selected', async () => {
    const { getByText } = renderPalette()
    await waitFor(() => expect(getByText('Global Skills')).toBeDefined())
    fireEvent.click(getByText('Global Skills'))
    expect(currentLocation).toBe('/global')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('navigates to "/project/test-id" for project item selection', async () => {
    const { getByText } = renderPalette()
    await waitFor(() => expect(getByText('Test Project')).toBeDefined())
    fireEvent.click(getByText('Test Project'))
    expect(currentLocation).toBe('/project/test-id')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('navigates to "/skill/owner/repo/skillname" for gallery skill', async () => {
    const { getByText } = renderPalette()
    await waitFor(() => expect(getByText('skillname')).toBeDefined())
    fireEvent.click(getByText('skillname'))
    expect(currentLocation).toBe('/skill/owner/repo/skillname')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('navigates to "/skill/local-skill" for installed-only skill', async () => {
    const { getByText } = renderPalette()
    await waitFor(() => expect(getByText('local-skill')).toBeDefined())
    fireEvent.click(getByText('local-skill'))
    expect(currentLocation).toBe('/skill/local-skill')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenPreferences when Preferences is selected', async () => {
    const { getByText } = renderPalette()
    await waitFor(() => expect(getByText('Preferences')).toBeDefined())
    fireEvent.click(getByText('Preferences'))
    expect(mockOnOpenPreferences).toHaveBeenCalled()
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls checkForUpdate when Check for update is selected', async () => {
    const { getByText } = renderPalette()
    await waitFor(() => expect(getByText('Check for update')).toBeDefined())
    fireEvent.click(getByText('Check for update'))
    expect(mockCheckForUpdate).toHaveBeenCalled()
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('deduplicates skills — gallery preferred when name matches installed', async () => {
    fetchSkillsSpy.mockResolvedValue([
      { id: 'owner/repo/shared-skill', name: 'shared-skill', installs: 50, topSource: 'github' },
    ])
    listSkillsSpy.mockResolvedValue([{ name: 'shared-skill', path: '/path/to/shared-skill', agents: ['opencode'] }])

    const { getAllByText, getByText } = renderPalette()
    await waitFor(() => expect(getByText('shared-skill')).toBeDefined())
    const items = getAllByText('shared-skill')
    expect(items.length).toBe(1)

    fireEvent.click(getByText('shared-skill'))
    expect(currentLocation).toBe('/skill/owner/repo/shared-skill')
  })
})
