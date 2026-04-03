import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated.js'

export const dayRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/day/$date',
  component: lazyRouteComponent(
    () => import('../../features/views/index.js'),
    'DayView',
  ),
})
