import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

const mockGetSession = vi.fn()

vi.mock('./config.js', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}))

import { requireAuth } from './middleware.js'

function createApp() {
  const app = new Hono()
  app.use('/api/*', requireAuth)
  app.get('/api/openapi.json', (c) => c.json({ openapi: '3.0.0' }))
  app.get('/api/docs', (c) => c.text('docs'))
  app.get('/api/docs-admin', (c) => c.text('admin'))
  app.get('/api/auth/get-session', (c) => c.json({ session: true }))
  app.get('/api/protected', (c) => c.json({ data: 'secret' }))
  return app
}

describe('requireAuth middleware', () => {
  beforeEach(() => {
    mockGetSession.mockReset()
  })

  it('returns 401 with standard error shape for unauthenticated requests', async () => {
    mockGetSession.mockResolvedValue(null)
    const app = createApp()
    const res = await app.request('/api/protected')
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  })

  it('passes through authenticated requests', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    })
    const app = createApp()
    const res = await app.request('/api/protected')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toBe('secret')
  })

  it('returns 401 when getSession throws', async () => {
    mockGetSession.mockRejectedValue(new Error('DB connection failed'))
    const app = createApp()
    const res = await app.request('/api/protected')
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('blocks /api/docs-admin (not an exact public path match)', async () => {
    mockGetSession.mockResolvedValue(null)
    const app = createApp()
    const res = await app.request('/api/docs-admin')
    expect(res.status).toBe(401)
  })

  it('allows /api/openapi.json without auth', async () => {
    mockGetSession.mockResolvedValue(null)
    const app = createApp()
    const res = await app.request('/api/openapi.json')
    expect(res.status).toBe(200)
  })

  it('allows /api/docs without auth', async () => {
    mockGetSession.mockResolvedValue(null)
    const app = createApp()
    const res = await app.request('/api/docs')
    expect(res.status).toBe(200)
  })

  it('allows /api/auth/* without auth', async () => {
    mockGetSession.mockResolvedValue(null)
    const app = createApp()
    const res = await app.request('/api/auth/get-session')
    expect(res.status).toBe(200)
  })
})
