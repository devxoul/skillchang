# SkillPad Style Guide

A comprehensive design system inspired by Arc browser's UI patterns, optimized for native desktop feel using Tauri + React + Tailwind CSS v4.

---

## Design Philosophy

**Core Principles:**
- **Subtlety over contrast** — Use low-opacity overlay tokens instead of solid fills
- **Reveal on interaction** — Hide secondary actions until hover
- **Glassmorphism** — Translucent backgrounds with blur effects
- **Native feel** — Apple-like transitions and system fonts
- **Density** — Compact but readable, optimized for desktop

---

## Color System

### Overlay Token System

The codebase uses semantic overlay tokens defined in `index.css` that automatically adapt to light/dark mode via `prefers-color-scheme`. In light mode, overlays use `rgba(0,0,0,...)`. In dark mode, they use `rgba(255,255,255,...)`.

```css
/* Overlay backgrounds — use these instead of raw white/[0.06] */
bg-overlay-2          /* Subtle, barely visible */
bg-overlay-3          /* Subtle background, info cards */
bg-overlay-4          /* Input backgrounds, form containers */
bg-overlay-5          /* Section backgrounds */
bg-overlay-6          /* Hover state, search input default */
bg-overlay-8          /* Active/selected, badges, agent tags */
bg-overlay-10         /* Strong hover */
bg-overlay-12         /* Active nav item, selected state */
bg-overlay-15         /* Dragging state */

/* Overlay borders */
border-overlay-border         /* Standard border */
border-overlay-border-muted   /* Subtle separator (headers) */
border-overlay-ring           /* Focus ring */

/* Semantic backgrounds */
bg-background         /* transparent — allows native window vibrancy */
bg-surface            /* Semi-translucent surface */
bg-surface-hover      /* Surface hover */
bg-muted              /* Muted background */
```

### Text Colors

```css
text-foreground           /* Primary text */
text-foreground/70        /* Secondary text, nav items */
text-foreground/60        /* Icons, tertiary */
text-foreground/50        /* Muted, badge text */
text-foreground/40        /* Descriptions, section labels, placeholders */
text-foreground/30        /* Placeholder, disabled icons, shortcuts */
text-foreground/20        /* Disabled, empty states */
text-muted-foreground     /* Semantic muted text */
```

### Brand Colors

```css
brand-50 through brand-900    /* Sky/blue palette */
bg-brand-500/90               /* Primary button background */
text-brand-500                /* Selected item accent */
focus-visible:ring-brand-400/50   /* Focus rings on brand elements */
```

### Status Colors

Semantic tokens with three variants each (`base`, `-muted` for backgrounds, `-foreground` for text):

```css
/* Success */
bg-success-muted              /* Background */
text-success                  /* Icon/badge text */
text-success-foreground       /* Body text */

/* Error */
bg-error-muted                /* Background */
text-error                    /* Icon */
text-error-foreground         /* Body text */
border-error/30               /* Error border */

/* Warning */
bg-warning-muted              /* Background */
text-warning-foreground       /* Body text */

/* Info */
bg-info-muted                 /* Background */
text-info-foreground          /* Body text */
```

Status colors also have hardcoded Tailwind equivalents used in badges:

```css
/* Badge - success (linked) */
bg-emerald-500/10 text-emerald-500

/* Badge - warning (not linked) */
bg-amber-500/10 text-amber-500

/* Badge - info (update available) */
bg-sky-500/10 text-sky-500
```

---

## Typography

### Font Stack

```css
font-family: system-ui, -apple-system, sans-serif;
```

### Size Scale

| Use Case | Size | Class |
|----------|------|-------|
| Skill detail title | 24px | `text-2xl font-bold` |
| Dialog title | 18px | `text-lg font-semibold` |
| Page title | 15px | `text-[15px] font-semibold` |
| Item name / body | 13px | `text-[13px] font-medium` |
| Body text | 13px | `text-[13px]` |
| Description | 12px | `text-[12px]` |
| Section label / badge | 11px | `text-[11px]` |
| Badge / micro | 10px | `text-[10px]` |

### Font Weights

```css
font-medium     /* 500 - Item names, interactive elements, badges */
font-semibold   /* 600 - Page titles, dialog titles, active nav items */
font-bold       /* 700 - Rarely used, detail page skill name */
```

