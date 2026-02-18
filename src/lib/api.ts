import { fetch } from '@tauri-apps/plugin-http'
import { ApiError } from '@/types/api'
import type { Skill } from '@/types/skill'

const API_BASE = 'https://skills.sh/api'
const DEFAULT_BROWSE_QUERY = 'sk'
const DEFAULT_LIMIT = 200
const README_CACHE_DURATION = 30 * 60 * 1000

interface ReadmeCacheEntry {
  content: string
  fetchedAt: number
}

const readmeCache = new Map<string, ReadmeCacheEntry>()

interface ApiSkill {
  id: string
  skillId: string
  name: string
  installs: number
  source: string
}

export async function fetchSkills(): Promise<Skill[]> {
  try {
    const url = `${API_BASE}/search?q=${DEFAULT_BROWSE_QUERY}&limit=${DEFAULT_LIMIT}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new ApiError(`Failed to fetch skills: ${response.statusText}`, response.status)
    }

    const data = await response.json()
    return mapApiSkills(data.skills || [])
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function fetchSkillReadme(source: string, skillName?: string): Promise<string> {
  const cacheKey = `${source}:${skillName ?? ''}`
  const cached = readmeCache.get(cacheKey)
  if (cached && Date.now() - cached.fetchedAt < README_CACHE_DURATION) {
    return cached.content
  }

  const branches = ['main', 'master']
  const paths: string[] = []

  if (skillName) {
    paths.push(`skills/${skillName}/SKILL.md`)
    paths.push(`${skillName}/SKILL.md`)
  }
  paths.push('SKILL.md')

  for (const branch of branches) {
    for (const path of paths) {
      try {
        const url = `https://raw.githubusercontent.com/${source}/${branch}/${path}`
        const response = await fetch(url)

        if (response.ok) {
          const content = await response.text()
          readmeCache.set(cacheKey, { content, fetchedAt: Date.now() })
          return content
        }
      } catch {
        // Continue to next attempt
      }
    }
  }

  throw new ApiError(`Failed to fetch SKILL.md for ${source}`)
}

function mapApiSkills(skills: ApiSkill[]): Skill[] {
  return skills.map((s) => ({
    id: s.id,
    name: s.name,
    installs: s.installs,
    topSource: s.source,
  }))
}

export async function searchSkills(query: string, limit = 20): Promise<Skill[]> {
  if (!query.trim() || query.trim().length < 2) {
    return []
  }

  try {
    const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new ApiError(`Failed to search skills: ${response.statusText}`, response.status)
    }

    const data = await response.json()
    return mapApiSkills(data.skills || [])
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function isRepoQuery(query: string): boolean {
  return /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(query.trim())
}

export async function fetchRepoSkills(owner: string, repo: string): Promise<Skill[]> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/skills`
    const response = await fetch(url)

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data)) {
        return data
          .filter((entry) => entry.type === 'dir')
          .map((entry) => ({
            id: `repo:${owner}/${repo}:${entry.name}`,
            name: entry.name,
            installs: 0,
            topSource: `${owner}/${repo}`,
          }))
      }
    }

    if (response.status === 404) {
      const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/contents/SKILL.md`
      const fallbackResponse = await fetch(fallbackUrl)

      if (fallbackResponse.ok) {
        return [
          {
            id: `repo:${owner}/${repo}`,
            name: repo,
            installs: 0,
            topSource: `${owner}/${repo}`,
          },
        ]
      }

      return []
    }

    if (response.status === 403) {
      throw new ApiError('GitHub API rate limit exceeded', 403)
    }

    throw new ApiError(`Failed to fetch repository: ${response.statusText}`, response.status)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
