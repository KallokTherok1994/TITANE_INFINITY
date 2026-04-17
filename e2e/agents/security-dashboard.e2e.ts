// E2E test - Security Dashboard
import { test, expect } from '@playwright/test';
import { closeBootBeaconIfPresent } from '../helpers/navigation';

test('Security dashboard visible et selectors présents', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'titane_ui_logs',
      JSON.stringify([
        {
          timestamp: Date.now(),
          level: 'security',
          message: 'Injected dashboard security event',
          sessionId: 'e2e-security',
        },
      ])
    );
  });

  await page.goto('/titane');
  await closeBootBeaconIfPresent(page);
  await expect(page.getByTestId('security-dashboard')).toBeVisible();
  await expect(page.getByTestId('security-dashboard')).toHaveAttribute(
    'data-readiness',
    'partial'
  );
  await expect(page.getByTestId('security-dashboard-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('security-dashboard-proof-0')).toBeVisible();
  await expect(page.getByTestId('security-dashboard-refresh')).toContainText('10s');
  await expect(page.getByTestId('security-dashboard-detection-events')).toBeVisible();
  await expect(page.getByTestId('security-dashboard-detection-events-0')).toContainText(
    'UILogger:Injected dashboard security event'
  );
  await page
    .getByTestId('security-dashboard-ack-detection-events-0')
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByTestId('security-dashboard-detection-events-0')).toHaveAttribute(
    'data-acknowledged',
    'yes'
  );
  await expect(page.getByTestId('security-dashboard-containment-events')).toBeVisible();
  await expect(page.getByTestId('security-dashboard-event-history')).toBeVisible();
  await expect(page.getByTestId('security-dashboard-correlation-summary')).toBeVisible();
  await expect(page.getByTestId('security-dashboard-next-step')).toContainText(
    'federation multi-session'
  );
});
