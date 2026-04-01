import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { env } from './env.js'
import { app } from './app.js'

if (env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './web-dist' }))
}

const port = env.NODE_ENV === 'production' ? env.PORT : env.API_PORT

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`)
})
