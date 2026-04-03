import { createRoute, redirect } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated.js'

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export const authenticatedIndexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/week/$date', params: { date: getTodayISO() } })
  },
})
