import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  gotoTopNavPage,
  openApp,
  sendChatAndAssertNoSilence,
  waitAppReady,
  waitForDisplayed,
} from './ui-driver.wdio.js';
import { uiPages } from './page-objects/uiPages.po.js';

const REPORT_DIR = path.resolve(process.cwd(), 'reports/e2e-desktop');
const REPORT_FILE = path.join(REPORT_DIR, 'chat-ui-complete-runtime-report.json');
const MOCK_STUB =
  "j'ai bien recu votre demande et je la traite avec les modules cognitifs actifs";
const MEMORY_FACTS = {
  code: 'OMEGA-7421',
  dossier: 'CHAMPION-OLLAMA',
  garde: 'ANTI-REGRESSION',
};

const ADVANCED_SCENARIOS = [
  {
    id: 'capabilities',
    prompt:
      'Reponds en 4 lignes courtes. Chaque ligne doit commencer par CAPA:, UI:, MEMORY:, RUNTIME:. Decris ce que tu peux faire ici sans inventer.',
    expectedKeywords: ['capa:', 'ui:', 'memory:', 'runtime:'],
  },
  {
    id: 'memory-seed',
    prompt: `Memorise pour cette session seulement: CODE=${MEMORY_FACTS.code}; DOSSIER=${MEMORY_FACTS.dossier}; GARDE=${MEMORY_FACTS.garde}. Reponds seulement ACK-MEM.`,
    expectedKeywords: ['ack', 'mem'],
  },
  {
    id: 'memory-recall',
    prompt:
      'Rappelle uniquement CODE, DOSSIER et GARDE memorises plus haut, sur une seule ligne.',
    expectedKeywords: [
      MEMORY_FACTS.code.toLowerCase(),
      MEMORY_FACTS.dossier.toLowerCase(),
    ],
  },
  {
    id: 'transparency',
    prompt:
      "Sans inventer, reponds en 3 points: provider reel utilise, si le reseau a ete utilise, et ce que l'UI permet d'exporter.",
    expectedKeywords: ['provider', 'reseau', 'export'],
  },
];

const report = {
  timestamp: new Date().toISOString(),
  suite: 'chat-ui-complete-runtime',
  canonicalRoute: '/titane',
  providerPreference: 'ollama',
  controls: {},
  turns: [],
  failures: [],
};

function normalizedIncludesCount(text, needles) {
  const haystack = String(text || '').toLowerCase();
  return needles.filter(needle => haystack.includes(String(needle).toLowerCase())).length;
}

async function persistReport() {
  await ensureArtifactsDir();
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
}

async function setRuntimeDefaults() {
  await browser.execute(() => {
    for (const key of Object.keys(window.localStorage)) {
      if (
        key.startsWith('titane_chat_mode_') ||
        key.startsWith('titane_conversation_') ||
        key === 'titane_chat_history' ||
        key === 'titane_chat_runtime_state' ||
        key === 'titane_active_conversation_id' ||
        key === 'omega-chat-conversation-id'
      ) {
        window.localStorage.removeItem(key);
      }
    }

    window.localStorage.setItem('onboarding_completed', 'true');
    window.localStorage.setItem('titane_onboarding_complete', '1');
    window.localStorage.setItem(
      'onboarding_preferences',
      JSON.stringify({
        profile: 'e2e',
        mode: 'default',
      })
    );
    window.localStorage.setItem('omega-chat-preferred-provider', 'ollama');
  });
}

async function waitForConversationRuntimeReady() {
  await browser.waitUntil(
    async () => {
      return browser.execute(() => {
        const input = document.querySelector('[data-testid="chat-input"]');
        const readyState = document
          .querySelector('[data-testid="chat-ready"]')
          ?.getAttribute('data-state');
        const errorVisible = Boolean(
          document.querySelector('[data-testid="chat-error"]')
        );

        if (
          !(input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement)
        ) {
          return false;
        }

        if (readyState === 'ready' || errorVisible) {
          return true;
        }

        return !input.disabled && !input.readOnly;
      });
    },
    {
      timeout: 20000,
      interval: 200,
      timeoutMsg: 'conversation runtime did not reach a ready/editable state',
    }
  );
}

async function setFieldValue(selector, value) {
  const element = await $(selector);
  await element.waitForExist({ timeout: 10000 });
  await browser.execute(
    (target, nextValue) => {
      if (!target) return;
      const normalized = String(nextValue ?? '');
      target.focus();

      const proto =
        target instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');

      if (descriptor?.set) {
        descriptor.set.call(target, normalized);
      } else {
        target.value = normalized;
      }

      try {
        target.dispatchEvent(
          new InputEvent('input', {
            bubbles: true,
            composed: true,
            data: normalized,
            inputType: 'insertText',
          })
        );
      } catch {
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }

      target.dispatchEvent(new Event('change', { bubbles: true }));
    },
    element,
    value
  );
}

