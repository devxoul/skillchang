import { Dialog as BaseDialog } from '@base-ui-components/react/dialog'
import { clsx } from 'clsx'
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'

export const DialogRoot = BaseDialog.Root

export const DialogTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof BaseDialog.Trigger>
>(({ className, ...props }, ref) => (
  <BaseDialog.Trigger
    ref={ref}
    className={clsx(
      'inline-flex items-center justify-center font-medium select-none',
      'h-10 px-4 text-base rounded-md',
      'bg-surface text-foreground border border-border',
      'hover:bg-surface-hover active:bg-muted',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'transition-colors duration-150',
      className,
    )}
    {...props}
  />
))
DialogTrigger.displayName = 'DialogTrigger'

export const DialogPortal = BaseDialog.Portal

export const DialogBackdrop = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>
>(({ className, ...props }, ref) => (
  <BaseDialog.Backdrop
    ref={ref}
    className={clsx(
      'fixed inset-0 min-h-dvh bg-black/20 dark:bg-black/70',
      'transition-opacity duration-150',
      'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
      className,
    )}
    {...props}
  />
))
DialogBackdrop.displayName = 'DialogBackdrop'

export const DialogContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseDialog.Popup>
>(({ className, ...props }, ref) => (
  <BaseDialog.Popup
    ref={ref}
    className={clsx(
      'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'w-96 max-w-[calc(100vw-3rem)] p-6',
      'bg-background text-foreground rounded-lg',
      'border border-border shadow-lg',
      'transition-all duration-150',
      'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
      'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
      className,
    )}
    {...props}
  />
))
DialogContent.displayName = 'DialogContent'

export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<typeof BaseDialog.Title>
>(({ className, ...props }, ref) => (
  <BaseDialog.Title
    ref={ref}
    className={clsx('text-lg font-semibold text-foreground mb-2', className)}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<typeof BaseDialog.Description>
>(({ className, ...props }, ref) => (
  <BaseDialog.Description
    ref={ref}
    className={clsx('text-base text-muted-foreground mb-6', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

export const DialogClose = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof BaseDialog.Close>
>(({ className, ...props }, ref) => (
  <BaseDialog.Close
    ref={ref}
    className={clsx(
      'inline-flex items-center justify-center font-medium select-none',
      'h-10 px-4 text-base rounded-md',
      'bg-surface text-foreground border border-border',
      'hover:bg-surface-hover active:bg-muted',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'transition-colors duration-150',
      className,
    )}
    {...props}
  />
))
DialogClose.displayName = 'DialogClose'

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
}

export function Dialog({ open, onOpenChange, trigger, title, description, children }: DialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
      <DialogPortal>
        <DialogBackdrop />
        <DialogContent>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
          {children}
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  )
}

export {
  DialogRoot as Root,
  DialogTrigger as Trigger,
  DialogPortal as Portal,
  DialogBackdrop as Backdrop,
  DialogContent as Content,
  DialogTitle as Title,
  DialogDescription as Description,
  DialogClose as Close,
}
