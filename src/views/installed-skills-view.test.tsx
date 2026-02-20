import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ScrollRestorationProvider } from '@/contexts/scroll-context'
import { SearchPersistenceProvider } from '@/contexts/search-context'
import { SkillsProvider } from '@/contexts/skills-context'
import type { SkillInfo } from '@/lib/cli'
import * as cli from '@/lib/cli'
import InstalledSkillsView from '@/views/installed-skills-view'

const NO_UPDATES_OUTPUT = 'Checking 0 skill(s) for updates...\n\nAll 0 skill(s) are up to date'

let listSkillsSpy: ReturnType<typeof spyOn>
let removeSkillSpy: ReturnType<typeof spyOn>
let checkUpdatesSpy: ReturnType<typeof spyOn>
let updateSkillsSpy: ReturnType<typeof spyOn>

beforeEach(() => {
  listSkillsSpy = spyOn(cli, 'listSkills').mockResolvedValue([])
  removeSkillSpy = spyOn(cli, 'removeSkill').mockResolvedValue(undefined)
  checkUpdatesSpy = spyOn(cli, 'checkUpdates').mockResolvedValue(NO_UPDATES_OUTPUT)
  updateSkillsSpy = spyOn(cli, 'updateSkills').mockResolvedValue({ updatedCount: 0, updatedSkills: [] })
})

afterEach(() => {
  listSkillsSpy.mockRestore()
  removeSkillSpy.mockRestore()
  checkUpdatesSpy.mockRestore()
  updateSkillsSpy.mockRestore()
})

const renderWithProvider = (ui: React.ReactElement) => {
  const result = render(
    <MemoryRouter>
      <SearchPersistenceProvider>
        <SkillsProvider>
          <ScrollRestorationProvider>{ui}</ScrollRestorationProvider>
        </SkillsProvider>
      </SearchPersistenceProvider>
    </MemoryRouter>,
  )

  for (const key in result) {
    if (typeof result[key as keyof typeof result] === 'function') {
      ;(screen as any)[key] = result[key as keyof typeof result]
    }
  }

  return result
}

