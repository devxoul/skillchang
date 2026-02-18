'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const RELEASE_URL = 'https://github.com/devxoul/skillpad/releases/latest'
const OPEN_TIMEOUT_MS = 1500

function extractSkillId(pathname: string): string {
  const withoutPrefix = pathname.replace(/^\/install\/?/, '').replace(/\/$/, '')
  return decodeURIComponent(withoutPrefix)
}

function toDeepLink(skillId: string): string {
  const encoded = skillId
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `skillpad://skill/${encoded}`
}

export default function InstallRedirectPage() {
  const [skillId, setSkillId] = useState('')
  const [isOpening, setIsOpening] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setSkillId(extractSkillId(window.location.pathname))
  }, [])

  useEffect(() => {
    if (!skillId) return

    const _trigger = attempt
    void _trigger

    let hidden = document.hidden

    const onVisibilityChange = () => {
      hidden = document.hidden
      if (hidden && timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    window.location.href = toDeepLink(skillId)

    timeoutRef.current = window.setTimeout(() => {
      if (!hidden && !document.hidden) {
        setIsOpening(false)
      }
    }, OPEN_TIMEOUT_MS)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [skillId, attempt])

  const displaySkillId = useMemo(() => skillId || 'unknown-skill', [skillId])

  const handleTryAgain = () => {
    setIsOpening(true)
    setAttempt((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-2xl border border-zinc-200 bg-white/90 p-8 shadow-xl shadow-zinc-300/30 backdrop-blur sm:p-10 dark:border-zinc-800 dark:bg-zinc-950/85 dark:shadow-zinc-950/40">
          {isOpening ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Opening SkillPad...</h1>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Trying to open <span className="font-medium text-zinc-900 dark:text-zinc-100">{displaySkillId}</span> in
                the app.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">SkillPad is not installed</h1>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                SkillPad lets you browse and install AI agent skills with a visual interface.
              </p>

              <div className="mt-5 w-full rounded-xl border border-zinc-200 bg-zinc-100/70 px-4 py-3 text-left dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Skill ID</p>
                <p className="mt-1 font-mono text-sm break-all text-zinc-900 dark:text-zinc-100">{displaySkillId}</p>
              </div>

              <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                <a
                  href={RELEASE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-300 bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  Download for macOS
                </a>
                <a
                  href={RELEASE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Download for Windows
                </a>
              </div>

              <button
                type="button"
                onClick={handleTryAgain}
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
