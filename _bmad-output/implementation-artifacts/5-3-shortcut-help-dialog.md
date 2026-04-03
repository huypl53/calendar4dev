# Story 5.3: Keyboard Shortcut Help Dialog

Status: ready-for-dev

## Story

As a user,
I want to see a list of available keyboard shortcuts,
so that I can learn and reference them.

## Acceptance Criteria

1. `?` key opens a help dialog showing all shortcuts
2. Dialog lists shortcut key and description in a clean layout
3. Dialog closes on Escape or clicking outside
4. Grouped by category (navigation, views, actions)

## Tasks / Subtasks

- [ ] Task 1: ShortcutHelpDialog component
  - [ ] `packages/web/src/features/command-palette/shortcut-help-dialog.tsx`
  - [ ] Uses Dialog from UI library
  - [ ] Lists all registered shortcuts

## What NOT to Build

- **No interactive shortcut editor** — display only
