# Story 3.5: Navigation & Date Controls

Status: ready-for-dev

## Story

As a user,
I want prev/next navigation arrows and a "Today" button in the header,
so that I can move through dates in any view.

## Acceptance Criteria

1. Prev/next arrows navigate by appropriate unit per view: day (±1 day), week (±7 days), month (±1 month)
2. The header displays the current date context label (e.g. "April 2026" for month, "Mar 30 – Apr 5" for week, "April 3" for day)
3. The "Today" button navigates to today's date in the current view
4. Navigation preserves the current view type
5. All navigation uses router navigation (not state)
6. All styling uses design tokens

## Tasks / Subtasks

- [ ] Task 1: Add navigation utilities (AC: #1)
  - [ ] Add `getDateLabel(view, date)` to date-utils returning view-appropriate label
  - [ ] Add `navigateDate(view, date, direction)` returning new date string

- [ ] Task 2: Update Header with date navigation (AC: #1-#6)
  - [ ] Add prev/next IconButtons to header
  - [ ] Show date context label between arrows
  - [ ] Wire Today button to current view (not always week)
  - [ ] Use `useNavigate` for programmatic navigation

- [ ] Task 3: Tests (AC: #1-#6)
  - [ ] Test: date label formats correctly per view
  - [ ] Test: navigation calculates correct dates
  - [ ] Test: prev/next buttons present in header
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No date picker modal** — deferred
- **No keyboard shortcuts** — Epic 5
