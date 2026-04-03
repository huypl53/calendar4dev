import { useState, useEffect } from 'react'

function getMinuteOfDay(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function NowLine() {
  const [minute, setMinute] = useState(getMinuteOfDay)

  useEffect(() => {
    const tick = () => setMinute(getMinuteOfDay())
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

  // Position as percentage of 24 hours (1440 minutes)
  const pct = (minute / 1440) * 100

  return (
    <div
      data-testid="now-line"
      className="pointer-events-none absolute inset-x-0 z-10"
      style={{ top: `${pct}%` }}
    >
      <div className="flex items-center">
        <div className="h-2 w-2 -translate-x-1 rounded-full bg-[var(--color-now-line)]" />
        <div className="h-[2px] flex-1 bg-[var(--color-now-line)]" />
      </div>
    </div>
  )
}
