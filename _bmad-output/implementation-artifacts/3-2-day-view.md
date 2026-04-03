# Story 3.2: Day View

Status: ready-for-dev

## Story

As a user,
I want to see a single-day view with the same time grid layout as the week view,
so that I can focus on one day's schedule in detail.

## Acceptance Criteria

1. The day view displays a single day column with date header showing day name and full date
2. Reuses TimeGutter and TimeGrid components from story 3-1
3. The grid scrolls vertically; on initial load it auto-scrolls to 8:00 AM
4. The all-day section is present above the time grid (empty for now)
5. The current day header is visually highlighted with accent color
6. All styling uses design tokens — no hardcoded colors or sizes
7. Date param from route is used; invalid dates redirect to today

## Tasks / Subtasks

- [ ] Task 1: Create DayHeader component (AC: #1, #4, #5)
  - [ ] Create `packages/web/src/features/views/components/day-header.tsx`
  - [ ] Single day header with day name + full date (e.g. "WED April 1")
  - [ ] Today highlighted with accent color
  - [ ] All-day section row below header

- [ ] Task 2: Update DayView component (AC: #1-#7)
  - [ ] Update `packages/web/src/features/views/components/day-view.tsx`
  - [ ] Compose: DayHeader + scrollable area containing TimeGutter + TimeGrid(dayCount=1)
  - [ ] Auto-scroll to 8 AM on mount
  - [ ] Use CSS Grid: gutter column (60px) + 1 day column

- [ ] Task 3: Tests (AC: #1-#7)
  - [ ] Test: DayHeader renders day name and date
  - [ ] Test: DayHeader highlights today
  - [ ] Test: DayView renders time gutter and grid
  - [ ] Test: DayView auto-scrolls on mount
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No event rendering** — events come in Epic 4
- **No drag-to-create** — Epic 4
- **No click-to-create** — Epic 4
