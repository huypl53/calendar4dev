import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EventFormDialog } from './event-form-dialog.js'

vi.mock('../../../lib/api-client.js', () => ({
  eventsApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 'new-1', title: 'Test' }),
    update: vi.fn().mockResolvedValue({ id: 'evt-1', title: 'Updated' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  calendarsApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'cal-1', name: 'Personal', color: '#2f81f7' },
    ]),
  },
}))

// jsdom doesn't implement HTMLDialogElement methods
HTMLDialogElement.prototype.showModal = vi.fn()
HTMLDialogElement.prototype.close = vi.fn()

afterEach(() => cleanup())

function renderDialog(props: Partial<React.ComponentProps<typeof EventFormDialog>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    ...props,
  }
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(EventFormDialog, defaultProps)),
  )
}

describe('EventFormDialog', () => {
  it('renders create form when no event prop', () => {
    renderDialog()
    expect(screen.getByTestId('event-form')).toBeInTheDocument()
    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('Create')
  })

  it('renders edit form when event prop provided', () => {
    renderDialog({
      event: {
        id: 'evt-1',
        calendarId: 'cal-1',
        title: 'Existing event',
        description: 'desc',
        startTime: '2026-04-03T09:00:00.000Z',
        endTime: '2026-04-03T10:00:00.000Z',
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
    })
    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('Save')
    expect(screen.getByTestId('event-delete-button')).toBeInTheDocument()
  })

  it('pre-populates title in edit mode', () => {
    renderDialog({
      event: {
        id: 'evt-1',
        calendarId: 'cal-1',
        title: 'Existing event',
        description: null,
        startTime: '2026-04-03T09:00:00.000Z',
        endTime: '2026-04-03T10:00:00.000Z',
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
    })
    expect(screen.getByTestId('event-title-input')).toHaveValue('Existing event')
  })

  it('sets default start/end times from props', () => {
    renderDialog({
      defaultStart: '2026-04-03T14:00',
      defaultEnd: '2026-04-03T15:00',
    })
    expect(screen.getByTestId('event-start-input')).toHaveValue('2026-04-03T14:00')
    expect(screen.getByTestId('event-end-input')).toHaveValue('2026-04-03T15:00')
  })

  it('has required title field', () => {
    renderDialog()
    const input = screen.getByTestId('event-title-input')
    expect(input).toHaveAttribute('required')
  })

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn()
    renderDialog({ onClose })
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not render when closed', () => {
    renderDialog({ open: false })
    // Dialog exists in DOM but is not shown (native dialog behavior)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('renders read-only view when isReadOnly=true with event', () => {
    renderDialog({
      isReadOnly: true,
      event: {
        id: 'evt-ro',
        calendarId: 'cal-1',
        title: 'Read Only Event',
        description: 'Some desc',
        startTime: '2026-04-03T09:00:00.000Z',
        endTime: '2026-04-03T10:00:00.000Z',
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
    })
    expect(screen.getByTestId('event-readonly')).toBeInTheDocument()
    expect(screen.queryByTestId('event-form')).not.toBeInTheDocument()
    expect(screen.getByText('Read Only Event')).toBeInTheDocument()
    expect(screen.getByText('Some desc')).toBeInTheDocument()
  })

  it('does not render read-only view when isReadOnly=true but no event', () => {
    renderDialog({ isReadOnly: true })
    expect(screen.queryByTestId('event-readonly')).not.toBeInTheDocument()
    expect(screen.getByTestId('event-form')).toBeInTheDocument()
  })

  it('renders color picker with none swatch and color swatches', () => {
    renderDialog()
    expect(screen.getByTestId('event-color-picker')).toBeInTheDocument()
    expect(screen.getByTestId('event-color-none')).toBeInTheDocument()
    // At least one color swatch present
    expect(screen.getByTestId('event-color-swatch-#dc2626')).toBeInTheDocument()
  })

  it('selects a color when swatch is clicked', () => {
    renderDialog()
    const swatch = screen.getByTestId('event-color-swatch-#dc2626')
    fireEvent.click(swatch)
    // After click, the swatch should have the accent border class (selected state)
    expect(swatch.className).toContain('border-[var(--color-accent)]')
  })

  it('clears color selection when none swatch is clicked', () => {
    renderDialog()
    // Select a color first
    fireEvent.click(screen.getByTestId('event-color-swatch-#dc2626'))
    // Then clear it
    fireEvent.click(screen.getByTestId('event-color-none'))
    const noneSwatch = screen.getByTestId('event-color-none')
    expect(noneSwatch.className).toContain('border-[var(--color-accent)]')
  })

  it('pre-populates color in edit mode', () => {
    renderDialog({
      event: {
        id: 'evt-1',
        calendarId: 'cal-1',
        title: 'Colored event',
        description: null,
        startTime: '2026-04-03T09:00:00.000Z',
        endTime: '2026-04-03T10:00:00.000Z',
        allDay: false,
        location: null,
        color: '#dc2626',
        status: 'confirmed',
        visibility: 'default',
        eventType: 'default',
        recurrenceRule: null,
        reminderMinutes: null,
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      },
    })
    const swatch = screen.getByTestId('event-color-swatch-#dc2626')
    expect(swatch.className).toContain('border-[var(--color-accent)]')
  })

  it('renders all-day checkbox unchecked by default', () => {
    renderDialog()
    const checkbox = screen.getByTestId('event-allday-checkbox') as HTMLInputElement
    expect(checkbox).toBeInTheDocument()
    expect(checkbox.checked).toBe(false)
  })

  it('hides time pickers when all-day is checked', () => {
    renderDialog()
    const checkbox = screen.getByTestId('event-allday-checkbox')
    expect(screen.getByTestId('event-start-input')).toBeInTheDocument()
    fireEvent.click(checkbox)
    expect(screen.queryByTestId('event-start-input')).not.toBeInTheDocument()
    expect(screen.queryByTestId('event-end-input')).not.toBeInTheDocument()
  })

  it('pre-populates allDay in edit mode', () => {
    renderDialog({
      event: {
        id: 'evt-1',
        calendarId: 'cal-1',
        title: 'All day event',
        description: null,
        startTime: '2026-04-03T00:00:00.000Z',
        endTime: '2026-04-04T00:00:00.000Z',
        allDay: true,
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
    })
    const checkbox = screen.getByTestId('event-allday-checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
    expect(screen.queryByTestId('event-start-input')).not.toBeInTheDocument()
  })
})
