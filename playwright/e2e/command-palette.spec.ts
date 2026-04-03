import { test, expect } from '../support/merged-fixtures';
import { mockAuthSession } from '../support/helpers/auth-mock';
import { mockCalendarApp } from '../support/helpers/calendar-mock';

// Use a specific stable route (not root) to avoid mid-redirect state loss
const STABLE_URL = '/week/2026-04-07';

// Ctrl+K can be intercepted by the browser at OS level before reaching the page.
// Dispatch the keyboard event directly via JS to guarantee it reaches the app's handler.
const pressCtrlK = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }),
    ),
  );

// Wait for the app shell to be fully mounted (header visible means React is ready)
const waitForApp = (page: import('@playwright/test').Page) =>
  page.waitForSelector('[data-testid="header"]', { timeout: 10000 });

test.describe('Command Palette', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockCalendarApp(page);
  });

  test('opens with Cmd+K / Ctrl+K', async ({ page }) => {
    await page.goto(STABLE_URL);
    await waitForApp(page);

    await pressCtrlK(page);

    await expect(page.getByTestId('command-palette')).toBeVisible();
    await expect(page.getByTestId('command-palette-input')).toBeFocused();
  });

  test('shows commands list', async ({ page }) => {
    await page.goto(STABLE_URL);
    await waitForApp(page);

    await pressCtrlK(page);

    const list = page.getByTestId('command-palette-list');
    await expect(list).toBeVisible();
    const items = list.locator('[data-testid^="command-item-"]');
    await expect(items.first()).toBeVisible();
  });

  test('filters commands by query', async ({ page }) => {
    await page.goto(STABLE_URL);
    await waitForApp(page);
    await pressCtrlK(page);

    await page.getByTestId('command-palette-input').fill('week');

    const list = page.getByTestId('command-palette-list');
    await expect(list.getByText(/week/i)).toBeVisible();
  });

  test('shows no matching commands message when filter has no matches', async ({ page }) => {
    await page.goto(STABLE_URL);
    await waitForApp(page);
    await pressCtrlK(page);

    await page.getByTestId('command-palette-input').fill('xyznocommand');

    await expect(page.getByText(/no matching commands/i)).toBeVisible();
  });

  test('closes on Escape', async ({ page }) => {
    await page.goto(STABLE_URL);
    await waitForApp(page);
    await pressCtrlK(page);

    await expect(page.getByTestId('command-palette')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByTestId('command-palette')).not.toBeVisible();
  });

  test('closes by clicking backdrop', async ({ page }) => {
    await page.goto(STABLE_URL);
    await waitForApp(page);
    await pressCtrlK(page);

    await expect(page.getByTestId('command-palette')).toBeVisible();

    await page.getByTestId('command-palette-backdrop').click({ position: { x: 10, y: 10 } });

    await expect(page.getByTestId('command-palette')).not.toBeVisible();
  });

  test('can navigate commands with arrow keys', async ({ page }) => {
    await page.goto(STABLE_URL);
    await waitForApp(page);
    await pressCtrlK(page);

    const list = page.getByTestId('command-palette-list');
    const allItems = list.locator('[data-testid^="command-item-"]');
    // First item should be selected initially
    await expect(allItems.first()).toHaveAttribute('aria-selected', 'true');

    // Move down
    await page.keyboard.press('ArrowDown');

    // The second item should now be selected
    await expect(allItems.nth(1)).toHaveAttribute('aria-selected', 'true');
  });

  test('executing "Day view" command navigates to day view', async ({ page }) => {
    await page.goto(STABLE_URL);
    await waitForApp(page);
    await pressCtrlK(page);

    await page.getByTestId('command-palette-input').fill('day');

    const dayCommand = page.getByTestId('command-palette-list').getByText(/day view/i);
    await dayCommand.click();

    await expect(page).toHaveURL(/\/day\//);
  });

  test('executing "New Event" command opens event form', async ({ page }) => {
    await page.goto(STABLE_URL);
    await waitForApp(page);
    await pressCtrlK(page);

    await page.getByTestId('command-palette-input').fill('create event');

    const newEventCommand = page.getByTestId('command-palette-list').getByText(/create event/i);
    await newEventCommand.click();

    // Multiple event-form instances exist in the DOM; scope to the open dialog
    await expect(page.locator('dialog[open] [data-testid="event-form"]')).toBeVisible();
  });
});
