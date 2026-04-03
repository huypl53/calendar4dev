import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { Button } from './button.js'

afterEach(() => cleanup())

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies primary variant classes', () => {
    render(<Button variant="primary">Primary</Button>)
    const btn = screen.getByText('Primary')
    expect(btn.className).toContain('bg-[var(--color-accent)]')
  })

  it('applies secondary variant classes by default', () => {
    render(<Button>Default</Button>)
    const btn = screen.getByText('Default')
    expect(btn.className).toContain('bg-[var(--color-bg-tertiary)]')
  })

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByText('Ghost')
    expect(btn.className).toContain('bg-transparent')
  })

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Danger</Button>)
    const btn = screen.getByText('Danger')
    expect(btn.className).toContain('bg-[var(--color-danger)]')
  })

  it('applies sm size classes', () => {
    render(<Button size="sm">Small</Button>)
    const btn = screen.getByText('Small')
    expect(btn.className).toContain('h-7')
  })

  it('applies md size classes by default', () => {
    render(<Button>Medium</Button>)
    const btn = screen.getByText('Medium')
    expect(btn.className).toContain('h-9')
  })

  it('renders as disabled with reduced opacity', () => {
    render(<Button disabled>Disabled</Button>)
    const btn = screen.getByText('Disabled')
    expect(btn).toBeDisabled()
    expect(btn.className).toContain('opacity-50')
    expect(btn.className).toContain('pointer-events-none')
  })

  it('fires onClick handler', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('merges custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByText('Custom').className).toContain('custom-class')
  })
})
