import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { EventBlock } from './event-block.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

afterEach(() => cleanup())

const baseEvent: CalendarEvent = {
  id: 'evt-1',
  calendarId: 'cal-1',
  title: 'Team standup',
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
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
}

describe('EventBlock', () => {
  it('renders event title', () => {
    render(<EventBlock event={baseEvent} />)
    expect(screen.getByTestId('event-block-evt-1')).toHaveTextContent('Team standup')
  })

  it('renders time range', () => {
    render(<EventBlock event={baseEvent} />)
    const block = screen.getByTestId('event-block-evt-1')
    // Time display depends on local timezone, just check it contains AM/PM
    expect(block.textContent).toMatch(/AM|PM/)
  })

  it('uses accent color when event has no color', () => {
    render(<EventBlock event={baseEvent} />)
    const block = screen.getByTestId('event-block-evt-1')
    expect(block.style.backgroundColor).toBe('var(--color-accent)')
  })

  it('uses event color when set', () => {
    const colored = { ...baseEvent, color: '#ff0000' }
    render(<EventBlock event={colored} />)
    const block = screen.getByTestId('event-block-evt-1')
    expect(block.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  it('uses color prop override', () => {
    render(<EventBlock event={baseEvent} color="#00ff00" />)
    const block = screen.getByTestId('event-block-evt-1')
    expect(block.style.backgroundColor).toBe('rgb(0, 255, 0)')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<EventBlock event={baseEvent} onClick={onClick} />)
    fireEvent.click(screen.getByTestId('event-block-evt-1'))
    expect(onClick).toHaveBeenCalledWith(baseEvent)
  })

  it('is absolutely positioned', () => {
    render(<EventBlock event={baseEvent} />)
    const block = screen.getByTestId('event-block-evt-1')
    expect(block.className).toContain('absolute')
  })
})
