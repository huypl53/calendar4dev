import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ScheduleView } from './schedule-view.js'

vi.mock('../../../lib/api-client.js', () => ({
  eventsApi: { list: vi.fn().mockResolvedValue([]) },
  calendarsApi: { list: vi.fn().mockResolvedValue([]) },
}))

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

function renderSchedule() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(ScheduleView)),
  )
}

describe('ScheduleView', () => {
  it('renders the schedule view container', () => {
    renderSchedule()
    expect(screen.getByTestId('schedule-view')).toBeInTheDocument()
  })

  it('renders 14 day sections', async () => {
    renderSchedule()
    const sections = await screen.findAllByTestId(/^schedule-day-/)
    expect(sections).toHaveLength(14)
  })

  it('starts from today', async () => {
    renderSchedule()
    expect(await screen.findByTestId('schedule-day-2026-04-03')).toBeInTheDocument()
  })

  it('ends 13 days after today', async () => {
    renderSchedule()
    expect(await screen.findByTestId('schedule-day-2026-04-16')).toBeInTheDocument()
  })

  it('highlights today header with accent', async () => {
    renderSchedule()
    const todayHeader = await screen.findByTestId('schedule-header-2026-04-03')
    expect(todayHeader.className).toContain('bg-[var(--color-accent)]')
  })

  it('does not highlight other days with accent', async () => {
    renderSchedule()
    const otherHeader = await screen.findByTestId('schedule-header-2026-04-04')
    expect(otherHeader.className).not.toContain('bg-[var(--color-accent)]')
  })

  it('shows "No events" placeholder for each day', async () => {
    renderSchedule()
    // Wait for loading to finish
    await screen.findByTestId('schedule-day-2026-04-03')
    const placeholders = screen.getAllByText('No events')
    expect(placeholders).toHaveLength(14)
  })
})
