import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { sql } from 'drizzle-orm'
import { db } from '../db/client.js'
import { logger } from '../middleware/logger.js'

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

const DB_HEALTH_TIMEOUT_MS = 3000

app.openapi(healthRoute, async (c) => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('DB health check timed out')), DB_HEALTH_TIMEOUT_MS),
  )

  try {
    await Promise.race([db.execute(sql`SELECT 1`), timeout])
    return c.json({
      status: 'healthy' as const,
      db: 'connected' as const,
      uptime: process.uptime(),
    }, 200)
  } catch (err) {
    logger.error({ err }, 'Health check DB query failed')
    return c.json({
      status: 'unhealthy' as const,
      db: 'disconnected' as const,
      error: 'Database connection failed',
    }, 503)
  }
})

export default app
