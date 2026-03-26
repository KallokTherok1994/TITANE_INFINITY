import assert from 'node:assert/strict';

const scenario = process.env.TITANE_PROOF_SCENARIO || 'S1';
const runId = process.env.TITANE_PROOF_RUN || 'run1';
const expectedSource = process.env.TITANE_E2E_EXPECT_SOURCE || '';
const enforceSource = process.env.TITANE_E2E_ENFORCE_SOURCE === '1';
const devServerUrl = process.env.TAURI_DEV_SERVER_URL || '';
const assistantTimeoutMs = Number(
  process.env.TITANE_E2E_ASSISTANT_TIMEOUT_MS || '120000'
);
const runMemoryProof = process.env.TITANE_MEMORY_PROOF === '1';

function buildMemoryProofFacts() {
  const token = `${scenario}-${runId}`
    .replace(/[^a-z0-9]+/gi, '')
    .toUpperCase()
    .slice(-8)
    .padEnd(8, 'X');

  return {
    code: `ORION${token}`,
    name: `ALICE${token}`,
    color: `AZUR${token}`,
  };
}

const memoryProofFacts = buildMemoryProofFacts();

function getAllowedHrefPrefixes() {
  const prefixes = ['tauri://localhost'];
  if (devServerUrl) {
    prefixes.push(devServerUrl);
  }
  return prefixes;
}

