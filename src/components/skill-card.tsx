import { AddSkillDialog } from '@/components/add-skill-dialog'
import { Button } from '@/components/ui/button'
import type { Skill } from '@/types/skill'
import { useState } from 'react'

interface SkillCardProps {
  skill: Skill
  onAdd?: (skill: Skill) => void
}

function formatInstalls(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`
  return count.toString()
}

function getSourceOrg(source: string): string {
  return source.split('/')[0] || source
}

export function SkillCard({ skill, onAdd }: SkillCardProps) {
  const [showDialog, setShowDialog] = useState(false)

  const handleOpenDialog = () => {
    if (onAdd) {
      onAdd(skill)
    } else {
      setShowDialog(true)
    }
  }

  const sourceOrg = getSourceOrg(skill.topSource)

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-muted/50">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="truncate font-semibold text-foreground">{skill.name}</h3>
            <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {formatInstalls(skill.installs)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span className="truncate">{skill.topSource}</span>
            </span>
            <span className="shrink-0 text-xs opacity-60">by {sourceOrg}</span>
          </div>
        </div>
        <Button size="sm" onClick={handleOpenDialog} className="ml-4 shrink-0">
          Add
        </Button>
      </div>

      <AddSkillDialog skill={skill} open={showDialog} onOpenChange={setShowDialog} />
    </>
  )
}
