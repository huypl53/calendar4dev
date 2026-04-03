# Story 15-2: Calendar ICS Import

Status: ready-for-dev

## Story

As a user,
I want to import an .ics file into one of my calendars,
so that I can bring in events from other calendar applications.

## Acceptance Criteria

1. `POST /api/calendars/:id/import` accepts `Content-Type: text/calendar` body and creates events in the target calendar
2. Returns `{ imported: number }` on success
3. Parser handles: DTSTART, DTEND, SUMMARY (→ title), DESCRIPTION, RRULE
4. VEVENTs with RECURRENCE-ID (exception instances) are silently skipped
5. Files with more than 500 VEVENTs are rejected with 400
6. Caller must own the target calendar; returns 403 otherwise
7. CalendarList sidebar dropdown includes "Import .ics" menu item that opens a file picker (`accept=".ics"`)
8. After successful import a success toast shows "Imported N events"

## Tasks / Subtasks

- [ ] Task 1: ICS parser utility
  - [ ] Create `packages/shared/src/ics-parser.ts` (or equivalent shared location)
  - [ ] Implement `parseIcs(text: string): ParsedEvent[]`
  - [ ] Unfold continuation lines (RFC 5545 line folding)
  - [ ] Extract DTSTART, DTEND (timed and DATE-only), SUMMARY, DESCRIPTION, RRULE, UID
  - [ ] Skip blocks that contain RECURRENCE-ID
  - [ ] Return early with error if VEVENT count > 500

- [ ] Task 2: Import API endpoint
  - [ ] Add `POST /api/calendars/:id/import` route
  - [ ] Read raw text body (limit body size to reasonable max)
  - [ ] Call parser; handle validation errors with 400
  - [ ] Batch-insert resulting events linked to the calendar
  - [ ] Return `{ imported: N }`

- [ ] Task 3: Frontend import button
  - [ ] Add "Import .ics" item to CalendarList item dropdown menu
  - [ ] Hidden `<input type="file" accept=".ics">` triggered on click
  - [ ] Read file as text, POST to import endpoint with `Content-Type: text/calendar`
  - [ ] Show success toast with imported count; show error toast on failure

- [ ] Task 4: Tests
  - [ ] Unit test parser: timed events, allDay events, RRULE, RECURRENCE-ID skipping, >500 rejection
  - [ ] API test: 403 for non-owner, 400 for oversized file, 200 with count
  - [ ] Run typecheck + tests

## What NOT to Build

- **No update-existing-events** — import always creates new events, no upsert by UID, post-MVP
- **No calendar-to-calendar import** — only file upload supported, post-MVP
