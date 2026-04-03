# Story 9.1: View Preferences & Accessibility Baseline

Status: ready-for-dev

## Story

As a user,
I want to set my default calendar view and have accessible keyboard navigation,
so that the app works well with my preferred workflow and assistive technology.

## Acceptance Criteria

1. Default view preference (day/week/month/schedule) persisted in Zustand
2. Root route redirects to user's preferred default view
3. Focus-visible styles on all interactive elements
4. Reduced motion media query respects prefers-reduced-motion
5. ARIA landmarks on header, sidebar, main, footer

## Tasks / Subtasks

- [ ] Task 1: Add defaultView to UI store
- [ ] Task 2: Default view selector in appearance settings
- [ ] Task 3: Add focus-visible and reduced-motion CSS
- [ ] Task 4: Verify ARIA landmarks

## What NOT to Build

- **No week start day preference** — future enhancement
- **No full WCAG audit** — baseline only
