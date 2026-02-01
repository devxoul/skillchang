import type { Skill } from './skill'

export interface SkillsResponse {
  skills: Skill[]
  hasMore: boolean
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
