import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { IconButton } from './icon-button.js'

afterEach(() => cleanup())

describe('IconButton', () => {
  it('renders children', () => {
    render(
      <IconButton aria-label="Close">
        <span data-testid="icon">X</span>
      </IconButton>,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('has required aria-label', () => {
    render(
      <IconButton aria-label="Toggle menu">
        <span>M</span>
      </IconButton>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Toggle menu')
  })

  it('applies sm size classes', () => {
    render(
      <IconButton aria-label="Small" size="sm">
        <span>S</span>
      </IconButton>,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-7')
    expect(btn.className).toContain('w-7')
  })

  it('applies md size classes by default', () => {
    render(
      <IconButton aria-label="Medium">
        <span>M</span>
      </IconButton>,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-8')
    expect(btn.className).toContain('w-8')
  })

  it('fires onClick handler', () => {
    const onClick = vi.fn()
    render(
      <IconButton aria-label="Click" onClick={onClick}>
        <span>C</span>
      </IconButton>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders as disabled with reduced opacity', () => {
    render(
      <IconButton aria-label="Disabled" disabled>
        <span>D</span>
      </IconButton>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.className).toContain('opacity-50')
  })
})
