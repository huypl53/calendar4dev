import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('API Health', () => {
  test('should return healthy status', async ({ apiRequest }) => {
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/api/health',
      baseUrl: API_URL,
    });

    expect(status).toBe(200);
  });
});
