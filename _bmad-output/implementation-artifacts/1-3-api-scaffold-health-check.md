# Story 1.3: API Scaffold & Health Check

Status: done

## Story

As an admin,
I want the API server operational with health monitoring, structured logging, and error handling,
so that the backend is production-ready for route development.

## Acceptance Criteria

1. The API uses `@hono/zod-openapi` for route definitions; all routes are typed with Zod schemas for request/response validation
2. A health check endpoint at `GET /healthz` returns `{ status: "healthy", db: "connected", uptime: <seconds> }` with HTTP 200 when DB is reachable, or `{ status: "unhealthy", db: "disconnected", error: <message> }` with HTTP 503 when DB is down
3. All API requests are logged with pino in structured JSON format; log level is controlled by `LOG_LEVEL` env var
4. A global error handler middleware catches all unhandled errors and returns `{ error: { code: "<ERROR_CODE>", message: "<human readable>", details?: [...] } }` with appropriate HTTP status codes
5. Custom error classes exist: `AppError` (base), `ValidationError` (400), `NotFoundError` (404), `UnauthorizedError` (401), `ForbiddenError` (403), `ConflictError` (409)
6. Rate limiting is applied via `hono-rate-limiter` with in-memory store — default 100 req/min on `/api/*`, stricter 10 req/min on auth endpoints (future-proofed path)
7. CORS middleware is configured using Hono's built-in `cors()` — allows configurable origins via `CORS_ORIGIN` env var (defaults to `*` in dev)
8. OpenAPI spec is auto-generated from route definitions and served at `GET /api/docs` via Scalar UI
9. Routes are organized in domain-grouped files under `packages/api/src/routes/` with a barrel mount in `app.ts`
10. The app startup sequence is: validate env → run migrations → register middleware → mount routes → serve
11. All existing tests continue to pass; new tests cover health endpoint, error handler, and error classes
12. `CORS_ORIGIN` is added to env-schema.ts with a sensible default

## Tasks / Subtasks

