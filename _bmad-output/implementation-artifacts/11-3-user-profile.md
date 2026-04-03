# Story 11.3: User Profile & Account Settings

Status: ready-for-dev

## Story

As a user,
I want to update my display name and change my password,
so that my profile is accurate and my account is secure.

## Acceptance Criteria

1. Profile settings panel accessible from the sidebar (below appearance settings)
2. Display name field: shows current name, editable, saved on submit
3. Password change: current password + new password + confirm fields; shows error if current is wrong; success toast on change
4. GitHub OAuth users see GitHub avatar and name (read-only, no password section)
5. PATCH /api/user/profile — update name; returns updated user
6. POST /api/user/change-password — validates current password via Better Auth, sets new password
7. Logout button in sidebar

## Tasks / Subtasks

- [ ] Task 1: API routes `packages/api/src/routes/user.ts`
  - [ ] PATCH /api/user/profile — update user.name
  - [ ] POST /api/user/change-password — verify current password hash, set new; 400 if wrong
  - [ ] Mount in routes/index.ts

- [ ] Task 2: Frontend hooks `packages/web/src/features/user/hooks/`
  - [ ] `use-user-profile-mutation.ts` — useUpdateProfileMutation, useChangePasswordMutation

- [ ] Task 3: Profile settings component `packages/web/src/features/user/components/profile-settings.tsx`
  - [ ] Name field with save button
  - [ ] Password change section (hidden for OAuth-only accounts)
  - [ ] Logout button calls `authClient.signOut()` then redirects to /login

- [ ] Task 4: Integrate into sidebar
  - [ ] Add "Profile" section to sidebar settings panel (below AppearanceSettings)
  - [ ] Show user avatar/initials + email in sidebar header

- [ ] Task 5: Tests
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No email change** — requires verification flow, post-MVP
- **No avatar upload** — post-MVP
- **No 2FA** — post-MVP
