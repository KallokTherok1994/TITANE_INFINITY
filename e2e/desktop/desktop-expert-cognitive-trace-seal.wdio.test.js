import assert from 'node:assert/strict';

import { captureFailureScreenshot, ensureArtifactsDir } from './ui-driver.wdio.js';

const SAFE_PROMPT =
  'Decris en deux phrases le role de TITANE comme assistant local de clarte.';

async function openDesktopChat() {
  await browser.url('tauri://localhost/#/chat');
  await browser.execute(() => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('titane_onboarding_complete', '1');
    localStorage.setItem('omega-chat-preferred-provider', 'ollama');

    // Force live path for this seal (no mock marker accepted)
    delete window.__TITANE_E2E_CHAT_MOCK__;
    window.__TITANE_E2E_CHAT_MOCK__ = false;
  });
  await browser.url('tauri://localhost/#/chat');
}

async function waitForNewAssistantMessage(previousCount) {
  await browser.waitUntil(
    async () => {
      const count = (await $$('[data-testid="chat-message-assistant"]')).length;
      return count > previousCount;
    },
    {
      timeout: 120000,
      interval: 500,
      timeoutMsg: 'No new assistant message appeared after composer send',
    }
  );

  const assistants = await $$('[data-testid="chat-message-assistant"]');
  return assistants[assistants.length - 1];
}

async function resolveActiveReasoningPanel(latestAssistant) {
  try {
    const inLatest = await latestAssistant.$('[data-testid="reasoning-progress"]');
    if (await inLatest.isExisting()) {
      await inLatest.waitForDisplayed({ timeout: 30000 });
      return inLatest;
    }
  } catch {
    // Fall through to global lookup.
  }

  await browser.waitUntil(
    async () => {
      const panels = await $$('[data-testid="reasoning-progress"]');
      return panels.length > 0;
    },
    {
      timeout: 60000,
      interval: 300,
      timeoutMsg: 'No reasoning progress panel found in desktop runtime',
    }
  );

  const panels = await $$('[data-testid="reasoning-progress"]');
  const activePanel = panels[panels.length - 1];
  await activePanel.waitForDisplayed({ timeout: 30000 });
  return activePanel;
}

async function clickExpertMode() {
  const expertButton = await $('button=Expert');
  await expertButton.waitForDisplayed({ timeout: 30000 });
  await expertButton.click();
}

describe('Desktop expert cognitive trace seal', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it('DESKTOP_EXPERT_COGNITIVE_TRACE_VISUAL_SEAL', async function () {
    this.timeout(240000);

    await openDesktopChat();

    const input = await $('[data-testid="chat-input"]');
    const send = await $('[data-testid="chat-send"]');

    await input.waitForDisplayed({ timeout: 30000 });
    await send.waitForDisplayed({ timeout: 30000 });

    const previousAssistantCount = (await $$('[data-testid="chat-message-assistant"]'))
      .length;

    await input.setValue(SAFE_PROMPT);
    await send.click();

    const latestAssistant = await waitForNewAssistantMessage(previousAssistantCount);
    await latestAssistant.scrollIntoView();

    const assistantText = (await latestAssistant.getText()) || '';
    assert.equal(
      assistantText.includes('[MOCK_OK]'),
      false,
      'Assistant response should not contain [MOCK_OK] in desktop visual seal'
    );

    const reasoningPanel = await resolveActiveReasoningPanel(latestAssistant);
    await reasoningPanel.click();

    await clickExpertMode();

    const requiredSelectors = [
      '[data-testid="reasoning-cognitive-trace"]',
      '[data-testid="reasoning-cognitive-verdict"]',
      '[data-testid="reasoning-cognitive-web-policy"]',
      '[data-testid="reasoning-cognitive-quality-action"]',
      '[data-testid="reasoning-cognitive-meta-guard"]',
      '[data-testid="reasoning-cognitive-meta-enforcement"]',
    ];

    for (const selector of requiredSelectors) {
      const el = await $(selector);
      await el.waitForDisplayed({ timeout: 60000 });
      assert.equal(await el.isDisplayed(), true, `Selector not visible: ${selector}`);
    }

    const pageText = await browser.execute(() => document.body.innerText || '');
    const forbidden = [
      'chainOfThought',
      'hiddenThoughts',
      'rawReasoning',
      'privateReasoning',
      'internalReasoningSteps',
    ];

    for (const marker of forbidden) {
      assert.equal(
        pageText.includes(marker),
        false,
        `Forbidden raw reasoning marker is visible: ${marker}`
      );
    }
  });
});
