# Story 11.1: Calendar Sharing API

Status: ready-for-dev

## Story

As a developer,
I want REST API endpoints for sharing calendars with other users and viewing shared calendars,
so that the frontend can enable collaboration features.

## Acceptance Criteria

1. POST /api/calendars/:id/members — add a member by email with a permission level (details, edit, admin); returns 404 if user not found
2. GET /api/calendars/:id/members — list all members; only accessible by calendar owner or admin member
3. PATCH /api/calendars/:id/members/:memberId — update a member's permission level; owner or admin only; cannot demote the owner
4. DELETE /api/calendars/:id/members/:memberId — remove a member; owner or admin only; cannot remove the owner
5. GET /api/calendars/shared — list calendars shared with the authenticated user (where they are a member, not the owner)
6. GET /api/events updated: listEvents now also returns events from shared calendars (where user has ≥ details permission)
7. All routes require authentication
8. POST/PATCH/DELETE return 403 when user lacks permission

## Tasks / Subtasks

- [ ] Task 1: Shared Zod schemas in `packages/shared/src/schemas/calendar.ts`
  - [ ] `addCalendarMemberSchema` — { email, permissionLevel }
  - [ ] `updateCalendarMemberSchema` — { permissionLevel }
  - [ ] Export from shared index

- [ ] Task 2: Calendar members service `packages/api/src/services/calendar-members.ts`
  - [ ] `addMember(calendarId, email, permissionLevel, requesterId)` — lookup user by email, insert member, throw ConflictError if already member
  - [ ] `listMembers(calendarId, requesterId)` — verify requester is owner or admin
  - [ ] `updateMember(calendarId, memberId, permissionLevel, requesterId)` — verify requester is owner or admin; prevent demoting/removing owner
  - [ ] `removeMember(calendarId, memberId, requesterId)` — same guards
  - [ ] `listSharedCalendars(userId)` — query calendarMembers JOIN calendars where userId=userId, include ownerName

- [ ] Task 3: Update `packages/api/src/services/events.ts`
  - [ ] `listEvents` — extend to include events from shared calendars (calendarMembers where userId=userId and permissionLevel ≥ details)

- [ ] Task 4: Calendar member routes `packages/api/src/routes/calendar-members.ts`
  - [ ] POST /api/calendars/:id/members
  - [ ] GET /api/calendars/:id/members
  - [ ] PATCH /api/calendars/:id/members/:memberId
  - [ ] DELETE /api/calendars/:id/members/:memberId
  - [ ] GET /api/calendars/shared
  - [ ] Mount in routes/index.ts

- [ ] Task 5: Tests
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No email notifications for invitations** — Epic 12 (Notifications)
- **No event attendees/RSVP** — separate feature
- **No free_busy permission level** — only details, edit, admin for now
