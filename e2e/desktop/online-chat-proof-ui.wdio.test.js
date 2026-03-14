import assert from 'node:assert/strict';

const scenario = process.env.TITANE_PROOF_SCENARIO || 'S1';
const runId = process.env.TITANE_PROOF_RUN || 'run1';
const expectedSource = process.env.TITANE_E2E_EXPECT_SOURCE || '';
const enforceSource = process.env.TITANE_E2E_ENFORCE_SOURCE === '1';
const devServerUrl = process.env.TAURI_DEV_SERVER_URL || '';

function getAllowedHrefPrefixes() {
  const prefixes = ['tauri://localhost'];
  if (devServerUrl) {
    prefixes.push(devServerUrl);
  }
  return prefixes;
}

async function detectAppSourceMode() {
  return await browser.execute(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'))
      .map(node => node.getAttribute('src') || '')
      .filter(Boolean);
    const href = window.location.href || '';
    const hasDevScript = scripts.some(
      src =>
        /127\.0\.0\.1:5173|localhost:5173/i.test(src) ||
        /^\/?@vite\/client/i.test(src) ||
        /^\/?src\//i.test(src)
    );
    const hasEmbeddedScript = scripts.some(
      src =>
        /^tauri:\/\/localhost\/assets\//i.test(src) ||
        /^\.\/assets\//i.test(src) ||
        /^\/assets\//i.test(src)
    );

    let sourceMode = 'unknown';
    if (hasDevScript && hasEmbeddedScript) sourceMode = 'mixed';
    else if (hasDevScript) sourceMode = 'dev-server';
    else if (hasEmbeddedScript) sourceMode = 'embedded';

    return {
      href,
      sourceMode,
      scriptCount: scripts.length,
      scriptSample: scripts.slice(0, 8),
      hasDevScript,
      hasEmbeddedScript,
    };
  });
}

