import { getMonthGridDates, isSameMonth, isToday } from '../../../lib/date-utils.js'

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

interface MonthGridProps {
  date: string
}

export function MonthGrid({ date }: MonthGridProps) {
  const dates = getMonthGridDates(date)

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

          return (
            <div
              key={cellDate}
              data-testid={`month-cell-${cellDate}`}
              className="border-b border-r border-[var(--color-border)]"
              style={{ minHeight: 'var(--density-mini-cal-cell)' }}
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
