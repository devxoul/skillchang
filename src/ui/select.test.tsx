import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Select,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectPositioner,
  SelectPopup,
  SelectItem,
} from '@/ui/select'

const testOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
]

describe('Select', () => {
  it('renders convenience component', () => {
    render(<Select options={testOptions} placeholder="Select fruit" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays placeholder when no value selected', () => {
    render(<Select options={testOptions} placeholder="Choose one" />)
    expect(screen.getByText('Choose one')).toBeInTheDocument()
  })

  it('opens popup when trigger is clicked', async () => {
    render(<Select options={testOptions} placeholder="Select" />)

    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('selects option when clicked', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Select options={testOptions} onValueChange={onValueChange} placeholder="Select" />)

    await user.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('option', { name: 'Banana' }))

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalled()
      expect(onValueChange.mock.calls[0]?.[0]).toBe('banana')
    })
  })

  it('displays selected value label', async () => {
    render(<Select options={testOptions} defaultValue="apple" placeholder="Select" />)

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument()
    })
  })

  it('supports controlled value', () => {
    render(<Select options={testOptions} value="cherry" placeholder="Select" />)
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('renders disabled state', () => {
    render(<Select options={testOptions} disabled placeholder="Disabled" />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()
  })

  it('accepts custom className', () => {
    render(<Select options={testOptions} className="custom-select" placeholder="Custom" />)
    expect(screen.getByRole('combobox')).toHaveClass('custom-select')
  })

  it('renders using composition pattern', async () => {
    render(
      <SelectRoot>
        <SelectTrigger>
          <SelectValue>{(value) => value ?? 'Composed'}</SelectValue>
          <SelectIcon />
        </SelectTrigger>
        <SelectPortal>
          <SelectPositioner>
            <SelectPopup>
              <SelectItem value="one">One</SelectItem>
              <SelectItem value="two">Two</SelectItem>
            </SelectPopup>
          </SelectPositioner>
        </SelectPortal>
      </SelectRoot>,
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Composed')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    expect(screen.getByText('One')).toBeInTheDocument()
    expect(screen.getByText('Two')).toBeInTheDocument()
  })
})
