import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_TIMEOUT = 30000;
const ARTIFACTS_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR
  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
  : path.resolve(process.cwd(), 'reports/e2e-desktop');

const testId = id => `[data-testid="${id}"]`;

function isSessionInvalidError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('invalid session id') ||
    message.includes('no such window') ||
    message.includes('invalidated') ||
    message.includes('page crash or hang')
  );
}

function isTransientInteractionError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('no such element') ||
    message.includes('stale element reference') ||
    message.includes('element not interactable') ||
    message.includes('not clickable')
  );
}

function isTransportTimeoutError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('und_err_headers_timeout');
}

async function isExisting(selector) {
  const el = await $(selector);
  return el.isExisting();
}

async function isDisplayed(selector) {
  const el = await $(selector);
  if (!(await el.isExisting())) return false;
  return el.isDisplayed();
}

async function getDomNodeState(selector) {
  return browser.execute(targetSelector => {
    const element = document.querySelector(targetSelector);
    if (!(element instanceof HTMLElement)) {
      return {
        exists: false,
        visible: false,
        disabled: false,
        readOnly: false,
        value: '',
      };
    }

    const style = window.getComputedStyle(element);
    const visible =
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.pointerEvents !== 'none';

    return {
      exists: true,
      visible,
      disabled:
        'disabled' in element
          ? Boolean(element.disabled)
          : element.getAttribute('disabled') !== null,
      readOnly: 'readOnly' in element ? Boolean(element.readOnly) : false,
      value: 'value' in element ? String(element.value ?? '') : '',
    };
  }, selector);
}

async function isDomEditable(selector) {
  return browser.execute(targetSelector => {
    const element = document.querySelector(targetSelector);
    if (
      !(element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement)
    ) {
      return false;
    }

    const style = window.getComputedStyle(element);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.pointerEvents === 'none'
    ) {
      return false;
    }

    return (
      !element.disabled &&
      !element.readOnly &&
      !element.closest('fieldset[disabled]') &&
      !element.closest('[inert]') &&
      !element.closest('[hidden]')
    );
  }, selector);
}

async function isDomClickable(selector) {
  return browser.execute(targetSelector => {
    const element = document.querySelector(targetSelector);
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const style = window.getComputedStyle(element);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.pointerEvents === 'none'
    ) {
      return false;
    }

    const disabledAttr =
      element.getAttribute('disabled') !== null ||
      element.getAttribute('aria-disabled') === 'true';

    return (
      !disabledAttr &&
      !element.closest('fieldset[disabled]') &&
      !element.closest('[inert]')
    );
  }, selector);
}

async function waitForAnyDisplayed(selectors, timeout = DEFAULT_TIMEOUT) {
  await browser.waitUntil(
    async () => {
      for (const selector of selectors) {
        if (await isDisplayed(selector)) return true;
      }
      return false;
    },
    {
      timeout,
      interval: 200,
      timeoutMsg: `none of selectors became visible: ${selectors.join(', ')}`,
    }
  );
}

async function waitForChatInputReady(timeout = DEFAULT_TIMEOUT) {
  await browser.waitUntil(
    async () => {
      const inputState = await getDomNodeState(testId('chat-input'));
      if (!inputState.exists || !inputState.visible) {
        return false;
      }

      if (await isDomEditable(testId('chat-input'))) {
        return true;
      }

      const errorState = await getDomNodeState(testId('chat-error'));
      return errorState.exists && errorState.visible;
    },
    {
      timeout,
      interval: 250,
      timeoutMsg: `chat input stayed busy/disabled after ${timeout}ms`,
    }
  );
}

async function waitForChatCycleSettled(timeout = DEFAULT_TIMEOUT) {
  await browser.waitUntil(
    async () => {
      const errorState = await getDomNodeState(testId('chat-error'));
      if (errorState.exists && errorState.visible) {
        return true;
      }

      const inputState = await getDomNodeState(testId('chat-input'));
      if (!inputState.exists || !inputState.visible) {
        return false;
      }

      if (!(await isDomEditable(testId('chat-input')))) {
        return false;
      }

      const loadingState = await getDomNodeState(testId('chat-loading'));
      return !loadingState.exists || !loadingState.visible;
    },
    {
      timeout,
      interval: 250,
      timeoutMsg: `chat cycle did not settle after ${timeout}ms`,
    }
  );
}

