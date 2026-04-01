import type { OpenAPIHono } from '@hono/zod-openapi'
import healthApp from './health.js'

export function mountRoutes(app: OpenAPIHono) {
  app.route('/', healthApp)
}
