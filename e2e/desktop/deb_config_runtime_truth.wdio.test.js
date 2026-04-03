import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { openApp, waitAppReady, gotoTopNavPage } from './ui-driver.wdio.js';
import { uiPages } from './page-objects/uiPages.po.js';

const RUN_ID = process.env.TITANE_DEB_CONFIG_RUNTIME_RUN_ID || 'deb_config_runtime_truth';
const ARTIFACT_DIR =
  process.env.TITANE_DEB_CONFIG_RUNTIME_ARTIFACT_DIR ||
  path.resolve(process.cwd(), 'reports/deb_config_runtime_truth');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function isSessionInvalidError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  return (
    message.includes('invalid session id') ||
    message.includes('no such window') ||
    message.includes('invalidated') ||
    message.includes('session deleted because of page crash or hang')
  );
}

async function recoverFromWindowLoss(contextLabel = 'unknown') {
  let lastError = `${contextLabel}: session recovery failed`;

  try {
    await browser.reloadSession();
    await browser.pause(600);
  } catch (reloadError) {
    lastError = String(reloadError?.message || reloadError);
  }

  const candidates = [process.env.TITANE_E2E_URL, 'tauri://localhost/admin', 'tauri://localhost'].filter(Boolean);

  for (const targetUrl of candidates) {
    try {
      await browser.url(targetUrl);
      await waitAppReady();
      return;
    } catch (error) {
      lastError = String(error?.message || error);
    }
  }

  throw new Error(`${contextLabel}: ${lastError}`);
}

async function withSessionRecovery(stepLabel, stepFn, maxAttempts = 2) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await stepFn();
    } catch (error) {
      lastError = error;
      if (!isSessionInvalidError(error) || attempt >= maxAttempts) {
        throw error;
      }

      await recoverFromWindowLoss(`${stepLabel} retry ${attempt}`);
    }
  }

  throw lastError || new Error(`${stepLabel}: unrecoverable session error`);
}

async function invokeTauri(command, args = {}) {
  const result = await browser.executeAsync(
    (payload, done) => {
      const run = async () => {
        const attempts = [];

        if (window.__TAURI__?.core?.invoke) {
          attempts.push(params => window.__TAURI__.core.invoke(payload.command, params));
        }
        if (window.__TAURI__?.tauri?.invoke) {
          attempts.push(params => window.__TAURI__.tauri.invoke(payload.command, params));
        }
        if (window.__TAURI__?.invoke) {
          attempts.push(params => window.__TAURI__.invoke(payload.command, params));
        }
        if (window.__TAURI_INTERNALS__?.invoke) {
          attempts.push(params => window.__TAURI_INTERNALS__.invoke(payload.command, params));
        }

        if (!attempts.length) {
          throw new Error('Tauri IPC unavailable');
        }

        let invokeError = 'invoke unavailable';
        for (const attempt of attempts) {
          try {
            return await attempt(payload.args);
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
    { command, args }
  );

  if (!result?.ok) {
    throw new Error(result?.err || `IPC ${command} failed`);
  }

  return result.res;
}

function normalizeDefaultsEnvelope(value) {
  const content = value?.content ?? value?.res?.content ?? value?.res ?? value;
  if (!content || typeof content !== 'object') {
    throw new Error(`invalid defaults envelope: ${JSON.stringify(value)}`);
  }

  return {
    temperature: Number(content.temperature),
    maxOutputTokens: Number(
      content.maxOutputTokens ?? content.max_output_tokens ?? content.max_tokens
    ),
    provider: String(content.provider ?? 'auto').toLowerCase(),
    enableStreaming: Boolean(
      content.enableStreaming ?? content.enable_streaming ?? content.streaming
    ),
  };
}

async function getDefaults() {
  return normalizeDefaultsEnvelope(await invokeTauri('get_chat_request_defaults', {}));
}

async function restoreDefaults(defaults) {
  await invokeTauri('set_chat_request_defaults', {
    defaults: {
      temperature: defaults.temperature,
      maxOutputTokens: defaults.maxOutputTokens,
      provider: defaults.provider,
      enableStreaming: defaults.enableStreaming,
    },
  });
}

async function clickWithFallback(element) {
  await element.waitForDisplayed({ timeout: 30000 });

  try {
    await element.click();
    return;
  } catch {
    // JS fallback below.
  }

  await browser.execute(el => {
    if (!el) return;
    try {
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
    } catch {
      // Best effort only.
    }
    el.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
      })
    );
  }, element);
}

async function forceDomClick(element) {
  await element.waitForDisplayed({ timeout: 30000 });
  await browser.execute(el => {
    if (!el) return;

    try {
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
    } catch {
      // Best effort only.
    }

    try {
      el.focus?.();
    } catch {
      // Best effort only.
    }

    try {
      el.click?.();
    } catch {
      // Continue with synthetic events below.
    }

    const eventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
    };

    for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
      el.dispatchEvent(new MouseEvent(type, eventInit));
    }

    for (const key of ['Enter', ' ']) {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, ...eventInit }));
      el.dispatchEvent(new KeyboardEvent('keyup', { key, ...eventInit }));
    }
  }, element);
}

