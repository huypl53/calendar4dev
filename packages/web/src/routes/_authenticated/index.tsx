import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated.js'

export const authenticatedIndexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: () => (
    <div className="flex h-screen items-center justify-center bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-sans)]">
          Dev Calendar
        </h1>
        <p className="mt-2 text-sm opacity-60 font-[family-name:var(--font-mono)]">
          Calendar views coming in story 1.5
        </p>
      </div>
    </div>
  ),
})
