// E2E test - Orchestrator Dashboard
import { test, expect } from '@playwright/test';
import { closeBootBeaconIfPresent } from '../helpers/navigation';

test('Orchestrator dashboard visible et selectors présents', async ({ page }) => {
  await page.goto('/titane');
  await closeBootBeaconIfPresent(page);
  await expect(page.getByTestId('orchestrator-dashboard')).toBeVisible();
  await expect(page.getByTestId('orchestrator-dashboard')).toHaveAttribute(
    'data-readiness',
    'partial'
  );
  await expect(page.getByTestId('orchestrator-dashboard-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('orchestrator-dashboard-proof-0')).toBeVisible();
  await expect(page.getByTestId('orchestrator-dashboard-refresh')).toContainText('15s');
  await expect(page.getByTestId('orchestrator-dashboard-live-metrics')).toBeVisible();
  await expect(page.getByTestId('orchestrator-dashboard-provider-snapshots')).toBeVisible();
  await expect(page.getByTestId('orchestrator-dashboard-live-timeline')).toBeVisible();
  await expect(page.getByTestId('orchestrator-dashboard-next-step')).toContainText(
    'multi-session'
  );
});
