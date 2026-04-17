// E2E test - Orchestrator Dashboard
import { test, expect } from '@playwright/test';

test('Orchestrator dashboard visible et selectors présents', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('orchestrator-dashboard')).toBeVisible();
  await expect(page.getByTestId('orchestrator-dashboard')).toHaveAttribute(
    'data-readiness',
    'partial'
  );
  await expect(page.getByTestId('orchestrator-dashboard-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('orchestrator-dashboard-proof-0')).toBeVisible();
  await expect(page.getByTestId('orchestrator-dashboard-next-step')).toContainText(
    'Brancher les metriques de charge'
  );
});
