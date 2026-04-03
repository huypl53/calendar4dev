import { useEffect, useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { getWeekDays } from '../../../lib/date-utils.js'
import { WeekHeader } from './week-header.js'
import { TimeGutter } from './time-gutter.js'
import { TimeGrid } from './time-grid.js'

export function WeekView() {
  const { date } = useParams({ strict: false }) as { date: string }
  const days = getWeekDays(date)
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
    <div data-testid="week-view" className="flex h-full flex-col">
      <WeekHeader days={days} />
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        data-testid="week-scroll-container"
      >
        <div className="grid" style={{ gridTemplateColumns: '60px 1fr' }}>
          <TimeGutter />
          <TimeGrid dayCount={7} />
        </div>
      </div>
    </div>
  )
}
