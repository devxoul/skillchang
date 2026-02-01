import { Button } from './ui/button'

interface InlineErrorProps {
  message: string
  onRetry?: () => void
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <span className="text-xl text-red-600">⚠️</span>
        <div className="flex-1">
          <p className="font-medium text-red-600">Error</p>
          <p className="mt-1 text-sm text-red-500">{message}</p>
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
