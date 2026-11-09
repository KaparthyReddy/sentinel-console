import { expect, test } from '@playwright/test';
import { goTo, signIn, waitForLoaded } from './helpers';

test.describe('dashboard and shipments', () => {
  test('shows summary figures and the at-risk shipments', async ({ page }) => {
    await signIn(page, 'operator');
    await waitForLoaded(page);

    await expect(page.getByRole('region', { name: 'Summary' })).toBeVisible();
    await expect(page.getByText('Active shipments')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Shipments currently at risk' })).toBeVisible();
  });

  test('receives live alerts without a refresh', async ({ page }) => {
    await signIn(page, 'operator');

    await expect(page.getByText('Live', { exact: true })).toBeVisible();
    // The mock stream emits an alert about every 10 seconds
    await expect(page.getByRole('list', { name: 'Recent live alerts' })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('opens a shipment and shows its temperature history', async ({ page }) => {
    await signIn(page, 'operator');
    await waitForLoaded(page);

    await page
      .getByRole('region', { name: 'Shipments currently at risk' })
      .getByRole('link')
      .first()
      .click();

    await expect(page.getByRole('heading', { level: 1, name: /^CC-2026-/ })).toBeVisible();
    await expect(
      page.getByRole('img', { name: /Line chart of 48 temperature readings/ }),
    ).toBeVisible();

    await page.getByText('View the latest readings as a table').click();
    await expect(page.getByRole('table', { name: /Temperature readings/ })).toBeVisible();
  });

  test('searches shipments', async ({ page }) => {
    await signIn(page, 'operator');
    await goTo(page, 'Shipments');
    await waitForLoaded(page);

    await page.getByLabel('Search').fill('insulin');
    await expect(page.getByText(/Showing 1.5 of 5/)).toBeVisible();
  });

  test('has no horizontal page scroll at any size', async ({ page }) => {
    await signIn(page, 'operator');
    await goTo(page, 'Shipments');
    await waitForLoaded(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