function mockDefaults() {
  listSkillsSpy.mockClear().mockResolvedValue([])
  removeSkillSpy.mockClear().mockResolvedValue(undefined)
  checkUpdatesSpy.mockClear().mockResolvedValue(NO_UPDATES_OUTPUT)
  updateSkillsSpy.mockClear().mockResolvedValue({ updatedCount: 0, updatedSkills: [] })
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
    mockDefaults()
  })

  it('auto-checks for updates on mount', async () => {
    listSkillsSpy.mockResolvedValue(mockSkills)
    checkUpdatesSpy.mockResolvedValue('Checking 2 skill(s) for updates...\n\nAll 2 skill(s) are up to date')
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(cli.checkUpdates).toHaveBeenCalled()
    })
  })

  it('renders loading skeletons initially', async () => {
    listSkillsSpy.mockImplementation(() => new Promise(() => {}))
    const { container } = renderWithProvider(<InstalledSkillsView scope="global" />)
    expect(container.querySelectorAll('.animate-shimmer').length).toBeGreaterThan(0)
  })

  it('renders empty state when no skills found', async () => {
    listSkillsSpy.mockResolvedValue([])
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      const elements = screen.getAllByText('No skills installed')
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders list of skills', async () => {
    listSkillsSpy.mockResolvedValue(mockSkills)
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(screen.getByText('skill-1')).toBeInTheDocument()
      expect(screen.getByText('skill-2')).toBeInTheDocument()
      expect(screen.getByText('agent-1')).toBeInTheDocument()
    })
  })

  it('renders error state', async () => {
    listSkillsSpy.mockRejectedValue(new Error('Failed to fetch'))
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(
      () => {
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  })

  it('handles remove skill action', async () => {
    listSkillsSpy
      .mockResolvedValueOnce(mockSkills)
      .mockResolvedValueOnce([mockSkills[1]!])
      .mockResolvedValue([mockSkills[1]!])
    removeSkillSpy.mockResolvedValue(undefined)

    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(screen.getByText('skill-1')).toBeInTheDocument()
    })

    const removeButtons = screen.getAllByLabelText('Remove skill')
    const button = removeButtons[0]
    if (!button) throw new Error('No remove button found')
    fireEvent.click(button)
    fireEvent.click(button)

    expect(cli.removeSkill).toHaveBeenCalledWith('skill-1', { global: true })

    await waitFor(() => {
      expect(screen.queryByText('skill-1')).not.toBeInTheDocument()
      expect(screen.getByText('skill-2')).toBeInTheDocument()
    })
  })

  it('handles remove failure', async () => {
    listSkillsSpy.mockResolvedValue(mockSkills)
    removeSkillSpy.mockRejectedValue(new Error('Remove failed'))

    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(screen.getByText('skill-1')).toBeInTheDocument()
      expect(screen.getByText('skill-2')).toBeInTheDocument()
    })

    const removeButtons = screen.getAllByLabelText('Remove skill')
    const button = removeButtons[0]
    if (!button) throw new Error('No remove button found')
    fireEvent.click(button)
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Remove failed')).toBeInTheDocument()
    })

    expect(screen.getByText('skill-1')).toBeInTheDocument()
  })

  it('fetches skills only once on mount (no infinite loop)', async () => {
    listSkillsSpy.mockResolvedValue(mockSkills)
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      expect(screen.getByText('skill-1')).toBeInTheDocument()
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(cli.listSkills).toHaveBeenCalledTimes(1)
  })

  it('passes correct options for project scope with path', async () => {
    listSkillsSpy.mockResolvedValue([])

    renderWithProvider(<InstalledSkillsView scope="project" projectPath="/path/to/project" />)

    await waitFor(() => {
      expect(cli.listSkills).toHaveBeenCalledWith({
        global: false,
        cwd: '/path/to/project',
      })
    })
  })

  it('passes global=true for global scope', async () => {
    listSkillsSpy.mockResolvedValue([])

    renderWithProvider(<InstalledSkillsView scope="global" />)

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
    mockDefaults()
  })

  it('renders "Check for Updates" button in header', async () => {
    listSkillsSpy.mockResolvedValue(mockSkills)
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    expect(screen.getByLabelText('Check for updates')).toBeInTheDocument()
  })

  it('shows loading spinner when checking updates', async () => {
    listSkillsSpy.mockResolvedValue(mockSkills)
    checkUpdatesSpy.mockImplementation(() => new Promise(() => {}))
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
    listSkillsSpy.mockResolvedValue(mockSkills)
    checkUpdatesSpy.mockResolvedValue('Checking 2 skill(s) for updates...\n\nAll 2 skill(s) are up to date')
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const checkButton = screen.getByLabelText('Check for updates')
    fireEvent.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('All up to date')).toBeInTheDocument()
    })
  })

  it('displays updates available', async () => {
    listSkillsSpy.mockResolvedValue(mockSkills)
    checkUpdatesSpy.mockResolvedValue(
      'Checking 2 skill(s) for updates...\n\n2 update(s) available:\n\n  ↑ skill-1\n    source: user/repo\n  ↑ skill-2\n    source: user/repo2\n\nRun npx skills update to update all skills',
    )
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const checkButton = screen.getByLabelText('Check for updates')
    fireEvent.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Update All (2)')).toBeInTheDocument()
    })
  })

  it('Update All button calls updateSkills and refreshes', async () => {
    listSkillsSpy.mockResolvedValue(mockSkills)
    checkUpdatesSpy.mockResolvedValue(
      'Checking 2 skill(s) for updates...\n\n1 update(s) available:\n\n  ↑ skill-1\n    source: user/repo\n\nRun npx skills update to update all skills',
    )
    updateSkillsSpy.mockResolvedValue({ updatedCount: 1, updatedSkills: ['skill-1'] })
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
    listSkillsSpy.mockResolvedValue(mockSkills)
    checkUpdatesSpy.mockResolvedValue(
      'Checking 2 skill(s) for updates...\n\n1 update(s) available:\n\n  ↑ skill-1\n    source: user/repo\n\nRun npx skills update to update all skills',
    )
    renderWithProvider(<InstalledSkillsView scope="global" />)

    await waitFor(() => {
      const updateBadges = screen.getAllByText('Update')
      expect(updateBadges.length).toBeGreaterThan(0)
    })
  })

  it('shows update badge for all skills from same repo', async () => {
    // given - 3 skills from same repo, CLI reports all 3 have updates
    const sameRepoSkills: SkillInfo[] = [
      { name: 'agent-discord', path: '/Users/test/.skills/agent-discord', agents: ['claude'] },
      { name: 'agent-slack', path: '/Users/test/.skills/agent-slack', agents: ['claude'] },
      { name: 'agent-teams', path: '/Users/test/.skills/agent-teams', agents: ['claude'] },
    ]
    listSkillsSpy.mockResolvedValue(sameRepoSkills)
    checkUpdatesSpy.mockResolvedValue(
      'Checking 3 skill(s) for updates...\n\n3 update(s) available:\n\n  ↑ agent-discord\n    source: devxoul/agent-messenger\n  ↑ agent-slack\n    source: devxoul/agent-messenger\n  ↑ agent-teams\n    source: devxoul/agent-messenger\n\nRun npx skills update to update all skills',
    )

    // when
    renderWithProvider(<InstalledSkillsView scope="global" />)

    // then - all 3 skills should show update badge
    await waitFor(() => {
      const updateBadges = screen.getAllByText('Update')
      expect(updateBadges).toHaveLength(3)
    })
  })
})

