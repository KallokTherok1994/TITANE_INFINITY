// E2E test - Diagnostic Panel
import { test, expect } from '@playwright/test';

test('Diagnostic panel visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('diagnostic-panel')).toBeVisible();
});
