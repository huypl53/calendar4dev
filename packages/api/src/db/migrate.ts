import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './client.js'

export async function runMigrations() {
  await migrate(db, { migrationsFolder: './src/db/migrations' })
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
