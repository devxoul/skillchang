import { clsx } from 'clsx'
import { Link, useLocation } from 'react-router-dom'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from './ui/button'
import { useProjects } from '@/hooks/use-projects'
import type { Project } from '@/types/project'

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
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
          : 'text-foreground hover:bg-muted',
      )}
    >
      {children}
    </Link>
  )
}

interface ProjectItemProps {
  project: Project
  onRemove: (id: string) => void
}

function ProjectItem({ project, onRemove }: ProjectItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        ⋮⋮
      </button>
      <Link to={`/project/${project.id}`} className="flex-1 truncate text-foreground">
        {project.name}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault()
          onRemove(project.id)
        }}
        className="hover:text-destructive text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Remove project"
      >
        ×
      </button>
    </div>
  )
}

export function Sidebar() {
  const { projects, loading, importProject, removeProject, reorderProjects } = useProjects()

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = projects.findIndex((p) => p.id === active.id)
    const newIndex = projects.findIndex((p) => p.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const newOrder = [...projects]
    const [moved] = newOrder.splice(oldIndex, 1)
    if (!moved) {
      return
    }
    newOrder.splice(newIndex, 0, moved)

    reorderProjects(newOrder)
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface">
      <nav className="flex-1 space-y-6 p-4">
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
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="text-sm font-semibold text-foreground/70">Projects</h3>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={importProject}>
              Import
            </Button>
          </div>

          {loading ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border/50 px-2 py-4 text-center text-sm text-muted-foreground">
              No projects
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={projects.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {projects.map((project) => (
                    <ProjectItem key={project.id} project={project} onRemove={removeProject} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </nav>
    </aside>
  )
}
