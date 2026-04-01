import type { Page } from '@playwright/test';

/**
 * Wait for all initial API calls to complete after page navigation.
 * Useful for ensuring the app is fully loaded before interacting.
 */
export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Common API URL patterns used across tests.
 */
export const API_PATTERNS = {
  events: '**/api/events',
  eventById: '**/api/events/*',
  auth: '**/api/auth/**',
  health: '**/api/health',
} as const;
