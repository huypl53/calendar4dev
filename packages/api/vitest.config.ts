import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/devcalendar_test',
      NODE_ENV: 'test',
    },
  },
})
