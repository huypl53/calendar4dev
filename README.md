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
| `BETTER_AUTH_SECRET` | — | **Required.** Auth signing secret (min 32 chars). Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | — | **Required.** Base URL for auth callbacks (e.g., `http://localhost:3001`) |
| `GITHUB_CLIENT_ID` | — | Optional. GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | — | Optional. GitHub OAuth app client secret |
| `VITE_API_URL` | `http://localhost:3001` | Frontend API base URL |

Environment variables are validated by Zod at startup. Missing required vars cause a clear error and exit.

## Authentication

Authentication is handled by [Better Auth](https://better-auth.com) with email/password and optional GitHub OAuth.

- **Login page**: Navigate to `/login` to sign up or sign in
- **Auth guard**: All routes under `/` require authentication; unauthenticated users are redirected to `/login`
- **API protection**: All `/api/*` routes require a valid session cookie, except `/api/auth/*`, `/healthz`, `/api/openapi.json`, `/api/docs`
- **GitHub OAuth**: Enable by setting `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` env vars. Omit to use email/password only.

## Frontend

The web application uses a CSS Grid-based app shell with:

- **Header**: Navigation, view switcher (Day/Week/Month/Schedule)
- **Sidebar** (collapsed by default): Mini calendar + calendar list placeholders
- **Main area**: Calendar view content
- **Status bar**: Time, sync status

All layout dimensions (header height, sidebar width, status bar height) are driven by CSS custom property density tokens — see Design System below.

**State management:**
- **Zustand** for UI state (sidebar, theme, density)
- **TanStack Query** for server state (events, calendars)

## Design System

The app uses a CSS custom property-based design token system. All tokens are defined in `packages/web/src/styles/globals.css` and `theme.css`.

**Theming:** Dark/light themes via `.dark`/`.light` class on `<html>`. 12 semantic color tokens switch values per theme.

**Typography:** Dual-font system — Inter (UI) and JetBrains Mono (temporal data). 5-level type scale: display, heading, body, small, tiny.

**Spacing:** 4px-based scale (`--space-1` through `--space-8`).

**Density:** Compact (default) and comfortable modes via `data-density` attribute. Controls row heights, padding, sidebar width, header/status-bar heights, and font sizes.

**Accent colors:** 24 preset accent colors available. Default: Cobalt blue (`#2f81f7`). Accent stays the same in both dark and light themes.

**Routes** (all require authentication):
- `/week/:date` — Week view (default)
- `/day/:date` — Day view
- `/month/:date` — Month view
- `/schedule` — Schedule/agenda view
- `/login` — Login page (public)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /healthz` | Health check — returns DB status + uptime |
| `GET /api/openapi.json` | OpenAPI 3.0 spec |
| `GET /api/docs` | Scalar API reference UI |
| `POST /api/auth/sign-up/email` | Register with email/password |
| `POST /api/auth/sign-in/email` | Login with email/password |
| `POST /api/auth/sign-in/social` | OAuth login (GitHub) |
| `GET /api/auth/get-session` | Get current session |
| `POST /api/auth/sign-out` | Sign out |
