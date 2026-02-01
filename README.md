# Skillchang (스킬창)

A desktop GUI wrapper for the [skills.sh](https://skills.sh) CLI tool. The name comes from Korean gaming terminology meaning "skill window/panel" where players manage their character skills.

## Features

- 📦 Browse skills from skills.sh gallery
- 🔍 Search skills with debounced filtering
- ➕ Install skills to selected agents (global or project scope)
- 🗑️ Remove installed skills
- 📁 Manage multiple projects
- ⚙️ Configure default agents in preferences
- ⌨️ Keyboard shortcuts for navigation
- 🌓 Automatic dark/light theme (follows system preference)
- 💾 Window state persistence

## Installation

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- [Rust](https://rustup.rs) (for Tauri)
- macOS or Windows

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd skillchang

# Install dependencies
bun install

# Run in development mode
bun run tauri dev
```

## Usage

### Navigation

- **Gallery**: Browse all available skills from skills.sh
- **Global Skills**: View globally installed skills
- **Projects**: Import and manage project-specific skills

### Keyboard Shortcuts

- `Cmd/Ctrl + K` - Focus search
- `Cmd/Ctrl + 0` - Navigate to Gallery
- `Cmd/Ctrl + 1` - Navigate to Global Skills
- `Cmd/Ctrl + 2-9` - Navigate to projects (1st-8th)
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
bun run tauri dev
```

### Production Build

```bash
# macOS (Universal binary)
bun run tauri build --target universal-apple-darwin

# Windows
bun run tauri build --target x86_64-pc-windows-msvc
```

## Tech Stack

- **Runtime**: Bun
- **Desktop Framework**: Tauri v2
- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **UI Components**: @base-ui/react (headless)
- **Testing**: Vitest + React Testing Library
- **Formatting**: Biome
- **Linting**: ESLint (Tailwind class sorting only)

## Development

### Running Tests

```bash
bun test
```

### Type Checking

```bash
bun run typecheck
```

### Formatting

```bash
bun run format
```

## License

MIT
