# Story 4.6: Event Editing & Deletion UI

Status: ready-for-dev

## Story

As a user,
I want to click an event to edit or delete it,
so that I can manage my existing events.

## Acceptance Criteria

1. Clicking an event block opens edit dialog pre-populated with event data
2. Edit form allows changing title, description, start/end time
3. Save calls useUpdateEventMutation
4. Delete button with confirmation
5. Toast notifications on success/error

## Tasks / Subtasks

- [ ] Task 1: Reuse event form dialog for editing
  - [ ] EventFormDialog accepts optional event prop for edit mode
  - [ ] Pre-populate fields when editing

- [ ] Task 2: Delete flow
  - [ ] Delete button in edit dialog
  - [ ] Confirmation prompt before delete
  - [ ] Calls useDeleteEventMutation

- [ ] Task 3: Wire event click to edit
  - [ ] EventBlock onClick opens edit dialog
  - [ ] Fetch full event data if needed

## What NOT to Build

- **No inline editing** — dialog only
- **No bulk operations** — single event at a time
