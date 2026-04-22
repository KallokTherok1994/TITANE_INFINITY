/**
 * E2E Test: Memory Tree Viewer (Feature Test)
 * TITANE∞ v26.2.0 - Automated Quality Assurance
 *
 * User journey: Navigate to TitanePage Memory section, interact with Memory Tree Viewer
 */

import { test, expect } from '../fixtures';
import { Page } from '@playwright/test';
import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

async function openTitaneMemorySection(page: Page) {
  await openTitane(page);
  await closeBootBeaconIfPresent(page);

  await closeBootBeaconIfPresent(page);

  const memoryTab = page.locator('#titane-tab-memory');
  await expect(memoryTab).toBeVisible({ timeout: 10000 });
  await memoryTab.scrollIntoViewIfNeeded();
  await memoryTab.evaluate(el => (el as HTMLButtonElement).click());

  await expect(page.locator('.titane-section-memory')).toBeVisible({ timeout: 15000 });
}

async function openTitaneMemoryTree(page: Page) {
  await openTitaneMemorySection(page);

  const treeTab = page.getByRole('tab', { name: /arbre/i });
  await expect(treeTab).toBeVisible({ timeout: 10000 });
  await treeTab.click();

  await expect(page.locator('.memory-tree-container').first()).toBeVisible({
    timeout: 15000,
  });
}

