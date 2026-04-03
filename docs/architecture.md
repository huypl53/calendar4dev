# Architecture

## Monorepo Structure

pnpm workspace with 3 packages under `packages/`:

- **@dev-calendar/shared** — Zod schemas, TypeScript types, constants. Imported by both api and web. Never import between api and web directly.
- **@dev-calendar/api** — Hono REST API running on Node.js. In production, serves the built web SPA as static files.
- **@dev-calendar/web** — React SPA with Vite + SWC + Tailwind CSS v4. In dev, proxies `/api` to the Hono dev server.

## Build Order

`shared` must build first (types/schemas), then `web` (produces static assets), then `api` (compiles server code). The root `pnpm build` script enforces this order.

## Environment Validation

`packages/api/src/env.ts` uses Zod to validate environment variables at startup. If validation fails, the process exits with a clear error listing each invalid variable. This is the single source of truth for env config.

## Docker

- **Production** (`docker compose up`): Multi-stage Dockerfile builds all packages, then produces a slim Node.js Alpine image. The API serves the web SPA as static files on port 3000.
- **Development** (`docker compose -f docker-compose.dev.yml up`): Only starts PostgreSQL on localhost:5432. Developers run `pnpm dev` for hot reload.

## CI/CD

- **ci.yml**: Runs lint + typecheck + test on PRs to main
- **release.yml**: Builds and pushes Docker image to ghcr.io on merge to main, tagged with git SHA + latest

## Database Schema (Story 1-2)

Drizzle ORM with PostgreSQL (postgres.js driver). Uses `casing: 'snake_case'` in both `drizzle()` client and `drizzle.config.ts` so JS camelCase maps to DB snake_case automatically.

- **Primary keys**: All tables use `varchar(128)` with `$defaultFn(() => createId())` from `@paralleldrive/cuid2`
- **Tables**: users, sessions, calendars, calendar_members, events, event_exceptions
- **Full-text search**: events table has a `tsvector` generated column with GIN index for weighted search on title (A) + description (B) + location (C)
- **Enum single source of truth**: VALUE arrays exported from `@dev-calendar/shared` (e.g., `EVENT_TYPE_VALUES`), imported by both Zod schemas and Drizzle `pgEnum()` definitions
- **drizzle-zod**: `createInsertSchema`/`createSelectSchema` in `packages/api/src/db/schema/zod.ts` for DB-layer validation
- **Migrations**: `drizzle-kit generate` with `casing: 'snake_case'`; runner uses `import.meta.url` for cwd-independent path resolution. Dockerfile copies migrations to `dist/db/migrations/`
- **`$onUpdate(() => new Date())`** is ORM-level only (not a DB trigger) — intentional per architecture

## API Scaffold (Story 1-3)

