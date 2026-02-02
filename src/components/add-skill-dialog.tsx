import { AgentIcon } from '@/components/agent-icon'
import { useProjects } from '@/contexts/projects-context'
import { useSkills } from '@/contexts/skills-context'
import { AGENTS } from '@/data/agents'
import { addSkill } from '@/lib/cli'
import type { Skill } from '@/types/skill'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import { DialogBackdrop, DialogContent, DialogPortal, DialogRoot, DialogTitle } from '@/ui/dialog'
import { FolderOpen, Globe } from '@phosphor-icons/react'
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
  const { projects, loading: projectsLoading } = useProjects()
  const { invalidateInstalledCache } = useSkills()
  const [includeGlobal, setIncludeGlobal] = useState(true)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>(defaultAgents)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((p) => p !== projectId) : [...prev, projectId],
    )
  }

  const handleToggleAgent = (agent: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent],
    )
  }

  const handleAdd = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const errors: string[] = []
    let successCount = 0

    try {
      if (includeGlobal) {
        try {
          await addSkill(skill.topSource, {
            global: true,
            agents: selectedAgents,
            yes: true,
          })
          successCount++
        } catch (err) {
          errors.push(`Global: ${err instanceof Error ? err.message : 'Failed'}`)
        }
      }

      for (const projectId of selectedProjects) {
        const project = projects.find((p) => p.id === projectId)
        if (!project) continue

        try {
          await addSkill(skill.topSource, {
            agents: selectedAgents,
            yes: true,
            cwd: project.path,
          })
          successCount++
        } catch (err) {
          errors.push(`${project.name}: ${err instanceof Error ? err.message : 'Failed'}`)
        }
      }

      const scopesToInvalidate: string[] = []
      if (includeGlobal) scopesToInvalidate.push('global')
      for (const projectId of selectedProjects) {
        const project = projects.find((p) => p.id === projectId)
        if (project) scopesToInvalidate.push(project.path)
      }
      if (scopesToInvalidate.length > 0) {
        invalidateInstalledCache(scopesToInvalidate)
      }

      if (errors.length > 0) {
        if (successCount > 0) {
          setError(`Added to ${successCount} target(s), but failed: ${errors.join('; ')}`)
        } else {
          setError(errors.join('; '))
        }
      } else {
        setSuccess(true)
        setTimeout(() => onOpenChange(false), 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill')
    } finally {
      setLoading(false)
    }
  }

  const hasTargetSelected = includeGlobal || selectedProjects.length > 0
  const isAddDisabled = loading || selectedAgents.length === 0 || !hasTargetSelected

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogContent className="w-[480px]">
          <DialogTitle>Add {skill.name}</DialogTitle>

          <div className="mt-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[13px] font-medium text-foreground">Install to</label>
                <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-foreground/10 bg-foreground/[0.02] p-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-[13px] transition-colors duration-150 hover:bg-foreground/[0.06]">
                    <Checkbox checked={includeGlobal} onCheckedChange={setIncludeGlobal} />
                    <Globe size={16} weight="duotone" className="text-foreground/50" />
                    <span>Global</span>
                  </label>

                  {projects.length > 0 && <div className="mx-1 my-1.5 h-px bg-foreground/[0.06]" />}

                  {projectsLoading ? (
                    <div className="px-2 py-1.5 text-[12px] text-foreground/40">
                      Loading projects...
                    </div>
                  ) : (
                    projects.map((project) => (
                      <label
                        key={project.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-[13px] transition-colors duration-150 hover:bg-foreground/[0.06]"
                      >
                        <Checkbox
                          checked={selectedProjects.includes(project.id)}
                          onCheckedChange={() => handleToggleProject(project.id)}
                        />
                        <FolderOpen size={16} weight="duotone" className="text-foreground/50" />
                        <span className="truncate">{project.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex-1">
                <label className="text-[13px] font-medium text-foreground">Agents</label>
                <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-foreground/10 bg-foreground/[0.02] p-2">
                  {AGENTS.map((agent) => (
                    <label
                      key={agent.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-[13px] transition-colors duration-150 hover:bg-foreground/[0.06]"
                    >
                      <Checkbox
                        checked={selectedAgents.includes(agent.id)}
                        onCheckedChange={() => handleToggleAgent(agent.id)}
                      />
                      <AgentIcon agent={agent.id} size={16} />
                      <span>{agent.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && <div className="text-[13px] text-red-400">{error}</div>}
            {success && (
              <div className="text-[13px] text-emerald-500">
                Skill added to {(includeGlobal ? 1 : 0) + selectedProjects.length} target(s)!
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" disabled={loading} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={isAddDisabled}>
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  )
}
