import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import { Skeleton } from '@/ui/skeleton'

describe('Skeleton', () => {
  it('renders a div element', () => {
    const { container } = render(<Skeleton />)
    const div = container.querySelector('div')
    expect(div).toBeInTheDocument()
  })

  it('has the base shimmer classes', () => {
    const { container } = render(<Skeleton />)
    const div = container.querySelector('div')
    expect(div).toHaveClass('animate-shimmer')
    expect(div).toHaveClass('rounded')
    expect(div).toHaveClass('bg-foreground/[0.06]')
  })

  it('accepts and merges custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />)
    const div = container.querySelector('div')
    expect(div).toHaveClass('h-4')
    expect(div).toHaveClass('w-32')
    expect(div).toHaveClass('animate-shimmer')
  })

  it('forwards ref to the div element', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Skeleton ref={ref} />)
    expect(ref.current).toBeInTheDocument()
  })

  it('has aria-hidden="true"', () => {
    const { container } = render(<Skeleton />)
    const div = container.querySelector('div')
    expect(div).toHaveAttribute('aria-hidden', 'true')
  })

  it('passes through standard HTML attributes', () => {
    const { container } = render(<Skeleton data-testid="skeleton-loader" />)
    const div = container.querySelector('div')
    expect(div).toHaveAttribute('data-testid', 'skeleton-loader')
  })
})
