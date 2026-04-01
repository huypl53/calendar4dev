import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../db/client.js', () => ({
  db: {
    execute: vi.fn(),
  },
}))

import { db } from '../db/client.js'
import healthApp from './health.js'

const mockExecute = vi.mocked(db.execute)

describe('GET /healthz', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with healthy status when DB is connected', async () => {
    mockExecute.mockResolvedValueOnce([] as never)

    const res = await healthApp.request('/healthz')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('healthy')
    expect(body.db).toBe('connected')
    expect(typeof body.uptime).toBe('number')
  })

  it('returns 503 with unhealthy status when DB is down', async () => {
    mockExecute.mockRejectedValueOnce(new Error('connection refused'))

    const res = await healthApp.request('/healthz')
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.status).toBe('unhealthy')
    expect(body.db).toBe('disconnected')
    expect(body.error).toBe('connection refused')
  })
})
