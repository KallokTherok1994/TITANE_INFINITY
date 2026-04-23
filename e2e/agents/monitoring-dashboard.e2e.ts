// E2E test - Monitoring Dashboard
import { test, expect } from '@playwright/test';

test('Monitoring dashboard visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  const monitoringDashboard = page.getByTestId('monitoring-dashboard');

  if (await monitoringDashboard.isHidden()) {
    await page
      .getByTestId('agent-dashboards-panel-toggle')
      .evaluate((button: HTMLButtonElement) => button.click());
  }

  await expect(monitoringDashboard).toBeVisible();
  await expect(monitoringDashboard).toHaveAttribute('data-readiness', 'partial');
  await expect(page.getByTestId('monitoring-dashboard-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('monitoring-dashboard-sync-state')).toContainText(
    'Sync runtime:'
  );
  await expect(page.getByTestId('monitoring-dashboard-sync-reason')).toBeVisible();
  await expect(page.getByTestId('monitoring-dashboard-proof-0')).toBeVisible();
  await expect(page.getByTestId('monitoring-dashboard-proof-0')).toContainText(
    'Runtime Sync:'
  );
  await expect(page.getByTestId('monitoring-dashboard-next-step')).toContainText(
    'publier les metriques live'
  );
});
