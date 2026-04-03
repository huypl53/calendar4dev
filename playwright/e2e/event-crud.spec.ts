import { test, expect } from '../support/merged-fixtures';
import { mockAuthSession } from '../support/helpers/auth-mock';
import { mockCalendarApp, PRIMARY_CALENDAR } from '../support/helpers/calendar-mock';
import { createCalendarEvent } from '../support/factories/event-factory';

// Multiple EventFormDialog instances exist in the DOM (AppShell + view component).
// Scope queries to the open native <dialog> element (which has the [open] attribute).
const openDialogForm = (page: import('@playwright/test').Page) =>
  page.locator('dialog[open] [data-testid="event-form"]');

const openDialogElement = (page: import('@playwright/test').Page) =>
  page.locator('dialog[open]');

test.describe('Event CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockCalendarApp(page);
  });

  test.describe('Display events', () => {
    test('renders events returned from API on week view', async ({ page }) => {
      const event1 = createCalendarEvent({
        title: 'Team Standup',
        calendarId: PRIMARY_CALENDAR.id,
        startTime: new Date('2026-04-07T09:00:00Z').toISOString(),
        endTime: new Date('2026-04-07T09:30:00Z').toISOString(),
      });
      const event2 = createCalendarEvent({
        title: 'Sprint Review',
        calendarId: PRIMARY_CALENDAR.id,
        startTime: new Date('2026-04-07T14:00:00Z').toISOString(),
        endTime: new Date('2026-04-07T15:00:00Z').toISOString(),
      });

      await page.route('**/api/events*', (route) => {
        const url = route.request().url();
        if (!url.includes('search')) {
          void route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [event1, event2] }),
          });
        } else {
          void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
        }
      });

      await page.goto('/week/2026-04-07');

      await expect(page.getByText('Team Standup')).toBeVisible();
      await expect(page.getByText('Sprint Review')).toBeVisible();
    });
  });

  test.describe('Create event', () => {
    test('opens event form dialog when pressing "c"', async ({ page }) => {
      // Start from stable non-root URL to avoid mid-redirect state loss
      await page.goto('/month/2026-04-01');
      await page.getByTestId('main-content').click();
      await page.keyboard.press('c');

      await expect(openDialogForm(page)).toBeVisible();
    });

    test('creates a new event via the event form', async ({ page }) => {
      const newEvent = createCalendarEvent({
        title: 'New Meeting',
        calendarId: PRIMARY_CALENDAR.id,
      });

      let capturedRequest: unknown = null;

      await page.route('**/api/events', async (route) => {
        if (route.request().method() === 'POST') {
          capturedRequest = route.request().postDataJSON();
          void route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ data: newEvent }),
          });
        } else {
          void route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [] }),
          });
        }
      });

      await page.goto('/month/2026-04-01');
      await page.getByTestId('main-content').click();
      await page.keyboard.press('c');

      await expect(openDialogForm(page)).toBeVisible();

      // Fill the form (start/end are required by the submit handler)
      await openDialogElement(page).getByTestId('event-title-input').fill('New Meeting');
      await openDialogElement(page).getByTestId('event-start-input').fill('2026-04-01T10:00');
      await openDialogElement(page).getByTestId('event-end-input').fill('2026-04-01T11:00');
      await openDialogElement(page).getByTestId('event-submit-button').click();

      // Wait for the API request
      await page.waitForTimeout(500);

      expect(capturedRequest).toBeTruthy();
      expect((capturedRequest as Record<string, unknown>).title).toBe('New Meeting');
    });

    test('form requires title to submit', async ({ page }) => {
      await page.goto('/month/2026-04-01');
      await page.getByTestId('main-content').click();
      await page.keyboard.press('c');

      const form = openDialogForm(page);
      await expect(form).toBeVisible();

      // HTML required validation prevents submission without title
      await openDialogElement(page).getByTestId('event-submit-button').click();

      // Form should still be visible (not submitted/closed)
      await expect(form).toBeVisible();
    });

    test('can toggle all-day checkbox', async ({ page }) => {
      await page.goto('/month/2026-04-01');
      await page.getByTestId('main-content').click();
      await page.keyboard.press('c');

      await expect(openDialogForm(page)).toBeVisible();

      const checkbox = openDialogElement(page).getByTestId('event-allday-checkbox');
      await expect(checkbox).not.toBeChecked();

      await checkbox.click();
      await expect(checkbox).toBeChecked();

      // Datetime inputs should disappear for all-day events
      await expect(openDialogElement(page).getByTestId('event-start-input')).not.toBeVisible();
    });

    test('cancel closes the event form', async ({ page }) => {
      await page.goto('/month/2026-04-01');
      await page.getByTestId('main-content').click();
      await page.keyboard.press('c');

      await expect(openDialogForm(page)).toBeVisible();
      await openDialogElement(page).getByRole('button', { name: /cancel/i }).click();
      await expect(openDialogElement(page)).not.toBeVisible();
    });
  });

  test.describe('Edit event', () => {
    test('clicking an event opens edit dialog', async ({ page }) => {
      const existingEvent = createCalendarEvent({
        title: 'Existing Meeting',
        calendarId: PRIMARY_CALENDAR.id,
        startTime: new Date('2026-04-07T10:00:00Z').toISOString(),
        endTime: new Date('2026-04-07T11:00:00Z').toISOString(),
      });

      await page.route('**/api/events*', (route) => {
        const url = route.request().url();
        if (!url.includes('search')) {
          void route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [existingEvent] }),
          });
        } else {
          void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
        }
      });

      await page.goto('/week/2026-04-07');
      await page.getByText('Existing Meeting').first().click();

      // Edit form should open pre-filled
      await expect(openDialogForm(page)).toBeVisible();
      await expect(openDialogElement(page).getByTestId('event-title-input')).toHaveValue('Existing Meeting');
    });
  });

  test.describe('Delete event', () => {
    test('edit dialog shows Delete button for existing events', async ({ page }) => {
      const existingEvent = createCalendarEvent({
        title: 'Event To Delete',
        calendarId: PRIMARY_CALENDAR.id,
        startTime: new Date('2026-04-07T10:00:00Z').toISOString(),
        endTime: new Date('2026-04-07T11:00:00Z').toISOString(),
      });

      await page.route('**/api/events*', (route) => {
        const url = route.request().url();
        if (!url.includes('search')) {
          void route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [existingEvent] }),
          });
        } else {
          void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
        }
      });

      await page.goto('/week/2026-04-07');
      await page.getByText('Event To Delete').first().click();

      await expect(openDialogElement(page).getByTestId('event-delete-button')).toBeVisible();
    });
  });
});
