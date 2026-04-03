import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { env } from './env.js'
import { logger } from './middleware/logger.js'
import { app } from './app.js'
import { runMigrations } from './db/migrate.js'

try {
  await runMigrations()
} catch (err) {
  logger.fatal({ err }, 'Migration failed')
  process.exit(1)
}

if (env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './web-dist' }))
}

const port = env.NODE_ENV === 'production' ? env.PORT : env.API_PORT

serve({ fetch: app.fetch, port }, (info) => {
  logger.info({ port: info.port, env: env.NODE_ENV, logLevel: env.LOG_LEVEL }, 'Server started')
})
