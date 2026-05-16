import { beforeEach, expect, test } from 'bun:test'

import {
  fetchRepoSkills,
  fetchSkillReadme,
  fetchSkills,
  fetchWellKnownReadme,
  isRepoQuery,
  isSkillPathQuery,
  parseSkillPath,
  resolveInstallSource,
  resolveSourceAlias,
  searchReposByName,
  searchSkills,
} from '@/lib/api'
import { mockHttpFetch } from '@/test-mocks'
import { ApiError } from '@/types/api'

let mockFetchQueue: any[] = []
let mockFetchCalls: any[] = []

beforeEach(() => {
  mockFetchQueue = []
  mockFetchCalls = []
  mockHttpFetch.mockReset()
  mockHttpFetch.mockImplementation(async (...args: any[]) => {
    mockFetchCalls.push(args)
    if (mockFetchQueue.length > 0) {
      const response = mockFetchQueue.shift()
      if (response instanceof Error) throw response
      return response
    }
  })
})

test('fetchSkills returns skills from search endpoint', async () => {
  const mockResponse = {
    skills: [
      { id: '1', skillId: 'react', name: 'React', installs: 1000, source: 'opencode/skills' },
      { id: '2', skillId: 'vue', name: 'Vue', installs: 800, source: 'opencode/skills' },
    ],
    count: 2,
  }
  mockFetchQueue.push({
    ok: true,
    json: async () => mockResponse,
  })

  const result = await fetchSkills()

  expect(result).toHaveLength(2)
  expect(result[0]?.name).toBe('React')
  expect(result[0]?.topSource).toBe('opencode/skills')
  expect(mockFetchCalls[0]).toEqual(['https://api.skillpad.dev/api/search?q=sk&limit=200'])
})

test('fetchSkills handles HTTP errors', async () => {
  mockFetchQueue.push({
    ok: false,
    status: 404,
    statusText: 'Not Found',
  })

  try {
    await fetchSkills()
    throw new Error('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Failed to fetch skills: Not Found')
  }
})

test('fetchSkills handles network errors', async () => {
  mockFetchQueue.push(new Error('Network timeout'))

  try {
    await fetchSkills()
    throw new Error('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Network error: Network timeout')
  }
})

test('fetchSkills handles empty response', async () => {
  mockFetchQueue.push({
    ok: true,
    json: async () => ({}),
  })

  const result = await fetchSkills()

  expect(result).toEqual([])
})

test('searchSkills returns matching skills', async () => {
  const mockResponse = {
    skills: [{ id: '1', skillId: 'react', name: 'React', installs: 1000, source: 'opencode/skills' }],
  }
  mockFetchQueue.push({
    ok: true,
    json: async () => mockResponse,
  })

  const result = await searchSkills('React')

  expect(result).toHaveLength(1)
  expect(result[0]?.name).toBe('React')
  expect(mockFetchCalls[0]).toEqual(['https://api.skillpad.dev/api/search?q=React&limit=20'])
})

test('searchSkills encodes query parameters', async () => {
  const mockResponse = { skills: [] }
  mockFetchQueue.push({
    ok: true,
    json: async () => mockResponse,
  })

  await searchSkills('React Native')

  expect(mockFetchCalls[0]).toEqual(['https://api.skillpad.dev/api/search?q=React%20Native&limit=20'])
})

test('searchSkills returns empty array for empty query', async () => {
  const result = await searchSkills('')

  expect(result).toEqual([])
  expect(mockFetchCalls).toHaveLength(0)
})

test('searchSkills returns empty array for whitespace-only query', async () => {
  const result = await searchSkills('   ')

  expect(result).toEqual([])
  expect(mockFetchCalls).toHaveLength(0)
})

test('searchSkills returns empty array for single character query', async () => {
  const result = await searchSkills('a')

  expect(result).toEqual([])
  expect(mockFetchCalls).toHaveLength(0)
})

test('searchSkills handles HTTP errors', async () => {
  mockFetchQueue.push({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
  })

  try {
    await searchSkills('React')
    throw new Error('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Failed to search skills: Internal Server Error')
  }
})

test('searchSkills handles network errors', async () => {
  mockFetchQueue.push(new Error('Connection refused'))

  try {
    await searchSkills('React')
    throw new Error('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Network error: Connection refused')
  }
})

test('isRepoQuery returns true for valid repo format', () => {
  expect(isRepoQuery('xoul/skills')).toBe(true)
  expect(isRepoQuery('xoul/my.skills')).toBe(true)
  expect(isRepoQuery('user-name/repo-name')).toBe(true)
  expect(isRepoQuery('user_name/repo_name')).toBe(true)
})

