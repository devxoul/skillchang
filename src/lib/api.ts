import type { Skill } from '@/types/skill'
import type { SkillsResponse } from '@/types/api'
import { ApiError } from '@/types/api'

const API_BASE = 'https://skills.sh/api'

export async function fetchSkills(page: number = 1): Promise<SkillsResponse> {
  try {
    const url = `${API_BASE}/skills${page > 1 ? `?page=${page}` : ''}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch skills: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()

    return {
      skills: data.skills || [],
      hasMore: data.hasMore || false
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function searchSkills(query: string): Promise<Skill[]> {
  if (!query.trim()) {
    return []
  }

  try {
    const url = `${API_BASE}/skills?search=${encodeURIComponent(query)}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new ApiError(
        `Failed to search skills: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()
    return data.skills || []
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
