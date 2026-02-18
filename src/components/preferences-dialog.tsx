import { useEffect, useState } from 'react'
import { AgentIcon } from '@/components/agent-icon'
import { AGENTS } from '@/data/agents'
import { usePreferences } from '@/hooks/use-preferences'
import type { PackageManager } from '@/types/preferences'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import { DialogBackdrop, DialogContent, DialogPortal, DialogRoot, DialogTitle } from '@/ui/dialog'
import { SegmentedControl } from '@/ui/segmented-control'

const PACKAGE_MANAGER_OPTIONS = [
  { value: 'npx', label: 'npx' },
  { value: 'pnpx', label: 'pnpx' },
  { value: 'bunx', label: 'bunx' },
]

interface PreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreferencesDialog({ open, onOpenChange }: PreferencesDialogProps) {
  const { preferences, savePreferences } = usePreferences()
  const [selectedAgents, setSelectedAgents] = useState<string[]>(preferences.defaultAgents)
  const [packageManager, setPackageManager] = useState<PackageManager>(preferences.packageManager)
  const [autoCheckUpdates, setAutoCheckUpdates] = useState(preferences.autoCheckUpdates)

  useEffect(() => {
    if (open) {
      setSelectedAgents(preferences.defaultAgents)
      setPackageManager(preferences.packageManager)
      setAutoCheckUpdates(preferences.autoCheckUpdates)
    }
  }, [open, preferences.defaultAgents, preferences.packageManager, preferences.autoCheckUpdates])

  const handleToggleAgent = (agent: string) => {
    setSelectedAgents((prev) => (prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent]))
  }

  const handleSave = async () => {
    await savePreferences({ defaultAgents: selectedAgents, packageManager, autoCheckUpdates })
    onOpenChange(false)
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogContent>
          <DialogTitle className="text-[15px]">Preferences</DialogTitle>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-medium tracking-wide text-foreground/40 uppercase">
                Package Manager
              </span>
              <p className="mt-1 text-[12px] text-foreground/40">Package runner used when adding skills</p>
              <div className="mt-3">
                <SegmentedControl
                  options={PACKAGE_MANAGER_OPTIONS}
                  value={packageManager}
                  onValueChange={(value) => setPackageManager(value as PackageManager)}
                  aria-label="Package manager"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium tracking-wide text-foreground/40 uppercase">
                Automatically check for updates
              </span>
              <p className="mt-1 text-[12px] text-foreground/40">Check for new versions when the app starts</p>
              <div className="mt-3">
                <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-overlay-6">
                  <Checkbox
                    checked={autoCheckUpdates}
                    onCheckedChange={(checked) => setAutoCheckUpdates(checked as boolean)}
                  />
                  <span className="text-foreground">Enable auto-update checks</span>
                </label>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium tracking-wide text-foreground/40 uppercase">Default Agents</span>
              <p className="mt-1 text-[12px] text-foreground/40">
                These agents will be pre-selected when adding skills
              </p>
              <div className="mt-3 max-h-64 space-y-0.5 overflow-y-auto rounded-lg border border-overlay-border-muted bg-overlay-4 p-2">
                {AGENTS.map((agent) => (
                  <label
                    key={agent.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-overlay-6"
                  >
                    <Checkbox
                      checked={selectedAgents.includes(agent.id)}
                      onCheckedChange={() => handleToggleAgent(agent.id)}
                    />
                    <AgentIcon agent={agent.id} size={16} className="shrink-0 text-foreground/60" />
                    <span className="text-foreground">{agent.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
