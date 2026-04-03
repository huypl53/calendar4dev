import { formatDayHeader, isToday } from '../../../lib/date-utils.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

interface WeekHeaderProps {
  days: string[]
  /** All-day events to display in the all-day row */
  allDayEvents?: CalendarEvent[]
  /** calendarId → color for event coloring */
  calendarColorMap?: Record<string, string>
  /** Called when an all-day event is clicked */
  onEventClick?: (event: CalendarEvent) => void
}

export function WeekHeader({ days, allDayEvents, calendarColorMap, onEventClick }: WeekHeaderProps) {
  // Group all-day events by the day columns they fall in.
  // RFC 5545 all-day DTEND is exclusive, so compare with '<' not '<='.
  // Use UTC date extraction (.toISOString().slice(0,10)) to avoid local-timezone off-by-one.
  const MAX_ALLDAY_PER_COL = 5
  const eventsByCol: Record<number, CalendarEvent[]> = {}
  for (const event of allDayEvents ?? []) {
    const startDate = new Date(event.startTime).toISOString().slice(0, 10)
    const endDate = new Date(event.endTime).toISOString().slice(0, 10)
    for (let i = 0; i < days.length; i++) {
      const day = days[i]!
      if (day >= startDate && day < endDate) {
        const col = (eventsByCol[i] ??= [])
        if (col.length < MAX_ALLDAY_PER_COL) col.push(event)
      }
    }
  }

  return (
    <div data-testid="week-header">
      {/* Day column headers */}
      <div
        className="grid border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'var(--density-gutter-width) repeat(7, 1fr)' }}
      >
        {/* Gutter spacer */}
        <div />
        {days.map((date) => {
          const { dayName, dayNumber } = formatDayHeader(date)
          const today = isToday(date)
          return (
            <div
              key={date}
              data-testid={`day-header-${date}`}
              className="flex flex-col items-center py-1 border-r border-[var(--color-border)]"
            >
              <span className="font-sans text-[length:var(--font-size-tiny)] text-[var(--color-text-secondary)]">
                {dayName}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full font-sans text-[length:var(--font-size-heading)] font-[number:var(--font-weight-medium)] ${
                  today
                    ? 'bg-[var(--color-accent)] text-[var(--color-text-on-accent)]'
                    : 'text-[var(--color-text-primary)]'
                }`}
              >
                {dayNumber}
              </span>
            </div>
          )
        })}
      </div>

      {/* All-day section */}
      <div
        data-testid="all-day-section"
        className="grid border-b border-[var(--color-border)]"
        style={{
          gridTemplateColumns: 'var(--density-gutter-width) repeat(7, 1fr)',
          minHeight: '28px',
        }}
      >
        <div className="flex items-start pt-1 justify-end pr-2 font-mono text-[length:var(--font-size-tiny)] text-[var(--color-text-tertiary)]">
          all-day
        </div>
        {days.map((_, colIdx) => {
          const colEvents = eventsByCol[colIdx] ?? []
          return (
            <div key={colIdx} className="border-r border-[var(--color-border)] py-[2px] px-[1px] flex flex-col gap-[1px]">
              {colEvents.map((event) => {
                const color = calendarColorMap?.[event.calendarId] ?? event.color ?? 'var(--color-accent)'
                return (
                  <button
                    key={event.id}
                    type="button"
                    data-testid={`allday-event-${event.id}`}
                    onClick={() => onEventClick?.(event)}
                    className="w-full truncate rounded-sm px-1 text-left font-sans text-[length:var(--font-size-tiny)] leading-tight text-[var(--color-text-on-accent)] hover:opacity-90"
                    style={{ backgroundColor: color }}
                    title={event.title}
                  >
                    {event.title}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
