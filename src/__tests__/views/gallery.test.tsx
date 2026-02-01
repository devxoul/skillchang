import { SkillGalleryView } from '@/views/skill-gallery-view'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tauri-apps/plugin-http', () => ({
  fetch: vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ skills: [], hasMore: false }),
  }),
}))

describe('SkillGalleryView', () => {
  const mockSkills = [
    { id: '1', name: 'React Hooks', installs: 1000, topSource: 'npm' },
    { id: '2', name: 'TypeScript Basics', installs: 500, topSource: 'npm' },
    { id: '3', name: 'Testing Library', installs: 800, topSource: 'npm' },
  ]

  it('renders gallery title and description', () => {
    render(<SkillGalleryView initialSkills={[]} />)

    expect(screen.getByText('Skill Gallery')).toBeInTheDocument()
    expect(screen.getByText('Browse and discover available skills')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<SkillGalleryView initialSkills={[]} />)

    const searchInput = screen.getByPlaceholderText('Search skills...')
    expect(searchInput).toBeInTheDocument()
  })

  it('displays all skills when no search query', () => {
    render(<SkillGalleryView initialSkills={mockSkills} />)

    expect(screen.getByText('React Hooks')).toBeInTheDocument()
    expect(screen.getByText('TypeScript Basics')).toBeInTheDocument()
    expect(screen.getByText('Testing Library')).toBeInTheDocument()
  })

  it('filters skills by substring match (case-insensitive)', async () => {
    render(<SkillGalleryView initialSkills={mockSkills} />)

    const searchInput = screen.getByPlaceholderText('Search skills...') as HTMLInputElement

    fireEvent.change(searchInput, { target: { value: 'react' } })

    await waitFor(() => {
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
      expect(screen.queryByText('TypeScript Basics')).not.toBeInTheDocument()
      expect(screen.queryByText('Testing Library')).not.toBeInTheDocument()
    })
  })

  it('filters skills with uppercase query', async () => {
    render(<SkillGalleryView initialSkills={mockSkills} />)

    const searchInput = screen.getByPlaceholderText('Search skills...') as HTMLInputElement

    fireEvent.change(searchInput, { target: { value: 'TYPESCRIPT' } })

    await waitFor(() => {
      expect(screen.getByText('TypeScript Basics')).toBeInTheDocument()
      expect(screen.queryByText('React Hooks')).not.toBeInTheDocument()
    })
  })

  it('shows "No skills match your search" when search yields no results', async () => {
    render(<SkillGalleryView initialSkills={mockSkills} />)

    const searchInput = screen.getByPlaceholderText('Search skills...') as HTMLInputElement

    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(screen.getByText('No skills match your search')).toBeInTheDocument()
    })
  })

  it('shows "No skills available" when skills list is empty', async () => {
    render(<SkillGalleryView initialSkills={[]} loading={false} />)

    expect(await screen.findByText('No skills available')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    render(<SkillGalleryView initialSkills={[]} loading={true} />)

    expect(screen.getByText('Loading skills...')).toBeInTheDocument()
  })

  it('displays error state', async () => {
    render(<SkillGalleryView initialSkills={[]} error="Failed to fetch skills" />)

    expect(await screen.findByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch skills')).toBeInTheDocument()
  })

  it('displays skill details (installs and source)', () => {
    render(<SkillGalleryView initialSkills={mockSkills} />)

    expect(screen.getByText('1.0K')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('800')).toBeInTheDocument()
    expect(screen.getAllByText('npm')).toHaveLength(3)
  })

  it('clears search when clearing input', async () => {
    render(<SkillGalleryView initialSkills={mockSkills} />)

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
