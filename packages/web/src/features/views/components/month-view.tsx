import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { getMonthGridDates } from '../../../lib/date-utils.js'
import { useEventsQuery } from '../../events/hooks/use-events-query.js'
import { EventFormDialog } from '../../events/components/event-form-dialog.js'
import { MonthGrid } from './month-grid.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

export function MonthView() {
  const { date } = useParams({ strict: false }) as { date: string }

  const [year, month] = date.split('-').map(Number) as [number, number]
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // Fetch events for the full 6-week grid range
  const gridDates = getMonthGridDates(date)
  const { data: events } = useEventsQuery({
    startDate: gridDates[0],
    endDate: gridDates[gridDates.length - 1],
  })

  const [createDialog, setCreateDialog] = useState<{ open: boolean; start: string; end: string }>({
    open: false,
    start: '',
    end: '',
  })
  const [editEvent, setEditEvent] = useState<CalendarEvent | undefined>()

  function handleDateClick(cellDate: string) {
    setCreateDialog({
      open: true,
      start: `${cellDate}T09:00`,
      end: `${cellDate}T10:00`,
    })
  }

  function handleEventClick(event: CalendarEvent) {
    setEditEvent(event)
  }

  return (
    <div data-testid="month-view" className="flex h-full flex-col">
      <div className="border-b border-[var(--color-border)] px-4 py-2">
        <h2
          data-testid="month-title"
          className="font-sans text-[length:var(--font-size-heading)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-primary)]"
        >
          {monthName}
        </h2>
      </div>
      <div className="flex-1 overflow-auto">
        <MonthGrid
          date={date}
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
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
