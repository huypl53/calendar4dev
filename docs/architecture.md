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

## Design Token System (Story 2-1)

- **Token architecture**: All design tokens are CSS custom properties in `packages/web/src/styles/globals.css` (root definitions) and `theme.css` (theme/density overrides). No JS token objects — pure CSS variable swap.
- **Color tokens**: 12 semantic tokens (`--color-bg-primary`, `--color-bg-secondary`, `--color-bg-tertiary`, `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`, `--color-border`, `--color-accent`, `--color-success`, `--color-warning`, `--color-danger`, `--color-now-line`) with dark/light theme values
- **Theme switching**: `.dark` / `.light` class on `<html>` element, applied via `useEffect` in `AppShell`. Dark theme is default. `index.html` has `class="dark"` as initial value.
- **Density switching**: `data-density="compact|comfortable"` attribute on `<html>` element. Compact is default. CSS selector `[data-density="comfortable"]` overrides dimension and typography tokens.
- **Typography**: Dual-font system — Inter for UI, JetBrains Mono for temporal data. Loaded via Google Fonts CDN. 5-level type scale (display/heading/body/small/tiny) with individual `--font-size-*` and `--line-height-*` tokens. Comfortable density adds +2px to all sizes, +0.1 to all line heights.
- **Spacing**: 4px-based scale from `--space-1` (4px) to `--space-8` (32px)
- **Density tokens**: `--density-row-height`, `--density-event-padding`, `--density-sidebar-width`, `--density-header-height`, `--density-status-bar-height`, `--density-mini-cal-cell`, `--density-base-font-size`. Layout components reference these instead of hardcoded pixel values.
- **Accent colors**: 24 preset accent colors in `packages/shared/src/constants/accent-colors.ts` with `{ name, hex, category }`. Default is Cobalt `#2f81f7`. Accent does NOT change per theme — stays the same in dark and light.
- **Layout component color pattern**: Header, sidebar, status-bar use `--color-bg-secondary` for background (panel surfaces). Main content area uses `--color-bg-primary` (canvas). Borders use `--color-border`. Muted text uses `--color-text-secondary` or `--color-text-tertiary`.

## Theme, Density & Accent Controls (Story 2-2)

- **Zustand persist**: `useUIStore` uses `zustand/middleware` `persist` with localStorage key `'dev-calendar-ui'`. Only `theme`, `density`, and `accentColor` are persisted (not `sidebarOpen`). Preferences survive page reloads.
- **Accent color runtime**: `accentColor` state in `useUIStore`, applied to `<html>` via `style.setProperty('--color-accent', accentColor)` in the `AppShell` `useEffect`. Supports ~24 presets from `ACCENT_COLOR_PRESETS` and custom hex input.
- **Appearance settings**: `packages/web/src/features/settings/components/appearance-settings.tsx` — theme toggle (Dark/Light buttons), density toggle (Compact/Comfortable buttons), accent color grid (24 preset dots + custom hex input). Mounted inline in the sidebar via a collapsible "Settings" button.
- **Store actions**: `setTheme`, `toggleTheme`, `setDensity`, `toggleDensity`, `setAccentColor` — all fire synchronous Zustand updates that trigger the `AppShell` `useEffect` to apply changes to `<html>`.

## Core UI Primitives (Story 2-3)

- **Component location**: `packages/web/src/components/ui/` — barrel export from `index.ts`
- **Button**: Variants (primary, secondary, ghost, danger), sizes (sm, md). All colors from CSS custom properties. Disabled state with reduced opacity.
- **IconButton**: Icon-only button with required `aria-label`, sizes (sm, md), hover state using `--color-bg-tertiary`.
- **Badge**: Default variant (rounded label) and dot variant (small colored circle for calendar indicators). Custom color via props.
- **Tooltip**: Shows on hover/focus with 300ms delay. Positioned above trigger. Uses `--color-bg-tertiary` background.
- **Token usage pattern**: All primitives use `var(--color-*)`, `var(--font-size-*)`, `var(--font-weight-*)` tokens via Tailwind arbitrary value syntax (e.g., `bg-[var(--color-accent)]`). No hardcoded colors.
- **Refactored components**: Header hamburger uses `IconButton`, appearance settings uses `Button`.

## Application Shell Polish & Responsive Layout (Story 2-4)

