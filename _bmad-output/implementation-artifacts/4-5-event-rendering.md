# Story 4.5: Event Rendering on Views

Status: ready-for-dev

## Story

As a user,
I want to see my events displayed on the calendar views,
so that I can visualize my schedule.

## Acceptance Criteria

1. EventBlock component renders in week/day time grids, positioned by start/end time
2. Events show title and time range
3. Event color uses calendar color or event override color
4. Month view shows event titles in day cells (max 2-3 visible, "+N more")
5. Schedule view lists events under each day
6. Views fetch events using useEventsQuery with appropriate date range
7. Loading/empty states handled

## Tasks / Subtasks

- [ ] Task 1: EventBlock component
  - [ ] `packages/web/src/features/events/components/event-block.tsx`
  - [ ] Absolutely positioned based on startTime/endTime
  - [ ] Shows title, time, color stripe

- [ ] Task 2: Integrate events into TimeGrid
  - [ ] TimeGrid accepts events prop
  - [ ] Position events within day columns

- [ ] Task 3: Wire views to fetch events
  - [ ] WeekView: fetch events for the week date range
  - [ ] DayView: fetch events for the single day
  - [ ] MonthView: fetch events for the month grid range
  - [ ] ScheduleView: fetch events for 14-day range

## What NOT to Build

- **No overlapping event layout** — stack simply for now
- **No drag-to-move or resize** — future enhancement
