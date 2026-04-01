import { faker } from '@faker-js/faker';

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  color: string;
  createdAt: string;
};

export const createCalendarEvent = (
  overrides: Partial<CalendarEvent> = {},
): CalendarEvent => {
  const start = faker.date.soon({ days: 14 });
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    allDay: false,
    location: faker.location.streetAddress(),
    color: faker.helpers.arrayElement([
      '#3b82f6',
      '#ef4444',
      '#22c55e',
      '#f59e0b',
      '#8b5cf6',
    ]),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
};

export const createAllDayEvent = (
  overrides: Partial<CalendarEvent> = {},
): CalendarEvent =>
  createCalendarEvent({
    allDay: true,
    startTime: faker.date.soon({ days: 14 }).toISOString().split('T')[0],
    endTime: faker.date.soon({ days: 14 }).toISOString().split('T')[0],
    ...overrides,
  });
