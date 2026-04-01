import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  PORT: z.coerce.number().default(3000),
  API_PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('*'),
})

export type Env = z.infer<typeof envSchema>
