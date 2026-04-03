import { useState } from 'react'
import { getTodayDate, addDays, isToday } from '../../../lib/date-utils.js'
import { useEventsQuery } from '../../events/hooks/use-events-query.js'
import { EventFormDialog } from '../../events/components/event-form-dialog.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

export function ScheduleView() {
  const today = getTodayDate()
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i))

  const { data: events } = useEventsQuery({
    startDate: days[0],
    endDate: days[days.length - 1],
  })

  const eventsByDate = groupEventsByDate(events ?? [])

  const [editEvent, setEditEvent] = useState<CalendarEvent | undefined>()

  return (
    <div data-testid="schedule-view" className="flex h-full flex-col overflow-auto">
      {days.map((date) => {
        const [y, m, day] = date.split('-').map(Number) as [number, number, number]
        const dateObj = new Date(y, m - 1, day)
        const dayLabel = dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        const today_ = isToday(date)
        const dayEvents = eventsByDate[date] ?? []

        return (
          <div key={date} data-testid={`schedule-day-${date}`}>
            <div
              data-testid={`schedule-header-${date}`}
              className={`sticky top-0 border-b px-4 py-2 font-sans text-[length:var(--font-size-body)] font-[number:var(--font-weight-medium)] ${
                today_
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-text-on-accent)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]'
              }`}
            >
              {dayLabel}
            </div>
            {dayEvents.length === 0 ? (
              <div className="px-4 py-3 text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">
                No events
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    data-testid={`schedule-event-${event.id}`}
                    onClick={() => setEditEvent(event)}
                    className="flex w-full items-center gap-[var(--space-3)] px-4 py-2 text-left hover:bg-[var(--color-bg-tertiary)]"
                  >
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: event.color ?? 'var(--color-accent)' }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-sans text-[length:var(--font-size-body)] text-[var(--color-text-primary)]">
                        {event.title}
                      </div>
                      <div className="font-sans text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">
                        {formatTimeRange(event.startTime, event.endTime)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <EventFormDialog
        open={!!editEvent}
        onClose={() => setEditEvent(undefined)}
        event={editEvent}
      />
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

function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes()
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return m === 0 ? `${hour} ${period}` : `${hour}:${String(m).padStart(2, '0')} ${period}`
}
