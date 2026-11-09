import { expect, test } from '@playwright/test';
import { goTo, signIn } from './helpers';

test.describe('role-based access', () => {
  test('viewers can read alerts but not act on them', async ({ page }) => {
    await signIn(page, 'viewer');
    await goTo(page, 'Alerts');

    await expect(page.getByRole('table', { name: 'Alerts' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /alert for/i })).toHaveCount(0);
  });

  test('operators can acknowledge an alert', async ({ page }) => {
    await signIn(page, 'operator');
    await goTo(page, 'Alerts');

    await page
      .getByRole('button', { name: /^Acknowledge alert for/ })
      .first()
      .click();
    await expect(page.getByText(/^Alert for CC-\d{4}-\d{4} acknowledged\.$/)).toBeVisible();
  });

  test('operators do not see the Thresholds page or its link', async ({ page }) => {
    await signIn(page, 'operator');

    const menuButton = page.getByRole('button', { name: 'Menu' });
    if (await menuButton.isVisible()) await menuButton.click();
    await expect(
      page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Thresholds' }),
    ).toHaveCount(0);

    // Navigate client-side (a full reload would sign the user out)
    await page.evaluate(() => {
      window.history.pushState({}, '', '/thresholds');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(page.getByRole('heading', { level: 1, name: 'Access denied' })).toBeVisible();
  });

  test('admins can edit a product threshold', async ({ page }) => {
    await signIn(page, 'admin');
    await goTo(page, 'Thresholds');

    const form = page.getByRole('form', { name: 'Insulin temperature thresholds' });
    await form.getByLabel(/Minimum/).fill('1');
    await form.getByLabel(/Maximum/).fill('7');
    await form.getByRole('button', { name: 'Save thresholds' }).click();

    await expect(page.getByText('Insulin thresholds saved.')).toBeVisible();
  });

  test('threshold validation explains the problem and moves focus', async ({ page }) => {
    await signIn(page, 'admin');
    await goTo(page, 'Thresholds');

    const form = page.getByRole('form', { name: 'Insulin temperature thresholds' });
    await form.getByLabel(/Minimum/).fill('9');
    await form.getByRole('button', { name: 'Save thresholds' }).click();

    await expect(
      form.getByText('Maximum temperature must be greater than the minimum.'),
    ).toBeVisible();
    await expect(form.getByLabel(/Maximum/)).toBeFocused();
  });
});
