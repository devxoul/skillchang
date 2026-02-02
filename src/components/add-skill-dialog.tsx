import { AgentIcon } from '@/components/agent-icon'
import { AGENTS } from '@/data/agents'
import { addSkill } from '@/lib/cli'
import type { Skill } from '@/types/skill'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import { DialogBackdrop, DialogContent, DialogPortal, DialogRoot, DialogTitle } from '@/ui/dialog'
import { useState } from 'react'

interface AddSkillDialogProps {
  skill: Skill
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultAgents?: string[]
}

export function AddSkillDialog({
  skill,
  open,
  onOpenChange,
  defaultAgents = [],
}: AddSkillDialogProps) {
  const [scope, setScope] = useState<'global' | 'project'>('global')
  const [selectedAgents, setSelectedAgents] = useState<string[]>(defaultAgents)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleToggleAgent = (agent: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent],
    )
  }

  const handleAdd = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await addSkill(skill.name, {
        global: scope === 'global',
        agents: selectedAgents,
        yes: true,
      })
      setSuccess(true)
      setTimeout(() => onOpenChange(false), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogContent>
          <DialogTitle>Add {skill.name}</DialogTitle>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Scope</label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={scope === 'global'}
                    onChange={() => setScope('global')}
                    className="accent-primary"
                  />
                  Global
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={scope === 'project'}
                    onChange={() => setScope('project')}
                    className="accent-primary"
                  />
                  Project
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Agents</label>
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded border border-border p-2">
                {AGENTS.map((agent) => (
                  <label
                    key={agent}
                    className="flex cursor-pointer items-center gap-2 rounded p-1 text-sm hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedAgents.includes(agent)}
                      onCheckedChange={() => handleToggleAgent(agent)}
                    />
                    <AgentIcon agent={agent} size={16} />
                    <span>{agent}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="text-sm text-error">{error}</div>}
            {success && <div className="text-sm text-success">✓ Skill added successfully!</div>}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" disabled={loading} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={loading || selectedAgents.length === 0}>
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  )
}
