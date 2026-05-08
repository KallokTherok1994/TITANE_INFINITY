import { test, expect } from '@playwright/test';
import { closeBootBeaconIfPresent } from '../helpers/navigation';

const CONVERSATION_ID = 'conv-cognitive-trace-agent-e2e';

test('Cognitive trace panel expose la verite web et qualite en vue expert', async ({
  page,
}) => {
  await page.addInitScript(
    ({ conversationId }) => {
      const now = Date.now();
      window.localStorage.setItem('omega-chat-preferred-provider', 'ollama');
      window.localStorage.setItem('titane_active_conversation_id', conversationId);
      window.localStorage.setItem(
        `titane_conversation_${conversationId}`,
        JSON.stringify({
          id: conversationId,
          title: 'Cognitive Trace Agent E2E',
          status: 'active',
          created_at: now - 1000,
          updated_at: now,
          messages: [
            {
              id: 'user-cognitive-trace-agent-e2e',
              role: 'user',
              content: 'Montre la verite cognitive visible.',
              timestamp: now - 500,
            },
            {
              id: 'assistant-cognitive-trace-agent-e2e',
              role: 'assistant',
              content: 'Trace cognitive visible.',
              timestamp: now,
              metadata: {
                providerUsed: 'ollama',
                modelRequested: 'gemma2:2b',
                modelUsed: 'gemma2:2b',
                cognitiveTrace: {
                  traceId: 'trace-agent-e2e',
                  timestamp: now,
                  input: {
                    messageLength: 31,
                    requiresFreshness: true,
                    requiresWeb: true,
                    requiresMemory: true,
                    taskFamily: 'research',
                  },
                  canonical: {
                    attached: true,
                    mode: 'BALANCED',
                    canonicalMode: 'BALANCED',
                    profileId: 'BALANCED',
                    inferenceState: 'SAFE_TO_INFER',
                    truthStatus: 'STABLE_PARTIAL',
                    confidence: 0.82,
                    messageComplexity: 0.5,
                    signalCount: 3,
                  },
                  memory: {
                    injected: true,
                    reasonCode: 'ltm_match',
                    sources: ['memory:present'],
                    sourceCount: 1,
                    relevance: 'medium',
                    risk: 'none',
                  },
                  web: {
                    needed: true,
                    attempted: true,
                    available: true,
                    sourceCount: 2,
                    limitations: [],
                    reasonCode: 'web_success',
                  },
                  generation: {
                    providerRequested: 'ollama',
                    providerUsed: 'ollama',
                    modelRequested: 'gemma2:2b',
                    modelUsed: 'gemma2:2b',
                    fallbackUsed: false,
                    latencyMs: 120,
                  },
                  reflection: {
                    verifierEnabled: true,
                    factualClaimsDetected: true,
                    verified: true,
                    confidence: 0.8,
                    shouldRevise: false,
                    correctionsApplied: false,
                  },
                  quality: {
                    evaluated: true,
                    alignmentScore: 0.78,
                    completenessScore: 0.78,
                    depthMatchScore: 0.78,
                    overallScore: 0.78,
                    shouldEnhance: false,
                    enhancementHint: '',
                  },
                  metaCognition: {
                    evaluated: false,
                    anomalyDetected: false,
                  },
                  policy: {
                    version: 'v2',
                    webTruth: {
                      evaluated: true,
                      need: 'freshness_required',
                      status: 'attempted_success',
                      shouldUseWeb: true,
                      shouldWarnUser: false,
                    },
                    qualityAction: {
                      evaluated: true,
                      action: 'none',
                      minimumVerdict: 'PASS',
                      reasonCode: 'quality_pass',
                      warnUser: false,
                    },
                  },
                  final: {
                    verdict: 'PASS',
                    limitations: [],
                    safeToRemember: true,
                    shouldAskClarification: false,
                  },
                },
              },
            },
          ],
        })
      );
    },
    { conversationId: CONVERSATION_ID }
  );

  await page.goto('/titane');
  await closeBootBeaconIfPresent(page);

  const progress = page.getByTestId('reasoning-progress');
  await expect(progress).toBeVisible();
  await expect(progress).toHaveAttribute('data-cognitive-verdict', 'PASS');
  await expect(progress).toHaveAttribute('data-cognitive-web', 'true');
  await expect(progress).toHaveAttribute('data-cognitive-memory', 'true');
  await expect(progress).toHaveAttribute('data-cognitive-quality', '78%');

  await progress.click();
  await page.getByRole('button', { name: 'Expert' }).click();

  await expect(page.getByTestId('reasoning-cognitive-trace')).toBeVisible();
  await expect(page.getByTestId('reasoning-cognitive-web-policy')).toContainText(
    'freshness_required'
  );
  await expect(page.getByTestId('reasoning-cognitive-web-policy')).toContainText(
    'attempted_success'
  );
  await expect(page.getByTestId('reasoning-cognitive-quality-action')).toContainText(
    'min PASS'
  );
});
