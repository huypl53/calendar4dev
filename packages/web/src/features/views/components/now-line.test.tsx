import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { NowLine } from './now-line.js'

afterEach(() => cleanup())

describe('NowLine', () => {
  beforeEach(() => {
    // Mock Date to 10:30 AM = 630 minutes
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 3, 10, 30, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the now line', () => {
    render(<NowLine />)
    expect(screen.getByTestId('now-line')).toBeInTheDocument()
  })

  it('positions at correct percentage for 10:30 AM', () => {
    render(<NowLine />)
    const line = screen.getByTestId('now-line')
    // 630 / 1440 * 100 = 43.75%
    expect(line.style.top).toBe('43.75%')
  })

  it('uses now-line color token', () => {
    render(<NowLine />)
    const line = screen.getByTestId('now-line')
    const inner = line.innerHTML
    expect(inner).toContain('bg-[var(--color-now-line)]')
  })
})
