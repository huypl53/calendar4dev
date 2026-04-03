import type { ReactNode } from 'react'

export interface BadgeProps {
  children?: ReactNode
  color?: string
  variant?: 'default' | 'dot'
  className?: string
}

export function Badge({
  children,
  color,
  variant = 'default',
  className = '',
}: BadgeProps) {
  if (variant === 'dot') {
    return (
      <span
        data-testid="badge-dot"
        className={`inline-block h-2.5 w-2.5 rounded-full ${className}`}
        style={{ backgroundColor: color ?? 'var(--color-accent)' }}
      />
    )
  }

  return (
    <span
      data-testid="badge"
      className={`inline-flex items-center rounded-full bg-[var(--color-bg-tertiary)] px-2 py-0.5 text-[length:var(--font-size-tiny)] text-[var(--color-text-secondary)] ${className}`}
      style={color ? { backgroundColor: color, color: 'white' } : undefined}
    >
      {children}
    </span>
  )
}
