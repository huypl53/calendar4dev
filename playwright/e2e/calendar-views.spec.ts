import { test, expect } from '../support/merged-fixtures';
import { mockAuthSession } from '../support/helpers/auth-mock';
import { mockCalendarApp } from '../support/helpers/calendar-mock';

test.describe('Calendar Views', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockCalendarApp(page);
  });

  test.describe('Application shell', () => {
    test('renders header with Dev Calendar branding', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByTestId('header')).toBeVisible();
      await expect(page.getByText('Dev Calendar')).toBeVisible();
    });

    test('renders view switcher buttons', async ({ page }) => {
      await page.goto('/');

      const switcher = page.getByTestId('view-switcher');
      await expect(switcher).toBeVisible();
      await expect(switcher.getByTestId('view-day')).toBeVisible();
      await expect(switcher.getByTestId('view-week')).toBeVisible();
      await expect(switcher.getByTestId('view-month')).toBeVisible();
      await expect(switcher.getByTestId('view-schedule')).toBeVisible();
    });

    test('sidebar element exists in DOM', async ({ page }) => {
      await page.goto('/');
      // Sidebar starts closed by default (0px grid column), but the element exists in DOM
      await expect(page.getByTestId('sidebar')).toBeAttached();
    });

    test('Today button navigates to today', async ({ page }) => {
      await page.goto('/week/2026-01-01');

      const todayBtn = page.getByTestId('today-button');
      await expect(todayBtn).toBeVisible();
      await todayBtn.click();

      // URL should update away from the old date
      await expect(page).not.toHaveURL(/2026-01-01/);
    });
  });

  test.describe('View switching', () => {
    test('switches to Day view', async ({ page }) => {
      await page.goto('/');

      await page.getByTestId('view-day').click();
      await expect(page).toHaveURL(/\/day\//);
    });

    test('switches to Week view', async ({ page }) => {
      await page.goto('/');

      await page.getByTestId('view-week').click();
      await expect(page).toHaveURL(/\/week\//);
    });

    test('switches to Month view', async ({ page }) => {
      await page.goto('/');

      await page.getByTestId('view-month').click();
      await expect(page).toHaveURL(/\/month\//);
    });

    test('switches to Schedule view', async ({ page }) => {
      await page.goto('/');

      await page.getByTestId('view-schedule').click();
      await expect(page).toHaveURL(/\/schedule/);
    });
  });

  test.describe('Navigation', () => {
    test('Previous and Next buttons change date in week view', async ({ page }) => {
      await page.goto('/week/2026-04-07');

      const label = page.getByTestId('date-label');
      const initialText = await label.textContent();

      await page.getByTestId('nav-next').click();
      const nextText = await label.textContent();
      expect(nextText).not.toBe(initialText);

      await page.getByTestId('nav-prev').click();
      const backText = await label.textContent();
      expect(backText).toBe(initialText);
    });

    test('Schedule view does not show prev/next buttons', async ({ page }) => {
      await page.goto('/schedule');

      await expect(page.getByTestId('nav-prev')).not.toBeVisible();
      await expect(page.getByTestId('nav-next')).not.toBeVisible();
    });
  });

  test.describe('Keyboard shortcuts', () => {
    test('pressing "w" navigates to Week view', async ({ page }) => {
      await page.goto('/month/2026-04-01');
      await page.getByTestId('main-content').click();
      await page.keyboard.press('w');

      await expect(page).toHaveURL(/\/week\//);
    });

    test('pressing "d" navigates to Day view', async ({ page }) => {
      // Start from a stable non-root URL to avoid redirect race conditions
      await page.goto('/month/2026-04-01');
      await page.getByTestId('main-content').click();
      await page.keyboard.press('d');

      await expect(page).toHaveURL(/\/day\//);
    });

    test('pressing "m" navigates to Month view', async ({ page }) => {
      // Start from day view to avoid being already in the target view
      await page.goto('/month/2026-04-01');
      await page.getByTestId('main-content').click();
      // Navigate away first (to day), then press m to return to month
      await page.keyboard.press('d');
      await page.waitForURL(/\/day\//);
      await page.keyboard.press('m');

      await expect(page).toHaveURL(/\/month\//);
    });

    test('pressing "s" navigates to Schedule view', async ({ page }) => {
      await page.goto('/month/2026-04-01');
      await page.getByTestId('main-content').click();
      await page.keyboard.press('s');

      await expect(page).toHaveURL(/\/schedule/);
    });
  });

  test.describe('Sidebar toggle', () => {
    test('toggling sidebar button opens and closes the sidebar column', async ({ page }) => {
      await page.goto('/week/2026-04-07');

      // Sidebar starts CLOSED by default (sidebarOpen: false in the UI store)
      // First click: OPENS the sidebar (column becomes var(--density-sidebar-width))
      await page.getByRole('button', { name: /toggle sidebar/i }).click();

      await page.waitForFunction(() => {
        const sidebar = document.querySelector('[data-testid="sidebar"]');
        const grid = sidebar?.parentElement as HTMLElement | null;
        // After opening, gridTemplateColumns starts with "var(" or a pixel value, NOT "0px"
        const cols = grid?.style.gridTemplateColumns ?? '';
        return cols.length > 0 && !cols.startsWith('0px');
      }, { timeout: 2000 });

      // Second click: CLOSES the sidebar (column back to 0px)
      await page.getByRole('button', { name: /toggle sidebar/i }).click();

      await page.waitForFunction(() => {
        const sidebar = document.querySelector('[data-testid="sidebar"]');
        const grid = sidebar?.parentElement as HTMLElement | null;
        return (grid?.style.gridTemplateColumns ?? '').startsWith('0px');
      }, { timeout: 2000 });
    });
  });
});
