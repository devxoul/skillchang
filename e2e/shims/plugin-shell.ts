const localSkillMd = `# Local Fallback Skill

A skill loaded from local disk when remote fails.

## Features

- Works offline
- Falls back gracefully
`

const installedSkillsOutput = `Global Skills

git-master    /home/.agents/skills/git-master
  Agents: claude
frontend-ui-ux    /home/.agents/skills/frontend-ui-ux
  Agents: claude`

export class Command {
  private program = ''
  private args: string[] = []

  static create(program: string, args?: string[], _options?: unknown) {
    const cmd = new Command()
    cmd.program = program
    cmd.args = args ?? []
    return cmd
  }

  async execute() {
    if (this.program === 'cat' && this.args[0]?.includes('SKILL.md')) {
      return { code: 0, stdout: localSkillMd, stderr: '' }
    }

    if (this.args.includes('list')) {
      return { code: 0, stdout: installedSkillsOutput, stderr: '' }
    }

    return { code: 0, stdout: '', stderr: '' }
  }
}

export const open = (url: string) => window.open(url, '_blank')
