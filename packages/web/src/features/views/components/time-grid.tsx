import { useRef, useEffect, useState } from 'react'
import { NowLine } from './now-line.js'
import { EventBlock } from '../../events/components/event-block.js'
import type { CalendarEvent } from '../../../lib/api-client.js'
import { getMinuteOfDay, computeNewStartMinute, setMinuteOfDay } from '../utils/drag-time.js'

interface DragRef {
  event: CalendarEvent
  colIdx: number
  originalStartMinutes: number
  durationMinutes: number
  mouseStartY: number
  active: boolean
  /** Updated on each mousemove; read in mouseup */
  currentNewStartMinutes: number
}

interface DragVisual {
  eventId: string
  colIdx: number
  topPercent: number
  heightPercent: number
}

interface TimeGridProps {
  dayCount: number
  todayIndex?: number
  /** YYYY-MM-DD strings for each column */
  days?: string[]
  /** Events to render on the grid */
  events?: CalendarEvent[]
  /** calendarId → color for event coloring */
  calendarColorMap?: Record<string, string>
  /** Called when a grid cell is clicked with the date and hour */
  onCellClick?: (date: string, hour: number) => void
  /** Called when an event block is clicked */
  onEventClick?: (event: CalendarEvent) => void
  /** Called when an event is dropped at a new time */
  onEventDrop?: (event: CalendarEvent, newStartTime: string, newEndTime: string) => void
}

export function TimeGrid({ dayCount, todayIndex, days, events, calendarColorMap, onCellClick, onEventClick, onEventDrop }: TimeGridProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const eventsByColumn = groupEventsByDay(events ?? [], days ?? [])

  const dragRef = useRef<DragRef | null>(null)
  // Keep stable refs to callbacks to avoid re-registering document listeners on every render
  const onEventDropRef = useRef(onEventDrop)
  const onEventClickRef = useRef(onEventClick)
  onEventDropRef.current = onEventDrop
  onEventClickRef.current = onEventClick

  const [dragVisual, setDragVisual] = useState<DragVisual | null>(null)

  useEffect(() => {
    function getGridHeight(): number {
      const rowHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--density-row-height'),
        10,
      ) || 48
      return 24 * rowHeight
    }

    function handleMouseMove(e: MouseEvent) {
      const drag = dragRef.current
      if (!drag) return
      const deltaY = e.clientY - drag.mouseStartY
      if (!drag.active && Math.abs(deltaY) < 5) return
      drag.active = true
      const newStart = computeNewStartMinute(
        drag.originalStartMinutes,
        drag.durationMinutes,
        deltaY,
        getGridHeight(),
      )
      drag.currentNewStartMinutes = newStart
      setDragVisual({
        eventId: drag.event.id,
        colIdx: drag.colIdx,
        topPercent: (newStart / 1440) * 100,
        heightPercent: (drag.durationMinutes / 1440) * 100,
      })
    }

    function handleMouseUp() {
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null
      setDragVisual(null)

      if (!drag.active) {
        // Below threshold — treat as click
        onEventClickRef.current?.(drag.event)
        return
      }

      const newStartMinutes = drag.currentNewStartMinutes
      const newEndMinutes = newStartMinutes + drag.durationMinutes
      const newStartTime = setMinuteOfDay(drag.event.startTime, newStartMinutes)
      const newEndTime = setMinuteOfDay(drag.event.startTime, newEndMinutes)
      onEventDropRef.current?.(drag.event, newStartTime, newEndTime)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  function handleEventMouseDown(e: React.MouseEvent, event: CalendarEvent, colIdx: number) {
    e.stopPropagation()
    const startMinutes = getMinuteOfDay(event.startTime)
    const rawEnd = getMinuteOfDay(event.endTime)
    const endMinutes = rawEnd <= startMinutes ? 1440 : rawEnd
    const durationMinutes = Math.max(endMinutes - startMinutes, 15)
    dragRef.current = {
      event,
      colIdx,
      originalStartMinutes: startMinutes,
      durationMinutes,
      mouseStartY: e.clientY,
      active: false,
      currentNewStartMinutes: startMinutes,
    }
  }

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
            onClick={() => {
              if (onCellClick && days?.[col]) {
                onCellClick(days[col]!, hour)
              }
            }}
          >
            {/* Hour line at top */}
            <div className="absolute inset-x-0 top-0 border-t border-[var(--color-border)]" />
            {/* Half-hour dashed line */}
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--color-border)] opacity-50" />
          </div>
        )),
      )}

      {/* Event overlays per column */}
      {days?.map((_, colIdx) => {
        const colEvents = eventsByColumn[colIdx] ?? []
        if (colEvents.length === 0) return null
        return (
          <div
            key={`events-col-${colIdx}`}
            className="pointer-events-none absolute inset-y-0"
            style={{
              left: `${(colIdx / dayCount) * 100}%`,
              width: `${(1 / dayCount) * 100}%`,
            }}
          >
            <div className="pointer-events-auto relative h-full">
              {colEvents.map((event) => (
                <EventBlock
                  key={`${event.id}-${colIdx}`}
                  event={event}
                  // Suppress click while dragging this event (handled in mouseup)
                  onClick={dragVisual?.eventId === event.id ? undefined : onEventClick}
                  onMouseDown={onEventDrop ? (e, ev) => handleEventMouseDown(e, ev, colIdx) : undefined}
                  color={calendarColorMap?.[event.calendarId]}
                  isDragging={dragVisual?.eventId === event.id}
                />
              ))}

              {/* Ghost element during drag */}
              {dragVisual?.colIdx === colIdx && (() => {
                const draggedEvent = colEvents.find(e => e.id === dragVisual.eventId)
                if (!draggedEvent) return null
                const bgColor = calendarColorMap?.[draggedEvent.calendarId] ?? draggedEvent.color ?? 'var(--color-accent)'
                return (
                  <div
                    data-testid="drag-ghost"
                    className="pointer-events-none absolute inset-x-0 mx-[1px] overflow-hidden rounded-sm opacity-80"
                    style={{
                      top: `${dragVisual.topPercent}%`,
                      height: `${dragVisual.heightPercent}%`,
                      backgroundColor: bgColor,
                      outline: '2px solid white',
                      zIndex: 10,
                    }}
                  />
                )
              })()}
            </div>
          </div>
        )
      })}

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

/** Group events by day column — multi-day events appear in every column they span */
function groupEventsByDay(events: CalendarEvent[], days: string[]): Record<number, CalendarEvent[]> {
  const result: Record<number, CalendarEvent[]> = {}
  for (const event of events) {
    const startDate = event.startTime.slice(0, 10)
    const endDate = event.endTime.slice(0, 10)
    for (let i = 0; i < days.length; i++) {
      const day = days[i]!
      if (day >= startDate && day <= endDate) {
        ;(result[i] ??= []).push(event)
      }
    }
  }
  return result
}
