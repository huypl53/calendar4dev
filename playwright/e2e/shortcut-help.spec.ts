import { test, expect } from '../support/merged-fixtures';
import { mockAuthSession } from '../support/helpers/auth-mock';
import { mockCalendarApp } from '../support/helpers/calendar-mock';

test.describe('Shortcut Help Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockCalendarApp(page);
  });

  test('opens with "?" key', async ({ page }) => {
    // Use a stable URL (not root) to avoid redirect race condition
    await page.goto('/month/2026-04-01');
    await page.getByTestId('main-content').click();
    await page.keyboard.press('?');

    await expect(page.getByText(/keyboard shortcuts/i)).toBeVisible({ timeout: 3000 });
  });

  test('closes with Escape key', async ({ page }) => {
    await page.goto('/month/2026-04-01');
    await page.getByTestId('main-content').click();
    await page.keyboard.press('?');

    await expect(page.getByText(/keyboard shortcuts/i)).toBeVisible({ timeout: 3000 });

    // The "?" shortcut is blocked when any dialog is open (by design).
    // The shortcut help dialog closes via Escape (native <dialog> behavior).
    await page.keyboard.press('Escape');

    await expect(page.getByText(/keyboard shortcuts/i)).not.toBeVisible();
  });
});