- [x] Task 1: Install dependencies (AC: #1, #3, #6, #8)
  - [x] Add to packages/api dependencies: `@hono/zod-openapi@^0.19.10` (MUST use 0.x — v1.x requires Zod 4, project uses Zod 3), `hono-rate-limiter`, `unstorage` (peer dep of hono-rate-limiter), `pino`, `@scalar/hono-api-reference`
  - [x] Add to packages/api devDependencies: `pino-pretty` (for dev log formatting)
  - [x] Run `pnpm install` to update lockfile
- [x] Task 2: Add CORS_ORIGIN to env schema (AC: #7, #12)
  - [x] Add `CORS_ORIGIN` to `packages/api/src/env-schema.ts` — `z.string().default('*')`
  - [x] Add `CORS_ORIGIN=http://localhost:5173` to `.env.example`
- [x] Task 3: Create custom error classes (AC: #5)
  - [x] Create `packages/api/src/lib/errors.ts` with `AppError` base class and subclasses
  - [x] Each error class: has `code` (string constant), `statusCode` (number), `message`, optional `details` array
  - [x] Create `packages/api/src/lib/errors.test.ts` testing all error classes
- [x] Task 4: Create pino logger (AC: #3)
  - [x] Create `packages/api/src/middleware/logger.ts` — pino instance configured with `LOG_LEVEL` from env
  - [x] Use `pino-pretty` transport in development, raw JSON in production
  - [x] Export `logger` instance for use across the app
  - [x] Create Hono middleware that logs request method, path, status, and duration
- [x] Task 5: Create error handler middleware (AC: #4)
  - [x] Create `packages/api/src/middleware/error-handler.ts` — Hono `onError` handler
  - [x] If error is `AppError` subclass: use its statusCode and code
  - [x] If error is Zod validation error: return 400 with `VALIDATION_ERROR` code and field-level details
  - [x] Otherwise: return 500 with `INTERNAL_ERROR` code, log full error with pino
  - [x] Create `packages/api/src/middleware/error-handler.test.ts`
- [x] Task 6: Create rate limiter middleware (AC: #6)
  - [x] Create `packages/api/src/middleware/rate-limiter.ts`
  - [x] Default limiter: 100 requests per 60 seconds per IP on `/api/*`
  - [x] Auth limiter: 10 requests per 60 seconds per IP (for future `/api/auth/*`)
  - [x] Use `keyGenerator` based on `c.req.header('x-forwarded-for')` or remote address
- [x] Task 7: Create CORS middleware (AC: #7)
  - [x] Create `packages/api/src/middleware/cors.ts` — wraps Hono's built-in `cors()` with `CORS_ORIGIN` from env
  - [x] Allow credentials, standard headers, and common methods
- [x] Task 8: Refactor app.ts to OpenAPI app with middleware chain (AC: #1, #8, #9, #10)
  - [x] Replace `new Hono()` with `new OpenAPIHono()` from `@hono/zod-openapi`
  - [x] Register middleware in order: pino logger → CORS → rate limiter
  - [x] Set `onError` to the global error handler
  - [x] Create `packages/api/src/routes/index.ts` barrel that mounts all route groups
  - [x] Move health route to `packages/api/src/routes/health.ts`
  - [x] Register OpenAPI doc endpoint with Scalar UI at `/api/docs`
  - [x] Register OpenAPI spec endpoint at `/api/openapi.json`
- [x] Task 9: Create health check route (AC: #2)
  - [x] Create `packages/api/src/routes/health.ts` using `createRoute` from `@hono/zod-openapi`
  - [x] Query `SELECT 1` against DB via Drizzle's `db.execute(sql'SELECT 1')` to verify connection
  - [x] Return uptime via `process.uptime()` in seconds
  - [x] Handle DB errors gracefully (return 503, don't crash)
  - [x] Exclude `/healthz` from rate limiting and auth (when auth is added)
- [x] Task 10: Update index.ts startup sequence (AC: #10)
  - [x] Import and call `runMigrations()` before `serve()` (from story 1.2's migrate.ts)
  - [x] Log startup banner with pino: port, environment, log level
  - [x] Handle migration failure gracefully (log error, exit with code 1)
- [x] Task 11: Tests and verification (AC: #11)
  - [x] Update existing `app.test.ts` for new app structure and `/healthz` route
  - [x] Test error handler: AppError → correct JSON, unknown error → 500, Zod error → 400
  - [x] Test health endpoint: mock db success → 200, mock db failure → 503
  - [x] `pnpm typecheck` passes across all packages
  - [x] `pnpm test` passes across all packages

### Review Findings

- [x] [Review][Decision] D1: CORS wildcard + `credentials: true` — Fixed: credentials disabled when origin is '*', auto-detect
- [x] [Review][Decision] D2: Health check error messages — Fixed: returns generic "Database connection failed", logs full error server-side
- [x] [Review][Patch] P1: Rate limiter — Fixed: parse first IP from x-forwarded-for, fallback to x-real-ip
- [x] [Review][Patch] P2: pino-pretty — Fixed: guarded with createRequire().resolve() try/catch
- [x] [Review][Patch] P3: CORS origin list — Fixed: .map(o => o.trim()).filter(Boolean) on split
- [x] [Review][Patch] P4: Type cast — Fixed: uses ContentfulStatusCode with range guard
- [x] [Review][Patch] P5: authLimiter — Fixed: mounted on /api/auth/* in app.ts
- [x] [Review][Patch] P6: requestLogger — Fixed: wrapped next() in try/finally
- [x] [Review][Defer] W1: Health check SELECT 1 has no timeout — can hang forever [routes/health.ts:38] — deferred, not in scope for scaffold story
- [x] [Review][Defer] W2: console.error in env.ts and console.log in migrate.ts [env.ts, db/migrate.ts] — deferred, pre-existing from stories 1-1/1-2

## Dev Notes

### Architecture Compliance

**API Structure (ARCH-9, ARCH-16, ARCH-17, ARCH-18, ARCH-20):**
```
packages/api/src/
├── index.ts              # Entry: env → migrate → serve
├── app.ts                # OpenAPIHono app + middleware chain
├── env.ts                # (exists) Zod env validation
├── env-schema.ts         # (exists) Schema — ADD CORS_ORIGIN
├── routes/
│   ├── index.ts          # Mount all route groups onto app
│   └── health.ts         # GET /healthz — DB status + uptime
├── middleware/
│   ├── error-handler.ts  # Global onError → { error: { code, message } }
│   ├── rate-limiter.ts   # hono-rate-limiter config
│   ├── cors.ts           # Hono cors() wrapper
│   └── logger.ts         # pino instance + request logging middleware
├── lib/
│   └── errors.ts         # AppError, ValidationError, NotFoundError, etc.
└── db/                   # (from story 1.2 — already exists)
    ├── client.ts
    ├── migrate.ts
    └── schema/
```

### Technology Versions (Verified April 2026)

| Package | Version | Notes |
|---------|---------|-------|
| @hono/zod-openapi | ^0.19.10 | MUST use 0.x line — v1.x requires Zod 4, project uses Zod 3 |
| hono-rate-limiter | ^0.5.3 | Requires `unstorage` as peer dependency |
| unstorage | ^1.17.3 | Storage backend for rate limiter (memory driver for MVP) |
| pino | ^10.3.1 | Structured JSON logging; pair with pino-pretty for dev |
| pino-pretty | ^13.1.3 | Dev-only readable log formatting |
| @scalar/hono-api-reference | ^0.10.5 | Requires hono >=4.12.5 — current hono 4.12.x is compatible |
| CORS | built-in | `import { cors } from 'hono/cors'` — no separate package |

### Error Response Shape (ARCH-16)

All API errors MUST use this exact shape:
```typescript
{
  error: {
    code: "VALIDATION_ERROR",    // UPPER_SNAKE_CASE constant
    message: "Title is required", // Human-readable
    details: [...]                // Optional field-level errors
  }
}
```

HTTP status code mapping:
- `ValidationError` → 400
- `UnauthorizedError` → 401
- `ForbiddenError` → 403
- `NotFoundError` → 404
- `ConflictError` → 409
- `AppError` (generic) → 500
- Unknown errors → 500

### Health Check Pattern (ARCH-20)

The health endpoint is at `/healthz` (NOT `/api/health`). The existing `/api/health` route from story 1.1 must be replaced.

```typescript
// Success response (200):
{ status: "healthy", db: "connected", uptime: 12345.67 }

// Failure response (503):
{ status: "unhealthy", db: "disconnected", error: "connection refused" }
```

The health endpoint MUST:
- Be excluded from rate limiting
- Be excluded from auth middleware (when added in story 1.4)
- Actually query the database (not just check connection pool status)
- Never crash the server — catch and return all errors

### Pino Logger Pattern (ARCH-14)

```typescript
// packages/api/src/middleware/logger.ts
import pino from 'pino'
import { env } from '../env.js'

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
})
```

Create a Hono middleware for request logging:
```typescript
// Log: method, path, status, duration in ms
// Do NOT use hono/logger (text-based) — replace with pino middleware
```

### Rate Limiter Pattern (ARCH-17)

```typescript
import { rateLimiter } from 'hono-rate-limiter'

// Default: 100 req/min per IP
export const defaultLimiter = rateLimiter({
  windowMs: 60_000,
  limit: 100,
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
})

// Auth: 10 req/min per IP (apply to /api/auth/* in story 1.4)
export const authLimiter = rateLimiter({
  windowMs: 60_000,
  limit: 10,
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
})
```

### CORS Pattern (ARCH-18)

Use Hono's built-in CORS — do NOT install a separate package:
```typescript
import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
})
```

### OpenAPI + Scalar Pattern (ARCH-9)

```typescript
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'

const app = new OpenAPIHono()

// Register OpenAPI JSON spec
app.doc('/api/openapi.json', {
  openapi: '3.0.0',
  info: { title: 'Dev Calendar API', version: '0.1.0' },
})

// Register Scalar UI
app.get('/api/docs', apiReference({ spec: { url: '/api/openapi.json' } }))
```

### Route Definition Pattern

```typescript
// packages/api/src/routes/health.ts
import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'

const healthRoute = createRoute({
  method: 'get',
  path: '/healthz',
  responses: {
    200: { content: { 'application/json': { schema: healthySchema } }, description: 'Healthy' },
    503: { content: { 'application/json': { schema: unhealthySchema } }, description: 'Unhealthy' },
  },
})

const app = new OpenAPIHono()
app.openapi(healthRoute, async (c) => { /* handler */ })
export default app
```

Mount pattern in routes/index.ts:
```typescript
import type { OpenAPIHono } from '@hono/zod-openapi'
import healthApp from './health.js'

export function mountRoutes(app: OpenAPIHono) {
  app.route('/', healthApp)
}
```

### Startup Sequence (index.ts)

```
1. import env (Zod validates, exits on failure)
2. await runMigrations() (from story 1.2 — exits on failure)
3. import app (middleware + routes already registered)
4. serve(app)
5. logger.info({ port, env: NODE_ENV }, 'Server started')
```

### Previous Story (1-1) Learnings

- **Env validation:** Schema separated into `env-schema.ts`, validation in `env.ts`. Extend env-schema for `CORS_ORIGIN`.
- **Test colocation:** `*.test.ts` next to source files. Exclude from tsconfig build.
- **App structure:** Current `app.ts` uses `new Hono()` — refactor to `new OpenAPIHono()`.
- **Existing health route:** `/api/health` exists in `app.ts` — will be replaced by `/healthz` in routes/health.ts.
- **Console.log in index.ts:** Replace `console.log` with pino logger for structured output.
- **hono/logger middleware:** Currently used in `app.ts` — replace entirely with pino middleware.

### Previous Story (1-2) Dependencies

This story assumes story 1.2 is complete:
- `packages/api/src/db/client.ts` exports `db` (Drizzle instance)
- `packages/api/src/db/migrate.ts` exports `runMigrations()`
- Database tables exist and are accessible

If implementing before story 1.2, the health check DB query and migration call should be wrapped in try/catch with graceful degradation.

### What NOT To Build In This Story

- No authentication routes or middleware (Story 1.4)
- No event/calendar/user CRUD routes (future stories)
- No WebSocket handler (Epic 7)
- No service layer (built as routes are added)
- No frontend changes
- Only infrastructure: middleware chain, error handling, logging, health check, OpenAPI scaffold

### Anti-Patterns (NEVER Do)

- Do NOT use `hono/logger` (text-based) — use pino for structured JSON
- Do NOT use `console.log` for logging — use the pino `logger` instance
- Do NOT create error responses without the standard `{ error: { code, message } }` shape
- Do NOT hardcode CORS origins — use env var
- Do NOT put route handlers directly in `app.ts` — use route files in `routes/`
- Do NOT use `any` type — use `unknown` and narrow
- Do NOT install a separate CORS package — Hono has `cors()` built in
- Do NOT install `@hono/zod-openapi` v1.x — it requires Zod 4; project uses Zod 3, use `^0.19.10`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — ARCH-9 (@hono/zod-openapi), ARCH-14 (pino), ARCH-16 (error handler), ARCH-17 (rate limiter), ARCH-18 (CORS), ARCH-20 (/healthz)]
- [Source: _bmad-output/planning-artifacts/prd.md — FR102 (health check endpoint), NFR1 (API response <100ms)]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.3 requirements]
- [Source: _bmad-output/implementation-artifacts/1-1-monorepo-setup-docker-environment.md — Current app.ts structure, env pattern, test pattern]
- [Source: _bmad-output/implementation-artifacts/1-2-database-schema-shared-types.md — DB client pattern, migration runner]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Scalar `apiReference()` API changed: `spec: { url }` → `url` directly (v0.10.5 uses `HtmlRenderingConfiguration` which no longer accepts `spec`)
- Vitest env vars: added `vitest.config.ts` with `DATABASE_URL` and `NODE_ENV=test` to avoid `process.exit(1)` from env validation when importing modules that depend on logger → env chain

### Completion Notes List

- Installed all dependencies per spec: @hono/zod-openapi@0.19.10, hono-rate-limiter, unstorage, pino, @scalar/hono-api-reference, pino-pretty (dev)
- Added CORS_ORIGIN to env-schema.ts with `z.string().default('*')`
- Created AppError base + 5 subclasses (ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError) with 9 unit tests
- Created pino logger with LOG_LEVEL control, pino-pretty in dev, JSON in prod; request logging middleware logs method/path/status/duration
- Created error handler: AppError → typed response, ZodError → 400 with field details, unknown → 500 with pino logging; 5 unit tests
- Created rate limiter: defaultLimiter (100/min) on /api/*, authLimiter (10/min) for future auth routes
- Created CORS middleware wrapping Hono's cors() with CORS_ORIGIN env var support (comma-separated origins)
- Refactored app.ts: Hono → OpenAPIHono, removed hono/logger, added middleware chain (requestLogger → cors → rateLimiter), route mounting via routes/index.ts
- Created /healthz route with OpenAPI schema, DB connectivity check via `SELECT 1`, graceful 503 on failure; 2 unit tests with mocked DB
- Updated index.ts: migrations with fatal error handling, pino startup banner with port/env/logLevel
- OpenAPI spec at /api/openapi.json, Scalar docs at /api/docs
- Updated app.test.ts for new structure: healthz, openapi spec, scalar docs, 404 handling, CORS headers; 5 tests
- Added vitest.config.ts for API package with test env vars
- All 102 tests pass (25 shared + 76 api + 1 web), 0 type errors

### Change Log

- 2026-04-01: Implemented story 1-3 API scaffold with health check, error handling, logging, rate limiting, CORS, and OpenAPI docs

### File List

New:
- packages/api/src/lib/errors.ts
- packages/api/src/lib/errors.test.ts
- packages/api/src/middleware/logger.ts
- packages/api/src/middleware/error-handler.ts
- packages/api/src/middleware/error-handler.test.ts
- packages/api/src/middleware/rate-limiter.ts
- packages/api/src/middleware/cors.ts
- packages/api/src/routes/health.ts
- packages/api/src/routes/health.test.ts
- packages/api/src/routes/index.ts
- packages/api/vitest.config.ts

Modified:
- packages/api/src/app.ts
- packages/api/src/app.test.ts
- packages/api/src/index.ts
- packages/api/src/env-schema.ts
- packages/api/package.json
- .env.example
- pnpm-lock.yaml
