import assert from 'node:assert/strict';

const scenario = process.env.TITANE_PROOF_SCENARIO || 'S1';
const runId = process.env.TITANE_PROOF_RUN || 'run1';
const N2_QUESTION =
  'Réponds en une phrase incluant les mots alimentation, sommeil et stress.';

const QUESTION_ANCHORS = ['naturopath', 'aliment', 'sommeil', 'stress'];
const GENERIC_PATTERNS = [
  "qu'est-ce que tu veux savoir",
  'comment puis-je vous aider',
  'que souhaitez-vous savoir',
  'je suis titane',
  'assistant ia personnel',
];

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const PROOF_SCRIPT_TIMEOUT_MS = parsePositiveInt(
  process.env.ONLINE_PROOF_SCRIPT_TIMEOUT_MS,
  180000
);
const PROOF_TEST_TIMEOUT_MS = parsePositiveInt(
  process.env.ONLINE_PROOF_TEST_TIMEOUT_MS,
  300000
);
const PROOF_INVOKE_TIMEOUT_MS = parsePositiveInt(
  process.env.ONLINE_PROOF_INVOKE_TIMEOUT_MS,
  90000
);

function toSerializable(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 50).map(toSerializable);
  }
  if (typeof value === 'object') {
    const out = {};
    Object.keys(value)
      .slice(0, 80)
      .forEach(key => {
        out[key] = toSerializable(value[key]);
      });
    return out;
  }
  return String(value);
}

async function ensureTauriPageLoaded(appUrl) {
  const candidates = [
    appUrl,
    'tauri://localhost/titane',
    'tauri://localhost/#/chat',
    'tauri://localhost',
  ];

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

async function recoverProofSession(appUrl) {
  try {
    await browser.reloadSession();
  } catch {
    // Session may already be gone.
  }

  await browser.setTimeout({ script: PROOF_SCRIPT_TIMEOUT_MS });

  const loaded = await ensureTauriPageLoaded(appUrl);
  if (!loaded) {
    throw new Error('ONLINE_CHAT_FIX recovery failed: Tauri page unavailable');
  }
}

async function invokeConversationGenerate(message) {
  let lastError = 'IPC invocation failed';
  const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/titane';

  for (let callAttempt = 1; callAttempt <= 5; callAttempt++) {
    const conversationId = `e2e-proof-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let result;
    try {
      result = await browser.executeAsync(
        (payload, invokeTimeoutMs, done) => {
          const toSerializable = value => {
            if (value === null || value === undefined) return value;
            if (typeof value === 'string') return value;
            if (typeof value === 'number' || typeof value === 'boolean') return value;
            if (Array.isArray(value)) {
              return value.slice(0, 50).map(toSerializable);
            }
            if (typeof value === 'object') {
              const out = {};
              Object.keys(value)
                .slice(0, 80)
                .forEach(key => {
                  out[key] = toSerializable(value[key]);
                });
              return out;
            }
            return String(value);
          };

          const run = async () => {
            const attempts = [];

            if (window.__TAURI_INTERNALS__?.invoke) {
              attempts.push(payload =>
                window.__TAURI_INTERNALS__.invoke('conversation_generate', payload)
              );
            }
            if (window.__TAURI__?.tauri?.invoke) {
              attempts.push(payload =>
                window.__TAURI__.tauri.invoke('conversation_generate', payload)
              );
            }
            if (window.__TAURI__?.core?.invoke) {
              attempts.push(payload =>
                window.__TAURI__.core.invoke('conversation_generate', payload)
              );
            }
            if (window.__TAURI__?.invoke) {
              attempts.push(payload =>
                window.__TAURI__.invoke('conversation_generate', payload)
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

          const withTimeout = Promise.race([
            run(),
            new Promise((_, reject) => {
              setTimeout(
                () => reject(new Error('ONLINE_PROOF_INVOKE_TIMEOUT')),
                invokeTimeoutMs
              );
            }),
          ]);

          withTimeout
            .then(res => done({ ok: true, res: toSerializable(res) }))
            .catch(err => done({ ok: false, err: String(err?.message || err) }));
        },
        {
          args: {
            message,
            conversationId,
            mode: 'synthesis',
            provider: 'local',
            systemPrompt: 'Réponse concise, utile, sans préambule.',
          },
        },
        PROOF_INVOKE_TIMEOUT_MS
      );
    } catch (error) {
      lastError = String(error?.message || error);
      if (
        /script timed out|invalid session id|no such window|page crash|invalidated|session deleted because of page crash or hang/i.test(
          lastError
        ) &&
        callAttempt < 5
      ) {
        await recoverProofSession(appUrl);
        await browser.pause(300);
        continue;
      }
      throw error;
    }

    if (result?.ok) {
      return result.res;
    }

    lastError = result?.err || lastError;
    if (
      /Origin header is not a valid URL|ONLINE_PROOF_INVOKE_TIMEOUT|script timed out|invalid session id|no such window|page crash|invalidated|session deleted because of page crash or hang/i.test(
        String(lastError)
      ) &&
      callAttempt < 5
    ) {
      if (
        /script timed out|invalid session id|no such window|page crash|invalidated|session deleted because of page crash or hang/i.test(
          String(lastError)
        )
      ) {
        await recoverProofSession(appUrl);
      }
      await browser.pause(300);
      continue;
    }
    break;
  }

  throw new Error(lastError);
}

describe('ONLINE_CHAT_FIX proof driver', () => {
  it('collects decision evidence from IPC response', async function () {
    this.timeout(PROOF_TEST_TIMEOUT_MS);
    // Allow long-running IPC calls during controlled provider probes.
    await browser.setTimeout({ script: PROOF_SCRIPT_TIMEOUT_MS });

    const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/titane';
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
