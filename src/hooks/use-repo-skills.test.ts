import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { act, renderHook } from '@testing-library/react'
import { ApiError } from '@/types/api'

// Mock the api module before importing the hook
const mockFetchRepoSkills = mock(async (_owner: string, _repo: string) => [] as any[])
const mockIsRepoQuery = mock((_query: string) => false)

mock.module('@/lib/api', () => ({
  fetchRepoSkills: async (owner: string, repo: string) => mockFetchRepoSkills(owner, repo),
  isRepoQuery: (query: string) => mockIsRepoQuery(query),
  fetchSkills: async () => [],
  searchSkills: async () => [],
  fetchSkillReadme: async () => '',
}))

// Import AFTER mocks
import { getRepoSkillsCache, useRepoSkills } from './use-repo-skills'

const mockSkills = [
  { id: 'repo:xoul/skills:git-master', name: 'git-master', installs: 0, topSource: 'xoul/skills' },
  { id: 'repo:xoul/skills:frontend', name: 'frontend', installs: 0, topSource: 'xoul/skills' },
]

beforeEach(() => {
  mockFetchRepoSkills.mockClear()
  mockIsRepoQuery.mockClear()
  // Clear module-level cache between tests
  getRepoSkillsCache().clear()
})

afterEach(() => {
  getRepoSkillsCache().clear()
})

