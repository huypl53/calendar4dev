import type { MiddlewareHandler } from 'hono'
import { auth } from './config.js'

const PUBLIC_PREFIXES = ['/api/auth/']
const PUBLIC_EXACT = ['/api/openapi.json', '/api/docs']

function isPublicPath(path: string): boolean {
  return PUBLIC_EXACT.includes(path) || PUBLIC_PREFIXES.some(p => path.startsWith(p))
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  if (isPublicPath(c.req.path)) {
    return next()
  }

  let session
  try {
    session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })
  } catch {
    return c.json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    }, 401)
  }

  if (!session) {
    return c.json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    }, 401)
  }

  c.set('user', session.user)
  c.set('session', session.session)
  await next()
}
