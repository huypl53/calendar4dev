import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated.js'
import { getTodayDate, isValidDateParam } from '../../lib/date-utils.js'

export const dayRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/day/$date',
  beforeLoad: ({ params }) => {
    if (!isValidDateParam(params.date)) {
      throw redirect({ to: '/day/$date', params: { date: getTodayDate() } })
    }
  },
  component: lazyRouteComponent(
    () => import('../../features/views/components/day-view.js'),
    'DayView',
  ),
})
