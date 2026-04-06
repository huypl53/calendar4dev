import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/devcalendar_test',
      NODE_ENV: 'test',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
})
