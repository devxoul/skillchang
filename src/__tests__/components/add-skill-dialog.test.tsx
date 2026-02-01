import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddSkillDialog } from '@/components/AddSkillDialog'
import { addSkill } from '@/lib/cli'
import type { Skill } from '@/types/skill'

vi.mock('@/lib/cli', () => ({
  addSkill: vi.fn()
}))

const mockSkill: Skill = {
  id: 'skill-1',
  name: 'test-skill',
  installs: 100,
  topSource: 'github:test/skill'
}

describe('AddSkillDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly when open', () => {
    render(
      <AddSkillDialog 
        skill={mockSkill} 
        open={true} 
        onOpenChange={() => {}} 
      />
    )

    expect(screen.getByText('Add test-skill')).toBeInTheDocument()
    expect(screen.getByText('Scope')).toBeInTheDocument()
    expect(screen.getByText('Agents')).toBeInTheDocument()
  })

  it('allows selecting scope', () => {
    render(
      <AddSkillDialog 
        skill={mockSkill} 
        open={true} 
        onOpenChange={() => {}} 
      />
    )

    const globalRadio = screen.getByLabelText('Global') as HTMLInputElement
    const projectRadio = screen.getByLabelText('Project') as HTMLInputElement

    expect(globalRadio.checked).toBe(true)
    expect(projectRadio.checked).toBe(false)

    fireEvent.click(projectRadio)

    expect(globalRadio.checked).toBe(false)
    expect(projectRadio.checked).toBe(true)
  })

  it('allows selecting agents', () => {
    render(
      <AddSkillDialog 
        skill={mockSkill} 
        open={true} 
        onOpenChange={() => {}} 
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    const firstAgentCheckbox = checkboxes[0]!
    
    expect(firstAgentCheckbox).not.toBeChecked()
    
    fireEvent.click(firstAgentCheckbox)
    
    expect(firstAgentCheckbox).toBeChecked()
  })

  it('disables Add button when no agents selected', () => {
    render(
      <AddSkillDialog 
        skill={mockSkill} 
        open={true} 
        onOpenChange={() => {}} 
      />
    )

    const addButton = screen.getByText('Add') as HTMLButtonElement
    expect(addButton).toBeDisabled()
  })

  it('calls addSkill when Add button is clicked', async () => {
    (addSkill as any).mockResolvedValue(undefined)
    const onOpenChange = vi.fn()

    render(
      <AddSkillDialog 
        skill={mockSkill} 
        open={true} 
        onOpenChange={onOpenChange} 
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]!)

    const addButton = screen.getByText('Add')
    expect(addButton).not.toBeDisabled()
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(addSkill).toHaveBeenCalledWith('test-skill', expect.objectContaining({
        global: true,
        agents: expect.any(Array),
        yes: true
      }))
    })

    expect(await screen.findByText(/successfully/)).toBeInTheDocument()
  })

  it('handles error during add', async () => {
    (addSkill as any).mockRejectedValue(new Error('Failed to install'))

    render(
      <AddSkillDialog 
        skill={mockSkill} 
        open={true} 
        onOpenChange={() => {}} 
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]!)

    const addButton = screen.getByText('Add')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to install')).toBeInTheDocument()
    })
  })
})
