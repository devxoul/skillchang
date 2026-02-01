import { Routes, Route } from 'react-router-dom'
import { SkillGalleryView } from '@/views/skill-gallery-view'
import InstalledSkillsView from '@/views/installed-skills-view'

function ProjectPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Project</h1>
      <p className="mt-2 text-muted-foreground">Project-specific skills</p>
    </div>
  )
}

export function MainContent() {
  return (
    <main className="flex-1 overflow-auto">
      <Routes>
        <Route path="/" element={<SkillGalleryView />} />
        <Route path="/global" element={<InstalledSkillsView scope="global" />} />
        <Route path="/project/:id" element={<ProjectPage />} />
      </Routes>
    </main>
  )
}
