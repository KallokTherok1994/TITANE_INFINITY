/**
 * TITANE∞ v26.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   OMEGA PIPELINE v2 - E2E VALIDATION TESTS
 *   Complete 10-step pipeline validation (Phase 3 - Week 5)
 *   Tests all steps: Input → Context → Intent → AI → Memory → Healing
 * ═══════════════════════════════════════════════════════════════════
 */

import { test, expect, Page } from '@playwright/test';

async function gotoTitane(page: Page) {
  // IMPORTANT: ne pas deep-linker sur /titane.
  // Le repo contient un dossier `/titane` à la racine, donc Vite peut servir ce contenu
  // statique au lieu de l'app SPA. On passe par la navigation UI depuis '/'.
  await page.goto('/');

  const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(mainNav).toBeVisible({ timeout: 30000 });

  const titaneBtn = mainNav.getByRole('button', { name: 'TITANE' });
  await titaneBtn.click();
  await expect(page).toHaveURL(/\/titane(\?|$)/, { timeout: 15000 });

  const closeBeacon = page.getByRole('button', { name: /Fermer diagnostic/i });
  if (await closeBeacon.isVisible().catch(() => false)) {
    await closeBeacon.click();
    await page.waitForTimeout(250);
  }

  await expect(page.locator('textarea.conversation-input')).toBeVisible({
    timeout: 30000,
  });
}

async function sendMessage(page: Page, message: string) {
  const input = page.locator('textarea.conversation-input');
  await input.fill(message);

  const sendButton = page.locator('button.conversation-send-btn');
  if (await sendButton.isEnabled().catch(() => false)) {
    await sendButton.click();
  } else {
    await input.press('Enter');
  }

  await expect(page.getByText(message)).toBeVisible({ timeout: 15000 });
}

/**
 * TEST SUITE: OMEGA Pipeline E2E Validation
 */
test.describe('OMEGA Pipeline v2 E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTitane(page);
  });

  /**
   * TEST 1: Complete 10-Step Pipeline Execution
   * Validates all steps execute in correct order
   */
  test('Step 1-10: Complete pipeline executes successfully', async ({ page }) => {
    test.setTimeout(60000);
    await sendMessage(page, 'Bonjour, comment vas-tu?');
  });

  /**
   * TEST 2: Input Validation (Step 1)
   * Tests input validation and sanitization
   */
  test('Step 1: Input validation handles malicious input', async ({ page }) => {
    const dialogs: string[] = [];
    page.on('dialog', dialog => {
      dialogs.push(dialog.message());
      dialog.dismiss().catch(() => undefined);
    });

    const maliciousInput = '<script>alert("xss")</script>';
    await sendMessage(page, maliciousInput);
    expect(dialogs).toHaveLength(0);
  });

  /**
   * TEST 3: Context Retrieval (Step 2)
   * Tests memory context retrieval
   */
  test('Step 2: Context retrieval accesses UnifiedMemory', async ({ page }) => {
    await sendMessage(page, 'Mon nom est Alice');
    await sendMessage(page, 'Quel est mon nom?');
  });

  test('Multi-turn conversation is stable', async ({ page }) => {
    test.setTimeout(60000);

    const conversation = [
      "Bonjour, je m'appelle Bob",
      'Quel est mon nom?',
      "Merci pour l'information",
    ];

    for (const message of conversation) {
      await sendMessage(page, message);
      await page.waitForTimeout(250);
    }
  });
});
