# Story 3.4: Schedule View

Status: ready-for-dev

## Story

As a user,
I want to see a schedule/agenda view showing upcoming days in a list format,
so that I can quickly scan what's coming up without a grid layout.

## Acceptance Criteria

1. The schedule view shows the next 14 days as date-grouped sections
2. Each section shows the date header (day name, month day, year)
3. Today's section header is highlighted with accent color
4. Empty days show a "No events" placeholder
5. The view scrolls vertically through all 14 days
6. All styling uses design tokens — no hardcoded colors or sizes

## Tasks / Subtasks

- [ ] Task 1: Update ScheduleView component (AC: #1-#6)
  - [ ] Update `packages/web/src/features/views/components/schedule-view.tsx`
  - [ ] Generate 14 days starting from today
  - [ ] Render date-grouped sections with headers
  - [ ] Today header highlighted with accent
  - [ ] "No events" placeholder per day

- [ ] Task 2: Tests (AC: #1-#6)
  - [ ] Test: ScheduleView renders 14 day sections
  - [ ] Test: Today is highlighted
  - [ ] Test: Shows "No events" placeholder
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No event listing** — events come in Epic 4
- **No infinite scroll** — fixed 14 days for now
