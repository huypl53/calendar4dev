import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MonthGrid } from './month-grid.js'

afterEach(() => cleanup())

vi.mock('../../../lib/date-utils.js', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/date-utils.js')>(
    '../../../lib/date-utils.js',
  )
  return {
    ...actual,
    isToday: (date: string) => date === '2026-04-03',
  }
})

describe('MonthGrid', () => {
  it('renders the month grid container', () => {
    render(<MonthGrid date="2026-04-01" />)
    expect(screen.getByTestId('month-grid')).toBeInTheDocument()
  })

  it('renders day-of-week headers', () => {
    render(<MonthGrid date="2026-04-01" />)
    expect(screen.getByText('MON')).toBeInTheDocument()
    expect(screen.getByText('TUE')).toBeInTheDocument()
    expect(screen.getByText('WED')).toBeInTheDocument()
    expect(screen.getByText('THU')).toBeInTheDocument()
    expect(screen.getByText('FRI')).toBeInTheDocument()
    expect(screen.getByText('SAT')).toBeInTheDocument()
    expect(screen.getByText('SUN')).toBeInTheDocument()
  })

  it('renders 42 grid cells', () => {
    render(<MonthGrid date="2026-04-01" />)
    const cells = screen.getAllByTestId(/^month-cell-/)
    expect(cells).toHaveLength(42)
  })

  it('highlights today with accent color', () => {
    render(<MonthGrid date="2026-04-01" />)
    const todayCell = screen.getByTestId('month-cell-2026-04-03')
    const span = todayCell.querySelector('span')
    expect(span?.className).toContain('bg-[var(--color-accent)]')
  })

  it('dims out-of-month days', () => {
    render(<MonthGrid date="2026-04-01" />)
    // March 30 is before April — should be dimmed
    const outCell = screen.getByTestId('month-cell-2026-03-30')
    const span = outCell.querySelector('span')
    expect(span?.className).toContain('text-[var(--color-text-tertiary)]')
  })

  it('shows in-month days with primary text', () => {
    render(<MonthGrid date="2026-04-01" />)
    const inCell = screen.getByTestId('month-cell-2026-04-15')
    const span = inCell.querySelector('span')
    expect(span?.className).toContain('text-[var(--color-text-primary)]')
  })

  it('uses mini-cal-cell density token for cell height', () => {
    render(<MonthGrid date="2026-04-01" />)
    const cell = screen.getByTestId('month-cell-2026-04-01')
    expect(cell.style.minHeight).toBe('var(--density-mini-cal-cell)')
  })
})
