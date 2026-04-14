// E2E test - Explainability Dashboard
import { test, expect } from '@playwright/test';

test('Explainability dashboard visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('explainability-dashboard')).toBeVisible();
});