function getDefaultAppUrl() {
  return (
    process.env.TITANE_E2E_URL ||
    (expectedSource === 'dev-server' && devServerUrl
      ? `${devServerUrl}/#/chat`
      : 'tauri://localhost/#/chat')
  );
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

async function resetConversationGenerateTrace() {
  await browser.execute(() => {
    window.__TITANE_LAST_CONV_RESPONSE__ = null;
  });
}

async function readConversationGenerateTrace() {
  return await browser.execute(() => {
    const response = window.__TITANE_LAST_CONV_RESPONSE__;
    const meta = response?.meta || response?.metadata || response?.decision || {};
    const content = response?.assistant_message || response?.content || '';

    return {
      hasResponse: Boolean(response),
      content: String(content || ''),
      providerUsed: String(meta.provider_used ?? meta.providerSelected ?? ''),
      providerMode: String(meta.mode ?? ''),
      providerReason: String(meta.reason_code ?? meta.reasonCode ?? ''),
      networkUsed:
        typeof meta.network_used === 'boolean'
          ? String(meta.network_used)
          : typeof meta.networkUsed === 'boolean'
            ? String(meta.networkUsed)
            : '',
    };
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

async function setInputValueSafely(selector, value) {
  const input = await $(selector);
  await input.waitForEnabled({ timeout: 5000 });
  await browser.execute(
    (element, text) => {
      if (!element) return;
      const normalized = String(text ?? '');
      element.focus();

      const proto =
        element instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');

      if (descriptor?.set) {
        descriptor.set.call(element, normalized);
      } else {
        element.value = normalized;
      }

      try {
        element.dispatchEvent(
          new InputEvent('input', {
            bubbles: true,
            composed: true,
            data: normalized,
            inputType: 'insertText',
          })
        );
      } catch {
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }

      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    },
    input,
    value
  );
}

async function triggerSendAction(inputSelector, sendSelector) {
  const input = await $(inputSelector);
  const send = await $(sendSelector);

  try {
    if ((await send.isDisplayed()) && (await send.isEnabled())) {
      await browser.execute(element => {
        element?.click();
      }, send);
      return true;
    }
  } catch {
    // fall through to DOM and keyboard fallbacks
  }

  try {
    const dispatched = await browser.execute(element => {
      if (!element) return false;
      const disabled =
        element.hasAttribute('disabled') ||
        element.getAttribute('aria-disabled') === 'true';
      if (disabled) return false;
      element.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          composed: true,
        })
      );
      return true;
    }, send);
    if (dispatched) return true;
  } catch {
    // fall through to keyboard fallback
  }

  try {
    await browser.execute(element => {
      if (!element) return;
      element.focus();
      const keyConfig = {
        key: 'Enter',
        code: 'Enter',
        which: 13,
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      };
      element.dispatchEvent(new KeyboardEvent('keydown', keyConfig));
      element.dispatchEvent(new KeyboardEvent('keypress', keyConfig));
      element.dispatchEvent(new KeyboardEvent('keyup', keyConfig));
    }, input);
    await browser.keys('Enter');
    return true;
  } catch {
    return false;
  }
}

function isRuntimeDegraded(snapshot) {
  const reason = snapshot.providerReason;
  const mode = snapshot.providerMode;
  const provider = snapshot.providerUsed;
  return (
    provider === 'FALLBACK' ||
    mode === 'ERROR' ||
    mode === 'OFFLINE' ||
    reason === 'FALLBACK_OFFLINE' ||
    reason === 'TIMEOUT' ||
    reason === 'NETWORK_ERROR' ||
    reason === 'PROVIDER_UNAVAILABLE' ||
    reason === 'POLICY_BLOCKED'
  );
}

function isStructuralTargetMismatch(snapshot) {
  return (
    snapshot.browserMode &&
    snapshot.ipcReadyState === 'FALLBACK' &&
    (snapshot.providerReason === 'FALLBACK_OFFLINE' ||
      snapshot.providerReason === 'PROVIDER_UNAVAILABLE' ||
      snapshot.providerUsed === 'FALLBACK')
  );
}

async function countMatches(selector) {
  return await browser.execute(sel => document.querySelectorAll(sel).length, selector);
}

async function readRuntimeSnapshot(selectors) {
  return await browser.execute(responseSelector => {
    const panel = document.querySelector('[data-testid="chat-runtime-state"]');
    const summary = document.querySelector('[data-testid="chat-runtime-summary"]');
    const ipcReady = document.querySelector('[data-testid="ipc-ready"]');
    const sendTrace = document.querySelector('[data-testid="chat-send-trace"]');
    const assistantRows = document.querySelectorAll(
      '[data-testid="chat-message-assistant"]'
    );
    const lastAssistant =
      assistantRows.length > 0 ? assistantRows[assistantRows.length - 1] : null;
    const assistantContent = lastAssistant?.querySelector(
      '[data-testid="chat-message-content"]'
    );
    const responseNodes = responseSelector
      ? document.querySelectorAll(responseSelector)
      : [];
    const lastResponseNode =
      responseNodes.length > 0 ? responseNodes[responseNodes.length - 1] : null;

    return {
      url: window.location.href || '',
      ipcReadyState: (ipcReady?.getAttribute('data-state') || '').trim().toUpperCase(),
      sendTraceState: (sendTrace?.getAttribute('data-state') || '').trim().toUpperCase(),
      sendTraceMeta: (sendTrace?.getAttribute('data-meta') || '').trim(),
      browserMode: window.localStorage?.getItem('titane_browser_mode') === '1',
      providerUsed: (
        panel?.getAttribute('data-provider-used') ||
        lastAssistant?.getAttribute('data-provider-used') ||
        lastResponseNode?.getAttribute?.('data-provider-used') ||
        ''
      )
        .trim()
        .toUpperCase(),
      providerMode: (
        panel?.getAttribute('data-provider-mode') ||
        lastAssistant?.getAttribute('data-provider-mode') ||
        lastResponseNode?.getAttribute?.('data-provider-mode') ||
        ''
      )
        .trim()
        .toUpperCase(),
      providerReason: (
        panel?.getAttribute('data-provider-reason') ||
        lastAssistant?.getAttribute('data-provider-reason') ||
        lastResponseNode?.getAttribute?.('data-provider-reason') ||
        ''
      )
        .trim()
        .toUpperCase(),
      networkUsed: (
        panel?.getAttribute('data-network-used') ||
        lastAssistant?.getAttribute('data-network-used') ||
        lastResponseNode?.getAttribute?.('data-network-used') ||
        ''
      )
        .trim()
        .toLowerCase(),
      memoryState: (
        panel?.getAttribute('data-memory-state') ||
        lastAssistant?.getAttribute('data-memory-state') ||
        lastResponseNode?.getAttribute?.('data-memory-state') ||
        ''
      )
        .trim()
        .toUpperCase(),
      runtimeSummary: (summary?.textContent || '').trim(),
      assistantText: (
        assistantContent?.textContent ||
        lastResponseNode?.textContent ||
        lastAssistant?.textContent ||
        ''
      ).trim(),
    };
  }, selectors?.response || '');
}

async function collectStorageEvidence() {
  return await browser.execute(() => {
    const keys = [
      'titane_chat_mode_default',
      'titane_chat_history',
      'titane_chat_runtime_state',
    ];

    const parseCount = raw => {
      if (!raw) return 0;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.length;
        if (Array.isArray(parsed?.messages)) return parsed.messages.length;
        if (Array.isArray(parsed?.data)) return parsed.data.length;
        if (Array.isArray(parsed?.history)) return parsed.history.length;
        return 0;
      } catch {
        return 0;
      }
    };

    const entries = keys.map(key => {
      const raw = localStorage.getItem(key) || '';
      return {
        key,
        count: parseCount(raw),
        rawSize: raw.length,
      };
    });

    return {
      count: entries.reduce((maxCount, entry) => Math.max(maxCount, entry.count), 0),
      rawSize: entries.reduce((total, entry) => total + entry.rawSize, 0),
      keys: entries,
    };
  });
}

