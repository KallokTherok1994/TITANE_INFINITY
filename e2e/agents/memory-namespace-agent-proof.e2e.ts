import { expect, test } from '@playwright/test';
import { closeBootBeaconIfPresent } from '../helpers/navigation';

test('Agent dashboards keep namespace memory contamination out of visible runtime truth', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const now = Date.now();
    window.localStorage.setItem(
      'titane_chat_mode_default',
      JSON.stringify({
        mode: 'default',
        messages: [
          {
            id: 'prod-agent-proof',
            role: 'assistant',
            content: 'agent-prod-marker',
            timestamp: now,
          },
        ],
        compressed: [],
        lastCompacted: now,
      })
    );

    window.localStorage.setItem(
      'titane_test_chat_mode_default',
      JSON.stringify({
        mode: 'default',
        messages: [
          {
            id: 'test-agent-proof',
            role: 'assistant',
            content: 'agent-test-should-not-leak',
            timestamp: now,
          },
        ],
        compressed: [],
        lastCompacted: now,
      })
    );
  });

  await page.goto('/titane');
  await closeBootBeaconIfPresent(page);

  const monitoring = page.getByTestId('monitoring-dashboard');
  const diagnostic = page.getByTestId('diagnostic-panel');
  const orchestrator = page.getByTestId('orchestrator-dashboard');
  const logAnalysis = page.getByTestId('log-analysis-dashboard');

  if (await monitoring.isHidden()) {
    await page
      .getByTestId('agent-dashboards-panel-toggle')
      .evaluate((button: HTMLButtonElement) => button.click());
  }

  await expect(monitoring).toBeVisible();
  await expect(diagnostic).toBeVisible();
  await expect(orchestrator).toBeVisible();
  await expect(logAnalysis).toBeVisible();

  await expect(page.getByTestId('monitoring-dashboard-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('diagnostic-panel-status')).toContainText('PARTIAL');
  await expect(page.getByTestId('orchestrator-dashboard-status')).toContainText(
    'PARTIAL'
  );
  await expect(page.getByTestId('log-analysis-dashboard-status')).toContainText(
    'PARTIAL'
  );

  const bodyText = await page.locator('body').innerText();
  expect(bodyText.includes('agent-test-should-not-leak')).toBe(false);
});
