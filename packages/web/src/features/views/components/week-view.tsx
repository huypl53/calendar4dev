import { useState, useEffect, useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { getWeekDays, getTodayDate } from '../../../lib/date-utils.js'
import { useEventsQuery } from '../../events/hooks/use-events-query.js'
import { EventFormDialog } from '../../events/components/event-form-dialog.js'
import { WeekHeader } from './week-header.js'
import { TimeGutter } from './time-gutter.js'
import { TimeGrid } from './time-grid.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

export function WeekView() {
  const { date } = useParams({ strict: false }) as { date: string }
  const days = getWeekDays(date)
  const todayIndex = days.indexOf(getTodayDate())
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: events } = useEventsQuery({
    startDate: days[0],
    endDate: days[6],
  })

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
    const endHour = hour + 1
    const end = `${cellDate}T${String(endHour).padStart(2, '0')}:00`
    setCreateDialog({ open: true, start, end })
  }

  function handleEventClick(event: CalendarEvent) {
    setEditEvent(event)
  }

  return (
    <div data-testid="week-view" className="flex h-full flex-col">
      <WeekHeader days={days} />
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        data-testid="week-scroll-container"
      >
        <div className="grid" style={{ gridTemplateColumns: 'var(--density-gutter-width) 1fr' }}>
          <TimeGutter />
          <TimeGrid
            dayCount={7}
            todayIndex={todayIndex >= 0 ? todayIndex : undefined}
            days={days}
            events={events}
            onCellClick={handleCellClick}
            onEventClick={handleEventClick}
          />
        </div>
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
