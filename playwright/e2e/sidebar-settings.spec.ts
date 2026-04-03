import { test, expect } from '../support/merged-fixtures';
import { mockAuthSession } from '../support/helpers/auth-mock';
import { mockCalendarApp, PRIMARY_CALENDAR } from '../support/helpers/calendar-mock';
import { createCalendar } from '../support/factories/calendar-factory';

/** Open the sidebar (which starts closed by default) by clicking the toggle button. */
async function openSidebar(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /toggle sidebar/i }).click();
  // Wait for the grid column to expand
  await page.waitForFunction(() => {
    const sidebar = document.querySelector('[data-testid="sidebar"]');
    const grid = sidebar?.parentElement as HTMLElement | null;
    const cols = grid?.style.gridTemplateColumns ?? '';
    return cols.length > 0 && !cols.startsWith('0px');
  }, { timeout: 2000 });
}

test.describe('Sidebar & Settings', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockCalendarApp(page);
  });

  test.describe('Calendar list', () => {
    test('displays primary calendar in sidebar', async ({ page }) => {
      await page.goto('/schedule'); // Use schedule view to avoid time gutter overlay
      await openSidebar(page);

      const sidebar = page.getByTestId('sidebar');
      // Use exact: true to avoid matching "My Calendars" section header
      await expect(sidebar.getByText(PRIMARY_CALENDAR.name, { exact: true })).toBeVisible();
    });

    test('displays multiple calendars', async ({ page }) => {
      const workCal = createCalendar({ id: 'cal-work', name: 'Work', userId: 'user-e2e-test-1' });

      await page.route('**/api/calendars', (route) => {
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [PRIMARY_CALENDAR, workCal] }),
        });
      });

      await page.goto('/schedule');
      await openSidebar(page);

      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar.getByText('My Calendar', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Work', { exact: true })).toBeVisible();
    });
  });

  test.describe('Settings panel', () => {
    test('opens settings panel when clicking Settings', async ({ page }) => {
      await page.goto('/schedule');
      await openSidebar(page);

      await page.getByTestId('settings-toggle').click();

      await expect(page.getByTestId('settings-panel')).toBeVisible();
    });

    test('closes settings panel when clicking Settings again', async ({ page }) => {
      await page.goto('/schedule');
      await openSidebar(page);

      await page.getByTestId('settings-toggle').click();
      await expect(page.getByTestId('settings-panel')).toBeVisible();

      await page.getByTestId('settings-toggle').click();
      await expect(page.getByTestId('settings-panel')).not.toBeVisible();
    });
  });

  test.describe('Profile panel', () => {
    test('opens profile panel when clicking Profile', async ({ page }) => {
      await page.route('**/api/user/profile', (route) => {
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { id: 'user-e2e-test-1', name: 'E2E Test User', email: 'test@example.com' },
          }),
        });
      });

      await page.goto('/schedule');
      await openSidebar(page);

      await page.getByTestId('profile-toggle').click();

      await expect(page.getByTestId('profile-panel')).toBeVisible();
    });
  });

  test.describe('Mini calendar', () => {
    test('mini calendar is attached in the sidebar DOM', async ({ page }) => {
      await page.goto('/');

      // Sidebar starts closed, but the element is in the DOM
      // Open it to make content visible
      await openSidebar(page);

      const sidebar = page.getByTestId('sidebar');
      // Mini calendar renders day number cells
      await expect(sidebar.getByText(/\d+/).first()).toBeVisible();
    });
  });
});
