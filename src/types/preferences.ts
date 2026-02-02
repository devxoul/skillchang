export type PackageManager = 'npx' | 'pnpx' | 'bunx'

export interface Preferences {
  defaultAgents: string[]
  packageManager: PackageManager
}
