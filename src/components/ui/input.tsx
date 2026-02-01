import { clsx } from 'clsx'
import { forwardRef, type InputHTMLAttributes } from 'react'

type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize
  error?: boolean
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-base rounded-md',
  lg: 'h-12 px-5 text-lg rounded-lg',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = 'md', error, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'w-full',
          'bg-background text-foreground',
          'border border-border',
          'placeholder:text-muted-foreground',
          'transition-colors duration-150',
          'hover:border-brand-400',
          'focus:border-transparent focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none',
          'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50',
          error && 'border-error focus:ring-error',
          sizeStyles[inputSize],
          className,
        )}
        disabled={disabled}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
