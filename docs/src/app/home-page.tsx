'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'

const githubUrl = 'https://github.com/devxoul/skillpad'
const videoUrl = '/screenshots/SkillPad-1080p.mp4'
const exampleSkills = [
  { owner: 'vercel-labs', repo: 'skills', skillName: 'find-skills' },
  { owner: 'anthropics', repo: 'skills', skillName: 'frontend-design' },
  { owner: 'devxoul', repo: 'agent-messenger', skillName: 'agent-slack' },
  { owner: 'devxoul', repo: 'vibe-notion', skillName: 'vibe-notion' },
]

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>Light mode</title>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>Dark mode</title>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-9 w-9" />

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  )
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>Gallery</title>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function InstallIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>Install</title>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

function ScopeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>Scope</title>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="8" y="13" width="8" height="8" rx="2" />
    </svg>
  )
}

function UpdateIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>Updates</title>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-md bg-zinc-800 p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
        >
          <title>Copied</title>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
        >
          <title>Copy</title>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

export function HomePage() {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [skillName, setSkillName] = useState('')

  const installPath =
    owner || repo || skillName
      ? `${owner || 'OWNER'}/${repo || 'REPO'}/${skillName || 'SKILL-NAME'}`
      : 'OWNER/REPO/SKILL-NAME'

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            SkillPad
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/download"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Download
            </Link>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              GitHub
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 pt-16 pb-16 sm:pt-20 sm:pb-20">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-balance text-zinc-900 sm:text-5xl md:text-6xl dark:text-zinc-100">
                Browse, install, and manage AI agent skills visually
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-pretty text-zinc-600 sm:text-lg dark:text-zinc-400">
                SkillPad is a desktop GUI for skills.sh. Browse skills from the gallery, install to any agent in one
                click, and manage global plus project-scoped skills in one place.
              </p>
              <div className="mt-8">
                <Link
                  href="/download"
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                >
                  Download
                </Link>
              </div>
            </div>

            <div>
              <video src={videoUrl} autoPlay loop muted playsInline className="w-full rounded-xl" />
            </div>
          </div>
        </section>

        <section className="px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <article className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
                <div className="mb-4 inline-flex rounded-lg bg-sky-100 p-2.5 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                  <GalleryIcon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Gallery browsing</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Discover new skills directly from the skills.sh gallery.
                </p>
              </article>

              <article className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
                <div className="mb-4 inline-flex rounded-lg bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <InstallIcon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">One-click install</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Install to your preferred agent without touching the terminal.
                </p>
              </article>

              <article className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
                <div className="mb-4 inline-flex rounded-lg bg-amber-100 p-2.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  <ScopeIcon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Flexible scope</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Manage global and project-scoped skills side by side.
                </p>
              </article>

              <article className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
                <div className="mb-4 inline-flex rounded-lg bg-violet-100 p-2.5 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  <UpdateIcon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Auto-updates</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Stay current with built-in update checks for new releases.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="px-6 py-14 sm:py-16">
          <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-zinc-100 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
              Available on SkillPad badge
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
              Skill developers can embed this badge in their README so users can install directly into SkillPad.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Owner</span>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="OWNER"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Repo</span>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="REPO"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Skill name</span>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="SKILL-NAME"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
                />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <p className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">Try:</p>
              <div className="flex gap-2 overflow-x-auto">
                {exampleSkills.map((example) => {
                  const path = `${example.owner}/${example.repo}/${example.skillName}`

                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={() => {
                        setOwner(example.owner)
                        setRepo(example.repo)
                        setSkillName(example.skillName)
                      }}
                      className="cursor-pointer shrink-0 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
                    >
                      {path}
                    </button>
                  )
                })}
              </div>
              {(owner || repo || skillName) && (
                <button
                  type="button"
                  onClick={() => {
                    setOwner('')
                    setRepo('')
                    setSkillName('')
                  }}
                  className="cursor-pointer shrink-0 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col">
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Dark</p>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
                  <Link href={`/install/${installPath}`} className="inline-block">
                    <img
                      src={`https://badge.skillpad.dev/${skillName || 'SKILL-NAME'}/dark.svg`}
                      alt="Available on SkillPad badge (dark)"
                      className="h-12 w-auto"
                    />
                  </Link>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-950 p-3 dark:border-zinc-700">
                  <pre className="min-w-0 flex-1 overflow-x-auto text-xs text-zinc-200">
                    <code>
                      {`[![Available on SkillPad](https://badge.skillpad.dev/${skillName || 'SKILL-NAME'}/dark.svg)](https://skillpad.dev/install/${installPath})`}
                    </code>
                  </pre>
                  <CopyButton
                    text={`[![Available on SkillPad](https://badge.skillpad.dev/${skillName || 'SKILL-NAME'}/dark.svg)](https://skillpad.dev/install/${installPath})`}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Light</p>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
                  <Link href={`/install/${installPath}`} className="inline-block">
                    <img
                      src={`https://badge.skillpad.dev/${skillName || 'SKILL-NAME'}/light.svg`}
                      alt="Available on SkillPad badge (light)"
                      className="h-12 w-auto"
                    />
                  </Link>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-950 p-3 dark:border-zinc-700">
                  <pre className="min-w-0 flex-1 overflow-x-auto text-xs text-zinc-200">
                    <code>
                      {`[![Available on SkillPad](https://badge.skillpad.dev/${skillName || 'SKILL-NAME'}/light.svg)](https://skillpad.dev/install/${installPath})`}
                    </code>
                  </pre>
                  <CopyButton
                    text={`[![Available on SkillPad](https://badge.skillpad.dev/${skillName || 'SKILL-NAME'}/light.svg)](https://skillpad.dev/install/${installPath})`}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Shield</p>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
                  <Link href={`/install/${installPath}`} className="inline-block">
                    <img
                      src={`https://img.shields.io/badge/SkillPad-${(skillName || 'SKILL--NAME').replace(/-/g, '--')}-1a1a1a?style=flat&logo=${encodeURIComponent('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjExMyAxNTAgNTQwIDU0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNDAwIDE4MS41NDdDNDEyLjM3NiAxNzQuNDAyIDQyNy42MjQgMTc0LjQwMiA0NDAgMTgxLjU0N0w2MTYuNTA2IDI4My40NTNDNjI4Ljg4MiAyOTAuNTk4IDYzNi41MDYgMzAzLjgwMyA2MzYuNTA2IDMxOC4wOTRWNTIxLjkwNkM2MzYuNTA2IDUzNi4xOTcgNjI4Ljg4MiA1NDkuNDAyIDYxNi41MDYgNTU2LjU0N0w0NDAgNjU4LjQ1M0M0MjcuNjI0IDY2NS41OTggNDEyLjM3NiA2NjUuNTk4IDQwMCA2NTguNDUzTDIyMy40OTQgNTU2LjU0N0MyMTEuMTE4IDU0OS40MDIgMjAzLjQ5NCA1MzYuMTk3IDIwMy40OTQgNTIxLjkwNlYzMTguMDk0QzIwMy40OTQgMzAzLjgwMyAyMTEuMTE4IDI5MC41OTggMjIzLjQ5NCAyODMuNDUzTDQwMCAxODEuNTQ3WiIgZmlsbD0id2hpdGUiLz4KICA8Y2lyY2xlIGN4PSIxNDcuNSIgY3k9IjE5MS41IiByPSIxNy41IiBmaWxsPSJ3aGl0ZSIvPgogIDxjaXJjbGUgY3g9IjE5Mi41IiBjeT0iMTkxLjUiIHI9IjE3LjUiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iMjM3LjUiIGN5PSIxOTEuNSIgcj0iMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==')}`}
                      alt="SkillPad shield"
                      className="h-5 w-auto"
                    />
                  </Link>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-950 p-3 dark:border-zinc-700">
                  <pre className="min-w-0 flex-1 overflow-x-auto text-xs text-zinc-200">
                    <code>
                      {`[![SkillPad](https://img.shields.io/badge/SkillPad-${(skillName || 'SKILL--NAME').replace(/-/g, '--')}-1a1a1a?style=flat&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjExMyAxNTAgNTQwIDU0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNDAwIDE4MS41NDdDNDEyLjM3NiAxNzQuNDAyIDQyNy42MjQgMTc0LjQwMiA0NDAgMTgxLjU0N0w2MTYuNTA2IDI4My40NTNDNjI4Ljg4MiAyOTAuNTk4IDYzNi41MDYgMzAzLjgwMyA2MzYuNTA2IDMxOC4wOTRWNTIxLjkwNkM2MzYuNTA2IDUzNi4xOTcgNjI4Ljg4MiA1NDkuNDAyIDYxNi41MDYgNTU2LjU0N0w0NDAgNjU4LjQ1M0M0MjcuNjI0IDY2NS41OTggNDEyLjM3NiA2NjUuNTk4IDQwMCA2NTguNDUzTDIyMy40OTQgNTU2LjU0N0MyMTEuMTE4IDU0OS40MDIgMjAzLjQ5NCA1MzYuMTk3IDIwMy40OTQgNTIxLjkwNlYzMTguMDk0QzIwMy40OTQgMzAzLjgwMyAyMTEuMTE4IDI5MC41OTggMjIzLjQ5NCAyODMuNDUzTDQwMCAxODEuNTQ3WiIgZmlsbD0id2hpdGUiLz4KICA8Y2lyY2xlIGN4PSIxNDcuNSIgY3k9IjE5MS41IiByPSIxNy41IiBmaWxsPSJ3aGl0ZSIvPgogIDxjaXJjbGUgY3g9IjE5Mi41IiBjeT0iMTkxLjUiIHI9IjE3LjUiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iMjM3LjUiIGN5PSIxOTEuNSIgcj0iMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg%3D%3D)](https://skillpad.dev/install/${installPath})`}
                    </code>
                  </pre>
                  <CopyButton
                    text={`[![SkillPad](https://img.shields.io/badge/SkillPad-${(skillName || 'SKILL--NAME').replace(/-/g, '--')}-1a1a1a?style=flat&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjExMyAxNTAgNTQwIDU0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNDAwIDE4MS41NDdDNDEyLjM3NiAxNzQuNDAyIDQyNy42MjQgMTc0LjQwMiA0NDAgMTgxLjU0N0w2MTYuNTA2IDI4My40NTNDNjI4Ljg4MiAyOTAuNTk4IDYzNi41MDYgMzAzLjgwMyA2MzYuNTA2IDMxOC4wOTRWNTIxLjkwNkM2MzYuNTA2IDUzNi4xOTcgNjI4Ljg4MiA1NDkuNDAyIDYxNi41MDYgNTU2LjU0N0w0NDAgNjU4LjQ1M0M0MjcuNjI0IDY2NS41OTggNDEyLjM3NiA2NjUuNTk4IDQwMCA2NTguNDUzTDIyMy40OTQgNTU2LjU0N0MyMTEuMTE4IDU0OS40MDIgMjAzLjQ5NCA1MzYuMTk3IDIwMy40OTQgNTIxLjkwNlYzMTguMDk0QzIwMy40OTQgMzAzLjgwMyAyMTEuMTE4IDI5MC41OTggMjIzLjQ5NCAyODMuNDUzTDQwMCAxODEuNTQ3WiIgZmlsbD0id2hpdGUiLz4KICA8Y2lyY2xlIGN4PSIxNDcuNSIgY3k9IjE5MS41IiByPSIxNy41IiBmaWxsPSJ3aGl0ZSIvPgogIDxjaXJjbGUgY3g9IjE5Mi41IiBjeT0iMTkxLjUiIHI9IjE3LjUiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iMjM3LjUiIGN5PSIxOTEuNSIgcj0iMTcuNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg%3D%3D)](https://skillpad.dev/install/${installPath})`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Example badges</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {exampleSkills.map((example) => {
                  const path = `${example.owner}/${example.repo}/${example.skillName}`

                  return (
                    <Link
                      key={`badge-${path}`}
                      href={`/install/${path}`}
                      className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600"
                    >
                      <img
                        src={`https://badge.skillpad.dev/${example.skillName}/dark.svg`}
                        alt={`${path} install badge`}
                        className="h-7 w-auto"
                      />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6 pb-20 sm:pb-24">
          <div className="mx-auto max-w-5xl rounded-3xl border border-transparent bg-zinc-900 px-6 py-12 text-center shadow-2xl shadow-zinc-900/20 sm:px-10 dark:border-zinc-700/60 dark:bg-zinc-800/80">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Download SkillPad</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
              Free and open source. Available for macOS and Windows.
            </p>
            <div className="mt-8">
              <Link
                href="/download"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-zinc-200"
              >
                Download
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-8 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-zinc-500 sm:flex-row dark:text-zinc-400">
          <p>&copy; {new Date().getFullYear()} SkillPad. All rights reserved.</p>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
