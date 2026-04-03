import { useEffect, type ReactNode } from 'react'
import { useUIStore } from '../stores/ui-store.js'
import { useMediaQuery } from '../hooks/use-media-query.js'
import { Header } from './header.js'
import { Sidebar } from './sidebar.js'
import { StatusBar } from './status-bar.js'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const theme = useUIStore((state) => state.theme)
  const density = useUIStore((state) => state.density)
  const accentColor = useUIStore((state) => state.accentColor)
  const isMobile = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('dark', 'light')
    html.classList.add(theme)
    html.dataset.density = density
    html.style.setProperty('--color-accent', accentColor)
  }, [theme, density, accentColor])

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
    </div>
  )
}
