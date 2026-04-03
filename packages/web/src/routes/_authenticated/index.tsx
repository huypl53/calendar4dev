import { createRoute, redirect } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated.js'
import { getTodayDate } from '../../lib/date-utils.js'

export const authenticatedIndexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/week/$date', params: { date: getTodayDate() } })
  },
})
