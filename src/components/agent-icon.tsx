import Claude from '@lobehub/icons/es/Claude/components/Mono'
import Cline from '@lobehub/icons/es/Cline/components/Mono'
import Cursor from '@lobehub/icons/es/Cursor/components/Mono'
import DeepSeek from '@lobehub/icons/es/DeepSeek/components/Mono'
import Gemini from '@lobehub/icons/es/Gemini/components/Mono'
import GithubCopilot from '@lobehub/icons/es/GithubCopilot/components/Mono'
import OpenAI from '@lobehub/icons/es/OpenAI/components/Mono'
import Replit from '@lobehub/icons/es/Replit/components/Mono'
import Windsurf from '@lobehub/icons/es/Windsurf/components/Mono'
import { Robot } from '@phosphor-icons/react'
import type { ReactElement } from 'react'

interface AgentIconProps {
  agent: string
  size?: number
  className?: string
}

type IconRenderer = (size: number, className?: string) => ReactElement

const AGENT_ICONS: Record<string, IconRenderer> = {
  'claude-code': (size, className) => <Claude size={size} className={className} />,
  cursor: (size, className) => <Cursor size={size} className={className} />,
  cline: (size, className) => <Cline size={size} className={className} />,
  windsurf: (size, className) => <Windsurf size={size} className={className} />,
  'github-copilot': (size, className) => <GithubCopilot size={size} className={className} />,
  'gemini-cli': (size, className) => <Gemini size={size} className={className} />,
  codex: (size, className) => <OpenAI size={size} className={className} />,
  'qwen-code': (size, className) => <DeepSeek size={size} className={className} />,
  replit: (size, className) => <Replit size={size} className={className} />,
}

function normalizeAgentId(agent: string): string {
  return agent.toLowerCase().replace(/\s+/g, '-')
}

export function AgentIcon({ agent, size = 16, className }: AgentIconProps) {
  const normalizedAgent = normalizeAgentId(agent)
  const renderIcon = AGENT_ICONS[normalizedAgent]

  if (renderIcon) {
    return renderIcon(size, className)
  }

  return <Robot size={size} className={className} />
}

export { AGENT_ICONS }
