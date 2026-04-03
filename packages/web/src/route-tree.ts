import { rootRoute } from './routes/__root.js'
import { loginRoute } from './routes/login.js'
import { authenticatedRoute } from './routes/_authenticated.js'
import { authenticatedIndexRoute } from './routes/_authenticated/index.js'

export const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    authenticatedIndexRoute,
  ]),
])
