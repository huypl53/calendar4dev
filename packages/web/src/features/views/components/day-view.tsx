import { useEffect, useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { isToday } from '../../../lib/date-utils.js'
import { DayHeader } from './day-header.js'
import { TimeGutter } from './time-gutter.js'
import { TimeGrid } from './time-grid.js'

export function DayView() {
  const { date } = useParams({ strict: false }) as { date: string }
  const showNowLine = isToday(date)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  return (
    <div data-testid="day-view" className="flex h-full flex-col">
      <DayHeader date={date} />
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        data-testid="day-scroll-container"
      >
        <div className="grid" style={{ gridTemplateColumns: 'var(--density-gutter-width) 1fr' }}>
          <TimeGutter />
          <TimeGrid dayCount={1} todayIndex={showNowLine ? 0 : undefined} />
        </div>
      </div>
    </div>
  )
}