describe('InstalledSkillsView search', () => {
  const mockSkills: SkillInfo[] = [
    { name: 'git-master', path: '/path/to/git-master', agents: ['claude'] },
    { name: 'frontend-ui-ux', path: '/path/to/frontend-ui-ux', agents: [] },
    { name: 'dev-browser', path: '/path/to/dev-browser', agents: ['cursor'] },
  ]

  beforeEach(() => {
    mockDefaults()
  })

  it('filters skills by search query', async () => {
    const user = userEvent.setup({ delay: null })
    listSkillsSpy.mockResolvedValue(mockSkills)
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('git-master')).toBeInTheDocument())

    const input = screen.getByPlaceholderText('Search skills...')
    await user.type(input, 'git')

    await waitFor(() => {
      expect(screen.getByText('git-master')).toBeInTheDocument()
      expect(screen.queryByText('frontend-ui-ux')).not.toBeInTheDocument()
      expect(screen.queryByText('dev-browser')).not.toBeInTheDocument()
    })
  })

  it('preserves search input value when no skills match', async () => {
    const user = userEvent.setup({ delay: null })
    listSkillsSpy.mockResolvedValue(mockSkills)
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('git-master')).toBeInTheDocument())

    const input = screen.getByPlaceholderText('Search skills...') as HTMLInputElement
    await user.type(input, 'nonexistent')

    await waitFor(() => {
      expect(screen.getByText('No skills match your search')).toBeInTheDocument()
    })
    expect(input.value).toBe('nonexistent')
  })

  it('shows all skills again when search is cleared', async () => {
    const user = userEvent.setup({ delay: null })
    listSkillsSpy.mockResolvedValue(mockSkills)
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('git-master')).toBeInTheDocument())

    const input = screen.getByPlaceholderText('Search skills...')
    await user.type(input, 'git')
    await waitFor(() => expect(screen.queryByText('frontend-ui-ux')).not.toBeInTheDocument())

    await user.click(screen.getByLabelText('Clear search'))

    await waitFor(() => {
      expect(screen.getByText('git-master')).toBeInTheDocument()
      expect(screen.getByText('frontend-ui-ux')).toBeInTheDocument()
      expect(screen.getByText('dev-browser')).toBeInTheDocument()
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
    mockDefaults()
  })

  it('first click shows "Remove" text and expands button', async () => {
    listSkillsSpy.mockResolvedValue([mockSkills[0]])
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const removeButton = screen.getByLabelText('Remove skill')
    fireEvent.click(removeButton)

    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('second click within 2s calls onRemove', async () => {
    listSkillsSpy.mockResolvedValueOnce([mockSkills[0]]).mockResolvedValueOnce([mockSkills[1]!])
    removeSkillSpy.mockResolvedValue(undefined)
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const removeButton = screen.getByLabelText('Remove skill')
    fireEvent.click(removeButton)
    fireEvent.click(removeButton)

    expect(cli.removeSkill).toHaveBeenCalledWith('skill-1', { global: true })
  })

  it('resets after 2 seconds without second click', async () => {
    const origSetTimeout = globalThis.setTimeout
    globalThis.setTimeout = ((fn: TimerHandler, ms?: number, ...args: any[]) => {
      return origSetTimeout(fn, ms && ms >= 2000 ? 50 : ms, ...args)
    }) as typeof setTimeout

    try {
      listSkillsSpy.mockResolvedValue([mockSkills[0]])
      renderWithProvider(<InstalledSkillsView scope="global" />)
      await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

      const removeButton = screen.getByLabelText('Remove skill')
      fireEvent.click(removeButton)
      const removeText = screen.getByText('Remove')
      expect(removeText).toHaveClass('opacity-100')

      await waitFor(() => {
        expect(removeText).toHaveClass('opacity-0')
      })
    } finally {
      globalThis.setTimeout = origSetTimeout
    }
  })

  it('onBlur resets confirmation state', async () => {
    listSkillsSpy.mockResolvedValue([mockSkills[0]])
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const removeButton = screen.getByLabelText('Remove skill')
    fireEvent.click(removeButton)
    const removeText = screen.getByText('Remove')
    expect(removeText).toHaveClass('opacity-100')

    fireEvent.blur(removeButton)

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
    mockDefaults()
  })

  it('skill item is wrapped in Link to /skill/{name}', async () => {
    listSkillsSpy.mockResolvedValue([mockSkills[0]])
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const link = screen.getByRole('link', { name: /skill-1/i })
    expect(link).toHaveAttribute('href', '/skill/skill-1')
  })

  it('clicking remove button does not navigate', async () => {
    listSkillsSpy.mockResolvedValue([mockSkills[0]])
    renderWithProvider(<InstalledSkillsView scope="global" />)
    await waitFor(() => expect(screen.getByText('skill-1')).toBeInTheDocument())

    const removeButton = screen.getByLabelText('Remove skill')
    fireEvent.click(removeButton)

    expect(screen.getByText('Remove')).toBeInTheDocument()
  })
})
