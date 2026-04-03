import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { StatusBar } from './status-bar.js'

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: '/week/2026-04-03' } }),
}))

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('StatusBar', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true })
  })

  it('renders current time', () => {
    render(<StatusBar />)
    expect(screen.getByTestId('status-bar-time')).toBeInTheDocument()
    expect(screen.getByTestId('status-bar-time').textContent).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i)
  })

  it('renders sync status when online', () => {
    render(<StatusBar />)
    expect(screen.getByTestId('status-bar-sync')).toHaveTextContent('Synced')
  })

  it('shows offline indicator when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true })
    render(<StatusBar />)
    expect(screen.getByTestId('status-bar-offline')).toBeInTheDocument()
    expect(screen.queryByTestId('status-bar-sync')).not.toBeInTheDocument()
  })

  it('uses density token for height', () => {
    render(<StatusBar />)
    const footer = screen.getByTestId('status-bar')
    expect(footer.style.height).toBe('var(--density-status-bar-height)')
  })

  it('shows current view label', () => {
    render(<StatusBar />)
    expect(screen.getByTestId('status-bar-view')).toHaveTextContent('Week view')
  })
})
