import { useProjects } from '@/hooks/use-projects'
import type { Project } from '@/types/project'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Books, FolderOpen, Globe, Plus, X } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Link, useLocation } from 'react-router-dom'

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
        'flex items-center gap-2.5 rounded-md mx-2 px-2.5 py-1.5 text-[13px] transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isActive
          ? 'bg-white/[0.12] text-foreground font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
          : 'text-foreground/70 hover:bg-white/[0.06] hover:text-foreground',
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
  const location = useLocation()
  const isActive = location.pathname === `/project/${project.id}`
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="mx-2" {...attributes} {...listeners}>
      <Link
        to={`/project/${project.id}`}
        onClick={(e) => isDragging && e.preventDefault()}
        className={clsx(
          'group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isDragging
            ? 'bg-white/[0.15] shadow-[0_4px_12px_rgba(0,0,0,0.15)] scale-[1.02] z-10 cursor-grabbing'
            : isActive
              ? 'bg-white/[0.12] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
              : 'hover:bg-white/[0.06]',
        )}
      >
        <FolderOpen
          size={16}
          weight="duotone"
          className={clsx('shrink-0', isActive ? 'text-foreground/70' : 'text-foreground/50')}
        />
        <span
          className={clsx(
            'flex-1 truncate transition-colors group-hover:text-foreground',
            isActive ? 'text-foreground font-medium' : 'text-foreground/70',
          )}
        >
          {project.name}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onRemove(project.id)
          }}
          className="shrink-0 cursor-pointer text-foreground/30 opacity-0 transition-all duration-150 hover:text-red-400 group-hover:opacity-100"
          aria-label="Remove project"
        >
          <X size={14} />
        </button>
      </Link>
    </div>
  )
}

export function Sidebar() {
  const { projects, loading, importProject, removeProject, reorderProjects } = useProjects()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

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
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-white/[0.08] bg-black/[0.03] backdrop-blur-2xl backdrop-saturate-[1.8] dark:bg-white/[0.03]">
      <div data-tauri-drag-region className="h-13 shrink-0" />
      <nav className="flex flex-1 flex-col gap-1 pb-3">
        <div className="space-y-0.5">
          <NavLink to="/" exact>
            <Books size={18} weight="duotone" className="text-foreground/60" />
            <span>Gallery</span>
          </NavLink>
          <NavLink to="/global">
            <Globe size={18} weight="duotone" className="text-foreground/60" />
            <span>Global Skills</span>
          </NavLink>
        </div>

        <div className="mx-3 my-2 h-px bg-foreground/[0.06]" />

        <div className="flex flex-1 flex-col">
          <div className="mb-1 flex items-center justify-between px-3">
            <span className="text-[11px] font-medium uppercase tracking-wide text-foreground/40">
              Projects
            </span>
            <button
              type="button"
              onClick={importProject}
              className="cursor-pointer rounded p-0.5 text-foreground/40 transition-colors hover:bg-white/[0.08] hover:text-foreground/70"
              aria-label="Import project"
            >
              <Plus size={14} weight="bold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-6 text-center text-[12px] text-foreground/40">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12px] text-foreground/30">
                No projects
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={projects.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0.5">
                    {projects.map((project) => (
                      <ProjectItem key={project.id} project={project} onRemove={removeProject} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </nav>
    </aside>
  )
}
