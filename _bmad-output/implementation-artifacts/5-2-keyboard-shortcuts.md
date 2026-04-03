# Story 5.2: Keyboard Shortcuts

Status: ready-for-dev

## Story

As a user,
I want keyboard shortcuts for common actions,
so that I can navigate the calendar efficiently without a mouse.

## Acceptance Criteria

1. `d` — switch to day view
2. `w` — switch to week view
3. `m` — switch to month view
4. `s` — switch to schedule view
5. `t` — go to today
6. `c` — open create event dialog
7. `j`/`k` or left/right arrows — navigate prev/next in current view
8. `?` — toggle shortcut help
9. Shortcuts disabled when focus is in an input/textarea/dialog

## Tasks / Subtasks

- [ ] Task 1: Global keyboard shortcut handler
  - [ ] `packages/web/src/hooks/use-keyboard-shortcuts.ts`
  - [ ] Register shortcuts with actions
  - [ ] Input/dialog focus guard

- [ ] Task 2: Wire shortcuts to navigation and actions
  - [ ] Mount in AppShell

## What NOT to Build

- **No custom shortcut remapping** — future enhancement
- **No vim-style motions** — keep it simple
