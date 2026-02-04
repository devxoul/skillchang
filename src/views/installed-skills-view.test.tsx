import { ScrollRestorationProvider } from '@/contexts/scroll-context'
import { SkillsProvider } from '@/contexts/skills-context'
import * as cli from '@/lib/cli'
import type { SkillInfo } from '@/lib/cli'
import InstalledSkillsView from '@/views/installed-skills-view'
// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/cli', () => ({
  listSkills: vi.fn(),
  removeSkill: vi.fn(),
  checkUpdatesApi: vi.fn(),
  updateSkills: vi.fn(),
}))

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <SkillsProvider>
        <ScrollRestorationProvider>{ui}</ScrollRestorationProvider>
      </SkillsProvider>
    </MemoryRouter>,
  )
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
    ;(cli.checkUpdatesApi as Mock).mockResolvedValue({
      totalChecked: 2,
      updatesAvailable: [],
      errors: [],
    })
  })

  it('auto-checks for updates on mount', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    ;(cli.checkUpdatesApi as Mock).mockResolvedValue({
      totalChecked: 2,
      updatesAvailable: [],
      errors: [],
    })
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(cli.checkUpdatesApi).toHaveBeenCalled()
    })
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

    // when: click remove on first skill twice (confirmation pattern)
    const removeButtons = screen.getAllByLabelText('Remove skill')
    const button = removeButtons[0]
    if (!button) throw new Error('No remove button found')
    fireEvent.click(button)
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

    // when: click remove on first skill twice (confirmation pattern)
    const removeButtons = screen.getAllByLabelText('Remove skill')
    const button = removeButtons[0]
    if (!button) throw new Error('No remove button found')
    fireEvent.click(button)
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

describe('Check for Updates', () => {
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
    ;(cli.checkUpdatesApi as Mock).mockResolvedValue({
      totalChecked: 2,
      updatesAvailable: [],
      errors: [],
    })
  })

  it('renders "Check for Updates" button in header', async () => {
    // given: skill list loaded
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    // then: Check for Updates button exists
    expect(screen.getByLabelText('Check for updates')).toBeInTheDocument()
  })

  it('shows loading spinner when checking updates', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    ;(cli.checkUpdatesApi as Mock).mockImplementation(() => new Promise(() => {}))
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const checkButton = screen.getByLabelText('Check for updates')
    fireEvent.click(checkButton)

    await waitFor(() => {
      const button = screen.getByLabelText('Check for updates')
      expect(button.querySelector('svg.animate-spin')).toBeInTheDocument()
    })
  })

  it('displays update result on success', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    ;(cli.checkUpdatesApi as Mock).mockResolvedValue({
      totalChecked: 2,
      updatesAvailable: [],
      errors: [],
    })
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const checkButton = screen.getByLabelText('Check for updates')
    fireEvent.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('All up to date')).toBeInTheDocument()
    })
  })

  it('displays updates available', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    ;(cli.checkUpdatesApi as Mock).mockResolvedValue({
      totalChecked: 2,
      updatesAvailable: [
        { name: 'skill-1', source: 'user/repo' },
        { name: 'skill-2', source: 'user/repo2' },
      ],
      errors: [],
    })
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const checkButton = screen.getByLabelText('Check for updates')
    fireEvent.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Update All (2)')).toBeInTheDocument()
    })
  })

  it('displays individual skill errors from API', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    ;(cli.checkUpdatesApi as Mock).mockResolvedValue({
      totalChecked: 2,
      updatesAvailable: [],
      errors: [{ name: 'skill-1', source: 'github:user/repo1', error: 'Network timeout' }],
    })
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const checkButton = screen.getByLabelText('Check for updates')
    fireEvent.click(checkButton)

    // Errors are shown inline in subtitle, verify indicator is shown
    await waitFor(() => {
      expect(screen.getByText("1 couldn't be checked")).toBeInTheDocument()
    })

    // Click to expand and see individual error details
    const errorButton = screen.getByText("1 couldn't be checked")
    fireEvent.click(errorButton)

    await waitFor(() => {
      expect(screen.getByText('Network timeout')).toBeInTheDocument()
    })
  })

  it('Update All button calls updateSkills and refreshes', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    ;(cli.checkUpdatesApi as Mock).mockResolvedValue({
      totalChecked: 2,
      updatesAvailable: [{ name: 'skill-1', source: 'user/repo' }],
      errors: [],
    })
    ;(cli.updateSkills as Mock).mockResolvedValue({ updatedCount: 1, updatedSkills: ['skill-1'] })
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(screen.getByText('Update All (1)')).toBeInTheDocument()
    })

    const updateButton = screen.getByText('Update All (1)')
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(cli.updateSkills).toHaveBeenCalled()
    })
  })

  it('shows Update badge on skills with available updates', async () => {
    ;(cli.listSkills as Mock).mockResolvedValue(mockSkills)
    ;(cli.checkUpdatesApi as Mock).mockResolvedValue({
      totalChecked: 2,
      updatesAvailable: [{ name: 'skill-1', source: 'user/repo' }],
      errors: [],
    })
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      // "Update" badge should appear
      const updateBadges = screen.getAllByText('Update')
      expect(updateBadges.length).toBeGreaterThan(0)
    })
  })
})

