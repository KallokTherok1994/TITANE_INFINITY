import assert from 'node:assert/strict';

const scenario = process.env.TITANE_PROOF_SCENARIO || 'S1';
const runId = process.env.TITANE_PROOF_RUN || 'run1';
const N2_QUESTION =
  'Explique en 3 points la naturopathie en couvrant alimentation, sommeil et gestion du stress.';

const QUESTION_ANCHORS = ['naturopath', 'aliment', 'sommeil', 'stress'];
const GENERIC_PATTERNS = [
  "qu'est-ce que tu veux savoir",
  'comment puis-je vous aider',
  'que souhaitez-vous savoir',
  'je suis titane',
  'assistant ia personnel',
];

async function ensureTauriPageLoaded(appUrl) {
  const candidates = [appUrl, 'tauri://localhost/#/chat', 'tauri://localhost'];

  for (const url of candidates) {
    await browser.url(url);
    await browser.pause(1200);
    const href = await browser.execute(() => window.location.href || '');
    if (href.startsWith('tauri://localhost')) {
      return true;
    }
  }

  return false;
}

async function invokeConversationGenerate(message) {
  const conversationId = `e2e-proof-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  let lastError = 'IPC invocation failed';

  for (let callAttempt = 1; callAttempt <= 5; callAttempt++) {
    const result = await browser.executeAsync(
      (payload, done) => {
        const run = async () => {
          const attempts = [];

          if (window.__TAURI__?.core?.invoke) {
            attempts.push(payload =>
              window.__TAURI__.core.invoke('conversation_generate', payload)
            );
          }
          if (window.__TAURI__?.tauri?.invoke) {
            attempts.push(payload =>
              window.__TAURI__.tauri.invoke('conversation_generate', payload)
            );
          }
          if (window.__TAURI__?.invoke) {
            attempts.push(payload =>
              window.__TAURI__.invoke('conversation_generate', payload)
            );
          }
          if (window.__TAURI_INTERNALS__?.invoke) {
            attempts.push(payload =>
              window.__TAURI_INTERNALS__.invoke('conversation_generate', payload)
            );
          }

          if (!attempts.length) {
            throw new Error('Tauri IPC unavailable');
          }

          let invokeError = 'invoke unavailable';
          for (const attempt of attempts) {
            try {
              return await attempt(payload);
            } catch (error) {
              invokeError = String(error?.message || error);
            }
          }

          throw new Error(invokeError);
        };

        run()
          .then(res => done({ ok: true, res }))
          .catch(err => done({ ok: false, err: String(err?.message || err) }));
      },
      {
        args: {
          message,
          conversationId,
          provider: 'local',
        },
      }
    );

    if (result?.ok) {
      return result.res;
    }

    lastError = result?.err || lastError;
    if (
      String(lastError).includes('Origin header is not a valid URL') &&
      callAttempt < 5
    ) {
      await browser.pause(300);
      continue;
    }
    break;
  }

  throw new Error(lastError);
}

describe('ONLINE_CHAT_FIX proof driver', () => {
  it('collects decision evidence from IPC response', async function () {
    this.timeout(120000);
    // Allow long-running IPC calls during controlled provider probes.
    await browser.setTimeout({ script: 120000 });

    const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/#/chat';
    const loaded = await ensureTauriPageLoaded(appUrl);
    if (!loaded) {
      throw new Error(
        'BLOCKER: Tauri page unavailable (about:blank) - environment setup required for ONLINE_CHAT_FIX validation'
      );
    }

    await browser.waitUntil(
      async () => {
        const readyState = await browser.execute(() => document.readyState);
        const href = await browser.execute(() => window.location.href || '');
        return (
          (readyState === 'interactive' || readyState === 'complete') &&
          href.startsWith('tauri://localhost')
        );
      },
      { timeout: 10000, interval: 250, timeoutMsg: 'ONLINE_CHAT proof page not ready' }
    );

    const hasTauri = await browser.execute(() => {
      const hasV1 = typeof window.__TAURI__ !== 'undefined';
      const hasV2 = typeof window.__TAURI_INTERNALS__ !== 'undefined';
      const hasInvoke =
        !!window.__TAURI_INTERNALS__?.invoke ||
        !!window.__TAURI__?.tauri?.invoke ||
        !!window.__TAURI__?.invoke ||
        !!window.__TAURI__?.core?.invoke;
      return (hasV1 || hasV2) && hasInvoke;
    });
    assert.equal(hasTauri, true, 'Tauri IPC must be available');

    const msg = `${N2_QUESTION} [scenario=${scenario} run=${runId}]`;
    const response = await invokeConversationGenerate(msg);

    assert.ok(response, 'conversation_generate returned null');
    const assistantText = response.assistant_message || response.content || '';
    assert.ok(assistantText, 'assistant_message/content missing');

    // ANTI_LIE: reject mock path — window.__TITANE_E2E_CHAT_MOCK__ must be false in proof runs
    assert.ok(
      !assistantText.startsWith('[MOCK_OK]'),
      `FALSE_PASS: response is a mock stub ([MOCK_OK] prefix). Provider: ${String(response?.meta?.provider_used ?? response?.metadata?.provider_used ?? 'unknown')}`
    );

    // ANTI_LIE: reject generic/empty degraded stubs
    const STUB_PATTERNS = ['[MOCK_OK]', 'e2e-mock', 'stub', 'placeholder'];
    for (const pattern of STUB_PATTERNS) {
      assert.ok(
        !assistantText.toLowerCase().includes(pattern.toLowerCase()),
        `FALSE_PASS: response contains stub marker "${pattern}"`
      );
    }

    // Minimal usefulness: response must have meaningful length (>10 chars)
    assert.ok(
      assistantText.trim().length > 10,
      `ANSWER_TOO_SHORT: assistantText has ${assistantText.trim().length} chars — likely stub or empty fallback`
    );

    const lowerAssistantText = assistantText.toLowerCase();

    const decision = response.decision || response.meta || response.metadata || {};
    const online = decision.online ?? decision.network_used;
    const reason = decision.reasonCode ?? decision.reason_code;
    const mode = decision.mode ?? 'UNKNOWN';
    const provider = decision.providerSelected || decision.provider_used || 'unknown';

    const reasonUpper = String(reason || 'UNKNOWN').toUpperCase();
    const modeUpper = String(mode || 'UNKNOWN').toUpperCase();
    const providerLower = String(provider || '').toLowerCase();
    const isDegradedPath =
      providerLower.includes('timeout-degraded') ||
      providerLower.includes('offline') ||
      reasonUpper === 'TIMEOUT' ||
      reasonUpper === 'FALLBACK_OFFLINE' ||
      modeUpper === 'OFFLINE';

    // Provider must be explicit and non-mock for REAL_CHAT_CHAIN proofs
    assert.notEqual(
      provider,
      'unknown',
      'PROVIDER_UNKNOWN: provider_used/providerSelected missing'
    );
    assert.notEqual(
      provider,
      'e2e-mock',
      'PROVIDER_MOCK: provider_used must not be e2e-mock'
    );

    let anchorHits = [];
    if (isDegradedPath) {
      // D2 honest degraded path: do not fake topical answer; require explicit degraded wording
      const degradedMarkers = ['degrade', 'hors ligne', 'secours', 'delai', 'timeout'];
      const hasDegradedMarker = degradedMarkers.some(marker =>
        lowerAssistantText.includes(marker)
      );
      assert.ok(
        hasDegradedMarker,
        `DEGRADED_UI_LIE: degraded path lacks honest wording; reason=${reasonUpper} provider=${provider}`
      );
    } else {
      // B/E real-answer path: block low-information boilerplate + require semantic overlap
      for (const pattern of GENERIC_PATTERNS) {
        assert.ok(
          !lowerAssistantText.includes(pattern),
          `FALSE_PASS: response matches generic boilerplate pattern "${pattern}"`
        );
      }

      assert.notEqual(
        providerLower,
        'none',
        'PROVIDER_NONE: real-answer path requires a concrete provider'
      );

      anchorHits = QUESTION_ANCHORS.filter(anchor => lowerAssistantText.includes(anchor));
      assert.ok(
        anchorHits.length >= 2,
        `ANSWER_MISMATCH: expected >=2 anchors from question, got ${anchorHits.length}; hits=${anchorHits.join(',') || 'none'}`
      );
    }

    // Capture provider_used for observability (provider is asserted non-unknown above)
    console.log(`[PROOF] scenario=${scenario} run=${runId}`);
    console.log(
      `[CHAT_DECISION] online=${String(online)} mode=${String(mode)} reason=${String(reason)} provider=${provider}`
    );
    console.log(
      `[D2_DERIVED] fallback_triggered=${String(isDegradedPath)} fallback_used=${String(providerLower.includes('timeout-degraded') || providerLower.includes('offline'))}`
    );
    console.log(
      `[ANSWER_MATCH] anchors=${anchorHits.join(',') || 'none'} count=${anchorHits.length}`
    );
    console.log(`[ASSISTANT_TEXT] ${String(assistantText).slice(0, 200)}`);
  });
});
