// E2E test - Security Dashboard
import { test, expect } from '@playwright/test';

test('Security dashboard visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('security-dashboard')).toBeVisible();
  await expect(page.getByTestId('security-dashboard')).toHaveAttribute(
    'data-readiness',
    'partial'
  );
  await expect(page.getByTestId('security-dashboard-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('security-dashboard-proof-0')).toBeVisible();
  await expect(page.getByTestId('security-dashboard-next-step')).toContainText(
    'Publier les evenements de detection et de confinement'
  );
});
