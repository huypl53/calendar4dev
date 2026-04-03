import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import { useEventsQuery } from './use-events-query.js'

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
  it('returns empty array when calendarId is provided', async () => {
    const wrapper = createWrapper()

    const { result } = renderHook(() => useEventsQuery('cal-1'), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('is disabled when calendarId is undefined', () => {
    const wrapper = createWrapper()

    const { result } = renderHook(() => useEventsQuery(), { wrapper })

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

    renderHook(() => useEventsQuery('cal-42'), { wrapper })

    await waitFor(() => {
      const queries = queryClient.getQueryCache().findAll()
      expect(queries).toHaveLength(1)
      expect(queries[0]!.queryKey).toEqual(['events', { calendarId: 'cal-42' }])
    })
  })
})
