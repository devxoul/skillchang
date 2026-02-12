import { describe, expect, it } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchInput } from '@/components/search-input'

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    const onSearch = () => {}
    const { getByPlaceholderText } = render(<SearchInput placeholder="Test placeholder" onSearch={onSearch} />)

    expect(getByPlaceholderText('Test placeholder')).toBeDefined()
  })

  it('debounces onSearch callback', async () => {
    const user = userEvent.setup({ delay: null })
    let lastCall: string | undefined
    const onSearch = (value: string) => {
      lastCall = value
    }
    const { getByPlaceholderText } = render(<SearchInput onSearch={onSearch} debounceMs={1} />)

    const input = getByPlaceholderText('Search...')

    await waitFor(() => {
      expect(lastCall).toBe('')
    })
    lastCall = undefined

    await user.type(input, 'react')

    await waitFor(() => {
      expect(lastCall).toBe('react')
    })
  })

  it('calls onSearch with debounced value after delay', async () => {
    const user = userEvent.setup({ delay: null })
    let calls: string[] = []
    const onSearch = (value: string) => {
      calls.push(value)
    }
    const { getByPlaceholderText } = render(<SearchInput onSearch={onSearch} debounceMs={1} />)

    const input = getByPlaceholderText('Search...')

    await waitFor(() => {
      expect(calls).toContain('')
    })
    calls = []

    await user.type(input, 'rea')

    await waitFor(() => {
      expect(calls).toContain('rea')
    })
  })

  it('shows clear button when input has value', async () => {
    const user = userEvent.setup({ delay: null })
    const onSearch = () => {}
    const { getByPlaceholderText, queryByLabelText, getByLabelText } = render(
      <SearchInput onSearch={onSearch} debounceMs={1} />,
    )

    const input = getByPlaceholderText('Search...')

    expect(queryByLabelText('Clear search')).toBeNull()

    await user.type(input, 'test')

    await waitFor(() => {
      expect(getByLabelText('Clear search')).toBeDefined()
    })
  })

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup({ delay: null })
    let lastCall: string | undefined
    const onSearch = (value: string) => {
      lastCall = value
    }
    const { getByPlaceholderText, getByLabelText } = render(<SearchInput onSearch={onSearch} debounceMs={1} />)

    const input = getByPlaceholderText('Search...') as HTMLInputElement

    await user.type(input, 'test')

    await waitFor(() => {
      expect(getByLabelText('Clear search')).toBeDefined()
    })

    await user.click(getByLabelText('Clear search'))

    expect(input.value).toBe('')

    await waitFor(() => {
      expect(lastCall).toBe('')
    })
  })

  it('clears search when Escape key is pressed', async () => {
    const user = userEvent.setup({ delay: null })
    let lastCall: string | undefined
    const onSearch = (value: string) => {
      lastCall = value
    }
    const { getByPlaceholderText } = render(<SearchInput onSearch={onSearch} debounceMs={1} />)

    const input = getByPlaceholderText('Search...') as HTMLInputElement

    await user.type(input, 'test')

    await waitFor(() => {
      expect(lastCall).toBe('test')
    })

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(input.value).toBe('')

    await waitFor(() => {
      expect(lastCall).toBe('')
    })
  })

  it('respects custom debounce delay', async () => {
    const user = userEvent.setup({ delay: null })
    let lastCall: string | undefined
    const onSearch = (value: string) => {
      lastCall = value
    }
    const { getByPlaceholderText } = render(<SearchInput onSearch={onSearch} debounceMs={50} />)

    const input = getByPlaceholderText('Search...')

    await waitFor(() => {
      expect(lastCall).toBe('')
    })
    lastCall = undefined

    await user.type(input, 'test')

    // Not fired immediately (debounce is 50ms, not 1ms)
    expect(lastCall).toBeUndefined()

    await waitFor(() => {
      expect(lastCall).toBe('test')
    })
  })
})
