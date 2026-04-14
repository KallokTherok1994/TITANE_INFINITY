// E2E test - Security Dashboard
import { test, expect } from '@playwright/test';

test('Security dashboard visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('security-dashboard')).toBeVisible();
});
