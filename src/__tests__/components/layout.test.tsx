import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Sidebar } from '@/components/Sidebar'
import { MainContent } from '@/components/MainContent'

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    theme: vi.fn().mockResolvedValue('light'),
    onThemeChanged: vi.fn().mockResolvedValue(() => {}),
  }),
}))

describe('Layout', () => {
  it('renders Layout component with Sidebar and MainContent', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    expect(screen.getByText('Browse Gallery')).toBeInTheDocument()
    expect(screen.getByText('Global Skills')).toBeInTheDocument()
  })

  it('renders home page content at root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout />
      </MemoryRouter>
    )

    expect(screen.getByText('Skill Gallery')).toBeInTheDocument()
    expect(screen.getByText('Browse and discover available skills')).toBeInTheDocument()
  })

  it('renders global page at /global route', () => {
    render(
      <MemoryRouter initialEntries={['/global']}>
        <Layout />
      </MemoryRouter>
    )
    
    expect(screen.getAllByText('Global Skills').length).toBeGreaterThanOrEqual(1)
  })

  it('renders project page at /project/:id route', () => {
    render(
      <MemoryRouter initialEntries={['/project/123']}>
        <Layout />
      </MemoryRouter>
    )

    expect(screen.getByText('Project')).toBeInTheDocument()
  })
})

describe('Sidebar', () => {
  it('renders sidebar with navigation items', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    expect(screen.getByText('Browse Gallery')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })
})

describe('MainContent', () => {
  it('renders MainContent component', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <MainContent />
      </MemoryRouter>
    )

    expect(screen.getByText('Skill Gallery')).toBeInTheDocument()
  })
})
