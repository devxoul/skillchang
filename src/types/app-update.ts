export type AppUpdateState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; version: string }
  | { status: 'downloading' }
  | { status: 'ready' }
  | { status: 'error'; message: string }
