import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

import handler from './proxy'

interface FetchCall {
  url: string
  init?: RequestInit
}

let calls: FetchCall[]
let responses: Response[]
const originalFetch = globalThis.fetch
const originalToken = process.env.GITHUB_TOKEN

function queueResponses(...res: Response[]) {
  responses = [...res]
}

function makeRequest(path: string): Request {
  const url = new URL(path, 'https://api.skillpad.dev')
  return new Request(url.toString())
}

beforeEach(() => {
  calls = []
  responses = []
  globalThis.fetch = mock(async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    calls.push({ url, init })
    const next = responses.shift()
    if (!next) throw new Error(`Unexpected fetch: ${url}`)
    return next
  }) as unknown as typeof globalThis.fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalToken === undefined) {
    delete process.env.GITHUB_TOKEN
  } else {
    process.env.GITHUB_TOKEN = originalToken
  }
})

describe('proxy', () => {
  test('forwards GitHub request with token when set', async () => {
    process.env.GITHUB_TOKEN = 'ghp_test'
    queueResponses(new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } }))

    const res = await handler(makeRequest('/api/proxy?u=github&p=repos/anthropics/skills'))

    expect(res.status).toBe(200)
    expect(calls).toHaveLength(1)
    expect(calls[0]?.url).toBe('https://api.github.com/repos/anthropics/skills')
    const headers = calls[0]?.init?.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer ghp_test')
  })

  test('retries GitHub request without auth when token returns 404', async () => {
    process.env.GITHUB_TOKEN = 'ghp_scoped'
    queueResponses(
      new Response('Not Found', { status: 404 }),
      new Response('{"name":"skills"}', { status: 200, headers: { 'content-type': 'application/json' } }),
    )

    const res = await handler(makeRequest('/api/proxy?u=github&p=repos/makenotion/skills'))

    expect(res.status).toBe(200)
    expect(calls).toHaveLength(2)
    const firstHeaders = calls[0]?.init?.headers as Record<string, string>
    const secondHeaders = calls[1]?.init?.headers as Record<string, string>
    expect(firstHeaders['Authorization']).toBe('Bearer ghp_scoped')
    expect(secondHeaders['Authorization']).toBeUndefined()
    expect(secondHeaders['User-Agent']).toBe('skillpad-api-proxy')
  })

  test('retries raw request without auth when token returns 404', async () => {
    process.env.GITHUB_TOKEN = 'ghp_scoped'
    queueResponses(
      new Response('Not Found', { status: 404 }),
      new Response('# SKILL\nbody', { status: 200, headers: { 'content-type': 'text/plain' } }),
    )

    const res = await handler(makeRequest('/api/proxy?u=raw&p=makenotion/skills/main/skills/notion-cli/SKILL.md'))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('# SKILL\nbody')
    expect(calls).toHaveLength(2)
  })

  test('retries on 403 then keeps original 404 when unauth also fails', async () => {
    process.env.GITHUB_TOKEN = 'ghp_scoped'
    queueResponses(new Response('Forbidden', { status: 403 }), new Response('Not Found', { status: 404 }))

    const res = await handler(makeRequest('/api/proxy?u=github&p=repos/missing/repo'))

    expect(res.status).toBe(403)
    expect(calls).toHaveLength(2)
  })

  test('does not retry when no token is configured', async () => {
    delete process.env.GITHUB_TOKEN
    queueResponses(new Response('Not Found', { status: 404 }))

    const res = await handler(makeRequest('/api/proxy?u=github&p=repos/missing/repo'))

    expect(res.status).toBe(404)
    expect(calls).toHaveLength(1)
  })

  test('does not retry skills upstream (non-github) on 404', async () => {
    process.env.GITHUB_TOKEN = 'ghp_test'
    queueResponses(new Response('Not Found', { status: 404 }))

    const res = await handler(makeRequest('/api/proxy?u=skills&p=foo/bar/baz'))

    expect(res.status).toBe(404)
    expect(calls).toHaveLength(1)
  })

  test('does not retry on success', async () => {
    process.env.GITHUB_TOKEN = 'ghp_test'
    queueResponses(new Response('{}', { status: 200 }))

    const res = await handler(makeRequest('/api/proxy?u=github&p=repos/anthropics/skills'))

    expect(res.status).toBe(200)
    expect(calls).toHaveLength(1)
  })

  test('returns 404 when required query params are missing', async () => {
    const res = await handler(makeRequest('/api/proxy'))
    expect(res.status).toBe(404)
    expect(calls).toHaveLength(0)
  })

  test('returns 403 when path does not match allowed patterns', async () => {
    const res = await handler(makeRequest('/api/proxy?u=github&p=admin/secret'))
    expect(res.status).toBe(403)
    expect(calls).toHaveLength(0)
  })
})