---

## Spacing

### Base Unit: 4px

Use Tailwind's spacing scale consistently:

| Token | Value | Common Use |
|-------|-------|------------|
| `0.5` | 2px | Icon gaps, section spacing |
| `1` | 4px | Tight padding |
| `1.5` | 6px | Badge padding, button small padding |
| `2` | 8px | Standard gap, form container padding |
| `2.5` | 10px | Item padding, nav item padding |
| `3` | 12px | Card padding, list item horizontal padding |
| `4` | 16px | Section gaps, prose code blocks |
| `5` | 20px | Page header horizontal padding |

### Component Spacing

```css
/* Nav items */
px-2.5 py-1.5 mx-2          /* Inset from edges, compact height */

/* List items */
px-3 py-2.5                  /* Standard list item */

/* Cards / installation status */
px-3 py-2.5                  /* Compact card */

/* Page sections */
px-5 pb-4                    /* Header padding (no top — drag region above) */
px-4 py-3                    /* Search area */
px-2                         /* List container */
```

---

## Borders & Separators

### Border Radius

```css
rounded         /* 4px - Small icon buttons, tags */
rounded-md      /* 6px - Buttons, inputs, nav items, badges */
rounded-lg      /* 8px - Cards, list items, containers, search input */
rounded-xl      /* 12px - Dialogs */
rounded-full    /* Status badges, pills */
```

### Separators

```tsx
/* Horizontal divider */
<div className="mx-3 my-2 h-px bg-foreground/[0.06]" />

/* Header border */
border-b border-overlay-border-muted

/* Vertical divider */
<div className="h-4 w-px bg-overlay-8" />
```

---

## Shadows

### Elevation System (CSS Custom Properties)

Defined in `index.css` as `--shadow-sm`, `--shadow-md`, `--shadow-lg` with different values for light and dark modes.

```css
/* Level 1 - Subtle lift (active items) */
shadow-sm                    /* --shadow-sm */

/* Level 2 - Dropdowns, popovers */
shadow-md                    /* --shadow-md */

/* Level 3 - Dialogs, modals */
shadow-lg                    /* --shadow-lg */

/* Inline shadows (when custom property doesn't fit) */
shadow-[0_1px_3px_rgba(0,0,0,0.08)]     /* Active nav item */
shadow-[0_4px_12px_rgba(0,0,0,0.15)]     /* Dragging state */
```

Dialog shadows use mode-specific inline values:

```css
shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.05)]
dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]
```

---

## Transitions

### Standard Easing

```css
/* Apple-like smooth easing */
ease-[cubic-bezier(0.4,0,0.2,1)]

/* Duration */
duration-150    /* Standard interactions */
duration-200    /* Larger animations, confirm-to-remove */
```

### Common Patterns

```css
/* Standard element transition */
transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]

/* Color only */
transition-colors duration-150

/* Opacity reveal */
transition-opacity duration-150

/* Width animation (confirm-to-remove) */
transition-[width] duration-200 ease-out
```

---

## Glassmorphism

### Sidebar

```css
bg-white/[0.25] backdrop-blur-2xl backdrop-saturate-[1.8]
dark:bg-black/[0.35]
border-r border-black/[0.06] dark:border-white/[0.08]
```

### Main Content

```css
bg-white/[0.4] backdrop-blur-2xl
dark:bg-black/[0.55]
```

### Dialogs / Modals / Popovers

```css
bg-background/95 backdrop-blur-xl
border border-foreground/10
```

### Backdrop Overlay

```css
bg-black/30 backdrop-blur-sm dark:bg-black/50
```

---

## Icons

### Libraries

**Phosphor Icons** — Primary icon library for all UI icons:

```tsx
import { IconName } from '@phosphor-icons/react'
```

**Lobe Hub Icons** — Agent/product brand icons only:

```tsx
import Claude from '@lobehub/icons/es/Claude/components/Mono'
```

### Sizes

| Context | Size | Example |
|---------|------|---------|
| Badge inline | 10-12px | `<Icon size={10} />` |
| Inline with text | 12-14px | `<Icon size={12} />` |
| List item / button | 14-16px | `<Icon size={16} />` |
| Nav item / header | 18px | `<Icon size={18} />` |
| Empty state | 24-32px | `<Icon size={32} />` |

