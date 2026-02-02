import { SkillsProvider } from '@/contexts/skills-context'
import { SkillGalleryView } from '@/views/skill-gallery-view'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const mockSkills = [
  { id: '1', name: 'React Hooks', installs: 1000, topSource: 'npm' },
  { id: '2', name: 'TypeScript Basics', installs: 500, topSource: 'npm' },
  { id: '3', name: 'Testing Library', installs: 800, topSource: 'npm' },
]

vi.mock('@tauri-apps/plugin-http', () => ({
  fetch: vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ skills: mockSkills, hasMore: false }),
  }),
}))

function renderWithProvider() {
  return render(
    <SkillsProvider>
      <SkillGalleryView />
    </SkillsProvider>,
  )
}

describe('SkillGalleryView', () => {
  it('renders gallery title and description', async () => {
    renderWithProvider()

    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('Browse and discover available skills')).toBeInTheDocument()
  })

  it('renders search input', async () => {
    renderWithProvider()

    const searchInput = screen.getByPlaceholderText('Search skills...')
    expect(searchInput).toBeInTheDocument()
  })

  it('displays skills after loading', async () => {
    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
      expect(screen.getByText('TypeScript Basics')).toBeInTheDocument()
      expect(screen.getByText('Testing Library')).toBeInTheDocument()
    })
  })

  it('filters skills by substring match (case-insensitive)', async () => {
    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search skills...') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'react' } })

    await waitFor(() => {
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
      expect(screen.queryByText('TypeScript Basics')).not.toBeInTheDocument()
      expect(screen.queryByText('Testing Library')).not.toBeInTheDocument()
    })
  })

  it('filters skills with uppercase query', async () => {
    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByText('TypeScript Basics')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search skills...') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'TYPESCRIPT' } })

    await waitFor(() => {
      expect(screen.getByText('TypeScript Basics')).toBeInTheDocument()
      expect(screen.queryByText('React Hooks')).not.toBeInTheDocument()
    })
  })

  it('shows "No skills match your search" when search yields no results', async () => {
    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search skills...') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(screen.getByText('No skills match your search')).toBeInTheDocument()
    })
  })

  it('clears search when clearing input', async () => {
    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search skills...') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'react' } })

    await waitFor(() => {
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
      expect(screen.queryByText('TypeScript Basics')).not.toBeInTheDocument()
    })

    fireEvent.change(searchInput, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
      expect(screen.getByText('TypeScript Basics')).toBeInTheDocument()
      expect(screen.getByText('Testing Library')).toBeInTheDocument()
    })
  })
})
