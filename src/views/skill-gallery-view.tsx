import { ArrowClockwise, Books } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { InlineError } from '@/components/inline-error'
import { SearchInput } from '@/components/search-input'
import { SkillCard } from '@/components/skill-card'
import { SkillCardSkeleton } from '@/components/skill-card-skeleton'
import { useGallerySkills } from '@/contexts/skills-context'
import { usePersistedSearch } from '@/hooks/use-persisted-search'
import { useRepoSkills } from '@/hooks/use-repo-skills'
import { useScrollRestoration } from '@/hooks/use-scroll-restoration'
import type { Skill } from '@/types/skill'

export function SkillGalleryView() {
  const { skills, loading, error, refresh, fetch, search, searchCache, setSearchCache } = useGallerySkills()
  const [searchQuery, setSearchQuery] = usePersistedSearch()
  const scrollRef = useScrollRestoration<HTMLDivElement>()
  const [searchResults, setSearchResults] = useState<Skill[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const repoSkills = useRepoSkills(searchQuery)
  const skillsRef = useRef(skills)
  skillsRef.current = skills

  useEffect(() => {
    fetch()
  }, [fetch])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (!trimmed) {
      setSearchResults([])
      setSearching(false)
      setSearchError(null)
      return
    }

    if (trimmed.length < 2) {
      const query = trimmed.toLowerCase()
      setSearchResults(skillsRef.current.filter((s) => s.name.toLowerCase().includes(query)))
      setSearching(false)
      setSearchError(null)
      return
    }

    const cached = searchCache[trimmed]
    if (cached) {
      setSearchResults(cached)
      setSearching(false)
      setSearchError(null)
      return
    }

    let cancelled = false
    setSearching(true)
    setSearchError(null)

    search(searchQuery)
      .then((results: Skill[]) => {
        if (!cancelled) {
          setSearchCache(trimmed, results)
          setSearchResults(results)
          setSearching(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSearchError(err instanceof Error ? err.message : 'Search failed')
          setSearchResults([])
          setSearching(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [searchQuery, search, searchCache, setSearchCache])

  const displayedSkills = searchQuery.trim() ? searchResults : skills

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-overlay-border-muted px-5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Books size={18} weight="duotone" className="text-foreground/50" />
            <h1 className="text-[15px] font-semibold text-foreground">Skills Directory</h1>
          </div>
          <p className="mt-0.5 text-[12px] text-foreground/40">Browse and discover available skills</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="cursor-pointer rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-overlay-6 hover:text-foreground/70 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Refresh"
        >
          <ArrowClockwise size={16} weight="bold" className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="shrink-0 px-4 py-3">
        <SearchInput onSearch={setSearchQuery} defaultValue={searchQuery} placeholder="Search skills..." />
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-2">
        {repoSkills.repoQuery && (
          <div className="pb-2">
            <h3 className="px-3 pt-3 pb-2 text-[11px] font-medium tracking-wide text-foreground/40 uppercase">
              Skills in {repoSkills.repoQuery}
            </h3>
            {repoSkills.loading ? (
              <div className="space-y-0.5">
                <SkillCardSkeleton />
                <SkillCardSkeleton />
              </div>
            ) : repoSkills.error ? (
              <div className="px-2 pb-2">
                <InlineError message={repoSkills.error} />
              </div>
            ) : repoSkills.skills.length === 0 ? (
              <p className="px-3 pb-3 text-[13px] text-foreground/40">No skills found in this repository</p>
            ) : (
              <div className="space-y-0.5">
                {repoSkills.skills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            )}
            <div className="mx-3 my-2 h-px bg-foreground/[0.06]" />
          </div>
        )}
        {error ? (
          <div className="p-4">
            <InlineError message={error} onRetry={refresh} />
          </div>
        ) : searchError ? (
          <div className="p-4">
            <InlineError
              message={searchError}
              onRetry={() => {
                setSearchError(null)
                setSearching(true)
                search(searchQuery)
                  .then((results: Skill[]) => {
                    setSearchResults(results)
                    setSearching(false)
                  })
                  .catch((err: unknown) => {
                    setSearchError(err instanceof Error ? err.message : 'Search failed')
                    setSearchResults([])
                    setSearching(false)
                  })
              }}
            />
          </div>
        ) : (loading && skills.length === 0) || searching ? (
          <div className="space-y-0.5 pb-4">
            <SkillCardSkeleton />
            <SkillCardSkeleton />
            <SkillCardSkeleton />
            <SkillCardSkeleton />
            <SkillCardSkeleton />
            <SkillCardSkeleton />
          </div>
        ) : displayedSkills.length === 0 && !repoSkills.repoQuery ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[13px] text-foreground/40">
              {searchQuery ? 'No skills match your search' : 'No skills available'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 pb-4">
            {displayedSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
