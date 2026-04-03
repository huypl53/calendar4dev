import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Badge } from './badge.js'

afterEach(() => cleanup())

describe('Badge', () => {
  it('renders children in default variant', () => {
    render(<Badge>3 events</Badge>)
    expect(screen.getByText('3 events')).toBeInTheDocument()
  })

  it('uses default styling with token classes', () => {
    render(<Badge>Label</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('bg-[var(--color-bg-tertiary)]')
    expect(badge.className).toContain('text-[var(--color-text-secondary)]')
  })

  it('renders dot variant as small circle', () => {
    render(<Badge variant="dot" />)
    const dot = screen.getByTestId('badge-dot')
    expect(dot.className).toContain('rounded-full')
    expect(dot.className).toContain('h-2.5')
    expect(dot.className).toContain('w-2.5')
  })

  it('dot variant uses accent color by default', () => {
    render(<Badge variant="dot" />)
    const dot = screen.getByTestId('badge-dot')
    expect(dot.style.backgroundColor).toBe('var(--color-accent)')
  })

  it('dot variant accepts custom color', () => {
    render(<Badge variant="dot" color="#ff0000" />)
    const dot = screen.getByTestId('badge-dot')
    expect(dot.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  it('default variant accepts custom color', () => {
    render(<Badge color="#3fb950">Custom</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.style.backgroundColor).toBe('rgb(63, 185, 80)')
  })

  it('merges custom className', () => {
    render(<Badge className="extra">Custom</Badge>)
    expect(screen.getByTestId('badge').className).toContain('extra')
  })
})
