import type { Page } from '@playwright/test';
import { createPrimaryCalendar } from '../factories/calendar-factory';
import { createCalendarEvent } from '../factories/event-factory';

const PRIMARY_CALENDAR = createPrimaryCalendar({ id: 'cal-primary-1', userId: 'user-e2e-test-1' });

/**
 * Mock the calendar bootstrap and list endpoints with a single primary calendar.
 * Also mocks the events list as empty.
 */
export async function mockCalendarApp(page: Page, events = createCalendarEvent) {
  // Calendar list
  await page.route('**/api/calendars', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [PRIMARY_CALENDAR] }),
    });
  });

  // Events list (return empty by default, can be overridden per test)
  await page.route('**/api/events*', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  // Shared calendars
  await page.route('**/api/calendars/shared', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });
}

export { PRIMARY_CALENDAR };
