export const config = {
  runtime: 'edge',
}

const UPSTREAMS: Record<string, string> = {
  github: 'https://api.github.com',
  raw: 'https://raw.githubusercontent.com',
  skills: 'https://skills.sh',
}

const DEFAULT_ACCEPT: Record<string, string> = {
  github: 'application/vnd.github+json',
  raw: '*/*',
  skills: 'application/json',
}

const CACHE_TTL: Record<string, number> = {
  github: 300,
  raw: 300,
  skills: 60,
}

const GITHUB_UPSTREAMS = new Set(['github', 'raw'])

const ALLOWED_PATHS: Record<string, RegExp[]> = {
  github: [
    /^repos\/[^/]+\/[^/]+(\/(contents\/.+)?)?$/,
    /^repos\/[^/]+\/[^/]+\/branches\/[^/]+$/,
    /^repos\/[^/]+\/[^/]+\/git\/trees\/[^/]+$/,
    /^search\/repositories$/,
  ],
  raw: [/^[^/]+\/[^/]+\/.+$/],
  skills: [/^.+$/],
}

const BLOCKED_EXTERNAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match, If-Modified-Since',
}

const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'etag',
  'last-modified',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
]

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return jsonError(405, 'Method Not Allowed')
  }

  const url = new URL(request.url)
  const prefix = url.searchParams.get('u')
  const path = url.searchParams.get('p')

  if (!prefix || !path) {
    return jsonError(404, 'Not Found')
  }

  const query = new URLSearchParams(url.searchParams)
  query.delete('u')
  query.delete('p')
  const upstreamUrl = resolveUpstreamUrl(prefix, path, query)
  if (!upstreamUrl) {
    return jsonError(403, 'Forbidden')
  }

  const headers: Record<string, string> = {
    Accept: request.headers.get('Accept') || DEFAULT_ACCEPT[prefix] || '*/*',
    'User-Agent': 'skillpad-api-proxy',
  }

  if (process.env.GITHUB_TOKEN && GITHUB_UPSTREAMS.has(prefix)) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const ifNoneMatch = request.headers.get('If-None-Match')
  if (ifNoneMatch) headers['If-None-Match'] = ifNoneMatch

  const ifModifiedSince = request.headers.get('If-Modified-Since')
  if (ifModifiedSince) headers['If-Modified-Since'] = ifModifiedSince

  try {
    let response = await fetch(upstreamUrl, {
      method: request.method,
      headers,
    })

    // Fine-grained GitHub tokens return 404 (not 403) for repos outside their
    // scope, masking public repos as missing. Retry without auth so public
    // repos always resolve regardless of the proxy token's scope.
    if (
      GITHUB_UPSTREAMS.has(prefix) &&
      headers['Authorization'] &&
      (response.status === 404 || response.status === 403)
    ) {
      const unauthHeaders: Record<string, string> = {}
      for (const [key, value] of Object.entries(headers)) {
        if (key !== 'Authorization') unauthHeaders[key] = value
      }
      const unauthResponse = await fetch(upstreamUrl, {
        method: request.method,
        headers: unauthHeaders,
      })
      if (unauthResponse.ok) {
        response = unauthResponse
      }
    }

    const responseHeaders = new Headers(CORS_HEADERS)
    for (const name of FORWARDED_RESPONSE_HEADERS) {
      const value = response.headers.get(name)
      if (value) responseHeaders.set(name, value)
    }

    if (response.ok) {
      const ttl = CACHE_TTL[prefix] || 60
      responseHeaders.set('Cache-Control', `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`)
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch {
    return jsonError(502, 'Bad Gateway')
  }
}

function resolveUpstreamUrl(prefix: string, path: string, query: URLSearchParams): string | null {
  if (prefix === 'external') {
    return resolveExternalUrl(path, query)
  }

  const upstream = UPSTREAMS[prefix]
  if (!upstream) {
    return null
  }

  const patterns = ALLOWED_PATHS[prefix]
  if (!patterns?.some((re) => re.test(path))) {
    return null
  }

  const queryString = query.toString()
  return `${upstream}/${path}${queryString ? `?${queryString}` : ''}`
}

function isPrivateHostname(hostname: string): boolean {
  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
  const ipv4Mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(hostname)
  const host = ipv4Mapped ? ipv4Mapped[1]! : hostname

  return (
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^::1$/.test(host) ||
    /^fe80:/i.test(host) ||
    /^f[cd][0-9a-f]{2}:/i.test(host)
  )
}

function resolveExternalUrl(path: string, query: URLSearchParams): string | null {
  let target: URL

  try {
    target = new URL(path)
  } catch {
    return null
  }

  if (target.protocol !== 'https:') {
    return null
  }

  const hostname = target.hostname

  if (BLOCKED_EXTERNAL_HOSTS.has(hostname)) {
    return null
  }

  if (isPrivateHostname(hostname)) {
    return null
  }

  for (const [key, value] of query.entries()) {
    target.searchParams.append(key, value)
  }

  return target.toString()
}