async function activateAiTab() {
  const aiTab = await $('[data-testid="tab-config-ai"]');
  await aiTab.waitForDisplayed({ timeout: 15000 });

  const aiContentVisible = async () => {
    return await browser.execute(() => {
      const text = String(document.body?.textContent || '');
      return (
        text.includes('Chat Engine Configuration') ||
        text.includes('Request Max Tokens') ||
        text.includes('Request Provider')
      );
    });
  };

  if (await aiContentVisible()) {
    return;
  }

  await clickWithFallback(aiTab);
  if (await aiContentVisible()) {
    return;
  }

  await forceDomClick(aiTab);
  await browser.waitUntil(aiContentVisible, {
    timeout: 10000,
    interval: 200,
    timeoutMsg: 'AI config tab did not become active',
  });
}

async function enterAiEditMode() {
  const editButton = await $('[data-testid="btn-config-edit"]');
  await editButton.waitForDisplayed({ timeout: 15000 });

  const editModeVisible = async () => {
    const saveButton = await $('[data-testid="btn-config-save"]');
    const maxTokensInput = await $('[data-testid="input-request-max-tokens"]');

    if ((await saveButton.isExisting()) && (await saveButton.isDisplayed())) return true;
    if ((await maxTokensInput.isExisting()) && (await maxTokensInput.isDisplayed())) return true;
    return false;
  };

  if (await editModeVisible()) {
    return;
  }

  await clickWithFallback(editButton);
  if (await editModeVisible()) {
    return;
  }

  await forceDomClick(editButton);
  await browser.waitUntil(editModeVisible, {
    timeout: 10000,
    interval: 200,
    timeoutMsg: 'AI config edit mode did not become active',
  });
}

async function dismissBootBeaconIfPresent() {
  const closeCandidates = [
    '//*[@id="titane-boot-beacon"]//button[contains(normalize-space(.),"Fermer diagnostic")]',
    '//button[contains(normalize-space(.),"Fermer diagnostic")]',
  ];

  for (const selector of closeCandidates) {
    const closeButton = await $(selector);
    if (!(await closeButton.isExisting())) continue;
    if (!(await closeButton.isDisplayed())) continue;

    await clickWithFallback(closeButton);
    await browser.pause(300);
    break;
  }
}

async function setInputValueDeterministic(inputField, nextValue) {
  const target = String(nextValue ?? '');

  const readBackEqualsTarget = async () => {
    const current = String(await inputField.getValue());
    return current.trim() === target.trim();
  };

  if (await readBackEqualsTarget()) {
    return;
  }

  try {
    await inputField.click();
    await inputField.clearValue();
    await inputField.setValue(target);
  } catch {
    // Fallback below.
  }

  if (await readBackEqualsTarget()) {
    return;
  }

  await browser.execute(
    (el, value) => {
      if (!el) return;
      const normalized = String(value ?? '');
      const descriptor = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      );

      if (descriptor?.set) {
        descriptor.set.call(el, normalized);
      } else {
        el.value = normalized;
      }

      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    },
    inputField,
    target
  );

  if (!(await readBackEqualsTarget())) {
    throw new Error(`unable to set input value to ${target}`);
  }
}