### Weights

```tsx
weight="duotone"    /* Decorative icons, nav, section headers */
weight="bold"       /* Action buttons, interactive, search icon */
weight="fill"       /* Status indicators, GitHub logo, check circles */
```

### Common Icons

| Use | Icon |
|-----|------|
| Skills Directory | `Books` |
| Global | `Globe` |
| Folder/Project | `FolderOpen` |
| Folder (compact) | `Folder` |
| Add | `Plus` |
| Close / Remove | `X` |
| Delete | `Trash` |
| Search | `MagnifyingGlass` |
| Refresh | `ArrowClockwise` |
| Check Updates | `ArrowsClockwise` |
| Update Available | `ArrowUp` |
| Up to Date | `CheckCircle` |
| Download | `DownloadSimple` |
| Loading | `SpinnerGap` (with `animate-spin`) |
| Back | `ArrowLeft` |
| GitHub | `GithubLogo` |
| Link | `LinkSimple` |
| Warning | `Warning` |
| Settings | `Gear` |
| File | `FileText` |
| Empty state | `Package` |
| Fallback agent | `Robot` |

---

## UI Primitives (`src/ui/`)

### Button

Variants: `primary` (default), `secondary`, `ghost`. Sizes: `sm`, `md` (default), `lg`.

```tsx
import { Button } from '@/ui/button'

<Button variant="primary" size="md">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Action</Button>
```

| Variant | Background | Hover | Active |
|---------|-----------|-------|--------|
| `primary` | `bg-brand-500/90 text-white` | `bg-brand-500` | `bg-brand-600` |
| `secondary` | `bg-foreground/[0.04] border-foreground/10` | `bg-foreground/[0.08]` | `bg-foreground/[0.12]` |
| `ghost` | `bg-transparent` | `bg-foreground/[0.06]` | `bg-foreground/[0.10]` |

| Size | Height | Padding | Text |
|------|--------|---------|------|
| `sm` | `h-7` | `px-2.5` | `text-[12px]` |
| `md` | `h-8` | `px-3` | `text-[13px]` |
| `lg` | `h-9` | `px-4` | `text-[13px]` |

### Dialog

Built on `@base-ui-components/react/dialog`. Use compound components for full control:

```tsx
import { DialogRoot, DialogPortal, DialogBackdrop, DialogContent, DialogTitle } from '@/ui/dialog'

<DialogRoot open={open} onOpenChange={onOpenChange}>
  <DialogPortal>
    <DialogBackdrop />
    <DialogContent className="w-[480px]">
      <DialogTitle>Title</DialogTitle>
      {/* content */}
    </DialogContent>
  </DialogPortal>
</DialogRoot>
```

Uses `data-[starting-style]` and `data-[ending-style]` for enter/exit animations with `scale-95` + `opacity-0`.

### Command Palette

Built on `cmdk` (non-dialog mode) rendered inside the project's Dialog primitives. Styled via CSS attribute selectors in `index.css`.

```tsx
import { Command } from 'cmdk'
import { DialogRoot, DialogPortal, DialogBackdrop, DialogContent } from '@/ui/dialog'

<DialogRoot open={open} onOpenChange={onOpenChange}>
  <DialogPortal>
    <DialogBackdrop />
    <DialogContent className="w-[520px] p-0 overflow-hidden">
      <Command key={resetKey}>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group heading="Navigation">{/* items */}</Command.Group>
          <Command.Group heading="Skills">{/* items */}</Command.Group>
          <Command.Group heading="Actions">{/* items */}</Command.Group>
        </Command.List>
      </Command>
    </DialogContent>
  </DialogPortal>
</DialogRoot>
```

**CSS Attribute Selectors** (defined in `src/index.css`):

| Selector | Purpose | Key Styles |
|----------|---------|------------|
| `[cmdk-root]` | Container | `flex flex-col, overflow: hidden` |
| `[cmdk-input]` | Search input | `h-12 px-4 text-[14px], border-b border-overlay-border-muted` |
| `[cmdk-list]` | Scrollable list | `max-h-[300px] overflow-y-auto, p-2` |
| `[cmdk-item]` | Selectable item | `h-10 px-3 rounded-lg text-[13px], cursor-pointer` |
| `[cmdk-item][data-selected="true"]` | Selected item | `bg-overlay-10` |
| `[cmdk-group-heading]` | Group label | `text-[11px] font-medium uppercase tracking-wide text-foreground/40` |
| `[cmdk-separator]` | Divider | `h-px bg-overlay-border-muted` |
| `[cmdk-empty]` | No results | `py-6 text-center text-[13px] text-foreground/40` |

