# Story 8.1: Recurring Event UI & Expansion

Status: ready-for-dev

## Story

As a user,
I want to create events that repeat on a schedule,
so that I don't have to manually create each occurrence.

## Acceptance Criteria

1. Event form has repeat option: None, Daily, Weekly, Monthly
2. Selected repeat creates RRULE string (e.g., RRULE:FREQ=WEEKLY)
3. Events with recurrenceRule are expanded when listing by date range
4. Recurring events show repeat icon/indicator

## Tasks / Subtasks

- [ ] Task 1: Recurrence select in event form dialog
- [ ] Task 2: RRULE expansion utility for date range queries
- [ ] Task 3: API service expands recurring events in list response
- [ ] Task 4: Visual indicator on recurring event blocks

## What NOT to Build

- **No editing single instances** — edit entire series only
- **No end date for recurrence** — infinite for MVP
- **No custom recurrence rules** — presets only
