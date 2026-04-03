import { useEffect } from 'react'
import { useCalendarsQuery, useBootstrapCalendar } from '../hooks/use-calendars-query.js'

export function CalendarList() {
  const { data: calendars, isLoading } = useCalendarsQuery()
  const bootstrap = useBootstrapCalendar()

  // Auto-bootstrap default calendar on first load
  useEffect(() => {
    if (!isLoading && calendars && calendars.length === 0 && !bootstrap.isPending) {
      bootstrap.mutate()
    }
  }, [isLoading, calendars, bootstrap])

  if (isLoading) {
    return (
      <div className="text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">
        Loading...
      </div>
    )
  }

  if (!calendars || calendars.length === 0) {
    return (
      <div className="text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">
        No calendars
      </div>
    )
  }

  return (
    <div data-testid="calendar-list" className="space-y-[var(--space-1)]">
      <div className="mb-[var(--space-1)] font-sans text-[length:var(--font-size-tiny)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)] uppercase">
        Calendars
      </div>
      {calendars.map((cal) => (
        <label
          key={cal.id}
          data-testid={`calendar-item-${cal.id}`}
          className="flex cursor-pointer items-center gap-[var(--space-2)] rounded px-[var(--space-1)] py-[var(--space-1)] hover:bg-[var(--color-bg-tertiary)]"
        >
          <input
            type="checkbox"
            defaultChecked
            className="sr-only peer"
          />
          <span
            className="h-3 w-3 shrink-0 rounded-full peer-checked:opacity-100 opacity-30"
            style={{ backgroundColor: cal.color }}
          />
          <span className="truncate font-sans text-[length:var(--font-size-small)] text-[var(--color-text-primary)]">
            {cal.name}
          </span>
        </label>
      ))}
    </div>
  )
}
