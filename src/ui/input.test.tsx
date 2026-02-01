import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/ui/input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('accepts and displays value', () => {
    render(<Input defaultValue="Hello" />)
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument()
  })

  it('handles controlled value', () => {
    const onChange = vi.fn()
    render(<Input value="test" onChange={onChange} />)

    const input = screen.getByDisplayValue('test')
    fireEvent.change(input, { target: { value: 'new value' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('applies size sm', () => {
    render(<Input inputSize="sm" placeholder="small" />)
    const input = screen.getByPlaceholderText('small')
    expect(input).toHaveClass('h-8')
    expect(input).toHaveClass('text-sm')
  })

  it('applies size md by default', () => {
    render(<Input placeholder="medium" />)
    const input = screen.getByPlaceholderText('medium')
    expect(input).toHaveClass('h-10')
    expect(input).toHaveClass('text-base')
  })

  it('applies size lg', () => {
    render(<Input inputSize="lg" placeholder="large" />)
    const input = screen.getByPlaceholderText('large')
    expect(input).toHaveClass('h-12')
    expect(input).toHaveClass('text-lg')
  })

  it('renders error state', () => {
    render(<Input error placeholder="error" />)
    const input = screen.getByPlaceholderText('error')
    expect(input).toHaveClass('border-error')
  })

  it('renders disabled state', () => {
    render(<Input disabled placeholder="disabled" />)
    const input = screen.getByPlaceholderText('disabled')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('accepts custom className', () => {
    render(<Input className="custom-input" placeholder="custom" />)
    expect(screen.getByPlaceholderText('custom')).toHaveClass('custom-input')
  })

  it('supports different input types', () => {
    render(<Input type="password" placeholder="password" />)
    expect(screen.getByPlaceholderText('password')).toHaveAttribute('type', 'password')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Input ref={ref} placeholder="ref test" />)
    expect(ref).toHaveBeenCalled()
  })
})
