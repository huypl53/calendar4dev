# Story 4.3: Frontend Event Data Layer

Status: ready-for-dev

## Story

As a frontend developer,
I want React hooks for fetching, creating, updating, and deleting events,
so that the UI can manage events with optimistic updates.

## Acceptance Criteria

1. API client functions for all event CRUD operations
2. useEventsQuery hook fetches events filtered by date range
3. useCreateEventMutation creates events with cache invalidation
4. useUpdateEventMutation updates events with optimistic UI
5. useDeleteEventMutation deletes events with cache invalidation
6. useCalendarsQuery fetches user's calendars
7. Calendar bootstrap runs on app load

## Tasks / Subtasks

- [ ] Task 1: API client
  - [ ] `packages/web/src/lib/api-client.ts`
  - [ ] Typed fetch wrapper for events and calendars endpoints

- [ ] Task 2: Event hooks
  - [ ] Update `packages/web/src/features/events/hooks/use-events-query.ts`
  - [ ] Create mutation hooks

- [ ] Task 3: Calendar hooks
  - [ ] `packages/web/src/features/calendars/hooks/`
  - [ ] useCalendarsQuery, useBootstrapCalendar

## What NOT to Build

- **No WebSocket sync** — Epic 7
- **No offline support** — Epic 18
