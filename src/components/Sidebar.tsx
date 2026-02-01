import { clsx } from 'clsx'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui/Button'

interface NavLinkProps {
  to: string
  children: React.ReactNode
  exact?: boolean
}

function NavLink({ to, children, exact = false }: NavLinkProps) {
  const location = useLocation()
  const isActive = exact 
    ? location.pathname === to 
    : location.pathname.startsWith(to) && (to === '/' ? location.pathname === '/' : true)

  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
          : 'text-foreground hover:bg-muted'
      )}
    >
      {children}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full shrink-0">
      <nav className="flex-1 p-4 space-y-6">
        <div>
          <NavLink to="/" exact>
            <span className="text-lg">📚</span>
            <span>Browse Gallery</span>
          </NavLink>
        </div>
        
        <div>
          <NavLink to="/global">
            <span className="text-lg">🌍</span>
            <span>Global Skills</span>
          </NavLink>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-sm font-semibold text-foreground/70">Projects</h3>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
              Import
            </Button>
          </div>
          
          <div className="px-2 py-4 text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-lg text-center">
            No projects
          </div>
        </div>
      </nav>
    </aside>
  )
}
