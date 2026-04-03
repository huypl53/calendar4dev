# Story 5.1: Command Palette

Status: ready-for-dev

## Story

As a user,
I want a fuzzy-search command palette (Cmd/Ctrl+K),
so that I can quickly navigate and perform actions without leaving the keyboard.

## Acceptance Criteria

1. Cmd/Ctrl+K opens the command palette dialog
2. Escape or clicking outside closes it
3. Fuzzy search filters commands as the user types
4. Commands include: navigate to views, go to today, create event, toggle theme/density, toggle sidebar
5. Selected command executes and closes palette
6. Arrow keys navigate the command list, Enter executes

## Tasks / Subtasks

- [ ] Task 1: Command palette component
  - [ ] `packages/web/src/features/command-palette/command-palette.tsx`
  - [ ] Search input + filtered command list
  - [ ] Keyboard navigation (arrows + enter)

- [ ] Task 2: Command registry
  - [ ] `packages/web/src/features/command-palette/commands.ts`
  - [ ] Register all available commands with labels, shortcuts, actions

- [ ] Task 3: Global keyboard listener
  - [ ] Cmd/Ctrl+K opens palette
  - [ ] Mount in AppShell

## What NOT to Build

- **No event search** — Epic 14
- **No recently used commands** — future enhancement
