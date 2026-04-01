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

## Key Decisions

- **Tailwind CSS v4**: Uses CSS-first config with `@import "tailwindcss"` — no `tailwind.config.js` needed
- **TypeScript strict mode**: Shared `tsconfig.base.json` with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- **Vitest**: Co-located tests (e.g., `env.test.ts` next to `env.ts`), configured per-package
- **pnpm workspace**: `onlyBuiltDependencies` in pnpm-workspace.yaml whitelists `@swc/core` and `esbuild` for native builds
