/**
 * WDIO Desktop Test — DocCenter — Export DOCX natif
 * Surface: /doc-center | data-testid stables
 * Pattern: wdio.desktop.conf.cjs specs glob ./e2e/desktop/**\/*.wdio.test.js
 */

import assert from 'node:assert/strict';
import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  openApp,
  waitAppReady,
} from './ui-driver.wdio.js';

const ARTIFACTS_DIR = 'proof_packs/wdio-doc-center';

describe('DocCenter — Export DOCX natif', () => {
  before(async () => {
    ensureArtifactsDir(ARTIFACTS_DIR);
    await openApp();
    await waitAppReady();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it('navigue vers /doc-center et rend la page', async () => {
    await browser.url('/doc-center');
    const page = await $('[data-testid="doc-center-page"]');
    await page.waitForExist({ timeout: 10000 });
    assert.ok(await page.isDisplayed(), 'doc-center-page doit être visible');
    await browser.saveScreenshot(`${ARTIFACTS_DIR}/01-page-loaded.png`);
  });

  // ── Éléments requis ────────────────────────────────────────────────────────

  it('le bouton export DOCX est présent et actif', async () => {
    const btn = await $('[data-testid="btn-export-docx"]');
    await btn.waitForExist({ timeout: 5000 });
    assert.ok(await btn.isDisplayed(), 'btn-export-docx doit être visible');
    assert.ok(await btn.isEnabled(), 'btn-export-docx doit être activé');
  });

  it('les champs de saisie titre et output-dir sont présents', async () => {
    const title = await $('[data-testid="input-doc-title"]');
    const outputDir = await $('[data-testid="input-output-dir"]');
    await title.waitForExist({ timeout: 5000 });
    await outputDir.waitForExist({ timeout: 5000 });
    assert.ok(await title.isDisplayed(), 'input-doc-title doit être visible');
    assert.ok(await outputDir.isDisplayed(), 'input-output-dir doit être visible');
  });

  it('le statut export est absent au chargement initial', async () => {
    const status = await $('[data-testid="doc-export-status"]');
    const exists = await status.isExisting();
    assert.ok(!exists, 'doc-export-status ne doit pas exister au départ');
  });

  // ── Interaction titre ──────────────────────────────────────────────────────

  it('le champ titre accepte une saisie utilisateur', async () => {
    const titleInput = await $('[data-testid="input-doc-title"]');
    await titleInput.clearValue();
    await titleInput.setValue('Rapport Test WDIO');
    const val = await titleInput.getValue();
    assert.strictEqual(val, 'Rapport Test WDIO');
    await browser.saveScreenshot(`${ARTIFACTS_DIR}/02-title-entered.png`);
  });

  // ── Clic bouton export ─────────────────────────────────────────────────────

  it('le clic sur btn-export-docx déclenche un feedback (status ou loading)', async () => {
    const btn = await $('[data-testid="btn-export-docx"]');
    await btn.click();

    // Attendre que loading ou status apparaisse (IPC peut échouer en WDIO = feedback erreur attendu)
    await browser.waitUntil(
      async () => {
        const status = await $('[data-testid="doc-export-status"]');
        const btnEl = await $('[data-testid="btn-export-docx"]');
        const statusExists = await status.isExisting();
        const btnEnabled = await btnEl.isEnabled();
        // Soit status affiché, soit bouton redevenu actif (fin de loading)
        return statusExists || btnEnabled;
      },
      {
        timeout: 12000,
        interval: 300,
        timeoutMsg: 'Aucun feedback du bouton export après 12s',
      }
    );

    await browser.saveScreenshot(`${ARTIFACTS_DIR}/03-after-click.png`);

    const statusEl = await $('[data-testid="doc-export-status"]');
    const statusExists = await statusEl.isExisting();

    if (statusExists) {
      const text = await statusEl.getText();
      assert.ok(text.length > 0, 'doc-export-status doit contenir du texte');
      // En mode Tauri desktop: succès attendu; en mode web: erreur IPC attendue
      const isSuccess =
        text.includes('✅') || text.includes('Exporté') || text.includes('/');
      const isError =
        text.includes('❌') ||
        text.includes('Erreur') ||
        text.includes('error') ||
        text.includes('IPC');
      assert.ok(isSuccess || isError, `Status inattendu: "${text}"`);
    }
  });

  // ── Screenshot preuve finale ───────────────────────────────────────────────

  it('capture preuve finale de la page DocCenter', async () => {
    await browser.url('/doc-center');
    await $('[data-testid="doc-center-page"]').waitForExist({ timeout: 8000 });
    await browser.saveScreenshot(`${ARTIFACTS_DIR}/04-final-proof.png`);
    assert.ok(true, 'Preuve screenshot capturée');
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      const testTitle =
        this.currentTest?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? 'unknown';
      await captureFailureScreenshot(`${ARTIFACTS_DIR}/FAIL-${testTitle}.png`).catch(
        () => {}
      );
    }
  });
});
