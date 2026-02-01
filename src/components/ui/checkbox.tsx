import { Checkbox as BaseCheckbox } from '@base-ui-components/react/checkbox'
import { clsx } from 'clsx'
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'

export interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseCheckbox.Root>, 'children'> {
  label?: ReactNode
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

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="inline-flex cursor-pointer items-center gap-2 select-none">
        <BaseCheckbox.Root
          ref={ref}
          className={clsx(
            'flex items-center justify-center',
            'h-5 w-5 rounded border border-border',
            'bg-background text-foreground',
            'transition-colors duration-150',
            'hover:border-brand-400',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
            'data-[checked]:border-brand-500 data-[checked]:bg-brand-500 data-[checked]:text-white',
            'data-[indeterminate]:border-brand-500 data-[indeterminate]:bg-brand-500 data-[indeterminate]:text-white',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        >
          <BaseCheckbox.Indicator className="flex items-center justify-center">
            <CheckIcon className="h-3.5 w-3.5" />
          </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
        {label && <span className="text-foreground">{label}</span>}
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'

export const CheckboxRoot = BaseCheckbox.Root
export const CheckboxIndicator = BaseCheckbox.Indicator

export { CheckboxRoot as Root, CheckboxIndicator as Indicator }
