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

- **Header**: Navigation (prev/next/today), date label, view switcher (Day/Week/Month/Schedule)
- **Sidebar** (collapsed by default): Mini calendar + calendar list placeholders
- **Main area**: Calendar view content (week grid, day grid, month grid, or schedule list)
- **Status bar**: Time, sync status

All layout dimensions (header height, sidebar width, status bar height) are driven by CSS custom property density tokens — see Design System below.

**Responsive layout:**
- Desktop: sidebar occupies its own grid column with smooth CSS transition
- Mobile (< 768px): sidebar renders as a fixed overlay with backdrop

**State management:**
- **Zustand** for UI state (sidebar, theme, density, accent color) — persisted to localStorage
- **TanStack Query** for server state (events, calendars)

## Design System

The app uses a CSS custom property-based design token system. All tokens are defined in `packages/web/src/styles/globals.css` and `theme.css`.

**Theming:** Dark/light themes via `.dark`/`.light` class on `<html>`. 12 semantic color tokens switch values per theme.

**Typography:** Dual-font system — Inter (UI) and JetBrains Mono (temporal data). 5-level type scale: display, heading, body, small, tiny.

**Spacing:** 4px-based scale (`--space-1` through `--space-8`).

**Density:** Compact (default) and comfortable modes via `data-density` attribute. Controls row heights, padding, sidebar width, header/status-bar heights, and font sizes.

**Accent colors:** 24 preset accent colors available. Default: Cobalt blue (`#2f81f7`). Accent stays the same in both dark and light themes.

**UI Primitives** (`packages/web/src/components/ui/`):
- `Button` — variants: primary, secondary, ghost, danger; sizes: sm, md
- `IconButton` — icon-only with required aria-label
- `Badge` — default (label) and dot (color circle) variants
- `Tooltip` — shows on hover/focus with 300ms delay
- `Dialog` — native `<dialog>` with focus trap and backdrop
- `DropdownMenu` — positioned menu with keyboard nav (arrow keys)
- `ToastContainer` + `useToast` — transient notifications with auto-dismiss

**Calendar Views:**
- **Week view** (`/week/:date`): 7-day columns × 24-hour time grid, auto-scrolls to 8 AM
- **Day view** (`/day/:date`): Single-day time grid with full date header
- **Month view** (`/month/:date`): 6-week × 7-day calendar grid, out-of-month days dimmed, up to 3 events per cell
- **Schedule view** (`/schedule`): 14-day agenda list with date-grouped sections and event listings
- **Now line**: Red current-time indicator on day/week grids, updates every minute
- **Navigation**: Prev/next arrows step by view-appropriate unit (day/week/month). Today button returns to current date.

**Event Management:**
- **Create events**: Click any time grid cell (week/day) or month cell to open event creation dialog
- **Event rendering**: Events displayed as positioned blocks on week/day views, color-coded titles in month view, listed in schedule view
- **Edit events**: Click any event to open edit dialog with pre-populated fields
- **Delete events**: Delete button in edit dialog with confirmation
- **Form fields**: Title (required), start/end datetime, description, calendar selector
- **Toast notifications**: Success/error feedback for all event operations

**Command Palette & Keyboard Shortcuts:**
- `Cmd/Ctrl+K` — Open fuzzy-search command palette for quick navigation and actions
- `d/w/m/s` — Switch to day/week/month/schedule view
- `t` — Go to today
- `c` — Create new event
- `j/k` — Navigate prev/next in current view
- `?` — Show keyboard shortcut help dialog

**Sidebar:**
- Mini calendar with month navigation and date click-to-navigate
- Calendar list with color indicators
- Appearance settings (theme, density, accent color, default view)

**Recurring Events:**
- Events can repeat daily, weekly, or monthly
- Recurring events show ↻ indicator on calendar views

**Accessibility:**
- Focus-visible outlines for keyboard navigation
- Reduced motion support via `prefers-reduced-motion`
- Semantic HTML5 landmarks

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
| `GET /api/calendars` | List user's calendars |
| `POST /api/calendars/bootstrap` | Create default calendar (idempotent) |
| `POST /api/events` | Create a new event |
| `GET /api/events` | List events (query: calendarId, startDate, endDate) |
| `GET /api/events/:id` | Get a single event |
| `PATCH /api/events/:id` | Update an event |
| `DELETE /api/events/:id` | Delete an event |

## CLI

A terminal-based client for managing your calendar:

```bash
# Build the CLI
pnpm --filter @dev-calendar/cli build

# Set environment
export DEVCAL_API_URL=http://localhost:3001
export DEVCAL_AUTH_TOKEN=your-session-token

# List calendars
devcal calendars list [--json]

# List this week's events
devcal events list [--json]

# Create an event
devcal events create "Team Standup" "2026-04-03T09:00" "2026-04-03T09:30" cal-id-here
```
