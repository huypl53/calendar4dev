import { test, expect } from '../support/merged-fixtures';
import { mockAuthSession } from '../support/helpers/auth-mock';
import { mockCalendarApp, PRIMARY_CALENDAR } from '../support/helpers/calendar-mock';
import { createCalendarEvent } from '../support/factories/event-factory';

// Use a stable non-root URL so we don't trigger redirect race conditions
const STABLE_URL = '/month/2026-04-01';

test.describe('Event Search', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockCalendarApp(page);
  });

  test('opens search dialog with "/" shortcut', async ({ page }) => {
    await page.goto(STABLE_URL);
    await page.getByTestId('main-content').click();
    await page.keyboard.press('/');

    await expect(page.getByTestId('event-search-dialog')).toBeVisible();
    await expect(page.getByTestId('event-search-input')).toBeFocused();
  });

  test('shows prompt to type at least 2 characters', async ({ page }) => {
    await page.goto(STABLE_URL);
    await page.getByTestId('main-content').click();
    await page.keyboard.press('/');

    await expect(page.getByText(/type at least 2 characters/i)).toBeVisible();
  });

  test('shows no results message when nothing found', async ({ page }) => {
    await page.route('**/api/events/search*', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto(STABLE_URL);
    await page.getByTestId('main-content').click();
    await page.keyboard.press('/');

    await page.getByTestId('event-search-input').fill('xyznotfound');

    await expect(page.getByText(/no events found/i)).toBeVisible({ timeout: 2000 });
  });

  test('displays search results from API', async ({ page }) => {
    const matchingEvent = createCalendarEvent({
      title: 'Quarterly Planning',
      calendarId: PRIMARY_CALENDAR.id,
    });

    await page.route('**/api/events/search*', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [matchingEvent] }),
      });
    });

    await page.goto(STABLE_URL);
    await page.getByTestId('main-content').click();
    await page.keyboard.press('/');

    await page.getByTestId('event-search-input').fill('Quarterly');

    await expect(page.getByText('Quarterly Planning')).toBeVisible({ timeout: 2000 });
  });

  test('closes search dialog on Escape', async ({ page }) => {
    await page.goto(STABLE_URL);
    await page.getByTestId('main-content').click();
    await page.keyboard.press('/');

    await expect(page.getByTestId('event-search-dialog')).toBeVisible();

    // WebKit may not bubble Escape from the input to the dialog div.
    // Dispatch directly to the dialog container so the onKeyDown handler fires.
    await page.getByTestId('event-search-dialog').evaluate((el) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })),
    );

    await expect(page.getByTestId('event-search-dialog')).not.toBeVisible();
  });

  test('closes search dialog by clicking backdrop', async ({ page }) => {
    await page.goto(STABLE_URL);
    await page.getByTestId('main-content').click();
    await page.keyboard.press('/');

    await expect(page.getByTestId('event-search-dialog')).toBeVisible();

    await page.getByTestId('search-backdrop').click({ position: { x: 10, y: 10 } });

    await expect(page.getByTestId('event-search-dialog')).not.toBeVisible();
  });

  test('selecting a result navigates to that week', async ({ page }) => {
    const targetDate = '2026-06-15T10:00:00Z';
    const matchingEvent = createCalendarEvent({
      title: 'Future Event',
      calendarId: PRIMARY_CALENDAR.id,
      startTime: targetDate,
      endTime: new Date(new Date(targetDate).getTime() + 3600000).toISOString(),
    });

    await page.route('**/api/events/search*', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [matchingEvent] }),
      });
    });

    await page.goto(STABLE_URL);
    await page.getByTestId('main-content').click();
    await page.keyboard.press('/');

    await page.getByTestId('event-search-input').fill('Future');

    await page.getByTestId(`search-result-${matchingEvent.id}`).click();

    // Should navigate to the week containing 2026-06-15
    await expect(page).toHaveURL(/\/week\/2026-06/);
  });
});
