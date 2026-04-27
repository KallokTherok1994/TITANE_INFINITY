// E2E — HTF Module — L'Humain à tout faire
// Playwright spec — flows critiques

import { test, expect } from '@playwright/test';

test.describe("HTF Module — L'Humain à tout faire", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/htf');
  });

  test('affiche la page HTF avec le header', async ({ page }) => {
    await expect(page.getByTestId('htf-module-page')).toBeVisible();
    await expect(page.locator("text=L'Humain à tout faire")).toBeVisible();
    await expect(page.locator('text=Kevin Thibault')).toBeVisible();
  });

  test('les 5 onglets sont présents et navigables', async ({ page }) => {
    for (const tab of ['dashboard', 'soumission', 'crm', 'historique', 'connaissance']) {
      await expect(page.getByTestId(`htf-tab-${tab}`)).toBeVisible();
    }
  });

  test('onglet dashboard affiche les métriques', async ({ page }) => {
    await page.getByTestId('htf-tab-dashboard').click();
    await expect(page.getByTestId('htf-dashboard')).toBeVisible();
    await expect(page.getByTestId('htf-metric-soumissions')).toBeVisible();
    await expect(page.getByTestId('htf-metric-clients')).toBeVisible();
    await expect(page.getByTestId('htf-metric-conversion')).toBeVisible();
    await expect(page.getByTestId('htf-metric-revenu')).toBeVisible();
  });

  test('wizard soumission — étape description', async ({ page }) => {
    await page.getByTestId('htf-tab-soumission').click();
    await expect(page.getByTestId('htf-submission-wizard')).toBeVisible();
    await expect(page.getByTestId('htf-step-description')).toBeVisible();
    await expect(page.getByTestId('htf-btn-next-surface')).toBeDisabled();

    await page
      .getByTestId('htf-input-description')
      .fill('Pose dalles béton texturées 60×60 sur terrasse arrière 24m²');
    await expect(page.getByTestId('htf-btn-next-surface')).toBeEnabled();
  });

  test("wizard soumission — navigation complète jusqu'à surface", async ({ page }) => {
    await page.getByTestId('htf-tab-soumission').click();
    await page
      .getByTestId('htf-input-description')
      .fill('Terrasse dalles béton 20m² accès facile Saguenay');
    await page.getByTestId('htf-btn-next-surface').click();
    await expect(page.getByTestId('htf-step-surface')).toBeVisible();
    await page.getByTestId('htf-input-surface').fill('20');
    await page.getByTestId('htf-btn-next-options').click();
    await expect(page.getByTestId('htf-step-options')).toBeVisible();
  });

  test('CRM — onglet clients visible et formulaire fonctionnel', async ({ page }) => {
    await page.getByTestId('htf-tab-crm').click();
    await expect(page.getByTestId('htf-client-panel')).toBeVisible();
    await expect(page.getByTestId('htf-btn-nouveau-client')).toBeVisible();

    await page.getByTestId('htf-btn-nouveau-client').click();
    await expect(page.getByTestId('htf-client-form')).toBeVisible();
    await page.getByTestId('htf-input-nom').fill('Test Client E2E');
    await page.getByTestId('htf-btn-save-client').click();

    await expect(page.getByTestId('htf-client-list')).toContainText('Test Client E2E');
  });

  test('onglet historique visible', async ({ page }) => {
    await page.getByTestId('htf-tab-historique').click();
    await expect(page.getByTestId('htf-historique')).toBeVisible();
  });

  test('onglet base de connaissance visible', async ({ page }) => {
    await page.getByTestId('htf-tab-connaissance').click();
    await expect(page.getByTestId('htf-connaissance')).toBeVisible();
    await expect(page.locator('text=Manuel de formation')).toBeVisible();
  });
});