describe('useRepoSkills', () => {
  it('returns empty/null state for non-repo query', async () => {
    // given
    mockIsRepoQuery.mockReturnValue(false)

    // when
    const { result } = renderHook(() => useRepoSkills('git'))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    // then
    expect(result.current.skills).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.repoQuery).toBeNull()
    expect(mockFetchRepoSkills).not.toHaveBeenCalled()
  })

  it('fetches skills for valid repo query', async () => {
    // given
    mockIsRepoQuery.mockReturnValue(true)
    mockFetchRepoSkills.mockResolvedValue(mockSkills)

    // when
    const { result } = renderHook(() => useRepoSkills('xoul/skills'))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    // then
    expect(result.current.skills).toEqual(mockSkills)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.repoQuery).toBe('xoul/skills')
    expect(mockFetchRepoSkills).toHaveBeenCalledWith('xoul', 'skills')
  })

  it('uses cache on second render with same query', async () => {
    // given
    mockIsRepoQuery.mockReturnValue(true)
    mockFetchRepoSkills.mockResolvedValue(mockSkills)

    // when - first render fetches
    const { result, rerender } = renderHook(({ query }) => useRepoSkills(query), {
      initialProps: { query: 'xoul/skills' },
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(mockFetchRepoSkills).toHaveBeenCalledTimes(1)

    // when - rerender with same query uses cache
    rerender({ query: 'xoul/skills' })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    // then - fetch called only once (cache hit on second render)
    expect(mockFetchRepoSkills).toHaveBeenCalledTimes(1)
    expect(result.current.skills).toEqual(mockSkills)
  })

  it('refetches when cache is expired', async () => {
    // given - pre-populate cache with expired entry
    mockIsRepoQuery.mockReturnValue(true)
    mockFetchRepoSkills.mockResolvedValue(mockSkills)

    const expiredEntry = {
      skills: mockSkills,
      fetchedAt: Date.now() - 6 * 60 * 1000, // 6 minutes ago (past 5-min TTL)
    }
    getRepoSkillsCache().set('xoul/skills', expiredEntry)

    // when
    const { result } = renderHook(() => useRepoSkills('xoul/skills'))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    // then - fetch was called because cache expired
    expect(mockFetchRepoSkills).toHaveBeenCalledTimes(1)
    expect(result.current.skills).toEqual(mockSkills)
  })

  it('does not refetch when cache is still valid', async () => {
    // given - pre-populate cache with fresh entry
    mockIsRepoQuery.mockReturnValue(true)

    const freshEntry = {
      skills: mockSkills,
      fetchedAt: Date.now() - 1 * 60 * 1000, // 1 minute ago (within 5-min TTL)
    }
    getRepoSkillsCache().set('xoul/skills', freshEntry)

    // when
    const { result } = renderHook(() => useRepoSkills('xoul/skills'))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    // then - no fetch, served from cache
    expect(mockFetchRepoSkills).not.toHaveBeenCalled()
    expect(result.current.skills).toEqual(mockSkills)
    expect(result.current.repoQuery).toBe('xoul/skills')
  })

  it('shows rate limit message on 403 error', async () => {
    // given
    mockIsRepoQuery.mockReturnValue(true)
    mockFetchRepoSkills.mockRejectedValue(new ApiError('GitHub API rate limit exceeded', 403))

    // when
    const { result } = renderHook(() => useRepoSkills('xoul/skills'))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    // then
    expect(result.current.skills).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('GitHub API rate limit exceeded. Try again later.')
    expect(result.current.repoQuery).toBe('xoul/skills')
  })

  it('shows generic error message on non-403 errors', async () => {
    // given
    mockIsRepoQuery.mockReturnValue(true)
    mockFetchRepoSkills.mockRejectedValue(new Error('Network error'))

    // when
    const { result } = renderHook(() => useRepoSkills('xoul/skills'))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    // then
    expect(result.current.skills).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Failed to fetch repository skills')
  })

  it('shows generic error message on ApiError with non-403 status', async () => {
    // given
    mockIsRepoQuery.mockReturnValue(true)
    mockFetchRepoSkills.mockRejectedValue(new ApiError('Server error', 500))

    // when
    const { result } = renderHook(() => useRepoSkills('xoul/skills'))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    // then
    expect(result.current.error).toBe('Failed to fetch repository skills')
  })

  it('cancels stale update when query changes during fetch', async () => {
    // given - first query is slow
    let resolveFirst: (skills: any[]) => void
    const firstFetchPromise = new Promise<any[]>((resolve) => {
      resolveFirst = resolve
    })

    mockIsRepoQuery.mockReturnValue(true)
    mockFetchRepoSkills
      .mockImplementationOnce(async () => firstFetchPromise)
      .mockResolvedValue([{ id: 'repo:other/repo:skill', name: 'skill', installs: 0, topSource: 'other/repo' }])

    // when - render with first query
    const { result, rerender } = renderHook(({ query }) => useRepoSkills(query), {
      initialProps: { query: 'xoul/skills' },
    })

    // when - change query before first fetch resolves
    rerender({ query: 'other/repo' })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20))
    })

    // when - resolve the first (now stale) fetch
    await act(async () => {
      resolveFirst!(mockSkills)
      await new Promise((r) => setTimeout(r, 50))
    })

    // then - state reflects second query, not first
    expect(result.current.repoQuery).toBe('other/repo')
    expect(result.current.skills).not.toEqual(mockSkills)
  })

  it('getRepoSkillsCache returns the module-level cache Map', () => {
    const cache = getRepoSkillsCache()
    expect(cache).toBeInstanceOf(Map)

    // Verify it's the same reference
    const entry = { skills: mockSkills, fetchedAt: Date.now() }
    cache.set('test/repo', entry)
    expect(getRepoSkillsCache().get('test/repo')).toBe(entry)
  })

  it('sets loading: true while fetching', async () => {
    // given - slow fetch
    let resolveFetch: (skills: any[]) => void
    const fetchPromise = new Promise<any[]>((resolve) => {
      resolveFetch = resolve
    })

    mockIsRepoQuery.mockReturnValue(true)
    mockFetchRepoSkills.mockImplementationOnce(async () => fetchPromise)

    // when
    const { result } = renderHook(() => useRepoSkills('xoul/skills'))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10))
    })

    // then - loading while fetch in progress
    expect(result.current.loading).toBe(true)
    expect(result.current.repoQuery).toBe('xoul/skills')

    // when - fetch resolves
    await act(async () => {
      resolveFetch!(mockSkills)
      await new Promise((r) => setTimeout(r, 50))
    })

    // then - loading done
    expect(result.current.loading).toBe(false)
    expect(result.current.skills).toEqual(mockSkills)
  })
})
