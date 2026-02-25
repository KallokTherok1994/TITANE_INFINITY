import assert from 'node:assert/strict';

const scenario = process.env.TITANE_PROOF_SCENARIO || 'S1';
const runId = process.env.TITANE_PROOF_RUN || 'run1';

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
            attempts.push(payload => window.__TAURI__.core.invoke('conversation_generate', payload));
          }
          if (window.__TAURI__?.tauri?.invoke) {
            attempts.push(payload => window.__TAURI__.tauri.invoke('conversation_generate', payload));
          }
          if (window.__TAURI__?.invoke) {
            attempts.push(payload => window.__TAURI__.invoke('conversation_generate', payload));
          }
          if (window.__TAURI_INTERNALS__?.invoke) {
            attempts.push(payload => window.__TAURI_INTERNALS__.invoke('conversation_generate', payload));
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
    if (String(lastError).includes('Origin header is not a valid URL') && callAttempt < 5) {
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

    const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/#/chat';
    const loaded = await ensureTauriPageLoaded(appUrl);
    if (!loaded) {
      console.warn('[ONLINE_CHAT_FIX] Tauri page unavailable (about:blank), skipping spec');
      this.skip();
      return;
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

    const msg = `[${scenario}/${runId}] preuve ONLINE_CHAT_FIX ${new Date().toISOString()}`;
    const response = await invokeConversationGenerate(msg);

    assert.ok(response, 'conversation_generate returned null');
    const assistantText = response.assistant_message || response.content || '';
    assert.ok(assistantText, 'assistant_message/content missing');

    const decision = response.decision || response.meta || response.metadata || {};
    const online = decision.online ?? decision.network_used;
    const reason = decision.reasonCode ?? decision.reason_code;
    const provider = decision.providerSelected || decision.provider_used || 'unknown';

    console.log(`[PROOF] scenario=${scenario} run=${runId}`);
    console.log(
      `[CHAT_DECISION] online=${String(online)} reason=${String(reason)} provider=${provider}`
    );
    console.log(`[ASSISTANT_TEXT] ${String(assistantText).slice(0, 200)}`);
  });
});
