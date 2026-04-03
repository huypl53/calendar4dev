# Story 12.1: Event Reminders & Browser Notifications

Status: ready-for-dev

## Story

As a user,
I want to set reminder alerts on my events and receive browser notifications before they start,
so that I never miss an important meeting or deadline.

## Acceptance Criteria

1. Events can have reminder times: 0, 5, 10, 15, 30, 60, 120 minutes before start (stored in DB)
2. EventFormDialog has a "Reminder" selector for create and edit
3. On app load, the frontend requests browser notification permission
4. A background timer checks every 60s for events starting within the next reminder window and fires a Web Notification API alert
5. Notifications show event title, time, and a "View" action that navigates to the event's date
6. Users who denied notification permission see a fallback in-app toast alert instead
7. GET /api/events response includes `reminderMinutes` field (null = no reminder)
8. PATCH /api/events/:id accepts `reminderMinutes` in update payload

## Tasks / Subtasks

- [ ] Task 1: DB schema & API
  - [ ] Add `reminderMinutes` integer nullable column to events table (Drizzle migration)
  - [ ] Update `createEventSchema` and `updateEventSchema` in shared package
  - [ ] Update API `serializeEvent()` to include `reminderMinutes`
  - [ ] Update `createEvent` and `updateEvent` services to persist `reminderMinutes`

- [ ] Task 2: Frontend reminder UI
  - [ ] Add `reminderMinutes` to `CalendarEvent` type in api-client.ts
  - [ ] Add REMINDER_OPTIONS constant to shared package (0, 5, 10, 15, 30, 60, 120 min)
  - [ ] Add reminder selector to EventFormDialog

- [ ] Task 3: Browser notification service
  - [ ] `packages/web/src/lib/notification-service.ts` — request permission, schedule/fire notifications
  - [ ] On app mount (AppShell), start notification polling loop (every 60s)
  - [ ] When event starts within reminder window: fire Web Notification or in-app toast fallback
  - [ ] Store set of already-notified event IDs to avoid duplicate notifications

- [ ] Task 4: Tests
  - [ ] Unit tests for notification service logic
  - [ ] Updated EventFormDialog tests for reminder selector
  - [ ] Run typecheck + tests

## What NOT to Build

- **No email reminders** — requires backend job scheduler, post-MVP
- **No push notifications** — service worker setup, post-MVP
- **No notification history/center** — post-MVP
- **No per-calendar reminder defaults** — post-MVP
