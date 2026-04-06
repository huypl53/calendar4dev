import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  PORT: z.coerce.number().default(3000),
  API_PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('*'),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
}).refine(
  (env) => (!env.GITHUB_CLIENT_ID && !env.GITHUB_CLIENT_SECRET) || (!!env.GITHUB_CLIENT_ID && !!env.GITHUB_CLIENT_SECRET),
  { message: 'GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must both be set or both be omitted', path: ['GITHUB_CLIENT_ID'] },
).refine(
  (env) => (!env.GOOGLE_CLIENT_ID && !env.GOOGLE_CLIENT_SECRET) || (!!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET),
  { message: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both be set or both be omitted', path: ['GOOGLE_CLIENT_ID'] },
)

export type Env = z.infer<typeof envSchema>