- **Sidebar transition**: Grid column transition via `transition: grid-template-columns 200ms ease` on the shell grid for smooth sidebar open/close animation.
- **Mobile responsive**: `useMediaQuery('(max-width: 767px)')` hook detects mobile. On mobile, sidebar renders as a fixed overlay (z-50) with backdrop (z-40, bg-black/50). Clicking backdrop closes sidebar. Grid column stays at 0px on mobile regardless of sidebar state.
- **`useMediaQuery` hook**: `packages/web/src/hooks/use-media-query.ts` — wraps `window.matchMedia` with state sync via `addEventListener('change', ...)`.
- **Header navigation**: "Today" button (ghost variant) navigates to current date in week view. View switcher (Day/Week/Month/Schedule) uses Button primitives with primary variant for active route. Active route detected via `useRouterState` from TanStack Router.
- **Status bar clock**: Live time display via `setInterval` (60s), formatted with `toLocaleTimeString`. Cleanup on unmount.
- **Sidebar refactor**: `SidebarContent` extracted as internal component. `Sidebar` accepts `embedded` prop — when false (mobile), renders content without `<aside>` wrapper (AppShell provides the mobile `<aside>`).

## Overlay & Feedback Components (Story 2-5)

- **Dialog**: `packages/web/src/components/ui/dialog.tsx` — Uses native `<dialog>` element for built-in focus trap and Escape handling. `showModal()`/`close()` called via `useEffect` on `open` prop. Backdrop click detection via `e.target === dialog` with `stopPropagation` on content. Styled with `::backdrop` pseudo-element.
- **DropdownMenu**: `packages/web/src/components/ui/dropdown-menu.tsx` — Positioned absolutely below trigger. Closes on outside click (document `mousedown` listener) and Escape key. Arrow key navigation with focusable `[data-menu-item]` buttons. Items accept `{ label, onClick, icon? }`.
- **Toast system**: Zustand store at `packages/web/src/stores/toast-store.ts` with `addToast`/`removeToast` actions. `useToast` hook provides `toast(message, variant?, duration?)` function with auto-dismiss (5s default). `ToastContainer` renders fixed bottom-right stack. Variants: success (green border), error (danger border), info (accent border).
- **Barrel export**: All overlay components exported from `packages/web/src/components/ui/index.ts`.

## Calendar Grid & View Engine (Epic 3)

- **View components**: `packages/web/src/features/views/components/` — WeekView, DayView, MonthView, ScheduleView. Barrel export from `packages/web/src/features/views/index.ts`.
- **Shared time grid components**: TimeGutter (24 hour labels), TimeGrid (hour/half-hour grid cells with configurable column count), NowLine (current time indicator). TimeGrid accepts `dayCount` and optional `todayIndex` to render the now-line on today's column.
- **Week view**: WeekHeader (7 day column headers + all-day section) + scrollable TimeGutter + TimeGrid(dayCount=7). Auto-scrolls to 8 AM on mount via `scrollTop` calculation using `--density-row-height` CSS variable.
- **Day view**: DayHeader (single day name + date + month) + scrollable TimeGutter + TimeGrid(dayCount=1). Same auto-scroll pattern as week view.
- **Month view**: MonthGrid (6-week × 7-day grid using `getMonthGridDates`). Out-of-month days dimmed via `isSameMonth`. Today highlighted with accent. Cell height uses `--density-mini-cal-cell` token.
- **Schedule view**: 14-day agenda starting from today. Date-grouped sections with sticky headers. Today's header highlighted with accent. "No events" placeholder per day.
- **Now-line**: `NowLine` component calculates position as percentage of 24 hours (minute/1440 × 100%). Updates every 60 seconds via minute-boundary scheduling. Rendered as absolute-positioned overlay within TimeGrid on today's column only.
- **Date navigation**: Header has prev/next IconButtons. Navigation unit varies by view: ±1 day (day), ±7 days (week), ±1 month (month). Schedule view hides prev/next. `getDateLabel(view, date)` returns view-appropriate header label. `navigateDate(view, date, direction)` computes new date. Today button navigates to today in current view (not always week).
- **Date utilities**: `packages/web/src/lib/date-utils.ts` — `getWeekDays` (Monday-start), `getMonthGridDates` (42 cells), `formatDayHeader`, `formatHour`, `addDays`, `addMonths` (with day clamping for month overflow), `isSameMonth`, `isToday`, `getDateLabel`, `navigateDate`.
- **Gutter width token**: `--density-gutter-width` (compact: 60px, comfortable: 72px) used by all grid layouts instead of hardcoded `60px`.
- **Route structure**: `/day/$date`, `/week/$date`, `/month/$date`, `/schedule`. All date routes have `beforeLoad` guard that redirects invalid dates to today. Views are lazy-loaded via `lazyRouteComponent`.

## Key Decisions

- **Tailwind CSS v4**: Uses CSS-first config with `@import "tailwindcss"` — no `tailwind.config.js` needed
- **TypeScript strict mode**: Shared `tsconfig.base.json` with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- **Vitest**: Co-located tests (e.g., `env.test.ts` next to `env.ts`), configured per-package
- **pnpm workspace**: `onlyBuiltDependencies` in pnpm-workspace.yaml whitelists `@swc/core` and `esbuild` for native builds
