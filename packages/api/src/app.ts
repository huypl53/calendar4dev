import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { requestLogger } from './middleware/logger.js'
import { corsMiddleware } from './middleware/cors.js'
import { defaultLimiter } from './middleware/rate-limiter.js'
import { errorHandler } from './middleware/error-handler.js'
import { mountRoutes } from './routes/index.js'

export const app = new OpenAPIHono()

app.onError(errorHandler)

// Global middleware
app.use(requestLogger)
app.use(corsMiddleware)
app.use('/api/*', defaultLimiter)

// Mount routes
mountRoutes(app)

// OpenAPI spec + docs
app.doc('/api/openapi.json', {
  openapi: '3.0.0',
  info: { title: 'Dev Calendar API', version: '0.1.0' },
})

app.get('/api/docs', apiReference({ url: '/api/openapi.json' }))