test('isRepoQuery returns false for invalid formats', () => {
  expect(isRepoQuery('react hooks')).toBe(false)
  expect(isRepoQuery('xoul/skills/extra')).toBe(false)
  expect(isRepoQuery('')).toBe(false)
  expect(isRepoQuery('xoul')).toBe(false)
  expect(isRepoQuery('space in name/repo')).toBe(false)
})

test('isSkillPathQuery returns true for valid owner/repo/skill format', () => {
  expect(isSkillPathQuery('xoul/skills/my-skill')).toBe(true)
  expect(isSkillPathQuery('user-name/repo-name/skill-name')).toBe(true)
  expect(isSkillPathQuery('user_name/repo_name/skill_name')).toBe(true)
  expect(isSkillPathQuery('user.name/repo.name/skill.name')).toBe(true)
})

test('isSkillPathQuery returns false for non-3-segment formats', () => {
  expect(isSkillPathQuery('xoul/skills')).toBe(false)
  expect(isSkillPathQuery('xoul')).toBe(false)
  expect(isSkillPathQuery('')).toBe(false)
  expect(isSkillPathQuery('a/b/c/d')).toBe(false)
  expect(isSkillPathQuery('space in/name/skill')).toBe(false)
  expect(isSkillPathQuery('owner/repo/..')).toBe(false)
  expect(isSkillPathQuery('owner/./skill')).toBe(false)
  expect(isSkillPathQuery('./repo/skill')).toBe(false)
})

test('parseSkillPath extracts owner, repo, and skill', () => {
  expect(parseSkillPath('xoul/skills/my-skill')).toEqual({ owner: 'xoul', repo: 'skills', skill: 'my-skill' })
  expect(parseSkillPath('org/repo/agent-browser')).toEqual({ owner: 'org', repo: 'repo', skill: 'agent-browser' })
})

test('parseSkillPath returns null for invalid formats', () => {
  expect(parseSkillPath('xoul/skills')).toBeNull()
  expect(parseSkillPath('xoul')).toBeNull()
  expect(parseSkillPath('')).toBeNull()
  expect(parseSkillPath('a/b/c/d')).toBeNull()
  expect(parseSkillPath('owner/repo/..')).toBeNull()
  expect(parseSkillPath('owner/./skill')).toBeNull()
})

test('resolveSourceAlias maps k-skill to NomaDamas/k-skill', () => {
  expect(resolveSourceAlias('k-skill')).toBe('NomaDamas/k-skill')
  expect(resolveSourceAlias('  k-skill  ')).toBe('NomaDamas/k-skill')
})

test('resolveSourceAlias maps agent-messenger to agent-messenger/agent-messenger', () => {
  expect(resolveSourceAlias('agent-messenger')).toBe('agent-messenger/agent-messenger')
})

test('resolveSourceAlias returns trimmed query when no alias matches', () => {
  expect(resolveSourceAlias('react')).toBe('react')
  expect(resolveSourceAlias('xoul/skills')).toBe('xoul/skills')
  expect(resolveSourceAlias('  xoul/skills  ')).toBe('xoul/skills')
  expect(resolveSourceAlias('')).toBe('')
})

test('fetchRepoSkills returns skills from GitHub contents API', async () => {
  mockFetchQueue.push({
    ok: true,
    status: 200,
    json: async () => [
      { name: 'cool-skill', type: 'dir' },
      { name: 'readme.md', type: 'file' },
    ],
  })

  const result = await fetchRepoSkills('xoul', 'skills')

  expect(result).toHaveLength(1)
  expect(result[0]?.id).toBe('repo:xoul/skills:cool-skill')
  expect(result[0]?.name).toBe('cool-skill')
  expect(result[0]?.installs).toBe(0)
  expect(result[0]?.topSource).toBe('xoul/skills')
  expect(mockFetchCalls[0]).toEqual(['https://api.skillpad.dev/github/repos/xoul/skills/contents/skills'])
})

test('fetchRepoSkills filters only directory entries', async () => {
  mockFetchQueue.push({
    ok: true,
    status: 200,
    json: async () => [
      { name: 'skill1', type: 'dir' },
      { name: 'skill2', type: 'dir' },
      { name: 'LICENSE', type: 'file' },
      { name: 'README.md', type: 'file' },
    ],
  })

  const result = await fetchRepoSkills('xoul', 'skills')

  expect(result).toHaveLength(2)
  expect(result[0]?.name).toBe('skill1')
  expect(result[1]?.name).toBe('skill2')
})

