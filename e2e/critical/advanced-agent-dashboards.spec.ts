/**
 * Advanced agents dashboards — UI 100/100 plan phase D
 *
 * Verifies that all 6 advanced agent dashboards are reachable, rendered,
 * and expose the canonical data-testid contract required by AGENTS.md
 * (monitoring, diagnostic, explainability, orchestrator, security,
 * log-analysis). The AgentDashboardsPanel is rendered inside AppShell for
 * every page; we open it from `/dashboard` (a stable canonical route).
 *
 * Output: proof_packs/v34.0.7-agent-dashboards/agent-dashboards-panel.png
 */
import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUTPUT_DIR = resolve(process.cwd(), 'proof_packs/v34.0.7-agent-dashboards');
mkdirSync(OUTPUT_DIR, { recursive: true });

const CANONICAL_APP_SHELL_ROUTE = '/experience';

test.use({ viewport: { width: 1440, height: 960 } });

async function ensureAgentDashboardsPanelExpanded(
  page: Parameters<Parameters<typeof test>[1]>[0]['page']
) {
  const toggle = page.locator('[data-testid="agent-dashboards-panel-toggle"]');
  await expect(toggle).toBeVisible();

  if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
    await toggle.click({ force: true });
  }

  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
}

// Canonical dashboard testids per AGENTS.md.
// Note: diagnostic dashboard exposes the `diagnostic-panel` testid (legacy
// canonical contract), all others use `<agent>-dashboard`.
const DASHBOARD_TESTIDS = [
  'monitoring-dashboard',
  'diagnostic-panel',
  'explainability-dashboard',
  'orchestrator-dashboard',
  'security-dashboard',
  'log-analysis-dashboard',
];

test('v34.0.7 advanced agent dashboards are reachable and expose canonical testids', async ({ page }) => {
  await page.goto(CANONICAL_APP_SHELL_ROUTE, {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(300);

  // Locate the agent dashboards panel container.
  const panel = page.locator('[data-testid="agent-dashboards-panel"]');
  await expect(panel).toBeVisible({ timeout: 10_000 });

  await ensureAgentDashboardsPanelExpanded(page);

  // The collapsible content becomes visible.
  const content = page.locator('[data-testid="agent-dashboards-panel-content"]');
  await expect(content).toBeVisible({ timeout: 5_000 });

  // Verify each of the 6 canonical dashboards is rendered (attached).
  for (const testid of DASHBOARD_TESTIDS) {
    const dash = page.locator(`[data-testid="${testid}"]`);
    await expect(dash, `${testid} must be present`).toHaveCount(1, { timeout: 5_000 });
  }

  await page.screenshot({
    path: resolve(OUTPUT_DIR, 'agent-dashboards-panel.png'),
    fullPage: true,
  });
});

test('v34.0.7 log-analysis dashboard exposes canonical testid contract', async ({ page }) => {
  await page.goto(CANONICAL_APP_SHELL_ROUTE, {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

  await ensureAgentDashboardsPanelExpanded(page);

  const required = [
    'log-analysis-dashboard',
    'log-analysis-dashboard-status',
    'log-analysis-dashboard-summary',
    'log-analysis-dashboard-service-state',
    'log-analysis-dashboard-refresh',
    'log-analysis-dashboard-report',
  ];
  for (const testid of required) {
    await expect(
      page.locator(`[data-testid="${testid}"]`),
      `log-analysis requires ${testid}`
    ).toHaveCount(1, { timeout: 5_000 });
  }

  await page.screenshot({
    path: resolve(OUTPUT_DIR, 'log-analysis-dashboard.png'),
    fullPage: false,
  });
});

test('v34.0.7 advanced agent dashboards inventory invariant', () => {
  // Anti-regression: must always cover the 6 canonical agents per AGENTS.md.
  expect(DASHBOARD_TESTIDS.length).toBe(6);
});
