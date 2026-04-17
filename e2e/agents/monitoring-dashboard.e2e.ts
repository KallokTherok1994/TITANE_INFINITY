// E2E test - Monitoring Dashboard
import { test, expect } from '@playwright/test';

test('Monitoring dashboard visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('monitoring-dashboard')).toBeVisible();
  await expect(page.getByTestId('monitoring-dashboard')).toHaveAttribute(
    'data-readiness',
    'partial'
  );
  await expect(page.getByTestId('monitoring-dashboard-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('monitoring-dashboard-proof-0')).toBeVisible();
  await expect(page.getByTestId('monitoring-dashboard-next-step')).toContainText(
    'Initialiser le monitoring paresseux au boot canonique'
  );
});
