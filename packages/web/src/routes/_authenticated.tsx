import { createRoute, Outlet, redirect } from '@tanstack/react-router'
import { rootRoute } from './__root.js'
import { authClient } from '../lib/auth-client.js'
import { AppShell } from '../layouts/app-shell.js'
import { ErrorBoundary } from '../components/error-boundary.js'

export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: async () => {
    try {
      const session = await authClient.getSession()
      if (!session.data) {
        throw redirect({ to: '/login' })
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'to' in err) throw err
      throw redirect({ to: '/login' })
    }
  },
  component: () => (
    <AppShell>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </AppShell>
  ),
})
