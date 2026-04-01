import type { APIRequestContext } from '@playwright/test';
import { type CalendarEvent, createCalendarEvent } from '../factories/event-factory';

const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function seedEvent(
  request: APIRequestContext,
  overrides: Partial<CalendarEvent> = {},
): Promise<CalendarEvent> {
  const event = createCalendarEvent(overrides);

  const response = await request.post(`${API_URL}/api/events`, {
    data: event,
  });

  if (!response.ok()) {
    throw new Error(`Failed to seed event: ${response.status()}`);
  }

  return event;
}

export async function seedEvents(
  request: APIRequestContext,
  count: number,
  overrides: Partial<CalendarEvent> = {},
): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = [];
  for (let i = 0; i < count; i++) {
    events.push(await seedEvent(request, overrides));
  }
  return events;
}

export async function cleanupEvents(
  request: APIRequestContext,
  eventIds: string[],
): Promise<void> {
  for (const id of eventIds) {
    await request.delete(`${API_URL}/api/events/${id}`);
  }
}
