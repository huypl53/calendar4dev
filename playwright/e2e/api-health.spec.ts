import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// These tests require a running API server.
// Skip if API_URL is not explicitly set (i.e., no backend is available).
// Run with: API_URL=http://localhost:3000 pnpm test:e2e
test.describe('API Health', () => {
  test.beforeEach(({}, testInfo) => {
    if (!process.env.API_URL) {
      testInfo.skip(true, 'API server not available — set API_URL env var to run these tests');
    }
  });

  test('GET /healthz returns healthy status', async ({ apiRequest }) => {
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/healthz',
      baseUrl: API_URL,
    });

    expect(status).toBe(200);
    expect(body.status).toBe('healthy');
    expect(body.db).toBe('connected');
    expect(typeof body.uptime).toBe('number');
  });

  test('GET /api/openapi.json returns OpenAPI spec', async ({ apiRequest }) => {
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/api/openapi.json',
      baseUrl: API_URL,
    });

    expect(status).toBe(200);
    expect(body.openapi).toBe('3.0.0');
    expect(body.info.title).toBe('Dev Calendar API');
  });
});
