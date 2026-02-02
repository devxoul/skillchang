import { AgentIcon } from '@/components/agent-icon'
import { InlineError } from '@/components/inline-error'
import { SearchInput } from '@/components/search-input'
import { useInstalledSkills } from '@/contexts/skills-context'
import {
  ArrowClockwise,
  Folder,
  FolderOpen,
  Globe,
  LinkSimple,
  Package,
  SpinnerGap,
  Trash,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'

interface InstalledSkillsViewProps {
  scope?: 'global' | 'project'
  projectPath?: string
}

export default function InstalledSkillsView({
  scope = 'global',
  projectPath,
}: InstalledSkillsViewProps) {
  const { skills, loading, error, refresh, fetch, remove } = useInstalledSkills(scope)
  const [actionError, setActionError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch()
  }, [fetch])

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
      await remove(skillName, { global: scope === 'global' })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove skill')
    } finally {
      setRemoving(null)
    }
  }

  const renderContent = () => {
    if (loading && skills.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <SpinnerGap size={24} className="animate-spin text-foreground/30" />
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
                Add skills from the Gallery to this project
              </p>
            )}
          </div>
        </div>
      )
    }

    if (filteredSkills.length === 0) {
      return (
        <div className="flex flex-1 flex-col">
          <div className="shrink-0 px-4 py-3">
            <SearchInput onSearch={setSearchQuery} placeholder="Search skills..." />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[13px] text-foreground/40">No skills match your search</p>
          </div>
        </div>
      )
    }

    return (
      <>
        <div className="shrink-0 px-4 py-3">
          <SearchInput onSearch={setSearchQuery} placeholder="Search skills..." />
        </div>

        {actionError && (
          <div className="shrink-0 px-4 pb-3">
            <InlineError message={actionError} onRetry={() => setActionError(null)} />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-2">
          <div className="space-y-0.5 pb-2">
            {filteredSkills.map((skill) => (
              <div
                key={skill.name}
                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/[0.06]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium text-foreground">
                      {skill.name}
                    </span>
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
                            className="flex items-center gap-1 rounded bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-foreground/60"
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
                  onClick={() => handleRemove(skill.name)}
                  disabled={removing === skill.name}
                  className="shrink-0 cursor-pointer rounded-md p-1.5 text-foreground/30 opacity-0 transition-all duration-150 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100"
                  aria-label="Remove skill"
                >
                  {removing === skill.name ? (
                    <SpinnerGap size={14} className="animate-spin" />
                  ) : (
                    <Trash size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 pb-4">
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
              <span className="h-2.5 w-24 animate-pulse rounded bg-foreground/10" />
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
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="cursor-pointer rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-white/[0.06] hover:text-foreground/70 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Refresh"
        >
          <ArrowClockwise size={16} weight="bold" className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {renderContent()}
    </div>
  )
}
