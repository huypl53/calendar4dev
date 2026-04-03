import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated.js'

export const monthRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/month/$date',
  component: lazyRouteComponent(
    () => import('../../features/views/index.js'),
    'MonthView',
  ),
})
