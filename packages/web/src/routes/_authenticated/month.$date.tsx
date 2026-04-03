import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated.js'
import { getTodayDate, isValidDateParam } from '../../lib/date-utils.js'

export const monthRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/month/$date',
  beforeLoad: ({ params }) => {
    if (!isValidDateParam(params.date)) {
      throw redirect({ to: '/month/$date', params: { date: getTodayDate() } })
    }
  },
  component: lazyRouteComponent(
    () => import('../../features/views/components/month-view.js'),
    'MonthView',
  ),
})
