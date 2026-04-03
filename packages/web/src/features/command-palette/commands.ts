export interface Command {
  id: string
  label: string
  shortcut?: string
  category: 'navigation' | 'views' | 'actions'
  action: () => void
}

export type CommandFactory = (deps: {
  navigate: (path: string) => void
  today: string
  toggleTheme: () => void
  toggleDensity: () => void
  toggleSidebar: () => void
  openCreateEvent: () => void
  openSearch: () => void
}) => Command[]

export const createCommands: CommandFactory = ({
  navigate,
  today,
  toggleTheme,
  toggleDensity,
  toggleSidebar,
  openCreateEvent,
  openSearch,
}) => [
  // Views
  {
    id: 'view-day',
    label: 'Go to Day View',
    shortcut: 'd',
    category: 'views',
    action: () => navigate(`/day/${today}`),
  },
  {
    id: 'view-week',
    label: 'Go to Week View',
    shortcut: 'w',
    category: 'views',
    action: () => navigate(`/week/${today}`),
  },
  {
    id: 'view-month',
    label: 'Go to Month View',
    shortcut: 'm',
    category: 'views',
    action: () => navigate(`/month/${today}`),
  },
  {
    id: 'view-schedule',
    label: 'Go to Schedule View',
    shortcut: 's',
    category: 'views',
    action: () => navigate('/schedule'),
  },
  // Navigation
  {
    id: 'go-today',
    label: 'Go to Today',
    shortcut: 't',
    category: 'navigation',
    action: () => navigate(`/week/${today}`),
  },
  // Actions
  {
    id: 'search-events',
    label: 'Search Events',
    shortcut: '/',
    category: 'actions',
    action: openSearch,
  },
  {
    id: 'create-event',
    label: 'Create Event',
    shortcut: 'c',
    category: 'actions',
    action: openCreateEvent,
  },
  {
    id: 'toggle-theme',
    label: 'Toggle Theme (Dark/Light)',
    category: 'actions',
    action: toggleTheme,
  },
  {
    id: 'toggle-density',
    label: 'Toggle Density (Compact/Comfortable)',
    category: 'actions',
    action: toggleDensity,
  },
  {
    id: 'toggle-sidebar',
    label: 'Toggle Sidebar',
    category: 'actions',
    action: toggleSidebar,
  },
]

/** Simple fuzzy match — checks if all query characters appear in order in the target. */
export function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}
