import { DEFAULT_EVENT_DURATION } from '@dev-calendar/shared'

export function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-sans)]">
          Dev Calendar
        </h1>
        <p className="mt-2 text-sm opacity-60 font-[family-name:var(--font-mono)]">
          Default event: {DEFAULT_EVENT_DURATION}min
        </p>
      </div>
    </div>
  )
}
