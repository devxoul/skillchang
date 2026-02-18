import { describe, expect, it, mock } from 'bun:test'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox, CheckboxIndicator, CheckboxRoot } from '@/ui/checkbox'

describe('Checkbox', () => {
  it('renders checkbox', () => {
    const { getByRole } = render(<Checkbox />)
    expect(getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders with label', () => {
    const { getByRole, getByText } = render(<Checkbox label="Accept terms" />)
    expect(getByText('Accept terms')).toBeInTheDocument()
    expect(getByRole('checkbox')).toBeInTheDocument()
  })

  it('toggles checked state on click', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<Checkbox label="Toggle me" />)
    const checkbox = getByRole('checkbox')

    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('supports controlled checked state', async () => {
    const user = userEvent.setup()
    const onCheckedChange = mock((_checked: boolean) => {})
    const { getByRole } = render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />)

    await user.click(getByRole('checkbox'))
    // Base UI calls onCheckedChange(checked, event) where event contains
    // a cyclic React event. toHaveBeenCalledWith deep-compares all args,
    // hanging bun test on the cyclic structure.
    expect(onCheckedChange.mock.calls[0][0]).toBe(true)
  })

  it('renders with defaultChecked', () => {
    const { getByRole } = render(<Checkbox defaultChecked />)
    expect(getByRole('checkbox')).toBeChecked()
  })

  it('renders disabled state', () => {
    const { getByRole } = render(<Checkbox disabled label="Disabled" />)
    const checkbox = getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-disabled', 'true')
  })

  it('accepts custom className', () => {
    const { getByRole } = render(<Checkbox className="custom-checkbox" />)
    expect(getByRole('checkbox')).toHaveClass('custom-checkbox')
  })

  it('renders using composition pattern', () => {
    const { getByRole } = render(
      <CheckboxRoot defaultChecked>
        <CheckboxIndicator />
      </CheckboxRoot>,
    )
    expect(getByRole('checkbox')).toBeChecked()
  })

  it('clicking label toggles checkbox', async () => {
    const user = userEvent.setup()
    const { getByRole, getByText } = render(<Checkbox label="Click label" />)
    const label = getByText('Click label')

    await user.click(label)
    expect(getByRole('checkbox')).toBeChecked()
  })
})
