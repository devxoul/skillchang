'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const releaseUrl = 'https://github.com/devxoul/skillpad/releases/latest'
const githubUrl = 'https://github.com/devxoul/skillpad'
const screenshotUrl = '/screenshots/global-skills.png'

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

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            SkillPad
          </Link>
          <nav className="flex items-center gap-3">
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
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={releaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                >
                  Download for macOS
                </a>
                <a
                  href={releaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  Download for Windows
                </a>
              </div>
            </div>

            <div>
              <img src={screenshotUrl} alt="SkillPad desktop app screenshot" className="w-full rounded-xl" />
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

            <div className="mt-6 flex flex-col gap-6">
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Dark</p>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
                  <img
                    src="https://badge.skillpad.dev/dark.svg"
                    alt="Available on SkillPad badge (dark)"
                    className="h-12 w-auto"
                  />
                </div>
                <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 dark:border-zinc-700">
                  <pre className="text-xs text-zinc-200 sm:text-sm">
                    <code>
                      {
                        '[![Available on SkillPad](https://badge.skillpad.dev/dark.svg)](https://skillpad.dev/install/YOUR-SKILL-ID)'
                      }
                    </code>
                  </pre>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Light</p>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
                  <img
                    src="https://badge.skillpad.dev/light.svg"
                    alt="Available on SkillPad badge (light)"
                    className="h-12 w-auto"
                  />
                </div>
                <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 dark:border-zinc-700">
                  <pre className="text-xs text-zinc-200 sm:text-sm">
                    <code>
                      {
                        '[![Available on SkillPad](https://badge.skillpad.dev/light.svg)](https://skillpad.dev/install/YOUR-SKILL-ID)'
                      }
                    </code>
                  </pre>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Shield</p>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
                  <img
                    src={`https://img.shields.io/badge/Available_on-SkillPad-1a1a1a?style=flat&logo=${encodeURIComponent('https://badge.skillpad.dev/icon.svg')}`}
                    alt="Available on SkillPad shield"
                    className="h-5 w-auto"
                  />
                </div>
                <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 dark:border-zinc-700">
                  <pre className="text-xs text-zinc-200 sm:text-sm">
                    <code>
                      {
                        '[![Available on SkillPad](https://img.shields.io/badge/Available_on-SkillPad-1a1a1a?style=flat&logo=https%3A%2F%2Fbadge.skillpad.dev%2Ficon.svg)](https://skillpad.dev/install/YOUR-SKILL-ID)'
                      }
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-6 pb-20 sm:pb-24">
          <div className="mx-auto max-w-5xl rounded-3xl bg-zinc-900 px-6 py-12 text-center shadow-2xl shadow-zinc-900/20 sm:px-10 dark:bg-zinc-100">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100 dark:text-zinc-900">Download SkillPad</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-300 sm:text-base dark:text-zinc-600">
              Get the latest release for macOS and Windows from GitHub.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Download for macOS
              </a>
              <a
                href={releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-800 dark:border-zinc-400 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Download for Windows
              </a>
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