**Keyboard Shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open palette |
| `Escape` | Close palette |
| `↑` / `↓` | Navigate items |
| `Enter` | Select item |

**Key Patterns:**
- Use `Command` (non-dialog) — NOT `Command.Dialog` (bypasses project Dialog system)
- Use `key={resetKey}` to remount and clear search when palette opens
- Use `keywords` prop on items for alias matching (e.g., `keywords={["settings", "config"]}`)
- Close palette after action: call `onOpenChange(false)` in `onSelect`
- Group items: Navigation, Skills, Actions

### Checkbox

Built on `@base-ui-components/react/checkbox`:

```tsx
import { Checkbox } from '@/ui/checkbox'

<Checkbox checked={value} onCheckedChange={setValue} label="Option" />
```

Checked state uses brand color: `data-[checked]:bg-brand-500/90`.

### Select

Built on `@base-ui-components/react/select`. Compound components available:

```tsx
import { Select } from '@/ui/select'

<Select
  options={[{ label: 'Option', value: 'opt' }]}
  value={value}
  onValueChange={setValue}
  placeholder="Select..."
/>
```

### Segmented Control

Built on `@base-ui-components/react/radio`:

```tsx
import { SegmentedControl } from '@/ui/segmented-control'

<SegmentedControl
  options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
  value={value}
  onValueChange={setValue}
  aria-label="Mode"
/>
```

Container: `rounded-lg border border-foreground/10 bg-foreground/[0.04] p-0.5`. Active item: `data-[checked]:bg-foreground/[0.12]`.

### Popover

Built on `@base-ui-components/react/popover`:

```tsx
import * as Popover from '@/ui/popover'

<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner side="bottom" align="start" sideOffset={8}>
      <Popover.Content>Content</Popover.Content>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

### Input

```tsx
import { Input } from '@/ui/input'

<Input inputSize="md" placeholder="Enter value" error={hasError} />
```

Sizes: `sm` (`h-8`), `md` (`h-10`), `lg` (`h-12`). Focus: `border-brand-400/50 ring-brand-400/30`.

---

## Component Patterns

### Nav Item

```tsx
<Link
  to={to}
  className={clsx(
    'mx-2 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px]',
    'transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
    isActive
      ? 'bg-overlay-12 font-medium text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
      : 'text-foreground/70 hover:bg-overlay-6 hover:text-foreground',
  )}
>
  <Icon size={18} weight="duotone" className="text-foreground/60" />
  <span>Label</span>
</Link>
```

### List Item (with hover actions)

```tsx
<div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-overlay-6">
  <div className="min-w-0 flex-1">
    <span className="text-[13px] font-medium text-foreground">Name</span>
    <p className="text-[12px] text-foreground/40">Description</p>
  </div>
  <button className="shrink-0 cursor-pointer rounded-md p-1.5 text-foreground/40 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-overlay-10 hover:text-foreground/70">
    <Plus size={16} weight="bold" />
  </button>
</div>
```

### Section Header

```tsx
<header className="flex shrink-0 items-center justify-between border-b border-overlay-border-muted px-5 pb-4">
  <div>
    <div className="flex items-center gap-2">
      <Icon size={18} weight="duotone" className="text-foreground/50" />
      <h1 className="text-[15px] font-semibold text-foreground">Title</h1>
    </div>
    <p className="mt-0.5 text-[12px] text-foreground/40">Description</p>
  </div>
  <button className="cursor-pointer rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-overlay-6 hover:text-foreground/70">
    <ArrowClockwise size={16} weight="bold" />
  </button>
</header>
```

### Section Label

```tsx
<span className="text-[11px] font-medium uppercase tracking-wide text-foreground/40">
  Section
</span>
```

### Search Input

Custom component with debounced search, clear button, and Escape-to-clear:

```tsx
import { SearchInput } from '@/components/search-input'

