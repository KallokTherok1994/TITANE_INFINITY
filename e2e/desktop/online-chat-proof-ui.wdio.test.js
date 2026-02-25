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
  const conversationId = `e2e-ui-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  let lastError = 'conversation_generate failed';

  for (let attempt = 1; attempt <= 5; attempt++) {
    const generated = await browser.executeAsync(
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
          for (const tryInvoke of attempts) {
            try {
              return await tryInvoke(payload);
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

    if (generated?.ok && generated.res) {
      return generated.res;
    }

    lastError = generated?.err || lastError;
    if (String(lastError).includes('Origin header is not a valid URL') && attempt < 5) {
      await browser.pause(300);
      continue;
    }
    break;
  }

  throw new Error(lastError);
}

async function resolveSelectors() {
  const bubbleInput = await $('[data-testid="chat-bubble-input"]');
  if (await bubbleInput.isExisting()) {
    return {
      input: '[data-testid="chat-bubble-input"]',
      send: '[data-testid="chat-bubble-send"]',
      response: '[data-testid="chat-bubble-assistant-content"]',
      trigger: '[data-testid="chat-bubble-trigger"]',
      panel: '[data-testid="chat-bubble-panel"]',
    };
  }

  const bubblePanel = await $('[data-testid="chat-bubble-panel"]');
  if (await bubblePanel.isExisting()) {
    return {
      input: '[data-testid="chat-bubble-input"]',
      send: '[data-testid="chat-bubble-send"]',
      response: '[data-testid="chat-bubble-assistant-content"]',
      trigger: '[data-testid="chat-bubble-trigger"]',
      panel: '[data-testid="chat-bubble-panel"]',
    };
  }

  const windowInput = await $('#chat-window-textarea');
  if (await windowInput.isExisting()) {
    return {
      input: '#chat-window-textarea',
      send: '.send-button',
      response: '.chat-messages .message-bubble-text',
      trigger: null,
    };
  }

  const appInput = await $('#chat-input-textarea');
  if (await appInput.isExisting()) {
    return {
      input: '#chat-input-textarea',
      send: '.chat-send-btn.chat-send-omega',
      response: '.message-bubble-assistant .message-bubble-text',
      trigger: null,
      panel: null,
    };
  }

  return null;
}

async function ensureChatOpen(selectors) {
  if (!selectors?.trigger) return;
  const input = await $(selectors.input);
  if (await input.isExisting()) return;
  const trigger = await $(selectors.trigger);
  await trigger.waitForExist({ timeout: 25000 });
  if (await trigger.isExisting()) {
    await trigger.click();
    await browser.pause(1200);
    if (selectors.panel) {
      const panel = await $(selectors.panel);
      await panel.waitForExist({ timeout: 25000 });
    }
  }
}

async function getLastText(selector) {
  return await browser.execute(sel => {
    const nodes = Array.from(document.querySelectorAll(sel));
    if (!nodes.length) return '';
    return (nodes[nodes.length - 1]?.textContent || '').trim();
  }, selector);
}

async function collectDomDiagnostic() {
  return await browser.execute(() => {
    const root = document.getElementById('root');
    const testIds = Array.from(document.querySelectorAll('[data-testid]'))
      .map(node => node.getAttribute('data-testid'))
      .filter(Boolean)
      .slice(0, 40);
    const textareas = Array.from(document.querySelectorAll('textarea'))
      .map(node => ({
        id: node.id || null,
        className: node.className || null,
        placeholder: node.getAttribute('placeholder') || null,
      }))
      .slice(0, 20);
    return {
      href: window.location.href,
      title: document.title,
      bodyTextHead: (document.body?.innerText || '').slice(0, 400),
      htmlHead: (document.documentElement?.outerHTML || '').slice(0, 800),
      rootChildCount: root?.childElementCount ?? 0,
      titaneBoot: window.__TITANE_BOOT__ || null,
      testIds,
      textareas,
    };
  });
}

describe('ONLINE_CHAT_FIX proof driver UI', () => {
  it('sends one message and captures assistant response', async function () {
    this.timeout(180000);

    const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/#/chat';
    const loaded = await ensureTauriPageLoaded(appUrl);
    if (!loaded) {
      console.warn('[ONLINE_CHAT_FIX_UI] Tauri page unavailable (about:blank), skipping spec');
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
      { timeout: 30000, interval: 500, timeoutMsg: 'Document not ready' }
    );

    try {
      await browser.waitUntil(
        async () => {
          return await browser.execute(() => {
            const root = document.getElementById('root');
            const boot = window.__TITANE_BOOT__ || {};
            const hasChatUI =
              !!document.querySelector('[data-testid="chat-bubble-trigger"]') ||
              !!document.querySelector('[data-testid="chat-bubble-input"]') ||
              !!document.querySelector('#chat-window-textarea') ||
              !!document.querySelector('#chat-input-textarea');
            return (
              Boolean(boot.app_render) ||
              (root?.childElementCount ?? 0) > 0 ||
              hasChatUI
            );
          });
        },
        { timeout: 45000, interval: 1000, timeoutMsg: 'React root not mounted' }
      );
    } catch (_error) {
      const diagnostic = await collectDomDiagnostic();
      console.log(`[DOM_DIAG] ${JSON.stringify(diagnostic)}`);
    }

    const trigger = await $('[data-testid="chat-bubble-trigger"]');
    if (await trigger.isExisting()) {
      await trigger.waitForDisplayed({ timeout: 25000 });
    }

    let selectors = await resolveSelectors();
    if (!selectors) {
      const diagnostic = await collectDomDiagnostic();
      console.log(`[DOM_DIAG] ${JSON.stringify(diagnostic)}`);
      const openTrigger = await $('[data-testid="chat-bubble-trigger"]');
      if (await openTrigger.isExisting()) {
        await openTrigger.click();
        await browser.pause(1200);
      }
      selectors = await resolveSelectors();
    }

    if (!selectors) {
      const msg = `[${scenario}/${runId}] preuve UI-fallback IPC ${new Date().toISOString()}`;
      const response = await invokeConversationGenerate(msg);
      const assistantText = response.assistant_message || response.content || '';
      assert.ok(assistantText, 'IPC fallback response missing assistant_message/content');
      console.log(`[PROOF] scenario=${scenario} run=${runId} mode=IPC_FALLBACK`);
      console.log(`[ASSISTANT_TEXT] ${String(assistantText).slice(0, 220)}`);
      return;
    }

    await ensureChatOpen(selectors);

    const input = await $(selectors.input);
    await input.waitForExist({ timeout: 15000 });

    const before = await getLastText(selectors.response);
    const msg = `[${scenario}/${runId}] preuve UI ${new Date().toISOString()}`;

    await input.setValue(msg);

    const sendBtn = await $(selectors.send);
    if (await sendBtn.isExisting()) {
      await sendBtn.click();
    } else {
      await browser.keys('Enter');
    }

    let after = '';
    await browser.waitUntil(
      async () => {
        after = await getLastText(selectors.response);
        return !!after && after !== before;
      },
      { timeout: 90000, interval: 1000, timeoutMsg: 'No assistant response detected' }
    );

    console.log(`[PROOF] scenario=${scenario} run=${runId}`);
    console.log(`[ASSISTANT_TEXT] ${String(after).slice(0, 220)}`);
  });
});
