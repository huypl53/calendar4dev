import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router'
import { WeekView } from './week-view.js'

afterEach(() => {
  cleanup()
})

function renderWithRouter(date: string) {
  const rootRoute = createRootRoute()
  const weekRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/week/$date',
    component: WeekView,
  })
  const routeTree = rootRoute.addChildren([weekRoute])

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [`/week/${date}`] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('WeekView', () => {
  it('renders with date from route param', async () => {
    renderWithRouter('2026-04-03')

    expect(await screen.findByText(/Week View/)).toBeInTheDocument()
    expect(await screen.findByText(/2026-04-03/)).toBeInTheDocument()
  })

  it('renders with a different date param', async () => {
    renderWithRouter('2025-12-25')

    expect(await screen.findByText(/Week View/)).toBeInTheDocument()
    expect(await screen.findByText(/2025-12-25/)).toBeInTheDocument()
  })
})
