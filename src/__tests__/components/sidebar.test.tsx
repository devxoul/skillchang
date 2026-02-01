import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from '../../components/Sidebar'

vi.mock('@/hooks/useProjects', () => ({
  useProjects: vi.fn(() => ({
    projects: [],
    loading: false,
    importProject: vi.fn(),
    removeProject: vi.fn(),
    reorderProjects: vi.fn(),
  })),
}))

describe('Sidebar Component', () => {
  it('renders navigation sections correctly', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(screen.getByText('Browse Gallery')).toBeInTheDocument()
    expect(screen.getByText('Global Skills')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()
    expect(screen.getByText('No projects')).toBeInTheDocument()
  })

  it('highlights active route correctly', () => {
    render(
      <MemoryRouter initialEntries={['/global']}>
        <Sidebar />
      </MemoryRouter>,
    )

    const globalLink = screen.getByText('Global Skills').closest('a')
    expect(globalLink).toHaveClass('bg-brand-100')

    const galleryLink = screen.getByText('Browse Gallery').closest('a')
    expect(galleryLink).not.toHaveClass('bg-brand-100')
  })
})
