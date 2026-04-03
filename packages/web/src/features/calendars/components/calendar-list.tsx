import { useState, useEffect } from 'react'
import { useCalendarsQuery, useBootstrapCalendar } from '../hooks/use-calendars-query.js'
import { useSharedCalendarsQuery } from '../hooks/use-shared-calendars-query.js'
import { ShareCalendarDialog } from './share-calendar-dialog.js'
import type { Calendar } from '../../../lib/api-client.js'

export function CalendarList() {
  const { data: calendars, isLoading } = useCalendarsQuery()
  const { data: sharedCalendars } = useSharedCalendarsQuery()
  const bootstrap = useBootstrapCalendar()

  const [shareTarget, setShareTarget] = useState<Calendar | null>(null)

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
    <>
      <div data-testid="calendar-list" className="space-y-[var(--space-1)]">
        {/* Owned calendars */}
        <div className="mb-[var(--space-1)] font-sans text-[length:var(--font-size-tiny)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)] uppercase">
          My Calendars
        </div>
        {calendars.map((cal) => (
          <div
            key={cal.id}
            data-testid={`calendar-item-${cal.id}`}
            className="group flex cursor-pointer items-center gap-[var(--space-2)] rounded px-[var(--space-1)] py-[var(--space-1)] hover:bg-[var(--color-bg-tertiary)]"
          >
            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-[var(--space-2)]">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
              <span
                className="h-3 w-3 shrink-0 rounded-full opacity-30 peer-checked:opacity-100"
                style={{ backgroundColor: cal.color }}
              />
              <span className="truncate font-sans text-[length:var(--font-size-small)] text-[var(--color-text-primary)]">
                {cal.name}
              </span>
            </label>
            <button
              type="button"
              data-testid={`share-calendar-${cal.id}`}
              onClick={() => setShareTarget(cal)}
              className="shrink-0 rounded p-[2px] text-[var(--color-text-tertiary)] opacity-0 hover:bg-[var(--color-bg-primary)] hover:text-[var(--color-text-primary)] group-hover:opacity-100"
              aria-label={`Share ${cal.name}`}
              title="Share"
            >
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.5 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm-7 3a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm7 5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/>
                <path d="M4.5 7.5l7-4M4.5 8.5l7 4"/>
              </svg>
            </button>
          </div>
        ))}

        {/* Shared calendars */}
        {sharedCalendars && sharedCalendars.length > 0 && (
          <>
            <div className="mb-[var(--space-1)] mt-[var(--space-3)] font-sans text-[length:var(--font-size-tiny)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)] uppercase">
              Shared with me
            </div>
            {sharedCalendars.map((cal) => (
              <label
                key={cal.id}
                data-testid={`shared-calendar-item-${cal.id}`}
                className="flex cursor-pointer items-center gap-[var(--space-2)] rounded px-[var(--space-1)] py-[var(--space-1)] hover:bg-[var(--color-bg-tertiary)]"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <span
                  className="h-3 w-3 shrink-0 rounded-full opacity-30 peer-checked:opacity-100"
                  style={{ backgroundColor: cal.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-sans text-[length:var(--font-size-small)] text-[var(--color-text-primary)]">
                    {cal.name}
                  </div>
                  <div className="truncate font-sans text-[length:var(--font-size-tiny)] text-[var(--color-text-tertiary)]">
                    {cal.ownerName ?? cal.ownerEmail}
                  </div>
                </div>
              </label>
            ))}
          </>
        )}
      </div>

      {shareTarget && (
        <ShareCalendarDialog
          open={!!shareTarget}
          onClose={() => setShareTarget(null)}
          calendarId={shareTarget.id}
          calendarName={shareTarget.name}
        />
      )}
    </>
  )
}