<SearchInput onSearch={setSearchQuery} defaultValue={searchQuery} placeholder="Search skills..." />
```

Styling: `bg-overlay-6` default, `hover:bg-overlay-8 focus:bg-overlay-8 focus:ring-1 focus:ring-overlay-ring`.

### Icon Button

```tsx
<button
  className="cursor-pointer rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-overlay-6 hover:text-foreground/70"
  aria-label="Action"
>
  <Icon size={16} weight="bold" />
</button>
```

### Badge

```tsx
/* Neutral */
<span className="rounded-full bg-overlay-8 px-1.5 py-0.5 text-[11px] font-medium text-foreground/50">
  Label
</span>

/* Success (linked) */
<span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500">
  <LinkSimple size={10} weight="bold" />
  Linked
</span>

/* Warning (not linked) */
<span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
  Not linked
</span>

/* Info (update available) */
<span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-500">
  <ArrowUp size={10} weight="bold" />
  Update
</span>
```

### Agent Tag

```tsx
<span className="flex items-center gap-1 rounded bg-overlay-8 px-1.5 py-0.5 text-[10px] text-foreground/60">
  <AgentIcon agent={agent} size={12} />
  {agent}
</span>
```

### Empty State

```tsx
<div className="flex h-full items-center justify-center">
  <div className="text-center">
    <Package size={32} weight="duotone" className="mx-auto text-foreground/20" />
    <p className="mt-2 text-[13px] text-foreground/40">No items found</p>
  </div>
</div>
```

### Loading State (Inline Action)

For button/badge spinners — inline action feedback only:

```tsx
/* Refresh/action button */
<SpinnerGap size={16} weight="bold" className={loading ? 'animate-spin' : ''} />

/* Badge status */
<span className="flex items-center gap-1 rounded-full bg-overlay-6 px-1.5 py-0.5 text-[10px]">
  <SpinnerGap size={10} className="animate-spin" />
  Checking...
</span>
```

### Skeleton Loading (Content Areas)

Use skeletons for content-area loading states — not spinners. Skeletons approximate the shape of the content being loaded.

#### Skeleton Primitive

```tsx
import { Skeleton } from '@/ui/skeleton'

/* Text line */
<Skeleton className="h-3.5 w-28" />

/* Badge pill */
<Skeleton className="h-4 w-10 rounded-full" />

/* Full width block */
<Skeleton className="h-4 w-full" />

/* Card container */
<Skeleton className="h-10 w-56 rounded-lg" />
```

Base classes: `animate-shimmer rounded bg-foreground/[0.06]`. Override border radius via `className`.

#### Shimmer Animation

Defined in `src/index.css` as `@utility animate-shimmer`:
- Gradient sweep: `linear-gradient(90deg, transparent → foreground/8% → transparent)`
- Timing: `1.5s ease-in-out infinite`
- Dark mode: automatic (uses `var(--color-foreground)`)

#### Composite Skeleton Components

Pre-built skeletons that match real component layouts:

```tsx
import { SkillCardSkeleton } from '@/components/skill-card-skeleton'
import { InstalledSkillItemSkeleton } from '@/components/installed-skill-item-skeleton'
import { SkillDetailSkeleton } from '@/components/skill-detail-skeleton'

/* Gallery list loading — show 6 */
<div className="space-y-0.5 pb-4">
  {Array.from({ length: 6 }).map((_, i) => <SkillCardSkeleton key={i} />)}
</div>

/* Installed list loading — show 4 */
<div className="space-y-0.5 px-2 py-2">
  {Array.from({ length: 4 }).map((_, i) => <InstalledSkillItemSkeleton key={i} />)}
</div>

/* Detail view loading */
<SkillDetailSkeleton />
```

#### When to Use Skeleton vs Spinner

| Situation | Use |
|-----------|-----|
| Initial page/list load | `Skeleton` components |
| Inline text placeholder | `<span className="animate-shimmer rounded" />` |
| Button action in progress | `SpinnerGap` with `animate-spin` |
| Badge status (checking, updating) | `SpinnerGap` with `animate-spin` |
| Remove/delete action | `SpinnerGap` with `animate-spin` |

### Inline Error

```tsx
import { InlineError } from '@/components/inline-error'

