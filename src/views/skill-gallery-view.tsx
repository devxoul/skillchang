import { InlineError } from '@/components/inline-error'
import { SearchInput } from '@/components/search-input'
import { SkillCard } from '@/components/skill-card'
import { fetchSkills } from '@/lib/api'
import type { Skill } from '@/types/skill'
import { SpinnerGap } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'

interface SkillGalleryViewProps {
  initialSkills?: Skill[]
  loading?: boolean
  error?: string | null
}

export function SkillGalleryView({
  initialSkills = [],
  loading: propLoading,
  error: propError,
}: SkillGalleryViewProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [internalLoading, setInternalLoading] = useState(false)
  const [internalError, setInternalError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const loading = propLoading ?? internalLoading
  const error = propError ?? internalError

  useEffect(() => {
    if (initialSkills.length > 0) {
      setSkills(initialSkills)
      setInternalLoading(false)
      return
    }

    let cancelled = false

    const loadSkills = async () => {
      setInternalLoading(true)
      setInternalError(null)
      try {
        const response = await fetchSkills(currentPage)
        if (!cancelled) {
          setSkills(response.skills)
          setHasMore(response.hasMore)
        }
      } catch (err) {
        if (!cancelled) {
          setInternalError(err instanceof Error ? err.message : 'Failed to load skills')
          setSkills([])
          setHasMore(false)
        }
      } finally {
        if (!cancelled) {
          setInternalLoading(false)
        }
      }
    }

    loadSkills()

    return () => {
      cancelled = true
    }
  }, [initialSkills.length, currentPage])

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) {
      return skills
    }

    const query = searchQuery.toLowerCase()
    return skills.filter((skill) => skill.name.toLowerCase().includes(query))
  }, [skills, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-white/[0.06] px-5 py-4">
        <h1 className="text-[15px] font-semibold text-foreground">Gallery</h1>
        <p className="mt-0.5 text-[12px] text-foreground/40">
          Browse and discover available skills
        </p>
      </header>

      <div className="shrink-0 px-4 py-3">
        <SearchInput onSearch={handleSearch} placeholder="Search skills..." />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        {error ? (
          <div className="p-4">
            <InlineError
              message={error}
              onRetry={() => {
                setInternalError(null)
                setCurrentPage(1)
              }}
            />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <SpinnerGap size={24} className="animate-spin text-foreground/30" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[13px] text-foreground/40">
              {searchQuery ? 'No skills match your search' : 'No skills available'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 pb-4">
            {filteredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}

            {hasMore && !searchQuery && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="rounded-md px-3 py-1.5 text-[12px] font-medium text-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-foreground/70"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
