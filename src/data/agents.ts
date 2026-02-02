export interface Agent {
  id: string
  name: string
}

export const AGENTS: Agent[] = [
  { id: 'opencode', name: 'OpenCode' },
  { id: 'claude-code', name: 'Claude Code' },
  { id: 'codex', name: 'Codex' },
  { id: 'cursor', name: 'Cursor' },
  { id: 'cline', name: 'Cline' },
  { id: 'windsurf', name: 'Windsurf' },
  { id: 'amp', name: 'Amp' },
  { id: 'gemini-cli', name: 'Gemini CLI' },
  { id: 'github-copilot', name: 'GitHub Copilot' },
  { id: 'roo', name: 'Roo Code' },
  { id: 'continue', name: 'Continue' },
  { id: 'goose', name: 'Goose' },
  { id: 'augment', name: 'Augment' },
  { id: 'kode', name: 'Kode' },
  { id: 'replit', name: 'Replit' },
  { id: 'openhands', name: 'OpenHands' },
  { id: 'qwen-code', name: 'Qwen Code' },
]
