import type { CalendarEvent } from '../../../lib/api-client.js'

export interface EventBlockProps {
  event: CalendarEvent
  onClick?: (event: CalendarEvent) => void
  /** Color override (falls back to event.color or default accent) */
  color?: string
}

/**
 * Renders an event block absolutely positioned within a time-grid day column.
 * The parent must be `position: relative` with height = 24 * rowHeight.
 */
export function EventBlock({ event, onClick, color }: EventBlockProps) {
  const startMinutes = getMinuteOfDay(event.startTime)
  const rawEndMinutes = getMinuteOfDay(event.endTime)
  // Clamp to end of day for events crossing midnight
  const endMinutes = rawEndMinutes <= startMinutes ? 1440 : rawEndMinutes
  const durationMinutes = Math.max(endMinutes - startMinutes, 15) // min 15min height

  const topPercent = (startMinutes / 1440) * 100
  const heightPercent = (durationMinutes / 1440) * 100

  const bgColor = color ?? event.color ?? 'var(--color-accent)'
  const startLabel = formatTime(event.startTime)
  const endLabel = formatTime(event.endTime)

  return (
    <button
      type="button"
      data-testid={`event-block-${event.id}`}
      onClick={() => onClick?.(event)}
      className="absolute inset-x-0 mx-[1px] cursor-pointer overflow-hidden rounded-sm px-[var(--density-event-padding)] text-left transition-opacity hover:opacity-90"
      style={{
        top: `${topPercent}%`,
        height: `${heightPercent}%`,
        backgroundColor: bgColor,
        color: 'var(--color-text-on-accent)',
        zIndex: 1,
      }}
    >
      <div className="truncate font-sans text-[length:var(--font-size-tiny)] font-[number:var(--font-weight-medium)] leading-tight">
        {event.recurrenceRule && <span title="Recurring">↻ </span>}
        {event.title}
      </div>
      <div className="truncate font-sans text-[length:var(--font-size-tiny)] leading-tight opacity-80">
        {startLabel} – {endLabel}
      </div>
    </button>
  )
}

function getMinuteOfDay(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes()
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return m === 0 ? `${hour} ${period}` : `${hour}:${String(m).padStart(2, '0')} ${period}`
}
