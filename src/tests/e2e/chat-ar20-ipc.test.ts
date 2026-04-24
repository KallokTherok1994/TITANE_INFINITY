// ═══════════════════════════════════════════════════════════════
//   TITANE∞ - AR20 IPC Certification (Vitest)
//   Contract: 20 consecutive messages MUST all receive a response
//   Uses Tauri IPC directly — no browser UI required
//   Aligns with: e2e/runtime-validation/chat-ar20.spec.ts (AR20)
//   Run: RUN_E2E_TESTS=1 TITANE_E2E_TAURI=1 pnpm run test:e2e:vitest
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
import { secureInvoke as invoke } from '@/lib/security';

const SKIP_AR20 = !process.env.RUN_E2E_TESTS || process.env.TITANE_E2E_TAURI !== '1';

const AR20_MESSAGES = [
  'Message 1: Bonjour TITANE',
  'Message 2: Quel est ton rôle?',
  'Message 3: Parle-moi de la mémoire cognitive',
  'Message 4: Quels modèles IA utilises-tu?',
  'Message 5: Comment fonctionne le pipeline OMEGA?',
  'Message 6: Explique le mode coach',
  'Message 7: Donne-moi un exemple de réponse créative',
  'Message 8: Quelle est ta priorité 1?',
  'Message 9: Comment gères-tu le fallback local?',
  'Message 10: Résumé des 9 premiers messages',
  'Message 11: Parle-moi de singularité',
  'Message 12: Quel est le Ring 1 dans TITANE?',
  'Message 13: Explique One Door network',
  "Message 14: Qu'est-ce qu'IPC canonical?",
  'Message 15: Tests de régression?',
  'Message 16: Politique de version?',
  'Message 17: Que signifie SEALED dans le kernel?',
  'Message 18: Demande complexe: liste 5 capacités clés',
  'Message 19: Génère un plan de sprint court',
  'Message 20: Message final: confirme que tu as bien répondu aux 19 précédents',
];

describe('AR20 IPC Certification: 20 consecutive messages', () => {
  if (SKIP_AR20) {
    it('is disabled unless RUN_E2E_TESTS=1 and TITANE_E2E_TAURI=1', () => {
      expect(SKIP_AR20).toBe(true);
    });
    return;
  }

  it('should respond to all 20 consecutive messages via IPC', async () => {
    const results: Array<{
      index: number;
      message: string;
      success: boolean;
      response: string;
      duration_ms: number;
    }> = [];

    const conversationId = `ar20-ipc-cert-${Date.now()}`;

    for (let i = 0; i < AR20_MESSAGES.length; i++) {
      const msg = AR20_MESSAGES[i];
      const start = performance.now();

      const response = await invoke('conversation_generate', {
        args: {
          message: msg,
          conversationId,
          mode: 'coach',
        },
      });

      const duration_ms = performance.now() - start;

      const content =
        response && typeof response === 'object' && 'content' in (response as object)
          ? (response as { content: string }).content
          : typeof response === 'string'
            ? response
            : '';

      const success = typeof content === 'string' && content.trim().length > 0;

      results.push({
        index: i + 1,
        message: msg,
        success,
        response: content,
        duration_ms,
      });

      console.warn(
        `[AR20-IPC] ${i + 1}/20 success=${success} duration=${Math.round(duration_ms)}ms`
      );

      // Each message MUST receive a non-empty response
      expect(success, `AR20 IPC message ${i + 1} received no response`).toBe(true);
    }

    const allPass = results.every(r => r.success);
    const failedIndices = results.filter(r => !r.success).map(r => r.index);

    console.warn(
      `[AR20-IPC] VERDICT: ${allPass ? 'PASS' : 'FAIL'} — ${results.length}/20 responded`
    );
    if (failedIndices.length > 0) {
      console.warn(`[AR20-IPC] Failed messages: ${failedIndices.join(', ')}`);
    }

    expect(allPass, `AR20 IPC: ${failedIndices.length} messages did not respond`).toBe(
      true
    );
  }, 120000); // 120s timeout for 20 sequential IPC calls
});
