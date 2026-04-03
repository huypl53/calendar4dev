import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  size?: 'sm' | 'md'
  children: ReactNode
}

const sizeClasses: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
}

export function IconButton({
  size = 'md',
  disabled,
  className = '',
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors ${sizeClasses[size]} ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
