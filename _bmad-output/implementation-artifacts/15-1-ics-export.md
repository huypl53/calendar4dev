# Story 15-1: Calendar ICS Export

Status: ready-for-dev

## Story

As a user,
I want to export a calendar as an .ics file,
so that I can import my events into any standard calendar application.

## Acceptance Criteria

1. `GET /api/calendars/:id/export.ics` requires authentication and returns a valid iCalendar file
2. Response has `Content-Type: text/calendar; charset=utf-8` and `Content-Disposition: attachment; filename="<calendar-name>.ics"`
3. File contains a VCALENDAR wrapper with PRODID and VERSION:2.0
4. Each event is serialized as a VEVENT with: DTSTART, DTEND, SUMMARY, DESCRIPTION (if set), UID, DTSTAMP, RRULE (if recurrenceRule is set)
5. Timed events use UTC format `YYYYMMDDTHHMMSSZ`; all-day events use `VALUE=DATE:YYYYMMDD`
6. CalendarList sidebar dropdown for each calendar includes an "Export .ics" menu item that triggers a file download

## Tasks / Subtasks

- [ ] Task 1: ICS serializer utility
  - [ ] Create `packages/shared/src/ics-serializer.ts` (or equivalent shared location)
  - [ ] Implement `serializeCalendarToIcs(calendar, events): string`
  - [ ] Handle timed vs. allDay DTSTART/DTEND formatting
  - [ ] Map `recurrenceRule` JSON → RRULE string (FREQ, INTERVAL, BYDAY, UNTIL/COUNT)

- [ ] Task 2: Export API endpoint
  - [ ] Add `GET /api/calendars/:id/export.ics` route
  - [ ] Verify caller owns or has access to calendar; return 403 otherwise
  - [ ] Fetch all events for the calendar
  - [ ] Call serializer and send response with correct headers

- [ ] Task 3: Frontend export button
  - [ ] Add "Export .ics" item to CalendarList item dropdown menu
  - [ ] On click: fetch the export URL via `window.location.href` or `<a download>` to trigger browser download

- [ ] Task 4: Tests
  - [ ] Unit test serializer output for timed, allDay, and recurring events
  - [ ] API test: auth required, correct Content-Type header returned
  - [ ] Run typecheck + tests

## What NOT to Build

- **No VTIMEZONE component** — all times exported as UTC, post-MVP
- **No EXDATE for recurring exceptions** — skipped for now, post-MVP
