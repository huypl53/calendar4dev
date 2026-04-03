import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router'
import { WeekView } from './week-view.js'

vi.mock('../../../lib/api-client.js', () => ({
  eventsApi: { list: vi.fn().mockResolvedValue([]) },
  calendarsApi: { list: vi.fn().mockResolvedValue([]) },
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderWithRouter(date: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
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

  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(RouterProvider, { router })),
  )
}

describe('WeekView', () => {
  it('renders the week view container', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('week-view')).toBeInTheDocument()
  })

  it('renders the week header with day columns', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('week-header')).toBeInTheDocument()
  })

  it('renders the time gutter', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('time-gutter')).toBeInTheDocument()
  })

  it('renders the time grid', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('time-grid')).toBeInTheDocument()
  })

  it('renders a scrollable container', async () => {
    renderWithRouter('2026-04-01')
    expect(await screen.findByTestId('week-scroll-container')).toBeInTheDocument()
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
    const scrollContainer = await screen.findByTestId('week-scroll-container')
    // 8 hours × 48px = 384
    expect(scrollContainer.scrollTop).toBe(384)
  })
})
