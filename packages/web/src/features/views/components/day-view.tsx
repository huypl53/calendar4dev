import { useState, useEffect, useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { isToday } from '../../../lib/date-utils.js'
import { useEventsQuery } from '../../events/hooks/use-events-query.js'
import { useCalendarsQuery } from '../../calendars/hooks/use-calendars-query.js'
import { useSharedCalendarsQuery } from '../../calendars/hooks/use-shared-calendars-query.js'
import { useUpdateEventMutation } from '../../events/hooks/use-event-mutations.js'
import { EventFormDialog } from '../../events/components/event-form-dialog.js'
import { DayHeader } from './day-header.js'
import { TimeGutter } from './time-gutter.js'
import { TimeGrid } from './time-grid.js'
import { useToast } from '../../../stores/toast-store.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

export function DayView() {
  const { date } = useParams({ strict: false }) as { date: string }
  const showNowLine = isToday(date)
  const scrollRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()
  const updateMutation = useUpdateEventMutation()
  const { toast } = useToast()

  const { data: events, isLoading } = useEventsQuery({
    startDate: date,
    endDate: date,
  })
  const { data: calendars } = useCalendarsQuery()
  const { data: sharedCalendars } = useSharedCalendarsQuery()

  const calendarColorMap: Record<string, string> = {}
  for (const cal of calendars ?? []) {
    calendarColorMap[cal.id] = cal.color
  }

  const sharedPermissions: Record<string, string> = {}
  for (const cal of sharedCalendars ?? []) {
    sharedPermissions[cal.id] = cal.permissionLevel
  }
  const readOnlyEventIds = new Set(
    (events ?? [])
      .filter((e) => {
        const perm = sharedPermissions[e.calendarId]
        return perm === 'details' || (sharedCalendars === undefined && !calendars?.some((c) => c.id === e.calendarId))
      })
      .map((e) => e.id),
  )

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

  function handleEventDrop(event: CalendarEvent, newStartTime: string, newEndTime: string) {
    const snapshot = qc.getQueriesData<CalendarEvent[]>({ queryKey: ['events'] })
    qc.setQueriesData<CalendarEvent[]>({ queryKey: ['events'] }, (old) =>
      old?.map((e) => e.id === event.id ? { ...e, startTime: newStartTime, endTime: newEndTime } : e),
    )
    updateMutation.mutate(
      { id: event.id, data: { startTime: newStartTime, endTime: newEndTime } },
      {
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['events'] }) },
        onError: () => {
          for (const [key, data] of snapshot) {
            qc.setQueryData(key, data)
          }
          toast('Failed to move event', 'error')
        },
      },
    )
  }

  const allDayEvents = events?.filter((e) => e.allDay) ?? []
  const timedEvents = events?.filter((e) => !e.allDay)

  return (
    <div data-testid="day-view" className="flex h-full flex-col">
      <DayHeader
        date={date}
        allDayEvents={allDayEvents}
        calendarColorMap={calendarColorMap}
        onEventClick={handleEventClick}
      />
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
              events={timedEvents}
              calendarColorMap={calendarColorMap}
              readOnlyEventIds={readOnlyEventIds}
              onCellClick={handleCellClick}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
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
        isReadOnly={!!editEvent && (sharedPermissions[editEvent.calendarId] === 'details' || (sharedCalendars === undefined && !calendars?.some((c) => c.id === editEvent.calendarId)))}
      />
    </div>
  )
}
