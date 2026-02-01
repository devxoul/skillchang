import { useState, useEffect } from 'react'
import { DialogRoot, DialogPortal, DialogBackdrop, DialogContent, DialogTitle } from './ui/Dialog'
import { Button } from './ui/Button'
import { Checkbox } from './ui/Checkbox'
import { usePreferences } from '@/hooks/usePreferences'
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
              <p className="text-sm text-muted-foreground mt-1">
                These agents will be pre-selected when adding skills
              </p>
              <div className="mt-2 max-h-64 overflow-y-auto border border-border rounded p-2 space-y-1">
                {AGENTS.map((agent) => (
                  <label key={agent} className="flex items-center gap-2 text-sm cursor-pointer">
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
