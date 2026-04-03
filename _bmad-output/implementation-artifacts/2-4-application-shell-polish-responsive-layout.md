# Story 2.4: Application Shell Polish & Responsive Layout

Status: done

## Story

As a user,
I want the calendar application shell to be responsive and polished with smooth sidebar transitions and a functional header with navigation,
so that I can use the calendar comfortably on different screen sizes.

## Acceptance Criteria

1. Sidebar slides open/closed with a CSS transition instead of instant width change
2. On screens < 768px, sidebar renders as an overlay with a backdrop; clicking the backdrop closes the sidebar
3. Header displays a "Today" button that navigates to the current date in the active view
4. Header view switcher (Day/Week/Month/Schedule) uses the Button primitive with active state highlighting
5. Status bar shows the current local time (updating every minute) and a placeholder sync indicator
6. All layout components use design tokens — no hardcoded pixel values outside of density tokens

## Tasks / Subtasks

- [ ] Task 1: Add sidebar CSS transition (AC: #1)
  - [ ] Add `transition-[width]` or `transition-all` to sidebar column
  - [ ] Sidebar opening/closing animates smoothly (~200ms ease)

- [ ] Task 2: Responsive sidebar overlay for mobile (AC: #2)
  - [ ] Add `useMediaQuery` hook or CSS-based responsive check
  - [ ] On < 768px: sidebar renders as fixed overlay with z-index above content
  - [ ] Backdrop overlay behind sidebar, clicking it calls toggleSidebar
  - [ ] Sidebar auto-closes on navigation (via route change)

- [ ] Task 3: Polish header navigation (AC: #3, #4)
  - [ ] Add "Today" button using Button ghost variant
  - [ ] Refactor view switcher to use Button components with active state (primary variant for current view)
  - [ ] View switcher detects current route to highlight active view

- [ ] Task 4: Live clock in status bar (AC: #5)
  - [ ] Display current local time formatted as HH:MM AM/PM
  - [ ] Update every minute using setInterval
  - [ ] Clean up interval on unmount

- [ ] Task 5: Tests (AC: #1-#6)
  - [ ] Test: sidebar transition class is applied
  - [ ] Test: backdrop renders on mobile when sidebar is open
  - [ ] Test: clicking backdrop closes sidebar
  - [ ] Test: Today button renders in header
  - [ ] Test: view switcher highlights active route
  - [ ] Test: status bar shows time
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No breakpoint-based layout changes beyond sidebar overlay** — the grid layout stays the same
- **No hamburger menu replacement** — keep the existing hamburger toggle
- **No mobile-specific header** — same header, just responsive sidebar
- **No route-based sidebar content changes** — sidebar content stays the same across views
