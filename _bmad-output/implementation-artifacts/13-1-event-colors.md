# Story 13.1: Per-Event Color Override

Status: ready-for-dev

## Story

As a user,
I want to assign a custom color to individual events,
so that I can visually distinguish events regardless of their calendar color.

## Acceptance Criteria

1. EventFormDialog has a color swatch picker for event color (uses CALENDAR_COLORS presets + clear option)
2. "No color" option defaults to calendar color (current behavior preserved)
3. Color stored in event.color (existing DB field); API already supports it
4. EventBlock, MonthGrid, and ScheduleView use event.color when set, falling back to calendarColorMap
5. All-day event toggle added to EventFormDialog (allDay field)
6. Existing events with null color are unaffected

## Tasks / Subtasks

- [ ] Task 1: Color picker in EventFormDialog
  - [ ] Add color state initialized from event.color ?? null
  - [ ] Row of color swatches (from CALENDAR_COLORS) + "None" swatch
  - [ ] Include color in create/update payload

- [ ] Task 2: All-day toggle in EventFormDialog  
  - [ ] Add allDay checkbox; when checked, hide time pickers, use date-only
  - [ ] Include allDay in create/update payload

- [ ] Task 3: Tests
  - [ ] Tests for color selector rendering and selection
  - [ ] Run typecheck + tests

## What NOT to Build

- **No custom hex input** — presets only, post-MVP
- **No color category labels** — text labels alongside color, post-MVP
