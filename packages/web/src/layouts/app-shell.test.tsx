import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from './app-shell.js'
import { useUIStore } from '../stores/ui-store.js'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: Record<string, unknown>) => <a href={to as string} {...props}>{children as string}</a>,
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: '/week/2026-04-03' } }),
  useNavigate: () => vi.fn(),
}))

vi.mock('../hooks/use-media-query.js', () => ({
  useMediaQuery: vi.fn(() => false),
}))

vi.mock('../lib/api-client.js', () => ({
  eventsApi: { list: vi.fn().mockResolvedValue([]) },
  calendarsApi: { list: vi.fn().mockResolvedValue([]) },
  sharedCalendarsApi: { list: vi.fn().mockResolvedValue([]) },
  userApi: {
    getProfile: vi.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', name: null, image: null, hasPassword: false }),
  },
}))

vi.mock('../lib/auth-client.js', () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}))

// jsdom doesn't implement HTMLDialogElement methods
HTMLDialogElement.prototype.showModal = vi.fn()
HTMLDialogElement.prototype.close = vi.fn()

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

function renderShell(children: React.ReactNode = createElement('div', null, 'Page content')) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(AppShell, null, children)),
  )
}

describe('AppShell', () => {
  it('renders header, main content, and status bar regions', () => {
    renderShell()

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('main-content')).toBeInTheDocument()
    expect(screen.getByTestId('status-bar')).toBeInTheDocument()
  })

  it('renders children inside main content', () => {
    renderShell()

    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('has sidebar hidden (0px column) by default', () => {
    const { container } = renderShell()

    const grid = container.firstElementChild as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe('0px 1fr')
  })

  it('expands sidebar column using density token when sidebarOpen is true', () => {
    useUIStore.setState({ sidebarOpen: true })

    const { container } = renderShell()

    const grid = container.firstElementChild as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe('var(--density-sidebar-width) 1fr')
  })

  it('uses density tokens for grid template rows', () => {
    const { container } = renderShell()

    const grid = container.firstElementChild as HTMLElement
    expect(grid.style.gridTemplateRows).toBe('var(--density-header-height) 1fr var(--density-status-bar-height)')
  })

  it('renders sidebar element', () => {
    renderShell()

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('applies theme class to html element', () => {
    renderShell()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('applies density attribute to html element', () => {
    renderShell()

    expect(document.documentElement.dataset.density).toBe('compact')
  })

  it('switches theme class on html when theme changes', () => {
    renderShell()

    expect(document.documentElement.classList.contains('dark')).toBe(true)

    useUIStore.setState({ theme: 'light' })

    cleanup()
    renderShell()

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('applies accent color to html element style', () => {
    renderShell()

    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#2f81f7')
  })

  it('has grid transition for sidebar animation', () => {
    const { container } = renderShell()

    const grid = container.firstElementChild as HTMLElement
    expect(grid.style.transition).toBe('grid-template-columns 200ms ease')
  })

  describe('mobile responsive', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true)
    })

    it('renders sidebar as overlay on mobile when open', () => {
      useUIStore.setState({ sidebarOpen: true })
      renderShell()

      expect(screen.getByTestId('sidebar-backdrop')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('does not show backdrop when sidebar is closed on mobile', () => {
      renderShell()

      expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument()
    })

    it('clicking backdrop closes sidebar via setSidebarOpen(false)', () => {
      useUIStore.setState({ sidebarOpen: true })
      renderShell()

      fireEvent.click(screen.getByTestId('sidebar-backdrop'))
      expect(useUIStore.getState().sidebarOpen).toBe(false)
    })

    it('keeps grid column at 0px on mobile even when sidebar is open', () => {
      useUIStore.setState({ sidebarOpen: true })
      const { container } = renderShell()

      const grid = container.firstElementChild as HTMLElement
      expect(grid.style.gridTemplateColumns).toBe('0px 1fr')
    })
  })
})
