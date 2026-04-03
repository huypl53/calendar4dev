import { getMonthGridDates, isSameMonth, isToday } from '../../../lib/date-utils.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const MAX_VISIBLE_EVENTS = 3

interface MonthGridProps {
  date: string
  events?: CalendarEvent[]
  onDateClick?: (date: string) => void
  onEventClick?: (event: CalendarEvent) => void
}

export function MonthGrid({ date, events, onDateClick, onEventClick }: MonthGridProps) {
  const dates = getMonthGridDates(date)
  const eventsByDate = groupEventsByDate(events ?? [])

  return (
    <div data-testid="month-grid">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center font-sans text-[length:var(--font-size-tiny)] text-[var(--color-text-secondary)]"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 6-week grid */}
      <div className="grid grid-cols-7">
        {dates.map((cellDate) => {
          const dayNumber = Number(cellDate.split('-')[2])
          const inMonth = isSameMonth(cellDate, date)
          const today = isToday(cellDate)
          const dayEvents = eventsByDate[cellDate] ?? []

          return (
            <div
              key={cellDate}
              data-testid={`month-cell-${cellDate}`}
              className="cursor-pointer border-b border-r border-[var(--color-border)]"
              style={{ minHeight: 'var(--density-mini-cal-cell)' }}
              onClick={() => onDateClick?.(cellDate)}
            >
              <div className="flex justify-end p-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full font-sans text-[length:var(--font-size-small)] ${
                    today
                      ? 'bg-[var(--color-accent)] text-[var(--color-text-on-accent)]'
                      : inMonth
                        ? 'text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-tertiary)]'
                  }`}
                >
                  {dayNumber}
                </span>
              </div>
              {/* Event indicators */}
              <div className="space-y-[1px] px-1 pb-1">
                {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    data-testid={`month-event-${event.id}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(event)
                    }}
                    className="block w-full truncate rounded-sm px-1 text-left font-sans text-[length:var(--font-size-tiny)] leading-tight text-[var(--color-text-on-accent)]"
                    style={{ backgroundColor: event.color ?? 'var(--color-accent)' }}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > MAX_VISIBLE_EVENTS && (
                  <div className="px-1 font-sans text-[length:var(--font-size-tiny)] text-[var(--color-text-secondary)]">
                    +{dayEvents.length - MAX_VISIBLE_EVENTS} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const result: Record<string, CalendarEvent[]> = {}
  for (const event of events) {
    const date = event.startTime.slice(0, 10)
    if (!result[date]) result[date] = []
    result[date].push(event)
  }
  return result
}
