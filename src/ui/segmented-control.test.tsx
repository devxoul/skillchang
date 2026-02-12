import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { SegmentedControl } from './segmented-control'

const options = [
  { value: 'global', label: 'Global' },
  { value: 'project', label: 'Project' },
]

describe('SegmentedControl', () => {
  it('renders all options', () => {
    render(<SegmentedControl options={options} aria-label="Scope" />)

    expect(screen.getByRole('radio', { name: 'Global' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Project' })).toBeInTheDocument()
  })

  it('supports defaultValue', () => {
    render(<SegmentedControl options={options} defaultValue="project" aria-label="Scope" />)

    expect(screen.getByRole('radio', { name: 'Project' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Global' })).not.toBeChecked()
  })

  it('supports controlled value', () => {
    render(<SegmentedControl options={options} value="global" aria-label="Scope" />)

    expect(screen.getByRole('radio', { name: 'Global' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Project' })).not.toBeChecked()
  })

  it('calls onValueChange when selection changes', () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl options={options} defaultValue="global" onValueChange={onValueChange} aria-label="Scope" />,
    )

    fireEvent.click(screen.getByRole('radio', { name: 'Project' }))

    expect(onValueChange).toHaveBeenCalledWith('project')
  })

  it('works as controlled component', () => {
    function ControlledTest() {
      const [value, setValue] = useState('global')
      return <SegmentedControl options={options} value={value} onValueChange={setValue} aria-label="Scope" />
    }

    render(<ControlledTest />)

    expect(screen.getByRole('radio', { name: 'Global' })).toBeChecked()

    fireEvent.click(screen.getByRole('radio', { name: 'Project' }))

    expect(screen.getByRole('radio', { name: 'Project' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Global' })).not.toBeChecked()
  })

  it('supports disabled state', () => {
    render(<SegmentedControl options={options} disabled aria-label="Scope" />)

    const globalOption = screen.getByRole('radio', { name: 'Global' })
    expect(globalOption).toHaveAttribute('data-disabled', '')
  })

  it('accepts custom className', () => {
    render(<SegmentedControl options={options} className="custom-class" aria-label="Scope" />)

    expect(screen.getByRole('radiogroup')).toHaveClass('custom-class')
  })

  it('supports keyboard navigation via tab to radiogroup', () => {
    render(<SegmentedControl options={options} defaultValue="global" aria-label="Scope" />)

    const globalOption = screen.getByRole('radio', { name: 'Global' })
    globalOption.focus()

    expect(globalOption).toHaveFocus()
  })

  it('renders with three options', () => {
    const threeOptions = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
      { value: 'c', label: 'Option C' },
    ]

    render(<SegmentedControl options={threeOptions} aria-label="Options" />)

    expect(screen.getByRole('radio', { name: 'Option A' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Option B' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Option C' })).toBeInTheDocument()
  })
})
