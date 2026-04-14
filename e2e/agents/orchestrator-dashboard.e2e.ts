// E2E test - Orchestrator Dashboard
import { test, expect } from '@playwright/test';

test('Orchestrator dashboard visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('orchestrator-dashboard')).toBeVisible();
});
