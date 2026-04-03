import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { TimeGrid } from './time-grid.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

afterEach(() => cleanup())

describe('TimeGrid', () => {
  it('renders the time grid container', () => {
    render(<TimeGrid dayCount={7} />)
    expect(screen.getByTestId('time-grid')).toBeInTheDocument()
  })

  it('renders 24 rows × dayCount columns of grid cells', () => {
    render(<TimeGrid dayCount={7} />)
    // 24 hours × 7 columns = 168 cells
    for (let h = 0; h < 24; h++) {
      for (let c = 0; c < 7; c++) {
        expect(screen.getByTestId(`grid-cell-${h}-${c}`)).toBeInTheDocument()
      }
    }
  })

  it('uses density-row-height token for cell height', () => {
    render(<TimeGrid dayCount={7} />)
    const cell = screen.getByTestId('grid-cell-0-0')
    expect(cell.style.height).toBe('var(--density-row-height)')
  })

  it('sets correct grid columns for given dayCount', () => {
    render(<TimeGrid dayCount={5} />)
    const grid = screen.getByTestId('time-grid')
    expect(grid.style.gridTemplateColumns).toBe('repeat(5, 1fr)')
  })

  it('renders 24×5=120 cells when dayCount=5', () => {
    render(<TimeGrid dayCount={5} />)
    for (let h = 0; h < 24; h++) {
      for (let c = 0; c < 5; c++) {
        expect(screen.getByTestId(`grid-cell-${h}-${c}`)).toBeInTheDocument()
      }
    }
  })
})

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt-1',
    calendarId: 'cal-1',
    title: 'Test Event',
    description: null,
    startTime: new Date(2026, 3, 3, 10, 0, 0).toISOString(),
    endTime: new Date(2026, 3, 3, 11, 0, 0).toISOString(),
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
    ...overrides,
  }
}

describe('TimeGrid drag and drop', () => {
  it('calls onEventClick when mousedown+mouseup without movement', () => {
    const onEventClick = vi.fn()
    const onEventDrop = vi.fn()
    const event = makeEvent()
    render(
      <TimeGrid
        dayCount={1}
        days={['2026-04-03']}
        events={[event]}
        onEventClick={onEventClick}
        onEventDrop={onEventDrop}
      />,
    )
    const block = screen.getByTestId('event-block-evt-1')
    fireEvent.mouseDown(block, { clientY: 100 })
    fireEvent.mouseUp(document, { clientY: 100 })
    expect(onEventClick).toHaveBeenCalledWith(event)
    expect(onEventDrop).not.toHaveBeenCalled()
  })

  it('calls onEventDrop with new times when dragged > 5px', () => {
    const onEventDrop = vi.fn()
    const event = makeEvent()
    render(
      <TimeGrid
        dayCount={1}
        days={['2026-04-03']}
        events={[event]}
        onEventDrop={onEventDrop}
      />,
    )
    const block = screen.getByTestId('event-block-evt-1')
    fireEvent.mouseDown(block, { clientY: 100 })
    fireEvent.mouseMove(document, { clientY: 110 }) // 10px movement
    fireEvent.mouseUp(document, { clientY: 110 })
    expect(onEventDrop).toHaveBeenCalledOnce()
    const [droppedEvent, newStart, newEnd] = onEventDrop.mock.calls[0]!
    expect(droppedEvent.id).toBe('evt-1')
    expect(typeof newStart).toBe('string')
    expect(typeof newEnd).toBe('string')
    expect(new Date(newEnd).getTime() - new Date(newStart).getTime()).toBe(60 * 60 * 1000) // duration preserved
  })

  it('shows ghost element during drag', () => {
    const event = makeEvent()
    render(
      <TimeGrid
        dayCount={1}
        days={['2026-04-03']}
        events={[event]}
        onEventDrop={vi.fn()}
      />,
    )
    const block = screen.getByTestId('event-block-evt-1')
    fireEvent.mouseDown(block, { clientY: 100 })
    fireEvent.mouseMove(document, { clientY: 110 })
    expect(screen.getByTestId('drag-ghost')).toBeInTheDocument()
    fireEvent.mouseUp(document, { clientY: 110 })
    expect(screen.queryByTestId('drag-ghost')).not.toBeInTheDocument()
  })

  it('does not call onEventDrop when onEventDrop prop not provided', () => {
    const onEventClick = vi.fn()
    const event = makeEvent()
    render(
      <TimeGrid
        dayCount={1}
        days={['2026-04-03']}
        events={[event]}
        onEventClick={onEventClick}
      />,
    )
    // Without onEventDrop, clicking should still work
    const block = screen.getByTestId('event-block-evt-1')
    fireEvent.click(block)
    expect(onEventClick).toHaveBeenCalledWith(event)
  })
})
