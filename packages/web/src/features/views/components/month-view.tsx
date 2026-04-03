import { useParams } from '@tanstack/react-router'
import { MonthGrid } from './month-grid.js'

export function MonthView() {
  const { date } = useParams({ strict: false }) as { date: string }

  const [year, month] = date.split('-').map(Number) as [number, number]
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

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
        <MonthGrid date={date} />
      </div>
    </div>
  )
}
