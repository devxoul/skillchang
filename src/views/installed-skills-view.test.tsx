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

    await waitFor(() => {
      expect(screen.getByText('No skills installed')).toBeInTheDocument()
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

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
    })
  })

  it('handles remove skill action', async () => {
    ;(cli.listSkills as Mock).mockResolvedValueOnce(mockSkills)
    ;(cli.removeSkill as Mock).mockResolvedValue(undefined)
    ;(cli.listSkills as Mock).mockResolvedValueOnce([mockSkills[1]!])

    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(screen.getByText('skill-1')).toBeInTheDocument()
    })

    const removeButtons = screen.getAllByLabelText('Remove skill')
    const button = removeButtons[0]
    if (!button) throw new Error('No remove button found')
    fireEvent.click(button)

    expect(cli.removeSkill).toHaveBeenCalledWith('skill-1', { global: true })

    await waitFor(() => {
      expect(screen.queryByText('skill-1')).not.toBeInTheDocument()
      expect(screen.getByText('skill-2')).toBeInTheDocument()
    })
  })

  it('handles remove failure', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    ;(cli.removeSkill as Mock).mockRejectedValue(new Error('Remove failed'))

    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(screen.getByText('skill-1')).toBeInTheDocument()
    })

    const removeButtons = screen.getAllByLabelText('Remove skill')
    const button = removeButtons[0]
    if (!button) throw new Error('No remove button found')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Remove failed')).toBeInTheDocument()
    })

    expect(screen.getByText('skill-1')).toBeInTheDocument()
  })
})