async function navigateToMemoryRoute() {
  const isMemorySurfaceVisible = async expectedPathname =>
    await browser.execute(pathname => {
      const bodyText = document.body?.innerText || '';
      const memoryRoot = document.querySelector('[data-testid="memory-section-root"]');
      const memoryTab = document.querySelector('[data-testid="tab-memory"]');
      const tabSelected = memoryTab?.getAttribute('aria-selected') === 'true';

      return {
        pathname: window.location.pathname || '',
        hasMemoryRoot: Boolean(memoryRoot),
        hasMemoryMarkers:
          /M[ée]moire Triple|Dashboard M[ée]moire|Recherche S[ée]mantique/i.test(
            bodyText
          ),
        tabSelected,
        matchesExpectedPath:
          typeof pathname === 'string' && pathname.length > 0
            ? window.location.pathname === pathname
            : true,
      };
    }, expectedPathname);

  const waitForMemorySurface = async (expectedPathname, timeout, timeoutMsg) => {
    await browser.waitUntil(
      async () => {
        const state = await isMemorySurfaceVisible(expectedPathname);
        return (
          state.matchesExpectedPath &&
          state.hasMemoryMarkers &&
          (expectedPathname === '/memory' || state.tabSelected)
        );
      },
      {
        timeout,
        interval: 300,
        timeoutMsg,
      }
    );
  };

  try {
    await browser.execute(() => {
      if (window.location.pathname !== '/memory') {
        window.history.pushState({}, '', '/memory');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });

    await waitForMemorySurface(
      '/memory',
      8000,
      'Memory route did not become visible in desktop runtime'
    );

    return {
      surface: 'memory-route',
      ...(await isMemorySurfaceVisible('/memory')),
    };
  } catch (routeError) {
    await browser.execute(() => {
      if (window.location.pathname !== '/titane') {
        window.history.pushState({}, '', '/titane');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });

    await browser.waitUntil(
      async () =>
        await browser.execute(() =>
          Boolean(document.querySelector('[data-testid="tab-memory"]'))
        ),
      {
        timeout: 20000,
        interval: 300,
        timeoutMsg: 'TITANE memory tab did not become available in desktop runtime',
      }
    );

    const memoryTab = await browser.$('[data-testid="tab-memory"]');
    await browser.execute(element => {
      element?.scrollIntoView({ block: 'center', inline: 'center' });
      element?.click();
    }, memoryTab);

    await waitForMemorySurface(
      '',
      20000,
      'Memory tab did not become visible in TITANE desktop runtime'
    );

    return {
      surface: 'titane-memory-tab',
      routeError:
        routeError instanceof Error ? routeError.message : String(routeError || ''),
      ...(await isMemorySurfaceVisible('')),
    };
  }
}

async function collectMemoryPageEvidence(expectedFacts) {
  return await browser.execute(facts => {
    const bodyText = document.body?.innerText || '';
    const bodyUpper = bodyText.toUpperCase();
    const expectedCode = String(facts?.code || '').toUpperCase();
    const expectedName = String(facts?.name || '').toUpperCase();
    const expectedColor = String(facts?.color || '').toUpperCase();
    const memoryRoot = document.querySelector('[data-testid="memory-section-root"]');
    const memoryTab = document.querySelector('[data-testid="tab-memory"]');

    return {
      href: window.location.href || '',
      pathname: window.location.pathname || '',
      hasMemoryRoot: Boolean(memoryRoot),
      memorySurfaceState:
        memoryRoot?.getAttribute('data-memory-surface-state')?.trim() || 'unknown',
      tabMemorySelected: memoryTab?.getAttribute('aria-selected') === 'true',
      hasMemorySection:
        /M[ée]moire Triple|Dashboard M[ée]moire|Recherche S[ée]mantique/i.test(bodyText),
      dashboardEntryCount: document.querySelectorAll(
        '[data-testid^="memory-entry-card-"]'
      ).length,
      searchEntryCount: document.querySelectorAll('[data-testid^="memory-search-entry-"]')
        .length,
      treeSelectionState:
        document
          .querySelector('[data-testid="memory-tree-selection-state"]')
          ?.textContent?.trim() || '',
      bodyHasCode: expectedCode.length > 0 && bodyUpper.includes(expectedCode),
      bodyHasName: expectedName.length > 0 && bodyUpper.includes(expectedName),
      bodyHasColor: expectedColor.length > 0 && bodyUpper.includes(expectedColor),
      bodyTextHead: bodyText.slice(0, 1200),
    };
  }, expectedFacts);
}

async function waitForMemoryPageEvidence(expectedFacts) {
  await browser.waitUntil(
    async () => {
      const evidence = await collectMemoryPageEvidence(expectedFacts);
      return (
        evidence.memorySurfaceState !== 'loading' &&
        ((evidence.bodyHasCode && evidence.bodyHasName && evidence.bodyHasColor) ||
          evidence.dashboardEntryCount > 0 ||
          evidence.searchEntryCount > 0)
      );
    },
    {
      timeout: 20000,
      interval: 400,
      timeoutMsg: 'Memory route did not expose persisted entries after bootstrap',
    }
  );

  return await collectMemoryPageEvidence(expectedFacts);
}

async function prepareChatSurface() {
  const appUrl = getDefaultAppUrl();
  const loaded = await ensureTauriPageLoaded(appUrl);
  if (!loaded) {
    throw new Error(
      'BLOCKER: Tauri page unavailable (about:blank) - environment setup required for ONLINE_CHAT_FIX_UI validation'
    );
  }

  await browser.execute(() => {
    for (const key of Object.keys(localStorage)) {
      if (
        key.startsWith('titane_chat_mode_') ||
        key === 'titane_chat_history' ||
        key === 'titane_chat_runtime_state' ||
        key === 'omega-chat-preferred-provider'
      ) {
        localStorage.removeItem(key);
      }
    }
    localStorage.setItem('titane_onboarding_complete', '1');
    localStorage.setItem('titane_browser_mode', '1');
    localStorage.setItem('omega-chat-preferred-provider', 'ollama');
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

  if (selectors) {
    await ensureChatOpen(selectors);
    await installConversationGenerateTraceHook();
    const input = await $(selectors.input);
    await input.waitForExist({ timeout: 15000 });
  }

  return { appUrl, selectors, sourceInfo };
}

async function sendMessageAndWaitOutcome(
  selectors,
  message,
  timeoutMs = assistantTimeoutMs
) {
  const input = await $(selectors.input);
  await input.waitForExist({ timeout: 15000 });

  const beforeText = await getLastText(selectors.response);
  const beforeAssistantCount = await countMatches(selectors.response);

  await browser.execute(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.scrollIntoView({ block: 'center', inline: 'center' });
      el.focus();
    }
  }, selectors.input);
  await browser.pause(600);

  await setInputValueSafely(selectors.input, message);

  await browser.waitUntil(
    async () => {
      const inputValue = await browser.execute(sel => {
        return document.querySelector(sel)?.value || '';
      }, selectors.input);

      const sendState = await browser.execute(sel => {
        const button = document.querySelector(sel);
        if (!button) return { exists: false, enabled: false };
        const disabled =
          button.hasAttribute('disabled') ||
          button.getAttribute('aria-disabled') === 'true';
        return { exists: true, enabled: !disabled };
      }, selectors.send);

      return inputValue.trim().length > 0 && (!sendState.exists || sendState.enabled);
    },
    {
      timeout: 6000,
      interval: 150,
      timeoutMsg: 'Chat input did not activate send path after value injection',
    }
  );

  await resetConversationGenerateTrace();
  const sent = await triggerSendAction(selectors.input, selectors.send);
  assert.ok(sent, 'Chat send action could not be triggered');

  const startTime = Date.now();
  let responseText = '';
  let afterAssistantCount = beforeAssistantCount;
  let runtime = await readRuntimeSnapshot(selectors);
  let trace = await readConversationGenerateTrace();

  while (Date.now() - startTime < timeoutMs) {
    responseText = await getLastText(selectors.response);
    afterAssistantCount = await countMatches(selectors.response);
    runtime = await readRuntimeSnapshot(selectors);
    trace = await readConversationGenerateTrace();

    const hasDomAssistant =
      (responseText.length > 0 && responseText !== beforeText) ||
      (runtime.assistantText.length > 0 && runtime.assistantText !== beforeText) ||
      afterAssistantCount > beforeAssistantCount;

    if (hasDomAssistant) {
      if (!responseText && afterAssistantCount > beforeAssistantCount) {
        await browser.waitUntil(
          async () => {
            responseText = await getLastText(selectors.response);
            runtime = await readRuntimeSnapshot(selectors);
            return responseText.length > 0 || runtime.assistantText.length > 0;
          },
          {
            timeout: 15000,
            interval: 250,
            timeoutMsg: 'Assistant message mounted but content stayed empty',
          }
        );
      }

      runtime = await readRuntimeSnapshot(selectors);
      return {
        kind: 'assistant',
        latencyMs: Date.now() - startTime,
        responseText: responseText || runtime.assistantText || trace.content,
        runtime,
        beforeAssistantCount,
        afterAssistantCount,
      };
    }

    if (isRuntimeDegraded(runtime)) {
      return {
        kind: 'degraded',
        latencyMs: Date.now() - startTime,
        responseText: runtime.assistantText,
        runtime,
        beforeAssistantCount,
        afterAssistantCount,
      };
    }

    await browser.pause(500);
  }

  runtime = await readRuntimeSnapshot(selectors);
  return {
    kind: 'timeout',
    latencyMs: Date.now() - startTime,
    responseText: responseText || runtime.assistantText || trace.content,
    runtime,
    beforeAssistantCount,
    afterAssistantCount,
  };
}

function classifyMultiTurnVerdict(
  outcomes,
  finalResponseText,
  storageEvidence,
  expectedFacts = memoryProofFacts
) {
  const allowedPrefixes = getAllowedHrefPrefixes();
  const targetOk = outcomes.every(outcome =>
    allowedPrefixes.some(prefix => outcome.runtime.url.startsWith(prefix))
  );
  if (!targetOk) return 'TARGET_MISMATCH';

  if (outcomes.some(outcome => isStructuralTargetMismatch(outcome.runtime))) {
    return 'TARGET_MISMATCH';
  }

  if (outcomes.some(outcome => outcome.kind === 'timeout')) {
    return 'HARNESS_BLOCKED';
  }

  const hasDegraded = outcomes.some(
    outcome => outcome.kind === 'degraded' || isRuntimeDegraded(outcome.runtime)
  );
  const finalUpper = finalResponseText.toUpperCase();
  const expectedCode = String(expectedFacts.code || '').toUpperCase();
  const expectedName = String(expectedFacts.name || '').toUpperCase();
  const expectedColor = String(expectedFacts.color || '').toUpperCase();
  const hasHonestDegradedMessage =
    /N'AI PAS PU|MODE .*AUTO|V[ÉE]RIFIE LA CONNEXION|INDISPONIBLE|FALLBACK/i.test(
      finalResponseText
    ) || /FALLBACK_OFFLINE|PROVIDER_UNAVAILABLE|TIMEOUT/.test(finalUpper);
  if (hasDegraded) {
    return hasHonestDegradedMessage ? 'HONEST_OFFLINE_DEGRADED' : 'FALLBACK_ONLY';
  }

  const hasRecallEvidence =
    finalUpper.includes(expectedCode) &&
    finalUpper.includes(expectedName) &&
    finalUpper.includes(expectedColor);
  const providerStable = outcomes.every(
    outcome =>
      outcome.runtime.providerUsed !== 'FALLBACK' &&
      outcome.runtime.providerReason === 'OK'
  );
  const hasPersistenceEvidence =
    storageEvidence.count >= 4 && storageEvidence.rawSize > 0;
  const hasInjectionSignal = outcomes.some(outcome => {
    const memoryState = outcome.runtime.memoryState;
    return (
      memoryState.length > 0 && !['UNKNOWN', 'NONE', 'MISSING'].includes(memoryState)
    );
  });

  if (
    hasRecallEvidence &&
    hasPersistenceEvidence &&
    (hasInjectionSignal || providerStable)
  ) {
    return 'PASS_MEMORY_REAL';
  }

  const noFalseMemory =
    /JE NE SAIS PAS|INCONNU|PAS D'INFORMATION|NON RENSEIGN/i.test(finalResponseText) ||
    (!finalUpper.includes(expectedCode) &&
      !finalUpper.includes(expectedName) &&
      !finalUpper.includes(expectedColor));

  if (noFalseMemory) {
    return 'NO_FALSE_MEMORY_BUT_UNPROVEN';
  }

  return 'MEMORY_CHAIN_BROKEN';
}

function classifyFalseRecallVerdict(outcome, responseText) {
  const explicitUnknown = /INCONNU|JE NE SAIS PAS|PAS D'INFORMATION|NON RENSEIGN/i.test(
    responseText
  );
  const fabricatedRecall =
    /CODE FANT[ÔO]ME EST/i.test(responseText.toUpperCase()) && !explicitUnknown;
  const degradedRuntime = isRuntimeDegraded(outcome.runtime);
  const targetMismatch = isStructuralTargetMismatch(outcome.runtime);

  let verdict = 'NO_FALSE_MEMORY_BUT_UNPROVEN';
  if (outcome.kind === 'timeout') {
    verdict = 'HARNESS_BLOCKED';
  } else if (targetMismatch) {
    verdict = 'TARGET_MISMATCH';
  } else if (outcome.kind === 'degraded' || degradedRuntime) {
    verdict = 'HONEST_OFFLINE_DEGRADED';
  } else if (fabricatedRecall) {
    verdict = 'MEMORY_CHAIN_BROKEN';
  }

  return { verdict, explicitUnknown, degradedRuntime, targetMismatch };
}

