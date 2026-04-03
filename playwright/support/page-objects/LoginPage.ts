import type { Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  get emailInput() {
    return this.page.getByRole('textbox', { name: /email/i });
  }

  get passwordInput() {
    return this.page.getByLabel(/password/i);
  }

  get nameInput() {
    return this.page.getByRole('textbox', { name: /name/i });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /sign in|login|log in|register|sign up/i });
  }

  get toggleModeButton() {
    return this.page.getByRole('button', { name: /register|sign up|already have an account|sign in/i });
  }

  get errorMessage() {
    return this.page.getByRole('alert').or(this.page.locator('[data-testid="error"]'));
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async register(name: string, email: string, password: string) {
    await this.toggleModeButton.click();
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
