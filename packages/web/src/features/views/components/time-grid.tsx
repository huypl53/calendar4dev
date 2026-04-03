interface TimeGridProps {
  dayCount: number
}

export function TimeGrid({ dayCount }: TimeGridProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div
      data-testid="time-grid"
      className="grid"
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
    </div>
  )
}
