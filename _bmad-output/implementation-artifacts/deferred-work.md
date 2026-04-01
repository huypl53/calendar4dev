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