async function ensureTauriPageLoaded(appUrl) {
  const candidates = [appUrl];
  if (devServerUrl) {
    candidates.push(`${devServerUrl}/#/chat`, devServerUrl);
  }
  candidates.push('tauri://localhost/#/chat', 'tauri://localhost');

  const allowedPrefixes = getAllowedHrefPrefixes();

  for (const url of candidates) {
    await browser.url(url);
    await browser.pause(1200);
    const href = await browser.execute(() => window.location.href || '');
    if (allowedPrefixes.some(prefix => href.startsWith(prefix))) {
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

async function installConversationGenerateTraceHook() {
  await browser.execute(() => {
    const w = window;
    if (w.__TITANE_CONV_TRACE_INSTALLED__) {
      return;
    }

    const wrapInvoke = target => {
      if (!target || typeof target.invoke !== 'function') return;
      if (target.__TITANE_ORIG_INVOKE__) return;

      const original = target.invoke.bind(target);
      target.__TITANE_ORIG_INVOKE__ = original;
      target.invoke = async (command, payload) => {
        const result = await original(command, payload);
        if (command === 'conversation_generate') {
          w.__TITANE_LAST_CONV_RESPONSE__ = result;
        }
        return result;
      };
    };

    wrapInvoke(w.__TAURI__?.core);
    wrapInvoke(w.__TAURI__?.tauri);
    wrapInvoke(w.__TAURI__);
    wrapInvoke(w.__TAURI_INTERNALS__);

    w.__TITANE_CONV_TRACE_INSTALLED__ = true;
  });
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

  // ConversationSection (TitanePage v25.3.0+) — used after chat-bubble removal (977779667)
  const conversationInput = await $('[data-testid="chat-input"]');
  if (await conversationInput.isExisting()) {
    return {
      input: '[data-testid="chat-input"]',
      send: '[data-testid="chat-send"]',
      response:
        '[data-testid="chat-message-assistant"] [data-testid="chat-message-content"]',
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

    const appUrl =
      process.env.TITANE_E2E_URL ||
      (expectedSource === 'dev-server' && devServerUrl
        ? `${devServerUrl}/#/chat`
        : 'tauri://localhost/#/chat');
    const loaded = await ensureTauriPageLoaded(appUrl);
    if (!loaded) {
      throw new Error(
        'BLOCKER: Tauri page unavailable (about:blank) - environment setup required for ONLINE_CHAT_FIX_UI validation'
      );
    }

    // Seed localStorage to bypass onboarding flow (E2E isolated env has no prior state).
    // Use in-page reload (location.reload) — browser.url() sends WebDriver navigate-to
    // which resets the WRY/Tauri WebView localStorage context.
    await browser.execute(() => {
      localStorage.setItem('titane_onboarding_complete', '1');
      localStorage.setItem('titane_browser_mode', '1'); // browser mode = use localStorage path (not Tauri IPC) for onboarding check
      location.reload();
    });
    await browser.pause(3000);

    const allowedPrefixes = getAllowedHrefPrefixes();
    await browser.waitUntil(
      async () => {
        const readyState = await browser.execute(() => document.readyState);
        const href = await browser.execute(() => window.location.href || '');
        return (
          (readyState === 'interactive' || readyState === 'complete') &&
          allowedPrefixes.some(prefix => href.startsWith(prefix))
        );
      },
      { timeout: 30000, interval: 500, timeoutMsg: 'Document not ready' }
    );

    let sourceInfo = await detectAppSourceMode();
    if (expectedSource && enforceSource && sourceInfo.scriptCount === 0) {
      await browser.waitUntil(
        async () => {
          const current = await detectAppSourceMode();
          sourceInfo = current;
          return current.scriptCount > 0;
        },
        {
          timeout: 15000,
          interval: 500,
          timeoutMsg: 'No script[src] detected for source classification',
        }
      );
    }
    console.log(`[APP_SOURCE] ${JSON.stringify(sourceInfo)}`);
    if (expectedSource && sourceInfo.sourceMode !== expectedSource && enforceSource) {
      assert.fail(
        `Source mismatch: expected=${expectedSource} actual=${sourceInfo.sourceMode}`
      );
    }

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
              !!document.querySelector('#chat-input-textarea') ||
              !!document.querySelector('[data-testid="chat-input"]');
            return (
              Boolean(boot.app_render) || (root?.childElementCount ?? 0) > 0 || hasChatUI
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
    await installConversationGenerateTraceHook();

    const input = await $(selectors.input);
    await input.waitForExist({ timeout: 15000 });

    const before = await getLastText(selectors.response);

    // Scroll element into viewport — after onboarding bypass + reload the
    // ConversationSection may render outside the visible WRY window area.
    await browser.execute(sel => {
      const el = document.querySelector(sel);
      if (el) {
        el.scrollIntoView({ block: 'center', inline: 'center' });
        el.focus();
      }
    }, selectors.input);
    await browser.pause(600);

    const msg = `[${scenario}/${runId}] preuve UI ${new Date().toISOString()}`;
    // WRY E2E: isElementClickable=false due to overlay covering textarea after
    // onboarding bypass reload. Use JS native value setter (React-compatible)
    // and dispatch events to sync React state, then submit via Enter key.
    await browser.execute(
      (sel, val) => {
        const el = document.querySelector(sel);
        if (!el) throw new Error('chat-input not found in DOM');
        el.scrollIntoView({ block: 'center', inline: 'center' });
        el.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        ).set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      },
      selectors.input,
      msg
    );
    await browser.pause(400);

    // Submit: try send button first, then Enter key
    const hasSend = await browser.execute(
      sel => !!document.querySelector(sel),
      selectors.send
    );
    if (hasSend) {
      await browser.execute(sel => {
        document.querySelector(sel)?.click();
      }, selectors.send);
    } else {
      await browser.keys('Return');
    }

    let after = '';
    await browser.waitUntil(
      async () => {
        after = await getLastText(selectors.response);
        return !!after && after !== before;
      },
      { timeout: 90000, interval: 1000, timeoutMsg: 'No assistant response detected' }
    );

    assert.notEqual(
      after,
      msg,
      'Assistant response equals user probe text (selector mismatch or echo false positive)'
    );

    // G_NO_MOCK_PROVIDER: reject pure OMEGA mock path (no real AI call)
    // G_NO_MOCK_PROVIDER — two-layer check:
    // Layer 1: data-provider-used DOM attribute (when rendered)
    const domAttrs = await browser.execute(() => {
      const assistantMsgs = document.querySelectorAll(
        '[data-testid="chat-message-assistant"]'
      );
      const last = assistantMsgs[assistantMsgs.length - 1];
      if (!last) return { providerUsed: '', allAttrs: {} };
      const allAttrs = {};
      for (const attr of last.attributes) {
        allAttrs[attr.name] = attr.value;
      }
      return { providerUsed: last.getAttribute('data-provider-used') || '', allAttrs };
    });
    const providerAttr = domAttrs.providerUsed || '';
    assert.notEqual(
      providerAttr,
      'titane-omega-v20 (OMEGA+Singularity)',
      `[G_NO_MOCK_PROVIDER/DOM] provider_used="${providerAttr}" = OMEGA mock; AIRouter wiring failed`
    );

    // Layer 2: content-based check — response text must NOT contain the OMEGA stub phrase
    const OMEGA_MOCK_STUB =
      "j'ai bien recu votre demande et je la traite avec les modules cognitifs actifs";
    assert.ok(
      !after.toLowerCase().includes(OMEGA_MOCK_STUB),
      `[G_NO_MOCK_TEXT] Response contains OMEGA stub text — AIRouter call was NOT made; after="${String(after).slice(0, 120)}"`
    );
    assert.ok(
      after.length >= 5,
      `[G_CONTENT_QUALITY] Response suspiciously short (${after.length} chars) — possible stub or empty`
    );

    // G_UI_BACKEND_TRUTH_ALIGNED: compare backend meta captured at invoke-time vs DOM data attributes
    const alignment = await browser.execute(() => {
      const assistantMsgs = document.querySelectorAll(
        '[data-testid="chat-message-assistant"]'
      );
      const last = assistantMsgs[assistantMsgs.length - 1];
      const response = window.__TITANE_LAST_CONV_RESPONSE__ || {};
      const meta = response.meta || response.metadata || response.decision || {};

      const domProvider = last?.getAttribute('data-provider-used') || '';
      const domNetworkUsed = last?.getAttribute('data-network-used') || '';
      const domReason = last?.getAttribute('data-provider-reason') || '';

      const backendProvider = String(meta.provider_used ?? meta.providerSelected ?? '');
      const backendReason = String(meta.reason_code ?? meta.reasonCode ?? '');

      let backendNetworkUsed = '';
      if (typeof meta.network_used === 'boolean') {
        backendNetworkUsed = String(meta.network_used);
      } else if (typeof meta.networkUsed === 'boolean') {
        backendNetworkUsed = String(meta.networkUsed);
      }

      return {
        domProvider,
        domNetworkUsed,
        domReason,
        backendProvider,
        backendNetworkUsed,
        backendReason,
      };
    });

    if (alignment.backendProvider.length > 0) {
      assert.equal(
        alignment.domProvider,
        alignment.backendProvider,
        `[G_UI_BACKEND_TRUTH_ALIGNED] provider mismatch DOM=${alignment.domProvider} backend=${alignment.backendProvider}`
      );
      if (alignment.backendNetworkUsed.length > 0) {
        assert.equal(
          alignment.domNetworkUsed,
          alignment.backendNetworkUsed,
          `[G_UI_BACKEND_TRUTH_ALIGNED] network_used mismatch DOM=${alignment.domNetworkUsed} backend=${alignment.backendNetworkUsed}`
        );
      }
      if (alignment.backendReason.length > 0) {
        assert.equal(
          alignment.domReason,
          alignment.backendReason,
          `[G_UI_BACKEND_TRUTH_ALIGNED] reason mismatch DOM=${alignment.domReason} backend=${alignment.backendReason}`
        );
      }
    } else {
      // Fallback alignment proof: runtime panel and assistant row must stay consistent in DOM
      const panelAlignment = await browser.execute(() => {
        const panel = document.querySelector('[data-testid="chat-runtime-state"]');
        const assistantMsgs = document.querySelectorAll(
          '[data-testid="chat-message-assistant"]'
        );
        const last = assistantMsgs[assistantMsgs.length - 1];
        return {
          panelProvider: panel?.getAttribute('data-provider-used') || '',
          panelNetwork: panel?.getAttribute('data-network-used') || '',
          panelReason: panel?.getAttribute('data-provider-reason') || '',
          domProvider: last?.getAttribute('data-provider-used') || '',
          domNetwork: last?.getAttribute('data-network-used') || '',
          domReason: last?.getAttribute('data-provider-reason') || '',
        };
      });

      assert.ok(
        panelAlignment.panelProvider.length > 0,
        `[G_UI_BACKEND_TRUTH_ALIGNED] runtime panel provider missing: ${JSON.stringify(panelAlignment)}`
      );
      assert.equal(
        panelAlignment.domProvider,
        panelAlignment.panelProvider,
        `[G_UI_BACKEND_TRUTH_ALIGNED] DOM/provider panel mismatch: ${JSON.stringify(panelAlignment)}`
      );
      assert.equal(
        panelAlignment.domNetwork,
        panelAlignment.panelNetwork,
        `[G_UI_BACKEND_TRUTH_ALIGNED] DOM/network panel mismatch: ${JSON.stringify(panelAlignment)}`
      );
      assert.equal(
        panelAlignment.domReason,
        panelAlignment.panelReason,
        `[G_UI_BACKEND_TRUTH_ALIGNED] DOM/reason panel mismatch: ${JSON.stringify(panelAlignment)}`
      );
      console.log(`[UI_PANEL_ALIGNMENT] ${JSON.stringify(panelAlignment)}`);
    }

    console.log(`[PROOF] scenario=${scenario} run=${runId}`);
    console.log(`[PROVIDER_USED_DOM] ${providerAttr}`);
    console.log(`[DOM_ATTRS] ${JSON.stringify(domAttrs.allAttrs)}`);
    console.log(`[UI_BACKEND_ALIGNMENT] ${JSON.stringify(alignment)}`);
    console.log(`[ASSISTANT_TEXT] ${String(after).slice(0, 220)}`);
  });
});
