import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root.js'
import { LoginPage } from '../pages/login.js'

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})
