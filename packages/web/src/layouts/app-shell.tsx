import { useState, useEffect, useMemo, useCallback, useRef, type ReactNode } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useUIStore } from '../stores/ui-store.js'
import { useMediaQuery } from '../hooks/use-media-query.js'
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts.js'
import { getTodayDate, navigateDate } from '../lib/date-utils.js'
import { useEventsQuery } from '../features/events/hooks/use-events-query.js'
import { CommandPalette } from '../features/command-palette/command-palette.js'
import { ShortcutHelpDialog } from '../features/command-palette/shortcut-help-dialog.js'
import { createCommands } from '../features/command-palette/commands.js'
import { EventFormDialog } from '../features/events/components/event-form-dialog.js'
import { Header } from './header.js'
import { Sidebar } from './sidebar.js'
import { StatusBar } from './status-bar.js'
import { useToast } from '../stores/toast-store.js'
import { requestNotificationPermission, checkReminders } from '../lib/notification-service.js'

type View = 'day' | 'week' | 'month' | 'schedule'

function parseRoute(pathname: string): { view: View; date: string } {
  const today = getTodayDate()
  if (pathname.startsWith('/day/')) return { view: 'day', date: pathname.split('/')[2] ?? today }
  if (pathname.startsWith('/month/')) return { view: 'month', date: pathname.split('/')[2] ?? today }
  if (pathname.startsWith('/schedule')) return { view: 'schedule', date: today }
  const date = pathname.startsWith('/week/') ? pathname.split('/')[2] ?? today : today
  return { view: 'week', date }
}

function viewPath(view: View, date: string): string {
  if (view === 'schedule') return '/schedule'
  return `/${view}/${date}`
}

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const theme = useUIStore((state) => state.theme)
  const density = useUIStore((state) => state.density)
  const accentColor = useUIStore((state) => state.accentColor)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const toggleDensity = useUIStore((state) => state.toggleDensity)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const isMobile = useMediaQuery('(max-width: 767px)')

  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { view, date } = parseRoute(pathname)
  const today = getTodayDate()

  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [createEventOpen, setCreateEventOpen] = useState(false)

  const { toast } = useToast()

  // Fetch upcoming events for reminder polling (next 2 hours)
  const notifStart = today
  const notifEnd = today
  const { data: upcomingEvents } = useEventsQuery({ startDate: notifStart, endDate: notifEnd })
  const upcomingEventsRef = useRef(upcomingEvents)
  upcomingEventsRef.current = upcomingEvents

  // Request notification permission on mount and start reminder polling
  useEffect(() => {
    void requestNotificationPermission()
    const interval = setInterval(() => {
      if (upcomingEventsRef.current) {
        checkReminders(upcomingEventsRef.current, (msg) => toast(msg, 'info'))
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('dark', 'light')
    html.classList.add(theme)
    html.dataset.density = density
    html.style.setProperty('--color-accent', accentColor)
  }, [theme, density, accentColor])

  const doNavigate = useCallback(
    (path: string) => void navigate({ to: path }),
    [navigate],
  )

  const commands = useMemo(
    () =>
      createCommands({
        navigate: doNavigate,
        today,
        toggleTheme,
        toggleDensity,
        toggleSidebar,
        openCreateEvent: () => setCreateEventOpen(true),
      }),
    [doNavigate, today, toggleTheme, toggleDensity, toggleSidebar],
  )

  const shortcuts = useMemo(
    () => ({
      'cmd+k': () => setPaletteOpen(true),
      '?': () => setHelpOpen((prev) => !prev),
      d: () => doNavigate(`/day/${today}`),
      w: () => doNavigate(`/week/${today}`),
      m: () => doNavigate(`/month/${today}`),
      s: () => doNavigate('/schedule'),
      t: () => doNavigate(viewPath(view, today)),
      c: () => setCreateEventOpen(true),
      j: () => {
        const newDate = navigateDate(view, date, -1)
        doNavigate(viewPath(view, newDate))
      },
      k: () => {
        const newDate = navigateDate(view, date, 1)
        doNavigate(viewPath(view, newDate))
      },
    }),
    [doNavigate, today, view, date],
  )

  useKeyboardShortcuts(shortcuts)

  return (
    <div
      className="grid h-screen bg-[var(--color-bg-primary)]"
      style={{
        gridTemplateRows: 'var(--density-header-height) 1fr var(--density-status-bar-height)',
        gridTemplateColumns: `${!isMobile && sidebarOpen ? 'var(--density-sidebar-width)' : '0px'} 1fr`,
        transition: 'grid-template-columns 200ms ease',
      }}
    >
      <Header />
      {isMobile ? (
        <>
          {sidebarOpen && (
            <div
              data-testid="sidebar-backdrop"
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside
            data-testid="sidebar"
            className={`fixed top-0 left-0 z-50 h-full flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-transform duration-200 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ width: 'var(--density-sidebar-width)' }}
          >
            <Sidebar embedded={false} />
          </aside>
        </>
      ) : (
        <Sidebar embedded />
      )}
      <main data-testid="main-content" className="overflow-auto bg-[var(--color-bg-primary)]">
        {children}
      </main>
      <StatusBar />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />

      <ShortcutHelpDialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        commands={commands}
      />

      <EventFormDialog
        open={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
      />
    </div>
  )
}
