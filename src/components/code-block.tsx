import { memo, useEffect, useState } from 'react'
import { type BundledLanguage, createHighlighter, type Highlighter } from 'shiki'

let _highlighter: Highlighter | null = null

const _ready = createHighlighter({
  themes: ['github-dark-dimmed', 'github-light'],
  langs: [
    'typescript',
    'javascript',
    'tsx',
    'jsx',
    'bash',
    'shell',
    'json',
    'yaml',
    'python',
    'rust',
    'toml',
    'markdown',
    'css',
    'html',
  ],
}).then((h) => {
  _highlighter = h
  return h
})

const LANG_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  py: 'python',
  rs: 'rust',
  md: 'markdown',
}

const SUPPORTED_LANGS = new Set([
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'bash',
  'shell',
  'json',
  'yaml',
  'python',
  'rust',
  'toml',
  'markdown',
  'css',
  'html',
])

function resolveLang(lang: string): string | null {
  const resolved = LANG_ALIASES[lang] ?? lang
  return SUPPORTED_LANGS.has(resolved) ? resolved : null
}

function highlightCode(h: Highlighter, code: string, lang: string): string | null {
  try {
    return h.codeToHtml(code, {
      lang: lang as BundledLanguage,
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
    })
  } catch {
    return null
  }
}

export const CodeBlock = memo(function CodeBlock({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  const match = /language-(\w+)/.exec(className || '')
  const lang = match?.[1] ? resolveLang(match[1]) : null
  const code = String(children).replace(/\n$/, '')

  const [html, setHtml] = useState<string | null>(() => {
    if (lang && _highlighter) return highlightCode(_highlighter, code, lang)
    return null
  })

  useEffect(() => {
    if (!lang || html) return
    _ready.then((h) => setHtml(highlightCode(h, code, lang)))
  }, [code, lang, html])

  if (html) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }

  if (lang) {
    return (
      <pre>
        <code className={className}>{children}</code>
      </pre>
    )
  }

  return <code className={className}>{children}</code>
})
