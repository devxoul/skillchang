import { Warning } from '@phosphor-icons/react'
import { Button } from '@/ui/button'

interface InlineErrorProps {
  message: string
  onRetry?: () => void
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="rounded-lg border border-error/30 bg-error-muted p-4">
      <div className="flex items-start gap-3">
        <Warning size={24} weight="fill" className="shrink-0 text-error" />
        <div className="flex-1">
          <p className="font-medium text-error-foreground">Error</p>
          <p className="mt-1 text-sm text-error-foreground/80">{message}</p>
        </div>
        {onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
