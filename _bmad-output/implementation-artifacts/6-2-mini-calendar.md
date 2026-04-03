# Story 6.2: Mini Calendar in Sidebar

Status: ready-for-dev

## Story

As a user,
I want a small month calendar in the sidebar,
so that I can quickly navigate to any date.

## Acceptance Criteria

1. Mini calendar shows current month with day numbers
2. Today highlighted with accent
3. Clicking a day navigates to that date in the current view
4. Prev/next month arrows to navigate months
5. Uses compact sizing from design tokens

## Tasks / Subtasks

- [ ] Task 1: MiniCalendar component
  - [ ] `packages/web/src/features/calendars/components/mini-calendar.tsx`
  - [ ] Month grid with day numbers
  - [ ] Click handler navigates to date

- [ ] Task 2: Integrate into sidebar
  - [ ] Replace "Mini Calendar" placeholder

## What NOT to Build

- **No drag selection** — click only
- **No event dots on days** — future enhancement
