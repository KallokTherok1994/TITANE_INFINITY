// E2E test - Security Dashboard
import { test, expect } from '@playwright/test';
import { closeBootBeaconIfPresent } from '../helpers/navigation';

test('Security dashboard visible et selectors présents', async ({ page }) => {
  await page.addInitScript(() => {
    const now = Date.now();
    window.localStorage.setItem(
      'titane_ui_logs',
      JSON.stringify([
        {
          timestamp: now,
          level: 'security',
          message: 'Injected dashboard security event',
          sessionId: 'e2e-security-primary',
        },
      ])
    );
    window.localStorage.setItem(
      'titane_security_dashboard_event_history',
      JSON.stringify([
        {
          id: 'e2e-session-alpha',
          category: 'detection',
          severity: 'warning',
          source: 'uiLogger',
          message: 'UILogger:Seed warning session alpha',
          correlationKey: 'scope-alpha',
          timestamp: now - 1000,
          lastSeen: now - 1000,
          acknowledged: false,
          sessionId: 'session-alpha',
        },
        {
          id: 'e2e-session-beta',
          category: 'containment',
          severity: 'critical',
          source: 'provider-governance',
          message: 'Provider:beta: active=no · healthy=no · consecutiveFailures=4',
          correlationKey: 'provider-beta',
          timestamp: now - 500,
          lastSeen: now - 500,
          acknowledged: false,
          sessionId: 'session-beta',
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
  await expect(page.getByTestId('security-dashboard-multi-session-federation')).toBeVisible();
  await expect(page.getByTestId('security-dashboard-multi-session-federation')).toContainText(
    'session-beta'
  );
  await page
    .getByTestId('security-dashboard-filter-critical')
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByTestId('security-dashboard-filter-critical')).toHaveAttribute(
    'data-active',
    'yes'
  );
  await expect(page.getByTestId('security-dashboard-severity-filter-summary')).toContainText(
    'critical'
  );
  await expect(page.getByTestId('security-dashboard-event-history-0')).toContainText(
    'severity=critical'
  );
  await page
    .getByTestId('security-dashboard-export-correlations')
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(
    page.getByTestId('security-dashboard-containment-correlation-export')
  ).toContainText('"severityFilter": "critical"');
  await expect(
    page.getByTestId('security-dashboard-containment-correlation-export')
  ).toContainText('"sessionId": "session-beta"');
  await expect(page.getByTestId('security-dashboard-next-step')).toContainText(
    'export gouverne signe'
  );
});
