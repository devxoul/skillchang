# SkillPad

A desktop GUI wrapper for the [skills.sh](https://skills.sh) CLI tool.

![skillpad](docs/public/screenshots/global-skills.png)

## Motivation

Agent skills are powerful, and the skills CLI works well — but not everyone lives in the terminal. SkillPad gives you a visual way to browse, install, and manage skills without touching the command line.

## Features

- Browse skills from skills.sh gallery
- Search skills with debounced filtering
- View skill details with markdown rendering
- Install skills to selected agents (global or project scope)
- Remove installed skills
- Manage multiple projects with drag-to-reorder
- Configure default agents in preferences
- Keyboard shortcuts for navigation
- Automatic dark/light theme (follows system preference)
- Window state persistence

## Installation

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- [Rust](https://rustup.rs) (for Tauri)
- macOS or Windows

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd skillpad

# Install dependencies
bun install

# Run in development mode
bun run dev
```

## Usage

### Navigation

- **Gallery**: Browse all available skills from skills.sh
- **Global Skills**: View globally installed skills
- **Projects**: Import and manage project-specific skills

### Keyboard Shortcuts

- `Cmd/Ctrl + F` - Focus search
- `Cmd/Ctrl + 1` - Navigate to Gallery
- `Cmd/Ctrl + 2` - Navigate to Global Skills
- `Cmd/Ctrl + 3-9` - Navigate to projects (1st-7th)
- `Cmd/Ctrl + Shift + [` - Previous tab
- `Cmd/Ctrl + Shift + ]` - Next tab
- `Cmd/Ctrl + ,` - Open Preferences

### Adding Skills

1. Browse or search for a skill in the Gallery
2. Click "Add" on the skill card
3. Select scope (Global or Project)
4. Choose target agents
5. Click "Add" to install

### Managing Projects

1. Click "Import" in the Projects section
2. Select a project folder
3. The project appears in the sidebar
4. Drag to reorder projects

## Building

### Development

```bash
bun run dev
```

### Production Build

```bash
# macOS (Universal binary)
bun run tauri build --target universal-apple-darwin

# Windows
bun run tauri build --target x86_64-pc-windows-msvc
```

## Development

### Running Tests

```bash
# Unit tests
bun run test

# E2E tests
bun run test:e2e
```

### Type Checking

```bash
bun run typecheck
```

### Linting & Formatting

```bash
bun run lint
bun run lint:fix
bun run format
```

### Clean Build Artifacts

```bash
bun run clean
```

## License

MIT
