import { describe, it, expect, vi } from 'vitest'

vi.mock('./db/client.js', () => ({
  db: {
    execute: vi.fn().mockResolvedValue([]),
  },
}))

import { app } from './app.js'

describe('app', () => {
  it('serves healthz route', async () => {
    const res = await app.request('/healthz')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('healthy')
  })

  it('serves OpenAPI spec at /api/openapi.json', async () => {
    const res = await app.request('/api/openapi.json')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.openapi).toBe('3.0.0')
    expect(body.info.title).toBe('Dev Calendar API')
  })

  it('serves Scalar docs at /api/docs', async () => {
    const res = await app.request('/api/docs')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('scalar')
  })

  it('returns error response for unknown routes', async () => {
    const res = await app.request('/api/nonexistent')
    expect(res.status).toBe(404)
  })

  it('includes CORS headers', async () => {
    const res = await app.request('/healthz', {
      method: 'GET',
      headers: { Origin: 'http://localhost:5173' },
    })
    expect(res.headers.get('access-control-allow-origin')).toBeTruthy()
  })
})
