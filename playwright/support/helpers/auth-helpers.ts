import type { APIRequestContext } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';

export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Authenticate a user via API and return the auth token.
 * Placeholder — update when auth endpoints are implemented.
 */
export async function getAuthToken(
  request: APIRequestContext,
  credentials: AuthCredentials = {
    email: 'test@example.com',
    password: 'password123',
  },
): Promise<string> {
  const response = await request.post(`${API_URL}/api/auth/login`, {
    data: credentials,
  });

  if (!response.ok()) {
    throw new Error(`Auth failed: ${response.status()}`);
  }

  const { token } = await response.json();
  return token;
}
