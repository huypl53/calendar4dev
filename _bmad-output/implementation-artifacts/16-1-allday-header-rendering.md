# Story 16-1: All-Day Event Rendering in Header Row

Status: ready-for-dev

## Story

As a user,
I want all-day events to appear in the header row above the time grid,
so that they are visually distinct from timed events and never clutter the hourly schedule.

## Acceptance Criteria

1. WeekView splits events: `allDayEvents = events.filter(e => e.allDay)`, `timedEvents = events.filter(e => !e.allDay)`
2. `allDayEvents` is passed as a prop to WeekHeader; each all-day event renders as a colored bar in its day column
3. `timedEvents` is passed to TimeGrid; TimeGrid no longer renders `allDay === true` events
4. DayView applies the same split: all-day events appear in DayHeader's all-day section, timed events in the time grid
5. All-day bars use the event's color (falling back to calendar color) and display the event title truncated to one line
6. Clicking an all-day bar opens the event edit dialog

## Tasks / Subtasks

- [ ] Task 1: WeekView event split
  - [ ] Split `events` prop into `allDayEvents` and `timedEvents` in WeekView
  - [ ] Pass `allDayEvents` to WeekHeader, `timedEvents` to TimeGrid
  - [ ] Add guard in TimeGrid to filter out any `allDay === true` events defensively

- [ ] Task 2: WeekHeader all-day row
  - [ ] Accept `allDayEvents` prop in WeekHeader
  - [ ] Render a row beneath column headers with one cell per day
  - [ ] For each day, render colored bars for matching all-day events (matched by date overlap with that day column)
  - [ ] Bar shows truncated title; clicking opens `EventEditDialog`

- [ ] Task 3: DayView all-day section
  - [ ] Split events in DayView the same way as WeekView
  - [ ] DayHeader receives `allDayEvents` and renders them as stacked bars above the time grid
  - [ ] TimeGrid in DayView receives only `timedEvents`

- [ ] Task 4: Tests
  - [ ] Test WeekView passes correct event subsets to children
  - [ ] Test WeekHeader renders correct number of bars per day
  - [ ] Test TimeGrid does not render allDay events
  - [ ] Run typecheck + tests

## What NOT to Build

- **No multi-day spanning bars** — events spanning multiple days render once in their start-day column only, post-MVP
- **No drag in the all-day row** — drag-and-drop for all-day events, post-MVP
