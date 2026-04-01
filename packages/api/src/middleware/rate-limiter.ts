import { rateLimiter } from 'hono-rate-limiter'

export const defaultLimiter = rateLimiter({
  windowMs: 60_000,
  limit: 100,
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
})

export const authLimiter = rateLimiter({
  windowMs: 60_000,
  limit: 10,
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
})