describe('InstalledSkillItem click-twice-to-delete', () => {
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
    ;(cli.checkUpdatesApi as Mock).mockResolvedValue({
      totalChecked: 2,
      updatesAvailable: [],
      errors: [],
    })
  })

  it('first click shows "Remove" text and expands button', async () => {
    // given: skill is rendered
    ;(cli.listSkills as Mock).mockResolvedValue([mockSkills[0]])
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    // when: click remove button once
    const removeButton = screen.getByLabelText('Remove skill')
    fireEvent.click(removeButton)

    // then: "Remove" text is visible
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('second click within 2s calls onRemove', async () => {
    // given: skill is rendered
    ;(cli.listSkills as Mock)
      .mockResolvedValueOnce([mockSkills[0]])
      .mockResolvedValueOnce([mockSkills[1]!])
    ;(cli.removeSkill as Mock).mockResolvedValue(undefined)
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    // when: click remove button twice
    const removeButton = screen.getByLabelText('Remove skill')
    fireEvent.click(removeButton)
    fireEvent.click(removeButton)

    // then: removeSkill is called
    expect(cli.removeSkill).toHaveBeenCalledWith('skill-1', { global: true })
  })

  it('resets after 2 seconds without second click', async () => {
    // given: skill is rendered
    ;(cli.listSkills as Mock).mockResolvedValue([mockSkills[0]])
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    // when: click remove button once
    const removeButton = screen.getByLabelText('Remove skill')
    fireEvent.click(removeButton)
    const removeText = screen.getByText('Remove')
    expect(removeText).toHaveClass('opacity-100')

    // then: after 2 seconds, "Remove" text becomes hidden
    await waitFor(
      () => {
        expect(removeText).toHaveClass('opacity-0')
      },
      { timeout: 3000 },
    )
  })

  it('onBlur resets confirmation state', async () => {
    // given: skill is rendered and in confirming state
    ;(cli.listSkills as Mock).mockResolvedValue([mockSkills[0]])
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const removeButton = screen.getByLabelText('Remove skill')
    fireEvent.click(removeButton)
    const removeText = screen.getByText('Remove')
    expect(removeText).toHaveClass('opacity-100')

    // when: blur the button
    fireEvent.blur(removeButton)

    // then: "Remove" text becomes hidden
    expect(removeText).toHaveClass('opacity-0')
  })
})

describe('InstalledSkillItem navigation', () => {
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
    ;(cli.checkUpdatesApi as Mock).mockResolvedValue({
      totalChecked: 2,
      updatesAvailable: [],
      errors: [],
    })
  })

  it('skill item is wrapped in Link to /skill/{name}', async () => {
    // given: skill is rendered
    ;(cli.listSkills as Mock).mockResolvedValue([mockSkills[0]])
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    // then: there should be a link to the skill detail page
    const link = screen.getByRole('link', { name: /skill-1/i })
    expect(link).toHaveAttribute('href', '/skill/skill-1')
  })

  it('clicking remove button does not navigate', async () => {
    // given: skill is rendered
    ;(cli.listSkills as Mock).mockResolvedValue([mockSkills[0]])
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    // when: click remove button once (first click to enter confirmation)
    const removeButton = screen.getByLabelText('Remove skill')
    fireEvent.click(removeButton)

    // then: should still be on the same page (link wasn't followed)
    // The "Remove" text should appear (confirming we're in confirmation state, not navigated)
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })
})
