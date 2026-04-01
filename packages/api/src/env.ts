import { envSchema } from './env-schema.js'
import type { Env } from './env-schema.js'

export type { Env }
export { envSchema }

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (result.success) {
    return result.data
  }
  console.error('Invalid environment variables:')
  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  }
  return process.exit(1)
}

export const env = validateEnv()