<InlineError message={error} onRetry={refresh} />
```

Uses semantic tokens: `border-error/30 bg-error-muted`, icon `text-error`, text `text-error-foreground`.

### Confirm-to-Remove Pattern

Two-step removal: first click reveals "Remove" text, second click executes. Auto-resets after 2 seconds.

```tsx
<button
  className={clsx(
    'relative flex h-4 shrink-0 cursor-pointer items-center justify-end',
    confirmingRemove ? 'w-11' : 'w-4',
    'transition-[width] duration-200 ease-out',
  )}
>
  <span className={clsx(
    'absolute right-0 text-[11px] leading-none transition-all duration-200 ease-out',
    confirmingRemove
      ? 'translate-x-0 text-foreground/50 opacity-100 hover:text-foreground/70'
      : 'pointer-events-none translate-x-2 text-foreground/50 opacity-0',
  )}>Remove</span>
  <X size={14} className={clsx(
    'absolute right-0 transition-all duration-200 ease-out',
    confirmingRemove
      ? 'pointer-events-none -translate-x-2 opacity-0'
      : 'translate-x-0 opacity-0 group-hover:opacity-100',
    !confirmingRemove && 'text-foreground/30 hover:text-foreground/50',
  )} />
</button>
```

### Update Banner

Compact inline banner in sidebar for app update notifications:

```tsx
<div className="mx-2 mb-2 rounded-md bg-overlay-6 px-2.5 py-2 backdrop-blur-sm">
  <span className="text-[12px] font-medium text-foreground/60">v{version} available</span>
  <button className="flex items-center gap-1.5 rounded bg-foreground/[0.08] px-2 py-1 text-[11px] font-medium text-foreground">
    <DownloadSimple size={12} weight="bold" />
    Download
  </button>
</div>
```

### Form Container

Used in dialogs for checkbox lists (agents, projects):

```tsx
<div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-foreground/10 bg-foreground/[0.02] p-2">
  <label className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-[13px] transition-colors duration-150 hover:bg-foreground/[0.06]">
    <Checkbox checked={checked} onCheckedChange={onChange} />
    <Icon size={16} weight="duotone" className="text-foreground/50" />
    <span>Label</span>
  </label>
</div>
```

### Preferences Form Container

Slightly different style for preferences:

```tsx
<div className="max-h-64 space-y-0.5 overflow-y-auto rounded-lg border border-overlay-border-muted bg-overlay-4 p-2">
  <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-overlay-6">
    <Checkbox ... />
    <span className="text-foreground">Label</span>
  </label>
</div>
```

### Markdown Prose

For rendering skill SKILL.md content:

```tsx
<div className="prose prose-sm max-w-none text-foreground/80 dark:prose-invert
  prose-headings:text-foreground
  prose-a:text-brand-600 dark:prose-a:text-emerald-400
  prose-strong:text-foreground
  prose-code:rounded prose-code:bg-overlay-8 prose-code:px-1.5 prose-code:py-0.5
  prose-code:text-[12px] prose-code:font-normal prose-code:text-foreground/80
  prose-code:before:content-none prose-code:after:content-none
  prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border
  prose-pre:border-overlay-border prose-pre:bg-overlay-4 prose-pre:p-4
  prose-pre:text-[12px] prose-pre:leading-relaxed dark:prose-pre:bg-black/[0.4]
  prose-table:w-full prose-table:border-collapse prose-table:text-[13px]
  prose-th:border prose-th:border-overlay-border prose-th:bg-overlay-5
  prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium
  prose-td:border prose-td:border-overlay-border prose-td:px-3 prose-td:py-2
  [&_pre_code]:bg-transparent [&_pre_code]:p-0"
