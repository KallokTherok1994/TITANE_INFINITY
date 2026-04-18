// E2E test - Diagnostic Panel
import { test, expect } from '@playwright/test';

test('Diagnostic panel visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  const diagnosticPanel = page.getByTestId('diagnostic-panel');

  if (await diagnosticPanel.isHidden()) {
    await page
      .getByTestId('agent-dashboards-panel-toggle')
      .evaluate((button: HTMLButtonElement) => button.click());
  }

  await expect(diagnosticPanel).toBeVisible();
  await expect(diagnosticPanel).toHaveAttribute('data-readiness', 'partial');
  await expect(page.getByTestId('diagnostic-panel-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('diagnostic-panel-proof-0')).toBeVisible();
  await expect(page.getByTestId('diagnostic-panel-diagnostic-report')).toBeVisible();
  await expect(page.getByTestId('diagnostic-panel-diagnostic-history')).toBeVisible();
  await expect(page.getByTestId('diagnostic-panel-diagnostic-report-0')).toContainText(
    'Severite:'
  );
  await expect(page.getByTestId('diagnostic-panel-next-step')).toContainText(
    'Transformer ces signaux passifs en rapport d anomalie structure'
  );
});
