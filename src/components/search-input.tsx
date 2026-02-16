import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { forwardRef, useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

interface SearchInputProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
  defaultValue?: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { placeholder = 'Search...', onSearch, debounceMs = 300, defaultValue = '' },
  ref,
) {
  const [query, setQuery] = useState(defaultValue)
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
      <MagnifyingGlass
        size={14}
        weight="bold"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-foreground/30"
      />
      <input
        ref={ref}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg bg-overlay-6 py-2 pr-8 pl-8 text-[13px] text-foreground transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] placeholder:text-foreground/30 hover:bg-overlay-8 focus:bg-overlay-8 focus:ring-1 focus:ring-overlay-ring focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-foreground/30 transition-colors hover:text-foreground/60"
          aria-label="Clear search"
        >
          <X size={14} weight="bold" />
        </button>
      )}
    </div>
  )
})
