import { Hono } from 'hono'
import { z } from 'zod'
import { ValidationError } from '../lib/errors.js'
import * as userService from '../services/user.js'

type AppEnv = { Variables: { user: { id: string } } }

const app = new Hono<AppEnv>()

const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(100) })
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

// GET /api/user/profile
app.get('/api/user/profile', async (c) => {
  const user = c.get('user')
  const profile = await userService.getProfile(user.id)
  return c.json({ data: profile })
})

// PATCH /api/user/profile
app.patch('/api/user/profile', async (c) => {
  let raw: unknown
  try {
    raw = await c.req.json()
  } catch {
    throw new ValidationError('Invalid JSON body')
  }
  const parsed = updateProfileSchema.safeParse(raw)
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.issues)
  const user = c.get('user')
  const updated = await userService.updateProfile(user.id, parsed.data)
  return c.json({ data: updated })
})

// POST /api/user/change-password
app.post('/api/user/change-password', async (c) => {
  let raw: unknown
  try {
    raw = await c.req.json()
  } catch {
    throw new ValidationError('Invalid JSON body')
  }
  const parsed = changePasswordSchema.safeParse(raw)
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.issues)
  const user = c.get('user')
  await userService.changePassword(user.id, parsed.data)
  return c.json({ data: { success: true } })
})

export default app
