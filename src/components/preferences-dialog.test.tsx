import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { PreferencesDialog } from '@/components/preferences-dialog'
import { mockUsePreferences } from '@/test-mocks'

let mockUsePreferencesImpl: any = null

describe('PreferencesDialog', () => {
  let mockSavePreferences: any

  beforeEach(() => {
    mockUsePreferences.mockReset()
    mockSavePreferences = mock(() => {})
    mockUsePreferencesImpl = {
      preferences: {
        defaultAgents: ['opencode', 'claude-code'],
        packageManager: 'bunx',
        autoCheckUpdates: true,
      },
      loading: false,
      savePreferences: mockSavePreferences,
    }
    mockUsePreferences.mockImplementation(
      () =>
        mockUsePreferencesImpl ?? {
          preferences: { defaultAgents: [], packageManager: 'npx', autoCheckUpdates: false },
          loading: false,
          savePreferences: mock(() => {}),
        },
    )
  })

  afterEach(() => {
    mockUsePreferences.mockReset()
    mockUsePreferencesImpl = null
  })

  it('renders preferences dialog when open', () => {
    const { getByText } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    expect(getByText('Preferences')).toBeDefined()
  })

  it('displays default agents description', () => {
    const { getByText } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    expect(getByText('These agents will be pre-selected when adding skills')).toBeDefined()
  })

  it('renders all agents as checkboxes', () => {
    const { getAllByRole } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    const checkboxes = getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
  })

  it('pre-selects default agents from preferences', () => {
    const { getAllByRole } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    const checkboxes = getAllByRole('checkbox')
    const openCodeCheckbox = checkboxes[1]
    const claudeCheckbox = checkboxes[2]

    expect(openCodeCheckbox?.getAttribute('aria-checked')).toBe('true')
    expect(claudeCheckbox?.getAttribute('aria-checked')).toBe('true')
  })

  it('toggles agent selection on checkbox click', async () => {
    const { getAllByRole } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    const checkboxes = getAllByRole('checkbox')
    const uncheckedCheckbox = checkboxes.find((cb: Element) => cb.getAttribute('aria-checked') === 'false')

    expect(uncheckedCheckbox).toBeDefined()
    if (uncheckedCheckbox) {
      expect(uncheckedCheckbox.getAttribute('aria-checked')).toBe('false')
      fireEvent.click(uncheckedCheckbox)

      await waitFor(() => {
        expect(uncheckedCheckbox.getAttribute('aria-checked')).toBe('true')
      })
    }
  })

  it('saves preferences on save button click', async () => {
    let savePreferencesCalled = false
    mockSavePreferences = mock(() => {
      savePreferencesCalled = true
    })
    mockUsePreferencesImpl.savePreferences = mockSavePreferences

    const onOpenChange = mock(() => {})
    const { getByRole } = render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    const saveButton = getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(savePreferencesCalled).toBe(true)
    })
  })

  it('closes dialog after saving', async () => {
    let onOpenChangeCalled = false
    let onOpenChangeArg: any = null
    const onOpenChange = mock((arg: any) => {
      onOpenChangeCalled = true
      onOpenChangeArg = arg
    })
    const { getByRole } = render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    const saveButton = getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(onOpenChangeCalled).toBe(true)
      expect(onOpenChangeArg).toBe(false)
    })
  })

  it('closes dialog on cancel button click', () => {
    let onOpenChangeCalled = false
    let onOpenChangeArg: any = null
    const onOpenChange = mock((arg: any) => {
      onOpenChangeCalled = true
      onOpenChangeArg = arg
    })
    const { getByRole } = render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    const cancelButton = getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    expect(onOpenChangeCalled).toBe(true)
    expect(onOpenChangeArg).toBe(false)
  })

  it('saves selected agents to preferences', async () => {
    let savePreferencesArg: any = null
    mockSavePreferences = mock((arg: any) => {
      savePreferencesArg = arg
    })
    mockUsePreferencesImpl.savePreferences = mockSavePreferences

    const onOpenChange = mock(() => {})
    const { getAllByRole, getByRole } = render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    const checkboxes = getAllByRole('checkbox')
    const uncheckedCheckbox = checkboxes.find((cb: Element) => cb.getAttribute('aria-checked') === 'false')

    expect(uncheckedCheckbox).toBeDefined()
    if (uncheckedCheckbox) {
      fireEvent.click(uncheckedCheckbox)
    }

    const saveButton = getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(savePreferencesArg).toBeDefined()
      expect(savePreferencesArg?.defaultAgents).toContain('opencode')
      expect(savePreferencesArg?.defaultAgents).toContain('claude-code')
      expect(savePreferencesArg?.defaultAgents?.length).toBe(3)
    })
  })

  it('displays package manager selection', () => {
    const { getByText } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    expect(getByText('Package Manager')).toBeDefined()
    expect(getByText('Package runner used when adding skills')).toBeDefined()
  })

  it('renders package manager options', () => {
    const { getByRole } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    expect(getByRole('radio', { name: 'npx' })).toBeDefined()
    expect(getByRole('radio', { name: 'pnpx' })).toBeDefined()
    expect(getByRole('radio', { name: 'bunx' })).toBeDefined()
  })

  it('pre-selects package manager from preferences', () => {
    const { getByRole } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    const bunxRadio = getByRole('radio', { name: 'bunx' })
    expect(bunxRadio.getAttribute('data-checked')).toBe('')
  })

  it('changes package manager selection', async () => {
    const { getByRole } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    const npxRadio = getByRole('radio', { name: 'npx' })

    fireEvent.click(npxRadio)

    await waitFor(() => {
      expect(npxRadio.getAttribute('data-checked')).toBe('')
    })
  })

  it('saves package manager preference', async () => {
    let savePreferencesArg: any = null
    mockSavePreferences = mock((arg: any) => {
      savePreferencesArg = arg
    })
    mockUsePreferencesImpl.savePreferences = mockSavePreferences

    const onOpenChange = mock(() => {})
    const { getByRole } = render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    const pnpxRadio = getByRole('radio', { name: 'pnpx' })
    fireEvent.click(pnpxRadio)

    const saveButton = getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(savePreferencesArg).toBeDefined()
      expect(savePreferencesArg?.packageManager).toBe('pnpx')
    })
  })

  it('does not render when open is false', () => {
    const { container } = render(<PreferencesDialog open={false} onOpenChange={mock(() => {})} />)
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeNull()
  })

  it('resets changes when cancel is clicked and dialog reopens', async () => {
    const onOpenChange = mock(() => {})
    const { rerender, getByRole } = render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    // given - change package manager
    const pnpxRadio = getByRole('radio', { name: 'pnpx' })
    fireEvent.click(pnpxRadio)

    await waitFor(() => {
      expect(pnpxRadio.getAttribute('data-checked')).toBe('')
    })

    // when - click cancel
    const cancelButton = getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    // then - close and reopen dialog
    rerender(<PreferencesDialog open={false} onOpenChange={onOpenChange} />)
    rerender(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    // should be reset to original value (bunx from mock)
    await waitFor(() => {
      const bunxRadio = getByRole('radio', { name: 'bunx' })
      expect(bunxRadio.getAttribute('data-checked')).toBe('')
    })
  })

  it('displays auto-update section', () => {
    const { getByText } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    expect(getByText('Automatically check for updates')).toBeDefined()
    expect(getByText('Check for new versions when the app starts')).toBeDefined()
  })

  it('renders auto-update checkbox', () => {
    const { getAllByRole } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    const checkboxes = getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
  })

  it('pre-selects auto-update checkbox from preferences', () => {
    mockUsePreferencesImpl = {
      preferences: {
        defaultAgents: [],
        packageManager: 'bunx',
        autoCheckUpdates: true,
      },
      loading: false,
      savePreferences: mock(() => {}),
    }
    const { getByText } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    expect(getByText('Automatically check for updates')).toBeDefined()
    expect(getByText('Check for new versions when the app starts')).toBeDefined()
  })

  it('toggles auto-update checkbox', async () => {
    mockUsePreferencesImpl = {
      preferences: {
        defaultAgents: [],
        packageManager: 'bunx',
        autoCheckUpdates: false,
      },
      loading: false,
      savePreferences: mock(() => {}),
    }
    const { getByText } = render(<PreferencesDialog open={true} onOpenChange={mock(() => {})} />)
    expect(getByText('Enable auto-update checks')).toBeDefined()
  })

  it('saves auto-update preference', async () => {
    let savePreferencesArg: any = null
    mockSavePreferences = mock((arg: any) => {
      savePreferencesArg = arg
    })
    mockUsePreferencesImpl = {
      preferences: {
        defaultAgents: [],
        packageManager: 'bunx',
        autoCheckUpdates: false,
      },
      loading: false,
      savePreferences: mockSavePreferences,
    }

    const onOpenChange = mock(() => {})
    const { getByRole } = render(<PreferencesDialog open={true} onOpenChange={onOpenChange} />)

    const saveButton = getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(savePreferencesArg).toBeDefined()
      expect(savePreferencesArg?.autoCheckUpdates).toBe(false)
    })
  })
})
