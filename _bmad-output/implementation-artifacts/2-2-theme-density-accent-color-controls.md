# Story 2.2: Theme, Density & Accent Color Controls

Status: done

## Story

As a user,
I want to switch between dark and light mode, toggle display density, and customize my accent color,
so that I can personalize the calendar to my preferences.

## Acceptance Criteria

1. The user can toggle dark/light mode; all semantic color tokens swap to the corresponding theme and the preference persists in the Zustand UI store
2. The user can toggle density between compact and comfortable; the layout switches between compact (48px rows) and comfortable (64px rows)
3. The user can select an accent color from ~24 presets or enter a custom hex value; the accent CSS variable updates and all accent-colored elements reflect the change
4. Theme, density, and accent preferences persist across page reloads via the Zustand store (using `zustand/middleware` persist)

## Tasks / Subtasks

- [x] Task 1: Add `accentColor` state to `useUIStore` (AC: #3, #4)
  - [x] Add `accentColor: string` field, default `'#2f81f7'`
  - [x] Add `setAccentColor` action
  - [x] Add `toggleTheme` convenience action

- [x] Task 2: Add Zustand persist middleware for preferences (AC: #4)
  - [x] Wrap store with `persist` from `zustand/middleware`
  - [x] Storage key: `'dev-calendar-ui'`
  - [x] Persist only: theme, density, accentColor (NOT sidebarOpen)
  - [x] Updated existing tests to account for persist middleware

- [x] Task 3: Wire accent color to CSS variable in `app-shell.tsx` (AC: #3)
  - [x] Read `accentColor` from `useUIStore`
  - [x] Apply via `html.style.setProperty('--color-accent', accentColor)` in useEffect
  - [x] Added to useEffect dependency array

- [x] Task 4: Sync initial theme from persisted store to `<html>` (AC: #4)
  - [x] Existing useEffect handles this — verified on reload with persist middleware

- [x] Task 5: Create appearance settings panel component (AC: #1, #2, #3)
  - [x] Created `features/settings/components/appearance-settings.tsx`
  - [x] Theme toggle: Dark / Light buttons with current selection
  - [x] Density toggle: Compact / Comfortable buttons with current selection
  - [x] Accent color picker: grid of 24 color dots + custom hex input
  - [x] Selected color shows checkmark, invalid hex shows error border
  - [x] All controls call store actions

- [x] Task 6: Add settings trigger to the sidebar (AC: #1, #2, #3)
  - [x] Added gear icon "Settings" button to sidebar bottom
  - [x] Toggles appearance settings panel inline

- [x] Task 7: Tests (AC: #1-#4)
  - [x] Test: setAccentColor updates state
  - [x] Test: toggleTheme toggles between dark/light
  - [x] Test: persist saves theme, density, accentColor to localStorage
  - [x] Test: persist does NOT save sidebarOpen
  - [x] Test: appearance-settings renders all controls
  - [x] Test: clicking theme toggle calls setTheme
  - [x] Test: clicking accent preset calls setAccentColor
  - [x] Test: invalid hex does not change accent
  - [x] Test: app-shell applies accent color to html style
  - [x] Run pnpm typecheck — passed
  - [x] Run pnpm test — 168 tests passed (30 shared + 91 api + 47 web)

## Dev Agent Record

### Completion Notes

- Added `accentColor` state and `toggleTheme`/`setAccentColor` actions to `useUIStore`
- Wrapped store with `persist` middleware, persisting theme/density/accentColor to localStorage
- Extended `AppShell` useEffect to apply accent color to `<html>` element
- Created `AppearanceSettings` component with theme, density, and accent controls
- Integrated settings panel into sidebar with collapsible gear button
- All 168 tests pass, full typecheck passes

### Change Log

- 2026-04-03: Implemented theme/density/accent controls (Tasks 1-7)

## File List

### New Files
- `packages/web/src/features/settings/components/appearance-settings.tsx`
- `packages/web/src/features/settings/components/appearance-settings.test.tsx`
- `packages/web/src/features/settings/index.ts`

### Modified Files
- `packages/web/src/stores/ui-store.ts` — accentColor, toggleTheme, persist middleware
- `packages/web/src/stores/ui-store.test.ts` — new tests for accentColor, toggleTheme, persist
- `packages/web/src/layouts/app-shell.tsx` — accent color in useEffect
- `packages/web/src/layouts/app-shell.test.tsx` — accent color test, localStorage cleanup
- `packages/web/src/layouts/sidebar.tsx` — settings trigger + AppearanceSettings panel
- `docs/architecture.md` — Story 2-2 section

## Dev Notes

### Architecture Compliance

**Feature folder structure:**
```
packages/web/src/
├── features/
│   └── settings/
│       ├── components/
│       │   ├── appearance-settings.tsx
│       │   └── appearance-settings.test.tsx
│       └── index.ts
├── stores/
│   └── ui-store.ts          # Updated: accentColor + persist middleware
└── layouts/
    ├── app-shell.tsx         # Updated: accent color in useEffect
    └── sidebar.tsx           # Updated: settings trigger
```

### What NOT to Build

- **No system theme auto-detection** — defer to a future story
- **No keyboard shortcuts** for theme/density — Epic 5
- **No command palette integration** — Epic 5
- **No settings page/route** — appearance panel lives in sidebar
- **No animation on theme switch** — simple class swap is sufficient
