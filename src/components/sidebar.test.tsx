import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ProjectsProvider } from '@/contexts/projects-context'
import { Sidebar } from './sidebar'

vi.mock('@/lib/projects', () => ({
  getProjects: vi.fn().mockResolvedValue([]),
  importProject: vi.fn(),
  removeProject: vi.fn(),
  reorderProjects: vi.fn(),
}))

const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <ProjectsProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </ProjectsProvider>,
  )
}

describe('Sidebar Component', () => {
  it('renders navigation sections correctly', async () => {
    renderWithProviders(<Sidebar />)

    expect(screen.getByText('Skills Directory')).toBeInTheDocument()
    expect(screen.getByText('Global Skills')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('No projects')).toBeInTheDocument()
    })
  })

  it('highlights active route correctly', async () => {
    renderWithProviders(<Sidebar />, { route: '/global' })

    const globalLink = screen.getByText('Global Skills').closest('a')
    expect(globalLink).toHaveClass('bg-white/[0.12]')

    const galleryLink = screen.getByText('Skills Directory').closest('a')
    expect(galleryLink).not.toHaveClass('bg-white/[0.12]')
  })
})
