import {
  ArrowClockwise,
  ArrowsClockwise,
  ArrowUp,
  CheckCircle,
  Folder,
  FolderOpen,
  Globe,
  LinkSimple,
  Package,
  SpinnerGap,
  Trash,
  Warning,
} from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AgentIcon } from '@/components/agent-icon'
import { InlineError } from '@/components/inline-error'
import { InstalledSkillItemSkeleton } from '@/components/installed-skill-item-skeleton'
import { SearchInput } from '@/components/search-input'
import { useInstalledSkills } from '@/contexts/skills-context'
import { usePersistedSearch } from '@/hooks/use-persisted-search'
import { useScrollRestoration } from '@/hooks/use-scroll-restoration'
import type { SkillInfo } from '@/lib/cli'
import type { SkillUpdateStatus } from '@/types/update-status'
import * as Popover from '@/ui/popover'

interface InstalledSkillsViewProps {
  scope?: 'global' | 'project'
  projectPath?: string
}

interface InstalledSkillItemProps {
  skill: SkillInfo
  onRemove: (name: string) => void
  removing: boolean
  updateStatus?: SkillUpdateStatus
}

function InstalledSkillItem({ skill, onRemove, removing, updateStatus }: InstalledSkillItemProps) {
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  useEffect(() => {
    if (confirmingRemove) {
      const timer = setTimeout(() => setConfirmingRemove(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [confirmingRemove])

  return (
    <Link
      to={`/skill/${skill.name}`}
      className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-overlay-6"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-foreground">{skill.name}</span>
          {skill.agents && skill.agents.length > 0 ? (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500">
              <LinkSimple size={10} weight="bold" />
              Linked
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
              Not linked
            </span>
          )}
          {updateStatus?.status === 'checking' && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-overlay-6 px-1.5 py-0.5 text-[10px] font-medium text-foreground/40">
              <SpinnerGap size={10} className="animate-spin" />
              Checking...
            </span>
          )}
          {updateStatus?.status === 'update-available' && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-500">
              <ArrowUp size={10} weight="bold" />
              Update
            </span>
          )}
          {updateStatus?.status === 'updating' && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-500">
              <SpinnerGap size={10} className="animate-spin" />
              Updating...
            </span>
          )}
          {updateStatus?.status === 'error' && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
              <Warning size={10} weight="bold" />
              Error
            </span>
          )}
        </div>
        <div className="mt-1.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-foreground/40">
            <Folder size={12} weight="duotone" className="shrink-0" />
            <span className="truncate">{skill.path}</span>
          </div>
          {skill.agents && skill.agents.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skill.agents.map((agent) => (
                <span
                  key={agent}
                  className="flex items-center gap-1 rounded bg-overlay-8 px-1.5 py-0.5 text-[10px] text-foreground/60"
                >
                  <AgentIcon agent={agent} size={12} />
                  {agent}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        tabIndex={confirmingRemove ? 0 : -1}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (confirmingRemove) {
            onRemove(skill.name)
          } else {
            setConfirmingRemove(true)
          }
        }}
        onBlur={() => setConfirmingRemove(false)}
        disabled={removing}
        className={clsx(
          'relative flex h-4 shrink-0 cursor-pointer items-center justify-end',
          confirmingRemove ? 'w-11' : 'w-4',
          'transition-[width] duration-200 ease-out',
          'opacity-0 group-hover:opacity-100',
          removing && 'cursor-not-allowed opacity-50',
        )}
        aria-label={confirmingRemove ? 'Click to confirm' : 'Remove skill'}
      >
        {removing ? (
          <SpinnerGap size={14} className="absolute right-0 animate-spin" />
        ) : (
          <>
            <span
              className={clsx(
                'absolute right-0 text-[11px] leading-none transition-all duration-200 ease-out',
                confirmingRemove
                  ? 'translate-x-0 text-foreground/50 opacity-100 hover:text-foreground/70'
                  : 'pointer-events-none translate-x-2 text-foreground/50 opacity-0',
              )}
            >
              Remove
            </span>
            <Trash
              size={14}
              className={clsx(
                'absolute right-0 transition-all duration-200 ease-out',
                confirmingRemove
                  ? 'pointer-events-none -translate-x-2 opacity-0'
                  : 'translate-x-0 text-foreground/30 hover:text-foreground/50',
              )}
            />
          </>
        )}
      </button>
    </Link>
  )
}

export default function InstalledSkillsView({ scope = 'global', projectPath }: InstalledSkillsViewProps) {
  const {
    skills,
    loading,
    refetching,
    error,
    updateStatuses,
    checkErrors,
    isCheckingUpdates,
    isUpdatingAll,
    refresh,
    fetch,
    remove,
    checkUpdates,
    updateAll,
  } = useInstalledSkills(scope, projectPath)
  const scrollRef = useScrollRestoration<HTMLDivElement>()
  const [actionError, setActionError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = usePersistedSearch()

  useEffect(() => {
    fetch()
  }, [fetch])

  useEffect(() => {
    if (skills.length > 0) {
      checkUpdates()
    }
  }, [checkUpdates, skills.length])

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) {
      return skills
    }
    const query = searchQuery.toLowerCase()
    return skills.filter((skill) => skill.name.toLowerCase().includes(query))
  }, [skills, searchQuery])

  async function handleRemove(skillName: string) {
    setRemoving(skillName)
    setActionError(null)

    try {
      await remove(skillName, {
        global: scope === 'global',
        cwd: scope === 'project' ? projectPath : undefined,
      })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove skill')
    } finally {
      setRemoving(null)
    }
  }

  const hasUpdates = Object.values(updateStatuses).some((s) => s.status === 'update-available')
  const updateCount = Object.values(updateStatuses).filter((s) => s.status === 'update-available').length
  const isAllUpToDate =
    skills.length > 0 &&
    !isCheckingUpdates &&
    Object.keys(updateStatuses).length > 0 &&
    Object.values(updateStatuses).every((s) => s.status === 'up-to-date')

  const renderContent = () => {
    if (loading && skills.length === 0) {
      return (
        <div className="space-y-0.5 px-2 py-2">
          <InstalledSkillItemSkeleton />
          <InstalledSkillItemSkeleton />
          <InstalledSkillItemSkeleton />
          <InstalledSkillItemSkeleton />
        </div>
      )
    }

    if (error && skills.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">
            <InlineError message={error} onRetry={refresh} />
          </div>
        </div>
      )
    }

    if (skills.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Package size={32} weight="duotone" className="mx-auto text-foreground/20" />
            <p className="mt-2 text-[13px] text-foreground/40">No skills installed</p>
            {scope === 'project' && (
              <p className="mt-1 text-[12px] text-foreground/30">
                Add skills from the Skills Directory to this project
              </p>
            )}
          </div>
        </div>
      )
    }

    return (
      <>
        <div className="shrink-0 px-4 py-3">
          <SearchInput onSearch={setSearchQuery} defaultValue={searchQuery} placeholder="Search skills..." />
        </div>

        {actionError && (
          <div className="shrink-0 px-4 pb-3">
            <InlineError message={actionError} onRetry={() => setActionError(null)} />
          </div>
        )}

        {filteredSkills.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[13px] text-foreground/40">No skills match your search</p>
          </div>
        ) : (
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-2">
            <div className="space-y-0.5 pb-2">
              {filteredSkills.map((skill) => (
                <InstalledSkillItem
                  key={skill.name}
                  skill={skill}
                  onRemove={handleRemove}
                  removing={removing === skill.name}
                  updateStatus={updateStatuses[skill.name]}
                />
              ))}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-overlay-border-muted px-5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {scope === 'global' ? (
              <Globe size={18} weight="duotone" className="text-foreground/50" />
            ) : (
              <FolderOpen size={18} weight="duotone" className="text-foreground/50" />
            )}
            <h1 className="text-[15px] font-semibold text-foreground">
              {scope === 'global' ? 'Global Skills' : 'Project Skills'}
            </h1>
          </div>
          <p className="mt-0.5 flex h-[18px] items-center text-[12px] text-foreground/40">
            {loading && skills.length === 0 ? (
              <span className="h-2.5 w-24 animate-shimmer rounded" />
            ) : scope === 'project' && projectPath ? (
              <span className="flex items-center gap-1.5">
                <span>{projectPath}</span>
                {skills.length > 0 && (
                  <>
                    <span className="text-foreground/20">·</span>
                    <span>
                      {skills.length} skill{skills.length !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </span>
            ) : skills.length > 0 ? (
              <>
                {skills.length} skill{skills.length !== 1 ? 's' : ''} installed
              </>
            ) : (
              <span className="text-foreground/30">No skills installed</span>
            )}

            {isAllUpToDate && (
              <>
                <span className="mx-2 text-foreground/20">|</span>
                <span className="flex items-center gap-1 text-emerald-500/80">
                  <CheckCircle size={12} weight="fill" />
                  All up to date
                </span>
              </>
            )}

            {checkErrors.length > 0 && (
              <>
                <span className="mx-2 text-foreground/20">|</span>
                <Popover.Root>
                  <Popover.Trigger className="flex items-center gap-1 text-amber-500/80 hover:text-amber-500">
                    <Warning size={12} weight="fill" />
                    {checkErrors.length} couldn't be checked
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Positioner side="bottom" align="start" sideOffset={8}>
                      <Popover.Content className="max-h-[200px] w-72 overflow-y-auto">
                        <div className="space-y-2">
                          <div className="text-[12px] font-medium text-amber-500">Failed to check updates</div>
                          {checkErrors.map((error, i) => (
                            <div key={i} className="flex flex-col gap-0.5">
                              <span className="text-[12px] font-medium text-foreground/80">{error.name}</span>
                              <span className="text-[11px] text-foreground/50">{error.error}</span>
                            </div>
                          ))}
                        </div>
                      </Popover.Content>
                    </Popover.Positioner>
                  </Popover.Portal>
                </Popover.Root>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {hasUpdates && (
            <button
              type="button"
              onClick={updateAll}
              disabled={isUpdatingAll}
              className="mr-2 flex cursor-pointer items-center gap-1.5 rounded-md bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-500 transition-colors hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdatingAll ? (
                <SpinnerGap size={12} className="animate-spin" />
              ) : (
                <ArrowsClockwise size={12} weight="bold" />
              )}
              Update All ({updateCount})
            </button>
          )}

          <button
            type="button"
            onClick={() => checkUpdates(true)}
            disabled={isCheckingUpdates}
            className="cursor-pointer rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-overlay-6 hover:text-foreground/70 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Check for updates"
          >
            <ArrowsClockwise size={16} weight="bold" className={isCheckingUpdates ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={refresh}
            disabled={loading || refetching}
            className="cursor-pointer rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-overlay-6 hover:text-foreground/70 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refresh"
          >
            <ArrowClockwise size={16} weight="bold" className={loading || refetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {renderContent()}
    </div>
  )
}
