import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { AppShell } from './app-shell.js'
import { useUIStore } from '../stores/ui-store.js'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: Record<string, unknown>) => <a href={to as string} {...props}>{children as string}</a>,
  useRouterState: () => '/week/2026-04-03',
}))

vi.mock('../hooks/use-media-query.js', () => ({
  useMediaQuery: vi.fn(() => false),
}))

import { useMediaQuery } from '../hooks/use-media-query.js'
const mockUseMediaQuery = vi.mocked(useMediaQuery)

afterEach(() => {
  cleanup()
  document.documentElement.classList.remove('dark', 'light')
  delete document.documentElement.dataset.density
  document.documentElement.style.removeProperty('--color-accent')
  localStorage.clear()
})

beforeEach(() => {
  useUIStore.setState({ sidebarOpen: false, theme: 'dark', density: 'compact', accentColor: '#2f81f7' })
  mockUseMediaQuery.mockReturnValue(false)
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

    cleanup()
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('applies accent color to html element style', () => {
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#2f81f7')
  })

  it('has grid transition for sidebar animation', () => {
    const { container } = render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    const grid = container.firstElementChild as HTMLElement
    expect(grid.style.transition).toBe('grid-template-columns 200ms ease')
  })

  describe('mobile responsive', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true)
    })

    it('renders sidebar as overlay on mobile when open', () => {
      useUIStore.setState({ sidebarOpen: true })
      render(
        <AppShell>
          <div>Page content</div>
        </AppShell>,
      )

      expect(screen.getByTestId('sidebar-backdrop')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('does not show backdrop when sidebar is closed on mobile', () => {
      render(
        <AppShell>
          <div>Page content</div>
        </AppShell>,
      )

      expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument()
    })

    it('clicking backdrop closes sidebar', () => {
      useUIStore.setState({ sidebarOpen: true })
      render(
        <AppShell>
          <div>Page content</div>
        </AppShell>,
      )

      fireEvent.click(screen.getByTestId('sidebar-backdrop'))
      expect(useUIStore.getState().sidebarOpen).toBe(false)
    })

    it('keeps grid column at 0px on mobile even when sidebar is open', () => {
      useUIStore.setState({ sidebarOpen: true })
      const { container } = render(
        <AppShell>
          <div>Page content</div>
        </AppShell>,
      )

      const grid = container.firstElementChild as HTMLElement
      expect(grid.style.gridTemplateColumns).toBe('0px 1fr')
    })
  })
})
