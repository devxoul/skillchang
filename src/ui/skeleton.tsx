import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('animate-shimmer rounded bg-foreground/[0.06]', className)}
      aria-hidden="true"
      {...props}
    />
  )
})

Skeleton.displayName = 'Skeleton'
