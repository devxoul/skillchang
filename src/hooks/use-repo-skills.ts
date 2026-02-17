import { useEffect, useState } from 'react'
import { fetchRepoSkills, isRepoQuery } from '@/lib/api'
import { ApiError } from '@/types/api'
import type { Skill } from '@/types/skill'

const CACHE_DURATION = 5 * 60 * 1000

interface CacheEntry {
  skills: Skill[]
  fetchedAt: number
}

// Module-level cache — persists across renders, cleared on page refresh
const repoSkillsCache = new Map<string, CacheEntry>()

export function getRepoSkillsCache(): Map<string, CacheEntry> {
  return repoSkillsCache
}

interface RepoSkillsState {
  skills: Skill[]
  loading: boolean
  error: string | null
  repoQuery: string | null
}

export function useRepoSkills(searchQuery: string): RepoSkillsState {
  const [state, setState] = useState<RepoSkillsState>({
    skills: [],
    loading: false,
    error: null,
    repoQuery: null,
  })

  useEffect(() => {
    const trimmed = searchQuery.trim()

    if (!isRepoQuery(trimmed)) {
      setState({ skills: [], loading: false, error: null, repoQuery: null })
      return
    }

    const [owner, repo] = trimmed.split('/')
    if (!owner || !repo) return

    // Check cache
    const cached = repoSkillsCache.get(trimmed)
    if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
      setState({ skills: cached.skills, loading: false, error: null, repoQuery: trimmed })
      return
    }

    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null, repoQuery: trimmed }))

    fetchRepoSkills(owner, repo)
      .then((skills) => {
        if (!cancelled) {
          repoSkillsCache.set(trimmed, { skills, fetchedAt: Date.now() })
          setState({ skills, loading: false, error: null, repoQuery: trimmed })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const errorMessage =
            err instanceof ApiError && err.status === 403
              ? 'GitHub API rate limit exceeded. Try again later.'
              : 'Failed to fetch repository skills'
          setState({ skills: [], loading: false, error: errorMessage, repoQuery: trimmed })
        }
      })

    return () => {
      cancelled = true
    }
  }, [searchQuery])

  return state
}
