import type { Page } from '@playwright/test';

const MOCK_USER = {
  id: 'user-e2e-test-1',
  email: 'test@example.com',
  name: 'E2E Test User',
  emailVerified: true,
  image: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const MOCK_SESSION = {
  id: 'session-e2e-test-1',
  userId: MOCK_USER.id,
  token: 'e2e-test-token',
  expiresAt: '2030-01-01T00:00:00.000Z',
  ipAddress: '127.0.0.1',
  userAgent: 'playwright',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

/**
 * Mock the Better Auth session endpoint so the app treats the user as logged in.
 * Call this before navigating to any authenticated route.
 */
export async function mockAuthSession(page: Page) {
  await page.route('**/api/auth/get-session', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: MOCK_USER, session: MOCK_SESSION }),
    });
  });
}

/**
 * Mock the session as unauthenticated (returns null session).
 */
export async function mockUnauthenticated(page: Page) {
  await page.route('**/api/auth/get-session', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(null),
    });
  });
}

export { MOCK_USER };