test('fetchRepoSkills falls back to SKILL.md on 404', async () => {
  mockFetchQueue.push({
    ok: false,
    status: 404,
    statusText: 'Not Found',
  })
  mockFetchQueue.push({
    ok: true,
    status: 200,
    json: async () => ({}),
  })

  const result = await fetchRepoSkills('xoul', 'my-skill')

  expect(result).toHaveLength(1)
  expect(result[0]?.id).toBe('repo:xoul/my-skill')
  expect(result[0]?.name).toBe('my-skill')
  expect(result[0]?.installs).toBe(0)
  expect(result[0]?.topSource).toBe('xoul/my-skill')
  expect(mockFetchCalls[0]).toEqual(['https://api.skillpad.dev/github/repos/xoul/my-skill/contents/skills'])
  expect(mockFetchCalls[1]).toEqual(['https://api.skillpad.dev/github/repos/xoul/my-skill/contents/SKILL.md'])
})

test('fetchRepoSkills returns empty array when both endpoints return 404', async () => {
  mockFetchQueue.push({
    ok: false,
    status: 404,
    statusText: 'Not Found',
  })
  mockFetchQueue.push({
    ok: false,
    status: 404,
    statusText: 'Not Found',
  })

  const result = await fetchRepoSkills('xoul', 'nonexistent')

  expect(result).toEqual([])
})

