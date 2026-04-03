import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { AppShell } from './app-shell.js'
import { useUIStore } from '../stores/ui-store.js'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: Record<string, unknown>) => <a href={to as string} {...props}>{children as string}</a>,
}))

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  // Reset store to defaults before each test
  useUIStore.setState({ sidebarOpen: false })
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

  it('expands sidebar column to 240px when sidebarOpen is true', () => {
    useUIStore.setState({ sidebarOpen: true })

    const { container } = render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    const grid = container.firstElementChild as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe('240px 1fr')
  })

  it('renders sidebar element', () => {
    render(
      <AppShell>
        <div>Page content</div>
      </AppShell>,
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })
})
