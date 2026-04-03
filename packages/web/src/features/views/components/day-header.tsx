import { formatDayHeader, isToday } from '../../../lib/date-utils.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

interface DayHeaderProps {
  date: string
  allDayEvents?: CalendarEvent[]
  calendarColorMap?: Record<string, string>
  onEventClick?: (event: CalendarEvent) => void
}

export function DayHeader({ date, allDayEvents, calendarColorMap, onEventClick }: DayHeaderProps) {
  const { dayName, dayNumber } = formatDayHeader(date)
  const today = isToday(date)
  const [year, month, day] = date.split('-').map(Number) as [number, number, number]
  const dateObj = new Date(year, month - 1, day)
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' })

  // Filter to events that touch this specific date
  const dayEvents = (allDayEvents ?? []).filter((e) => {
    const start = e.startTime.slice(0, 10)
    const end = e.endTime.slice(0, 10)
    return date >= start && date <= end
  })

  return (
    <div data-testid="day-header">
      {/* Day column header */}
      <div
        className="flex items-center justify-center gap-3 border-b border-[var(--color-border)] py-2"
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
        <span className="font-sans text-[length:var(--font-size-body)] text-[var(--color-text-secondary)]">
          {monthName}
        </span>
      </div>

      {/* All-day section */}
      <div
        data-testid="all-day-section"
        className="grid border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'var(--density-gutter-width) 1fr', minHeight: '28px' }}
      >
        <div className="flex items-start pt-1 justify-end pr-2 font-mono text-[length:var(--font-size-tiny)] text-[var(--color-text-tertiary)]">
          all-day
        </div>
        <div className="border-r border-[var(--color-border)] py-[2px] px-[1px] flex flex-col gap-[1px]">
          {dayEvents.map((event) => {
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
      </div>
    </div>
  )
}