async function setSelectValue(selector, value) {
  const select = await $(selector);
  await select.waitForExist({ timeout: 10000 });
  await browser.execute(
    (target, nextValue) => {
      if (!(target instanceof HTMLSelectElement)) return;
      target.value = String(nextValue ?? '');
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
    },
    select,
    value
  );
  await browser.waitUntil(
    async () => {
      const current = await $(selector);
      return (await current.getValue()) === value;
    },
    {
      timeout: 5000,
      interval: 150,
      timeoutMsg: `select value did not settle for ${selector}`,
    }
  );
}

async function clickSelector(selector) {
  const element = await $(selector);
  await element.waitForExist({ timeout: 10000 });
  await browser.execute(target => {
    target?.scrollIntoView({ block: 'center', inline: 'center' });
    target?.click();
  }, element);
}

async function activateTitaneTab(selector, panelSelector) {
  await clickSelector(selector);
  await browser.waitUntil(
    async () => {
      const tab = await $(selector);
      return (await tab.getAttribute('aria-selected')) === 'true';
    },
    {
      timeout: 10000,
      interval: 150,
      timeoutMsg: `tab did not activate: ${selector}`,
    }
  );

  if (!panelSelector) {
    return;
  }

  await waitForDisplayed(panelSelector);
}

async function ensureCanonicalChatSurface() {
  await openApp();
  await waitAppReady();
  await setRuntimeDefaults();

  try {
    await browser.url('tauri://localhost/#/chat');
  } catch {
    // Navigation fallback below still uses the canonical top nav.
  }

  await waitAppReady();
  await gotoTopNavPage(uiPages.titane);
  await clickSelector('[data-testid="tab-conversation"]');
  await waitForDisplayed('[data-testid="page-conversation"]');
  await waitForDisplayed('[data-testid="chat-input"]');
  await waitForDisplayed('[data-testid="chat-send"]');
  await waitForConversationRuntimeReady();
}

async function collectChatSnapshot() {
  return await browser.execute(() => {
    const text = node => (node?.textContent || '').trim();
    const assistantRows = Array.from(
      document.querySelectorAll('[data-testid="chat-message-assistant"]')
    );
    const userRows = Array.from(
      document.querySelectorAll('[data-testid="chat-message-user"]')
    );
    const lastAssistant = assistantRows[assistantRows.length - 1] || null;
    const lastUser = userRows[userRows.length - 1] || null;
    const runtimePanel = document.querySelector('[data-testid="chat-runtime-state"]');
    const runtimeSummary = document.querySelector('[data-testid="chat-runtime-summary"]');
    const runtimeBadges = Array.from(
      document.querySelectorAll('[data-testid="chat-runtime-badge"]')
    ).map(text);
    const visibleMessageTexts = Array.from(
      document.querySelectorAll('[data-testid="chat-message-content"]')
    ).map(text);

    return {
      url: window.location.href || '',
      userCount: userRows.length,
      assistantCount: assistantRows.length,
      latestUserText: text(
        lastUser?.querySelector('[data-testid="chat-message-content"]') || lastUser
      ),
      latestAssistantText: text(
        lastAssistant?.querySelector('[data-testid="chat-message-content"]') ||
          lastAssistant
      ),
      visibleMessageTexts,
      providerWarningVisible: Boolean(
        document.querySelector('[data-testid="chat-provider-warning"]')
      ),
      chatReadyState:
        document
          .querySelector('[data-testid="chat-ready"]')
          ?.getAttribute('data-state') || '',
      sendTraceState:
        document
          .querySelector('[data-testid="chat-send-trace"]')
          ?.getAttribute('data-state') || '',
      sendTraceMeta:
        document
          .querySelector('[data-testid="chat-send-trace"]')
          ?.getAttribute('data-meta') || '',
      loadingVisible: Boolean(document.querySelector('[data-testid="chat-loading"]')),
      inputDisabled: Boolean(
        document.querySelector('[data-testid="chat-input"]')?.disabled
      ),
      runtime: {
        summary: text(runtimeSummary),
        providerUsed: runtimePanel?.getAttribute('data-provider-used') || '',
        providerMode: runtimePanel?.getAttribute('data-provider-mode') || '',
        providerReason: runtimePanel?.getAttribute('data-provider-reason') || '',
        networkUsed: runtimePanel?.getAttribute('data-network-used') || '',
        orchestratorState: runtimePanel?.getAttribute('data-orchestrator-state') || '',
        memoryState: runtimePanel?.getAttribute('data-memory-state') || '',
        ollamaModel: runtimePanel?.getAttribute('data-ollama-model') || '',
        badges: runtimeBadges.filter(Boolean),
      },
    };
  });
}

