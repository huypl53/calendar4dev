# Story 4.2: Calendar Bootstrap API

Status: ready-for-dev

## Story

As a user,
I want a default calendar to be created when I first use the app,
so that I can immediately start creating events.

## Acceptance Criteria

1. GET /api/calendars returns the user's calendars
2. POST /api/calendars/bootstrap creates a default "Personal" calendar if none exists
3. The default calendar is marked as isPrimary=true
4. The frontend calls bootstrap on app load to ensure a calendar exists
5. All routes require authentication

## Tasks / Subtasks

- [ ] Task 1: Calendar service + routes
  - [ ] `packages/api/src/services/calendars.ts`
  - [ ] `packages/api/src/routes/calendars.ts`
  - [ ] listCalendars, bootstrapCalendar functions

- [ ] Task 2: Tests
  - [ ] Run pnpm typecheck — must pass

## What NOT to Build

- **No calendar CRUD** — Epic 6
- **No calendar sharing** — Epic 11
