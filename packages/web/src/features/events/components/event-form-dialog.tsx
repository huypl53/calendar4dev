import { useState, useEffect, useRef } from 'react'
import { Dialog } from '../../../components/ui/dialog.js'
import { Button } from '../../../components/ui/button.js'
import { useCalendarsQuery } from '../../calendars/hooks/use-calendars-query.js'
import { useCreateEventMutation } from '../hooks/use-event-mutations.js'
import { useUpdateEventMutation, useDeleteEventMutation } from '../hooks/use-event-mutations.js'
import { useToast } from '../../../stores/toast-store.js'
import type { CalendarEvent } from '../../../lib/api-client.js'
import { RECURRENCE_OPTIONS, REMINDER_OPTIONS } from '@dev-calendar/shared'
import { CALENDAR_COLORS } from '@dev-calendar/shared'

export interface EventFormDialogProps {
  open: boolean
  onClose: () => void
  /** Pre-fill start/end from grid click */
  defaultStart?: string
  defaultEnd?: string
  /** When set, the dialog is in edit mode */
  event?: CalendarEvent
  /** When true (shared calendar with details-only permission), renders read-only view */
  isReadOnly?: boolean
}

export function EventFormDialog({
  open,
  onClose,
  defaultStart,
  defaultEnd,
  event,
  isReadOnly = false,
}: EventFormDialogProps) {
  const { data: calendars } = useCalendarsQuery()
  const createMutation = useCreateEventMutation()
  const updateMutation = useUpdateEventMutation()
  const deleteMutation = useDeleteEventMutation()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [calendarId, setCalendarId] = useState('')
  const [recurrence, setRecurrence] = useState('')
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [allDay, setAllDay] = useState(false)

  const isEdit = !!event
  const initializedRef = useRef(false)

  // Reset form when dialog opens (not on every calendars change)
  useEffect(() => {
    if (!open) {
      initializedRef.current = false
      return
    }
    if (initializedRef.current) return
    initializedRef.current = true

    if (event) {
      setTitle(event.title)
      setDescription(event.description ?? '')
      setStartTime(toDatetimeLocal(event.startTime))
      setEndTime(toDatetimeLocal(event.endTime))
      setCalendarId(event.calendarId)
      setRecurrence(event.recurrenceRule ?? '')
      setReminderMinutes(event.reminderMinutes ?? null)
      setColor(event.color ?? null)
      setAllDay(event.allDay)
    } else {
      setTitle('')
      setDescription('')
      setStartTime(defaultStart ?? '')
      setEndTime(defaultEnd ?? '')
      setCalendarId(calendars?.[0]?.id ?? '')
      setRecurrence('')
      setReminderMinutes(null)
      setColor(null)
      setAllDay(false)
    }
  }, [open, event, defaultStart, defaultEnd])

  // Set calendarId from calendars when they load (without resetting other fields)
  useEffect(() => {
    if (open && !isEdit && !calendarId && calendars?.[0]) {
      setCalendarId(calendars[0].id)
    }
  }, [open, isEdit, calendarId, calendars])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startTime || !endTime || !calendarId) return
    if (new Date(endTime) <= new Date(startTime)) {
      toast('End time must be after start time', 'error')
      return
    }

    if (isEdit) {
      updateMutation.mutate(
        {
          id: event!.id,
          data: {
            title: title.trim(),
            description: description.trim() || null,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            recurrenceRule: recurrence || null,
            reminderMinutes: reminderMinutes,
            color: color,
            allDay: allDay,
          },
        },
        {
          onSuccess: () => {
            toast('Event updated', 'success')
            onClose()
          },
          onError: () => toast('Failed to update event', 'error'),
        },
      )
    } else {
      createMutation.mutate(
        {
          calendarId,
          title: title.trim(),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          description: description.trim() || null,
          ...(recurrence ? { recurrenceRule: recurrence } : {}),
          reminderMinutes: reminderMinutes,
          color: color,
          allDay: allDay,
        },
        {
          onSuccess: () => {
            toast('Event created', 'success')
            onClose()
          },
          onError: () => toast('Failed to create event', 'error'),
        },
      )
    }
  }

  function handleDelete() {
    if (!event) return
    if (!window.confirm(`Delete "${event.title}"?`)) return
    deleteMutation.mutate(event.id, {
      onSuccess: () => {
        toast('Event deleted', 'success')
        onClose()
      },
      onError: () => toast('Failed to delete event', 'error'),
    })
  }

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  // Read-only view for shared calendars with details-only permission
  if (isReadOnly && event) {
    return (
      <Dialog open={open} onClose={onClose} title="Event Details">
        <div data-testid="event-readonly" className="flex flex-col gap-[var(--space-3)]">
          <div>
            <div className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">Title</div>
            <div className="text-[length:var(--font-size-body)] text-[var(--color-text-primary)]">{event.title}</div>
          </div>
          <div className="grid grid-cols-2 gap-[var(--space-2)]">
            <div>
              <div className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">Start</div>
              <div className="text-[length:var(--font-size-body)] text-[var(--color-text-primary)]">
                {new Date(event.startTime).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">End</div>
              <div className="text-[length:var(--font-size-body)] text-[var(--color-text-primary)]">
                {new Date(event.endTime).toLocaleString()}
              </div>
            </div>
          </div>
          {event.description && (
            <div>
              <div className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">Description</div>
              <div className="text-[length:var(--font-size-body)] text-[var(--color-text-primary)]">{event.description}</div>
            </div>
          )}
          <div className="flex justify-end pt-[var(--space-1)]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} title={isEdit ? 'Edit Event' : 'New Event'}>
      <form onSubmit={handleSubmit} data-testid="event-form" className="flex flex-col gap-[var(--space-3)]">
        <label className="flex flex-col gap-[var(--space-1)]">
          <span className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">Title</span>
          <input
            data-testid="event-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        {!isEdit && calendars && calendars.length > 1 && (
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">Calendar</span>
            <select
              data-testid="event-calendar-select"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              {calendars.map((cal) => (
                <option key={cal.id} value={cal.id}>
                  {cal.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex items-center gap-[var(--space-2)]">
          <input
            data-testid="event-allday-checkbox"
            type="checkbox"
            checked={allDay}
            onChange={(e) => {
              setAllDay(e.target.checked)
              // Clear time components when switching to all-day to avoid submitting a
              // non-midnight time alongside allDay=true, which creates an inconsistent record.
              if (e.target.checked) {
                setStartTime((t) => t.slice(0, 10))
                setEndTime((t) => t.slice(0, 10))
              }
            }}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          <span className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">All day</span>
        </label>

        {!allDay && (
          <div className="grid grid-cols-2 gap-[var(--space-2)]">
            <label className="flex flex-col gap-[var(--space-1)]">
              <span className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">Start</span>
              <input
                data-testid="event-start-input"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </label>
            <label className="flex flex-col gap-[var(--space-1)]">
              <span className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">End</span>
              <input
                data-testid="event-end-input"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </label>
          </div>
        )}

        <label className="flex flex-col gap-[var(--space-1)]">
          <span className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">Description</span>
          <textarea
            data-testid="event-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="resize-none rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <div className="flex flex-col gap-[var(--space-1)]">
          <span className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">Color</span>
          <div data-testid="event-color-picker" className="flex flex-wrap gap-[var(--space-1)]">
            <button
              type="button"
              data-testid="event-color-none"
              onClick={() => setColor(null)}
              className={`h-6 w-6 rounded-full border-2 bg-[var(--color-bg-secondary)] ${color === null ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}
              title="No color (use calendar color)"
              aria-label="No color"
            />
            {CALENDAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                data-testid={`event-color-swatch-${c}`}
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full border-2 ${color === c ? 'border-[var(--color-accent)]' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                title={c}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-[var(--space-1)]">
          <span className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">Repeat</span>
          <select
            data-testid="event-recurrence-select"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          >
            {RECURRENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-[var(--space-1)]">
          <span className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">Reminder</span>
          <select
            data-testid="event-reminder-select"
            value={reminderMinutes === null ? '' : String(reminderMinutes)}
            onChange={(e) => setReminderMinutes(e.target.value === '' ? null : Number(e.target.value))}
            className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          >
            {REMINDER_OPTIONS.map((opt) => (
              <option key={opt.value === null ? 'none' : opt.value} value={opt.value === null ? '' : String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center justify-between pt-[var(--space-2)]">
          <div>
            {isEdit && (
              <Button
                data-testid="event-delete-button"
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-[var(--space-2)]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button data-testid="event-submit-button" type="submit" variant="primary" size="sm" disabled={isPending}>
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}

/** Convert ISO string to datetime-local input value */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
