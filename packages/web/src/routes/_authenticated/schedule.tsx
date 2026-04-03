import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated.js'

export const scheduleRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/schedule',
  component: lazyRouteComponent(
    () => import('../../features/views/index.js'),
    'ScheduleView',
  ),
})
