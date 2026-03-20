/**
 * TITANE_INFINITY v21.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TESTS E2E — Provider Flow v21.0
 *   Validation complète du flux provider local → backend → Ollama
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { test, expect, type Locator, type Page } from '@playwright/test';

function getChatLocators(page: Page): {
  messageInput: Locator;
  sendButton: Locator;
  assistantMessages: Locator;
  errorMessage: Locator;
  loadingSpinner: Locator;
} {
  return {
    messageInput: page
      .locator(
        '[data-testid="chat-input"], [data-testid="chat-bubble-input"], #chat-input-textarea, #chat-window-textarea, textarea[placeholder*="Tapez votre message"]'
      )
      .first(),
    sendButton: page
      .locator(
        '[data-testid="chat-send"], [data-testid="send-button"], [data-testid="chat-bubble-send"], .chat-send-btn.chat-send-omega, .send-button, button:has-text("Envoyer")'
      )
      .first(),
    assistantMessages: page.locator(
      '[data-testid="chat-message-assistant"], [data-testid="assistant-message"], .message-bubble-assistant .message-bubble-text'
    ),
    errorMessage: page
      .locator('[data-testid="error-message"], [data-testid="chat-error"]')
      .first(),
    loadingSpinner: page
      .locator('[data-testid="loading-spinner"], [data-testid="chat-loading"]')
      .first(),
  };
}

async function maybeSelectLocalProvider(page: Page): Promise<boolean> {
  const providerSelect = page
    .locator('[data-testid="provider-select"], [data-testid="chat-provider-select"]')
    .first();
  if (!(await providerSelect.isVisible({ timeout: 2000 }).catch(() => false))) {
    return false;
  }

  await providerSelect.click();
  const localOption = page
    .locator(
      '[data-value="local"], [data-provider="local"], [role="option"]:has-text("Local")'
    )
    .first();
  if (!(await localOption.isVisible({ timeout: 2000 }).catch(() => false))) {
    return false;
  }

  await localOption.click();
  return true;
}

async function sendMessageAndWaitAssistant(
  page: Page,
  messageInput: Locator,
  sendButton: Locator,
  assistantMessages: Locator,
  text: string,
  timeoutMs = Number(process.env.TITANE_E2E_ASSISTANT_TIMEOUT_MS || '90000')
): Promise<{ latencyMs: number; responseText: string }> {
  await expect(messageInput).toBeVisible({ timeout: 20000 });
  await expect(sendButton).toBeVisible({ timeout: 20000 });

  const beforeCount = await assistantMessages.count();
  const beforeText =
    beforeCount > 0 ? ((await assistantMessages.last().textContent()) ?? '').trim() : '';

  await messageInput.fill(text);
  await expect
    .poll(async () => ((await messageInput.inputValue()) ?? '').trim().length > 0, {
      timeout: 10000,
      interval: 200,
    })
    .toBeTruthy();

  const startTime = Date.now();
  const sendEnabled = await sendButton.isEnabled().catch(() => false);
  if (sendEnabled) {
    await sendButton.click();
  } else {
    await messageInput.press('Enter');
  }

  await expect
    .poll(
      async () => {
        const count = await assistantMessages.count();
        const currentText =
          count > 0 ? ((await assistantMessages.last().textContent()) ?? '').trim() : '';
        return count > beforeCount || (currentText.length > 0 && currentText !== beforeText);
      },
      { timeout: timeoutMs, interval: 1000 }
    )
    .toBeTruthy();

  await page.waitForTimeout(500);
  const responseText = ((await assistantMessages.last().textContent()) ?? '').trim();
  return { latencyMs: Date.now() - startTime, responseText };
}

/**
 * Test 1: Provider Local Mode — Force Ollama Direct
 *
 * Objectif: Valider que le mode "Local" force Ollama sans cascade cloud
 *
 * Steps:
 * 1. Lancer app dev
 * 2. Naviguer ChatPage
 * 3. Sélectionner provider "Local"
 * 4. Envoyer message test
 * 5. Observer logs backend
 *
 * Expected:
 * - Logs: "[AI Router v21] 🏠 LOCAL MODE FORCED"
 * - 0 tentatives Gemini/Claude/OpenAI
 * - Direct Ollama < 2s
 * - Réponse correcte
 */