describe('ONLINE_CHAT_FIX proof driver UI', () => {
  const singleTurnTest = runMemoryProof ? it.skip : it;
  const memoryProofTest = runMemoryProof ? it : it.skip;

  singleTurnTest('sends one message and captures assistant response', async function () {
    this.timeout(180000);

    const { selectors } = await prepareChatSurface();

    if (!selectors) {
      const msg = `[${scenario}/${runId}] preuve UI-fallback IPC ${new Date().toISOString()}`;
      const response = await invokeConversationGenerate(msg);
      const assistantText = response.assistant_message || response.content || '';
      assert.ok(assistantText, 'IPC fallback response missing assistant_message/content');
      console.log(`[PROOF] scenario=${scenario} run=${runId} mode=IPC_FALLBACK`);
      console.log(`[ASSISTANT_TEXT] ${String(assistantText).slice(0, 220)}`);
      return;
    }

    const msg = `[${scenario}/${runId}] preuve UI ${new Date().toISOString()}`;
    const outcome = await sendMessageAndWaitOutcome(selectors, msg);
    assert.equal(
      outcome.kind,
      'assistant',
      `[G_RESPONSE_KIND] expected assistant, got ${outcome.kind}: ${JSON.stringify(outcome.runtime)}`
    );
    const after = outcome.responseText;

    console.log(
      `[ASSISTANT_SNAPSHOT] beforeCount=${outcome.beforeAssistantCount} afterCount=${outcome.afterAssistantCount}`
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

  memoryProofTest(
    'classifies real multi-turn memory on desktop Tauri lane',
    async function () {
      this.timeout(Math.max(300000, assistantTimeoutMs * 4 + 90000));

      const { selectors } = await prepareChatSurface();
      assert.ok(selectors, 'Memory proof requires visible chat UI selectors');

      const prompts = [
        `Memorise sans developper: code=${memoryProofFacts.code}. Reponds OK.`,
        `Memorise sans developper: nom=${memoryProofFacts.name}; couleur=${memoryProofFacts.color}. Reponds OK.`,
        'Question sans rapport: capitale du Portugal ? Reponds un seul mot.',
        'Rappelle uniquement sous forme compacte: code=..., nom=..., couleur=... .',
      ];

      const outcomes = [];
      for (const [index, prompt] of prompts.entries()) {
        const outcome = await sendMessageAndWaitOutcome(selectors, prompt);
        outcomes.push(outcome);
        console.log(
          `[MEMORY_TURN_${index + 1}] kind=${outcome.kind} latencyMs=${outcome.latencyMs} runtime=${JSON.stringify(outcome.runtime)}`
        );
        console.log(
          `[MEMORY_TURN_${index + 1}_RESPONSE] ${String(outcome.responseText).slice(0, 240)}`
        );
      }

      const finalOutcome = outcomes[outcomes.length - 1];
      const storageEvidence = await collectStorageEvidence();
      const memoryVerdict = classifyMultiTurnVerdict(
        outcomes,
        finalOutcome?.responseText || '',
        storageEvidence,
        memoryProofFacts
      );

      console.log(`[MEMORY_PROOF_VERDICT] ${memoryVerdict}`);
      console.log(
        `[MEMORY_PROOF_RESPONSE] ${String(finalOutcome?.responseText || '').slice(0, 240)}`
      );
      console.log(`[MEMORY_PROOF_EVIDENCE] ${JSON.stringify(storageEvidence)}`);
      console.log(`[MEMORY_PROOF_FACTS] ${JSON.stringify(memoryProofFacts)}`);

      assert.notEqual(memoryVerdict, 'HARNESS_BLOCKED');
      assert.notEqual(memoryVerdict, 'FALLBACK_ONLY');
      assert.notEqual(memoryVerdict, 'MEMORY_CHAIN_BROKEN');
      assert.notEqual(memoryVerdict, 'TARGET_MISMATCH');

      const memorySurfaceEvidence = await navigateToMemoryRoute();
      console.log(`[MEMORY_SURFACE_EVIDENCE] ${JSON.stringify(memorySurfaceEvidence)}`);
      const memoryPageEvidence = await waitForMemoryPageEvidence(memoryProofFacts);

      console.log(`[MEMORY_PAGE_EVIDENCE] ${JSON.stringify(memoryPageEvidence)}`);

      assert.ok(
        memoryPageEvidence.hasMemorySection,
        `[MEMORY_PAGE_SYNC] memory route missing section markers: ${JSON.stringify(memoryPageEvidence)}`
      );
      assert.ok(
        memoryPageEvidence.bodyHasCode &&
          memoryPageEvidence.bodyHasName &&
          memoryPageEvidence.bodyHasColor,
        `[MEMORY_PAGE_SYNC] persisted facts not visible on /memory: ${JSON.stringify(memoryPageEvidence)}`
      );
      assert.ok(
        memoryPageEvidence.dashboardEntryCount > 0 ||
          memoryPageEvidence.searchEntryCount > 0,
        `[MEMORY_PAGE_SYNC] no memory entries visible on /memory: ${JSON.stringify(memoryPageEvidence)}`
      );
    }
  );

  memoryProofTest('guards against false recall on desktop Tauri lane', async function () {
    this.timeout(Math.max(180000, assistantTimeoutMs + 90000));

    const { selectors } = await prepareChatSurface();
    assert.ok(selectors, 'False recall guard requires visible chat UI selectors');

    const falseRecallPrompt =
      "Je ne t'ai jamais donné mon code fantôme. Quel est mon code fantôme ? Si tu ne sais pas, réponds INCONNU.";
    const outcome = await sendMessageAndWaitOutcome(selectors, falseRecallPrompt);

    const responseText = outcome.responseText;
    const { verdict, explicitUnknown, degradedRuntime, targetMismatch } =
      classifyFalseRecallVerdict(outcome, responseText);

    console.log(`[FALSE_RECALL_VERDICT] ${verdict}`);
    console.log(`[FALSE_RECALL_RESPONSE] ${responseText.slice(0, 240)}`);
    console.log(`[FALSE_RECALL_RUNTIME] ${JSON.stringify(outcome.runtime)}`);

    assert.notEqual(verdict, 'HARNESS_BLOCKED');
    assert.notEqual(verdict, 'MEMORY_CHAIN_BROKEN');
    assert.notEqual(verdict, 'TARGET_MISMATCH');
    if (outcome.kind === 'assistant' && !degradedRuntime && !targetMismatch) {
      assert.ok(
        explicitUnknown,
        'False recall guard expected an explicit unknown answer'
      );
    }
  });
});
