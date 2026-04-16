import { test, expect } from '@playwright/test';
import { closeBootBeaconIfPresent } from '../helpers/navigation';

test.describe('Feature: Anti-Regression Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin?tab=anti-regression', { waitUntil: 'load' });
    await closeBootBeaconIfPresent(page);
    await expect(page.getByTestId('page-admin')).toBeVisible({ timeout: 30000 });
  });

  test('renders the canonical anti-regression surface and summary', async ({ page }) => {
    const dashboard = page.getByTestId('self-healing-dashboard');
    const summary = page.getByTestId('anti-regression-summary');

    await expect(dashboard).toBeVisible({ timeout: 20000 });
    await expect(summary).toBeVisible({ timeout: 20000 });
    await expect(summary).toContainText(/anti-regression-guardian/i);
  });

  test('shows a truthful visible runtime mode', async ({ page }) => {
    const connection = page.getByText(/Backend Connecté|Mode Demo/i).first();
    const summary = page.getByTestId('anti-regression-summary');

    await expect(connection).toBeVisible({ timeout: 20000 });
    await expect(summary).toContainText(/healthy|watch|blocked/i);
  });
});