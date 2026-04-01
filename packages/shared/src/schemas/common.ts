import { z } from 'zod'

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
})

export type ApiError = z.infer<typeof apiErrorSchema>
