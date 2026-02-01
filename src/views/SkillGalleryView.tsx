import { useState, useMemo, useEffect } from 'react'
import { SearchInput } from '@/components/SearchInput'
import { SkillCard } from '@/components/SkillCard'
import { Button } from '@/components/ui/Button'
import type { Skill } from '@/types/skill'

interface SkillGalleryViewProps {
  initialSkills?: Skill[]
  loading?: boolean
  error?: string | null
}

export function SkillGalleryView({ 
  initialSkills = [],
  loading: propLoading,
  error: propError
}: SkillGalleryViewProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [internalLoading, setInternalLoading] = useState(false)
  const [internalError, setInternalError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasMore, setHasMore] = useState(false)

  const loading = propLoading ?? internalLoading
  const error = propError ?? internalError

  useEffect(() => {
    if (initialSkills.length > 0) {
      setSkills(initialSkills)
      setInternalLoading(false)
      return
    }

    // TODO: Connect to API service (Task 13)
    // For now, assume empty state or handle loading
    // We set loading false immediately for now as we have no API
    setInternalLoading(false)
    setSkills([])
    setHasMore(false)
  }, [initialSkills])

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

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-none">
        <h1 className="text-2xl font-bold">Skill Gallery</h1>
        <p className="mt-1 text-muted-foreground">
          Browse and discover available skills
        </p>
      </div>

      <div className="flex-none">
        <SearchInput onSearch={handleSearch} placeholder="Search skills..." />
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {error ? (
          <div className="rounded-md bg-error/10 p-4 text-error">
            <p className="font-medium">Error loading skills</p>
            <p className="text-sm">{error}</p>
          </div>
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
                <Button variant="secondary">Load More</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
