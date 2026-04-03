import { useState, useEffect } from 'react'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function StatusBar() {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer
      data-testid="status-bar"
      className="col-span-full flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 font-mono text-[var(--color-text-tertiary)]"
      style={{ height: 'var(--density-status-bar-height)', fontSize: 'var(--font-size-tiny)' }}
    >
      <span data-testid="status-bar-time">{time}</span>
      <span data-testid="status-bar-sync">Synced</span>
    </footer>
  )
}
