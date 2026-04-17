// E2E test - Diagnostic Panel
import { test, expect } from '@playwright/test';

test('Diagnostic panel visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('diagnostic-panel')).toBeVisible();
  await expect(page.getByTestId('diagnostic-panel')).toHaveAttribute(
    'data-readiness',
    'partial'
  );
  await expect(page.getByTestId('diagnostic-panel-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('diagnostic-panel-proof-0')).toBeVisible();
  await expect(page.getByTestId('diagnostic-panel-next-step')).toContainText(
    'Transformer ces signaux passifs en rapport d anomalie structure'
  );
});
