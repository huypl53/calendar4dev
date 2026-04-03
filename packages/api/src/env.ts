import { envSchema } from './env-schema.js'
import type { Env } from './env-schema.js'

export type { Env }
export { envSchema }

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (result.success) {
    return result.data
  }
  process.stderr.write('Invalid environment variables:\n')
  for (const issue of result.error.issues) {
    process.stderr.write(`  ${issue.path.join('.')}: ${issue.message}\n`)
  }
  return process.exit(1)
}

export const env = validateEnv()
