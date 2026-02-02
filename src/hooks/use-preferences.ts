import type { Preferences } from '@/types/preferences'
import { Store } from '@tauri-apps/plugin-store'
import { useEffect, useState } from 'react'

const STORE_KEY = 'preferences'
let store: Store | null = null

const DEFAULT_PREFERENCES: Preferences = {
  defaultAgents: [],
  packageManager: 'npx',
}

async function getStore() {
  if (!store) {
    store = await Store.load('skillchang.json')
  }
  return store
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreferences()
  }, [])

  async function loadPreferences() {
    setLoading(true)
    const s = await getStore()
    const data = await s.get<Partial<Preferences>>(STORE_KEY)
    if (data) {
      setPreferences({ ...DEFAULT_PREFERENCES, ...data })
    }
    setLoading(false)
  }

  async function savePreferences(newPrefs: Preferences) {
    const s = await getStore()
    await s.set(STORE_KEY, newPrefs)
    await s.save()
    setPreferences(newPrefs)
  }

  return {
    preferences,
    loading,
    savePreferences,
  }
}
