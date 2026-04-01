import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { env } from './env.js'
import { app } from './app.js'
import { runMigrations } from './db/migrate.js'

if (env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './web-dist' }))
}

const port = env.NODE_ENV === 'production' ? env.PORT : env.API_PORT

await runMigrations()

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`)
})
