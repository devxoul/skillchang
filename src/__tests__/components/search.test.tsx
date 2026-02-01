import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchInput } from '@/components/SearchInput'

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with placeholder', () => {
    const onSearch = vi.fn()
    render(
      <SearchInput
        placeholder="Test placeholder"
        onSearch={onSearch}
      />
    )

    const input = screen.getByPlaceholderText('Test placeholder')
    expect(input).toBeInTheDocument()
  })

  it('debounces onSearch callback by 300ms', async () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} debounceMs={300} />)

    const input = screen.getByPlaceholderText('Search skills...')

    onSearch.mockClear()

    fireEvent.change(input, { target: { value: 'react' } })

    expect(onSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(onSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onSearch).toHaveBeenCalledWith('react')
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('calls onSearch with debounced value after delay', async () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} debounceMs={300} />)

    const input = screen.getByPlaceholderText('Search skills...')

    onSearch.mockClear()

    fireEvent.change(input, { target: { value: 'r' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    fireEvent.change(input, { target: { value: 're' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    fireEvent.change(input, { target: { value: 'rea' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(onSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onSearch).toHaveBeenCalledWith('rea')
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('shows clear button when input has value', async () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} />)

    const input = screen.getByPlaceholderText('Search skills...')

    // Initially no clear button
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()

    // Type something
    fireEvent.change(input, { target: { value: 'test' } })

    // Clear button should appear
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', async () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} />)

    const input = screen.getByPlaceholderText('Search skills...') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'test' } })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(input.value).toBe('test')

    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)

    expect(input.value).toBe('')

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('clears search when Escape key is pressed', async () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} />)

    const input = screen.getByPlaceholderText('Search skills...') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'test' } })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(input.value).toBe('test')

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(input.value).toBe('')

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('respects custom debounce delay', async () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} debounceMs={500} />)

    const input = screen.getByPlaceholderText('Search skills...')

    onSearch.mockClear()

    fireEvent.change(input, { target: { value: 'test' } })

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(onSearch).toHaveBeenCalledWith('test')
  })
})
