import { Robot } from '@phosphor-icons/react'
import type { ReactElement } from 'react'

import Claude from '@lobehub/icons/es/Claude/components/Mono'
import Cline from '@lobehub/icons/es/Cline/components/Mono'
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
  'claude-code': (size) => <Claude size={size} />,
  cursor: (size) => <Cursor size={size} />,
  cline: (size) => <Cline size={size} />,
  windsurf: (size) => <Windsurf size={size} />,
  'github-copilot': (size) => <GithubCopilot size={size} />,
  'gemini-cli': (size) => <Gemini size={size} />,
  codex: (size) => <OpenAI size={size} />,
  'qwen-code': (size) => <DeepSeek size={size} />,
  replit: (size) => <Replit size={size} />,
}

export function AgentIcon({ agent, size = 16, className }: AgentIconProps) {
  const renderIcon = AGENT_ICONS[agent]

  if (renderIcon) {
    return renderIcon(size)
  }

  return <Robot size={size} className={className} />
}

export { AGENT_ICONS }
