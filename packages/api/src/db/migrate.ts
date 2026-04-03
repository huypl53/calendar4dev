import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './client.js'
import { logger } from '../middleware/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.resolve(__dirname, './migrations')

export async function runMigrations() {
  await migrate(db, { migrationsFolder })
}

// Run directly when executed as a script
const isDirectRun = import.meta.url === `file://${process.argv[1]}`
if (isDirectRun) {
  runMigrations()
    .then(() => {
      logger.info('Migrations applied successfully')
      process.exit(0)
    })
    .catch((err) => {
      logger.error({ err }, 'Migration failed')
      process.exit(1)
    })
}
