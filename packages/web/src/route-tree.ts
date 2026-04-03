import { rootRoute } from './routes/__root.js'
import { loginRoute } from './routes/login.js'
import { authenticatedRoute } from './routes/_authenticated.js'
import { authenticatedIndexRoute } from './routes/_authenticated/index.js'
import { dayRoute } from './routes/_authenticated/day.$date.js'
import { weekRoute } from './routes/_authenticated/week.$date.js'
import { monthRoute } from './routes/_authenticated/month.$date.js'
import { scheduleRoute } from './routes/_authenticated/schedule.js'

export const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    authenticatedIndexRoute,
    dayRoute,
    weekRoute,
    monthRoute,
    scheduleRoute,
  ]),
])
