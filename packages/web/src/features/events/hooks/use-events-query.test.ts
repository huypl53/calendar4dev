import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import { useEventsQuery } from './use-events-query.js'

vi.mock('../../../lib/api-client.js', () => ({
  eventsApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}))

afterEach(() => {
  cleanup()
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useEventsQuery', () => {
  it('returns empty array when date range is provided', async () => {
    const wrapper = createWrapper()

    const { result } = renderHook(
      () => useEventsQuery({ calendarId: 'cal-1', startDate: '2026-04-01', endDate: '2026-04-07' }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('is disabled when startDate and endDate are missing', () => {
    const wrapper = createWrapper()

    const { result } = renderHook(
      () => useEventsQuery({ calendarId: 'cal-1' }),
      { wrapper },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.isLoading).toBe(false)
  })

  it('uses correct query key', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const params = { calendarId: 'cal-42', startDate: '2026-04-01', endDate: '2026-04-07' }
    renderHook(() => useEventsQuery(params), { wrapper })

    await waitFor(() => {
      const queries = queryClient.getQueryCache().findAll()
      expect(queries).toHaveLength(1)
      expect(queries[0]!.queryKey).toEqual(['events', params])
    })
  })
})
