export const config = {
  runtime: 'edge',
}

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"

const ICON_PATH_D =
  'M400 181.547C412.376 174.402 427.624 174.402 440 181.547L616.506 283.453C628.882 290.598 636.506 303.803 636.506 318.094V521.906C636.506 536.197 628.882 549.402 616.506 556.547L440 658.453C427.624 665.598 412.376 665.598 400 658.453L223.494 556.547C211.118 549.402 203.494 536.197 203.494 521.906V318.094C203.494 303.803 211.118 290.598 223.494 283.453L400 181.547Z'

const BADGE_HEIGHT = 54
const MIN_BADGE_WIDTH = 160
const MAX_NAME_LENGTH = 30

const ICON_SIZE = 26
const ICON_LEFT = 16
const TEXT_LEFT = ICON_LEFT + ICON_SIZE + 10
const RIGHT_PAD = 16

const NAME_FONT_SIZE = 18
const BRAND_FONT_SIZE = 11

interface Theme {
  bg: string
  border: string
  iconFill: string
  nameColor: string
  brandColor: string
}

const THEMES: Record<string, Theme> = {
  dark: {
    bg: '#1a1a1a',
    border: '#333333',
    iconFill: '#ffffff',
    nameColor: '#ffffff',
    brandColor: '#999999',
  },
  light: {
    bg: '#ffffff',
    border: '#d1d1d1',
    iconFill: '#1a1a1a',
    nameColor: '#1a1a1a',
    brandColor: '#666666',
  },
}

// Approximate character widths as em fractions for system sans-serif (weight 500)
const NARROW = 0.28
const SEMI_NARROW = 0.35
const NORMAL = 0.55
const SEMI_WIDE = 0.5
const WIDE = 0.78
const CAP_NORMAL = 0.65
const CAP_WIDE = 0.85

const CHAR_WIDTHS: Record<string, number> = {
  i: NARROW,
  l: NARROW,
  '1': NARROW,
  '.': NARROW,
  ',': NARROW,
  ':': NARROW,
  ';': NARROW,
  '!': NARROW,
  '|': NARROW,
  t: SEMI_NARROW,
  f: SEMI_NARROW,
  r: SEMI_NARROW,
  j: SEMI_NARROW,
  '-': SEMI_NARROW,
  '(': SEMI_NARROW,
  ')': SEMI_NARROW,
  '/': SEMI_NARROW,
  ' ': NARROW,
  s: 0.48,
  c: 0.48,
  z: 0.48,
  x: SEMI_WIDE,
  y: SEMI_WIDE,
  v: SEMI_WIDE,
  m: WIDE,
  w: WIDE,
  M: CAP_WIDE,
  W: CAP_WIDE,
}

function measureText(text: string, fontSize: number): number {
  let totalEm = 0
  for (const char of text) {
    if (CHAR_WIDTHS[char] !== undefined) {
      totalEm += CHAR_WIDTHS[char]
    } else if (char >= 'A' && char <= 'Z') {
      totalEm += CAP_NORMAL
    } else {
      totalEm += NORMAL
    }
  }
  return totalEm * fontSize
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateBadge(skillName: string, theme: Theme): string {
  const nameWidth = measureText(skillName, NAME_FONT_SIZE)
  const brandWidth = measureText('SkillPad', BRAND_FONT_SIZE)
  const textWidth = Math.max(nameWidth, brandWidth)
  const width = Math.max(MIN_BADGE_WIDTH, Math.ceil(TEXT_LEFT + textWidth + RIGHT_PAD))

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${BADGE_HEIGHT}" viewBox="0 0 ${width} ${BADGE_HEIGHT}" role="img" aria-label="${escapeXml(skillName)} on SkillPad">
  <title>${escapeXml(skillName)} on SkillPad</title>
  <rect width="${width}" height="${BADGE_HEIGHT}" rx="10" fill="${theme.bg}"/>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${BADGE_HEIGHT - 1}" rx="9.5" fill="none" stroke="${theme.border}"/>
  <svg x="${ICON_LEFT}" y="14" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="113 150 540 540">
    <path d="${ICON_PATH_D}" fill="${theme.iconFill}"/>
    <circle cx="147.5" cy="191.5" r="17.5" fill="${theme.iconFill}"/>
    <circle cx="192.5" cy="191.5" r="17.5" fill="${theme.iconFill}"/>
    <circle cx="237.5" cy="191.5" r="17.5" fill="${theme.iconFill}"/>
  </svg>
  <text x="${TEXT_LEFT}" y="25" font-family="${FONT_FAMILY}" font-size="${NAME_FONT_SIZE}" font-weight="500" fill="${theme.nameColor}" letter-spacing="0">${escapeXml(skillName)}</text>
  <text x="${TEXT_LEFT}" y="42" font-family="${FONT_FAMILY}" font-size="${BRAND_FONT_SIZE}" font-weight="400" fill="${theme.brandColor}" letter-spacing="0.2">SkillPad</text>
</svg>`
}

export default function handler(request: Request): Response {
  const url = new URL(request.url)
  const rawName = url.searchParams.get('name') ?? ''
  const themeKey = url.searchParams.get('theme') === 'light' ? 'light' : 'dark'

  const name = rawName.replace(/[^a-zA-Z0-9\-_.]/g, '').slice(0, MAX_NAME_LENGTH)
  if (!name) {
    return new Response('Missing skill name', { status: 400 })
  }

  const theme = THEMES[themeKey]
  const svg = generateBadge(name, theme)

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
