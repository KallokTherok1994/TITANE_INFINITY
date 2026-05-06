import { expect, test } from '@playwright/test';

test('Log analysis dashboard visible avec rapport intelligent', async ({ page }) => {
  await page.goto('/');

  const dashboard = page.getByTestId('log-analysis-dashboard');
  if (await dashboard.isHidden()) {
    await page
      .getByTestId('agent-dashboards-panel-toggle')
      .evaluate((button: HTMLButtonElement) => button.click());
  }

  await expect(dashboard).toBeVisible();
  await expect(dashboard).toHaveAttribute('data-readiness', 'partial');
  await expect(page.getByTestId('log-analysis-dashboard-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('log-analysis-dashboard-proof-0')).toBeVisible();
  await expect(page.getByTestId('log-analysis-dashboard-report')).toBeVisible();
  await expect(page.getByTestId('log-analysis-dashboard-markdown-preview')).toBeVisible();
  await expect(page.getByTestId('log-analysis-dashboard-next-step')).toContainText(
    /pipeline gouvern/i
  );
});
