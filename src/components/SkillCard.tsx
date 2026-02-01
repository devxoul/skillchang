import { Button } from '@/components/ui/Button'
import type { Skill } from '@/types/skill'

interface SkillCardProps {
  skill: Skill
  onAdd?: (skill: Skill) => void
}

export function SkillCard({ skill, onAdd }: SkillCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{skill.name}</h3>
        <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            📦 {skill.installs.toLocaleString()} installs
          </span>
          <span className="flex items-center gap-1">
            📝 {skill.topSource}
          </span>
        </div>
      </div>
      {onAdd && (
        <Button size="sm" onClick={() => onAdd(skill)}>
          Add
        </Button>
      )}
    </div>
  )
}
