import { PreferencesDialog } from '@/components/preferences-dialog'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/hooks/use-preferences', () => ({
  usePreferences: vi.fn(),
}))
vi.mock('@tauri-apps/plugin-store', () => ({
  Store: {
    load: vi.fn(),
  },
}))

import { usePreferences } from '@/hooks/use-preferences'

describe('PreferencesDialog', () => {
  const mockSavePreferences = vi.fn()
  const mockUsePreferences = usePreferences as ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockUsePreferences.mockReturnValue({
      preferences: {
        defaultAgents: ['OpenCode', 'Claude Code'],
      },
      loading: false,
      savePreferences: mockSavePreferences,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders preferences dialog when open', () => {
    render(<PreferencesDialog open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('Preferences')).toBeInTheDocument()
  })

  it('displays default agents description', () => {
    render(<PreferencesDialog open={true} onOpenChange={vi.fn()} />)
    expect(
      screen.getByText('These agents will be pre-selected when adding skills'),
    ).toBeInTheDocument()
  })

  it('renders all agents as checkboxes', () => {
    render(<PreferencesDialog open={true} onOpenChange={vi.fn()} />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
  })

  it('pre-selects default agents from preferences', () => {
    render(<PreferencesDialog open={true} onOpenChange={vi.fn()} />)
    const checkboxes = screen.getAllByRole('checkbox')
    const openCodeCheckbox = checkboxes[0]
    const claudeCheckbox = checkboxes[1]

    expect(openCodeCheckbox).toHaveAttribute('aria-checked', 'true')
    expect(claudeCheckbox).toHaveAttribute('aria-checked', 'true')
  })

  it('toggles agent selection on checkbox click', async () => {
    render(<PreferencesDialog open={true} onOpenChange={vi.fn()} />)
    const checkboxes = screen.getAllByRole('checkbox')
    const uncheckedCheckbox = checkboxes.find((cb) => cb.getAttribute('aria-checked') === 'false')

    expect(uncheckedCheckbox).toBeDefined()
    if (uncheckedCheckbox) {
      expect(uncheckedCheckbox).toHaveAttribute('aria-checked', 'false')
      fireEvent.click(uncheckedCheckbox)

      await waitFor(() => {
        expect(uncheckedCheckbox).toHaveAttribute('aria-checked', 'true')
      })
    }
  })

  it('saves preferences on save button click', async () => {
    const onOpenChange = vi.fn()
    render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    const saveButton = screen.getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockSavePreferences).toHaveBeenCalled()
    })
  })

  it('closes dialog after saving', async () => {
    const onOpenChange = vi.fn()
    render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    const saveButton = screen.getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('closes dialog on cancel button click', () => {
    const onOpenChange = vi.fn()
    render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('saves selected agents to preferences', async () => {
    const onOpenChange = vi.fn()
    render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    const checkboxes = screen.getAllByRole('checkbox')
    const uncheckedCheckbox = checkboxes.find((cb) => cb.getAttribute('aria-checked') === 'false')

    expect(uncheckedCheckbox).toBeDefined()
    if (uncheckedCheckbox) {
      fireEvent.click(uncheckedCheckbox)
    }

    const saveButton = screen.getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockSavePreferences).toHaveBeenCalled()
      const call = mockSavePreferences.mock.calls[0]?.[0]
      expect(call?.defaultAgents).toContain('OpenCode')
      expect(call?.defaultAgents).toContain('Claude Code')
      expect(call?.defaultAgents?.length).toBe(3)
    })
  })

  it('does not render when open is false', () => {
    const { container } = render(<PreferencesDialog open={false} onOpenChange={vi.fn()} />)
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).not.toBeInTheDocument()
  })
})
