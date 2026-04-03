import { formatDayHeader, isToday } from '../../../lib/date-utils.js'

interface WeekHeaderProps {
  days: string[]
}

export function WeekHeader({ days }: WeekHeaderProps) {
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
                    ? 'bg-[var(--color-accent)] text-white'
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
        className="grid min-h-[28px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'var(--density-gutter-width) repeat(7, 1fr)' }}
      >
        <div className="flex items-center justify-end pr-2 font-mono text-[length:var(--font-size-tiny)] text-[var(--color-text-tertiary)]">
          all-day
        </div>
        {days.map((date) => (
          <div key={date} className="border-r border-[var(--color-border)]" />
        ))}
      </div>
    </div>
  )
}
