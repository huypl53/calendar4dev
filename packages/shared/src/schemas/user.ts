import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255).nullable().optional(),
  password: z.string().min(8).max(128).optional(),
})

export type CreateUser = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).nullable().optional(),
  email: z.string().email().optional(),
})

export type UpdateUser = z.infer<typeof updateUserSchema>
