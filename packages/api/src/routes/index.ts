import type { OpenAPIHono } from '@hono/zod-openapi'
import healthApp from './health.js'
import eventsApp from './events.js'
import calendarsApp from './calendars.js'
import calendarMembersApp from './calendar-members.js'
import userApp from './user.js'
import icalApp from './ical.js'

export function mountRoutes(app: OpenAPIHono) {
  app.route('/', healthApp)
  app.route('/', eventsApp)
  app.route('/', calendarsApp)
  app.route('/', calendarMembersApp)
  app.route('/', userApp)
  app.route('/', icalApp)
}
