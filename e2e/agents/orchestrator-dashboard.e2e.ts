// E2E test - Orchestrator Dashboard
import { test, expect } from '@playwright/test';
import { closeBootBeaconIfPresent } from '../helpers/navigation';

test('Orchestrator dashboard visible et selectors présents', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'titane_orchestrator_session_snapshots',
      JSON.stringify([
        {
          sessionId: 'session-seeded-alpha',
          timestamp: Date.now() - 4000,
          totalRequests: 3,
          successRate: 66.7,
          healthyProviders: 2,
          providerCount: 3,
          totalFallbacks: 1,
          topProvider: 'ollama',
        },
      ])
    );
  });

  await page.goto('/titane');
  await closeBootBeaconIfPresent(page);
  const orchestratorDashboard = page.getByTestId('orchestrator-dashboard');

  if (await orchestratorDashboard.isHidden()) {
    await page
      .getByTestId('agent-dashboards-panel-toggle')
      .evaluate((button: HTMLButtonElement) => button.click());
  }

  await expect(orchestratorDashboard).toBeVisible();
  await expect(orchestratorDashboard).toHaveAttribute('data-readiness', 'partial');
  await expect(page.getByTestId('orchestrator-dashboard-status')).toContainText(
    'PARTIAL'
  );
  await expect(page.getByTestId('orchestrator-dashboard-proof-0')).toBeVisible();
  await expect(page.getByTestId('orchestrator-dashboard-refresh')).toContainText('15s');
  await expect(page.getByTestId('orchestrator-dashboard-live-metrics')).toBeVisible();
  await expect(
    page.getByTestId('orchestrator-dashboard-provider-snapshots')
  ).toBeVisible();
  await expect(page.getByTestId('orchestrator-dashboard-live-timeline')).toBeVisible();
  await expect(
    page.getByTestId('orchestrator-dashboard-multi-session-compare')
  ).toBeVisible();
  await expect(
    page.getByTestId('orchestrator-dashboard-champion-breakdown')
  ).toBeVisible();
  await expect(
    page.getByTestId('orchestrator-dashboard-champion-breakdown-0')
  ).toContainText('champion=');
  await expect(page.getByTestId('orchestrator-dashboard-next-step')).toContainText(
    'multi-session'
  );
});
