import { Robot } from '@phosphor-icons/react'
import type { ReactElement } from 'react'

import Aws from '@lobehub/icons/es/Aws/components/Mono'
import Claude from '@lobehub/icons/es/Claude/components/Mono'
import Cline from '@lobehub/icons/es/Cline/components/Mono'
import CodeGeeX from '@lobehub/icons/es/CodeGeeX/components/Mono'
import Cursor from '@lobehub/icons/es/Cursor/components/Mono'
import DeepSeek from '@lobehub/icons/es/DeepSeek/components/Mono'
import Gemini from '@lobehub/icons/es/Gemini/components/Mono'
import GithubCopilot from '@lobehub/icons/es/GithubCopilot/components/Mono'
import OpenAI from '@lobehub/icons/es/OpenAI/components/Mono'
import Replit from '@lobehub/icons/es/Replit/components/Mono'
import Windsurf from '@lobehub/icons/es/Windsurf/components/Mono'

interface AgentIconProps {
  agent: string
  size?: number
  className?: string
}

type IconRenderer = (size: number) => ReactElement

const AGENT_ICONS: Record<string, IconRenderer> = {
  'Claude Code': (size) => <Claude size={size} />,
  Cursor: (size) => <Cursor size={size} />,
  Cline: (size) => <Cline size={size} />,
  Windsurf: (size) => <Windsurf size={size} />,
  'GitHub Copilot': (size) => <GithubCopilot size={size} />,
  'Gemini CLI': (size) => <Gemini size={size} />,
  Codex: (size) => <OpenAI size={size} />,
  'DeepSeek Coder': (size) => <DeepSeek size={size} />,
  CodeGeex: (size) => <CodeGeeX size={size} />,
  'Replit Ghostwriter': (size) => <Replit size={size} />,
  'Amazon Q': (size) => <Aws size={size} />,
  CodeWhisperer: (size) => <Aws size={size} />,
}

export function AgentIcon({ agent, size = 16, className }: AgentIconProps) {
  const renderIcon = AGENT_ICONS[agent]

  if (renderIcon) {
    return renderIcon(size)
  }

  return <Robot size={size} className={className} />
}

export { AGENT_ICONS }
