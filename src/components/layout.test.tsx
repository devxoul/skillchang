import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Layout } from '@/components/layout'
import { MainContent } from '@/components/main-content'
import { Sidebar } from '@/components/sidebar'
import { ProjectsProvider } from '@/contexts/projects-context'
import { ScrollRestorationProvider } from '@/contexts/scroll-context'
import { SkillsProvider } from '@/contexts/skills-context'

vi.mock('@/lib/cli', () => ({
  listSkills: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/lib/projects', () => ({
  getProjects: vi.fn().mockResolvedValue([]),
  importProject: vi.fn(),
  removeProject: vi.fn(),
  reorderProjects: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-http', () => ({
  fetch: vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue([]),
  }),
}))

const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <ProjectsProvider>
      <SkillsProvider>
        <ScrollRestorationProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </ScrollRestorationProvider>
      </SkillsProvider>
    </ProjectsProvider>,
  )
}

describe('Layout', () => {
  it('renders Layout component with Sidebar and MainContent', () => {
    renderWithProviders(<Layout />)

    expect(screen.getAllByText('Skills Directory').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Global Skills')).toBeInTheDocument()
  })

  it('renders home page content at root route', () => {
    renderWithProviders(<Layout />, { route: '/' })

    expect(screen.getAllByText('Skills Directory').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Browse and discover available skills')).toBeInTheDocument()
  })

  it('renders global page at /global route', () => {
    renderWithProviders(<Layout />, { route: '/global' })

    expect(screen.getAllByText('Global Skills').length).toBeGreaterThanOrEqual(1)
  })

  it('renders project page at /project/:id route', async () => {
    renderWithProviders(<Layout />, { route: '/project/123' })

    await waitFor(() => {
      expect(screen.getByText('Project Skills')).toBeInTheDocument()
    })
  })
})

describe('Sidebar', () => {
  it('renders sidebar with navigation items', () => {
    renderWithProviders(<Sidebar />)

    expect(screen.getByText('Skills Directory')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })
})

describe('MainContent', () => {
  it('renders MainContent component', () => {
    renderWithProviders(<MainContent />, { route: '/' })

    expect(screen.getByText('Skills Directory')).toBeInTheDocument()
  })
})