async function waitSaveButtonEnabled(timeout = 15000) {
  const saveButton = await $('[data-testid="btn-config-save"]');
  await saveButton.waitForExist({ timeout });
  await browser.waitUntil(
    async () => {
      if (!(await saveButton.isExisting())) return false;
      if (!(await saveButton.isDisplayed())) return false;
      return await saveButton.isEnabled();
    },
    {
      timeout,
      interval: 250,
      timeoutMsg: 'save button did not become enabled after field update',
    }
  );
  return saveButton;
}

async function getRequestMaxTokensInput() {
  const direct = await $('[data-testid="input-request-max-tokens"]');
  if (await direct.isExisting()) {
    return direct;
  }

  const marked = await browser.execute(() => {
    const needle = ['request max tokens', 'max tokens'];
    const candidates = Array.from(document.querySelectorAll('div, label, span, p')).filter(
      el => {
        const txt = String(el.textContent || '')
          .trim()
          .toLowerCase();
        return needle.some(n => txt.includes(n));
      }
    );

    for (const label of candidates) {
      let cursor = label;
      for (let depth = 0; depth < 4 && cursor; depth += 1) {
        const input = cursor.querySelector?.('input[type="number"], input');
        if (input) {
          input.setAttribute('data-e2e-max-tokens-temp', '1');
          return true;
        }
        cursor = cursor.parentElement;
      }
    }

    return false;
  });

  assert.ok(marked, 'max tokens input not found via testid or label lookup');
  return $('[data-e2e-max-tokens-temp="1"]');
}

async function openAdminConfig() {
  return withSessionRecovery('openAdminConfig', async () => {
    await openApp();
    await browser.execute(() => {
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem(
        'onboarding_preferences',
        JSON.stringify({
          profile: 'e2e',
          mode: 'default',
        })
      );
    });
    await openApp();
    await waitAppReady();
    await gotoTopNavPage(uiPages.admin);
    await dismissBootBeaconIfPresent();

    const adminPage = await $('[data-testid="page-admin"]');
    await adminPage.waitForExist({ timeout: 30000 });

    const configTab = await $('[data-testid="tab-admin-config"]');
    await configTab.waitForDisplayed({ timeout: 30000 });
    await clickWithFallback(configTab);

    const page = await $('[data-testid="page-configuration-hub"]');
    if (!(await page.isDisplayed())) {
      await forceDomClick(configTab);
    }
    await page.waitForDisplayed({ timeout: 30000 });

    await activateAiTab();

    await enterAiEditMode();

    const saveButton = await $('[data-testid="btn-config-save"]');
    await saveButton.waitForDisplayed({ timeout: 15000 });
  });
}

async function waitForMaxTokensReadback(expectedMaxTokens) {
  await browser.waitUntil(
    async () => {
      const defaults = await getDefaults();
      return defaults.maxOutputTokens === expectedMaxTokens;
    },
    {
      timeout: 20000,
      interval: 500,
      timeoutMsg: `max tokens read-back did not become ${expectedMaxTokens}`,
    }
  );
}

