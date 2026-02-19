import type { Metadata } from 'next'
import Link from 'next/link'
import { DownloadContent, type Release } from './download-content'
import { ThemeToggle } from './theme-toggle'

export const metadata: Metadata = {
  title: 'Download',
  description:
    'Download SkillPad for macOS or Windows. Free and open-source desktop app for managing AI agent skills from skills.sh.',
  alternates: {
    canonical: '/download',
  },
  openGraph: {
    title: 'Download SkillPad',
    description: 'Download SkillPad for macOS or Windows. Free and open source.',
    url: '/download',
  },
}

const GITHUB_API = 'https://api.github.com/repos/devxoul/skillpad/releases/latest'
const GITHUB_URL = 'https://github.com/devxoul/skillpad'

async function getLatestRelease(): Promise<Release | null> {
  try {
    const res = await fetch(GITHUB_API, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function DownloadPage() {
  const release = await getLatestRelease()

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
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Download
            </Link>
            <a
              href={GITHUB_URL}
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
        <DownloadContent release={release} />
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-8 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-zinc-500 sm:flex-row dark:text-zinc-400">
          <p>&copy; {new Date().getFullYear()} SkillPad. All rights reserved.</p>
          <a
            href={GITHUB_URL}
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
