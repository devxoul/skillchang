import InstalledSkillsView from '@/views/installed-skills-view'
import { SkillGalleryView } from '@/views/skill-gallery-view'
import { FolderOpen } from '@phosphor-icons/react'
import { Route, Routes, useParams } from 'react-router-dom'

function ProjectPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} weight="duotone" className="text-foreground/50" />
          <h1 className="text-[15px] font-semibold text-foreground">Project</h1>
        </div>
        <p className="mt-0.5 text-[12px] text-foreground/40">Project-specific skills for {id}</p>
      </header>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[13px] text-foreground/40">Coming soon</p>
      </div>
    </div>
  )
}

export function MainContent() {
  return (
    <main className="flex-1 overflow-hidden bg-background">
      <Routes>
        <Route path="/" element={<SkillGalleryView />} />
        <Route path="/global" element={<InstalledSkillsView scope="global" />} />
        <Route path="/project/:id" element={<ProjectPage />} />
      </Routes>
    </main>
  )
}
