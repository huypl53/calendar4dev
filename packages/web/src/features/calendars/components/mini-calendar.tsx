import { useState, useCallback } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { getMonthGridDates, isSameMonth, isToday, getTodayDate, addMonths } from '../../../lib/date-utils.js'
import { IconButton } from '../../../components/ui/icon-button.js'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type View = 'day' | 'week' | 'month' | 'schedule'

function parseView(pathname: string): View {
  if (pathname.startsWith('/day/')) return 'day'
  if (pathname.startsWith('/month/')) return 'month'
  if (pathname.startsWith('/schedule')) return 'schedule'
  return 'week'
}

function viewPath(view: View, date: string): string {
  if (view === 'schedule') return '/schedule'
  return `/${view}/${date}`
}

export function MiniCalendar() {
  const today = getTodayDate()
  const [month, setMonth] = useState(today.slice(0, 7)) // YYYY-MM
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const view = parseView(pathname)

  const monthDate = `${month}-01`
  const dates = getMonthGridDates(monthDate)

  const [year, mon] = month.split('-').map(Number) as [number, number]
  const monthLabel = new Date(year, mon - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  const handlePrev = useCallback(() => {
    setMonth((m) => addMonths(`${m}-01`, -1).slice(0, 7))
  }, [])

  const handleNext = useCallback(() => {
    setMonth((m) => addMonths(`${m}-01`, 1).slice(0, 7))
  }, [])

  function handleDateClick(date: string) {
    void navigate({ to: viewPath(view, date) })
  }

  return (
    <div data-testid="mini-calendar" className="select-none">
      <div className="mb-[var(--space-1)] flex items-center justify-between">
        <span className="font-sans text-[length:var(--font-size-small)] font-[number:var(--font-weight-medium)] text-[var(--color-text-primary)]">
          {monthLabel}
        </span>
        <div className="flex">
          <IconButton aria-label="Previous month" onClick={handlePrev} size="sm">
            <span className="text-[var(--color-text-secondary)]">&#8249;</span>
          </IconButton>
          <IconButton aria-label="Next month" onClick={handleNext} size="sm">
            <span className="text-[var(--color-text-secondary)]">&#8250;</span>
          </IconButton>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-0">
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="pb-[var(--space-1)] text-center font-sans text-[length:var(--font-size-tiny)] text-[var(--color-text-tertiary)]"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-0">
        {dates.map((cellDate) => {
          const dayNumber = Number(cellDate.split('-')[2])
          const inMonth = isSameMonth(cellDate, monthDate)
          const isToday_ = isToday(cellDate)

          return (
            <button
              key={cellDate}
              type="button"
              data-testid={`mini-cal-${cellDate}`}
              onClick={() => handleDateClick(cellDate)}
              className={`flex aspect-square items-center justify-center rounded-full font-sans text-[length:var(--font-size-tiny)] ${
                isToday_
                  ? 'bg-[var(--color-accent)] text-[var(--color-text-on-accent)] font-[number:var(--font-weight-semibold)]'
                  : inMonth
                    ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                    : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              {dayNumber}
            </button>
          )
        })}
      </div>
    </div>
  )
}
