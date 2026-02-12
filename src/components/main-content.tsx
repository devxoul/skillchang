import { Route, Routes, useParams } from 'react-router-dom'
import { useProjects } from '@/contexts/projects-context'
import InstalledSkillsView from '@/views/installed-skills-view'
import { SkillDetailView } from '@/views/skill-detail-view'
import { SkillGalleryView } from '@/views/skill-gallery-view'

function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const { projects } = useProjects()
  const project = projects.find((p) => p.id === id)

  return <InstalledSkillsView scope="project" projectPath={project?.path} />
}

export function MainContent() {
  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      <div data-tauri-drag-region className="h-13 shrink-0" />
      <div className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<SkillGalleryView />} />
          <Route path="/skill/*" element={<SkillDetailView />} />
          <Route path="/global" element={<InstalledSkillsView scope="global" />} />
          <Route path="/project/:id" element={<ProjectPage />} />
        </Routes>
      </div>
    </main>
  )
}
