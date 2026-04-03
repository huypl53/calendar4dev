# Story 10.1: CLI Tool for Calendar Management

Status: ready-for-dev

## Story

As a developer,
I want a CLI tool to manage my calendar from the terminal,
so that I can create/list events without leaving my workflow.

## Acceptance Criteria

1. CLI command: `devcal events list` — list events for today/this week
2. CLI command: `devcal events create` — create a quick event
3. CLI command: `devcal calendars list` — list calendars
4. Configuration via environment variables (API_URL, AUTH_TOKEN)
5. Output in JSON or table format

## Tasks / Subtasks

- [ ] Task 1: CLI package setup with commander.js
  - [ ] `packages/cli/` package with TypeScript
  - [ ] Entry point bin script

- [ ] Task 2: API client for CLI
  - [ ] Fetch wrapper with auth token header

- [ ] Task 3: Commands implementation
  - [ ] events list, events create, calendars list

## What NOT to Build

- **No interactive TUI** — simple CLI only
- **No auth flow in CLI** — token-based