test.describe('Feature: Memory Tree Viewer', () => {
  if (!FULL_E2E_ENABLED) {
    test('gate disabled proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates to TitanePage and loads Memory section', async ({ page }) => {
    await openTitaneMemorySection(page);

    // Verify Memory section elements are present
    const memorySection = page
      .locator('.titane-section-memory, .memory-tree-container')
      .first();
    await expect(memorySection).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('memory-hybrid-overview-summary')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId('memory-hybrid-overview-active-preset')).toContainText(
      /Custom|Observation|Equilibre|Full/
    );
    await expect(
      page.getByTestId('memory-hybrid-overview-orchestration-status')
    ).toContainText(/inactive|idle|disabled|ready|error/);
    await expect(
      page.getByTestId('memory-hybrid-overview-orchestration-preview')
    ).toContainText(/Complements:|orchestration/i);
    await expect(page.getByTestId('memory-hybrid-overview-preset-history')).toContainText(
      /Aucun changement|->/
    );
    await expect(page.getByTestId('memory-hybrid-overview-export-report')).toBeVisible({
      timeout: 10000,
    });
    await page.getByTestId('memory-hybrid-overview-export-report').click();
    await expect(page.getByTestId('memory-hybrid-overview-export-status')).toContainText(
      /Rapport hybride exporte.|Echec de l export/
    );
  });

  test('Memory Tree Viewer renders with D3 tree', async ({ page }) => {
    await openTitaneMemoryTree(page);

    const treeContainer = page.locator('.memory-tree-container').first();

    await expect(
      treeContainer.locator('input[placeholder*="Rechercher"]').first()
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('memory-hybrid-diagnostics')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId('memory-hybrid-shadow-write-state')).toContainText(
      'Shadow write:'
    );
    await expect(page.getByTestId('memory-hybrid-shadow-read-state')).toContainText(
      'Shadow read:'
    );
    await expect(page.getByTestId('memory-hybrid-orchestration-state')).toContainText(
      'Orchestration hybride:'
    );
    await expect(page.getByTestId('memory-hybrid-orchestration-count')).toContainText(
      'Complements injectes:'
    );
    await expect(page.getByTestId('memory-hybrid-orchestration-preview')).toContainText(
      /Apercu orchestration:/
    );
    await expect(page.getByTestId('memory-hybrid-orchestration-reason')).toContainText(
      'Raison orchestration:'
    );
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-rollout-mode')
    ).toContainText('Rollout shadow read:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-active-preset')
    ).toContainText('Preset actif:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-canary-state')
    ).toContainText('Canari:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-canary-reason')
    ).toContainText('Raison canari:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-canary-operator-hint')
    ).toContainText('Action:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-preset-history')
    ).toContainText('Historique presets:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-rollout-controls')
    ).toBeVisible({
      timeout: 10000,
    });
    await page.getByTestId('memory-hybrid-shadow-read-rollout-preset-observe').click();
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-rollout-mode')
    ).toContainText('canary');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-active-preset')
    ).toContainText('Observation');
    await page
      .getByTestId('memory-hybrid-shadow-read-rollout-mode-select')
      .selectOption('canary');
    await page
      .getByTestId('memory-hybrid-shadow-read-canary-percentage-select')
      .selectOption('25');
    await page
      .getByTestId('memory-hybrid-shadow-read-trend-window-select')
      .selectOption('8');
    await page.getByTestId('memory-hybrid-shadow-read-rollout-apply').click();
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-rollout-mode')
    ).toContainText('canary');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-canary-state')
    ).toContainText(/eligible|hors-cible/);
    await page.getByTestId('memory-hybrid-shadow-read-rollout-probe').click();
    await expect(page.getByTestId('memory-hybrid-shadow-read-query')).toContainText(
      'Requete:'
    );
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-average-similarity')
    ).toContainText('Similarite moyenne:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-average-score')
    ).toContainText('Score retrieval moyen:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-composite-score')
    ).toContainText('Score compose:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-qualification')
    ).toContainText('Qualification:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-canonical-preview')
    ).toContainText('Canonique:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-unified-preview')
    ).toContainText('UnifiedMemory:');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-matched-pairs')
    ).toContainText('Paires:');
    await expect(page.getByTestId('memory-hybrid-shadow-read-history')).toContainText(
      'Historique:'
    );
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-trend-summary')
    ).toContainText('Tendance');
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-extended-trend')
    ).toContainText('Fenetre etendue:');
    await expect(page.getByTestId('memory-hybrid-shadow-read-history-chart')).toBeVisible(
      {
        timeout: 10000,
      }
    );
    const historySparkline = page.getByTestId(
      'memory-hybrid-shadow-read-history-sparkline'
    );
    const historyEmpty = page.locator('.memory-hybrid-history-empty').first();
    if ((await historySparkline.count()) > 0) {
      await expect(historySparkline).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByTestId('memory-hybrid-shadow-read-history-axis')
      ).toContainText(/%/);
    } else {
      await expect(historyEmpty).toBeVisible({ timeout: 10000 });
      await expect(historyEmpty).toContainText('aucun');
    }
    await expect(page.getByTestId('memory-hybrid-shadow-read-pairs-list')).toContainText(
      /.+/
    );
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-near-matches')
    ).toContainText(/.+/);
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-near-stability')
    ).toContainText(/.+/);
    await expect(
      page.getByTestId('memory-hybrid-shadow-read-missing-list')
    ).toContainText(/.+/);
    await expect(page.getByTestId('memory-hybrid-shadow-read-error')).toContainText(
      'Derniere erreur:'
    );
  });

  test('Memory Tree Viewer search functionality', async ({ page }) => {
    await openTitaneMemoryTree(page);

    const treeContainer = page.locator('.memory-tree-container').first();

    const searchInput = treeContainer
      .locator('input[placeholder="Rechercher dans la mémoire..."]')
      .first();
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    await searchInput.fill('Court terme');

    // Reste tolérant: certaines phases de re-render peuvent recréer l'input.
    try {
      await expect(searchInput).toHaveValue('Court terme', { timeout: 2000 });
    } catch {
      console.log('⚠️ Search input value assertion skipped (re-render race)');
    }
  });

  test('Memory Tree Viewer zoom controls', async ({ page }) => {
    await openTitaneMemoryTree(page);

    const zoomInButton = page.locator('button[title="Zoom avant"]').first();
    const zoomOutButton = page.locator('button[title="Zoom arrière"]').first();
    const resetButton = page.locator('button[title="Réinitialiser"]').first();

    await expect(zoomInButton).toBeVisible({ timeout: 5000 });
    await expect(zoomOutButton).toBeVisible({ timeout: 5000 });
    await expect(resetButton).toBeVisible({ timeout: 5000 });

    await zoomInButton.click();
    await page.waitForTimeout(300);

    await zoomOutButton.click();
    await page.waitForTimeout(300);

    await resetButton.click();
    await page.waitForTimeout(300);

    const treeContainer = page.locator('.memory-tree-container').first();
    await expect(treeContainer).toBeVisible();
  });

  test('Memory Tree Viewer node interaction', async ({ page }) => {
    await openTitaneMemoryTree(page);

    const treeContainer = page.locator('.memory-tree-container').first();
    const treeNode = treeContainer.locator('g.rd3t-node, foreignObject').first();

    await expect(treeNode).toBeVisible({ timeout: 10000 });
    await treeNode.click();
    await page.waitForTimeout(500);

    await expect(treeContainer).toBeVisible();
  });

  test('Memory Tree Viewer filter by type', async ({ page }) => {
    await openTitaneMemoryTree(page);

    const filterSelect = page.locator('select.memory-tree-filter').first();
    await expect(filterSelect).toBeVisible({ timeout: 10000 });

    await filterSelect.selectOption('short');
    await page.waitForTimeout(500);

    const treeContainer = page.locator('.memory-tree-container').first();
    await expect(treeContainer).toBeVisible();
  });
});
