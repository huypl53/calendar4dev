import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated.js'
import { getTodayDate, isValidDateParam } from '../../lib/date-utils.js'

export const weekRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/week/$date',
  beforeLoad: ({ params }) => {
    if (!isValidDateParam(params.date)) {
      throw redirect({ to: '/week/$date', params: { date: getTodayDate() } })
    }
  },
  component: lazyRouteComponent(
    () => import('../../features/views/components/week-view.js'),
    'WeekView',
  ),
})
