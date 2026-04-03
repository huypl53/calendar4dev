import type { Page, Locator } from '@playwright/test';

/**
 * Page object for the main calendar view.
 * Encapsulates selectors and actions for the calendar UI.
 */
export class CalendarPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  // --- Navigation buttons ---
  get todayButton(): Locator {
    return this.page.getByRole('button', { name: /today/i });
  }

  get prevButton(): Locator {
    return this.page.getByRole('button', { name: /previous|prev|←/i });
  }

  get nextButton(): Locator {
    return this.page.getByRole('button', { name: /next|→/i });
  }

  // --- View switcher ---
  viewButton(name: 'Week' | 'Day' | 'Month' | 'Schedule') {
    return this.page.getByRole('button', { name: new RegExp(name, 'i') });
  }

  // --- Event creation ---
  async openNewEventDialog() {
    await this.page.getByRole('button', { name: /new event|create event|\+/i }).first().click();
  }

  // --- Command palette ---
  async openCommandPalette() {
    await this.page.keyboard.press('Meta+k');
  }

  // --- Event locators ---
  eventBlock(title: string): Locator {
    return this.page.getByText(title).first();
  }

  // --- Sidebar ---
  get sidebar(): Locator {
    return this.page.getByRole('complementary');
  }

  get addCalendarButton(): Locator {
    return this.page.getByRole('button', { name: /add calendar|new calendar|\+/i });
  }
}
