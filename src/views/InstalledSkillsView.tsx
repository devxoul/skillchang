import { InlineError } from '@/components/InlineError'
import { Button } from '@/components/ui/Button'
import { type SkillInfo, listSkills, removeSkill } from '@/lib/cli'
import { useEffect, useState } from 'react'

interface InstalledSkillsViewProps {
  scope?: 'global' | 'project'
  projectPath?: string
}

export default function InstalledSkillsView({
  scope = 'global',
  projectPath,
}: InstalledSkillsViewProps) {
  const [skills, setSkills] = useState<SkillInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    loadSkills()
  }, [scope, projectPath])

  async function loadSkills() {
    setLoading(true)
    setError(null)
    setActionError(null)

    try {
      const isGlobal = scope === 'global'
      const result = await listSkills(isGlobal)
      setSkills(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(skillName: string) {
    setRemoving(skillName)
    setActionError(null)

    try {
      const isGlobal = scope === 'global'
      await removeSkill(skillName, { global: isGlobal })
      await loadSkills()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove skill')
    } finally {
      setRemoving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading skills...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-md">
          <InlineError message={error} onRetry={loadSkills} />
        </div>
      </div>
    )
  }

  if (skills.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-2">📦</div>
          <div>No {scope} skills installed</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {scope === 'global' ? 'Global Skills' : 'Project Skills'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {skills.length} skill{skills.length !== 1 ? 's' : ''} installed
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadSkills}>
          Refresh
        </Button>
      </div>
      {actionError && <InlineError message={actionError} onRetry={() => setActionError(null)} />}
      <div className="space-y-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="border border-border rounded-lg p-4 flex items-center justify-between bg-surface hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{skill.name}</h3>
                {skill.agents && skill.agents.length > 0 ? (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 text-xs font-medium">
                    Linked
                  </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 text-xs font-medium">
                    Not linked
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <span className="truncate">{skill.path}</span>
                </div>
                {skill.agents && skill.agents.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="flex flex-wrap gap-1">
                      {skill.agents.map((agent) => (
                        <span
                          key={agent}
                          className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs"
                        >
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleRemove(skill.name)}
              disabled={removing === skill.name}
              className="ml-4 shrink-0"
            >
              {removing === skill.name ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
