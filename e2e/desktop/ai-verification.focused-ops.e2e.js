import assert from 'node:assert/strict';

const APP_URL = process.env.TITANE_E2E_URL || 'tauri://localhost/titane';
const AI_VERIFY_SCRIPT_TIMEOUT_MS = Number.parseInt(
  process.env.AI_VERIFY_SCRIPT_TIMEOUT_MS || '120000',
  10
);
const AI_VERIFY_RESPONSE_TIMEOUT_MS = Number.parseInt(
  process.env.AI_VERIFY_RESPONSE_TIMEOUT_MS || '150000',
  10
);
const AI_VERIFY_STALL_TIMEOUT_MS = Number.parseInt(
  process.env.AI_VERIFY_STALL_TIMEOUT_MS || '5000',
  10
);

const FOCUSED_SCENARIOS = [
  {
    seed: 'Explique ton chemin de réponse (UI→services→orchestrateur→engines).',
    prompt: 'Reformule ma dernière question.',
    expectAny: [/chemin/i, /réponse/i, /services/i, /orchestr/i],
    rejectAny: [
      /j'ai besoin de plus d'informations/i,
      /quel exemple/i,
      /que veux-tu faire/i,
    ],
  },
  {
    prompt: 'Dis ce que tu ne sais pas (transparence).',
    expectAny: [
      /je ne sais pas/i,
      /incertain/i,
      /il me manque/i,
      /je ne peux pas (?:vérifier|confirmer)/i,
    ],
    rejectAny: [/toujours en apprentissage/i, /n'hésitez pas/i],
  },
  {
    prompt: 'Propose un fallback utile sans IA externe.',
    expectAny: [
      /local/i,
      /sans provider externe/i,
      /hors ligne/i,
      /fallback/i,
      /plan/i,
      /utile/i,
    ],
    rejectAny: [
      /kevin thibault/i,
      /j'ai appris/i,
      /je peux fonctionner sans connexion internet/i,
    ],
  },
  {
    prompt: 'Fais un plan d’action minimal.',
    expectAny: [/1[\).:\-]/i, /2[\).:\-]/i, /étape/i, /plan/i],
    rejectAny: [/que veux-tu faire/i, /plus d'information/i],
  },
];

async function ensureTauriPageLoaded(preferredUrl) {
  const candidates = [
    preferredUrl,
    'tauri://localhost/titane',
    'tauri://localhost/#/chat',
    'tauri://localhost',
  ].filter(Boolean);

  for (const url of candidates) {
    try {
      await browser.url(url);
    } catch {
      continue;
    }

    await browser.pause(1200);
    const loaded = await browser.execute(() => {
      const href = window.location.href || '';
      const readyState = document.readyState;
      const hasTitaneSurface =
        !!document.querySelector('[data-testid="page-titane"]') ||
        !!document.querySelector('[data-testid="nav-top-main"]') ||
        !!document.querySelector('[data-testid="tab-conversation"]') ||
        !!document.querySelector('[data-testid="chat-input"]');

      return {
        href,
        ready: readyState === 'interactive' || readyState === 'complete',
        hasTitaneSurface,
      };
    });

    if (loaded?.href?.startsWith('tauri://localhost') && loaded.ready) {
      return loaded.hasTitaneSurface;
    }
  }

  return false;
}

async function attemptOnboardingSkip(maxClicks = 6) {
  for (let i = 0; i < maxClicks; i += 1) {
    const clicked = await browser.execute(() => {
      const candidates = Array.from(document.querySelectorAll('button, a')).filter(el => {
        const text = (el.innerText || el.textContent || '').toLowerCase().trim();
        return (
          text.includes('suivant') ||
          text.includes('next') ||
          text.includes('continuer') ||
          text.includes('commencer') ||
          text.includes('demarrer') ||
          text.includes('skip')
        );
      });
      if (!candidates.length) return false;
      candidates[0].click();
      return true;
    });
    if (!clicked) return;
    await browser.pause(400);
  }
}

async function resolveSelectors() {
  const conversationInput = await $('[data-testid="chat-input"]');
  if (await conversationInput.isExisting()) {
    return {
      input: '[data-testid="chat-input"]',
      send: '[data-testid="chat-send"]',
      user: '[data-testid="chat-message-user"] [data-testid="chat-message-content"], [data-testid="chat-message-user"]',
      response:
        '[data-testid="chat-message-assistant"] [data-testid="chat-message-content"]',
      open: '[data-testid="tab-conversation"]',
    };
  }
  const bubbleInput = await $('.chat-bubble-input');
  const bubbleTrigger = await $('[data-testid="chat-bubble-trigger"]');
  if ((await bubbleInput.isExisting()) || (await bubbleTrigger.isExisting())) {
    return {
      input: '.chat-bubble-input',
      send: '.chat-bubble-send',
      user: '.chat-message-user, [data-testid="chat-message-user"]',
      response: '.chat-bubble-message.assistant .message-content',
      open: '[data-testid="chat-bubble-trigger"]',
    };
  }
  const windowInput = await $('#chat-window-textarea');
  if (await windowInput.isExisting()) {
    return {
      input: '#chat-window-textarea',
      send: '.send-button',
      user: '.chat-message-user, [data-testid="chat-message-user"]',
      response: '.chat-messages .message-bubble-text',
      open: null,
    };
  }
  const appInput = await $('#chat-input-textarea');
  if (await appInput.isExisting()) {
    return {
      input: '#chat-input-textarea',
      send: '.chat-input__send-btn',
      user: '.chat-message-user, [data-testid="chat-message-user"]',
      response: '.message-bubble-assistant .message-bubble-text',
      open: null,
    };
  }
  return null;
}

