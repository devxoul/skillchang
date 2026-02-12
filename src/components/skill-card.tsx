import { GithubLogo, Plus } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AddSkillDialog } from '@/components/add-skill-dialog'
import { usePreferences } from '@/hooks/use-preferences'
import type { Skill } from '@/types/skill'

interface SkillCardProps {
  skill: Skill
  onAdd?: (skill: Skill) => void
}

function formatInstalls(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`
  return count.toString()
}

function getSourceOrg(source: string | undefined): string {
  if (!source) return 'unknown'
  return source.split('/')[0] || source
}

export function SkillCard({ skill, onAdd }: SkillCardProps) {
  const { preferences } = usePreferences()
  const [showDialog, setShowDialog] = useState(false)

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAdd) {
      onAdd(skill)
    } else {
      setShowDialog(true)
    }
  }

  const sourceOrg = getSourceOrg(skill.topSource)

  return (
    <>
      <Link
        to={`/skill/${skill.id}`}
        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/[0.06]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-medium text-foreground">{skill.name}</span>
            <span className="shrink-0 rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[11px] font-medium text-foreground/50">
              {formatInstalls(skill.installs)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[12px] text-foreground/40">
            <GithubLogo size={12} weight="fill" />
            <span className="truncate">{skill.topSource}</span>
            <span className="text-foreground/30">by {sourceOrg}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpenDialog}
          className="shrink-0 cursor-pointer rounded-md p-1.5 text-foreground/40 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-white/[0.1] hover:text-foreground/70"
          aria-label="Add skill"
        >
          <Plus size={16} weight="bold" />
        </button>
      </Link>

      <AddSkillDialog
        skill={skill}
        open={showDialog}
        onOpenChange={setShowDialog}
        defaultAgents={preferences.defaultAgents}
      />
    </>
  )
}
