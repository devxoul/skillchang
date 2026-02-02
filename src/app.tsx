import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/error-boundary'
import { Layout } from './components/layout'
import { ProjectsProvider } from './contexts/projects-context'
import { SkillsProvider } from './contexts/skills-context'

export default function App() {
  return (
    <ErrorBoundary>
      <ProjectsProvider>
        <SkillsProvider>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </SkillsProvider>
      </ProjectsProvider>
    </ErrorBoundary>
  )
}
