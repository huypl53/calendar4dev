# Story 3.3: Month View

Status: ready-for-dev

## Story

As a user,
I want to see a month view with a 6-week calendar grid,
so that I can see a broader overview of my schedule.

## Acceptance Criteria

1. The month view displays a 6-week × 7-day grid (42 cells) starting from Monday
2. A header row shows day-of-week labels (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
3. Each cell shows the day number; days outside the current month appear dimmed
4. Today's cell is highlighted with accent color
5. The month/year title is shown above the grid
6. All styling uses design tokens — no hardcoded colors or sizes
7. Cells use mini-cal-cell density token for sizing

## Tasks / Subtasks

- [ ] Task 1: Create MonthGrid component (AC: #1-#4, #6, #7)
  - [ ] Create `packages/web/src/features/views/components/month-grid.tsx`
  - [ ] 6 rows × 7 columns grid using getMonthGridDates
  - [ ] Day-of-week header row
  - [ ] Day numbers with dimmed out-of-month styling
  - [ ] Today highlighted with accent

- [ ] Task 2: Update MonthView component (AC: #1-#7)
  - [ ] Update `packages/web/src/features/views/components/month-view.tsx`
  - [ ] Show month/year title
  - [ ] Compose MonthGrid

- [ ] Task 3: Tests (AC: #1-#7)
  - [ ] Test: MonthGrid renders 42 cells
  - [ ] Test: MonthGrid shows day-of-week headers
  - [ ] Test: Out-of-month days are dimmed
  - [ ] Test: Today is highlighted
  - [ ] Test: MonthView shows month/year title
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No event dots/previews** — events come in Epic 4
- **No click-to-navigate to day** — comes in story 3-5
