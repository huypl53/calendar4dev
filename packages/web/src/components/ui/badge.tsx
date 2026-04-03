import type { ReactNode } from 'react'

/** Returns true if a hex color is dark enough to warrant white foreground text. */
function isHexDark(hex: string): boolean {
  if (!hex.startsWith('#') || hex.length < 7) return true
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b < 128
}

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
      style={color ? { backgroundColor: color, color: isHexDark(color) ? 'white' : '#1a1a1a' } : undefined}
    >
      {children}
    </span>
  )
}
