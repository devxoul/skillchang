import { InlineError } from '@/components/inline-error'
import { SearchInput } from '@/components/search-input'
import { SkillCard } from '@/components/skill-card'
import { Button } from '@/components/ui/button'
import { fetchSkills } from '@/lib/api'
import type { Skill } from '@/types/skill'
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
    <div className="flex h-full flex-col gap-6 overflow-hidden p-6">
      <div className="flex-none">
        <h1 className="text-2xl font-bold">Skill Gallery</h1>
        <p className="mt-1 text-muted-foreground">Browse and discover available skills</p>
      </div>

      <div className="flex-none">
        <SearchInput onSearch={handleSearch} placeholder="Search skills..." />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {error ? (
          <InlineError
            message={error}
            onRetry={() => {
              setInternalError(null)
              setCurrentPage(1)
            }}
          />
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading skills...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'No skills match your search' : 'No skills available'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 pb-6">
            <div className="grid gap-4">
              {filteredSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>

            {hasMore && !searchQuery && (
              <div className="flex justify-center pt-4">
                <Button variant="secondary" onClick={handleLoadMore}>
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