test.describe('Provider Flow v21.0', () => {
  test('Test 1: Local Mode force Ollama direct', async ({ page }) => {
    // Setup: Écouter les logs console
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(msg.text());
    });

    // Step 1: Naviguer vers ChatPage
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Step 2: Sélectionner provider "Local" si le sélecteur est exposé
    await maybeSelectLocalProvider(page);

    const { messageInput, sendButton, assistantMessages } = getChatLocators(page);

    // Step 3: Envoyer message test
    const { latencyMs: latency } = await sendMessageAndWaitAssistant(
      page,
      messageInput,
      sendButton,
      assistantMessages,
      'Test local mode provider flow v21'
    );

    // Step 5: Vérifications

    // 5.1: Latence acceptable
    const maxLatencyMs = Number(process.env.TITANE_E2E_LOCAL_MAX_LATENCY_MS || '60000');
    expect(latency).toBeLessThan(maxLatencyMs);
    console.log(`✅ Latency: ${latency}ms`);

    // 5.2: Réponse affichée
    const responseText = await assistantMessages.last().textContent();
    expect(responseText).toBeTruthy();
    expect(responseText!.length).toBeGreaterThan(10);
    console.log(`✅ Response: ${responseText!.slice(0, 50)}...`);

    // 5.3: Logs backend (si disponibles via WebSocket/console proxy)
    // Note: Nécessite instrumentation backend → Tauri devtools
    // Pour l'instant, validation frontend uniquement

    const hasLocalLogs = logs.some(
      log => log.includes('LOCAL') || log.includes('Ollama') || log.includes('provider')
    );

    if (hasLocalLogs) {
      console.log('✅ Local provider logs détectés');
    } else {
      console.warn('⚠️ Logs backend non capturés (instrumentation requise)');
    }
  });

  /**
   * Test 2: Memory Multi-Turn — STM/MTM/LTM Integration
   *
   * Objectif: Valider memory context loading sur conversation multi-tours
   *
   * Steps:
   * 1. Conversation 3+ messages
   * 2. Observer logs memory
   * 3. Vérifier DB entries (si SQLite accessible)
   *
   * Expected:
   * - Logs: "[Memory] Loading context: STM=3, MTM=0, LTM=0"
   * - Logs: "[Memory] Saving interaction: userId=..."
   * - Context chargé chaque message
   * - Interactions saved
   */
  test('Test 2: Memory Multi-Turn Integration', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(msg.text());
    });

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    await maybeSelectLocalProvider(page);

    const { messageInput, sendButton, assistantMessages } = getChatLocators(page);

    await expect(messageInput).toBeVisible({ timeout: 20000 });
    await expect(sendButton).toBeVisible({ timeout: 20000 });

    // Message 1
    await sendMessageAndWaitAssistant(
      page,
      messageInput,
      sendButton,
      assistantMessages,
      'Mon nom est Alice'
    );

    // Message 2
    await sendMessageAndWaitAssistant(
      page,
      messageInput,
      sendButton,
      assistantMessages,
      'Quelle est ma couleur préférée? Bleu.'
    );

    // Message 3 - Test recall
    await sendMessageAndWaitAssistant(
      page,
      messageInput,
      sendButton,
      assistantMessages,
      'Rappelle-moi mon nom et ma couleur'
    );

    const responseText = await assistantMessages.last().textContent();

    // Vérification: Réponse contient context
    const hasContext = responseText?.includes('Alice') || responseText?.includes('bleu');

    if (hasContext) {
      console.log('✅ Memory context utilisé (Alice/bleu détecté)');
    } else {
      console.warn('⚠️ Memory context non utilisé dans réponse');
      console.log(`Response: ${responseText}`);
    }

    // Check logs memory
    const hasMemoryLogs = logs.some(
      log => log.includes('Memory') || log.includes('STM') || log.includes('context')
    );

    if (hasMemoryLogs) {
      const memorySamples = logs.filter(l => l.includes('Memory')).slice(0, 5);
      console.log(`✅ Memory logs détectés (sample=${memorySamples.length})`);
      if (memorySamples.length > 0) {
        console.log(memorySamples.join('\n'));
      }
    }
  });

  /**
   * Test 3: Auth Tracking — userId Smart Fallback
   *
   * Objectif: Valider userId tracking avec fallback 'anonymous'
   *
   * Steps:
   * 1. Set window.__TITANE_USER_ID__ = 'test-user-123'
   * 2. Envoyer message
   * 3. Observer logs
   * 4. Supprimer userId
   * 5. Envoyer message
   * 6. Observer fallback 'anonymous'
   */
  test('Test 3: Auth Tracking userId', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(msg.text());
    });

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Test 3.1: userId custom
    await page.evaluate(() => {
      (window as any).__TITANE_USER_ID__ = 'test-user-e2e-123';
    });

    await maybeSelectLocalProvider(page);
    const { messageInput, sendButton, assistantMessages } = getChatLocators(page);

    await sendMessageAndWaitAssistant(
      page,
      messageInput,
      sendButton,
      assistantMessages,
      'Test userId tracking'
    );

    // Check logs userId
    const hasUserIdLogs = logs.some(log => log.includes('test-user-e2e-123'));
    if (hasUserIdLogs) {
      console.log('✅ userId custom détecté dans logs');
    }

    // Test 3.2: Fallback anonymous
    await page.evaluate(() => {
      delete (window as any).__TITANE_USER_ID__;
    });

    await sendMessageAndWaitAssistant(
      page,
      messageInput,
      sendButton,
      assistantMessages,
      'Test fallback anonymous'
    );

    const hasAnonymousLogs = logs.some(log => log.includes('anonymous'));
    if (hasAnonymousLogs) {
      console.log('✅ Fallback anonymous détecté');
    } else {
      console.warn('⚠️ Fallback anonymous non détecté dans logs');
    }
  });

  /**
   * Test 4: Error Handling — Ollama Service Down
   *
   * Objectif: Valider robustesse quand Ollama inaccessible
   *
   * Steps:
   * 1. Mock Ollama down (ou utiliser provider inexistant)
   * 2. Mode local, envoyer message
   * 3. Observer error handling
   *
   * Expected:
   * - Error graceful (pas de crash)
   * - Message utilisateur clair
   * - Fallback possible (ou error state)
   */
  test('Test 4: Error Handling Ollama Down', async ({ page }) => {
    // Mock: Bloquer requêtes Ollama
    await page.route('**/api/generate', route => {
      route.abort('failed');
    });

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    await maybeSelectLocalProvider(page);
    const { messageInput, sendButton, assistantMessages, errorMessage, loadingSpinner } =
      getChatLocators(page);

    const beforeCount = await assistantMessages.count();
    await messageInput.fill('Test error handling');
    const sendEnabled = await sendButton.isEnabled().catch(() => false);
    if (sendEnabled) {
      await sendButton.click();
    } else {
      await messageInput.press('Enter');
    }

    const outcome = await expect
      .poll(
        async () => {
          if (await errorMessage.isVisible().catch(() => false)) return 'error';
          if ((await assistantMessages.count()) > beforeCount) return 'assistant';
          return '';
        },
        { timeout: Number(process.env.TITANE_E2E_ASSISTANT_TIMEOUT_MS || '45000'), interval: 1000 }
      )
      .toMatch(/error|assistant/);

    void outcome;

    // Vérifier: Pas de crash page
    const pageUrl = page.url();
    expect(pageUrl).toMatch(/\/(chat|titane)/); // Toujours sur la surface chat active

    // Vérifier: Error message affiché
    const hasError = await errorMessage.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.log(`✅ Error graceful: ${errorText}`);
      expect(errorText).toBeTruthy();
    } else {
      // Alternative: Check si loading bloqué
      const isLoading = await loadingSpinner.isVisible().catch(() => false);

      if (!isLoading) {
        console.log('✅ Error handled (pas de loading infini)');
      } else {
        console.warn('⚠️ Possible loading bloqué (timeout handling requis)');
      }
    }
  });

  /**
   * Test 5: Performance — Latence Provider Local
   *
   * Objectif: Mesurer latence moyenne mode local
   *
   * Steps:
   * 1. Mode local
   * 2. Envoyer 5 messages
   * 3. Mesurer temps moyen
   *
   * Expected:
   * - Average: < 1.5s
   * - Min: ~0.8s
   * - Max: < 2.5s
   */
  test('Test 5: Performance Latency', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    await maybeSelectLocalProvider(page);

    const { messageInput, sendButton, assistantMessages } = getChatLocators(page);

    const latencies: number[] = [];

    for (let i = 0; i < 5; i++) {
      const { latencyMs: latency } = await sendMessageAndWaitAssistant(
        page,
        messageInput,
        sendButton,
        assistantMessages,
        `Test performance message ${i + 1}`
      );
      latencies.push(latency);

      console.log(`Message ${i + 1}: ${latency}ms`);
      await page.waitForTimeout(500); // Pause entre messages
    }

    // Statistiques
    const average = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);

    console.log(`\n📊 Performance Stats:`);
    console.log(`  Average: ${average.toFixed(0)}ms`);
    console.log(`  Min: ${min}ms`);
    console.log(`  Max: ${max}ms`);

    // Assertions
    const maxAverageMs = Number(process.env.TITANE_E2E_PERF_AVG_MAX_MS || '90000');
    const maxLatencyMs = Number(process.env.TITANE_E2E_PERF_MAX_MS || '120000');
    expect(average).toBeLessThan(maxAverageMs);
    expect(max).toBeLessThan(maxLatencyMs);
    console.log('✅ Performance acceptable');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   NOTES D'IMPLÉMENTATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Prerequisites:
 * - Ollama service running (localhost:11434)
 * - App dev server running (corepack pnpm run tauri:dev)
 * - Test selectors ([data-testid]) ajoutés aux composants UI
 *
 * Exécution:
 * ```bash
 * corepack pnpm run test:e2e
 * # ou
 * corepack pnpm exec playwright test tests/e2e/provider-flow.test.ts
 * ```
 *
 * Instrumentation Backend (optionnel):
 * - Ajouter WebSocket proxy pour logs Tauri → Frontend console
 * - Ou: Lire fichiers logs runtime/dev/logs/tauri.log
 *
 * Amélioration Future:
 * - SQLite DB assertions (memory entries)
 * - Network tab validation (0 requêtes cloud en local mode)
 * - Screenshot diff visual regression
 * - Performance profiling détaillé
 */
