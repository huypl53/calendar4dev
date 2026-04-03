# Story 11.2: Calendar Sharing Frontend

Status: ready-for-dev

## Story

As a user,
I want to share my calendars with colleagues and view calendars shared with me,
so that I can collaborate and see everyone's schedules in one place.

## Acceptance Criteria

1. Share modal: accessible from a "Share" button per calendar in the sidebar. Has email input + permission selector (Details, Edit, Admin) + Add button. Lists current members with their role. Owner can remove members or change their role.
2. Shared calendars appear in the sidebar under a "Shared with me" section with the owner's name
3. Events from shared calendars appear in all views (week, day, month, schedule) using the calendar's color
4. For calendars where user has only "details" permission, clicking an event opens a read-only view (no edit/delete buttons)
5. New hooks: `useCalendarMembersQuery`, `useSharedCalendarsQuery`, `useAddMemberMutation`, `useUpdateMemberMutation`, `useRemoveMemberMutation`
6. `useCalendarsQuery` and `useEventsQuery` continue to work (events from shared calendars already returned by API)

## Tasks / Subtasks

- [ ] Task 1: API client additions in `packages/web/src/lib/api-client.ts`
  - [ ] `calendarMembersApi` — addMember, listMembers, updateMember, removeMember
  - [ ] `sharedCalendarsApi` — list (GET /api/calendars/shared)
  - [ ] Types: `CalendarMember`, `SharedCalendar`

- [ ] Task 2: Hooks in `packages/web/src/features/calendars/hooks/`
  - [ ] `use-calendar-members-query.ts` — useCalendarMembersQuery(calendarId), useAddMemberMutation, useUpdateMemberMutation, useRemoveMemberMutation
  - [ ] `use-shared-calendars-query.ts` — useSharedCalendarsQuery

- [ ] Task 3: Share modal component `packages/web/src/features/calendars/components/share-calendar-dialog.tsx`
  - [ ] Email input with permission level select
  - [ ] Member list with role badges and remove buttons (owner-only actions)
  - [ ] Toast feedback on add/remove/update

- [ ] Task 4: Update sidebar calendar list
  - [ ] Add share icon button to each owned calendar (opens share modal)
  - [ ] "Shared with me" section below owned calendars showing shared calendar name + owner
  - [ ] Both sections have color dot visibility toggles (stored in local state)

- [ ] Task 5: Permission-aware EventFormDialog
  - [ ] Pass `isReadOnly` prop when user only has "details" permission on the event's calendar
  - [ ] In read-only mode: no edit inputs (just display), no delete button, no save button — only Close

- [ ] Task 6: Tests
  - [ ] Unit tests for new hooks (mocked API)
  - [ ] Unit tests for ShareCalendarDialog
  - [ ] Run pnpm typecheck — must pass
  - [ ] Run pnpm test — all tests must pass

## What NOT to Build

- **No email notifications** — Epic 12
- **No calendar transfer** — post-MVP
- **No public calendar links** — post-MVP
