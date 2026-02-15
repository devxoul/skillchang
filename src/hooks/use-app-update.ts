import { fetch } from '@tauri-apps/plugin-http'
import { relaunch } from '@tauri-apps/plugin-process'
import { Store } from '@tauri-apps/plugin-store'
import { check } from '@tauri-apps/plugin-updater'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppUpdateState } from '@/types/app-update'

const COOLDOWN_MS = 3600000

let store: Store | null = null

async function getStore() {
  if (!store) {
    store = await Store.load('skillpad.json')
  }
  return store
}

function getFirstBinaryUrl(rawJson: any): string | null {
  const platforms = rawJson?.platforms
  if (!platforms) return null
  const keys = Object.keys(platforms)
  if (keys.length === 0) return null
  const key = keys[0]
  return key ? (platforms[key]?.url ?? null) : null
}

async function verifyBinaryExists(rawJson: any): Promise<boolean> {
  const url = getFirstBinaryUrl(rawJson)
  if (!url) return false
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

interface UseAppUpdateOptions {
  autoCheckUpdates: boolean
}

export function useAppUpdate({ autoCheckUpdates }: UseAppUpdateOptions) {
  const [state, setState] = useState<AppUpdateState>({ status: 'idle' })
  const updateRef = useRef<any>(null)

  const checkForUpdate = useCallback(async () => {
    setState({ status: 'checking' })
    try {
      const s = await getStore()
      await s.set('lastUpdateCheck', Date.now())
      await s.save()

      const update = await check()
      if (!update) {
        setState({ status: 'idle' })
        return false
      }

      const binaryReady = await verifyBinaryExists(update.rawJson)
      if (!binaryReady) {
        setState({ status: 'idle' })
        return false
      }

      updateRef.current = update
      setState({ status: 'available', version: update.version })
      return true
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : 'Unknown error' })
      return false
    }
  }, [])

  const downloadUpdate = useCallback(async () => {
    if (!updateRef.current) return
    setState({ status: 'downloading' })
    try {
      await updateRef.current.downloadAndInstall()
      setState({ status: 'ready' })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : 'Download failed' })
    }
  }, [])

  const restartToUpdate = useCallback(async () => {
    await relaunch()
  }, [])

  useEffect(() => {
    if (!autoCheckUpdates) return

    let cancelled = false

    async function autoCheck() {
      const s = await getStore()
      const lastCheck = await s.get<number>('lastUpdateCheck')
      if (lastCheck && Date.now() - lastCheck < COOLDOWN_MS) return

      if (cancelled) return

      const found = await checkForUpdate()
      if (found && !cancelled) {
        await downloadUpdate()
      }
    }

    autoCheck()

    return () => {
      cancelled = true
    }
  }, [autoCheckUpdates, checkForUpdate, downloadUpdate])

  return { state, checkForUpdate, downloadUpdate, restartToUpdate }
}
