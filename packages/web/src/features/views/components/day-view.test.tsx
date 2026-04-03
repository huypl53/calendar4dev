import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router'
import { DayView } from './day-view.js'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderWithRouter(date: string) {
  const rootRoute = createRootRoute()
  const dayRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/day/$date',
    component: DayView,
  })
  const routeTree = rootRoute.addChildren([dayRoute])

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [`/day/${date}`] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('DayView', () => {
  it('renders the day view container', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('day-view')).toBeInTheDocument()
  })

  it('renders the day header', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('day-header')).toBeInTheDocument()
  })

  it('renders the time gutter', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('time-gutter')).toBeInTheDocument()
  })

  it('renders the time grid with 1 column', async () => {
    renderWithRouter('2026-04-01')
    const grid = await screen.findByTestId('time-grid')
    expect(grid.style.gridTemplateColumns).toBe('repeat(1, 1fr)')
  })

  it('renders a scrollable container', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('day-scroll-container')).toBeInTheDocument()
  })

  it('auto-scrolls to 8 AM on mount', async () => {
    const original = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const style = original(el)
      return {
        ...style,
        getPropertyValue: (prop: string) => {
          if (prop === '--density-row-height') return '48'
          return style.getPropertyValue(prop)
        },
      } as CSSStyleDeclaration
    })

    renderWithRouter('2026-04-01')
    const scrollContainer = await screen.findByTestId('day-scroll-container')
    expect(scrollContainer.scrollTop).toBe(384)
  })
})
