import { useState, useEffect } from 'react'
import { Store } from '@tauri-apps/plugin-store'
import type { Preferences } from '@/types/preferences'

const STORE_KEY = 'preferences'
let store: Store | null = null

async function getStore() {
  if (!store) {
    store = await Store.load('skillchang.json')
  }
  return store
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>({
    defaultAgents: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreferences()
  }, [])

  async function loadPreferences() {
    setLoading(true)
    const s = await getStore()
    const data = await s.get<Preferences>(STORE_KEY)
    if (data) {
      setPreferences(data)
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
