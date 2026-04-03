import { eq, and } from 'drizzle-orm'
import { db } from '../db/client.js'
import { calendars, calendarMembers } from '../db/schema/index.js'
import { users } from '../db/schema/users.js'
import { NotFoundError, ForbiddenError, ConflictError } from '../lib/errors.js'
import type { AddCalendarMember, UpdateCalendarMember } from '@dev-calendar/shared'

type MemberPermission = 'details' | 'edit' | 'admin'

/** Ensure requester is owner or has admin permission */
async function assertOwnerOrAdmin(calendarId: string, requesterId: string) {
  const cal = await db.query.calendars.findFirst({ where: eq(calendars.id, calendarId) })
  if (!cal) throw new NotFoundError('Calendar not found')
  if (cal.userId === requesterId) return cal

  const membership = await db.query.calendarMembers.findFirst({
    where: and(eq(calendarMembers.calendarId, calendarId), eq(calendarMembers.userId, requesterId)),
  })
  if (!membership || membership.permissionLevel !== 'admin') {
    throw new ForbiddenError('Must be calendar owner or admin')
  }
  return cal
}

export async function addMember(calendarId: string, data: AddCalendarMember, requesterId: string) {
  await assertOwnerOrAdmin(calendarId, requesterId)

  // Look up user by email
  const targetUser = await db.query.users.findFirst({ where: eq(users.email, data.email) })
  if (!targetUser) throw new NotFoundError(`No user found with email ${data.email}`)

  // Prevent adding the owner as a member
  const cal = await db.query.calendars.findFirst({ where: eq(calendars.id, calendarId) })
  if (cal?.userId === targetUser.id) throw new ConflictError('Cannot add calendar owner as a member')

  // Check if already a member
  const existing = await db.query.calendarMembers.findFirst({
    where: and(eq(calendarMembers.calendarId, calendarId), eq(calendarMembers.userId, targetUser.id)),
  })
  if (existing) throw new ConflictError('User is already a member of this calendar')

  const [member] = await db.insert(calendarMembers).values({
    calendarId,
    userId: targetUser.id,
    permissionLevel: data.permissionLevel as MemberPermission,
  }).returning()

  return {
    ...member!,
    userEmail: targetUser.email,
    userName: targetUser.name,
  }
}

export async function listMembers(calendarId: string, requesterId: string) {
  await assertOwnerOrAdmin(calendarId, requesterId)

  const members = await db.query.calendarMembers.findMany({
    where: eq(calendarMembers.calendarId, calendarId),
  })

  // Enrich with user info
  const enriched = await Promise.all(
    members.map(async (m) => {
      const user = await db.query.users.findFirst({ where: eq(users.id, m.userId) })
      return {
        ...m,
        userEmail: user?.email ?? '',
        userName: user?.name ?? null,
      }
    }),
  )

  return enriched
}

export async function updateMember(
  calendarId: string,
  memberId: string,
  data: UpdateCalendarMember,
  requesterId: string,
) {
  const cal = await assertOwnerOrAdmin(calendarId, requesterId)

  const member = await db.query.calendarMembers.findFirst({ where: eq(calendarMembers.id, memberId) })
  if (!member || member.calendarId !== calendarId) throw new NotFoundError('Member not found')

  // Prevent demoting via calendar owner
  if (member.userId === cal.userId) throw new ForbiddenError('Cannot change permission of calendar owner')

  // Non-owner admins cannot promote to admin (only owner can grant admin)
  if (data.permissionLevel === 'admin' && cal.userId !== requesterId) {
    throw new ForbiddenError('Only the calendar owner can grant admin permission')
  }

  const [updated] = await db.update(calendarMembers)
    .set({ permissionLevel: data.permissionLevel as MemberPermission })
    .where(and(eq(calendarMembers.id, memberId), eq(calendarMembers.calendarId, calendarId)))
    .returning()

  const user = await db.query.users.findFirst({ where: eq(users.id, member.userId) })
  return {
    ...updated!,
    userEmail: user?.email ?? '',
    userName: user?.name ?? null,
  }
}

export async function removeMember(calendarId: string, memberId: string, requesterId: string) {
  const cal = await assertOwnerOrAdmin(calendarId, requesterId)

  const member = await db.query.calendarMembers.findFirst({ where: eq(calendarMembers.id, memberId) })
  if (!member || member.calendarId !== calendarId) throw new NotFoundError('Member not found')
  if (member.userId === cal.userId) throw new ForbiddenError('Cannot remove the calendar owner')

  await db.delete(calendarMembers).where(eq(calendarMembers.id, memberId))
}

export async function listSharedCalendars(userId: string) {
  // Calendars where user is a member (not the owner)
  const memberships = await db.query.calendarMembers.findMany({
    where: eq(calendarMembers.userId, userId),
  })

  const results = await Promise.all(
    memberships.map(async (m) => {
      const cal = await db.query.calendars.findFirst({ where: eq(calendars.id, m.calendarId) })
      if (!cal) return null
      const owner = await db.query.users.findFirst({ where: eq(users.id, cal.userId) })
      return {
        ...cal,
        permissionLevel: m.permissionLevel,
        ownerEmail: owner?.email ?? '',
        ownerName: owner?.name ?? null,
      }
    }),
  )

  return results.filter(Boolean)
}
