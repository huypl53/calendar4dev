import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Header } from './header.js'

const mockRouterState = vi.fn(() => '/week/2026-04-03')
const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: Record<string, unknown>) => <a href={to as string} {...props}>{children as string}</a>,
  useRouterState: (opts: { select: (s: { location: { pathname: string } }) => string }) =>
    opts.select({ location: { pathname: mockRouterState() } }),
  useNavigate: () => mockNavigate,
}))

vi.mock('../stores/ui-store.js', () => ({
  useUIStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ toggleSidebar: vi.fn() }),
  ),
}))

afterEach(() => {
  cleanup()
  mockRouterState.mockReturnValue('/week/2026-04-03')
  mockNavigate.mockClear()
})

describe('Header', () => {
  it('renders Today button', () => {
    render(<Header />)
    expect(screen.getByTestId('today-button')).toBeInTheDocument()
    expect(screen.getByTestId('today-button')).toHaveTextContent('Today')
  })

  it('renders view switcher with all view buttons', () => {
    render(<Header />)
    expect(screen.getByTestId('view-day')).toBeInTheDocument()
    expect(screen.getByTestId('view-week')).toBeInTheDocument()
    expect(screen.getByTestId('view-month')).toBeInTheDocument()
    expect(screen.getByTestId('view-schedule')).toBeInTheDocument()
  })

  it('highlights the active week view', () => {
    render(<Header />)
    const weekBtn = screen.getByTestId('view-week')
    expect(weekBtn.className).toContain('bg-[var(--color-accent)]')
  })

  it('highlights day view when on day route', () => {
    mockRouterState.mockReturnValue('/day/2026-04-03')
    render(<Header />)
    const dayBtn = screen.getByTestId('view-day')
    expect(dayBtn.className).toContain('bg-[var(--color-accent)]')
    const weekBtn = screen.getByTestId('view-week')
    expect(weekBtn.className).not.toContain('bg-[var(--color-accent)]')
  })

  it('renders Dev Calendar title', () => {
    render(<Header />)
    expect(screen.getByText('Dev Calendar')).toBeInTheDocument()
  })

  it('renders prev/next navigation buttons', () => {
    render(<Header />)
    expect(screen.getByTestId('nav-prev')).toBeInTheDocument()
    expect(screen.getByTestId('nav-next')).toBeInTheDocument()
  })

  it('shows date label', () => {
    render(<Header />)
    expect(screen.getByTestId('date-label')).toBeInTheDocument()
  })

  it('hides prev/next on schedule view', () => {
    mockRouterState.mockReturnValue('/schedule')
    render(<Header />)
    expect(screen.queryByTestId('nav-prev')).not.toBeInTheDocument()
    expect(screen.queryByTestId('nav-next')).not.toBeInTheDocument()
  })

  it('shows "Schedule" as date label on schedule view', () => {
    mockRouterState.mockReturnValue('/schedule')
    render(<Header />)
    expect(screen.getByTestId('date-label')).toHaveTextContent('Schedule')
  })
})
