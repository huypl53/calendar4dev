import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the auth client before importing the route
vi.mock('../../lib/auth-client.js', () => ({
  authClient: {
    getSession: vi.fn().mockResolvedValue({ data: { user: { id: '1' } } }),
  },
}))

describe('authenticated index route redirect', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-03'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('redirects to /week/$date with today ISO date', async () => {
    const { authenticatedIndexRoute } = await import('./index.js')

    const opts = authenticatedIndexRoute.options as { beforeLoad?: () => void }

    expect(opts.beforeLoad).toBeDefined()

    try {
      opts.beforeLoad!()
      expect.fail('Expected redirect to be thrown')
    } catch (err: any) {
      // TanStack Router's redirect() returns a Response with an options property
      expect(err.options).toMatchObject({
        to: '/week/$date',
        params: { date: '2026-04-03' },
      })
    }
  })

  it('uses current date for redirect', async () => {
    vi.setSystemTime(new Date('2025-01-15'))

    vi.resetModules()
    vi.mock('../../lib/auth-client.js', () => ({
      authClient: {
        getSession: vi.fn().mockResolvedValue({ data: { user: { id: '1' } } }),
      },
    }))
    const { authenticatedIndexRoute } = await import('./index.js')

    const opts = authenticatedIndexRoute.options as { beforeLoad?: () => void }

    try {
      opts.beforeLoad!()
      expect.fail('Expected redirect to be thrown')
    } catch (err: any) {
      expect(err.options).toMatchObject({
        to: '/week/$date',
        params: { date: '2025-01-15' },
      })
    }
  })
})
