# Story 2.5: Overlay & Feedback Components

Status: ready-for-dev

## Story

As a user,
I want modal dialogs, dropdown menus, and toast notifications,
so that I can interact with overlays for event creation, context menus, and receive feedback on actions.

## Acceptance Criteria

1. A `Dialog` component exists that renders a modal overlay with backdrop, focus trap via native `<dialog>`, close on Escape and backdrop click, and uses design tokens for styling
2. A `DropdownMenu` component exists that renders a positioned menu anchored to a trigger element, closes on outside click and Escape, and supports keyboard navigation (arrow keys)
3. A `Toast` component and `useToast` hook exist that show transient feedback messages with auto-dismiss (5 seconds default), support success/error/info variants, and stack multiple toasts
4. All overlay components render correctly in both themes and density modes
5. All overlay components have co-located unit tests and pass typecheck

## Tasks / Subtasks

- [ ] Task 1: Create `Dialog` component (AC: #1, #4)
  - [ ] Create `packages/web/src/components/ui/dialog.tsx`
  - [ ] Use native `<dialog>` element for built-in focus trap and Escape handling
  - [ ] Props: open, onClose, title (optional), children
  - [ ] Backdrop via `::backdrop` pseudo-element styled with dark overlay
  - [ ] Content panel: bg-secondary, border, rounded, max-w, padding with tokens

- [ ] Task 2: Create `DropdownMenu` component (AC: #2, #4)
  - [ ] Create `packages/web/src/components/ui/dropdown-menu.tsx`
  - [ ] Props: trigger (ReactNode), items (array of { label, onClick, icon? }), align ('left' | 'right')
  - [ ] Positioned absolutely below trigger
  - [ ] Close on outside click (document listener) and Escape
  - [ ] Arrow key navigation between items
  - [ ] Menu item hover/focus state with bg-tertiary

- [ ] Task 3: Create `Toast` system (AC: #3, #4)
  - [ ] Create `packages/web/src/components/ui/toast.tsx` — Toast component
  - [ ] Create `packages/web/src/stores/toast-store.ts` — Zustand store for toast state
  - [ ] `useToast` hook returns `{ toast }` function
  - [ ] Variants: success (green), error (danger), info (accent)
  - [ ] Auto-dismiss after 5 seconds (configurable)
  - [ ] Toast container positioned fixed bottom-right
  - [ ] Multiple toasts stack vertically

- [ ] Task 4: Update barrel export (AC: #1-#3)
  - [ ] Export Dialog, DropdownMenu, Toast, useToast from `components/ui/index.ts`

- [ ] Task 5: Tests (AC: #1-#5)
  - [ ] Test: Dialog opens and closes via onClose callback
  - [ ] Test: Dialog closes on Escape key
  - [ ] Test: DropdownMenu opens on trigger click
  - [ ] Test: DropdownMenu closes on outside click
  - [ ] Test: DropdownMenu keyboard navigation
  - [ ] Test: Toast renders with correct variant styling
  - [ ] Test: Toast auto-dismisses after timeout
  - [ ] Test: Multiple toasts stack
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No confirmation dialog variant** — build as needed per feature
- **No toast persistence** — toasts are ephemeral, no localStorage
- **No nested dropdowns / submenus** — single-level only for MVP
- **No popover component** — use Tooltip for simple hints, Dialog for complex content
