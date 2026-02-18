import { mock } from 'bun:test'

// @tauri-apps/plugin-http
export const mockHttpFetch = mock(async (..._args: any[]): Promise<any> => undefined)

// @tauri-apps/plugin-store
export const mockStoreGet = mock(async (_key: string): Promise<any> => null)
export const mockStoreSet = mock(async (_key: string, _value: any): Promise<void> => undefined)
export const mockStoreSave = mock(async (): Promise<void> => undefined)

// @tauri-apps/plugin-shell
export const mockShellExecute = mock(async (..._args: any[]): Promise<any> => undefined)
export const mockShellCreate = mock((..._args: any[]): any => ({
  execute: (...args: any[]) => mockShellExecute(...args),
}))

// @tauri-apps/plugin-dialog
export const mockDialogOpen = mock(async (): Promise<any> => null)

// @tauri-apps/plugin-updater
export const mockUpdaterCheck = mock(async (): Promise<any> => null)

// @tauri-apps/plugin-process
export const mockProcessRelaunch = mock(async (): Promise<void> => undefined)
export const mockProcessExit = mock(async (): Promise<void> => undefined)

// @tauri-apps/api/window
export const mockWindowTheme = mock(async (): Promise<string> => 'light')
export const mockWindowOnThemeChanged = mock(async (): Promise<() => void> => () => {})
export const mockWindowOnMoved = mock(async (): Promise<() => void> => () => {})
export const mockWindowOnResized = mock(async (): Promise<() => void> => () => {})

// @tauri-apps/api/path
export const mockHomeDir = mock(async (): Promise<string> => '/Users/test')

// @/hooks/use-preferences
export const mockSavePreferences = mock(async (): Promise<void> => undefined)
export const mockUsePreferences = mock((): any => ({
  preferences: { defaultAgents: [], packageManager: 'npx', autoCheckUpdates: false },
  loading: false,
  savePreferences: mockSavePreferences,
}))

// @/contexts/app-update-context
export const mockCheckForUpdateCtx = mock(async (): Promise<boolean> => false)
export const mockDownloadUpdateCtx = mock(async (): Promise<void> => undefined)
export const mockRestartToUpdateCtx = mock(async (): Promise<void> => undefined)
export const mockUseAppUpdateContext = mock((): any => ({
  state: { status: 'idle' as const },
  checkForUpdate: mockCheckForUpdateCtx,
  downloadUpdate: mockDownloadUpdateCtx,
  restartToUpdate: mockRestartToUpdateCtx,
}))

// @/hooks/use-app-update
export const mockUseAppUpdate = mock((): any => ({
  state: { status: 'idle' as const },
  checkForUpdate: mock(async () => false),
  downloadUpdate: mock(async () => undefined),
  restartToUpdate: mock(async () => undefined),
}))
