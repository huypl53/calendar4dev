# Story 4.4: Event Creation UI

Status: ready-for-dev

## Story

As a user,
I want to create events via a dialog form,
so that I can add new events to my calendar.

## Acceptance Criteria

1. Quick-create dialog opens on time grid cell click
2. Form fields: title, start date/time, end date/time, description (optional)
3. Calendar selector (from useCalendarsQuery)
4. Submit calls useCreateEventMutation
5. Dialog closes on success with toast notification
6. Validation prevents empty title or invalid date ranges

## Tasks / Subtasks

- [ ] Task 1: Event form dialog component
  - [ ] `packages/web/src/features/events/components/event-form-dialog.tsx`
  - [ ] Form with title, start/end datetime, description, calendar select
  - [ ] Uses Dialog from UI library

- [ ] Task 2: Hook up to time grid click
  - [ ] Update TimeGrid to accept onCellClick callback
  - [ ] Pass click handler from WeekView/DayView
  - [ ] Calculate start time from clicked cell (hour + column)

- [ ] Task 3: Wire mutation and toast
  - [ ] On submit: call useCreateEventMutation
  - [ ] On success: close dialog, show toast
  - [ ] On error: show error toast

## What NOT to Build

- **No drag-to-create** — future enhancement
- **No recurrence UI** — Epic 8
- **No color picker** — uses calendar default color
