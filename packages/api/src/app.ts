import { Hono } from 'hono'
import { logger } from 'hono/logger'
import type { ApiResponse } from '@dev-calendar/shared'

export const app = new Hono()

app.use(logger())

app.get('/api/health', (c) => {
  return c.json<ApiResponse<{ status: string }>>({
    data: { status: 'ok' },
  })
})
