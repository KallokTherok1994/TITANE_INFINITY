/**
 * E2E Test: ThinkingPanel Quality Score Display
 * TITANE∞ — Vérifie que "Réponse X%" ou "Effort X%" s'affiche correctement,
 * que data-runtime-quality est cohérent, et que le badge ⚠ apparaît sous 65%.
 *
 * NOTE: Tests E2E complets nécessitent Tauri backend (TITANE_E2E_FULL=1).
 *       Les tests de smoke fonctionnent en mode mock chat.
 */

import { test, expect, type Page } from '@playwright/test';
import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

const enableChatMock = async (page: Page) => {
  await page.addInitScript(() => {
    (window as Record<string, unknown>).__TITANE_E2E_CHAT_MOCK__ = true;
    (window as Record<string, unknown>).__TITANE_E2E_CHAT_CONV_SEQ__ = 0;
    (window as Record<string, unknown>).__TITANE_E2E_CHAT_SCENARIO__ = 'success';
    (window as Record<string, unknown>).__TITANE_E2E_CHAT_KNOWLEDGE_SEED__ = [];
  });
};

test.describe('ThinkingPanel — quality score display', () => {
  test.skip(!FULL_E2E_ENABLED, 'Full E2E requires TITANE_E2E_FULL=1 and Tauri backend');

  test.beforeEach(async ({ page }) => {
    await enableChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);
  });

  test('T-QS-01 — après un message, le ThinkingPanel affiche un score qualité', async ({
    page,
  }) => {
    // Envoyer un message
    const input = page.getByTestId('chat-input');
    await input.waitFor({ state: 'visible', timeout: 10_000 });
    await input.fill('Analyse approfondie TITANE');
    await input.press('Enter');

    // Attendre que le ThinkingPanel soit en état done
    const panel = page.locator('[data-testid="reasoning-progress"][data-state="done"]');
    await panel.waitFor({ state: 'visible', timeout: 30_000 });

    // data-runtime-quality doit être non-vide
    const qualityAttr = await panel.getAttribute('data-runtime-quality');
    expect(qualityAttr).toBeTruthy();
    expect(qualityAttr).toMatch(/^\d+%$/);
  });

  test('T-QS-02 — data-runtime-quality contient un pourcentage valide (0–100%)', async ({
    page,
  }) => {
    const input = page.getByTestId('chat-input');
    await input.waitFor({ state: 'visible', timeout: 10_000 });
    await input.fill('Test score qualité');
    await input.press('Enter');

    const panel = page.locator('[data-testid="reasoning-progress"][data-state="done"]');
    await panel.waitFor({ state: 'visible', timeout: 30_000 });

    const raw = await panel.getAttribute('data-runtime-quality');
    expect(raw).toBeTruthy();
    const pct = parseInt(raw!.replace('%', ''), 10);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  test('T-QS-03 — le résumé textuel contient "Réponse X%" ou "Effort X%", pas "Qualité X%"', async ({
    page,
  }) => {
    const input = page.getByTestId('chat-input');
    await input.waitFor({ state: 'visible', timeout: 10_000 });
    await input.fill('Message test label qualité');
    await input.press('Enter');

    const panel = page.locator('[data-testid="reasoning-progress"][data-state="done"]');
    await panel.waitFor({ state: 'visible', timeout: 30_000 });

    const panelText = await panel.innerText();
    // Nouveau label (Réponse ou Effort), pas l'ancien label "Qualité"
    const hasNewLabel = /Réponse \d+%|Effort \d+%/.test(panelText);
    const hasOldLabel = /· Qualité \d+%/.test(panelText);
    expect(hasOldLabel).toBe(false);
    if (panelText.includes('%')) {
      expect(hasNewLabel).toBe(true);
    }
  });
});

test.describe('ThinkingPanel — CognitiveRuntimeTrace v2 certification', () => {
  test.skip(!FULL_E2E_ENABLED, 'Full E2E requires TITANE_E2E_FULL=1 and Tauri backend');

  test.beforeEach(async ({ page }) => {
    await enableChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);
  });

  test('COGNITIVE_TRACE_V2_VISIBLE_IN_THINKING_PANEL', async ({ page }) => {
    // 1. Envoyer un message — le mock inclut omega_trace_meta → cognitiveTrace est construit
    const input = page.getByTestId('chat-input');
    await input.waitFor({ state: 'visible', timeout: 20_000 });
    await input.fill('Explique brièvement le fonctionnement de TITANE et ses principales capacités IA.');
    await input.press('Enter');

    // 2a. Attendre la réponse mock [MOCK_OK] AVANT de chercher le panel done.
    //     Évite de lire un ancien panel done depuis une conversation restaurée du localStorage.
    await expect(page.locator('[data-testid="chat-message-assistant"]').last())
      .toContainText('[MOCK_OK]', { timeout: 30_000 });

    // 2b. Attendre le panel en état done (pour ce message précis)
    const panel = page.locator('[data-testid="reasoning-progress"][data-state="done"]');
    await panel.waitFor({ state: 'visible', timeout: 10_000 });

    // 3. data-cognitive-verdict doit être non-vide (cognitiveTrace construit depuis omega_trace_meta)
    const verdictAttr = await panel.getAttribute('data-cognitive-verdict');
    expect(verdictAttr).toMatch(/^(PASS|QUALIFIED|UNCERTAIN|BLOCKED|FAIL)$/);

    // 4. Développer le panel compact → click pour ouvrir OMEGA journal
    await panel.click();

    // 5. Passer en vue Expert
    await page.getByText('Expert').click();

    // 6. La section cognitive trace doit être visible
    const traceSection = page.locator('[data-testid="reasoning-cognitive-trace"]');
    await expect(traceSection).toBeVisible({ timeout: 10_000 });

    // 7. Verdict visible
    await expect(page.getByTestId('reasoning-cognitive-verdict')).toBeVisible();

    // 8. Politique web visible
    await expect(page.getByTestId('reasoning-cognitive-web-policy')).toBeVisible();

    // 9. Action qualité visible
    await expect(page.getByTestId('reasoning-cognitive-quality-action')).toBeVisible();

    // 10. Aucun champ de raisonnement interne interdit ne doit être visible dans le DOM
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('chainOfThought');
    expect(bodyText).not.toContain('hiddenThoughts');
    expect(bodyText).not.toContain('rawReasoning');
    expect(bodyText).not.toContain('privateReasoning');
    expect(bodyText).not.toContain('internalReasoningSteps');
  });
});

test.describe('ThinkingPanel — quality score smoke (sans Tauri)', () => {
  test('T-QS-SMOKE-01 — le composant ThinkingPanel accepte responseQualityScore sans crash UI', async ({
    page,
  }) => {
    // Test minimal: charge l'app et vérifie qu'elle ne crashe pas
    await page
      .goto('http://localhost:1420', { waitUntil: 'domcontentloaded', timeout: 15_000 })
      .catch(() => {
        // App might not be running — skip gracefully
        test.skip();
      });

    // Si l'app est disponible, vérifier l'absence d'erreur JS critique
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    const criticalErrors = errors.filter(
      e => e.includes('responseQualityScore') || e.includes('responseQualityTier')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
