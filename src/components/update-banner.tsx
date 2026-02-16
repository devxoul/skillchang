import { ArrowsClockwise, DownloadSimple } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import type { AppUpdateState } from '@/types/app-update'

interface UpdateBannerProps {
  state: AppUpdateState
  onDownload: () => void
  onRestart: () => void
  onRetry: () => void
}

export function UpdateBanner({ state, onDownload, onRestart, onRetry }: UpdateBannerProps) {
  if (state.status === 'idle' || state.status === 'checking') {
    return null
  }

  return (
    <div className="mx-2 mb-2 rounded-md bg-overlay-6 px-2.5 py-2 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12px] font-medium text-foreground/60">
          {state.status === 'available' && `v${state.version} available`}
          {state.status === 'downloading' && 'Downloading update...'}
          {state.status === 'ready' && 'Ready to update'}
          {state.status === 'error' && `Error: ${state.message}`}
        </span>

        {state.status === 'available' && (
          <button
            type="button"
            onClick={onDownload}
            className={clsx(
              'flex shrink-0 items-center gap-1.5 rounded bg-foreground/[0.08] px-2 py-1',
              'text-[11px] font-medium text-foreground transition-colors hover:bg-foreground/[0.12]',
            )}
          >
            <DownloadSimple size={12} weight="bold" />
            <span>Download</span>
          </button>
        )}

        {state.status === 'ready' && (
          <button
            type="button"
            onClick={onRestart}
            className={clsx(
              'flex shrink-0 items-center gap-1.5 rounded bg-emerald-500/10 px-2 py-1',
              'text-[11px] font-medium text-emerald-500 transition-colors hover:bg-emerald-500/20',
            )}
          >
            <ArrowsClockwise size={12} weight="bold" />
            <span>Restart</span>
          </button>
        )}

        {state.status === 'error' && (
          <button
            type="button"
            onClick={onRetry}
            className={clsx(
              'shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium text-foreground/40',
              'transition-colors hover:bg-overlay-8 hover:text-foreground/70',
            )}
          >
            Retry
          </button>
        )}
      </div>

      {state.status === 'downloading' && (
        <div className="mt-1.5 flex justify-center">
          <div className="h-1 w-1 animate-pulse rounded-full bg-foreground/30" />
        </div>
      )}
    </div>
  )
}
