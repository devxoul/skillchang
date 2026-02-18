import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

import { Layout } from '@/components/layout'
import { MainContent } from '@/components/main-content'
import { Sidebar } from '@/components/sidebar'
import { AppUpdateProvider } from '@/contexts/app-update-context'
import { ProjectsProvider } from '@/contexts/projects-context'
import { ScrollRestorationProvider } from '@/contexts/scroll-context'
import { SearchPersistenceProvider } from '@/contexts/search-context'
import { SkillsProvider } from '@/contexts/skills-context'
import * as api from '@/lib/api'
import * as cli from '@/lib/cli'
import * as projects from '@/lib/projects'
import { mockUsePreferences } from '@/test-mocks'

let fetchSkillsSpy: ReturnType<typeof spyOn>
let listSkillsSpy: ReturnType<typeof spyOn>
let checkUpdatesApiSpy: ReturnType<typeof spyOn>
let getProjectsSpy: ReturnType<typeof spyOn>
let importProjectSpy: ReturnType<typeof spyOn>
let removeProjectSpy: ReturnType<typeof spyOn>
let reorderProjectsSpy: ReturnType<typeof spyOn>

beforeEach(() => {
  mockUsePreferences.mockReset()
  mockUsePreferences.mockImplementation(() => ({
    preferences: { defaultAgents: [], packageManager: 'npx', autoCheckUpdates: false },
    loading: false,
    savePreferences: mock(() => {}),
  }))
  fetchSkillsSpy = spyOn(api, 'fetchSkills').mockResolvedValue([])
  listSkillsSpy = spyOn(cli, 'listSkills').mockResolvedValue([])
  checkUpdatesApiSpy = spyOn(cli, 'checkUpdatesApi').mockResolvedValue({
    totalChecked: 0,
    updatesAvailable: [],
    errors: [],
  })
  getProjectsSpy = spyOn(projects, 'getProjects').mockResolvedValue([])
  importProjectSpy = spyOn(projects, 'importProject').mockResolvedValue(null)
  removeProjectSpy = spyOn(projects, 'removeProject').mockResolvedValue(undefined)
  reorderProjectsSpy = spyOn(projects, 'reorderProjects').mockResolvedValue(undefined)
})

afterEach(() => {
  mockUsePreferences.mockReset()
  fetchSkillsSpy.mockRestore()
  listSkillsSpy.mockRestore()
  checkUpdatesApiSpy.mockRestore()
  getProjectsSpy.mockRestore()
  importProjectSpy.mockRestore()
  removeProjectSpy.mockRestore()
  reorderProjectsSpy.mockRestore()
})

const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  const result = render(
    <AppUpdateProvider autoCheckUpdates={false}>
      <ProjectsProvider>
        <SkillsProvider>
          <MemoryRouter initialEntries={[route]}>
            <SearchPersistenceProvider>
              <ScrollRestorationProvider>{ui}</ScrollRestorationProvider>
            </SearchPersistenceProvider>
          </MemoryRouter>
        </SkillsProvider>
      </ProjectsProvider>
    </AppUpdateProvider>,
  )

  // Assign queries to global screen object to work around the timing issue
  // Update screen with the latest queries from render
  for (const key in result) {
    if (typeof result[key as keyof typeof result] === 'function') {
      ;(screen as any)[key] = result[key as keyof typeof result]
    }
  }

  return result
}

describe('Layout', () => {
  it('renders Layout component with Sidebar and MainContent', () => {
    renderWithProviders(<Layout />)

    expect(screen.getAllByText('Skills Directory').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Global Skills')).toBeDefined()
  })

  it('renders home page content at root route', () => {
    renderWithProviders(<Layout />, { route: '/' })

    expect(screen.getAllByText('Skills Directory').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Browse and discover available skills')).toBeDefined()
  })

  it('renders global page at /global route', () => {
    renderWithProviders(<Layout />, { route: '/global' })

    expect(screen.getAllByText('Global Skills').length).toBeGreaterThanOrEqual(1)
  })

  it('renders project page at /project/:id route', async () => {
    renderWithProviders(<Layout />, { route: '/project/123' })

    await waitFor(() => {
      expect(screen.getByText('Project Skills')).toBeDefined()
    })
  })

  it('does not show CommandPalette when closed', () => {
    renderWithProviders(<Layout />)

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens CommandPalette on Cmd+K', async () => {
    renderWithProviders(<Layout />)

    fireEvent.keyDown(window, { key: 'k', metaKey: true, ctrlKey: true })

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined()
    })
  })
})

describe('Sidebar', () => {
  it('renders sidebar with navigation items', () => {
    renderWithProviders(<Sidebar />)

    expect(screen.getByText('Skills Directory')).toBeDefined()
    expect(screen.getByText('Projects')).toBeDefined()
  })
})

describe('MainContent', () => {
  it('renders MainContent component', () => {
    renderWithProviders(<MainContent />, { route: '/' })

    expect(screen.getByText('Skills Directory')).toBeDefined()
  })
})