- **Framework**: `OpenAPIHono` from `@hono/zod-openapi` (v0.x — v1.x requires Zod 4)
- **Middleware chain** (order matters): pino request logger → CORS → rate limiter (on `/api/*`)
- **Error handling**: `AppError` base class with subclasses (`ValidationError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409). All errors return `{ error: { code, message, details? } }`
- **Logging**: pino with `LOG_LEVEL` env var; pino-pretty in dev, raw JSON in prod. Request logs include method, path, status, duration
- **Rate limiting**: `hono-rate-limiter` with in-memory store — 100 req/min on `/api/*`, 10 req/min on auth endpoints
- **CORS**: Hono built-in `cors()` with `CORS_ORIGIN` env var (defaults to `*`, supports comma-separated origins)
- **Health check**: `GET /healthz` — queries `SELECT 1` via Drizzle, returns `{ status, db, uptime }` (200 healthy / 503 unhealthy). Excluded from rate limiting
- **OpenAPI docs**: Spec at `/api/openapi.json`, Scalar UI at `/api/docs`
- **Route organization**: Domain-grouped files under `packages/api/src/routes/`, barrel mount in `routes/index.ts`
- **Startup sequence**: validate env → run migrations → register middleware → mount routes → serve
- **Vitest config**: `packages/api/vitest.config.ts` provides `DATABASE_URL`, `NODE_ENV=test`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` to avoid env validation failures in tests

## Authentication (Story 1-4)

- **Library**: Better Auth v1.5.x with Drizzle adapter at `better-auth/adapters/drizzle`
- **Server config**: `packages/api/src/auth/config.ts` — betterAuth instance with email/password + conditional GitHub OAuth
- **Route handler**: Mounted at `app.on(['POST', 'GET'], '/api/auth/**', ...)` in `app.ts` after CORS but before route mounting. All auth endpoints handled by Better Auth
- **Auth middleware**: `packages/api/src/auth/middleware.ts` — `requireAuth` middleware on `/api/*` with public path exclusions for `/api/auth/*`, `/healthz`, `/api/openapi.json`, `/api/docs`
- **Schema**: Users table adapted (passwordHash removed, emailVerified/image added). Sessions table adapted (ipAddress/userAgent/updatedAt added). New tables: accounts (OAuth + password data), verifications (email tokens)
- **Frontend client**: `packages/web/src/lib/auth-client.ts` using `createAuthClient` from `better-auth/react`
- **Login page**: `packages/web/src/pages/login.tsx` — GitHub OAuth button, email/password form, sign-up toggle
- **Routing**: TanStack Router with code-based route tree. Root layout with devtools, public `/login`, authenticated layout with `beforeLoad` guard that checks session
- **Environment**: `BETTER_AUTH_SECRET` (required, min 32 chars), `BETTER_AUTH_URL` (required), `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` (optional — omit to disable GitHub OAuth)
- **drizzle-kit note**: `drizzle-kit generate` requires TTY for column rename prompts. Use `--custom` flag for non-interactive environments and write migration SQL manually
- **TanStack Router note**: `createFileRoute` requires file-based code generation tooling. For code-based routing, use `createRoute` with `getParentRoute` + manual route tree assembly in `route-tree.ts`
- **Web tsconfig**: `declaration: false` / `declarationMap: false` required because better-auth's inferred types reference internal modules not portable for declaration emit (only affects library builds, not Vite apps)

## Frontend Shell (Story 1-5)

- **AppShell layout**: CSS Grid with `grid-template-rows: 48px 1fr 28px` and `grid-template-columns: ${sidebarOpen ? '240px' : '0px'} 1fr`. Header and StatusBar span full width via `col-span-full`. Sidebar occupies column 1, main content column 2
- **Layout components**: `packages/web/src/layouts/` — `app-shell.tsx` (grid wrapper), `header.tsx` (48px, hamburger + title + view switcher), `sidebar.tsx` (240px, overflow-hidden when collapsed), `status-bar.tsx` (28px, time + sync status)
- **Sidebar state**: `useUIStore.sidebarOpen` (default false) controls sidebar column width. Header hamburger calls `useUIStore.getState().toggleSidebar()`
- **ErrorBoundary**: Class component at `packages/web/src/components/error-boundary.tsx` with `getDerivedStateFromError` + `componentDidCatch`. Fallback renders "Something went wrong" with "Return to today" link to `/week/{ISO date}`
- **Testing setup**: `vitest.config.ts` with jsdom environment and `@testing-library/react` + `@testing-library/jest-dom`. Setup file at `src/test-setup.ts` imports `@testing-library/jest-dom/vitest` for matchers. Tests must call `cleanup()` in `afterEach` since automatic cleanup requires global config

## Key Decisions

- **Tailwind CSS v4**: Uses CSS-first config with `@import "tailwindcss"` — no `tailwind.config.js` needed
- **TypeScript strict mode**: Shared `tsconfig.base.json` with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- **Vitest**: Co-located tests (e.g., `env.test.ts` next to `env.ts`), configured per-package
- **pnpm workspace**: `onlyBuiltDependencies` in pnpm-workspace.yaml whitelists `@swc/core` and `esbuild` for native builds
