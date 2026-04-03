import { NowLine } from './now-line.js'

interface TimeGridProps {
  dayCount: number
  todayIndex?: number
}

export function TimeGrid({ dayCount, todayIndex }: TimeGridProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div
      data-testid="time-grid"
      className="relative grid"
      style={{ gridTemplateColumns: `repeat(${dayCount}, 1fr)` }}
    >
      {hours.map((hour) =>
        Array.from({ length: dayCount }, (_, col) => (
          <div
            key={`${hour}-${col}`}
            data-testid={`grid-cell-${hour}-${col}`}
            className="relative border-r border-[var(--color-border)]"
            style={{ height: 'var(--density-row-height)' }}
          >
            {/* Hour line at top */}
            <div className="absolute inset-x-0 top-0 border-t border-[var(--color-border)]" />
            {/* Half-hour dashed line */}
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--color-border)] opacity-50" />
          </div>
        )),
      )}

      {/* Now line overlay on today's column */}
      {todayIndex != null && todayIndex >= 0 && todayIndex < dayCount && (
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{
            left: `${(todayIndex / dayCount) * 100}%`,
            width: `${(1 / dayCount) * 100}%`,
          }}
        >
          <NowLine />
        </div>
      )}
    </div>
  )
}
