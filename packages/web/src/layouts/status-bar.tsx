import { useState, useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function getViewLabel(pathname: string): string {
  if (pathname.startsWith('/day/')) return 'Day'
  if (pathname.startsWith('/month/')) return 'Month'
  if (pathname.startsWith('/schedule')) return 'Schedule'
  return 'Week'
}

export function StatusBar() {
  const [time, setTime] = useState(() => formatTime(new Date()))
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const viewLabel = getViewLabel(pathname)

  useEffect(() => {
    const tick = () => setTime(formatTime(new Date()))
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000)
    const timeout = setTimeout(() => {
      tick()
      const interval = setInterval(tick, 60_000)
      intervalRef = interval
    }, msUntilNextMinute)
    let intervalRef: ReturnType<typeof setInterval> | null = null
    return () => {
      clearTimeout(timeout)
      if (intervalRef) clearInterval(intervalRef)
    }
  }, [])

  return (
    <footer
      data-testid="status-bar"
      className="col-span-full flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 font-mono text-[var(--color-text-tertiary)]"
      style={{ height: 'var(--density-status-bar-height)', fontSize: 'var(--font-size-tiny)' }}
    >
      <div className="flex items-center gap-[var(--space-3)]">
        <span data-testid="status-bar-time">{time}</span>
        <span data-testid="status-bar-view" className="text-[var(--color-text-secondary)]">
          {viewLabel} view
        </span>
      </div>
      <div className="flex items-center gap-[var(--space-3)]">
        <span className="text-[var(--color-text-tertiary)]">
          <kbd className="rounded border border-[var(--color-border)] px-1">?</kbd> shortcuts
        </span>
        <span data-testid="status-bar-sync">Synced</span>
      </div>
    </footer>
  )
}
