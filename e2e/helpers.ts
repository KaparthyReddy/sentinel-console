import { expect, type Page } from '@playwright/test';

export const ACCOUNTS = {
  admin: { username: 'admin', password: 'admin123' },
  operator: { username: 'operator', password: 'operator123' },
  viewer: { username: 'viewer', password: 'viewer123' },
} as const;

export type AccountName = keyof typeof ACCOUNTS;

/**
 * Signs in through the real form. The token lives in memory only, so a full
 * page.goto() afterwards would sign the user out again: navigate with goTo().
 */
export async function signIn(page: Page, account: AccountName, startPath = '/'): Promise<void> {
  await page.goto(startPath);
  await page.getByLabel('Username').fill(ACCOUNTS[account].username);
  await page.getByLabel('Password').fill(ACCOUNTS[account].password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /^Sign in/ })).toBeHidden();
}

/** Clicks a sidebar link (opening the menu first on small screens). */
export async function goTo(page: Page, label: string): Promise<void> {
  const menuButton = page.getByRole('button', { name: 'Menu' });
  if (await menuButton.isVisible()) {
    await menuButton.click();
  }
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: label }).click();
}

/** Waits until every loading spinner has gone. */
export async function waitForLoaded(page: Page): Promise<void> {
  await expect(page.getByText(/^Loading/)).toHaveCount(0);
}