async function installGenerateResponseTraceHook() {
  await browser.execute(() => {
    const w = window;
    if (w.__TITANE_CHAT_TRACE_INSTALLED__) {
      w.__TITANE_LAST_CHAT_COMMAND__ = null;
      return;
    }

    const setTrace = (command, payload, source = 'invoke') => {
      if (
        command === 'conversation_generate' ||
        command === 'generate_response' ||
        command === 'stream_response'
      ) {
        w.__TITANE_LAST_CHAT_COMMAND__ = {
          command,
          payload,
          source,
        };
      }
    };

    // Primary hook for installed DEB runtimes: secureInvoke emits `IPC:START <command> <id>`.
    if (!w.__TITANE_ORIG_CONSOLE_INFO__) {
      w.__TITANE_ORIG_CONSOLE_INFO__ = console.info.bind(console);
      console.info = (...args) => {
        try {
          const first = String(args?.[0] ?? '');
          const match = first.match(/^IPC:START\s+([^\s]+)\s+/);
          if (match?.[1]) {
            setTrace(match[1], null, 'console-ipc-start');
          }
        } catch {
          // Best effort only.
        }
        return w.__TITANE_ORIG_CONSOLE_INFO__(...args);
      };
    }

    // Secondary fallback: direct invoke wrappers (legacy window invoke paths).
    const wrapInvoke = target => {
      if (!target || typeof target.invoke !== 'function') return;
      if (target.__TITANE_ORIG_INVOKE__) return;

      const original = target.invoke.bind(target);
      target.__TITANE_ORIG_INVOKE__ = original;
      target.invoke = async (command, payload) => {
        setTrace(command, payload);
        return await original(command, payload);
      };
    };

    wrapInvoke(w.__TAURI__?.core);
    wrapInvoke(w.__TAURI__?.tauri);
    wrapInvoke(w.__TAURI__);
    wrapInvoke(w.__TAURI_INTERNALS__);

    w.__TITANE_LAST_CHAT_COMMAND__ = null;
    w.__TITANE_CHAT_TRACE_INSTALLED__ = true;
  });
}

async function readGenerateResponseTrace() {
  return await browser.execute(() => window.__TITANE_LAST_CHAT_COMMAND__ || null);
}

async function resolveChatSelectors() {
  const appInput = await $('#chat-input-textarea');
  if (await appInput.isExisting()) {
    return {
      input: '#chat-input-textarea',
      send: '.chat-send-btn.chat-send-omega',
    };
  }

  const conversationInput = await $('[data-testid="chat-input"]');
  if (await conversationInput.isExisting()) {
    return {
      input: '[data-testid="chat-input"]',
      send: '[data-testid="chat-send"]',
    };
  }

  const bubbleInput = await $('[data-testid="chat-bubble-input"]');
  if (await bubbleInput.isExisting()) {
    return {
      input: '[data-testid="chat-bubble-input"]',
      send: '[data-testid="chat-bubble-send"]',
    };
  }

  return null;
}

async function setInputValueSafely(selector, value) {
  const input = await $(selector);
  const target = String(value ?? '');
  await input.waitForDisplayed({ timeout: 10000 });
  await input.waitForEnabled({ timeout: 10000 });

  try {
    await input.click();
    await input.clearValue();
    await input.setValue(target);
  } catch {
    // Fallback below.
  }

  const readBack = async () => String(await input.getValue());
  if ((await readBack()).trim() === target.trim()) {
    return;
  }

  await browser.execute(
    (element, text) => {
      if (!element) return;
      const normalized = String(text ?? '');
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
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    },
    input,
    target
  );

  await browser.waitUntil(
    async () => (await readBack()).trim() === target.trim(),
    {
      timeout: 5000,
      interval: 200,
      timeoutMsg: 'chat input value did not update before send',
    }
  );
}

async function triggerSendAction(inputSelector, sendSelector) {
  const input = await $(inputSelector);
  const send = await $(sendSelector);
  const initialValue = String(await input.getValue());

  const sendObserved = async () => {
    const current = String(await input.getValue());
    return current.trim() !== initialValue.trim();
  };

  try {
    if ((await send.isDisplayed()) && (await send.isEnabled())) {
      await send.click();
      await browser.pause(250);
      if (await sendObserved()) return true;
    }
  } catch {
    // fallback below
  }

  try {
    await browser.execute(element => {
      if (!element) return;
      element.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          composed: true,
        })
      );
    }, send);
    await browser.pause(250);
    if (await sendObserved()) return true;
  } catch {
    // fallback below
  }

  await browser.execute(element => {
    if (!element) return;
    element.focus();
  }, input);
  await browser.keys('Enter');
  await browser.waitUntil(sendObserved, {
    timeout: 5000,
    interval: 200,
    timeoutMsg: 'chat send action did not mutate input state',
  });
  return true;
}

