import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { AppShell } from './app-shell.js'
import { useUIStore } from '../stores/ui-store.js'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: Record<string, unknown>) => <a href={to as string} {...props}>{children as string}</a>,
}))

afterEach(() => {
  cleanup()
  // Clean up html element attributes after each test
  document.documentElement.classList.remove('dark', 'light')
  delete document.documentElement.dataset.density
})

beforeEach(() => {
  useUIStore.setState({ sidebarOpen: false, theme: 'dark', density: 'compact' })
})

describe('AppShell', () => {
  it('renders header, main content, and status bar regions', () => {
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('main-content')).toBeInTheDocument()
    expect(screen.getByTestId('status-bar')).toBeInTheDocument()
  })

  it('renders children inside main content', () => {
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('has sidebar hidden (0px column) by default', () => {
    const { container } = render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    const grid = container.firstElementChild as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe('0px 1fr')
  })

  it('expands sidebar column using density token when sidebarOpen is true', () => {
    useUIStore.setState({ sidebarOpen: true })

    const { container } = render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    const grid = container.firstElementChild as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe('var(--density-sidebar-width) 1fr')
  })

  it('uses density tokens for grid template rows', () => {
    const { container } = render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    const grid = container.firstElementChild as HTMLElement
    expect(grid.style.gridTemplateRows).toBe('var(--density-header-height) 1fr var(--density-status-bar-height)')
  })

  it('renders sidebar element', () => {
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('applies theme class to html element', () => {
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('applies density attribute to html element', () => {
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    expect(document.documentElement.dataset.density).toBe('compact')
  })

  it('switches theme class on html when theme changes', () => {
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)

    useUIStore.setState({ theme: 'light' })

    // Re-render needed for useEffect to fire
    cleanup()
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