async function ensureChatOpen(selectors) {
  const input = await $(selectors.input);
  if (await input.isExisting()) return;
  if (!selectors?.open) return;

  const trigger = await $(selectors.open);
  if (await trigger.isExisting()) {
    await trigger.scrollIntoView();
    await trigger.click();
    await browser.waitUntil(async () => (await $(selectors.input)).isExisting(), {
      timeout: 5000,
      interval: 200,
      timeoutMsg: 'timeout waiting for chat input to appear',
    });
  }
}

async function getResponseSnapshot(selector) {
  return browser.execute(sel => {
    const nodes = Array.from(document.querySelectorAll(sel));
    if (!nodes.length) {
      return { count: 0, text: '' };
    }
    const last = nodes[nodes.length - 1];
    return {
      count: nodes.length,
      text: (last?.textContent || '').trim(),
    };
  }, selector);
}

async function getMessageCount(selector) {
  return browser.execute(sel => document.querySelectorAll(sel).length, selector);
}

async function waitForSendPathReady(selectors, prompt) {
  await browser.waitUntil(
    async () => {
      const inputState = await browser.execute(
        (inputSelector, sendSelector) => {
          const input = document.querySelector(inputSelector);
          if (!input) return { value: null, ready: false };
          const value = typeof input.value === 'string' ? input.value : '';
          const send = sendSelector ? document.querySelector(sendSelector) : null;
          const disabled = send
            ? send.hasAttribute('disabled') ||
              send.getAttribute('aria-disabled') === 'true'
            : false;
          return {
            value,
            ready: value.trim().length > 0 && !disabled,
          };
        },
        selectors.input,
        selectors.send
      );

      return (
        inputState?.ready &&
        typeof inputState.value === 'string' &&
        inputState.value.trim() === String(prompt).trim()
      );
    },
    {
      timeout: 8000,
      interval: 150,
      timeoutMsg: 'chat input did not activate send path after value injection',
    }
  );
}

async function waitForInputEnabled(selectors) {
  await browser.waitUntil(
    async () => {
      const state = await browser.execute(inputSelector => {
        const input = document.querySelector(inputSelector);
        const inputEnabled =
          input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement
            ? !input.disabled && !input.readOnly
            : false;

        return {
          inputEnabled,
        };
      }, selectors.input);

      return state?.inputEnabled;
    },
    {
      timeout: 15000,
      interval: 200,
      timeoutMsg: 'chat input stayed disabled',
    }
  );
}

