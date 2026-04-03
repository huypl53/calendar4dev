import { useEffect, type ReactNode } from 'react'
import { useUIStore } from '../stores/ui-store.js'
import { Header } from './header.js'
import { Sidebar } from './sidebar.js'
import { StatusBar } from './status-bar.js'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const theme = useUIStore((state) => state.theme)
  const density = useUIStore((state) => state.density)
  const accentColor = useUIStore((state) => state.accentColor)

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
        gridTemplateColumns: `${sidebarOpen ? 'var(--density-sidebar-width)' : '0px'} 1fr`,
      }}
    >
      <Header />
      <Sidebar />
      <main data-testid="main-content" className="overflow-auto bg-[var(--color-bg-primary)]">
        {children}
      </main>
      <StatusBar />
    </div>
  )
}
