import { formatDayHeader, isToday } from '../../../lib/date-utils.js'

interface DayHeaderProps {
  date: string
}

export function DayHeader({ date }: DayHeaderProps) {
  const { dayName, dayNumber } = formatDayHeader(date)
  const today = isToday(date)
  const d = new Date(
    ...date.split('-').map(Number) as [number, number, number],
  )
  // Adjust: Date constructor takes 0-indexed month
  const dateObj = new Date(d.getFullYear(), d.getMonth() - 1, d.getDate())
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' })

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
              ? 'bg-[var(--color-accent)] text-white'
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
        className="grid min-h-[28px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'var(--density-gutter-width) 1fr' }}
      >
        <div className="flex items-center justify-end pr-2 font-mono text-[length:var(--font-size-tiny)] text-[var(--color-text-tertiary)]">
          all-day
        </div>
        <div className="border-r border-[var(--color-border)]" />
      </div>
    </div>
  )
}
