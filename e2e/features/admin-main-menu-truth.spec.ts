/**
 * E2E Test: Admin Main Menu Truth Audit
 * Verifie le chargement de tous les onglets ADMIN, la presence des sous-onglets,
 * et l'absence d'erreur d'import dynamique critique.
 */

import { test, expect } from '@playwright/test';
import { openAdminTab } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';
const IMPORT_FAILURE_PATTERN =
  /Importing a module script failed|Failed to fetch dynamically imported module/i;

test.describe('Feature: Admin Main Menu Truth', () => {
  if (!FULL_E2E_ENABLED) {
    test('gate disabled proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test('loads every admin tab without dynamic import failure', async ({ page }) => {
    const importFailures: string[] = [];

    page.on('pageerror', error => {
      if (IMPORT_FAILURE_PATTERN.test(error.message)) {
        importFailures.push(error.message);
      }
    });

    page.on('console', msg => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      if (IMPORT_FAILURE_PATTERN.test(text)) {
        importFailures.push(text);
      }
    });

    await openAdminTab(page, /Systeme|Syst[eè]me|System/i);

    const tabAssertions = [
      {
        tabTestId: 'tab-admin-system',
        rootSelector: '[data-testid="page-system-center"]',
      },
      {
        tabTestId: 'tab-admin-config',
        rootSelector: '[data-testid="page-configuration-hub"]',
      },
      {
        tabTestId: 'tab-admin-audio',
        rootSelector: '[data-testid="page-audio-center"]',
      },
      {
        tabTestId: 'tab-admin-design',
        rootSelector: '[data-testid="page-design-center"]',
      },
      {
        tabTestId: 'tab-admin-governance',
        rootSelector: '[data-testid="page-governance-center"]',
      },
      {
        tabTestId: 'tab-admin-production-health',
        rootSelector: '[data-testid="production-health-panel"]',
      },
    ] as const;

    for (const assertion of tabAssertions) {
      const tabButton = page.getByTestId(assertion.tabTestId);
      await expect(tabButton).toBeVisible({ timeout: 15000 });
      await tabButton.click({ force: true });
      await expect(tabButton).toHaveClass(/admin-tab--active/, { timeout: 15000 });
      await expect(page.locator(assertion.rootSelector).first()).toBeVisible({
        timeout: 20000,
      });
    }

    expect(
      importFailures,
      `Import failures detectees: ${importFailures.join(' | ')}`
    ).toEqual([]);
  });

  test('exposes expected sub-tabs and controls per admin section', async ({ page }) => {
    await openAdminTab(page, /Systeme|Syst[eè]me|System/i);

    // Systeme
    await expect(page.getByRole('button', { name: /Diagnostics/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /DevTools/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Node Cluster/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Introspection/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /HyperVision/i })).toBeVisible();

    // Configuration
    await page.getByTestId('tab-admin-config').click({ force: true });
    await expect(page.getByTestId('tab-config-system')).toBeVisible();
    await expect(page.getByTestId('tab-config-ai')).toBeVisible();
    await expect(page.getByTestId('tab-config-performance')).toBeVisible();

    // Audio & Voix
    await page.getByTestId('tab-admin-audio').click({ force: true });
    await expect(page.getByTestId('tab-audio-voice')).toBeVisible();
    await expect(page.getByTestId('tab-audio-devices')).toBeVisible();
    await expect(page.getByTestId('tab-audio-diagnostics')).toBeVisible();
    await expect(page.getByTestId('tab-audio-advanced')).toBeVisible();

    // Design
    await page.getByTestId('tab-admin-design').click({ force: true });
    await expect(page.getByRole('button', { name: /Design System/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Apparence/i })).toBeVisible();

    // Gouvernance
    await page.getByTestId('tab-admin-governance').click({ force: true });
    await expect(page.getByRole('button', { name: /Secrets/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Politiques/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Permissions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Journal/i })).toBeVisible();

    // Sante Prod
    await page.getByTestId('tab-admin-production-health').click({ force: true });
    const refresh = page.getByTestId('production-health-refresh');
    const retry = page.getByRole('button', { name: /Reessayer|Réessayer/i }).first();
    await expect(refresh.or(retry)).toBeVisible({ timeout: 15000 });
  });
});
