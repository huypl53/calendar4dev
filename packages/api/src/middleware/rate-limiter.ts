import type { Context } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'

function getClientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]!.trim()
  }
  return c.req.header('x-real-ip') ?? 'unknown'
}

export const defaultLimiter = rateLimiter({
  windowMs: 60_000,
  limit: 100,
  keyGenerator: getClientIp,
})

export const authLimiter = rateLimiter({
  windowMs: 60_000,
  limit: 10,
  keyGenerator: getClientIp,
})
