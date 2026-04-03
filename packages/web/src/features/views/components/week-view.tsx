import { useParams } from '@tanstack/react-router'

export function WeekView() {
  const { date } = useParams({ strict: false })

  return (
    <div className="flex h-full items-center justify-center">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
        Week View &mdash; {date}
      </h1>
    </div>
  )
}
