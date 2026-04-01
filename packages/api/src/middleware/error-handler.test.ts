import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import { ZodError, z } from 'zod'
import { errorHandler } from './error-handler.js'
import { AppError, ValidationError, NotFoundError } from '../lib/errors.js'

function createTestApp() {
  const app = new Hono()
  app.onError(errorHandler)
  return app
}

describe('errorHandler', () => {
  it('handles AppError with correct code and status', async () => {
    const app = createTestApp()
    app.get('/test', () => { throw new AppError('broke', 'CUSTOM', 418) })

    const res = await app.request('/test')
    expect(res.status).toBe(418)
    const body = await res.json()
    expect(body).toEqual({
      error: { code: 'CUSTOM', message: 'broke' },
    })
  })

  it('handles ValidationError with details', async () => {
    const app = createTestApp()
    const details = [{ field: 'title', message: 'required' }]
    app.get('/test', () => { throw new ValidationError('invalid', details) })

    const res = await app.request('/test')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      error: { code: 'VALIDATION_ERROR', message: 'invalid', details },
    })
  })

  it('handles NotFoundError', async () => {
    const app = createTestApp()
    app.get('/test', () => { throw new NotFoundError('missing') })

    const res = await app.request('/test')
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toEqual({
      error: { code: 'NOT_FOUND', message: 'missing' },
    })
  })

  it('handles ZodError as 400 with field details', async () => {
    const app = createTestApp()
    app.get('/test', () => {
      z.object({ title: z.string().min(1) }).parse({ title: '' })
    })

    const res = await app.request('/test')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.details).toBeDefined()
    expect(body.error.details.length).toBeGreaterThan(0)
  })

  it('handles unknown errors as 500', async () => {
    const app = createTestApp()
    app.get('/test', () => { throw new Error('unexpected') })

    const res = await app.request('/test')
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    })
  })
})
