import { Link } from '@tanstack/react-router'
import { useUIStore } from '../stores/ui-store.js'
import { getTodayDate } from '../lib/date-utils.js'
import { IconButton } from '../components/ui/index.js'

export function Header() {
  const today = getTodayDate()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <header
      data-testid="header"
      className="col-span-full flex items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4"
      style={{ height: 'var(--density-header-height)' }}
    >
      <IconButton aria-label="Toggle sidebar" onClick={toggleSidebar}>
        <span className="text-[var(--color-text-primary)]">&#9776;</span>
      </IconButton>

      <span className="font-sans text-sm font-semibold text-[var(--color-text-primary)]">
        Dev Calendar
      </span>

      <nav className="ml-auto flex gap-2 font-mono text-xs text-[var(--color-text-secondary)]">
        <Link to="/day/$date" params={{ date: today }}>D</Link>
        <Link to="/week/$date" params={{ date: today }}>W</Link>
        <Link to="/month/$date" params={{ date: today }}>M</Link>
        <Link to="/schedule">A</Link>
      </nav>
    </header>
  )
}
