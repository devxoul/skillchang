import type { DragEndEvent } from '@dnd-kit/core'
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Books, FolderOpen, Gear, Globe, Plus, X } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useProjects } from '@/contexts/projects-context'
import type { Project } from '@/types/project'

function useModifierKey() {
  const [isPressed, setIsPressed] = useState(false)
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    const mac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    setIsMac(mac)

    function handleKeyDown(event: KeyboardEvent) {
      if (mac ? event.metaKey : event.ctrlKey) {
        setIsPressed(true)
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (mac ? event.key === 'Meta' : event.key === 'Control') {
        setIsPressed(false)
      }
    }

    function handleBlur() {
      setIsPressed(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return { isPressed, modifierSymbol: isMac ? '⌘' : '^' }
}

interface NavLinkProps {
  to: string
  children: React.ReactNode
  exact?: boolean
  shortcut?: string
  showShortcut?: boolean
  modifierSymbol?: string
}

function NavLink({ to, children, exact = false, shortcut, showShortcut, modifierSymbol }: NavLinkProps) {
  const location = useLocation()
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to) && (to === '/' ? location.pathname === '/' : true)

  return (
    <Link
      to={to}
      className={clsx(
        'mx-2 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isActive
          ? 'bg-white/[0.12] font-medium text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
          : 'text-foreground/70 hover:bg-white/[0.06] hover:text-foreground',
      )}
    >
      {children}
      {shortcut && showShortcut && (
        <span className="ml-auto text-[11px] text-foreground/30">
          {modifierSymbol}
          {shortcut}
        </span>
      )}
    </Link>
  )
}

interface ProjectItemProps {
  project: Project
  onRemove: (id: string) => void
  shortcut?: string
  showShortcut?: boolean
  modifierSymbol?: string
}

function ProjectItem({ project, onRemove, shortcut, showShortcut, modifierSymbol }: ProjectItemProps) {
  const location = useLocation()
  const isActive = location.pathname === `/project/${project.id}`
  const [disableClick, setDisableClick] = useState(false)
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  })

  useEffect(() => {
    if (isDragging) {
      setDisableClick(true)
    } else if (disableClick) {
      const timer = setTimeout(() => {
        setDisableClick(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isDragging, disableClick])

  useEffect(() => {
    if (confirmingRemove) {
      const timer = setTimeout(() => setConfirmingRemove(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [confirmingRemove])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="mx-2" {...attributes} {...listeners} tabIndex={-1}>
      <Link
        to={`/project/${project.id}`}
        style={disableClick ? { pointerEvents: 'none' } : undefined}
        className={clsx(
          'group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isDragging
            ? 'z-10 scale-[1.02] cursor-grabbing bg-white/[0.15] shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
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
            isActive ? 'font-medium text-foreground' : 'text-foreground/70',
          )}
        >
          {project.name}
        </span>
        {shortcut && showShortcut && (
          <span className="shrink-0 text-[11px] text-foreground/30">
            {modifierSymbol}
            {shortcut}
          </span>
        )}
        {!showShortcut && (
          <button
            type="button"
            tabIndex={confirmingRemove ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (confirmingRemove) {
                onRemove(project.id)
              } else {
                setConfirmingRemove(true)
              }
            }}
            onBlur={() => setConfirmingRemove(false)}
            className={clsx(
              'relative flex h-4 shrink-0 cursor-pointer items-center justify-end',
              confirmingRemove ? 'w-11' : 'w-4',
              'transition-[width] duration-200 ease-out',
            )}
            aria-label={confirmingRemove ? 'Click to confirm' : 'Remove project'}
          >
            <span
              className={clsx(
                'absolute right-0 text-[11px] leading-none transition-all duration-200 ease-out',
                confirmingRemove
                  ? 'translate-x-0 text-foreground/50 opacity-100 hover:text-foreground/70'
                  : 'pointer-events-none translate-x-2 text-foreground/50 opacity-0',
              )}
            >
              Remove
            </span>
            <X
              size={14}
              className={clsx(
                'absolute right-0 transition-all duration-200 ease-out',
                confirmingRemove
                  ? 'pointer-events-none -translate-x-2 opacity-0'
                  : 'translate-x-0 opacity-0 group-hover:opacity-100',
                !confirmingRemove && 'text-foreground/30 hover:text-foreground/50',
              )}
            />
          </button>
        )}
      </Link>
    </div>
  )
}

interface SidebarProps {
  onOpenPreferences?: () => void
}

export function Sidebar({ onOpenPreferences }: SidebarProps) {
  const { projects, loading, importProject, removeProject, reorderProjects } = useProjects()
  const { isPressed: showShortcuts, modifierSymbol } = useModifierKey()
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
          <NavLink to="/" exact shortcut="1" showShortcut={showShortcuts} modifierSymbol={modifierSymbol}>
            <Books size={18} weight="duotone" className="text-foreground/60" />
            <span>Skills Directory</span>
          </NavLink>
          <NavLink to="/global" shortcut="2" showShortcut={showShortcuts} modifierSymbol={modifierSymbol}>
            <Globe size={18} weight="duotone" className="text-foreground/60" />
            <span>Global Skills</span>
          </NavLink>
        </div>

        <div className="mx-3 my-2 h-px bg-foreground/[0.06]" />

        <div className="flex flex-1 flex-col">
          <div className="mb-1 flex items-center justify-between px-3">
            <span className="text-[11px] font-medium tracking-wide text-foreground/40 uppercase">Projects</span>
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
              <div className="px-3 py-6 text-center text-[12px] text-foreground/30">No projects</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0.5">
                    {projects.map((project, index) => (
                      <ProjectItem
                        key={project.id}
                        project={project}
                        onRemove={removeProject}
                        shortcut={index < 7 ? String(index + 3) : undefined}
                        showShortcut={showShortcuts}
                        modifierSymbol={modifierSymbol}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <div className="mx-3 my-2 h-px bg-foreground/[0.06]" />
          <div className="mx-2">
            <button
              type="button"
              onClick={onOpenPreferences}
              className={clsx(
                'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px]',
                'transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
                'text-foreground/70 hover:bg-white/[0.06] hover:text-foreground',
              )}
            >
              <Gear size={18} weight="duotone" className="text-foreground/60" />
              <span>Preferences</span>
              {showShortcuts && <span className="ml-auto text-[11px] text-foreground/30">{modifierSymbol},</span>}
            </button>
          </div>
        </div>
      </nav>
    </aside>
  )
}
