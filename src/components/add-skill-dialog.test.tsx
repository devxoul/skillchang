import { AddSkillDialog } from '@/components/add-skill-dialog'
import { ProjectsProvider } from '@/contexts/projects-context'
import { SkillsProvider } from '@/contexts/skills-context'
import { addSkill } from '@/lib/cli'
import type { Skill } from '@/types/skill'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/cli', () => ({
  addSkill: vi.fn(),
  listSkills: vi.fn().mockResolvedValue([]),
  removeSkill: vi.fn(),
}))

vi.mock('@/lib/projects', () => ({
  getProjects: vi.fn().mockResolvedValue([
    { id: 'proj-1', name: 'Project A', path: '/path/to/project-a' },
    { id: 'proj-2', name: 'Project B', path: '/path/to/project-b' },
  ]),
  importProject: vi.fn(),
  removeProject: vi.fn(),
  reorderProjects: vi.fn(),
}))

const mockSkill: Skill = {
  id: 'skill-1',
  name: 'test-skill',
  installs: 100,
  topSource: 'github:test/skill',
}

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <ProjectsProvider>
      <SkillsProvider>{ui}</SkillsProvider>
    </ProjectsProvider>,
  )
}

describe('AddSkillDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly when open', async () => {
    renderWithProvider(<AddSkillDialog skill={mockSkill} open={true} onOpenChange={() => {}} />)

    expect(screen.getByText('Add test-skill')).toBeInTheDocument()
    expect(screen.getByText('Install to')).toBeInTheDocument()
    expect(screen.getByText('Agents')).toBeInTheDocument()
  })

  it('shows Global option checked by default', async () => {
    renderWithProvider(<AddSkillDialog skill={mockSkill} open={true} onOpenChange={() => {}} />)

    expect(screen.getByText('Global')).toBeInTheDocument()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
  })

  it('shows projects in the install list', async () => {
    renderWithProvider(<AddSkillDialog skill={mockSkill} open={true} onOpenChange={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument()
      expect(screen.getByText('Project B')).toBeInTheDocument()
    })
  })

  it('allows selecting multiple targets (Global + Projects)', async () => {
    renderWithProvider(<AddSkillDialog skill={mockSkill} open={true} onOpenChange={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Project A'))

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).toBeChecked()
  })

  it('allows selecting agents', async () => {
    renderWithProvider(<AddSkillDialog skill={mockSkill} open={true} onOpenChange={() => {}} />)

    const checkboxes = screen.getAllByRole('checkbox')
    const firstAgentIndex = 3
    const firstAgentCheckbox = checkboxes[firstAgentIndex]!

    expect(firstAgentCheckbox).not.toBeChecked()

    fireEvent.click(firstAgentCheckbox)

    expect(firstAgentCheckbox).toBeChecked()
  })

  it('disables Add button when no agents selected', async () => {
    renderWithProvider(<AddSkillDialog skill={mockSkill} open={true} onOpenChange={() => {}} />)

    const addButton = screen.getByRole('button', { name: 'Add' })
    expect(addButton).toBeDisabled()
  })

  it('disables Add button when no targets selected', async () => {
    renderWithProvider(<AddSkillDialog skill={mockSkill} open={true} onOpenChange={() => {}} />)

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]!)
    fireEvent.click(checkboxes[3]!)

    const addButton = screen.getByRole('button', { name: 'Add' })
    expect(addButton).toBeDisabled()
  })

  it('calls addSkill for Global when Global is selected', async () => {
    ;(addSkill as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    const onOpenChange = vi.fn()

    renderWithProvider(<AddSkillDialog skill={mockSkill} open={true} onOpenChange={onOpenChange} />)

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[3]!)

    const addButton = screen.getByRole('button', { name: 'Add' })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(addSkill).toHaveBeenCalledWith(
        'github:test/skill',
        expect.objectContaining({
          global: true,
          agents: expect.any(Array),
          yes: true,
        }),
      )
    })

    expect(await screen.findByText(/added to 1 target/i)).toBeInTheDocument()
  })

  it('calls addSkill for both Global and Project when both are selected', async () => {
    ;(addSkill as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

    renderWithProvider(<AddSkillDialog skill={mockSkill} open={true} onOpenChange={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Project A'))
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[3]!)

    const addButton = screen.getByRole('button', { name: 'Add' })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(addSkill).toHaveBeenCalledTimes(2)
      expect(addSkill).toHaveBeenCalledWith(
        'github:test/skill',
        expect.objectContaining({ global: true }),
      )
      expect(addSkill).toHaveBeenCalledWith(
        'github:test/skill',
        expect.objectContaining({ cwd: '/path/to/project-a' }),
      )
    })

    expect(await screen.findByText(/added to 2 target/i)).toBeInTheDocument()
  })

  it('handles error during add', async () => {
    ;(addSkill as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to install'))

    renderWithProvider(<AddSkillDialog skill={mockSkill} open={true} onOpenChange={() => {}} />)

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[3]!)

    const addButton = screen.getByRole('button', { name: 'Add' })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/Global: Failed to install/)).toBeInTheDocument()
    })
  })
})
