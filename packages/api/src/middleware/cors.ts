import { cors } from 'hono/cors'
import { env } from '../env.js'

const isWildcard = env.CORS_ORIGIN === '*'

export const corsMiddleware = cors({
  origin: isWildcard ? '*' : env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean),
  credentials: !isWildcard,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
})
