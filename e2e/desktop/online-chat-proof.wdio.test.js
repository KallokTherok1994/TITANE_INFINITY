import assert from 'node:assert/strict';

const scenario = process.env.TITANE_PROOF_SCENARIO || 'S1';
const runId = process.env.TITANE_PROOF_RUN || 'run1';

async function invokeConversationGenerate(message) {
  return await browser.executeAsync((payload, done) => {
    const run = async () => {
      if (window.__TAURI_INTERNALS__?.invoke) {
        return await window.__TAURI_INTERNALS__.invoke('conversation_generate', payload);
      }

      if (window.__TAURI__?.tauri?.invoke) {
        return await window.__TAURI__.tauri.invoke('conversation_generate', payload);
      }

      if (window.__TAURI__?.invoke) {
        return await window.__TAURI__.invoke('conversation_generate', payload);
      }

      if (window.__TAURI__?.core?.invoke) {
        return await window.__TAURI__.core.invoke('conversation_generate', payload);
      }

      if (window.__TAURI__ || window.__TAURI_INTERNALS__) {
        throw new Error('Tauri API present but invoke is unavailable');
      }

      throw new Error('Tauri IPC unavailable');
    };

    run()
      .then(res => done({ ok: true, res }))
      .catch(err => done({ ok: false, err: String(err?.message || err) }));
  }, { message, conversationId: null }).then(result => {
    if (!result?.ok) {
      throw new Error(result?.err || 'IPC invocation failed');
    }
    return result.res;
  });
}

describe('ONLINE_CHAT_FIX proof driver', () => {
  it('collects decision evidence from IPC response', async function () {
    this.timeout(120000);

    await browser.url('tauri://localhost');
    await browser.pause(1200);

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
    assert.ok(response.assistant_message, 'assistant_message missing');

    const decision = response.decision || {};
    const online = decision.online;
    const reason = decision.reasonCode;
    const provider = decision.providerSelected || 'unknown';

    console.log(`[PROOF] scenario=${scenario} run=${runId}`);
    console.log(`[CHAT_DECISION] online=${String(online)} reason=${String(reason)} provider=${provider}`);
    console.log(`[ASSISTANT_TEXT] ${String(response.assistant_message).slice(0, 200)}`);
  });
});
