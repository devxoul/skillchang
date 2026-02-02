import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/error-boundary'
import { Layout } from './components/layout'
import { SkillsProvider } from './contexts/skills-context'

export default function App() {
  return (
    <ErrorBoundary>
      <SkillsProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </SkillsProvider>
    </ErrorBoundary>
  )
}
