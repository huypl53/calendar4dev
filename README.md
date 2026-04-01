# Dev Calendar

A developer-focused calendar application.

## Prerequisites

- Node.js 22+
- pnpm (latest)
- Docker & Docker Compose (for database / production)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start local PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# Start development servers (web on :5173, api on :3001)
pnpm dev
```

## Project Structure

```
dev-calendar/
├── packages/
│   ├── shared/    # @dev-calendar/shared — types + Zod schemas
│   ├── api/       # @dev-calendar/api — Hono REST API
│   └── web/       # @dev-calendar/web — React SPA (Vite + SWC)
├── docker-compose.yml       # Production: postgres + app
├── docker-compose.dev.yml   # Dev: postgres only
├── Dockerfile               # Multi-stage production build
└── tsconfig.base.json       # Shared TypeScript strict config
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web + api dev servers with hot reload |
| `pnpm build` | Build all packages (shared → web → api) |
| `pnpm test` | Run tests across all packages |
| `pnpm typecheck` | TypeScript strict mode check |
| `pnpm lint` | Lint all packages |
| `pnpm db:generate` | Generate Drizzle migration from schema changes |
| `pnpm db:migrate` | Apply pending database migrations |
| `pnpm db:push` | Push schema directly to DB (dev only) |
| `pnpm db:studio` | Open Drizzle Studio DB browser |

## Docker

```bash
# Production: build and run everything
docker compose up --build

# Dev: just PostgreSQL
docker compose -f docker-compose.dev.yml up -d
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/devcalendar` | PostgreSQL connection string |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Log verbosity |
| `PORT` | `3000` | Production server port |
| `API_PORT` | `3001` | API dev server port |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (comma-separated) |

Environment variables are validated by Zod at startup. Missing required vars cause a clear error and exit.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /healthz` | Health check — returns DB status + uptime |
| `GET /api/openapi.json` | OpenAPI 3.0 spec |
| `GET /api/docs` | Scalar API reference UI |
