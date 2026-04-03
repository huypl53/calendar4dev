# Story 2.3: Core UI Primitives

Status: done

## Story

As a developer,
I want a set of reusable, token-aware UI primitive components (Button, IconButton, Badge, Tooltip),
so that all features in the calendar app share a consistent look and feel built on the design token system.

## Acceptance Criteria

1. A `Button` component exists with variants (primary, secondary, ghost, danger), sizes (sm, md), and disabled state; all styles use design tokens (no hardcoded colors/sizes)
2. An `IconButton` component exists for icon-only actions (e.g., sidebar toggle, navigation arrows) with consistent sizing, hover state, and aria-label requirement
3. A `Badge` component exists for small labels (e.g., event count, calendar color dot) with color customization via props
4. A `Tooltip` component exists that shows on hover/focus with proper positioning and delay; uses design tokens for colors and typography
5. All primitives render correctly in both dark and light themes and both density modes
6. All primitives have co-located unit tests and pass typecheck

## Tasks / Subtasks

- [ ] Task 1: Create `Button` component (AC: #1, #5)
  - [ ] Create `packages/web/src/components/ui/button.tsx`
  - [ ] Variants: primary (accent bg), secondary (tertiary bg), ghost (transparent), danger (danger color)
  - [ ] Sizes: sm (h-7 px-2 text-small), md (h-9 px-3 text-body)
  - [ ] Props: variant, size, disabled, children, onClick, type, className
  - [ ] All colors from CSS custom properties, no hardcoded values
  - [ ] Disabled state: reduced opacity, pointer-events-none

- [ ] Task 2: Create `IconButton` component (AC: #2, #5)
  - [ ] Create `packages/web/src/components/ui/icon-button.tsx`
  - [ ] Sizes: sm (h-7 w-7), md (h-8 w-8)
  - [ ] Require `aria-label` prop for accessibility
  - [ ] Hover: bg-tertiary background
  - [ ] Accepts children (SVG icon) and onClick

- [ ] Task 3: Create `Badge` component (AC: #3, #5)
  - [ ] Create `packages/web/src/components/ui/badge.tsx`
  - [ ] Props: children, color (optional hex override), variant (default, dot)
  - [ ] Default variant: small rounded label with muted background
  - [ ] Dot variant: small colored circle (for calendar color indicators)
  - [ ] Uses font-size-tiny token, text-secondary for default

- [ ] Task 4: Create `Tooltip` component (AC: #4, #5)
  - [ ] Create `packages/web/src/components/ui/tooltip.tsx`
  - [ ] Shows on hover and focus (keyboard accessible)
  - [ ] 300ms show delay to prevent flicker
  - [ ] Positions above trigger by default
  - [ ] Uses bg-tertiary background, text-primary text, font-size-tiny
  - [ ] Props: content (string), children (trigger element)

- [ ] Task 5: Create barrel export (AC: #1-#4)
  - [ ] Create `packages/web/src/components/ui/index.ts`
  - [ ] Export all primitives

- [ ] Task 6: Refactor existing inline buttons to use primitives (AC: #1, #2)
  - [ ] Replace header hamburger button with `IconButton`
  - [ ] Replace header nav links styling to be consistent with token system
  - [ ] Replace sidebar settings toggle with `IconButton`
  - [ ] Replace appearance-settings buttons with `Button` component

- [ ] Task 7: Tests (AC: #1-#6)
  - [ ] Test: Button renders all variants with correct classes
  - [ ] Test: Button disabled state
  - [ ] Test: IconButton requires aria-label
  - [ ] Test: IconButton click handler fires
  - [ ] Test: Badge renders children and dot variant
  - [ ] Test: Tooltip shows on hover after delay
  - [ ] Test: Tooltip shows on focus
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No dropdown/select** — those are overlay components in Story 2-5
- **No modal/dialog** — Story 2-5
- **No toast/snackbar** — Story 2-5
- **No form inputs** (text input, checkbox) — build as needed per feature
- **No Storybook** — not in scope for MVP
- **No component library documentation** — defer to later

## Dev Notes

### Architecture Compliance

**Component location:**
```
packages/web/src/
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── button.test.tsx
│       ├── icon-button.tsx
│       ├── icon-button.test.tsx
│       ├── badge.tsx
│       ├── badge.test.tsx
│       ├── tooltip.tsx
│       ├── tooltip.test.tsx
│       └── index.ts
```

### Design Token Usage

All primitives MUST use CSS custom properties for theming:
- Colors: `var(--color-*)` tokens
- Typography: `var(--font-size-*)`, `var(--font-weight-*)` tokens
- Spacing: `var(--space-*)` tokens
- Density: Components should respect density mode naturally through token values

### Tailwind Pattern

Use Tailwind with CSS variable references: `bg-[var(--color-accent)]`, `text-[var(--color-text-primary)]`, etc. This ensures theme switching works via CSS class swap without JS re-renders.
