import { useState, useEffect, useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { isToday } from '../../../lib/date-utils.js'
import { useEventsQuery } from '../../events/hooks/use-events-query.js'
import { useCalendarsQuery } from '../../calendars/hooks/use-calendars-query.js'
import { EventFormDialog } from '../../events/components/event-form-dialog.js'
import { DayHeader } from './day-header.js'
import { TimeGutter } from './time-gutter.js'
import { TimeGrid } from './time-grid.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

export function DayView() {
  const { date } = useParams({ strict: false }) as { date: string }
  const showNowLine = isToday(date)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: events, isLoading } = useEventsQuery({
    startDate: date,
    endDate: date,
  })
  const { data: calendars } = useCalendarsQuery()

  const calendarColorMap: Record<string, string> = {}
  for (const cal of calendars ?? []) {
    calendarColorMap[cal.id] = cal.color
  }

  const [createDialog, setCreateDialog] = useState<{ open: boolean; start: string; end: string }>({
    open: false,
    start: '',
    end: '',
  })
  const [editEvent, setEditEvent] = useState<CalendarEvent | undefined>()

  useEffect(() => {
    if (scrollRef.current) {
      const rowHeight =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--density-row-height',
          ),
          10,
        ) || 48
      scrollRef.current.scrollTop = 8 * rowHeight
    }
  }, [date])

  function handleCellClick(cellDate: string, hour: number) {
    const start = `${cellDate}T${String(hour).padStart(2, '0')}:00`
    const end = hour < 23
      ? `${cellDate}T${String(hour + 1).padStart(2, '0')}:00`
      : `${cellDate}T23:59`
    setCreateDialog({ open: true, start, end })
  }

  function handleEventClick(event: CalendarEvent) {
    setEditEvent(event)
  }

  return (
    <div data-testid="day-view" className="flex h-full flex-col">
      <DayHeader date={date} />
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        data-testid="day-scroll-container"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">Loading…</span>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'var(--density-gutter-width) 1fr' }}>
            <TimeGutter />
            <TimeGrid
              dayCount={1}
              todayIndex={showNowLine ? 0 : undefined}
              days={[date]}
              events={events}
              calendarColorMap={calendarColorMap}
              onCellClick={handleCellClick}
              onEventClick={handleEventClick}
            />
          </div>
        )}
      </div>

      <EventFormDialog
        open={createDialog.open}
        onClose={() => setCreateDialog({ open: false, start: '', end: '' })}
        defaultStart={createDialog.start}
        defaultEnd={createDialog.end}
      />

      <EventFormDialog
        open={!!editEvent}
        onClose={() => setEditEvent(undefined)}
        event={editEvent}
      />
    </div>
  )
}
