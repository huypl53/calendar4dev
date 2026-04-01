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
- **Vitest config**: `packages/api/vitest.config.ts` provides `DATABASE_URL` and `NODE_ENV=test` to avoid env validation failures in tests

## Key Decisions

- **Tailwind CSS v4**: Uses CSS-first config with `@import "tailwindcss"` — no `tailwind.config.js` needed
- **TypeScript strict mode**: Shared `tsconfig.base.json` with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- **Vitest**: Co-located tests (e.g., `env.test.ts` next to `env.ts`), configured per-package
- **pnpm workspace**: `onlyBuiltDependencies` in pnpm-workspace.yaml whitelists `@swc/core` and `esbuild` for native builds
