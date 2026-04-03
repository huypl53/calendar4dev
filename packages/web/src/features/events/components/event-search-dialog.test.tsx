import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EventSearchDialog } from './event-search-dialog.js'

vi.mock('../../../lib/api-client.js', () => ({
  eventsApi: {
    list: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue([]),
  },
  calendarsApi: {
    list: vi.fn().mockResolvedValue([{ id: 'cal-1', name: 'Personal', color: '#2f81f7' }]),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

afterEach(() => cleanup())

function renderDialog(props: { open?: boolean; onClose?: () => void } = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(QueryClientProvider, { client: qc },
      createElement(EventSearchDialog, {
        open: props.open ?? true,
        onClose: props.onClose ?? vi.fn(),
      })),
  )
}

describe('EventSearchDialog', () => {
  it('renders when open', () => {
    renderDialog()
    expect(screen.getByTestId('event-search-dialog')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderDialog({ open: false })
    expect(screen.queryByTestId('event-search-dialog')).not.toBeInTheDocument()
  })

  it('shows placeholder hint when query is too short', () => {
    renderDialog()
    expect(screen.getByText(/Type at least 2 characters/)).toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    renderDialog({ onClose })
    fireEvent.click(screen.getByTestId('search-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn()
    renderDialog({ onClose })
    fireEvent.keyDown(screen.getByTestId('event-search-dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('shows no-results message when API returns empty for valid query', async () => {
    const { eventsApi } = await import('../../../lib/api-client.js')
    vi.mocked(eventsApi.search).mockResolvedValue([])

    renderDialog()
    fireEvent.change(screen.getByTestId('event-search-input'), { target: { value: 'xyz' } })

    await waitFor(() => {
      expect(screen.getByText(/No events found/)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('shows search results when API returns data', async () => {
    const { eventsApi } = await import('../../../lib/api-client.js')
    vi.mocked(eventsApi.search).mockResolvedValue([
      {
        id: 'evt-1',
        calendarId: 'cal-1',
        title: 'Team standup',
        description: null,
        startTime: '2026-04-03T09:00:00.000Z',
        endTime: '2026-04-03T09:30:00.000Z',
        allDay: false,
        location: null,
        color: null,
        status: 'confirmed',
        visibility: 'default',
        eventType: 'default',
        recurrenceRule: null,
        reminderMinutes: null,
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      },
    ])

    renderDialog()
    fireEvent.change(screen.getByTestId('event-search-input'), { target: { value: 'standup' } })

    await waitFor(() => {
      expect(screen.getByTestId('search-result-evt-1')).toBeInTheDocument()
      expect(screen.getByText('Team standup')).toBeInTheDocument()
    }, { timeout: 1000 })
  })
})
