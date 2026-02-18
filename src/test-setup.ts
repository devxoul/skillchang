// DOM globals and MessageChannel mock are in test-globals.ts (loaded first via bunfig preload)
import { afterEach, expect, mock } from 'bun:test'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import {
  mockDialogOpen,
  mockHomeDir,
  mockHttpFetch,
  mockProcessExit,
  mockProcessRelaunch,
  mockSavePreferences,
  mockShellCreate,
  mockStoreGet,
  mockStoreSave,
  mockStoreSet,
  mockUpdaterCheck,
  mockUsePreferences,
  mockWindowOnMoved,
  mockWindowOnResized,
  mockWindowOnThemeChanged,
  mockWindowTheme,
} from './test-mocks'

expect.extend(matchers)

afterEach(() => {
  cleanup()
  mockUsePreferences.mockReset()
  mockSavePreferences.mockReset()
  mockUsePreferences.mockImplementation(() => ({
    preferences: { defaultAgents: [], packageManager: 'npx', autoCheckUpdates: false },
    loading: false,
    savePreferences: mockSavePreferences,
  }))
})

mock.module('@lobehub/icons', () => ({
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

mock.module('@tauri-apps/api/core', () => ({
  invoke: mock(() => {}),
  Channel: class {},
  PluginListener: class {},
  Resource: class {},
  SERIALIZE_TO_IPC_FN: Symbol('SERIALIZE_TO_IPC_FN'),
  addPluginListener: mock(() => {}),
  checkPermissions: mock(() => {}),
  convertFileSrc: mock(() => {}),
  isTauri: mock(() => true),
  requestPermissions: mock(() => {}),
  transformCallback: mock(() => {}),
}))

mock.module('@tauri-apps/plugin-http', () => ({
  fetch: mockHttpFetch,
}))

mock.module('@tauri-apps/plugin-store', () => ({
  Store: {
    load: async () => ({
      get: mockStoreGet,
      set: mockStoreSet,
      save: mockStoreSave,
    }),
  },
}))

mock.module('@tauri-apps/plugin-shell', () => ({
  Command: {
    create: mockShellCreate,
  },
  open: mock(async () => undefined),
}))

mock.module('@tauri-apps/plugin-dialog', () => ({
  open: mockDialogOpen,
}))

mock.module('@tauri-apps/plugin-updater', () => ({
  check: mockUpdaterCheck,
}))

mock.module('@tauri-apps/plugin-process', () => ({
  relaunch: mockProcessRelaunch,
  exit: mockProcessExit,
}))

mock.module('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    theme: mockWindowTheme,
    onThemeChanged: mockWindowOnThemeChanged,
    onMoved: mockWindowOnMoved,
    onResized: mockWindowOnResized,
  }),
}))

mock.module('@tauri-apps/plugin-window-state', () => ({
  restoreStateCurrent: mock(async () => undefined),
  saveWindowState: mock(async () => undefined),
}))

mock.module('@tauri-apps/api/path', () => ({
  homeDir: mockHomeDir,
}))

mock.module('@/hooks/use-preferences', () => ({
  usePreferences: mockUsePreferences,
}))
