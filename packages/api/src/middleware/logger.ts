import { createRequire } from 'node:module'
import pino from 'pino'
import { createMiddleware } from 'hono/factory'
import { env } from '../env.js'

function getTransport() {
  if (env.NODE_ENV !== 'development') return undefined
  try {
    createRequire(import.meta.url).resolve('pino-pretty')
    return { target: 'pino-pretty', options: { colorize: true } }
  } catch {
    return undefined
  }
}

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: getTransport(),
})

export const requestLogger = createMiddleware(async (c, next) => {
  const start = Date.now()
  try {
    await next()
  } finally {
    const duration = Date.now() - start
    logger.info({
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration,
    }, `${c.req.method} ${c.req.path}`)
  }
})
