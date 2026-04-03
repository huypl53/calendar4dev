import { getTodayDate, addDays, isToday } from '../../../lib/date-utils.js'

export function ScheduleView() {
  const today = getTodayDate()
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i))

  return (
    <div data-testid="schedule-view" className="flex h-full flex-col overflow-auto">
      {days.map((date) => {
        const d = new Date(
          ...date.split('-').map(Number) as [number, number, number],
        )
        const dateObj = new Date(d.getFullYear(), d.getMonth() - 1, d.getDate())
        const dayLabel = dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        const today_ = isToday(date)

        return (
          <div key={date} data-testid={`schedule-day-${date}`}>
            <div
              data-testid={`schedule-header-${date}`}
              className={`sticky top-0 border-b px-4 py-2 font-sans text-[length:var(--font-size-body)] font-[number:var(--font-weight-medium)] ${
                today_
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]'
              }`}
            >
              {dayLabel}
            </div>
            <div className="px-4 py-3 text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">
              No events
            </div>
          </div>
        )
      })}
    </div>
  )
}
