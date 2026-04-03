import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useUIStore } from '../stores/ui-store.js'
import { getTodayDate, getDateLabel, navigateDate } from '../lib/date-utils.js'
import { IconButton, Button } from '../components/ui/index.js'

type View = 'day' | 'week' | 'month' | 'schedule'

function parseRoute(pathname: string): { view: View; date: string } {
  const today = getTodayDate()
  if (pathname.startsWith('/day/')) return { view: 'day', date: pathname.split('/')[2] ?? today }
  if (pathname.startsWith('/month/')) return { view: 'month', date: pathname.split('/')[2] ?? today }
  if (pathname.startsWith('/schedule')) return { view: 'schedule', date: today }
  // Default: week
  const date = pathname.startsWith('/week/') ? pathname.split('/')[2] ?? today : today
  return { view: 'week', date }
}

function viewPath(view: View, date: string): string {
  if (view === 'schedule') return '/schedule'
  return `/${view}/${date}`
}

export function Header() {
  const today = getTodayDate()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const { view, date } = parseRoute(pathname)
  const dateLabel = getDateLabel(view, date)

  function handleNav(direction: 1 | -1) {
    const newDate = navigateDate(view, date, direction)
    void navigate({ to: viewPath(view, newDate) })
  }

  function handleToday() {
    void navigate({ to: viewPath(view, today) })
  }

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

      <Button size="sm" variant="ghost" data-testid="today-button" onClick={handleToday}>
        Today
      </Button>

      {view !== 'schedule' && (
        <>
          <IconButton aria-label="Previous" data-testid="nav-prev" onClick={() => handleNav(-1)}>
            <span className="text-[var(--color-text-primary)]">&#8249;</span>
          </IconButton>
          <IconButton aria-label="Next" data-testid="nav-next" onClick={() => handleNav(1)}>
            <span className="text-[var(--color-text-primary)]">&#8250;</span>
          </IconButton>
        </>
      )}

      <span
        data-testid="date-label"
        className="font-sans text-[length:var(--font-size-body)] font-[number:var(--font-weight-medium)] text-[var(--color-text-primary)]"
      >
        {dateLabel}
      </span>

      <nav className="ml-auto flex gap-1" data-testid="view-switcher">
        <Link to="/day/$date" params={{ date }}>
          <Button size="sm" variant={view === 'day' ? 'primary' : 'ghost'} data-testid="view-day">
            Day
          </Button>
        </Link>
        <Link to="/week/$date" params={{ date }}>
          <Button size="sm" variant={view === 'week' ? 'primary' : 'ghost'} data-testid="view-week">
            Week
          </Button>
        </Link>
        <Link to="/month/$date" params={{ date }}>
          <Button size="sm" variant={view === 'month' ? 'primary' : 'ghost'} data-testid="view-month">
            Month
          </Button>
        </Link>
        <Link to="/schedule">
          <Button size="sm" variant={view === 'schedule' ? 'primary' : 'ghost'} data-testid="view-schedule">
            Schedule
          </Button>
        </Link>
      </nav>
    </header>
  )
}
