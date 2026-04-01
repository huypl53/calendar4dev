import pino from 'pino'
import { createMiddleware } from 'hono/factory'
import { env } from '../env.js'

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
})

export const requestLogger = createMiddleware(async (c, next) => {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  logger.info({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
  }, `${c.req.method} ${c.req.path}`)
})