>
```

---

## Dark Mode

Dark mode is automatic via `prefers-color-scheme` media query — no class-based toggle.

- **Overlay tokens** (`overlay-*`) switch between `rgba(0,0,0,...)` (light) and `rgba(255,255,255,...)` (dark) via CSS custom properties in `index.css`
- **Glassmorphism** uses explicit `dark:` variants for sidebar and main content backgrounds
- **Shadows** have different intensity per mode via `--shadow-*` custom properties
- **Status colors** shift slightly brighter in dark mode

Always prefer overlay tokens over raw color values to get free dark mode support.

---

## Drag and Drop

Uses `@dnd-kit/core` + `@dnd-kit/sortable` for sidebar project reordering:

```tsx
/* Dragging state */
z-10 scale-[1.02] cursor-grabbing bg-overlay-15 shadow-[0_4px_12px_rgba(0,0,0,0.15)]
```

Activation constraint: `distance: 8` (prevents accidental drags on click).

---

## Do's and Don'ts

### Do

- Use overlay tokens (`bg-overlay-6`) for universal theme support
- Hide secondary actions until hover (`opacity-0 group-hover:opacity-100`)
- Use `text-[13px]` as default body text
- Apply `transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]`
- Use Phosphor icons with `weight="duotone"` or `weight="bold"`
- Keep borders subtle (`border-overlay-border` or `border-overlay-border-muted`)
- Use `cursor-pointer` on interactive elements
- Use `type="button"` on non-submit buttons
- Use `aria-label` on icon-only buttons
- Use base-ui primitives for complex widgets (Dialog, Select, Checkbox, Radio)

### Don't

- Use solid background colors for interactive elements
- Show all actions at once (reveal on hover instead)
- Use heavy shadows or thick borders
- Use bright focus rings with offsets
- Mix icon libraries (Phosphor for UI, Lobe Hub for agent brands only)
- Use arbitrary spacing values
- Use raw `white/[0.06]` or `black/[0.06]` — prefer overlay tokens
- Use `npm`, `npx`, `yarn` — use `bun`, `bunx`

---

## File Structure

```
src/
├── components/           # Feature components
│   ├── add-skill-dialog.tsx
│   ├── agent-icon.tsx
│   ├── code-block.tsx
│   ├── command-palette.tsx
│   ├── error-boundary.tsx
│   ├── inline-error.tsx
│   ├── installed-skill-item-skeleton.tsx
│   ├── layout.tsx
│   ├── main-content.tsx
│   ├── preferences-dialog.tsx
│   ├── search-input.tsx
│   ├── sidebar.tsx
│   ├── skill-card.tsx
│   ├── skill-card-skeleton.tsx
│   ├── skill-detail-skeleton.tsx
│   └── update-banner.tsx
├── ui/                   # Base UI primitives (base-ui wrappers)
│   ├── button.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── popover.tsx
│   ├── segmented-control.tsx
│   ├── select.tsx
│   └── skeleton.tsx
├── views/                # Page-level components
│   ├── installed-skills-view.tsx
│   ├── skill-detail-view.tsx
│   └── skill-gallery-view.tsx
├── hooks/                # Custom React hooks
│   ├── use-app-update.ts
│   ├── use-debounced-value.ts
│   ├── use-keyboard-shortcuts.ts
│   ├── use-persisted-search.ts
│   ├── use-preferences.ts
│   └── use-scroll-restoration.ts
├── contexts/             # React contexts
│   ├── app-update-context.tsx
│   ├── projects-context.tsx
│   ├── scroll-context.tsx
│   ├── search-context.tsx
│   ├── skills-context.tsx
│   └── theme-context.tsx
├── types/                # TypeScript types
│   ├── api.ts
│   ├── app-update.ts
│   ├── preferences.ts
│   ├── project.ts
│   ├── skill.ts
│   └── update-status.ts
├── lib/                  # Utilities and API
│   ├── ansi.ts
│   ├── api.ts
│   ├── cli.ts
│   ├── command-queue.ts
│   └── projects.ts
├── data/                 # Static data
│   └── agents.ts
├── app.tsx
├── main.tsx
├── index.css             # Theme variables & overlay tokens
└── test-setup.ts
```

---

## Quick Reference

```css
/* Hover background */      bg-overlay-6
/* Active background */     bg-overlay-12
/* Primary text */          text-foreground
/* Secondary text */        text-foreground/40
/* Border */                border-overlay-border-muted
/* Focus ring */            focus:ring-overlay-ring
/* Transition */            transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]
/* Border radius */         rounded-lg
/* Body text */             text-[13px]
/* Icon size */             16px (weight="bold")
/* Nav icon */              18px (weight="duotone")
/* Section label */         text-[11px] font-medium uppercase tracking-wide text-foreground/40
/* Primary button */        bg-brand-500/90 text-white
```
