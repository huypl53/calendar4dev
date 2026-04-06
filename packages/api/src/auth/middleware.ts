import type { MiddlewareHandler } from 'hono'
import { supabaseAdmin } from '../lib/supabase.js'

const PUBLIC_PREFIXES = ['/api/auth/', '/api/ical/']
const PUBLIC_EXACT = ['/api/openapi.json', '/api/docs']

function isPublicPath(path: string): boolean {
  return PUBLIC_EXACT.includes(path) || PUBLIC_PREFIXES.some(p => path.startsWith(p))
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  if (isPublicPath(c.req.path)) {
    return next()
  }

  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return c.json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    }, 401)
  }

  let user
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) {
      return c.json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }, 401)
    }
    user = data.user
  } catch {
    return c.json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    }, 401)
  }

  c.set('user', user)
  await next()
}
