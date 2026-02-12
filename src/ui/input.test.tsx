import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/ui/input'

describe('Input', () => {
  it('renders input element', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter text" />)
    expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('accepts and displays value', () => {
    const { getByDisplayValue } = render(<Input defaultValue="Hello" />)
    expect(getByDisplayValue('Hello')).toBeInTheDocument()
  })

  it('handles controlled value', async () => {
    const user = userEvent.setup()
    const onChange = mock(() => {})
    const { getByDisplayValue } = render(<Input value="test" onChange={onChange} />)

    const input = getByDisplayValue('test')
    await user.type(input, 'x')
    expect(onChange).toHaveBeenCalled()
  })

  it('applies size sm', () => {
    const { getByPlaceholderText } = render(<Input inputSize="sm" placeholder="small" />)
    const input = getByPlaceholderText('small')
    expect(input).toHaveClass('h-8')
    expect(input).toHaveClass('text-sm')
  })

  it('applies size md by default', () => {
    const { getByPlaceholderText } = render(<Input placeholder="medium" />)
    const input = getByPlaceholderText('medium')
    expect(input).toHaveClass('h-10')
    expect(input).toHaveClass('text-base')
  })

  it('applies size lg', () => {
    const { getByPlaceholderText } = render(<Input inputSize="lg" placeholder="large" />)
    const input = getByPlaceholderText('large')
    expect(input).toHaveClass('h-12')
    expect(input).toHaveClass('text-lg')
  })

  it('renders error state', () => {
    const { getByPlaceholderText } = render(<Input error placeholder="error" />)
    const input = getByPlaceholderText('error')
    expect(input).toHaveClass('border-error')
  })

  it('renders disabled state', () => {
    const { getByPlaceholderText } = render(<Input disabled placeholder="disabled" />)
    const input = getByPlaceholderText('disabled')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('accepts custom className', () => {
    const { getByPlaceholderText } = render(<Input className="custom-input" placeholder="custom" />)
    expect(getByPlaceholderText('custom')).toHaveClass('custom-input')
  })

  it('supports different input types', () => {
    const { getByPlaceholderText } = render(<Input type="password" placeholder="password" />)
    expect(getByPlaceholderText('password')).toHaveAttribute('type', 'password')
  })

  it('forwards ref correctly', () => {
    const ref = mock(() => {})
    render(<Input ref={ref} placeholder="ref test" />)
    expect(ref).toHaveBeenCalled()
  })
})
