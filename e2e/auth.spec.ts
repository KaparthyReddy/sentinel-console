import { expect, test } from '@playwright/test';
import { ACCOUNTS, signIn } from './helpers';

const LOGIN_HEADING = { level: 1, name: 'Sign in to Sentinel Console' } as const;

test.describe('authentication', () => {
  test('sends signed-out visitors to the login page', async ({ page }) => {
    await page.goto('/alerts');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', LOGIN_HEADING)).toBeVisible();
  });

  test('flags empty fields and focuses the first problem', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Enter your username.')).toBeVisible();
    await expect(page.getByLabel('Username')).toBeFocused();
  });

  test('rejects a wrong password with an announced error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill(ACCOUNTS.admin.username);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toContainText('Invalid username or password.');
    await expect(page.getByLabel('Password')).toBeFocused();
  });

  test('returns to the originally requested page after signing in', async ({ page }) => {
    await signIn(page, 'operator', '/alerts');
    await expect(page.getByRole('heading', { level: 1, name: 'Alerts' })).toBeVisible();
    await expect(page).toHaveURL(/\/alerts$/);
  });

  test('signs out back to the login page', async ({ page }) => {
    await signIn(page, 'viewer');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', LOGIN_HEADING)).toBeVisible();
  });

  test('keeps the access token out of browser storage', async ({ page }) => {
    await signIn(page, 'admin');
    const storage = await page.evaluate(() =>
      JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }),
    );
    expect(storage).not.toContain('mock-token');
  });
});
