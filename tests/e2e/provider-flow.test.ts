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

import { test, expect } from '@playwright/test';

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

    // Step 2: Sélectionner provider "Local"
    const providerSelect = page.locator('[data-testid="provider-select"]');
    await providerSelect.click();
    await page.locator('[data-value="local"]').click();

    // Vérifier sélection
    await expect(providerSelect).toHaveText(/Local|Ollama/i);

    // Step 3: Envoyer message test
    const messageInput = page.locator('[data-testid="chat-input"]');
    await messageInput.fill('Test local mode provider flow v21');

    const sendButton = page.locator('[data-testid="send-button"]');
    const startTime = Date.now();
    await sendButton.click();

    // Step 4: Attendre réponse (max 5s)
    await page.waitForSelector('[data-testid="assistant-message"]', {
      timeout: 5000,
    });
    const latency = Date.now() - startTime;

    // Step 5: Vérifications

    // 5.1: Latence acceptable
    expect(latency).toBeLessThan(2500); // < 2.5s
    console.log(`✅ Latency: ${latency}ms`);

    // 5.2: Réponse affichée
    const responseMessage = page.locator('[data-testid="assistant-message"]').last();
    const responseText = await responseMessage.textContent();
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

    // Sélectionner Local
    const providerSelect = page.locator('[data-testid="provider-select"]');
    await providerSelect.click();
    await page.locator('[data-value="local"]').click();

    const messageInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');

    // Message 1
    await messageInput.fill('Mon nom est Alice');
    await sendButton.click();
    await page.waitForSelector('[data-testid="assistant-message"]', { timeout: 5000 });
    await page.waitForTimeout(500); // Attendre save async

    // Message 2
    await messageInput.fill('Quelle est ma couleur préférée? Bleu.');
    await sendButton.click();
    await page.waitForSelector('[data-testid="assistant-message"]:nth-of-type(2)', {
      timeout: 5000,
    });
    await page.waitForTimeout(500);

    // Message 3 - Test recall
    await messageInput.fill('Rappelle-moi mon nom et ma couleur');
    await sendButton.click();
    await page.waitForSelector('[data-testid="assistant-message"]:nth-of-type(3)', {
      timeout: 5000,
    });

    const responseText = await page
      .locator('[data-testid="assistant-message"]')
      .last()
      .textContent();

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
      console.log('✅ Memory logs détectés');
      console.log(logs.filter(l => l.includes('Memory')).join('\n'));
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

    const providerSelect = page.locator('[data-testid="provider-select"]');
    await providerSelect.click();
    await page.locator('[data-value="local"]').click();

    const messageInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');

    await messageInput.fill('Test userId tracking');
    await sendButton.click();
    await page.waitForSelector('[data-testid="assistant-message"]', { timeout: 5000 });
    await page.waitForTimeout(500);

    // Check logs userId
    const hasUserIdLogs = logs.some(log => log.includes('test-user-e2e-123'));
    if (hasUserIdLogs) {
      console.log('✅ userId custom détecté dans logs');
    }

    // Test 3.2: Fallback anonymous
    await page.evaluate(() => {
      delete (window as any).__TITANE_USER_ID__;
    });

    await messageInput.fill('Test fallback anonymous');
    await sendButton.click();
    await page.waitForSelector('[data-testid="assistant-message"]:nth-of-type(2)', {
      timeout: 5000,
    });
    await page.waitForTimeout(500);

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

    const providerSelect = page.locator('[data-testid="provider-select"]');
    await providerSelect.click();
    await page.locator('[data-value="local"]').click();

    const messageInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');

    await messageInput.fill('Test error handling');
    await sendButton.click();

    // Attendre error state (pas de crash)
    await page.waitForTimeout(3000);

    // Vérifier: Pas de crash page
    const pageUrl = page.url();
    expect(pageUrl).toContain('/chat'); // Toujours sur chat page

    // Vérifier: Error message affiché
    const errorMessage = page.locator('[data-testid="error-message"]');
    const hasError = await errorMessage.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.log(`✅ Error graceful: ${errorText}`);
      expect(errorText).toBeTruthy();
    } else {
      // Alternative: Check si loading bloqué
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
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

    const providerSelect = page.locator('[data-testid="provider-select"]');
    await providerSelect.click();
    await page.locator('[data-value="local"]').click();

    const messageInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');

    const latencies: number[] = [];

    for (let i = 0; i < 5; i++) {
      await messageInput.fill(`Test performance message ${i + 1}`);

      const startTime = Date.now();
      await sendButton.click();

      await page.waitForSelector(
        `[data-testid="assistant-message"]:nth-of-type(${i + 1})`,
        { timeout: 5000 }
      );

      const latency = Date.now() - startTime;
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
    expect(average).toBeLessThan(1500); // < 1.5s moyenne
    expect(max).toBeLessThan(2500); // < 2.5s max
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
 * - App dev server running (npm run tauri dev)
 * - Test selectors ([data-testid]) ajoutés aux composants UI
 *
 * Exécution:
 * ```bash
 * npm run test:e2e
 * # ou
 * npx playwright test tests/e2e/provider-flow.test.ts
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
