import { defineConfig } from '@playwright/test';
import baseConfig from './playwright/config/base.config';

const environment = process.env.TEST_ENV || 'local';

const envOverrides: Record<string, object> = {
  local: {
    use: {
      baseURL: process.env.BASE_URL || 'http://localhost:5173',
    },
    webServer: {
      command: 'pnpm dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  },
};

if (!(environment in envOverrides)) {
  throw new Error(
    `No config for TEST_ENV="${environment}". Available: ${Object.keys(envOverrides).join(', ')}`,
  );
}

export default defineConfig({
  ...baseConfig,
  ...envOverrides[environment],
  use: {
    ...baseConfig.use,
    ...(envOverrides[environment] as any).use,
  },
});
