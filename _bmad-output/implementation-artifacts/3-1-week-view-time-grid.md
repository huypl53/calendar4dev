# Story 3.1: Week View Time Grid

Status: ready-for-dev

## Story

As a user,
I want to see a week view with a time grid showing 7 day columns and 24 hour rows,
so that I can visualize my schedule at a glance.

## Acceptance Criteria

1. The week view displays 7 day columns (Mon-Sun or Sun-Sat based on locale) with date headers showing day name and date number
2. A time gutter on the left shows 24 hour labels (12 AM through 11 PM)
3. The grid has horizontal lines at each hour boundary with half-hour dashed lines
4. The grid scrolls vertically; on initial load it auto-scrolls to 8:00 AM
5. The all-day section above the time grid shows a row for all-day events (empty for now, structure only)
6. Day columns use the density row height token for each hour cell height
7. The current day's column header is visually highlighted with the accent color
8. All styling uses design tokens — no hardcoded colors or sizes

## Tasks / Subtasks

- [ ] Task 1: Create date utilities for week calculation (AC: #1)
  - [ ] `getWeekDays(date: string): string[]` — returns 7 YYYY-MM-DD dates for the week containing the given date
  - [ ] `formatDayHeader(date: string): { dayName: string, dayNumber: number }` — formats for column header
  - [ ] `isToday(date: string): boolean` — check if date is today
  - [ ] Add to `packages/web/src/lib/date-utils.ts`

- [ ] Task 2: Create TimeGutter component (AC: #2, #6)
  - [ ] Create `packages/web/src/features/views/components/time-gutter.tsx`
  - [ ] Renders 24 hour labels from 12 AM to 11 PM
  - [ ] Each label positioned at the top of its hour slot
  - [ ] Uses font-mono, font-size-tiny, text-tertiary tokens

- [ ] Task 3: Create TimeGrid component (AC: #3, #6, #8)
  - [ ] Create `packages/web/src/features/views/components/time-grid.tsx`
  - [ ] Renders a grid of columns × 24 hour rows
  - [ ] Hour boundary lines: solid border-color
  - [ ] Half-hour lines: dashed border-color
  - [ ] Each row height = density-row-height token
  - [ ] Props: days (string[]), children (for event overlays later)

- [ ] Task 4: Create WeekHeader component (AC: #1, #5, #7)
  - [ ] Create `packages/web/src/features/views/components/week-header.tsx`
  - [ ] Day column headers with day name + date number
  - [ ] Today's column highlighted with accent color
  - [ ] All-day section row below headers (empty placeholder)

- [ ] Task 5: Assemble WeekView (AC: #1-#8)
  - [ ] Update `packages/web/src/features/views/components/week-view.tsx`
  - [ ] Compose: WeekHeader + scrollable area containing TimeGutter + TimeGrid
  - [ ] Auto-scroll to 8 AM on mount via scrollTop calculation
  - [ ] Use CSS Grid: gutter column (60px) + 7 equal day columns

- [ ] Task 6: Tests (AC: #1-#8)
  - [ ] Test: getWeekDays returns 7 dates
  - [ ] Test: isToday returns true for today
  - [ ] Test: TimeGutter renders 24 hour labels
  - [ ] Test: TimeGrid renders correct number of rows and columns
  - [ ] Test: WeekHeader highlights today's column
  - [ ] Test: WeekView auto-scrolls on mount
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No event rendering** — events come in Epic 4
- **No drag-to-create** — Epic 4
- **No click-to-create** — Epic 4
- **No time zone support** — single timezone for MVP
- **No week start preference** — default to Monday start
