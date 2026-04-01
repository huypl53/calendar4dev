import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './client.js'

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
      console.log('Migrations applied successfully')
      process.exit(0)
    })
    .catch((err) => {
      console.error('Migration failed:', err)
      process.exit(1)
    })
}
