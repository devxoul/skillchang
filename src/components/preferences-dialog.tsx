import { useState, useEffect } from 'react'
import { DialogRoot, DialogPortal, DialogBackdrop, DialogContent, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { usePreferences } from '@/hooks/use-preferences'
import { AGENTS } from '@/data/agents'

interface PreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreferencesDialog({ open, onOpenChange }: PreferencesDialogProps) {
  const { preferences, savePreferences } = usePreferences()
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])

  useEffect(() => {
    setSelectedAgents(preferences.defaultAgents)
  }, [preferences.defaultAgents])

  const handleToggleAgent = (agent: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent],
    )
  }

  const handleSave = async () => {
    await savePreferences({ defaultAgents: selectedAgents })
    onOpenChange(false)
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogContent>
          <DialogTitle>Preferences</DialogTitle>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Default Agents</label>
              <p className="mt-1 text-sm text-muted-foreground">
                These agents will be pre-selected when adding skills
              </p>
              <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded border border-border p-2">
                {AGENTS.map((agent) => (
                  <label key={agent} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedAgents.includes(agent)}
                      onCheckedChange={() => handleToggleAgent(agent)}
                    />
                    {agent}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  )
}
