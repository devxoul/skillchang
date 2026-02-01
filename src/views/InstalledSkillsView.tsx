import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { InlineError } from '@/components/InlineError'
import { listSkills, removeSkill, type SkillInfo } from '@/lib/cli'

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
      <h1 className="text-2xl font-bold">
        {scope === 'global' ? 'Global Skills' : 'Project Skills'}
      </h1>
      {actionError && <InlineError message={actionError} onRetry={() => setActionError(null)} />}
      <div className="space-y-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="border border-border rounded-lg p-4 flex items-center justify-between bg-surface"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{skill.name}</h3>
              <div className="text-sm text-muted-foreground mt-1">
                <div>📁 {skill.path}</div>
                {skill.agents && skill.agents.length > 0 && <div>🤖 {skill.agents.join(', ')}</div>}
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleRemove(skill.name)}
              disabled={removing === skill.name}
              className="ml-4"
            >
              {removing === skill.name ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
