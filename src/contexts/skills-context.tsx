import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { fetchSkills } from '@/lib/api'
import {
  checkUpdatesApi,
  listSkills,
  type RemoveSkillOptions,
  removeSkill,
  type SkillInfo,
  updateSkills,
} from '@/lib/cli'
import type { Skill } from '@/types/skill'
import type { UpdateStatusMap } from '@/types/update-status'

interface GalleryState {
  skills: Skill[]
  loading: boolean
  error: string | null
  lastFetched: number | null
}

interface ScopeCacheEntry {
  skills: SkillInfo[]
  lastFetched: number
  error: string | null
}

interface UpdateStatusCache {
  statuses: UpdateStatusMap
  errors: Array<{ name: string; error: string }>
  lastChecked: number
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

interface CheckUpdatesOptions {
  scope: string
  skills: SkillInfo[]
  force?: boolean
}

interface SkillsContextValue {
  gallery: GalleryState
  installed: InstalledState
  updateStatusCache: Record<string, UpdateStatusCache>
  checkingUpdatesScope: string | null
  updatingAll: boolean
  fetchGallerySkills: (force?: boolean) => Promise<void>
  fetchInstalledSkills: (options?: FetchInstalledOptions) => Promise<void>
  removeInstalledSkill: (name: string, options?: RemoveSkillOptions) => Promise<void>
  invalidateInstalledCache: (scopes?: string[]) => void
  checkForUpdates: (options: CheckUpdatesOptions) => Promise<void>
  handleUpdateAll: (scope: string) => Promise<void>
}

const SkillsContext = createContext<SkillsContextValue | null>(null)

const CACHE_DURATION = 5 * 60 * 1000

export function SkillsProvider({ children }: { children: ReactNode }) {
  const [gallery, setGallery] = useState<GalleryState>({
    skills: [],
    loading: false,
    error: null,
    lastFetched: null,
  })

  const [installed, setInstalled] = useState<InstalledState>({
    cache: {},
    loadingScope: null,
  })

  const [updateStatusCache, setUpdateStatusCache] = useState<Record<string, UpdateStatusCache>>({})
  const [checkingUpdatesScope, setCheckingUpdatesScope] = useState<string | null>(null)
  const [updatingAll, setUpdatingAll] = useState(false)

  const fetchGallerySkills = useCallback(
    async (force = false) => {
      const now = Date.now()
      const isCacheValid = gallery.lastFetched && now - gallery.lastFetched < CACHE_DURATION

      if (!force && isCacheValid && gallery.skills.length > 0) {
        return
      }

      setGallery((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const skills = await fetchSkills()
        setGallery({
          skills,
          loading: false,
          error: null,
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

  const checkForUpdates = useCallback(
    async ({ scope, skills, force = false }: CheckUpdatesOptions) => {
      const now = Date.now()
      const cached = updateStatusCache[scope]
      const isCacheValid = cached?.lastChecked && now - cached.lastChecked < CACHE_DURATION

      if (!force && isCacheValid) {
        return
      }

      if (skills.length === 0) return

      setCheckingUpdatesScope(scope)

      try {
        const result = await checkUpdatesApi()

        const newStatuses: UpdateStatusMap = {}
        const newErrors: Array<{ name: string; error: string }> = []

        for (const skill of skills) {
          newStatuses[skill.name] = { status: 'up-to-date' }
        }

        for (const update of result.updatesAvailable) {
          newStatuses[update.name] = {
            status: 'update-available',
            source: update.source,
          }
        }

        for (const err of result.errors || []) {
          const isCacheMiss = err.error.includes('No cached hash') || err.error.includes('may need reinstall')
          if (!isCacheMiss) {
            newStatuses[err.name] = {
              status: 'error',
              message: err.error,
            }
            newErrors.push({ name: err.name, error: err.error })
          }
        }

        setUpdateStatusCache((prev) => ({
          ...prev,
          [scope]: {
            statuses: newStatuses,
            errors: newErrors,
            lastChecked: Date.now(),
          },
        }))
      } catch (err) {
        console.error('Failed to check updates:', err)
      } finally {
        setCheckingUpdatesScope(null)
      }
    },
    [updateStatusCache],
  )

  const handleUpdateAll = useCallback(
    async (scope: string) => {
      setUpdatingAll(true)

      const cached = updateStatusCache[scope]
      if (cached) {
        const updatingStatuses: UpdateStatusMap = { ...cached.statuses }
        for (const name of Object.keys(updatingStatuses)) {
          const status = updatingStatuses[name]
          if (status?.status === 'update-available') {
            updatingStatuses[name] = { status: 'updating' }
          }
        }
        setUpdateStatusCache((prev) => ({
          ...prev,
          [scope]: { ...prev[scope]!, statuses: updatingStatuses },
        }))
      }

      try {
        await updateSkills()
        const isGlobal = scope === 'global'
        await fetchInstalledSkills({
          global: isGlobal,
          projectPath: isGlobal ? undefined : scope,
          force: true,
        })
        const skills = installed.cache[scope]?.skills ?? []
        await checkForUpdates({ scope, skills, force: true })
      } catch (err) {
        console.error('Failed to update skills:', err)
      } finally {
        setUpdatingAll(false)
      }
    },
    [updateStatusCache, fetchInstalledSkills, installed.cache, checkForUpdates],
  )

  const value = useMemo(
    () => ({
      gallery,
      installed,
      updateStatusCache,
      checkingUpdatesScope,
      updatingAll,
      fetchGallerySkills,
      fetchInstalledSkills,
      removeInstalledSkill,
      invalidateInstalledCache,
      checkForUpdates,
      handleUpdateAll,
    }),
    [
      gallery,
      installed,
      updateStatusCache,
      checkingUpdatesScope,
      updatingAll,
      fetchGallerySkills,
      fetchInstalledSkills,
      removeInstalledSkill,
      invalidateInstalledCache,
      checkForUpdates,
      handleUpdateAll,
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
  const { gallery, fetchGallerySkills } = useSkills()
  return {
    ...gallery,
    refresh: () => fetchGallerySkills(true),
    fetch: fetchGallerySkills,
  }
}

export function useInstalledSkills(scope: 'global' | 'project' = 'global', projectPath?: string) {
  const {
    installed,
    updateStatusCache,
    checkingUpdatesScope,
    updatingAll,
    fetchInstalledSkills,
    removeInstalledSkill,
    invalidateInstalledCache,
    checkForUpdates,
    handleUpdateAll,
  } = useSkills()
  const isGlobal = scope === 'global'
  const expectedScope = isGlobal ? 'global' : projectPath || 'project'
  const cached = installed.cache[expectedScope]
  const updateCached = updateStatusCache[expectedScope]
  const isLoadingThisScope = installed.loadingScope === expectedScope
  const isCheckingThisScope = checkingUpdatesScope === expectedScope

  const refresh = useCallback(
    () => fetchInstalledSkills({ global: isGlobal, projectPath, force: true }),
    [fetchInstalledSkills, isGlobal, projectPath],
  )
  const fetch = useCallback(
    () => fetchInstalledSkills({ global: isGlobal, projectPath }),
    [fetchInstalledSkills, isGlobal, projectPath],
  )
  const checkUpdates = useCallback(
    (force = false) => checkForUpdates({ scope: expectedScope, skills: cached?.skills ?? [], force }),
    [checkForUpdates, expectedScope, cached?.skills],
  )
  const updateAll = useCallback(() => handleUpdateAll(expectedScope), [handleUpdateAll, expectedScope])

  return {
    skills: cached?.skills ?? [],
    loading: isLoadingThisScope && !cached?.skills.length,
    refetching: isLoadingThisScope && (cached?.skills.length ?? 0) > 0,
    error: cached?.error ?? null,
    updateStatuses: updateCached?.statuses ?? {},
    checkErrors: updateCached?.errors ?? [],
    isCheckingUpdates: isCheckingThisScope,
    isUpdatingAll: updatingAll,
    refresh,
    fetch,
    remove: removeInstalledSkill,
    invalidateCache: invalidateInstalledCache,
    checkUpdates,
    updateAll,
  }
}
