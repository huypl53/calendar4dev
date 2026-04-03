import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router'
import { MonthView } from './month-view.js'

afterEach(() => cleanup())

function renderWithRouter(date: string) {
  const rootRoute = createRootRoute()
  const monthRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/month/$date',
    component: MonthView,
  })
  const routeTree = rootRoute.addChildren([monthRoute])

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [`/month/${date}`] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('MonthView', () => {
  it('renders the month view container', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('month-view')).toBeInTheDocument()
  })

  it('shows month and year title', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('month-title')).toHaveTextContent('April 2026')
  })

  it('renders the month grid', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('month-grid')).toBeInTheDocument()
  })

  it('shows correct title for different month', async () => {
    renderWithRouter('2026-12-15')
    expect(await screen.findByTestId('month-title')).toHaveTextContent('December 2026')
  })
})
