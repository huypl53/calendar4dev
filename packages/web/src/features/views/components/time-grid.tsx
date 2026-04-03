import { NowLine } from './now-line.js'
import { EventBlock } from '../../events/components/event-block.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

interface TimeGridProps {
  dayCount: number
  todayIndex?: number
  /** YYYY-MM-DD strings for each column */
  days?: string[]
  /** Events to render on the grid */
  events?: CalendarEvent[]
  /** Called when a grid cell is clicked with the date and hour */
  onCellClick?: (date: string, hour: number) => void
  /** Called when an event block is clicked */
  onEventClick?: (event: CalendarEvent) => void
}

export function TimeGrid({ dayCount, todayIndex, days, events, onCellClick, onEventClick }: TimeGridProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Group events by day column index
  const eventsByColumn = groupEventsByDay(events ?? [], days ?? [])

  return (
    <div
      data-testid="time-grid"
      className="relative grid"
      style={{ gridTemplateColumns: `repeat(${dayCount}, 1fr)` }}
    >
      {hours.map((hour) =>
        Array.from({ length: dayCount }, (_, col) => (
          <div
            key={`${hour}-${col}`}
            data-testid={`grid-cell-${hour}-${col}`}
            className="relative border-r border-[var(--color-border)]"
            style={{ height: 'var(--density-row-height)' }}
            onClick={() => {
              if (onCellClick && days?.[col]) {
                onCellClick(days[col], hour)
              }
            }}
          >
            {/* Hour line at top */}
            <div className="absolute inset-x-0 top-0 border-t border-[var(--color-border)]" />
            {/* Half-hour dashed line */}
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--color-border)] opacity-50" />
          </div>
        )),
      )}

      {/* Event overlays per column */}
      {days?.map((_, colIdx) => {
        const colEvents = eventsByColumn[colIdx] ?? []
        if (colEvents.length === 0) return null
        return (
          <div
            key={`events-col-${colIdx}`}
            className="pointer-events-none absolute inset-y-0"
            style={{
              left: `${(colIdx / dayCount) * 100}%`,
              width: `${(1 / dayCount) * 100}%`,
            }}
          >
            <div className="pointer-events-auto relative h-full">
              {colEvents.map((event) => (
                <EventBlock key={event.id} event={event} onClick={onEventClick} />
              ))}
            </div>
          </div>
        )
      })}

      {/* Now line overlay on today's column */}
      {todayIndex != null && todayIndex >= 0 && todayIndex < dayCount && (
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{
            left: `${(todayIndex / dayCount) * 100}%`,
            width: `${(1 / dayCount) * 100}%`,
          }}
        >
          <NowLine />
        </div>
      )}
    </div>
  )
}

/** Group events by which day column they belong to, based on their startTime date */
function groupEventsByDay(events: CalendarEvent[], days: string[]): Record<number, CalendarEvent[]> {
  const result: Record<number, CalendarEvent[]> = {}
  for (const event of events) {
    const eventDate = event.startTime.slice(0, 10) // YYYY-MM-DD from ISO
    const colIdx = days.indexOf(eventDate)
    if (colIdx >= 0) {
      if (!result[colIdx]) result[colIdx] = []
      result[colIdx].push(event)
    }
  }
  return result
}
