import { faker } from '@faker-js/faker';

export type Calendar = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  timezone: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export const createCalendar = (overrides: Partial<Calendar> = {}): Calendar => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  name: faker.helpers.arrayElement(['Work', 'Personal', 'Family', 'Team', faker.word.noun()]),
  description: faker.datatype.boolean() ? faker.lorem.sentence() : null,
  color: faker.helpers.arrayElement(['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6']),
  timezone: 'UTC',
  isPrimary: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createPrimaryCalendar = (overrides: Partial<Calendar> = {}): Calendar =>
  createCalendar({ name: 'My Calendar', isPrimary: true, ...overrides });
