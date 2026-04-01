import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { sql } from 'drizzle-orm'
import { db } from '../db/client.js'

const healthySchema = z.object({
  status: z.literal('healthy'),
  db: z.literal('connected'),
  uptime: z.number(),
})

const unhealthySchema = z.object({
  status: z.literal('unhealthy'),
  db: z.literal('disconnected'),
  error: z.string(),
})

const healthRoute = createRoute({
  method: 'get',
  path: '/healthz',
  tags: ['System'],
  summary: 'Health check',
  responses: {
    200: {
      content: { 'application/json': { schema: healthySchema } },
      description: 'Service is healthy',
    },
    503: {
      content: { 'application/json': { schema: unhealthySchema } },
      description: 'Service is unhealthy',
    },
  },
})

const app = new OpenAPIHono()

app.openapi(healthRoute, async (c) => {
  try {
    await db.execute(sql`SELECT 1`)
    return c.json({
      status: 'healthy' as const,
      db: 'connected' as const,
      uptime: process.uptime(),
    }, 200)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return c.json({
      status: 'unhealthy' as const,
      db: 'disconnected' as const,
      error: message,
    }, 503)
  }
})

export default app
