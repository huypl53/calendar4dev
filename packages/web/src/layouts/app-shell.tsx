import type { ReactNode } from 'react'
import { useUIStore } from '../stores/ui-store.js'
import { Header } from './header.js'
import { Sidebar } from './sidebar.js'
import { StatusBar } from './status-bar.js'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div
      className="grid h-screen"
      style={{
        gridTemplateRows: '48px 1fr 28px',
        gridTemplateColumns: `${sidebarOpen ? '240px' : '0px'} 1fr`,
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
