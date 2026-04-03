# Story 13.1: Event Drag & Drop (Time Grid)

Status: ready-for-dev

## Story

As a user,
I want to drag events in the week and day views to reschedule them,
so that I can quickly adjust my schedule without opening edit dialogs.

## Acceptance Criteria

1. Events in the week/day time grid can be dragged to a new time slot
2. Dragging an event updates startTime and endTime (preserving duration)
3. Visual feedback: dragged event shows as semi-transparent at original position; ghost follows cursor
4. On drop, optimistic update fires immediately; API PATCH called in background
5. If API call fails, event snaps back to original position with error toast
6. Events cannot be dragged outside the day columns (clamped to 0–23:59)
7. Drag threshold: 5px movement before drag mode activates (prevents accidental drags on click)
8. Does not break existing click-to-edit behavior

## Tasks / Subtasks

- [ ] Task 1: Drag state in TimeGrid
  - [ ] Add drag state: `dragging: { eventId, originalStart, originalEnd, currentOffset }` 
  - [ ] `onMouseDown` on EventBlock starts potential drag (record position)
  - [ ] `onMouseMove` on grid: if moved >5px, activate drag mode
  - [ ] `onMouseUp`: drop at target time slot

- [ ] Task 2: Visual feedback
  - [ ] Dragging event: opacity-50 at original position
  - [ ] Ghost element: absolute positioned div following mouse cursor

- [ ] Task 3: Time calculation
  - [ ] Map mouse Y position to hour offset within grid
  - [ ] Clamp to day boundaries
  - [ ] Snap to 15-minute intervals

- [ ] Task 4: Mutation integration
  - [ ] On drop: call useUpdateEventMutation with new startTime/endTime
  - [ ] Optimistic update in React Query cache
  - [ ] Revert on error

- [ ] Task 5: Tests
  - [ ] Unit tests for time calculation helpers
  - [ ] Run typecheck + tests

## What NOT to Build

- **No month view drag** — month grid has different layout, post-MVP
- **No resize handles** — drag bottom edge to resize, post-MVP  
- **No cross-day dragging** — dragging to different day column, post-MVP
- **No touch support** — desktop only for now