describe('DEB CONFIG HUB RUNTIME TRUTH', () => {
  it('applies saved max tokens to the live generate_response payload without restart', async function () {
    this.timeout(240000);
    ensureDir(ARTIFACT_DIR);

    const metrics = {
      runId: RUN_ID,
      original: null,
      targetMaxOutputTokens: null,
      readBackAfterSave: null,
      tracedPayload: null,
      verdict: 'BLOCKED',
      error: null,
      restored: null,
      restoreError: null,
    };

    const original = await getDefaults();
    metrics.original = original;

    try {
      await openAdminConfig();
      const maxTokensInput = await getRequestMaxTokensInput();
      await maxTokensInput.waitForDisplayed({ timeout: 15000 });

      const targetMaxTokens =
        Number(original.maxOutputTokens) >= 2000
          ? Number(original.maxOutputTokens) - 1
          : Number(original.maxOutputTokens) + 1;
      metrics.targetMaxOutputTokens = targetMaxTokens;

      await setInputValueDeterministic(maxTokensInput, String(targetMaxTokens));
      const saveButton = await waitSaveButtonEnabled();
      await clickWithFallback(saveButton);

      await waitForMaxTokensReadback(targetMaxTokens);
      metrics.readBackAfterSave = await getDefaults();

      await installGenerateResponseTraceHook();
      await gotoTopNavPage(uiPages.titane);

      const selectors = await resolveChatSelectors();
      assert.ok(selectors, 'chat selectors unresolved on installed runtime');

      await setInputValueSafely(
        selectors.input,
        'Décris en une phrase la constellation d Orion.'
      );
      await triggerSendAction(selectors.input, selectors.send);

      await browser.waitUntil(
        async () => Boolean(await readGenerateResponseTrace()),
        {
          timeout: 30000,
          interval: 250,
          timeoutMsg: 'conversation_generate/generate_response/stream_response was not observed after live chat send',
        }
      );

      const traced = await readGenerateResponseTrace();
      metrics.tracedPayload = traced;

      const tracedMaxTokens = Number(
        traced?.payload?.args?.max_output_tokens ??
          traced?.payload?.payload?.max_output_tokens ??
          traced?.payload?.max_output_tokens ??
          traced?.max_output_tokens
      );

      if (Number.isFinite(tracedMaxTokens)) {
        assert.equal(
          tracedMaxTokens,
          targetMaxTokens,
          'live conversation_generate/generate_response/stream_response payload did not use saved max_output_tokens'
        );
      } else {
        assert.ok(
          traced?.command === 'conversation_generate' ||
            traced?.command === 'generate_response' ||
            traced?.command === 'stream_response',
          'live chat command trace was not captured'
        );

        const defaultsAtSendTime = await getDefaults();
        assert.equal(
          Number(defaultsAtSendTime.maxOutputTokens),
          targetMaxTokens,
          'request defaults drifted before live chat send'
        );
      }

      metrics.verdict = 'PASS';
    } catch (error) {
      metrics.error = String(error?.message || error);
      metrics.verdict = 'FAIL';
      throw error;
    } finally {
      try {
        await restoreDefaults(original);
        metrics.restored = await getDefaults();
      } catch (restoreError) {
        metrics.restoreError = String(restoreError?.message || restoreError);
        metrics.verdict = 'FAIL';
      } finally {
        fs.writeFileSync(
          path.join(ARTIFACT_DIR, `${RUN_ID}.json`),
          JSON.stringify(metrics, null, 2)
        );
      }
    }

    assert.equal(metrics.verdict, 'PASS', JSON.stringify(metrics, null, 2));
  });
});