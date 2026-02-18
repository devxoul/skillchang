import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Select,
  SelectIcon,
  SelectItem,
  SelectPopup,
  SelectPortal,
  SelectPositioner,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'

const testOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
]

describe('Select', () => {
  it('renders convenience component', () => {
    const { getByRole } = render(<Select options={testOptions} placeholder="Select fruit" />)
    expect(getByRole('combobox')).toBeInTheDocument()
  })

  it('displays placeholder when no value selected', () => {
    const { getByText } = render(<Select options={testOptions} placeholder="Choose one" />)
    expect(getByText('Choose one')).toBeInTheDocument()
  })

  it('opens popup when trigger is clicked', async () => {
    const { getByRole, getByText } = render(<Select options={testOptions} placeholder="Select" />)

    fireEvent.click(getByRole('combobox'))

    await waitFor(() => {
      expect(getByRole('listbox')).toBeInTheDocument()
    })
    expect(getByText('Apple')).toBeInTheDocument()
    expect(getByText('Banana')).toBeInTheDocument()
    expect(getByText('Cherry')).toBeInTheDocument()
  })

  it('selects option when clicked', async () => {
    const user = userEvent.setup()
    const onValueChange = mock((_value: string | null) => {})
    const { getByRole } = render(<Select options={testOptions} onValueChange={onValueChange} placeholder="Select" />)

    await user.click(getByRole('combobox'))

    await waitFor(() => {
      expect(getByRole('listbox')).toBeInTheDocument()
    })

    await user.click(getByRole('option', { name: 'Banana' }))

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalled()
      expect(onValueChange.mock.calls[0][0]).toBe('banana')
    })
  })

  it('displays selected value label', async () => {
    const { getByText } = render(<Select options={testOptions} defaultValue="apple" placeholder="Select" />)

    await waitFor(() => {
      expect(getByText('Apple')).toBeInTheDocument()
    })
  })

  it('supports controlled value', () => {
    const { getByText } = render(<Select options={testOptions} value="cherry" placeholder="Select" />)
    expect(getByText('Cherry')).toBeInTheDocument()
  })

  it('renders disabled state', () => {
    const { getByRole } = render(<Select options={testOptions} disabled placeholder="Disabled" />)
    const trigger = getByRole('combobox')
    expect(trigger).toBeDisabled()
  })

  it('accepts custom className', () => {
    const { getByRole } = render(<Select options={testOptions} className="custom-select" placeholder="Custom" />)
    expect(getByRole('combobox')).toHaveClass('custom-select')
  })

  it('renders using composition pattern', async () => {
    const { getByRole, getByText } = render(
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

    expect(getByRole('combobox')).toBeInTheDocument()
    expect(getByText('Composed')).toBeInTheDocument()

    fireEvent.click(getByRole('combobox'))

    await waitFor(() => {
      expect(getByRole('listbox')).toBeInTheDocument()
    })
    expect(getByText('One')).toBeInTheDocument()
    expect(getByText('Two')).toBeInTheDocument()
  })
})
