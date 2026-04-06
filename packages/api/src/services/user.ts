import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users } from '../db/schema/index.js'
import { supabaseAdmin, supabaseAnon } from '../lib/supabase.js'
import { NotFoundError, ValidationError } from '../lib/errors.js'

export async function getProfile(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new NotFoundError('User not found')

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
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
  }
}

export async function changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new NotFoundError('User not found')

  // Verify current password via Supabase Auth sign-in
  const { error: signInError } = await supabaseAnon.auth.signInWithPassword({
    email: user.email,
    password: data.currentPassword,
  })
  if (signInError) throw new ValidationError('Current password is incorrect')

  // Update password via admin client
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: data.newPassword,
  })
  if (error) throw new ValidationError('Failed to update password')
}
