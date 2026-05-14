import { test, expect } from '@playwright/test';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

test.describe('Feature: MultiProject navigation truth', () => {
  if (!FULL_E2E_ENABLED) {
    test('gate disabled proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test('opens /multiproject from the More menu and lands on the canonical surface', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('nav-top-main')).toBeVisible({ timeout: 15000 });

    const moreButton = page.getByTestId('btn-nav-more');
    await expect(moreButton).toBeVisible({ timeout: 15000 });
    await moreButton.click({ force: true });

    const projectsItem = page.getByTestId('nav-projects');
    await expect(projectsItem).toBeVisible({ timeout: 15000 });
    await projectsItem.click({ force: true });

    await expect(page).toHaveURL(/\/multiproject(\?|$)/, { timeout: 15000 });
    await expect(page.getByTestId('multiproject-dashboard')).toBeVisible({ timeout: 15000 });
    await expect(moreButton).toHaveAttribute('aria-current', 'page');
  });
});