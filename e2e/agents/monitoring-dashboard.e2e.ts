// E2E test - Monitoring Dashboard
import { test, expect } from '@playwright/test';

test('Monitoring dashboard visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('monitoring-dashboard')).toBeVisible();
});
