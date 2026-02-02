import { SkillsProvider } from '@/contexts/skills-context'
import * as cli from '@/lib/cli'
import type { SkillInfo } from '@/lib/cli'
import InstalledSkillsView from '@/views/installed-skills-view'
// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/cli', () => ({
  listSkills: vi.fn(),
  removeSkill: vi.fn(),
}))

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<SkillsProvider>{ui}</SkillsProvider>)
}

describe('InstalledSkillsView', () => {
  const mockSkills: SkillInfo[] = [
    {
      name: 'skill-1',
      path: '/path/to/skill-1',
      agents: ['agent-1'],
    },
    {
      name: 'skill-2',
      path: '/path/to/skill-2',
      agents: [],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    ;(cli.listSkills as Mock).mockImplementation(() => new Promise(() => {}))
    const { container } = renderWithProvider(<InstalledSkillsView scope="global" />)
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  it('renders empty state when no skills found', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue([])
    renderWithProvider(<InstalledSkillsView scope="global" />)

    // given: text appears in both header and main content
    await waitFor(() => {
      const elements = screen.getAllByText('No skills installed')
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders list of skills', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(screen.getByText('skill-1')).toBeInTheDocument()
      expect(screen.getByText('skill-2')).toBeInTheDocument()
      expect(screen.getByText('agent-1')).toBeInTheDocument()
    })
  })

  it('renders error state', async () => {
    ;(cli.listSkills as Mock).mockRejectedValue(new Error('Failed to fetch'))
    renderWithProvider(<InstalledSkillsView scope="global" />)

    // then: error message appears in InlineError component
    await waitFor(
      () => {
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  })

  it('handles remove skill action', async () => {
    // given: initial list has both skills, after removal only skill-2 remains
    ;(cli.listSkills as Mock)
      .mockResolvedValueOnce(mockSkills)
      .mockResolvedValueOnce([mockSkills[1]!])
      .mockResolvedValue([mockSkills[1]!])
    ;(cli.removeSkill as Mock).mockResolvedValue(undefined)

    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(screen.getByText('skill-1')).toBeInTheDocument()
    })

    // when: click remove on first skill
    const removeButtons = screen.getAllByLabelText('Remove skill')
    const button = removeButtons[0]
    if (!button) throw new Error('No remove button found')
    fireEvent.click(button)

    expect(cli.removeSkill).toHaveBeenCalledWith('skill-1', { global: true })

    // then: skill-1 is removed from list
    await waitFor(() => {
      expect(screen.queryByText('skill-1')).not.toBeInTheDocument()
      expect(screen.getByText('skill-2')).toBeInTheDocument()
    })
  })

  it('handles remove failure', async () => {
    // given: always return both skills (removal fails so list stays the same)
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    ;(cli.removeSkill as Mock).mockRejectedValue(new Error('Remove failed'))

    renderWithProvider(<InstalledSkillsView scope="global" />)

    // when: initial list loads
    await waitFor(() => {
      expect(screen.getByText('skill-1')).toBeInTheDocument()
      expect(screen.getByText('skill-2')).toBeInTheDocument()
    })

    // when: click remove on first skill
    const removeButtons = screen.getAllByLabelText('Remove skill')
    const button = removeButtons[0]
    if (!button) throw new Error('No remove button found')
    fireEvent.click(button)

    // then: error message appears and skill-1 remains in list
    await waitFor(() => {
      expect(screen.getByText('Remove failed')).toBeInTheDocument()
    })

    expect(screen.getByText('skill-1')).toBeInTheDocument()
  })

  it('fetches skills only once on mount (no infinite loop)', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(screen.getByText('skill-1')).toBeInTheDocument()
    })

    // wait a bit to ensure no additional calls are made
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(cli.listSkills).toHaveBeenCalledTimes(1)
  })

  it('passes correct options for project scope with path', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue([])

    // given: render with project scope and path
    renderWithProvider(<InstalledSkillsView scope="project" projectPath="/path/to/project" />)

    // then: listSkills should be called with global=false and cwd
    await waitFor(() => {
      expect(cli.listSkills).toHaveBeenCalledWith({
        global: false,
        cwd: '/path/to/project',
      })
    })
  })

  it('passes global=true for global scope', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue([])

    // given: render with global scope
    renderWithProvider(<InstalledSkillsView scope="global" />)

    // then: listSkills should be called with global=true
    await waitFor(() => {
      expect(cli.listSkills).toHaveBeenCalledWith({ global: true, cwd: undefined })
    })
  })
})
