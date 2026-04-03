import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ScheduleView } from './schedule-view.js'

afterEach(() => cleanup())

vi.mock('../../../lib/date-utils.js', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/date-utils.js')>(
    '../../../lib/date-utils.js',
  )
  return {
    ...actual,
    getTodayDate: () => '2026-04-03',
    isToday: (date: string) => date === '2026-04-03',
  }
})

describe('ScheduleView', () => {
  it('renders the schedule view container', () => {
    render(<ScheduleView />)
    expect(screen.getByTestId('schedule-view')).toBeInTheDocument()
  })

  it('renders 14 day sections', () => {
    render(<ScheduleView />)
    const sections = screen.getAllByTestId(/^schedule-day-/)
    expect(sections).toHaveLength(14)
  })

  it('starts from today', () => {
    render(<ScheduleView />)
    expect(screen.getByTestId('schedule-day-2026-04-03')).toBeInTheDocument()
  })

  it('ends 13 days after today', () => {
    render(<ScheduleView />)
    expect(screen.getByTestId('schedule-day-2026-04-16')).toBeInTheDocument()
  })

  it('highlights today header with accent', () => {
    render(<ScheduleView />)
    const todayHeader = screen.getByTestId('schedule-header-2026-04-03')
    expect(todayHeader.className).toContain('bg-[var(--color-accent)]')
  })

  it('does not highlight other days with accent', () => {
    render(<ScheduleView />)
    const otherHeader = screen.getByTestId('schedule-header-2026-04-04')
    expect(otherHeader.className).not.toContain('bg-[var(--color-accent)]')
  })

  it('shows "No events" placeholder for each day', () => {
    render(<ScheduleView />)
    const placeholders = screen.getAllByText('No events')
    expect(placeholders).toHaveLength(14)
  })
})
