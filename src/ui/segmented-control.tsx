import { Radio } from '@base-ui-components/react/radio'
import { RadioGroup } from '@base-ui-components/react/radio-group'
import { clsx } from 'clsx'
import { type ReactNode } from 'react'

export interface SegmentedControlOption {
  value: string
  label: ReactNode
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps) {
  return (
    <RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={(newValue) => onValueChange?.(newValue as string)}
      disabled={disabled}
      aria-label={ariaLabel}
      className={clsx('inline-flex rounded-lg border border-foreground/10 bg-foreground/[0.04] p-0.5', className)}
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          className={clsx(
            'relative cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium',
            'transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
            'outline-none select-none',
            'text-foreground/60',
            'hover:text-foreground/80',
            'focus-visible:ring-1 focus-visible:ring-foreground/20',
            'data-[checked]:bg-foreground/[0.12] data-[checked]:text-foreground data-[checked]:shadow-[0_1px_3px_rgba(0,0,0,0.08)]',
            'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
          )}
        >
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}

export { RadioGroup as SegmentedControlRoot }
