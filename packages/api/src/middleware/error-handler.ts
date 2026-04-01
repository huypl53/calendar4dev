import type { ErrorHandler } from 'hono'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors.js'
import { logger } from './logger.js'

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = { code: err.code, message: err.message }
    if (err.details) body.details = err.details
    return c.json({ error: body }, err.statusCode as 400)
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))
    return c.json({
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
    }, 400)
  }

  logger.error({ err }, 'Unhandled error')
  return c.json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  }, 500)
}
