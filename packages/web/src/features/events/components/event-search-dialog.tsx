import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '../../../lib/api-client.js'
import { useCalendarsQuery } from '../../calendars/hooks/use-calendars-query.js'
import { getWeekStart } from '../../../lib/date-utils.js'
import type { CalendarEvent } from '../../../lib/api-client.js'

interface EventSearchDialogProps {
  open: boolean
  onClose: () => void
}

export function EventSearchDialog({ open, onClose }: EventSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data: calendars } = useCalendarsQuery()
  const calendarNames: Record<string, string> = {}
  for (const cal of calendars ?? []) {
    calendarNames[cal.id] = cal.name
  }

  // Debounce the query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: results, isFetching } = useQuery({
    queryKey: ['events', 'search', debouncedQuery],
    queryFn: () => eventsApi.search(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    placeholderData: [],
  })
  const items = results ?? []

  useEffect(() => {
    if (open) {
      setQuery('')
      setDebouncedQuery('')
      setSelectedIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Reset selection whenever the debounced query changes (not just when result count changes)
  useEffect(() => {
    setSelectedIndex(0)
  }, [debouncedQuery])

  function handleSelect(event: CalendarEvent) {
    onClose()
    // Navigate to the week containing this event's start date
    const weekStart = getWeekStart(event.startTime.slice(0, 10))
    void navigate({ to: `/week/${weekStart}` })
  }

  function scrollSelectedIntoView(nextIndex: number) {
    requestAnimationFrame(() => {
      const container = resultsRef.current
      if (!container) return
      const btn = container.querySelectorAll<HTMLElement>('button[data-testid^="search-result-"]')[nextIndex]
      btn?.scrollIntoView({ block: 'nearest' })
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => {
        const next = Math.min(i + 1, items.length - 1)
        scrollSelectedIntoView(next)
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => {
        const next = Math.max(i - 1, 0)
        scrollSelectedIntoView(next)
        return next
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = items[selectedIndex]
      if (item) handleSelect(item)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!open) return null

  return (
    <div
      data-testid="search-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]"
      onClick={onClose}
    >
      <div
        data-testid="event-search-dialog"
        className="w-full max-w-lg overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center border-b border-[var(--color-border)] px-[var(--space-3)]">
          <span className="mr-[var(--space-2)] text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">
            🔍
          </span>
          <input
            ref={inputRef}
            data-testid="event-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events…"
            className="flex-1 bg-transparent py-[var(--space-3)] font-sans text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
          {isFetching && (
            <span className="text-[length:var(--font-size-tiny)] text-[var(--color-text-tertiary)]">…</span>
          )}
        </div>

        <div
          ref={resultsRef}
          data-testid="search-results"
          className="max-h-72 overflow-auto py-[var(--space-1)]"
        >
          {debouncedQuery.trim().length < 2 && (
            <div className="px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">
              Type at least 2 characters to search…
            </div>
          )}
          {debouncedQuery.trim().length >= 2 && !isFetching && items.length === 0 && (
            <div className="px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">
              No events found for "{debouncedQuery}"
            </div>
          )}
          {items.map((event, i) => (
            <button
              key={event.id}
              type="button"
              data-testid={`search-result-${event.id}`}
              onClick={() => handleSelect(event)}
              className={`flex w-full flex-col px-[var(--space-3)] py-[var(--space-2)] text-left ${
                i === selectedIndex
                  ? 'bg-[var(--color-accent)] text-[var(--color-text-on-accent)]'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              <span className="truncate text-[length:var(--font-size-body)] font-[number:var(--font-weight-medium)]">
                {event.title}
              </span>
              <span className={`text-[length:var(--font-size-small)] ${i === selectedIndex ? 'opacity-80' : 'text-[var(--color-text-secondary)]'}`}>
                {formatEventDate(event.startTime)}
                {calendarNames[event.calendarId] ? ` · ${calendarNames[event.calendarId]}` : ''}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
