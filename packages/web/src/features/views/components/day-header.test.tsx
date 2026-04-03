import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { DayHeader } from './day-header.js'

afterEach(() => cleanup())

vi.mock('../../../lib/date-utils.js', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/date-utils.js')>(
    '../../../lib/date-utils.js',
  )
  return {
    ...actual,
    isToday: (date: string) => date === '2026-04-01',
  }
})

describe('DayHeader', () => {
  it('renders the day header container', () => {
    render(<DayHeader date="2026-04-01" />)
    expect(screen.getByTestId('day-header')).toBeInTheDocument()
  })

  it('displays day name and number', () => {
    render(<DayHeader date="2026-04-01" />)
    expect(screen.getByText('WED')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('displays month name', () => {
    render(<DayHeader date="2026-04-01" />)
    expect(screen.getByText('April')).toBeInTheDocument()
  })

  it('highlights today with accent color', () => {
    render(<DayHeader date="2026-04-01" />)
    const numberSpan = screen.getByText('1')
    expect(numberSpan.className).toContain('bg-[var(--color-accent)]')
  })

  it('does not highlight non-today dates', () => {
    render(<DayHeader date="2026-04-02" />)
    const numberSpan = screen.getByText('2')
    expect(numberSpan.className).not.toContain('bg-[var(--color-accent)]')
  })

  it('renders all-day section', () => {
    render(<DayHeader date="2026-04-01" />)
    expect(screen.getByTestId('all-day-section')).toBeInTheDocument()
    expect(screen.getByText('all-day')).toBeInTheDocument()
  })
})
