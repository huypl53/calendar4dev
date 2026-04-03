import { eq, and } from 'drizzle-orm'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import { db } from '../db/client.js'
import { users, accounts } from '../db/schema/index.js'
import { NotFoundError, ValidationError } from '../lib/errors.js'

export async function getProfile(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new NotFoundError('User not found')

  // Check if user has a credential (email/password) account
  const credAccount = await db.query.accounts.findFirst({
    where: and(eq(accounts.userId, userId), eq(accounts.providerId, 'credential')),
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
    hasPassword: !!(credAccount?.password),
  }
}

export async function updateProfile(userId: string, data: { name: string }) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new NotFoundError('User not found')

  const [updated] = await db
    .update(users)
    .set({ name: data.name })
    .where(eq(users.id, userId))
    .returning()

  return {
    id: updated!.id,
    email: updated!.email,
    name: updated!.name ?? null,
    image: updated!.image ?? null,
  }
}

export async function changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
  const credAccount = await db.query.accounts.findFirst({
    where: and(eq(accounts.userId, userId), eq(accounts.providerId, 'credential')),
  })

  if (!credAccount?.password) {
    throw new ValidationError('No password set on this account')
  }

  const valid = await verifyPassword({ hash: credAccount.password, password: data.currentPassword })
  if (!valid) {
    throw new ValidationError('Current password is incorrect')
  }

  const newHash = await hashPassword(data.newPassword)
  await db
    .update(accounts)
    .set({ password: newHash })
    .where(and(eq(accounts.userId, userId), eq(accounts.providerId, 'credential')))
}
