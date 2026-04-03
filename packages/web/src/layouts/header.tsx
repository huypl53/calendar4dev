import { Link } from '@tanstack/react-router'
import { useUIStore } from '../stores/ui-store.js'
import { getTodayDate } from '../lib/date-utils.js'

export function Header() {
  const today = getTodayDate()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <header
      data-testid="header"
      className="col-span-full flex h-12 items-center gap-4 border-b border-[var(--color-text-primary)]/10 bg-[var(--color-bg-primary)] px-4"
    >
      <button
        type="button"
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
        className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10"
      >
        <span className="text-[var(--color-text-primary)]">&#9776;</span>
      </button>

      <span className="font-sans text-sm font-semibold text-[var(--color-text-primary)]">
        Dev Calendar
      </span>

      <nav className="ml-auto flex gap-2 font-mono text-xs text-[var(--color-text-primary)]/70">
        <Link to="/day/$date" params={{ date: today }}>D</Link>
        <Link to="/week/$date" params={{ date: today }}>W</Link>
        <Link to="/month/$date" params={{ date: today }}>M</Link>
        <Link to="/schedule">A</Link>
      </nav>
    </header>
  )
}
