import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { forwardRef, useEffect, useState } from 'react'

interface SearchInputProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { placeholder = 'Search...', onSearch, debounceMs = 300 },
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
      <MagnifyingGlass
        size={14}
        weight="bold"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30"
      />
      <input
        ref={ref}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg bg-white/[0.06] py-2 pl-8 pr-8 text-[13px] text-foreground placeholder:text-foreground/30 transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/[0.08] focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-white/[0.15]"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-foreground/30 transition-colors hover:text-foreground/60"
          aria-label="Clear search"
        >
          <X size={14} weight="bold" />
        </button>
      )}
    </div>
  )
})
