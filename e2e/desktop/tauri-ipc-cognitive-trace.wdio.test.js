import assert from 'node:assert/strict';

const SAFE_PROMPT =
  'Decris en deux phrases le role de TITANE comme assistant local de clarte.';

async function ensureTauriPageLoaded(appUrl) {
  const candidates = [
    appUrl,
    'tauri://localhost/titane',
    'tauri://localhost/#/titane',
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

async function invokeConversationGenerateDirect(message) {
  const conversationId = `wdio-tauri-direct-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const generated = await browser.executeAsync(
    (payload, done) => {
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

      run()
        .then(res => done({ ok: true, res }))
        .catch(err => done({ ok: false, err: String(err?.message || err) }));
    },
    {
      args: {
        message,
        conversationId,
        provider: 'local',
        mode: 'synthesis',
      },
    }
  );

  if (!generated?.ok) {
    throw new Error(generated?.err || 'conversation_generate failed');
  }

  return generated.res;
}

describe('Tauri IPC direct cognitive trace certification', () => {
  it('TAURI_IPC_DIRECT_INVOKE_RETURNS_NON_MOCK_CONTENT', async function () {
    this.timeout(300000);

    const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/titane';
    const loaded = await ensureTauriPageLoaded(appUrl);
    assert.equal(loaded, true, 'Tauri page unavailable for direct IPC certification');

    const tauriRuntime = await browser.execute(() => {
      const hasV1 = typeof window.__TAURI__ !== 'undefined';
      const hasV2 = typeof window.__TAURI_INTERNALS__ !== 'undefined';
      const hasInvoke =
        !!window.__TAURI_INTERNALS__?.invoke ||
        !!window.__TAURI__?.tauri?.invoke ||
        !!window.__TAURI__?.core?.invoke ||
        !!window.__TAURI__?.invoke;
      return {
        href: window.location.href || '',
        hasV1,
        hasV2,
        hasInvoke,
      };
    });

    assert.equal(tauriRuntime.href.startsWith('tauri://localhost'), true);
    assert.equal(tauriRuntime.hasInvoke, true, 'Tauri invoke unavailable');

    await browser.execute(() => {
      delete window.__TITANE_E2E_CHAT_MOCK__;
      window.__TITANE_E2E_CHAT_MOCK__ = false;
    });

    const directResponse = await invokeConversationGenerateDirect(SAFE_PROMPT);
    const directContent = String(
      directResponse?.assistant_message || directResponse?.content || ''
    );
    assert.ok(directContent.length > 10, 'Direct IPC response content missing/too short');
    assert.equal(
      directContent.includes('[MOCK_OK]'),
      false,
      'Direct IPC returned mock marker'
    );

    const secondDirectResponse = await invokeConversationGenerateDirect(SAFE_PROMPT);
    const secondDirectContent = String(
      secondDirectResponse?.assistant_message || secondDirectResponse?.content || ''
    );
    assert.ok(
      secondDirectContent.length > 10,
      'Second direct IPC response content missing/too short'
    );
    assert.equal(
      secondDirectContent.includes('[MOCK_OK]'),
      false,
      'Second direct IPC response includes mock marker'
    );
  });
});
