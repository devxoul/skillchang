import { useState, useEffect, forwardRef } from 'react'
import { Input } from './ui/Input'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

interface SearchInputProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { placeholder = 'Search skills...', onSearch, debounceMs = 300 },
  ref,
) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, debounceMs)

  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  const handleClear = () => {
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className="relative">
      <Input
        ref={ref}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pr-8"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  )
})