async function sendPrompt(selectors, prompt) {
  await waitForInputEnabled(selectors);
  const beforeSnapshot = await getResponseSnapshot(selectors.response);
  const userBeforeCount = await getMessageCount(selectors.user);
  const lastText = beforeSnapshot.text;

  await browser.execute(
    (sel, value) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const normalized = String(value ?? '');
      const proto =
        window.HTMLTextAreaElement?.prototype || window.HTMLInputElement?.prototype;
      const setter = proto ? Object.getOwnPropertyDescriptor(proto, 'value')?.set : null;
      if (setter) {
        setter.call(el, normalized);
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

      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.focus();
    },
    selectors.input,
    prompt
  );

  await waitForSendPathReady(selectors, prompt);

  await browser.execute(
    (inputSelector, sendSelector) => {
      const input = document.querySelector(inputSelector);
      const send = sendSelector ? document.querySelector(sendSelector) : null;
      if (send) {
        send.click();
        return;
      }
      if (!input) return;
      const keyConfig = {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      };
      input.focus();
      input.dispatchEvent(new KeyboardEvent('keydown', keyConfig));
      input.dispatchEvent(new KeyboardEvent('keypress', keyConfig));
      input.dispatchEvent(new KeyboardEvent('keyup', keyConfig));
    },
    selectors.input,
    selectors.send
  );

  await browser.waitUntil(
    async () => {
      const userAfterCount = await getMessageCount(selectors.user);
      if (userAfterCount > userBeforeCount) return true;

      const inputValue = await browser.execute(sel => {
        const el = document.querySelector(sel);
        if (!el) return null;
        return typeof el.value === 'string' ? el.value : '';
      }, selectors.input);

      if (typeof inputValue === 'string' && inputValue.trim().length === 0) {
        return true;
      }

      const afterSnapshot = await getResponseSnapshot(selectors.response);
      return afterSnapshot.count > beforeSnapshot.count;
    },
    {
      timeout: 7000,
      interval: 200,
      timeoutMsg: 'timeout waiting for send acknowledgement',
    }
  );

  let response = null;
  let stalled = false;
  const responseWaitStartedAt = Date.now();

  await browser.waitUntil(
    async () => {
      const afterSnapshot = await getResponseSnapshot(selectors.response);
      const hasNewMessage = afterSnapshot.count > beforeSnapshot.count;
      const hasChangedText = !!afterSnapshot.text && afterSnapshot.text !== lastText;

      if (!hasNewMessage && !hasChangedText) {
        const elapsedMs = Date.now() - responseWaitStartedAt;
        if (elapsedMs >= AI_VERIFY_STALL_TIMEOUT_MS) {
          const uiState = await browser.execute(
            (inputSelector, loadingSelector) => {
              const input = document.querySelector(inputSelector);
              const loadingNode = loadingSelector
                ? document.querySelector(loadingSelector)
                : null;
              const inputEnabled =
                input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement
                  ? !input.disabled && !input.readOnly
                  : false;
              const loadingVisible =
                loadingNode instanceof HTMLElement
                  ? loadingNode.offsetParent !== null
                  : false;

              return { inputEnabled, loadingVisible };
            },
            selectors.input,
            '[data-testid="chat-loading"]'
          );

          if (uiState?.inputEnabled && !uiState?.loadingVisible) {
            stalled = true;
            return true;
          }
        }
        return false;
      }

      response = afterSnapshot.text || null;
      return true;
    },
    {
      timeout: AI_VERIFY_RESPONSE_TIMEOUT_MS,
      interval: 1000,
      timeoutMsg: 'timeout waiting for response',
    }
  );

  if (stalled) {
    throw new Error(`UI_RESPONSE_STALLED_AFTER_${AI_VERIFY_STALL_TIMEOUT_MS}MS`);
  }

  await waitForInputEnabled(selectors);

  return response;
}

function assertScenario(prompt, response, { expectAny, rejectAny }) {
  assert.ok(
    response && response.trim().length > 40,
    `Réponse trop courte pour: ${prompt}`
  );
  assert.ok(
    expectAny.some(pattern => pattern.test(response)),
    `Réponse non qualifiée pour "${prompt}": ${response}`
  );
  assert.ok(
    rejectAny.every(pattern => !pattern.test(response)),
    `Réponse générique ou interdite pour "${prompt}": ${response}`
  );
}

describe('ai-verification (desktop/focused-ops)', () => {
  let selectors = null;

  async function prepareChatSurface() {
    await browser.setTimeout({ script: AI_VERIFY_SCRIPT_TIMEOUT_MS });
    await ensureTauriPageLoaded(APP_URL);
    await browser.pause(800);
    await attemptOnboardingSkip();

    await browser.waitUntil(
      async () => {
        const tabConversation = await $('[data-testid="tab-conversation"]');
        if (await tabConversation.isExisting()) return true;
        const chatReady = await $('[data-testid="chat-ready"]');
        if (await chatReady.isExisting()) return true;
        const chatInput = await $('[data-testid="chat-input"]');
        if (await chatInput.isExisting()) return true;
        const bubbleTrigger = await $('[data-testid="chat-bubble-trigger"]');
        if (await bubbleTrigger.isExisting()) return true;
        const bubbleInput = await $('.chat-bubble-input');
        if (await bubbleInput.isExisting()) return true;
        const windowInput = await $('#chat-window-textarea');
        if (await windowInput.isExisting()) return true;
        const appInput = await $('#chat-input-textarea');
        return appInput.isExisting();
      },
      {
        timeout: 15000,
        interval: 300,
        timeoutMsg: 'timeout waiting for chat surface',
      }
    );

    selectors = await resolveSelectors();
    assert.ok(selectors, 'CHAT_SELECTORS_MISSING');
    await ensureChatOpen(selectors);
  }

  before(async () => {
    await prepareChatSurface();
  });

  it('answers focused operational prompts without generic drift', async () => {
    for (const scenario of FOCUSED_SCENARIOS) {
      await browser.reloadSession();
      await prepareChatSurface();

      if (scenario.seed) {
        const seedResponse = await sendPrompt(selectors, scenario.seed);
        assert.ok(
          seedResponse && seedResponse.trim().length > 20,
          `Seed failed: ${scenario.seed}`
        );
      }

      const response = await sendPrompt(selectors, scenario.prompt);
      assertScenario(scenario.prompt, response, scenario);
    }
  });
});
