import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppUpdateProvider } from '@/contexts/app-update-context'
import { ProjectsProvider } from '@/contexts/projects-context'
import * as projects from '@/lib/projects'
import { mockUsePreferences } from '@/test-mocks'

import { Sidebar } from './sidebar'

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
  getProjectsSpy = spyOn(projects, 'getProjects').mockResolvedValue([])
  importProjectSpy = spyOn(projects, 'importProject').mockResolvedValue(null)
  removeProjectSpy = spyOn(projects, 'removeProject').mockResolvedValue(undefined)
  reorderProjectsSpy = spyOn(projects, 'reorderProjects').mockResolvedValue(undefined)
})

afterEach(() => {
  mockUsePreferences.mockReset()
  getProjectsSpy.mockRestore()
  importProjectSpy.mockRestore()
  removeProjectSpy.mockRestore()
  reorderProjectsSpy.mockRestore()
})

const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  const result = render(
    <AppUpdateProvider autoCheckUpdates={false}>
      <ProjectsProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
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

describe('Sidebar Component', () => {
  it('renders navigation sections correctly', async () => {
    renderWithProviders(<Sidebar />)

    expect(screen.getByText('Skills Directory')).toBeDefined()
    expect(screen.getByText('Global Skills')).toBeDefined()
    expect(screen.getByText('Projects')).toBeDefined()
    expect(screen.getByRole('button', { name: /import/i })).toBeDefined()

    await waitFor(() => {
      expect(screen.getByText('No projects')).toBeDefined()
    })
  })

  it('highlights active route correctly', async () => {
    renderWithProviders(<Sidebar />, { route: '/global' })

    const globalLink = screen.getByText('Global Skills').closest('a')
    expect(globalLink?.classList.contains('bg-overlay-12')).toBe(true)

    const galleryLink = screen.getByText('Skills Directory').closest('a')
    expect(galleryLink?.classList.contains('bg-overlay-12')).toBe(false)
  })
})
