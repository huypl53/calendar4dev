# Story 3.6: Now Line (Current Time Indicator)

Status: ready-for-dev

## Story

As a user,
I want to see a red line on the time grid indicating the current time,
so that I can see where "now" is in my schedule.

## Acceptance Criteria

1. A horizontal red line appears at the current time position in the day and week time grids
2. The line uses the `--color-now-line` design token
3. The line updates every minute to track current time
4. The line only appears on today's column (in week view, only on today's day column)
5. The line spans the full width of the day column
6. All styling uses design tokens

## Tasks / Subtasks

- [ ] Task 1: Create NowLine component (AC: #1-#6)
  - [ ] Create `packages/web/src/features/views/components/now-line.tsx`
  - [ ] Calculate vertical position based on current time and row height
  - [ ] Update position every 60 seconds
  - [ ] Render as absolute-positioned line within the grid

- [ ] Task 2: Integrate NowLine into WeekView and DayView (AC: #1, #4)
  - [ ] Add NowLine to WeekView (only on today's column)
  - [ ] Add NowLine to DayView (only if viewing today)

- [ ] Task 3: Tests (AC: #1-#6)
  - [ ] Test: NowLine renders with correct styling
  - [ ] Test: NowLine uses now-line color token
  - [ ] Test: NowLine position calculation
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No smooth animation** — minute-level updates are sufficient
- **No now-line in month or schedule views**
