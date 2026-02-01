import { fetchSkills, searchSkills } from '@/lib/api'
import { ApiError } from '@/types/api'
import { beforeEach, expect, test, vi } from 'vitest'

vi.mock('@tauri-apps/plugin-http', () => ({
  fetch: vi.fn(),
}))

import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
const mockFetch = tauriFetch as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
})

test('fetchSkills returns skills and hasMore flag', async () => {
  const mockResponse = {
    skills: [
      { id: '1', name: 'React', installs: 1000, topSource: 'opencode' },
      { id: '2', name: 'Vue', installs: 800, topSource: 'opencode' },
    ],
    hasMore: true,
  }
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  })

  const result = await fetchSkills()

  expect(result.skills).toHaveLength(2)
  expect(result.skills[0]?.name).toBe('React')
  expect(result.hasMore).toBe(true)
  expect(mockFetch).toHaveBeenCalledWith('https://skills.sh/api/skills')
})

test('fetchSkills with pagination', async () => {
  const mockResponse = {
    skills: [{ id: '3', name: 'Angular', installs: 600, topSource: 'opencode' }],
    hasMore: false,
  }
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  })

  const result = await fetchSkills(2)

  expect(result.skills).toHaveLength(1)
  expect(result.hasMore).toBe(false)
  expect(mockFetch).toHaveBeenCalledWith('https://skills.sh/api/skills?page=2')
})

test('fetchSkills handles HTTP errors', async () => {
  mockFetch.mockResolvedValueOnce({
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
  mockFetch.mockRejectedValueOnce(new Error('Network timeout'))

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
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  })

  const result = await searchSkills('React')

  expect(result).toHaveLength(1)
  expect(result[0]?.name).toBe('React')
  expect(mockFetch).toHaveBeenCalledWith('https://skills.sh/api/skills?search=React')
})

test('searchSkills encodes query parameters', async () => {
  const mockResponse = { skills: [] }
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  })

  await searchSkills('React Native')

  expect(mockFetch).toHaveBeenCalledWith('https://skills.sh/api/skills?search=React%20Native')
})

test('searchSkills returns empty array for empty query', async () => {
  const result = await searchSkills('')

  expect(result).toEqual([])
  expect(mockFetch).not.toHaveBeenCalled()
})

test('searchSkills returns empty array for whitespace-only query', async () => {
  const result = await searchSkills('   ')

  expect(result).toEqual([])
  expect(mockFetch).not.toHaveBeenCalled()
})

test('searchSkills handles HTTP errors', async () => {
  mockFetch.mockResolvedValueOnce({
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
  mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

  try {
    await searchSkills('React')
    expect.fail('Should have thrown')
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as Error).message).toContain('Network error: Connection refused')
  }
})

test('fetchSkills handles empty response', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  })

  const result = await fetchSkills()

  expect(result.skills).toEqual([])
  expect(result.hasMore).toBe(false)
})
