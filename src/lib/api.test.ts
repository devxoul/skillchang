import { beforeEach, expect, test } from 'bun:test'
import { fetchRepoSkills, fetchSkills, isRepoQuery, searchSkills } from '@/lib/api'
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
  expect(mockFetchCalls[0]).toEqual(['https://skills.sh/api/search?q=sk&limit=200'])
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
  expect(mockFetchCalls[0]).toEqual(['https://skills.sh/api/search?q=React&limit=20'])
})

test('searchSkills encodes query parameters', async () => {
  const mockResponse = { skills: [] }
  mockFetchQueue.push({
    ok: true,
    json: async () => mockResponse,
  })

  await searchSkills('React Native')

  expect(mockFetchCalls[0]).toEqual(['https://skills.sh/api/search?q=React%20Native&limit=20'])
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
  expect(mockFetchCalls[0]).toEqual(['https://api.github.com/repos/xoul/skills/contents/skills'])
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
  expect(mockFetchCalls[0]).toEqual(['https://api.github.com/repos/xoul/my-skill/contents/skills'])
  expect(mockFetchCalls[1]).toEqual(['https://api.github.com/repos/xoul/my-skill/contents/SKILL.md'])
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
