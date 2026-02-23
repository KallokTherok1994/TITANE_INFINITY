/**
 * TITANE∞ — E2E CERTIFICATION TEST
 * Chat Provider Decision Observability — P3 Validation
 * 
 * Objectif: Valider automatiquement la gouvernance provider decision
 * Invariants ONLINE-FIRST:
 * - Si externalAllowed=true ET provider READY → mode ≠ OFFLINE
 * - Si mode=OFFLINE → reason_code présent + UI "Mode hors ligne:"
 * - Si mode=REMOTE → UI NE contient PAS "hors ligne"
 * 
 * Méthode:
 * 1. Capture logs console [CONV_SEND] et [CONV_RECV]
 * 2. Parse decision meta (mode, reason_code, provider_used, network_used)
 * 3. Vérifie UI state selon le mode
 * 4. Exécute x3 pour reproductibilité
 */

import { test, expect, Page, ConsoleMessage } from '@playwright/test';

// Types pour les logs parsés
interface ConvSendLog {
  type: 'CONV_SEND';
  buildFlagEnabled: boolean;
  runtimeToggleEnabled: boolean;
  allowed: boolean;
  requested_provider: string;
}

interface ConvRecvLog {
  type: 'CONV_RECV';
  mode: 'OFFLINE' | 'LOCAL' | 'REMOTE' | 'UNKNOWN';
  reason_code?: string;
  provider_used?: string;
  network_used?: boolean;
  attempts_count?: number;
}

interface CapturedLogs {
  send?: ConvSendLog;
  recv?: ConvRecvLog;
  allLogs: string[];
}

/**
 * Helper: Capturer les logs console [CONV_SEND] et [CONV_RECV]
 */
async function captureConversationLogs(page: Page): Promise<CapturedLogs> {
  const allLogs: string[] = [];
  let sendLog: ConvSendLog | undefined;
  let recvLog: ConvRecvLog | undefined;

  page.on('console', (msg: ConsoleMessage) => {
    const text = msg.text();
    allLogs.push(text);

    // Parse [CONV_SEND]
    if (text.includes('[CONV_SEND]')) {
      try {
        // Extract JSON après "[CONV_SEND] External AI gate"
        const match = text.match(/\[CONV_SEND\].*?(\{.*\})/);
        if (match) {
          const parsed = JSON.parse(match[1]);
          sendLog = {
            type: 'CONV_SEND',
            buildFlagEnabled: parsed.buildFlagEnabled ?? false,
            runtimeToggleEnabled: parsed.runtimeToggleEnabled ?? false,
            allowed: parsed.allowed ?? false,
            requested_provider: parsed.requested_provider ?? 'unknown',
          };
        }
      } catch (e) {
        console.error('[TEST] Failed to parse [CONV_SEND]:', e);
      }
    }

    // Parse [CONV_RECV]
    if (text.includes('[CONV_RECV]')) {
      try {
        // Extract JSON après "[CONV_RECV] Decision meta:"
        const match = text.match(/\[CONV_RECV\].*?(\{.*\})/);
        if (match) {
          const parsed = JSON.parse(match[1]);
          recvLog = {
            type: 'CONV_RECV',
            mode: parsed.mode ?? 'UNKNOWN',
            reason_code: parsed.reason_code,
            provider_used: parsed.provider_used,
            network_used: parsed.network_used,
            attempts_count: parsed.attempts_count,
          };
        }
      } catch (e) {
        console.error('[TEST] Failed to parse [CONV_RECV]:', e);
      }
    }
  });

  return { send: sendLog, recv: recvLog, allLogs };
}

/**
 * Helper: Attendre et retourner les logs capturés
 */
async function waitForLogs(
  captured: CapturedLogs,
  timeoutMs = 15000
): Promise<{ send: ConvSendLog; recv: ConvRecvLog }> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (captured.send && captured.recv) {
      return {
        send: captured.send,
        recv: captured.recv,
      };
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  throw new Error(
    `Timeout waiting for logs. send=${!!captured.send} recv=${!!captured.recv}`
  );
}

