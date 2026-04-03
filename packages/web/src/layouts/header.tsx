import { Link, useRouterState } from '@tanstack/react-router'
import { useUIStore } from '../stores/ui-store.js'
import { getTodayDate } from '../lib/date-utils.js'
import { IconButton, Button } from '../components/ui/index.js'

type View = 'day' | 'week' | 'month' | 'schedule'

function getActiveView(pathname: string): View {
  if (pathname.startsWith('/day')) return 'day'
  if (pathname.startsWith('/month')) return 'month'
  if (pathname.startsWith('/schedule')) return 'schedule'
  return 'week'
}

export function Header() {
  const today = getTodayDate()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const activeView = getActiveView(pathname)

  return (
    <header
      data-testid="header"
      className="col-span-full flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4"
      style={{ height: 'var(--density-header-height)' }}
    >
      <IconButton aria-label="Toggle sidebar" onClick={toggleSidebar}>
        <span className="text-[var(--color-text-primary)]">&#9776;</span>
      </IconButton>

      <span className="font-sans text-[length:var(--font-size-body)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-primary)]">
        Dev Calendar
      </span>

      <Link to="/week/$date" params={{ date: today }}>
        <Button size="sm" variant="ghost" data-testid="today-button">
          Today
        </Button>
      </Link>

      <nav className="ml-auto flex gap-1" data-testid="view-switcher">
        <Link to="/day/$date" params={{ date: today }}>
          <Button size="sm" variant={activeView === 'day' ? 'primary' : 'ghost'} data-testid="view-day">
            Day
          </Button>
        </Link>
        <Link to="/week/$date" params={{ date: today }}>
          <Button size="sm" variant={activeView === 'week' ? 'primary' : 'ghost'} data-testid="view-week">
            Week
          </Button>
        </Link>
        <Link to="/month/$date" params={{ date: today }}>
          <Button size="sm" variant={activeView === 'month' ? 'primary' : 'ghost'} data-testid="view-month">
            Month
          </Button>
        </Link>
        <Link to="/schedule">
          <Button size="sm" variant={activeView === 'schedule' ? 'primary' : 'ghost'} data-testid="view-schedule">
            Schedule
          </Button>
        </Link>
      </nav>
    </header>
  )
}
