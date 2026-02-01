import { test, expect, beforeEach, vi, afterEach } from 'vitest'
import { fetchSkills, searchSkills } from '@/lib/api'
import { ApiError } from '@/types/api'

const originalFetch = global.fetch

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  global.fetch = originalFetch
})

test('fetchSkills returns skills and hasMore flag', async () => {
  const mockResponse = {
    skills: [
      { id: '1', name: 'React', installs: 1000, topSource: 'opencode' },
      { id: '2', name: 'Vue', installs: 800, topSource: 'opencode' },
    ],
    hasMore: true,
  }
  ;(global as any).fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  })

  const result = await fetchSkills()

  expect(result.skills).toHaveLength(2)
  expect(result.skills[0]?.name).toBe('React')
  expect(result.hasMore).toBe(true)
  expect(global.fetch).toHaveBeenCalledWith('https://skills.sh/api/skills')
})

test('fetchSkills with pagination', async () => {
  const mockResponse = {
    skills: [{ id: '3', name: 'Angular', installs: 600, topSource: 'opencode' }],
    hasMore: false,
  }
  ;(global as any).fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  })

  const result = await fetchSkills(2)

  expect(result.skills).toHaveLength(1)
  expect(result.hasMore).toBe(false)
  expect(global.fetch).toHaveBeenCalledWith('https://skills.sh/api/skills?page=2')
})

test('fetchSkills handles HTTP errors', async () => {
  ;(global as any).fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    status: 404,
    statusText: 'Not Found',
  })

  try {
    await fetchSkills()
    expect.fail('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Failed to fetch skills: Not Found')
  }
})

test('fetchSkills handles network errors', async () => {
  ;(global as any).fetch = vi.fn().mockRejectedValueOnce(new Error('Network timeout'))

  try {
    await fetchSkills()
    expect.fail('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Network error: Network timeout')
  }
})

test('searchSkills returns matching skills', async () => {
  const mockResponse = {
    skills: [{ id: '1', name: 'React', installs: 1000, topSource: 'opencode' }],
  }
  ;(global as any).fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  })

  const result = await searchSkills('React')

  expect(result).toHaveLength(1)
  expect(result[0]?.name).toBe('React')
  expect(global.fetch).toHaveBeenCalledWith('https://skills.sh/api/skills?search=React')
})

test('searchSkills encodes query parameters', async () => {
  const mockResponse = { skills: [] }
  ;(global as any).fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  })

  await searchSkills('React Native')

  expect(global.fetch).toHaveBeenCalledWith('https://skills.sh/api/skills?search=React%20Native')
})

test('searchSkills returns empty array for empty query', async () => {
  ;(global as any).fetch = vi.fn()

  const result = await searchSkills('')

  expect(result).toEqual([])
  expect(global.fetch).not.toHaveBeenCalled()
})

test('searchSkills returns empty array for whitespace-only query', async () => {
  ;(global as any).fetch = vi.fn()

  const result = await searchSkills('   ')

  expect(result).toEqual([])
  expect(global.fetch).not.toHaveBeenCalled()
})

test('searchSkills handles HTTP errors', async () => {
  ;(global as any).fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
  })

  try {
    await searchSkills('React')
    expect.fail('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Failed to search skills: Internal Server Error')
  }
})

test('searchSkills handles network errors', async () => {
  ;(global as any).fetch = vi.fn().mockRejectedValueOnce(new Error('Connection refused'))

  try {
    await searchSkills('React')
    expect.fail('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Network error: Connection refused')
  }
})

test('fetchSkills handles empty response', async () => {
  ;(global as any).fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  })

  const result = await fetchSkills()

  expect(result.skills).toEqual([])
  expect(result.hasMore).toBe(false)
})
