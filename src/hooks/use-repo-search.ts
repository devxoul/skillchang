import { useEffect, useState } from 'react'

import { isRepoQuery, isSkillPathQuery, resolveSourceAlias, searchReposByName } from '@/lib/api'
import { ApiError } from '@/types/api'
import type { Skill } from '@/types/skill'

const CACHE_DURATION = 5 * 60 * 1000

interface CacheEntry {
  skills: Skill[]
  fetchedAt: number
}

const repoSearchCache = new Map<string, CacheEntry>()

export function getRepoSearchCache(): Map<string, CacheEntry> {
  return repoSearchCache
}

interface RepoSearchState {
  skills: Skill[]
  loading: boolean
  error: string | null
}

export function useRepoSearch(searchQuery: string, skillSearchEmpty: boolean): RepoSearchState {
  const [state, setState] = useState<RepoSearchState>({
    skills: [],
    loading: false,
    error: null,
  })

  useEffect(() => {
    const trimmed = searchQuery.trim()

    const aliased = resolveSourceAlias(trimmed)
    if (!trimmed || trimmed.length < 2 || isRepoQuery(trimmed) || isSkillPathQuery(trimmed) || aliased !== trimmed) {
      setState({ skills: [], loading: false, error: null })
      return
    }

    if (!skillSearchEmpty) {
      setState({ skills: [], loading: false, error: null })
      return
    }

    const cached = repoSearchCache.get(trimmed)
    if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
      setState({ skills: cached.skills, loading: false, error: null })
      return
    }

    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    searchReposByName(trimmed)
      .then((skills) => {
        if (!cancelled) {
          repoSearchCache.set(trimmed, { skills, fetchedAt: Date.now() })
          setState({ skills, loading: false, error: null })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const errorMessage =
            err instanceof ApiError && err.status === 403
              ? 'GitHub API rate limit exceeded. Try again later.'
              : 'Failed to search GitHub repositories'
          setState({ skills: [], loading: false, error: errorMessage })
        }
      })

    return () => {
      cancelled = true
    }
  }, [searchQuery, skillSearchEmpty])

  return state
}
