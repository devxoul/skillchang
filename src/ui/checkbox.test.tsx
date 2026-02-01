import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox, CheckboxRoot, CheckboxIndicator } from '@/ui/checkbox'

describe('Checkbox', () => {
  it('renders checkbox', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('toggles checked state on click', () => {
    render(<Checkbox label="Toggle me" />)
    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('supports controlled checked state', () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />)

    fireEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalled()
    expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true)
  })

  it('renders with defaultChecked', () => {
    render(<Checkbox defaultChecked />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('renders disabled state', () => {
    render(<Checkbox disabled label="Disabled" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-disabled', 'true')
  })

  it('accepts custom className', () => {
    render(<Checkbox className="custom-checkbox" />)
    expect(screen.getByRole('checkbox')).toHaveClass('custom-checkbox')
  })

  it('renders using composition pattern', () => {
    render(
      <CheckboxRoot defaultChecked>
        <CheckboxIndicator />
      </CheckboxRoot>,
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('clicking label toggles checkbox', () => {
    render(<Checkbox label="Click label" />)
    const label = screen.getByText('Click label')

    fireEvent.click(label)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
