import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated.js'

export const weekRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/week/$date',
  component: lazyRouteComponent(
    () => import('../../features/views/index.js'),
    'WeekView',
  ),
})
