import assert from 'node:assert/strict';

import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  getModelBadges,
  openChat,
  sendMessage,
} from './ui-driver.wdio.js';

describe('Chat model truth chain (WDIO/Tauri)', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it('publishes requested, used and shown model truth from the canonical runtime panel', async function () {
    this.timeout(180000);

    await openChat();
    await sendMessage(
      '[MODEL_TRUTH] Reponds en une phrase courte et expose la verite runtime.'
    );

    const { requested, used, shown, runtime } = await getModelBadges();

    assert.equal(requested, 'gemma2:2b');
    assert.equal(used, 'gemma2:2b');
    assert.equal(shown, 'gemma2:2b');
    assert.match(runtime.providerUsed, /ollama|local|omega/i);
    assert.notEqual(runtime.orchestratorState, '');
    assert.equal(runtime.pageConversationMode, 'default');
    assert.equal(runtime.pageChatStoreMode, 'default');
    assert.equal(runtime.runtimeConversationMode, 'default');
    assert.equal(runtime.runtimeChatStoreMode, 'default');
    assert.ok(runtime.summary.includes('Conversation mode: default'));
    assert.ok(runtime.summary.includes('Store mode: default'));
    assert.ok(runtime.badges.includes('conversation-mode:default'));
    assert.ok(runtime.badges.includes('chat-store-mode:default'));

    await browser.execute(() => {
      const panel = document.querySelector('[data-testid="reasoning-progress"]');
      if (panel instanceof HTMLElement) {
        panel.click();
      }
    });

    await browser.waitUntil(
      async () =>
        browser.execute(
          () =>
            document
              .querySelector('[data-testid="reasoning-summary-model"]')
              ?.getAttribute('data-model-used') === 'gemma2:2b'
        ),
      {
        timeout: 10000,
        timeoutMsg: 'ThinkingPanel summary model truth did not hydrate',
      }
    );

    const reasoningTrigger = await $('[data-testid="reasoning-progress"]');
    await reasoningTrigger.waitForExist({ timeout: 10000 });
    await reasoningTrigger.click();

    const detailButton = await $('button=Detaille');
    if (await detailButton.isExisting()) {
      await detailButton.click();
    }

    await browser.waitUntil(
      async () =>
        browser.execute(() => {
          const summary = document.querySelector(
            '[data-testid="reasoning-summary-model"]'
          );
          return Boolean(summary && summary.getAttribute('data-model-used'));
        }),
      {
        timeout: 10000,
        timeoutMsg: 'reasoning-summary-model n est pas disponible avec data-model-used',
      }
    );

    const thinkingModel = await browser.execute(() => {
      const panel = document.querySelector('[data-testid="reasoning-progress"]');
      const summary = document.querySelector('[data-testid="reasoning-summary-model"]');
      return {
        panelUsed: panel?.getAttribute('data-model-used') || '',
        panelRequested: panel?.getAttribute('data-model-requested') || '',
        summaryUsed: summary?.getAttribute('data-model-used') || '',
        summaryText: (summary?.textContent || '').trim(),
      };
    });

    assert.equal(thinkingModel.panelUsed, 'gemma2:2b');
    assert.equal(thinkingModel.panelRequested, 'gemma2:2b');
    assert.equal(thinkingModel.summaryUsed, 'gemma2:2b');
    assert.match(thinkingModel.summaryText, /gemma2:2b/);
  });
});
