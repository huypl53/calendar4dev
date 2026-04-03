import { test, expect } from '../support/merged-fixtures';
import { mockUnauthenticated } from '../support/helpers/auth-mock';

// Login page uses placeholder attributes (no <label> elements)
// Use getByPlaceholder for form inputs

test.describe('Authentication', () => {
  test.describe('Login page', () => {
    test('renders login form', async ({ page }) => {
      await mockUnauthenticated(page);
      await page.goto('/login');

      await expect(page.getByPlaceholder('Email')).toBeVisible();
      await expect(page.getByPlaceholder('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });

    test('shows error on invalid credentials', async ({ page }) => {
      await mockUnauthenticated(page);

      // Mock auth failure — Better Fetch treats 4xx as errors, populating result.error
      await page.route('**/api/auth/sign-in/email', (route) => {
        void route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid credentials' }),
        });
      });

      await page.goto('/login');

      await page.getByPlaceholder('Email').fill('wrong@example.com');
      await page.getByPlaceholder('Password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign In' }).click();

      // Error paragraph should appear
      await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 });
    });

    test('can toggle to register mode', async ({ page }) => {
      await mockUnauthenticated(page);
      await page.goto('/login');

      // Toggle to register
      await page.getByRole('button', { name: /create one/i }).click();

      // Name field should appear (placeholder="Name")
      await expect(page.getByPlaceholder('Name')).toBeVisible();
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    });

    test('unauthenticated access to "/" redirects to login', async ({ page }) => {
      await mockUnauthenticated(page);
      await page.goto('/');
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('redirects to calendar after successful login', async ({ page }) => {
      await mockUnauthenticated(page);

      // Mock successful sign-in (Better Auth returns user+session in body)
      await page.route('**/api/auth/sign-in/email', (route) => {
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
            session: { id: 'sess-1', token: 'tok-1', expiresAt: '2030-01-01T00:00:00.000Z' },
          }),
        });
      });

      // After sign-in, subsequent getSession calls will succeed
      await page.route('**/api/auth/get-session', (route) => {
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
            session: { id: 'sess-1', token: 'tok-1', expiresAt: '2030-01-01T00:00:00.000Z' },
          }),
        });
      });

      await page.route('**/api/calendars', (route) => {
        void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      });
      await page.route('**/api/events*', (route) => {
        void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      });
      await page.route('**/api/calendars/shared', (route) => {
        void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      });

      await page.goto('/login');
      await page.getByPlaceholder('Email').fill('test@example.com');
      await page.getByPlaceholder('Password').fill('password123');
      await page.getByRole('button', { name: 'Sign In' }).click();

      // Should redirect away from login
      await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 });
    });
  });
});
