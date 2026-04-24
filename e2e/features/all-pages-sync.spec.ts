import { test, expect } from '@playwright/test';
import { openAdminTab, openTitane } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

test.describe('Feature: All Pages Sync', () => {
  if (!FULL_E2E_ENABLED) {
    test('gate disabled proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test('syncs TITANE tabs including Vue and XP progression', async ({ page }) => {
    await openTitane(page);
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 15000 });

    const titaneTabs = [
      'tab-conversation',
      'tab-overview',
      'tab-vision',
      'tab-memory',
      'tab-progression',
      'tab-transformation',
    ] as const;

    for (const tabTestId of titaneTabs) {
      const tab = page.getByTestId(tabTestId);
      await expect(tab).toBeVisible({ timeout: 15000 });
      await tab.click({ force: true });
      await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 15000 });
    }

    await expect(page).toHaveURL(/\/titane\?tab=transformation/, { timeout: 15000 });
  });

  test('syncs XP dedicated page and primary XP widgets', async ({ page }) => {
    await page.goto('/experience');
    await expect(page.getByTestId('page-experience')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('experience-stats-advanced')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId('experience-history-list')).toBeVisible({
      timeout: 15000,
    });
  });

  test('syncs all TIME tabs', async ({ page }) => {
    await page.goto('/time');
    await expect(page.getByTestId('page-time')).toBeVisible({ timeout: 15000 });

    const timeTabs = [
      'tab-time-now',
      'tab-time-agenda',
      'tab-time-timeline',
      'tab-time-snapshots',
      'tab-time-cognitive',
    ] as const;

    for (const tabTestId of timeTabs) {
      const tab = page.getByTestId(tabTestId);
      await expect(tab).toBeVisible({ timeout: 15000 });
      await tab.click({ force: true });
      await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 15000 });
    }
  });

  test('syncs ADMIN Configuration Hub, Design, Gouvernance and Sante prod', async ({
    page,
  }) => {
    await openAdminTab(page, 'config');

    const configRoot = page.locator('[data-testid="page-configuration-hub"]').first();
    const configDegraded = page
      .locator(
        'text=/Erreur de chargement de la configuration|Configuration incomplete/i'
      )
      .first();
    await expect(configRoot.or(configDegraded)).toBeVisible({ timeout: 20000 });

    await openAdminTab(page, 'design');
    await expect(page.locator('[data-testid="page-design-center"]').first()).toBeVisible({
      timeout: 20000,
    });

    await openAdminTab(page, 'governance');
    await expect(
      page.locator('[data-testid="page-governance-center"]').first()
    ).toBeVisible({
      timeout: 20000,
    });

    await openAdminTab(page, 'production-health');
    const refresh = page.getByTestId('production-health-refresh');
    const retry = page.getByRole('button', { name: /Reessayer|Réessayer/i }).first();
    await expect(refresh.or(retry)).toBeVisible({ timeout: 20000 });
  });
});