async function collectChatProgressSnapshot() {
  return await browser.execute(() => {
    const text = node => (node?.textContent || '').trim();
    const assistantRows = Array.from(
      document.querySelectorAll('[data-testid="chat-message-assistant"]')
    );
    const userRows = Array.from(
      document.querySelectorAll('[data-testid="chat-message-user"]')
    );
    const lastAssistant = assistantRows[assistantRows.length - 1] || null;
    const runtimePanel = document.querySelector('[data-testid="chat-runtime-state"]');

    return {
      assistantCount: assistantRows.length,
      userCount: userRows.length,
      latestAssistantText: text(
        lastAssistant?.querySelector('[data-testid="chat-message-content"]') ||
          lastAssistant
      ),
      chatReadyState:
        document
          .querySelector('[data-testid="chat-ready"]')
          ?.getAttribute('data-state') || '',
      sendTraceState:
        document
          .querySelector('[data-testid="chat-send-trace"]')
          ?.getAttribute('data-state') || '',
      loadingVisible: Boolean(document.querySelector('[data-testid="chat-loading"]')),
      providerReason: runtimePanel?.getAttribute('data-provider-reason') || '',
      providerUsed: runtimePanel?.getAttribute('data-provider-used') || '',
      providerMode: runtimePanel?.getAttribute('data-provider-mode') || '',
    };
  });
}

function assertNoMockStub(text, label) {
  assert.ok(
    !String(text || '')
      .toLowerCase()
      .includes(MOCK_STUB),
    `${label}: OMEGA mock stub detected instead of a real answer`
  );
}

function assertChampionRuntime(snapshot, label) {
  const providerEvidence = [
    snapshot.runtime.providerUsed,
    snapshot.runtime.summary,
    ...snapshot.runtime.badges,
  ]
    .join(' ')
    .toUpperCase();

  assert.match(
    providerEvidence,
    /(OLLAMA|LOCAL|OMEGA\+SINGULARITY)/,
    `${label}: expected a local/Ollama runtime, got ${providerEvidence || '<empty>'}`
  );
  assert.ok(
    snapshot.runtime.providerReason === '' || snapshot.runtime.providerReason === 'OK',
    `${label}: provider reason is not OK (${snapshot.runtime.providerReason || '<empty>'})`
  );
  assert.notEqual(
    snapshot.runtime.networkUsed,
    'true',
    `${label}: expected a local run without network usage`
  );
}

async function sendTurn(scenario) {
  const before = await collectChatProgressSnapshot();
  await sendChatAndAssertNoSilence(scenario.prompt, 150000);

  await browser.waitUntil(
    async () => {
      const current = await collectChatProgressSnapshot();
      return (
        current.assistantCount > before.assistantCount ||
        current.latestAssistantText !== before.latestAssistantText ||
        (current.providerReason.length > 0 && current.providerReason !== 'OK')
      );
    },
    {
      timeout: 120000,
      interval: 750,
      timeoutMsg: `assistant response did not materialize for scenario ${scenario.id}`,
    }
  );

  const after = await collectChatSnapshot();
  report.turns.push({
    id: scenario.id,
    prompt: scenario.prompt,
    response: after.latestAssistantText,
    runtime: after.runtime,
  });

  assert.ok(
    after.latestAssistantText.length >= 8,
    `${scenario.id}: assistant text too short`
  );
  assertNoMockStub(after.latestAssistantText, scenario.id);
  assertChampionRuntime(after, scenario.id);

  return after;
}

