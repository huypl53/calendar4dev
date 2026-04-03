# Story 14-1: Event Full-Text Search

Status: ready-for-dev

## Story

As a user,
I want to search for events by keyword,
so that I can quickly locate any event across all my calendars.

## Acceptance Criteria

1. `GET /api/events/search?q=<query>&limit=20` returns matching events across all calendars the user owns or has access to
2. Query must be at least 2 characters; shorter queries return 400
3. Search uses PostgreSQL `to_tsquery('english', query || ':*')` against the existing `search_vector` tsvector column (GIN index already present)
4. Each result includes: event id, title, startAt, calendar name, calendar id
5. Command palette has a "Search events…" entry that opens a search panel/dialog
6. Search input is debounced 300 ms before firing the API call
7. Results display as a list: title, formatted start date, calendar name
8. Clicking a result navigates the calendar to that week and opens the event edit dialog

## Tasks / Subtasks

- [ ] Task 1: Search API endpoint
  - [ ] Add `GET /api/events/search` route in the events router
  - [ ] Validate `q` param length >= 2, return 400 otherwise
  - [ ] Build query using `to_tsquery('english', $1 || ':*')` with `@@` operator on `search_vector`
  - [ ] JOIN calendars to filter to current user's owned + shared calendars
  - [ ] Return array of `{ id, title, startAt, calendarId, calendarName }` capped at `limit` (default 20)

- [ ] Task 2: Frontend search panel
  - [ ] Add "Search events…" command to command palette (opens search dialog)
  - [ ] Build `EventSearchDialog` component with controlled text input
  - [ ] Wire debounced input (300 ms) to React Query `useQuery` calling the search endpoint
  - [ ] Render result list: title, start date (formatted), calendar name badge
  - [ ] On result click: close dialog, navigate to event's week, open `EventEditDialog` for that event

- [ ] Task 3: Tests
  - [ ] API: test query too short returns 400, test results scoped to current user
  - [ ] Frontend: test debounce fires correctly, test result click navigation
  - [ ] Run typecheck + tests

## What NOT to Build

- **No date-range filtering** — search returns all-time matches, post-MVP
- **No result highlighting** — matching term highlight in title/description, post-MVP
