# Story 4.1: Event CRUD API

Status: ready-for-dev

## Story

As a developer,
I want REST API endpoints for creating, reading, updating, and deleting events,
so that the frontend can manage calendar events.

## Acceptance Criteria

1. POST /api/events creates an event (validates with createEventSchema)
2. GET /api/events lists events filtered by calendarId and date range (startDate, endDate query params)
3. GET /api/events/:id returns a single event
4. PATCH /api/events/:id updates an event (validates with updateEventSchema)
5. DELETE /api/events/:id deletes an event
6. All routes require authentication (existing requireAuth middleware)
7. Only the calendar owner can CRUD events on their calendars
8. Proper error responses (400 validation, 401 unauth, 403 forbidden, 404 not found)

## Tasks / Subtasks

- [ ] Task 1: Create event service layer
  - [ ] `packages/api/src/services/events.ts`
  - [ ] createEvent, getEvent, listEvents, updateEvent, deleteEvent functions
  - [ ] Ownership check: verify calendar belongs to authenticated user

- [ ] Task 2: Create event routes
  - [ ] `packages/api/src/routes/events.ts`
  - [ ] OpenAPIHono routes with Zod schemas for request/response
  - [ ] Mount in routes/index.ts

- [ ] Task 3: Tests
  - [ ] Test service functions with mocked DB
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No recurring event expansion** — Epic 8
- **No calendar sharing/permissions beyond owner** — Epic 11
- **No full-text search endpoint** — Epic 14
