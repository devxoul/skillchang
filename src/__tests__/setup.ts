import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('@lobehub/icons', () => ({
  Claude: () => null,
  Cursor: () => null,
  Cline: () => null,
  Windsurf: () => null,
  GithubCopilot: () => null,
  Gemini: () => null,
  OpenAI: () => null,
  DeepSeek: () => null,
  CodeGeeX: () => null,
  Replit: () => null,
  Aws: () => null,
}))

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-store', () => ({
  Store: {
    load: vi.fn().mockResolvedValue({
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      save: vi.fn().mockResolvedValue(undefined),
    }),
  },
}))

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: vi.fn(() => ({
    theme: vi.fn().mockResolvedValue('light'),
    onThemeChanged: vi.fn().mockResolvedValue(() => {}),
    onMoved: vi.fn().mockResolvedValue(() => {}),
    onResized: vi.fn().mockResolvedValue(() => {}),
  })),
}))

vi.mock('@tauri-apps/plugin-window-state', () => ({
  restoreStateCurrent: vi.fn().mockResolvedValue(undefined),
  saveWindowState: vi.fn().mockResolvedValue(undefined),
}))
