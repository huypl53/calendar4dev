# Deferred Work

## Deferred from: code review of 1-1-monorepo-setup-docker-environment (2026-04-01)

- Release workflow has no CI gate — configure GitHub branch protection with required status checks before first release to main

## Deferred from: code review of 1-2-database-schema-shared-types (2026-04-01)

- Session token should be hashed (SHA-256) before DB storage — address in Story 1.4 (Authentication)
- Add endTime > startTime validation (Zod .refine() and/or DB CHECK constraint) — address in Story 1.3 service layer
- $onUpdate for updatedAt is ORM-level only; any direct SQL won't update timestamps — intentional per architecture, document
- Database client needs explicit pool limits and graceful shutdown handler — address in Story 1.3 server lifecycle
- Full-text search hardcodes 'english' dictionary; non-English content is poorly tokenized — address when i18n is scoped
- Define TypeScript type/Zod schema for modifiedEventData JSONB shape — address in Epic 8 (Recurring Events)
- Add index on events.end_time for overlap/conflict detection — add when free/busy features are built
- Calendar unique(user_id, name) is case-sensitive — document as known behavior, consider lower() index if user feedback warrants
- recurrenceRule stored as freeform text — add RRULE format validation in Epic 8
- timezone field accepts any string — add IANA timezone validation in API service layer
- isDirectRun detection in migrate.ts may be fragile with some tsx/symlink configurations — monitor

## Deferred from: code review of 1-3-api-scaffold-health-check (2026-04-01)

- Health check SELECT 1 has no timeout — can hang forever if DB is reachable but unresponsive. Add statement_timeout or Promise.race with deadline.
- console.error in env.ts and console.log in migrate.ts — replace with pino logger (pre-existing from stories 1-1/1-2, but violates "no console.log" constraint)

## Deferred from: code review of 2-2-theme-density-accent-color-controls (2026-04-03)

- Hydration flash on page load — persisted theme/accent/density applied via useEffect after first paint; light-theme users see dark flash. Address with inline script in index.html or SSR
- Inline style for --color-accent on html prevents CSS-only overrides (e.g. high-contrast theme). Architectural constraint — future themes must use JS
- Settings panel state (showSettings) not reset when sidebar closes — user sees stale expanded panel on reopen. Minor UX, address in polish story
- 3-digit hex shorthand (#fff) rejected by validator — only 6-digit supported. Document or extend in future UX pass
- Login page uses --color-accent but AppShell (which sets it) is not rendered on /login — returning users see default blue instead of persisted accent
- White checkmark on light-colored accent presets has poor contrast — needs luminance-based check for dark/light checkmark

## Deferred from: code review of 2-3-core-ui-primitives (2026-04-03)

- Badge default variant with custom color hardcodes white text — needs luminance-based contrast check for light colors
- Tooltip lacks aria-describedby linking trigger to tooltip element — ARIA tooltip pattern compliance for Epic 9
- Tooltip positions above trigger only, will clip in overflow-hidden containers (e.g., sidebar) — add placement strategy when needed
- Accent color CSS variable flash on page load before useEffect fires — accent-dependent components (Button primary, Badge dot) briefly show default color

## Deferred from: code review of 2-4-application-shell-polish-responsive-layout (2026-04-03)

- Mobile sidebar overlay needs focus trap and Escape key handler — address in Epic 9 accessibility story
- useMediaQuery hook SSR mismatch — no impact in current SPA, address if SSR is added
- Auto-close sidebar when viewport transitions from mobile to desktop — UX polish for future story
- "Today" button date goes stale after midnight if app stays open — add midnight boundary check
- View switcher buttons need aria-current="page" for active state — Epic 9 accessibility

## Deferred from: code review of 2-5-overlay-feedback-components (2026-04-03)

- Toast setTimeout not cleaned up on component unmount — store is global so remove still works, but cleanup would be cleaner
- Dialog doesn't restore focus to previously focused element on close — a11y improvement for Epic 9
- DropdownMenu trigger is a span, needs role="button" + aria-haspopup="menu" + aria-expanded — a11y for Epic 9
- DropdownMenu missing Home/End key handlers per ARIA menu pattern — a11y for Epic 9
- Duplicate dropdown item labels cause React key warnings — add caller-supplied id field if needed

## Deferred from: code review of Epic 3 (Calendar Grid & View Engine) (2026-04-03)

- WeekHeader hardcodes repeat(7, 1fr) instead of using days.length — works for week view but won't support workweek view
- formatDayHeader uses toLocaleDateString which may vary across JS engines — use static day name array if locale consistency becomes an issue
- Schedule view toLocaleDateString for date formatting may vary by engine — same locale concern
- DayHeader date parsing uses manual split-and-construct pattern — extract shared date-formatting helper if more views need similar display
- NowLine does not account for container scroll position in week/day view — visually fine since percentage-based, but verify in integration
- h-7 w-7 badge sizes and min-h-[28px] all-day row height not tokenized — extract to density tokens for consistency

## Deferred from: code review of Epics 11-18 (2026-04-03)

- `listMembers` gated to owner/admin — members with edit/details cannot list who else has access; desired behavior unclear, leave restricted for now
- `removeMember` TOCTOU: read-then-delete in separate statements — low exploitability, no transaction refactor warranted now
- `listEventsForCalendar` has no auth check in the service itself — intentional; authorization is at the route layer (share token validated before calling)
- `/api/ical/` globally public prefix — any future route accidentally placed here would skip auth; add per-route auth annotation when adding routes under this prefix
- ICS `parseDt` floating/TZID times treated as UTC — correct fix requires VTIMEZONE parsing and a timezone database; document as known limitation
- ICS `parseDt` regex: abnormal datetime input produces Invalid Date (silently dropped) — tolerable; invalid events are excluded from import results
- ICS import not wrapped in a transaction — partial imports possible on crash mid-loop; fix requires batching inserts
- ICS import size limit checked on event count not raw bytes — 500-event cap is sufficient guard for now
- iCal feed `/api/ical/:token` has no rate limiting — infrastructure-level (reverse proxy / API gateway) concern; 256-bit token space makes brute force impractical
- Drag cross-day: horizontal cursor movement during drag is silently no-op — feature gap, not a bug
- Multi-day timed events render as single same-height block on each day (no visual spanning) — UX enhancement, not a bug
- `computeNewStartMinute` can produce negative maxStart for duration > 1440 min — only possible for corrupted data; all-day events don't reach TimeGrid
- Search `placeholderData: []` causes brief "no results" flash between queries — cosmetic; acceptable for now
- `to_tsquery` single-character token may produce PostgreSQL error — partially guarded by the ≥2-char check; edge case
- `navigator.onLine` reports true for captive portals — platform limitation
- `gcTime: 300s` may be too short for meaningful offline use — tradeoff between staleness and memory; current value is deliberate
- Notification polling fires in backgrounded tabs — browsers throttle intervals anyway; acceptable
- Offline mutation queue — `networkMode: 'offlineFirst'` does not persist mutations; full background sync requires a Service Worker or IndexedDB queue
