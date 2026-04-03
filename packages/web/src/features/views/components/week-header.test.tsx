import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { WeekHeader } from './week-header.js'

afterEach(() => cleanup())

// Mock isToday to control highlighting
vi.mock('../../../lib/date-utils.js', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/date-utils.js')>(
    '../../../lib/date-utils.js',
  )
  return {
    ...actual,
    isToday: (date: string) => date === '2026-04-01',
  }
})

const days = [
  '2026-03-30',
  '2026-03-31',
  '2026-04-01',
  '2026-04-02',
  '2026-04-03',
  '2026-04-04',
  '2026-04-05',
]

describe('WeekHeader', () => {
  it('renders the week header container', () => {
    render(<WeekHeader days={days} />)
    expect(screen.getByTestId('week-header')).toBeInTheDocument()
  })

  it('renders 7 day headers', () => {
    render(<WeekHeader days={days} />)
    for (const date of days) {
      expect(screen.getByTestId(`day-header-${date}`)).toBeInTheDocument()
    }
  })

  it('displays day name and number', () => {
    render(<WeekHeader days={days} />)
    expect(screen.getByText('MON')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('WED')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('highlights today column with accent color', () => {
    render(<WeekHeader days={days} />)
    // 2026-04-01 is mocked as today
    const todayHeader = screen.getByTestId('day-header-2026-04-01')
    const numberSpan = todayHeader.querySelectorAll('span')[1]
    expect(numberSpan?.className).toContain('bg-[var(--color-accent)]')
  })

  it('does not highlight non-today columns', () => {
    render(<WeekHeader days={days} />)
    const otherHeader = screen.getByTestId('day-header-2026-03-30')
    const numberSpan = otherHeader.querySelectorAll('span')[1]
    expect(numberSpan?.className).not.toContain('bg-[var(--color-accent)]')
  })

  it('renders all-day section', () => {
    render(<WeekHeader days={days} />)
    expect(screen.getByTestId('all-day-section')).toBeInTheDocument()
    expect(screen.getByText('all-day')).toBeInTheDocument()
  })
})
