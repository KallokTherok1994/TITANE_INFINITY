// E2E test - Explainability Dashboard
import { test, expect } from '@playwright/test';

test('Explainability dashboard visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('explainability-dashboard')).toBeVisible();
  await expect(page.getByTestId('explainability-dashboard')).toHaveAttribute(
    'data-readiness',
    'partial'
  );
  await expect(page.getByTestId('explainability-dashboard-status')).toContainText(
    'PARTIAL'
  );
  await expect(page.getByTestId('explainability-dashboard-proof-0')).toBeVisible();
  await expect(page.getByTestId('explainability-dashboard-next-step')).toContainText(
    'Publier la chaine requested -> used -> shown'
  );
});
