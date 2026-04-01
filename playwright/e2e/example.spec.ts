import { test, expect } from '../support/merged-fixtures';
import { createCalendarEvent } from '../support/factories/event-factory';

test.describe('Calendar Events', () => {
  test.fixme('should display events on the calendar', async ({
    page,
    interceptNetworkCall,
    log,
  }) => {
    // Given: API returns calendar events
    const mockEvents = [
      createCalendarEvent({ title: 'Team Standup' }),
      createCalendarEvent({ title: 'Sprint Review' }),
    ];

    const eventsCall = interceptNetworkCall({
      url: '**/api/events',
      fulfillResponse: {
        status: 200,
        body: mockEvents,
      },
    });

    // When: User navigates to the calendar
    await page.goto('/');
    await eventsCall;

    // Then: Events are visible on the calendar
    await expect(page.getByText('Team Standup')).toBeVisible();
    await expect(page.getByText('Sprint Review')).toBeVisible();
  });

  test.fixme('should create a new event', async ({
    page,
    interceptNetworkCall,
    log,
  }) => {
    // Given: The calendar page is loaded
    const eventsCall = interceptNetworkCall({
      url: '**/api/events',
      fulfillResponse: { status: 200, body: [] },
    });

    await page.goto('/');
    await eventsCall;

    // When: User creates a new event
    const createCall = interceptNetworkCall({
      url: '**/api/events',
      method: 'POST',
      fulfillResponse: {
        status: 201,
        body: createCalendarEvent({ title: 'New Meeting' }),
      },
    });

    await page.getByTestId('create-event-button').click();
    await page.getByTestId('event-title-input').fill('New Meeting');
    await page.getByTestId('event-save-button').click();

    // Then: The event is created via API
    const { requestJson } = await createCall;
    await log.step('Event created successfully');

    expect(requestJson).toHaveProperty('title', 'New Meeting');
  });
});
