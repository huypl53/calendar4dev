# Story 17-1: Public iCal Feed URL

Status: ready-for-dev

## Story

As a user,
I want a shareable iCal feed URL for my calendar,
so that other applications can subscribe and automatically stay in sync with my events.

## Acceptance Criteria

1. `calendars` table has a `shareToken` varchar column (nullable); added via a new migration
2. `GET /api/calendars/:id/ical-feed` (authenticated, owner only) generates a token if none exists, persists it, and returns `{ feedUrl: string }`
3. `GET /api/ical/:token` requires no authentication and returns the calendar as a valid iCal file (reuses the ICS serializer from story 15-1)
4. Token is a cryptographically random string (e.g. 32-byte hex)
5. CalendarList sidebar dropdown includes "Copy iCal feed URL" button that calls the generate endpoint and copies the returned URL to the clipboard
6. A brief success toast confirms "Feed URL copied"

## Tasks / Subtasks

- [ ] Task 1: Database migration
  - [ ] Add migration: `ALTER TABLE calendars ADD COLUMN share_token VARCHAR(64) UNIQUE`

- [ ] Task 2: Token generation endpoint
  - [ ] Add `GET /api/calendars/:id/ical-feed` route (authenticated)
  - [ ] Return 403 if caller is not the calendar owner
  - [ ] If `shareToken` is null, generate `crypto.randomBytes(32).toString('hex')`, persist, then return `feedUrl`
  - [ ] If token already exists, return existing `feedUrl` without regenerating

- [ ] Task 3: Public feed endpoint
  - [ ] Add `GET /api/ical/:token` route (no auth middleware)
  - [ ] Look up calendar by `shareToken`; return 404 if not found
  - [ ] Fetch events and call ICS serializer (from 15-1) to produce iCal response
  - [ ] Set same headers as export endpoint (`Content-Type: text/calendar; charset=utf-8`)

- [ ] Task 4: Frontend copy button
  - [ ] Add "Copy iCal feed URL" item to CalendarList item dropdown menu
  - [ ] On click: call generate endpoint, write result URL to `navigator.clipboard`
  - [ ] Show "Feed URL copied" toast on success

- [ ] Task 5: Tests
  - [ ] Migration test: column present after migration
  - [ ] API test: token generated on first call, stable on second call, public endpoint returns iCal
  - [ ] Run typecheck + tests

## What NOT to Build

- **No token revocation UI** — revoking/regenerating the token, post-MVP
- **No token expiry** — tokens do not expire, post-MVP
