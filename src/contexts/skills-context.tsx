import { fetchSkills } from '@/lib/api'
import {
  type ListSkillsOptions,
  type RemoveSkillOptions,
  type SkillInfo,
  listSkills,
  removeSkill,
} from '@/lib/cli'
import type { Skill } from '@/types/skill'
import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react'

interface GalleryState {
  skills: Skill[]
  loading: boolean
  error: string | null
  hasMore: boolean
  lastFetched: number | null
}

interface ScopeCacheEntry {
  skills: SkillInfo[]
  lastFetched: number
  error: string | null
}

interface InstalledState {
  cache: Record<string, ScopeCacheEntry>
  loadingScope: string | null
}

interface FetchInstalledOptions {
  global?: boolean
  projectPath?: string
  force?: boolean
}

interface SkillsContextValue {
  gallery: GalleryState
  installed: InstalledState
  fetchGallerySkills: (force?: boolean) => Promise<void>
  loadMoreGallerySkills: () => Promise<void>
  fetchInstalledSkills: (options?: FetchInstalledOptions) => Promise<void>
  removeInstalledSkill: (name: string, options?: RemoveSkillOptions) => Promise<void>
  invalidateInstalledCache: (scopes?: string[]) => void
}

const SkillsContext = createContext<SkillsContextValue | null>(null)

const CACHE_DURATION = 5 * 60 * 1000

export function SkillsProvider({ children }: { children: ReactNode }) {
  const [gallery, setGallery] = useState<GalleryState>({
    skills: [],
    loading: false,
    error: null,
    hasMore: false,
    lastFetched: null,
  })

  const [installed, setInstalled] = useState<InstalledState>({
    cache: {},
    loadingScope: null,
  })

  const [galleryPage, setGalleryPage] = useState(1)

  const fetchGallerySkills = useCallback(
    async (force = false) => {
      const now = Date.now()
      const isCacheValid = gallery.lastFetched && now - gallery.lastFetched < CACHE_DURATION

      if (!force && isCacheValid && gallery.skills.length > 0) {
        return
      }

      setGallery((prev) => ({ ...prev, loading: true, error: null }))
      setGalleryPage(1)

      try {
        const response = await fetchSkills(1)
        setGallery({
          skills: response.skills,
          loading: false,
          error: null,
          hasMore: response.hasMore,
          lastFetched: Date.now(),
        })
      } catch (err) {
        setGallery((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load skills',
        }))
      }
    },
    [gallery.lastFetched, gallery.skills.length],
  )

  const loadMoreGallerySkills = useCallback(async () => {
    if (gallery.loading || !gallery.hasMore) return

    const nextPage = galleryPage + 1
    setGallery((prev) => ({ ...prev, loading: true }))

    try {
      const response = await fetchSkills(nextPage)
      setGalleryPage(nextPage)
      setGallery((prev) => ({
        ...prev,
        skills: [...prev.skills, ...response.skills],
        loading: false,
        hasMore: response.hasMore,
        lastFetched: Date.now(),
      }))
    } catch (err) {
      setGallery((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load more skills',
      }))
    }
  }, [gallery.loading, gallery.hasMore, galleryPage])

  const fetchInstalledSkills = useCallback(
    async (options: FetchInstalledOptions = {}) => {
      const { global = true, projectPath, force = false } = options
      const scope = global ? 'global' : projectPath || 'project'
      const now = Date.now()
      const cached = installed.cache[scope]
      const isCacheValid = cached?.lastFetched && now - cached.lastFetched < CACHE_DURATION

      if (!force && isCacheValid) {
        return
      }

      setInstalled((prev) => ({ ...prev, loadingScope: scope }))

      try {
        const skills = await listSkills({ global, cwd: projectPath })
        setInstalled((prev) => ({
          ...prev,
          loadingScope: null,
          cache: {
            ...prev.cache,
            [scope]: { skills, lastFetched: Date.now(), error: null },
          },
        }))
      } catch (err) {
        setInstalled((prev) => ({
          ...prev,
          loadingScope: null,
          cache: {
            ...prev.cache,
            [scope]: {
              skills: prev.cache[scope]?.skills ?? [],
              lastFetched: Date.now(),
              error: err instanceof Error ? err.message : 'Failed to load skills',
            },
          },
        }))
      }
    },
    [installed.cache],
  )

  const removeInstalledSkill = useCallback(
    async (name: string, options?: RemoveSkillOptions) => {
      await removeSkill(name, options)
      await fetchInstalledSkills({
        global: options?.global ?? true,
        projectPath: options?.cwd,
        force: true,
      })
    },
    [fetchInstalledSkills],
  )

  const invalidateInstalledCache = useCallback((scopes?: string[]) => {
    setInstalled((prev) => {
      if (!scopes) {
        return { ...prev, cache: {} }
      }
      const newCache = { ...prev.cache }
      for (const scope of scopes) {
        delete newCache[scope]
      }
      return { ...prev, cache: newCache }
    })
  }, [])

  const value = useMemo(
    () => ({
      gallery,
      installed,
      fetchGallerySkills,
      loadMoreGallerySkills,
      fetchInstalledSkills,
      removeInstalledSkill,
      invalidateInstalledCache,
    }),
    [
      gallery,
      installed,
      fetchGallerySkills,
      loadMoreGallerySkills,
      fetchInstalledSkills,
      removeInstalledSkill,
      invalidateInstalledCache,
    ],
  )

  return <SkillsContext.Provider value={value}>{children}</SkillsContext.Provider>
}

export function useSkills() {
  const context = useContext(SkillsContext)
  if (!context) {
    throw new Error('useSkills must be used within SkillsProvider')
  }
  return context
}

export function useGallerySkills() {
  const { gallery, fetchGallerySkills, loadMoreGallerySkills } = useSkills()
  return {
    ...gallery,
    refresh: () => fetchGallerySkills(true),
    loadMore: loadMoreGallerySkills,
    fetch: fetchGallerySkills,
  }
}

export function useInstalledSkills(scope: 'global' | 'project' = 'global', projectPath?: string) {
  const { installed, fetchInstalledSkills, removeInstalledSkill, invalidateInstalledCache } =
    useSkills()
  const isGlobal = scope === 'global'
  const expectedScope = isGlobal ? 'global' : projectPath || 'project'
  const cached = installed.cache[expectedScope]
  const isLoadingThisScope = installed.loadingScope === expectedScope

  const refresh = useCallback(
    () => fetchInstalledSkills({ global: isGlobal, projectPath, force: true }),
    [fetchInstalledSkills, isGlobal, projectPath],
  )
  const fetch = useCallback(
    () => fetchInstalledSkills({ global: isGlobal, projectPath }),
    [fetchInstalledSkills, isGlobal, projectPath],
  )

  return {
    skills: cached?.skills ?? [],
    loading: isLoadingThisScope && !cached?.skills.length,
    refetching: isLoadingThisScope && (cached?.skills.length ?? 0) > 0,
    error: cached?.error ?? null,
    refresh,
    fetch,
    remove: removeInstalledSkill,
    invalidateCache: invalidateInstalledCache,
  }
}
