import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { goTo, signIn, waitForLoaded } from './helpers';

async function expectAccessible(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const summary = results.violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }));
  expect(results.violations, JSON.stringify(summary, null, 2)).toEqual([]);
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`accessibility (${scheme} mode)`, () => {
    test.use({ colorScheme: scheme });

    test('login page', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectAccessible(page);
    });

    test('login page with validation errors', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page.getByText('Enter your username.')).toBeVisible();
      await expectAccessible(page);
    });

    test('dashboard', async ({ page }) => {
      await signIn(page, 'admin');
      await waitForLoaded(page);
      await expectAccessible(page);
    });

    test('shipments list', async ({ page }) => {
      await signIn(page, 'operator');
      await goTo(page, 'Shipments');
      await waitForLoaded(page);
      await expect(page.getByRole('table', { name: 'Shipments' })).toBeVisible();
      await expectAccessible(page);
    });

    test('shipment detail with chart', async ({ page }) => {
      await signIn(page, 'operator');
      await goTo(page, 'Shipments');
      await waitForLoaded(page);
      await page.getByRole('table', { name: 'Shipments' }).getByRole('link').first().click();
      await expect(page.getByRole('img', { name: /Line chart of/ })).toBeVisible();
      await expectAccessible(page);
    });

    test('alerts', async ({ page }) => {
      await signIn(page, 'operator');
      await goTo(page, 'Alerts');
      await waitForLoaded(page);
      await expect(page.getByRole('table', { name: 'Alerts' })).toBeVisible();
      await expectAccessible(page);
    });

    test('thresholds (admin)', async ({ page }) => {
      await signIn(page, 'admin');
      await goTo(page, 'Thresholds');
      await waitForLoaded(page);
      await expect(
        page.getByRole('form', { name: 'Insulin temperature thresholds' }),
      ).toBeVisible();
      await expectAccessible(page);
    });
  });
}
