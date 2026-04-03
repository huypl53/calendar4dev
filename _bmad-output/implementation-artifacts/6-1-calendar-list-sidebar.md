# Story 6.1: Calendar List in Sidebar

Status: ready-for-dev

## Story

As a user,
I want to see and manage my calendars in the sidebar,
so that I can toggle calendar visibility and identify calendars by color.

## Acceptance Criteria

1. Sidebar shows list of user's calendars from useCalendarsQuery
2. Each calendar shown with color badge and name
3. Bootstrap creates default calendar on first load
4. Calendar items show toggle checkbox for visibility (UI state only)

## Tasks / Subtasks

- [ ] Task 1: CalendarList component
  - [ ] `packages/web/src/features/calendars/components/calendar-list.tsx`
  - [ ] Fetch calendars, render with Badge (dot variant) + name
  - [ ] Checkbox toggle for visibility (zustand state)

- [ ] Task 2: Integrate into sidebar
  - [ ] Replace "Calendar List" placeholder

- [ ] Task 3: Auto-bootstrap on app load
  - [ ] Call useBootstrapCalendar on mount

## What NOT to Build

- **No create/edit/delete calendar UI** — future story
- **No calendar sharing** — Epic 11