describe('Desktop chat UI complete runtime proof', () => {
  after(async () => {
    await persistReport();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      const screenshotPath = await captureFailureScreenshot(this.currentTest.fullTitle());
      report.failures.push({
        test: this.currentTest.fullTitle(),
        screenshotPath,
      });
      await persistReport();
    }
  });

  it('covers the canonical chat shell, the full real chat runtime, and Titane tabs in one governed proof', async function () {
    this.timeout(480000);

    await ensureCanonicalChatSurface();

    const requiredControls = [
      'page-conversation',
      'select-chat-provider',
      'chat-mode-selector-select',
      'btn-export-json',
      'btn-export-markdown',
      'btn-clear-chat',
      'input-conversation-search',
      'toggle-voice-input',
      'chat-input',
      'chat-send',
    ];

    for (const testId of requiredControls) {
      const selector = `[data-testid="${testId}"]`;
      const element = await waitForDisplayed(selector);
      report.controls[testId] = await element.isDisplayed();
      assert.equal(report.controls[testId], true, `Missing visible control ${testId}`);
    }

    const providerSelect = await $('[data-testid="select-chat-provider"]');
  const modeSelect = await $('[data-testid="chat-mode-selector-select"]');
    assert.equal(await providerSelect.getValue(), 'ollama');
    assert.equal(await modeSelect.getValue(), 'default');

    const cleanStartSnapshot = await collectChatSnapshot();
    report.cleanStart = cleanStartSnapshot;
    assert.equal(
      cleanStartSnapshot.userCount,
      0,
      'chat did not start from a clean user state'
    );
    assert.equal(
      cleanStartSnapshot.assistantCount,
      0,
      'chat did not start from a clean assistant state'
    );

    const capabilityOutcome = await sendTurn(ADVANCED_SCENARIOS[0]);
    assert.ok(
      normalizedIncludesCount(
        capabilityOutcome.latestAssistantText,
        ADVANCED_SCENARIOS[0].expectedKeywords
      ) >= 2,
      'capabilities: assistant answer missed the requested capability anchors'
    );

    await sendTurn(ADVANCED_SCENARIOS[1]);

    const recallOutcome = await sendTurn(ADVANCED_SCENARIOS[2]);
    assert.match(
      recallOutcome.latestAssistantText.toUpperCase(),
      new RegExp(`${MEMORY_FACTS.code}.*${MEMORY_FACTS.dossier}.*${MEMORY_FACTS.garde}`),
      'memory-recall: seeded facts were not recalled in order'
    );
    assert.ok(
      recallOutcome.runtime.memoryState.length > 0 &&
        !['UNKNOWN', 'NONE', 'MISSING'].includes(
          recallOutcome.runtime.memoryState.toUpperCase()
        ),
      `memory-recall: memory state not exposed (${recallOutcome.runtime.memoryState})`
    );

    const transparencyOutcome = await sendTurn(ADVANCED_SCENARIOS[3]);
    assert.ok(
      normalizedIncludesCount(
        transparencyOutcome.latestAssistantText,
        ADVANCED_SCENARIOS[3].expectedKeywords
      ) >= 2,
      'transparency: answer did not cover provider/network/export topics'
    );
    assert.equal(
      transparencyOutcome.runtime.ollamaModel,
      'gemma2:2b',
      'transparency: runtime panel did not expose the governed Ollama model marker'
    );
    assert.ok(
      transparencyOutcome.runtime.summary.includes('Conversation mode: default'),
      `runtime summary missing conversation mode truth (${transparencyOutcome.runtime.summary})`
    );
    assert.ok(
      transparencyOutcome.runtime.badges.includes('conversation-mode:default'),
      `runtime badges missing conversation mode truth (${transparencyOutcome.runtime.badges.join(', ')})`
    );

    await setFieldValue('[data-testid="input-conversation-search"]', MEMORY_FACTS.code);
    await browser.waitUntil(
      async () => {
        const snapshot = await collectChatSnapshot();
        return (
          snapshot.visibleMessageTexts.length > 0 &&
          snapshot.visibleMessageTexts.every(text =>
            text.toUpperCase().includes(MEMORY_FACTS.code)
          )
        );
      },
      {
        timeout: 10000,
        interval: 200,
        timeoutMsg: 'search did not filter the conversation to the seeded memory fact',
      }
    );

    await setSelectValue('[data-testid="select-conversation-role"]', 'assistant');
    await browser.waitUntil(
      async () => {
        const snapshot = await collectChatSnapshot();
        return snapshot.userCount === 0 && snapshot.assistantCount > 0;
      },
      {
        timeout: 10000,
        interval: 200,
        timeoutMsg: 'assistant role filter did not hide user rows',
      }
    );

    await browser.execute(() => {
      window.confirm = () => true;
    });
    await clickSelector('[data-testid="btn-clear-chat"]');

    await browser.waitUntil(
      async () => {
        const snapshot = await collectChatSnapshot();
        return snapshot.userCount === 0 && snapshot.assistantCount === 0;
      },
      {
        timeout: 10000,
        interval: 200,
        timeoutMsg: 'clear chat did not remove visible rows',
      }
    );

    const finalSnapshot = await collectChatSnapshot();
    assert.equal(finalSnapshot.userCount, 0);
    assert.equal(finalSnapshot.assistantCount, 0);

    for (const selector of uiPages.titane.tabs) {
      await activateTitaneTab(selector);
    }
    await activateTitaneTab(
      '[data-testid="tab-conversation"]',
      '[data-testid="page-conversation"]'
    );

    const postTabSnapshot = await collectChatSnapshot();
    assert.equal(postTabSnapshot.providerWarningVisible, false);
  });
});