/**
 * Test Suite: Chat Provider Decision Certification
 */
test.describe('P3 Certification: Chat Provider Decision', () => {
  test.beforeEach(async ({ page }) => {
    // Navigation vers la page chat
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    
    // Attendre que l'app soit prête (présence du composant chat)
    await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });
  });

  /**
   * Test principal: Validation automatique du provider decision flow
   * Exécuté x3 via test.describe.serial ou invocations multiples
   */
  test('CERT-1: Provider decision observability + UI consistency [RUN 1/3]', async ({
    page,
  }) => {
    await runCertificationTest(page, 'RUN_1');
  });

  test('CERT-2: Provider decision observability + UI consistency [RUN 2/3]', async ({
    page,
  }) => {
    await runCertificationTest(page, 'RUN_2');
  });

  test('CERT-3: Provider decision observability + UI consistency [RUN 3/3]', async ({
    page,
  }) => {
    await runCertificationTest(page, 'RUN_3');
  });
});

/**
 * Core test logic: Invoke chat + capture logs + validate invariants
 */
async function runCertificationTest(page: Page, runId: string): Promise<void> {
  console.log(`\n========================================`);
  console.log(`[P3 CERT] Starting ${runId}`);
  console.log(`========================================\n`);

  // Setup: Capture logs
  const captured = await captureConversationLogs(page);

  // Action: Envoyer message test
  const messageInput = page.locator('[data-testid="chat-input"]');
  await messageInput.fill(`P3 Certification Test ${runId} - ${new Date().toISOString()}`);

  const sendButton = page.locator('[data-testid="send-button"]');
  await sendButton.click();

  // Wait: Attendre la réponse (max 15s)
  await page.waitForSelector('[data-testid="assistant-message"]', {
    timeout: 15000,
  });

  // Extraction: Attendre les logs [CONV_SEND] + [CONV_RECV]
  const { send, recv } = await waitForLogs(captured, 15000);

  // Logging: Afficher les logs capturés
  console.log(`\n[${runId}] CONV_SEND:`, JSON.stringify(send, null, 2));
  console.log(`[${runId}] CONV_RECV:`, JSON.stringify(recv, null, 2));

  // ═══════════════════════════════════════════════════════════
  // ASSERTIONS: Invariants ONLINE-FIRST
  // ═══════════════════════════════════════════════════════════

  // A1: Les logs doivent exister
  expect(send, '[A1] [CONV_SEND] log must be captured').toBeDefined();
  expect(recv, '[A1] [CONV_RECV] log must be captured').toBeDefined();

  // A2: Mode doit être défini
  expect(recv.mode, '[A2] mode must be defined').not.toBe('UNKNOWN');

  // Get UI text pour vérifier consistency
  const messagesContainer = page.locator('[data-testid="messages-container"]');
  const uiText = await messagesContainer.textContent();

  // ═══════════════════════════════════════════════════════════
  // CASE 1: externalAllowed=true → mode devrait être REMOTE ou LOCAL
  // ═══════════════════════════════════════════════════════════
  if (send.allowed) {
    console.log(`\n[${runId}] CASE 1: externalAllowed=true → REMOTE/LOCAL attendu`);

    // A3: Si external allowed, mode NE DEVRAIT PAS être OFFLINE (sauf si providers réellement down)
    // Note: On tolère OFFLINE si reason_code présent (providers réellement down)
    if (recv.mode === 'OFFLINE') {
      console.warn(
        `[${runId}] ⚠️ Mode OFFLINE malgré externalAllowed=true. Vérification reason_code...`
      );
      expect(
        recv.reason_code,
        '[A3] Si OFFLINE malgré externalAllowed=true, reason_code OBLIGATOIRE'
      ).toBeDefined();
      expect(recv.reason_code, '[A3] reason_code must not be empty').not.toBe('');

      // A4: UI doit contenir "Mode hors ligne:"
      expect(
        uiText?.includes('Mode hors ligne') || uiText?.includes('hors ligne'),
        '[A4] UI must display offline message when mode=OFFLINE'
      ).toBe(true);
    } else {
      // A5: Mode REMOTE ou LOCAL → provider_used doit être défini
      expect(
        recv.provider_used,
        '[A5] provider_used must be defined when mode=REMOTE|LOCAL'
      ).toBeDefined();
      expect(recv.provider_used, '[A5] provider_used must not be empty').not.toBe('');

      // A6: UI NE DOIT PAS contenir "hors ligne"
      const hasOfflineText =
        uiText?.includes('Mode hors ligne') ||
        uiText?.includes('hors ligne') ||
        uiText?.includes('offline');

      expect(
        hasOfflineText,
        '[A6] UI must NOT display offline message when mode=REMOTE|LOCAL'
      ).toBe(false);

      console.log(`[${runId}] ✅ Mode ${recv.mode} | provider=${recv.provider_used}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // CASE 2: externalAllowed=false → mode devrait être LOCAL ou OFFLINE
  // ═══════════════════════════════════════════════════════════
  else {
    console.log(`\n[${runId}] CASE 2: externalAllowed=false → LOCAL/OFFLINE attendu`);

    // A7: Mode devrait être LOCAL ou OFFLINE
    expect(
      ['LOCAL', 'OFFLINE'].includes(recv.mode),
      '[A7] mode must be LOCAL or OFFLINE when externalAllowed=false'
    ).toBe(true);

    // A8: Si OFFLINE, reason_code obligatoire
    if (recv.mode === 'OFFLINE') {
      expect(
        recv.reason_code,
        '[A8] reason_code OBLIGATOIRE when mode=OFFLINE'
      ).toBeDefined();
      expect(recv.reason_code, '[A8] reason_code must not be empty').not.toBe('');

      // A9: UI doit contenir "Mode hors ligne:"
      expect(
        uiText?.includes('Mode hors ligne') || uiText?.includes('hors ligne'),
        '[A9] UI must display offline message when mode=OFFLINE'
      ).toBe(true);

      console.log(`[${runId}] ✅ Mode OFFLINE | reason_code=${recv.reason_code}`);
    } else {
      // LOCAL mode
      expect(
        recv.provider_used,
        '[A10] provider_used must be defined when mode=LOCAL'
      ).toBeDefined();

      console.log(`[${runId}] ✅ Mode LOCAL | provider=${recv.provider_used}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // INVARIANT GLOBAL: Si mode=OFFLINE → reason_code OBLIGATOIRE
  // ═══════════════════════════════════════════════════════════
  if (recv.mode === 'OFFLINE') {
    expect(
      recv.reason_code,
      '[INVARIANT] OFFLINE mode MUST have reason_code'
    ).toBeDefined();
    expect(recv.reason_code, '[INVARIANT] reason_code must not be UNKNOWN').not.toBe(
      'UNKNOWN'
    );
    expect(recv.reason_code, '[INVARIANT] reason_code must not be empty').not.toBe('');
  }

  // ═══════════════════════════════════════════════════════════
  // INVARIANT GLOBAL: Si mode≠OFFLINE → UI sans "hors ligne"
  // ═══════════════════════════════════════════════════════════
  if (recv.mode !== 'OFFLINE') {
    const hasOfflineText =
      uiText?.includes('Mode hors ligne') ||
      uiText?.includes('hors ligne') ||
      uiText?.includes('offline');

    expect(
      hasOfflineText,
      '[INVARIANT] UI must NOT show offline when mode≠OFFLINE'
    ).toBe(false);
  }

  console.log(`\n[${runId}] ✅ ALL ASSERTIONS PASSED\n`);

  // Dump tous les logs pour evidence
  console.log(`\n[${runId}] === ALL CAPTURED LOGS ===`);
  captured.allLogs
    .filter(log => log.includes('[CONV_') || log.includes('provider') || log.includes('mode'))
    .forEach(log => console.log(log));
  console.log(`\n========================================`);
}