test('fetchRepoSkills throws ApiError on 403 rate limit', async () => {
  mockFetchQueue.push({
    ok: false,
    status: 403,
    statusText: 'Forbidden',
  })

  try {
    await fetchRepoSkills('xoul', 'skills')
    throw new Error('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(403)
    expect((error as Error).message).toContain('GitHub API rate limit exceeded')
  }
})

test('fetchRepoSkills throws ApiError on other HTTP errors', async () => {
  mockFetchQueue.push({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
  })

  try {
    await fetchRepoSkills('xoul', 'skills')
    throw new Error('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(500)
    expect((error as Error).message).toContain('Failed to fetch repository: Internal Server Error')
  }
})

test('fetchRepoSkills handles network errors', async () => {
  mockFetchQueue.push(new Error('Network timeout'))

  try {
    await fetchRepoSkills('xoul', 'skills')
    throw new Error('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Network error: Network timeout')
  }
})

test('resolveInstallSource returns GitHub source when repo exists', async () => {
  mockFetchQueue.push({ ok: true })

  const result = await resolveInstallSource('xoul/skills', 'my-skill')

  expect(result).toBe('xoul/skills')
  expect(mockFetchCalls).toHaveLength(1)
  expect(mockFetchCalls[0]).toEqual(['https://api.skillpad.dev/github/repos/xoul/skills', { method: 'HEAD' }])
})

test('resolveInstallSource resolves non-GitHub source from skills.sh page', async () => {
  mockFetchQueue.push({ ok: false, status: 404 })
  mockFetchQueue.push({
    ok: true,
    text: async () => '<div>npx skills add https://cli.sentry.dev</div>',
  })

  const result = await resolveInstallSource('sentry/dev', 'sentry-cli')

  expect(result).toBe('https://cli.sentry.dev')
  expect(mockFetchCalls).toHaveLength(2)
  expect(mockFetchCalls[0]).toEqual(['https://api.skillpad.dev/github/repos/sentry/dev', { method: 'HEAD' }])
  expect(mockFetchCalls[1]).toEqual(['https://api.skillpad.dev/skills/sentry/dev/sentry-cli'])
})

test('resolveInstallSource caches resolved values', async () => {
  mockFetchQueue.push({ ok: true })

  const first = await resolveInstallSource('cache-owner/cache-repo', 'cache-skill')
  const second = await resolveInstallSource('cache-owner/cache-repo', 'cache-skill')

  expect(first).toBe('cache-owner/cache-repo')
  expect(second).toBe('cache-owner/cache-repo')
  expect(mockFetchCalls).toHaveLength(1)
})

test('fetchWellKnownReadme returns markdown from .well-known/skills files', async () => {
  mockFetchQueue.push({
    ok: true,
    json: async () => ({
      skills: [
        {
          name: 'sentry-cli',
          files: ['SKILL.md'],
        },
      ],
    }),
  })
  mockFetchQueue.push({
    ok: true,
    text: async () => '# Sentry CLI',
  })

  const result = await fetchWellKnownReadme('https://cli.sentry.dev', 'sentry-cli')

  expect(result).toBe('# Sentry CLI')
  expect(mockFetchCalls).toHaveLength(2)
  expect(mockFetchCalls[0]).toEqual(['https://cli.sentry.dev/.well-known/skills'])
  expect(mockFetchCalls[1]).toEqual(['https://cli.sentry.dev/SKILL.md'])
})

test('fetchSkillReadme uses well-known discovery for URL sources', async () => {
  mockFetchQueue.push({
    ok: true,
    json: async () => ({
      skills: [
        {
          name: 'url-skill',
          files: ['skills/url-skill/SKILL.md'],
        },
      ],
    }),
  })
  mockFetchQueue.push({
    ok: true,
    text: async () => '# URL skill',
  })

  const result = await fetchSkillReadme('https://example.com', 'url-skill')

  expect(result).toBe('# URL skill')
  expect(mockFetchCalls).toHaveLength(2)
  expect(mockFetchCalls[0]).toEqual(['https://example.com/.well-known/skills'])
  expect(mockFetchCalls[1]).toEqual(['https://example.com/skills/url-skill/SKILL.md'])
})

test('fetchSkillReadme uses GitHub raw URL lookup for repo sources', async () => {
  mockFetchQueue.push({
    ok: true,
    text: async () => '# GitHub skill',
  })

  const result = await fetchSkillReadme('owner/repo', 'sample-skill')

  expect(result).toBe('# GitHub skill')
  expect(mockFetchCalls).toHaveLength(1)
  expect(mockFetchCalls[0]).toEqual(['https://api.skillpad.dev/raw/owner/repo/main/skills/sample-skill/SKILL.md'])
})

test('searchReposByName returns empty array for short queries', async () => {
  const result = await searchReposByName('a')

  expect(result).toEqual([])
  expect(mockFetchCalls).toHaveLength(0)
})

test('searchReposByName returns empty array for empty query', async () => {
  const result = await searchReposByName('')

  expect(result).toEqual([])
  expect(mockFetchCalls).toHaveLength(0)
})

test('searchReposByName searches GitHub and fetches skills from matching repos', async () => {
  // given - GitHub search returns repos
  mockFetchQueue.push({
    ok: true,
    json: async () => ({
      items: [{ full_name: 'agent-messenger/agent-messenger', description: 'Messenger skill' }],
    }),
  })
  // given - fetchRepoSkills for the first repo (contents/skills)
  mockFetchQueue.push({
    ok: false,
    status: 404,
    statusText: 'Not Found',
  })
  // given - fetchRepoSkills fallback (SKILL.md check)
  mockFetchQueue.push({
    ok: true,
    json: async () => ({}),
  })

  const result = await searchReposByName('agent-messenger')

  expect(result).toHaveLength(1)
  expect(result[0]?.name).toBe('agent-messenger')
  expect(result[0]?.topSource).toBe('agent-messenger/agent-messenger')
  expect(mockFetchCalls[0]).toEqual([
    'https://api.skillpad.dev/github/search/repositories?q=agent-messenger%20in%3Aname&per_page=5',
  ])
})

test('searchReposByName handles repos with skills/ directory', async () => {
  // given - GitHub search returns a repo
  mockFetchQueue.push({
    ok: true,
    json: async () => ({
      items: [{ full_name: 'xoul/skills', description: 'Skills repo' }],
    }),
  })
  // given - fetchRepoSkills finds skills/ directory
  mockFetchQueue.push({
    ok: true,
    status: 200,
    json: async () => [
      { name: 'git-master', type: 'dir' },
      { name: 'frontend', type: 'dir' },
      { name: 'README.md', type: 'file' },
    ],
  })

  const result = await searchReposByName('skills')

  expect(result).toHaveLength(2)
  expect(result[0]?.name).toBe('git-master')
  expect(result[1]?.name).toBe('frontend')
})

test('searchReposByName skips repos without skills', async () => {
  // given - GitHub search returns repos
  mockFetchQueue.push({
    ok: true,
    json: async () => ({
      items: [{ full_name: 'user/no-skills', description: null }],
    }),
  })
  // given - no skills/ directory
  mockFetchQueue.push({
    ok: false,
    status: 404,
    statusText: 'Not Found',
  })
  // given - no SKILL.md either
  mockFetchQueue.push({
    ok: false,
    status: 404,
    statusText: 'Not Found',
  })

  const result = await searchReposByName('no-skills')

  expect(result).toEqual([])
})

test('searchReposByName throws on rate limit from search API', async () => {
  mockFetchQueue.push({
    ok: false,
    status: 403,
    statusText: 'Forbidden',
  })

  try {
    await searchReposByName('agent-messenger')
    throw new Error('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(403)
    expect((error as Error).message).toContain('GitHub API rate limit exceeded')
  }
})

test('searchReposByName propagates rate limit from fetchRepoSkills', async () => {
  // given - GitHub search returns a repo
  mockFetchQueue.push({
    ok: true,
    json: async () => ({
      items: [{ full_name: 'xoul/skills', description: 'Skills' }],
    }),
  })
  // given - fetchRepoSkills hits rate limit
  mockFetchQueue.push({
    ok: false,
    status: 403,
    statusText: 'Forbidden',
  })

  try {
    await searchReposByName('skills')
    throw new Error('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(403)
  }
})

test('searchReposByName handles network errors', async () => {
  mockFetchQueue.push(new Error('Network timeout'))

  try {
    await searchReposByName('agent-messenger')
    throw new Error('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Network error: Network timeout')
  }
})