async function clickSafely(selector) {
  const el = await $(selector);
  try {
    if (!(await el.isExisting())) return false;
    if (!(await el.isDisplayed())) return false;

    await browser.execute(element => {
      if (!element) return;
      try {
        element.scrollIntoView({ block: 'center', inline: 'nearest' });
      } catch {
        // Best effort only.
      }
    }, el);

    const domClicked = await browser.execute(element => {
      if (!element) return false;
      const disabled =
        element.hasAttribute('disabled') ||
        element.getAttribute('aria-disabled') === 'true';
      if (disabled) return false;

      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      element.dispatchEvent(event);
      return true;
    }, el);
    if (domClicked) return true;

    await el.click();
    return true;
  } catch (error) {
    if (isSessionInvalidError(error)) throw error;
    if (isTransientInteractionError(error)) return false;
    try {
      await el.click();
      return true;
    } catch (fallbackError) {
      if (isSessionInvalidError(fallbackError)) throw fallbackError;
      return false;
    }
  }
}

async function triggerSendAction(inputSelector, sendSelector) {
  const input = await $(inputSelector);
  const send = await $(sendSelector);

  try {
    if ((await send.isDisplayed()) && (await isDomClickable(sendSelector))) {
      await clickSafely(sendSelector);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const dispatched = await browser.execute(element => {
      if (!element) return false;
      const disabled =
        element.hasAttribute('disabled') ||
        element.getAttribute('aria-disabled') === 'true';
      if (disabled) return false;
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      element.dispatchEvent(event);
      return true;
    }, send);
    if (dispatched) return true;
  } catch {
    // fallback below
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

async function clickElementSafely(element) {
  try {
    if (!(await element.isExisting())) return false;
    if (!(await element.isDisplayed())) return false;
    if (!(await element.isEnabled())) return false;

    await browser.execute(el => {
      if (!el) return;
      try {
        el.scrollIntoView({ block: 'center', inline: 'nearest' });
      } catch {
        // Best effort only.
      }
      el.click();
    }, element);
    return true;
  } catch (error) {
    if (isSessionInvalidError(error)) throw error;
    if (isTransientInteractionError(error)) return false;
    try {
      await element.click();
      return true;
    } catch (fallbackError) {
      if (isSessionInvalidError(fallbackError)) throw fallbackError;
      return false;
    }
  }
}

async function setElementValueSafely(element, value) {
  await browser.execute(
    (el, text) => {
      if (!el) return;
      const normalized = String(text ?? '');
      el.focus();

      const proto =
        el instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');

      if (descriptor?.set) {
        descriptor.set.call(el, normalized);
      } else {
        el.value = normalized;
      }

      try {
        el.dispatchEvent(
          new InputEvent('input', {
            bubbles: true,
            composed: true,
            data: normalized,
            inputType: 'insertText',
          })
        );
      } catch {
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }

      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    },
    element,
    value
  );
}

async function setValueSafely(selector, value, timeout = DEFAULT_TIMEOUT) {
  await browser.waitUntil(
    async () => {
      const candidate = await $(selector);
      return (
        (await candidate.isExisting()) &&
        (await candidate.isDisplayed()) &&
        (await isDomEditable(selector))
      );
    },
    {
      timeout,
      interval: 200,
      timeoutMsg: `element ("${selector}") still not enabled after ${timeout}ms`,
    }
  );

  const el = await $(selector);
  await setElementValueSafely(el, value);
}

export async function ensureArtifactsDir() {
  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
}

export async function captureFailureScreenshot(testName = 'unknown') {
  await ensureArtifactsDir();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safe = String(testName)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const screenshotPath = path.join(
    ARTIFACTS_DIR,
    `failure-${safe || 'test'}-${stamp}.png`
  );
  try {
    await browser.saveScreenshot(screenshotPath);
  } catch (error) {
    if (isSessionInvalidError(error)) {
      return null;
    }
    throw error;
  }
  return screenshotPath;
}

export async function waitForDisplayed(selector, timeout = DEFAULT_TIMEOUT) {
  const el = await $(selector);
  await el.waitForDisplayed({ timeout });
  return el;
}

async function recoverBrowserSession(startUrl = 'tauri://localhost') {
  try {
    await browser.reloadSession();
  } catch {
    // Best effort only.
  }

  await browser.url(startUrl);
}

export async function openApp() {
  const startUrl = 'tauri://localhost';

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await browser.url(startUrl);
      await waitForDisplayed('body', DEFAULT_TIMEOUT);
      return;
    } catch (error) {
      if (attempt >= 2 || !isSessionInvalidError(error)) {
        throw error;
      }

      await recoverBrowserSession(startUrl);
    }
  }
}

export async function waitAppReady() {
  if (await isExisting(testId('app-ready'))) {
    let markerVisible = false;
    try {
      await waitForDisplayed(testId('app-ready'), DEFAULT_TIMEOUT);
      markerVisible = true;
    } catch {
      markerVisible = false;
    }

    if (markerVisible) {
      await browser.waitUntil(
        async () => {
          const state = await $(testId('app-ready')).getAttribute('data-state');
          if (state === 'ready') {
            return true;
          }
          return await isDisplayed(testId('nav-top-main'));
        },
        {
          timeout: DEFAULT_TIMEOUT,
          interval: 200,
          timeoutMsg: 'app-ready marker did not reach ready state',
        }
      );
    } else {
      await waitForAnyDisplayed(
        [testId('nav-top-main'), testId('page-titane'), testId('chat-input')],
        DEFAULT_TIMEOUT
      );
    }
  } else {
    await waitForAnyDisplayed(
      [testId('nav-top-main'), testId('page-titane'), testId('chat-input')],
      DEFAULT_TIMEOUT
    );
  }

  if (await isExisting(testId('ipc-ready'))) {
    await browser.waitUntil(
      async () => {
        const ipcMarker = await $(testId('ipc-ready'));
        const state = await ipcMarker.getAttribute('data-state');
        if (state === 'ready' || state === 'fallback') {
          return true;
        }

        // Some builds keep ipc-ready hidden while top navigation is already interactive.
        return await isDisplayed(testId('nav-top-main'));
      },
      {
        timeout: DEFAULT_TIMEOUT,
        interval: 200,
        timeoutMsg:
          'ipc-ready marker did not reach ready/fallback and nav-top-main stayed unavailable',
      }
    );
  }
}

export async function gotoTopNavPage(page) {
  const currentPath = await getCurrentPathname();
  if (currentPath === page.route || currentPath.startsWith(`${page.route}/`)) {
    if ((await isDisplayed(page.root)) || (await isDisplayed(testId('nav-top-main')))) {
      return;
    }
  }

  await waitForDisplayed(testId('nav-top-main'));

  const navSelector = testId(page.navTestId);
  const moreSelector = testId('btn-nav-more');
  let navigated = false;

  if (await isDisplayed(navSelector)) {
    navigated = await clickSafely(navSelector);
  }

  if (!navigated && (await isDisplayed(moreSelector))) {
    await clickSafely(moreSelector);
    await browser.waitUntil(
      async () => (await isDisplayed(navSelector)) || (await isExisting(navSelector)),
      {
        timeout: 3000,
        interval: 150,
        timeoutMsg: `navigation item did not appear in more menu: ${page.navTestId}`,
      }
    );
    navigated = await clickSafely(navSelector);
  }

  if (!navigated) {
    await browser.url(`tauri://localhost${page.route}`);
  }

  await browser.waitUntil(
    async () => {
      if (await isDisplayed(page.root)) return true;
      const pathname = await getCurrentPathname();
      return pathname === page.route || pathname.startsWith(`${page.route}/`);
    },
    {
      timeout: DEFAULT_TIMEOUT,
      interval: 200,
      timeoutMsg: `page activation failed for ${page.id}`,
    }
  );
}

export async function clickAllTabs(tabSelectors = []) {
  for (const selector of tabSelectors) {
    try {
      const initial = await $(selector);
      if (!(await initial.isExisting())) continue;
      if (!(await initial.isDisplayed())) continue;

      const selectedBefore = await initial.getAttribute('aria-selected');
      if (selectedBefore === 'true') continue;

      const clicked = await clickSafely(selector);
      if (!clicked) continue;

      await browser.waitUntil(
        async () => {
          try {
            const current = await $(selector);
            if (!(await current.isExisting())) return true;
            const selected = await current.getAttribute('aria-selected');
            if (selected !== null) return selected === 'true';
            const cls = (await current.getAttribute('class')) || '';
            return (
              cls.includes('active') ||
              cls.includes('--active') ||
              cls.includes('bg-blue-600')
            );
          } catch (error) {
            if (isSessionInvalidError(error)) throw error;
            return true;
          }
        },
        {
          timeout: 2500,
          interval: 150,
          timeoutMsg: `tab did not activate: ${selector}`,
        }
      );
    } catch (error) {
      if (isSessionInvalidError(error)) throw error;
      if (isTransientInteractionError(error)) continue;
      continue;
    }
  }
}

export async function toggleAllVisibleCheckboxes() {
  const checkboxes = await $$('input[type="checkbox"]');
  let touched = 0;
  for (const checkbox of checkboxes) {
    try {
      if (!(await checkbox.isExisting())) continue;
      if (!(await checkbox.isDisplayed())) continue;
      if (!(await checkbox.isEnabled())) continue;

      await clickElementSafely(checkbox);
      await clickElementSafely(checkbox);
      touched += 1;
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      if (message.includes('invalid session id')) {
        throw error;
      }
      // Dynamic pages can detach controls between discovery and interaction.
      continue;
    }
  }
  return touched;
}

export async function fillAllVisibleInputs(sample = 'e2e-sample') {
  const selectors = [
    'input[type="text"]',
    'input[type="search"]',
    'input[type="email"]',
    'input[type="url"]',
    'input[type="tel"]',
    'input[type="number"]',
    'input[type="password"]',
    'textarea',
  ];

  let touched = 0;
  for (const selector of selectors) {
    const fields = await $$(selector);
    for (const field of fields) {
      try {
        if (!(await field.isExisting())) continue;
        if (!(await field.isDisplayed())) continue;
        if (!(await field.isEnabled())) continue;
        const readonly = await field.getAttribute('readonly');
        if (readonly !== null) continue;
        await clickElementSafely(field);
        await setElementValueSafely(field, sample);
        await setElementValueSafely(field, '');
        touched += 1;
      } catch (error) {
        const message = String(error?.message || '').toLowerCase();
        if (message.includes('invalid session id')) {
          throw error;
        }
        // Inputs in reactive panes can disappear while iterating.
        continue;
      }
    }
  }
  return touched;
}

export async function sendChatAndAssertNoSilence(message, timeoutMs = 45000) {
  const chatSettleTimeout = Math.max(DEFAULT_TIMEOUT, timeoutMs, 120000);

  const ensureChatSurfaceVisible = async () => {
    const chatSelectors = [testId('chat-input'), '[data-testid="tab-conversation"]'];

    const hasSurface = async () => {
      for (const selector of chatSelectors) {
        if (await isDisplayed(selector)) return true;
      }
      return false;
    };

    if (await hasSurface()) {
      return;
    }

    try {
      await waitForAnyDisplayed(chatSelectors, 5000);
      return;
    } catch {
      // Fallback: recover the canonical chat surface from /titane once.
    }

    // Some wry/WebDriver sessions can timeout on url() while navigation still lands.
    // Treat transport timeout as recoverable and verify actual surface state before failing.
    try {
      await browser.url('tauri://localhost/titane');
    } catch (error) {
      if (!isTransportTimeoutError(error)) {
        throw error;
      }
    }

    await waitAppReady();

    const tab = await $(testId('tab-conversation'));
    if ((await tab.isExisting()) && (await tab.isDisplayed())) {
      await clickSafely(testId('tab-conversation'));
    }

    await waitForAnyDisplayed(chatSelectors, 15000);
  };

  const chatReady = await $(testId('chat-ready'));
  if (await chatReady.isExisting()) {
    await chatReady.waitForExist({ timeout: DEFAULT_TIMEOUT });
    try {
      await browser.waitUntil(
        async () => (await chatReady.getAttribute('data-state')) === 'ready',
        {
          timeout: DEFAULT_TIMEOUT,
          interval: 200,
          timeoutMsg: 'chat-ready marker did not reach ready state',
        }
      );
    } catch {
      // In slower desktop sessions, the marker can lag while chat controls are usable.
      await ensureChatSurfaceVisible();
    }
  } else {
    await ensureChatSurfaceVisible();
  }

  const assistantSelector = testId('chat-message-assistant');
  const assistantBefore = (await isExisting(assistantSelector))
    ? (await $$(assistantSelector)).length
    : 0;
  const userSelector = testId('chat-message-user');
  const userBefore = (await isExisting(userSelector))
    ? (await $$(userSelector)).length
    : 0;
  const bodyBefore = (await $('body').getText()) || '';
  const promptMarker = String(message || '').slice(0, 48);

  const input = await $(testId('chat-input'));
  const send = await $(testId('chat-send'));

  await input.waitForExist({ timeout: DEFAULT_TIMEOUT });
  await waitForChatInputReady(chatSettleTimeout);
  await setValueSafely(testId('chat-input'), message, chatSettleTimeout);

  await browser.waitUntil(
    async () => {
      const inputState = await getDomNodeState(testId('chat-input'));
      return inputState.value.trim().length > 0;
    },
    {
      timeout: 6000,
      interval: 150,
      timeoutMsg: 'chat input did not receive message value',
    }
  );

  await send.waitForExist({ timeout: DEFAULT_TIMEOUT });

  await browser.waitUntil(
    async () => {
      const value = (await input.getValue()) || '';
      return value.trim().length > 0 && (await isDomClickable(testId('chat-send')));
    },
    {
      timeout: 6000,
      interval: 150,
      timeoutMsg: 'chat send button stayed disabled after input value set',
    }
  );

  const sent = await triggerSendAction(testId('chat-input'), testId('chat-send'));
  if (!sent) {
    throw new Error('chat send action could not be triggered');
  }

  await browser.waitUntil(
    async () => {
      if (await isExisting(userSelector)) {
        const userAfter = (await $$(userSelector)).length;
        if (userAfter > userBefore) return true;
      }
      const inputState = await getDomNodeState(testId('chat-input'));
      if (inputState.exists && inputState.value.trim().length === 0) return true;

      const loadingState = await getDomNodeState(testId('chat-loading'));
      if (loadingState.exists && loadingState.visible) return true;

      return false;
    },
    {
      timeout: 7000,
      interval: 150,
      timeoutMsg: 'chat send was not acknowledged by UI',
    }
  );

  await browser.waitUntil(
    async () => {
      if (await isExisting(assistantSelector)) {
        const assistantAfter = (await $$(assistantSelector)).length;
        if (assistantAfter > assistantBefore) return true;
      }

      if (await isExisting(userSelector)) {
        const userAfter = (await $$(userSelector)).length;
        if (userAfter > userBefore) return true;
      }

      const errorState = await getDomNodeState(testId('chat-error'));
      if (errorState.exists && errorState.visible) return true;

      const genericAlert = await $('[role="alert"]');
      if ((await genericAlert.isExisting()) && (await genericAlert.isDisplayed())) {
        return true;
      }

      const inputState = await getDomNodeState(testId('chat-input'));
      if (inputState.exists && inputState.value.trim().length === 0) return true;

      const bodyAfter = (await $('body').getText()) || '';
      if (
        promptMarker &&
        !bodyBefore.includes(promptMarker) &&
        bodyAfter.includes(promptMarker)
      ) {
        return true;
      }
      return bodyAfter.length > bodyBefore.length + 8;
    },
    {
      timeout: timeoutMs,
      interval: 250,
      timeoutMsg: 'No-silence contract failed: no assistant message and no visible error',
    }
  );

  try {
    await waitForChatCycleSettled(Math.min(chatSettleTimeout, 15000));
  } catch {
    // Best-effort only: the next send path independently waits for a re-enabled input.
  }
}

export async function retryLatestUserMessageAndAssertNoSilence(timeoutMs = 45000) {
  const chatSettleTimeout = Math.max(DEFAULT_TIMEOUT, timeoutMs, 120000);

  const retrySelectors = [
    `${testId('chat-message-user')} button[title="Renvoyer ce message"]`,
    `${testId('chat-message-user')} button.conversation-message-action`,
    'button[title="Renvoyer ce message"]',
    'xpath=//button[contains(normalize-space(.), "Retry")]',
  ];

  let retryButtons = [];
  for (const selector of retrySelectors) {
    try {
      const found = await $$(selector);
      if (found.length > 0) {
        retryButtons = found;
        break;
      }
    } catch {
      // Continue trying other selectors.
    }
  }

  if (retryButtons.length === 0) {
    return { present: false, triggered: false };
  }

  const assistantSelector = testId('chat-message-assistant');
  const userSelector = testId('chat-message-user');
  const assistantBefore = (await isExisting(assistantSelector))
    ? (await $$(assistantSelector)).length
    : 0;
  const userBefore = (await isExisting(userSelector))
    ? (await $$(userSelector)).length
    : 0;
  const bodyBefore = (await $('body').getText()) || '';

  await waitForChatInputReady(chatSettleTimeout);

  let clicked = false;
  for (let i = retryButtons.length - 1; i >= 0; i -= 1) {
    const candidate = retryButtons[i];
    try {
      if (!(await candidate.isExisting())) continue;
      if (!(await candidate.isDisplayed())) continue;
      const title = (await candidate.getAttribute('title')) || '';
      const text = ((await candidate.getText()) || '').trim();
      if (
        !title.toLowerCase().includes('renvoyer') &&
        !text.toLowerCase().includes('retry')
      ) {
        continue;
      }
      if (!(await candidate.isEnabled())) continue;
      clicked = await clickElementSafely(candidate);
      if (clicked) break;
    } catch (error) {
      if (isSessionInvalidError(error)) throw error;
      continue;
    }
  }

  if (!clicked) {
    return { present: true, triggered: false };
  }

  await browser.waitUntil(
    async () => {
      if (await isExisting(userSelector)) {
        const userAfter = (await $$(userSelector)).length;
        if (userAfter > userBefore) return true;
      }

      if (await isExisting(assistantSelector)) {
        const assistantAfter = (await $$(assistantSelector)).length;
        if (assistantAfter > assistantBefore) return true;
      }

      if (await isExisting(testId('chat-loading'))) {
        const loading = await $(testId('chat-loading'));
        if (await loading.isDisplayed()) return true;
      }

      const err = await $(testId('chat-error'));
      if ((await err.isExisting()) && (await err.isDisplayed())) return true;

      const bodyAfter = (await $('body').getText()) || '';
      return bodyAfter.length > bodyBefore.length + 8;
    },
    {
      timeout: timeoutMs,
      interval: 250,
      timeoutMsg: 'retry action did not produce visible acknowledgement',
    }
  );

  try {
    await waitForChatCycleSettled(Math.min(chatSettleTimeout, 15000));
  } catch {
    // Best-effort only: the next send path independently waits for a re-enabled input.
  }

  return { present: true, triggered: true };
}

export async function getCurrentPathname() {
  return browser.execute(() => window.location.pathname || '');
}
