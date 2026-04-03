import { formatHour } from '../../../lib/date-utils.js'

export function TimeGutter() {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div data-testid="time-gutter" className="relative">
      {hours.map((hour) => (
        <div
          key={hour}
          data-testid={`gutter-hour-${hour}`}
          className="flex items-start justify-end pr-2 font-mono text-[length:var(--font-size-tiny)] text-[var(--color-text-tertiary)]"
          style={{ height: 'var(--density-row-height)' }}
        >
          {hour > 0 && (
            <span className="-mt-2">{formatHour(hour)}</span>
          )}
        </div>
      ))}
    </div>
  )
}
