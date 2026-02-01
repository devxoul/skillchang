import { Select as BaseSelect } from '@base-ui-components/react/select'
import { clsx } from 'clsx'
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'

function ChevronDownIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const SelectRoot = BaseSelect.Root

export const SelectTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof BaseSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Trigger
    ref={ref}
    className={clsx(
      'flex items-center justify-between gap-2',
      'h-10 min-w-36 px-4',
      'bg-background text-foreground',
      'rounded-md border border-border',
      'transition-colors duration-150',
      'hover:border-brand-400',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
      'data-[popup-open]:ring-2 data-[popup-open]:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'cursor-default select-none',
      className,
    )}
    {...props}
  >
    {children}
  </BaseSelect.Trigger>
))
SelectTrigger.displayName = 'SelectTrigger'

export const SelectValue = BaseSelect.Value

export const SelectIcon = forwardRef<
  HTMLSpanElement,
  ComponentPropsWithoutRef<typeof BaseSelect.Icon>
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Icon ref={ref} className={clsx('flex text-muted-foreground', className)} {...props}>
    {children ?? <ChevronDownIcon className="h-4 w-4" />}
  </BaseSelect.Icon>
))
SelectIcon.displayName = 'SelectIcon'

export const SelectPortal = BaseSelect.Portal

export const SelectPositioner = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseSelect.Positioner>
>(({ className, ...props }, ref) => (
  <BaseSelect.Positioner
    ref={ref}
    className={clsx('z-50 outline-none', className)}
    sideOffset={8}
    {...props}
  />
))
SelectPositioner.displayName = 'SelectPositioner'

export const SelectPopup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseSelect.Popup>
>(({ className, ...props }, ref) => (
  <BaseSelect.Popup
    ref={ref}
    className={clsx(
      'max-h-[var(--available-height)] overflow-y-auto',
      'bg-background text-foreground',
      'rounded-md border border-border shadow-lg',
      'py-1',
      'transition-all duration-150',
      'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
      'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
      className,
    )}
    {...props}
  />
))
SelectPopup.displayName = 'SelectPopup'

export const SelectItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseSelect.Item>
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Item
    ref={ref}
    className={clsx(
      'grid grid-cols-[1rem_1fr] items-center gap-2',
      'min-w-[var(--anchor-width)] px-3 py-2',
      'cursor-default text-sm select-none',
      'outline-none',
      'data-[highlighted]:bg-surface-hover',
      'data-[selected]:text-brand-600',
      className,
    )}
    {...props}
  >
    <BaseSelect.ItemIndicator className="col-start-1">
      <CheckIcon className="h-3.5 w-3.5" />
    </BaseSelect.ItemIndicator>
    <BaseSelect.ItemText className="col-start-2">{children}</BaseSelect.ItemText>
  </BaseSelect.Item>
))
SelectItem.displayName = 'SelectItem'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function getOptionLabel(
  options: SelectOption[],
  value: string | null,
  placeholder: string,
): string {
  if (value === null) return placeholder
  const option = options.find((opt) => opt.value === value)
  return option?.label ?? placeholder
}

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select...',
  disabled,
  className,
}: SelectProps) {
  return (
    <SelectRoot
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <BaseSelect.Value>
          {(selectedValue) => getOptionLabel(options, selectedValue as string | null, placeholder)}
        </BaseSelect.Value>
        <SelectIcon />
      </SelectTrigger>
      <SelectPortal>
        <SelectPositioner>
          <SelectPopup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </SelectPositioner>
      </SelectPortal>
    </SelectRoot>
  )
}

export {
  SelectRoot as Root,
  SelectTrigger as Trigger,
  SelectValue as Value,
  SelectIcon as Icon,
  SelectPortal as Portal,
  SelectPositioner as Positioner,
  SelectPopup as Popup,
  SelectItem as Item,
}
