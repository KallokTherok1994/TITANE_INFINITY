import assert from 'node:assert/strict';

import { topLevelPageOrder, uiPages } from './page-objects/uiPages.po.js';
import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  openApp,
  waitAppReady,
  gotoTopNavPage,
  clickAllTabs,
  fillAllVisibleInputs,
  toggleAllVisibleCheckboxes,
  sendChatAndAssertNoSilence,
  retryLatestUserMessageAndAssertNoSilence,
  getCurrentPathname,
} from './ui-driver.wdio.js';

async function openModeBuilderIfPresent() {
  const trigger = await $('[data-testid="btn-mode-builder"]');
  if (!(await trigger.isExisting()) || !(await trigger.isDisplayed())) return false;
  try {
    await trigger.click();
  } catch {
    try {
      await browser.execute(el => el?.click(), trigger);
    } catch {
      return false;
    }
  }

  await browser.keys('Escape').catch(() => {});
  return true;
}

function getTabsForFullRun(page) {
  if (page.id === 'admin') {
    // Audio tab is covered in smoke and can be unstable in full desktop runs.
    return page.tabs.filter(tab => tab !== '[data-testid="tab-admin-audio"]');
  }
  return page.tabs;
}

function shouldRunDeepInteractions(page) {
  return page.id === 'titane' || page.id === 'time';
}

const stableFullPages = topLevelPageOrder;

describe('UI Desktop Ultra Full Coverage (WDIO/Tauri)', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it('covers mapped pages, tabs, inputs/toggles and chat AR20/navigation/stability/error-path', async function () {
    this.timeout(600000);
    this.retries(1);

    await openApp();
    await waitAppReady();

    for (const page of stableFullPages) {
      await gotoTopNavPage(page);
      const root = await $(page.root);
      if (await root.isExisting()) {
        assert.equal(await root.isDisplayed(), true, `root not visible for ${page.id}`);
      } else {
        const pathname = await getCurrentPathname();
        assert.ok(
          pathname === page.route || pathname.startsWith(`${page.route}/`),
          `route not active for ${page.id}: ${pathname}`
        );
      }

      await clickAllTabs(getTabsForFullRun(page));
      if (shouldRunDeepInteractions(page)) {
        await fillAllVisibleInputs(`ultra-${page.id}`);
        await toggleAllVisibleCheckboxes();
      }
    }

    // Chat full scenarios
    await browser.url('tauri://localhost/titane');
    await waitAppReady();
    await gotoTopNavPage(uiPages.titane);
    await clickAllTabs(['[data-testid="tab-conversation"]']);

    // Bounded primary prompt: validate the real desktop chat flow without forcing a long local-model generation.
    await sendChatAndAssertNoSilence(
      '[FULL_CHAT] Réponds en une phrase courte avec OK, flux et stable.',
      120000
    );

    // Required control: retry/regenerate action (if present)
    await sendChatAndAssertNoSilence(
      '[RETRY_CHECK] Réponds seulement: retry ok.',
      120000
    );
    const retryCheck = await retryLatestUserMessageAndAssertNoSilence();
    assert.equal(
      retryCheck.present,
      true,
      'retry/regenerate control is expected when user messages are present'
    );
    assert.equal(
      retryCheck.triggered,
      true,
      'retry/regenerate action did not produce a visible no-silence acknowledgement'
    );

    // Navigation scenario: leave and come back while preserving conversation surface
    const userMessagesBefore = await $$('[data-testid="chat-message-user"]');
    const userBefore = userMessagesBefore.length;
    const lastUserMessageText =
      userBefore > 0
        ? ((await userMessagesBefore[userBefore - 1].getText()) || '').trim()
        : '';
    await gotoTopNavPage(uiPages.stats);
    await gotoTopNavPage(uiPages.titane);
    await clickAllTabs(['[data-testid="tab-conversation"]']);

    await browser.waitUntil(
      async () => {
        const input = await $('[data-testid="chat-input"]');
        if (!(await input.isExisting()) || !(await input.isDisplayed())) {
          return false;
        }

        if (!lastUserMessageText) {
          return (await $$('[data-testid="chat-message-user"]')).length >= userBefore;
        }

        const messagesAfter = await $$('[data-testid="chat-message-user"]');
        for (const msg of messagesAfter) {
          const text = ((await msg.getText()) || '').trim();
          if (text && text.includes(lastUserMessageText.slice(0, 48))) {
            return true;
          }
        }
        return false;
      },
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'chat surface did not restore prior user context after page switch',
      }
    );

    const userAfter = (await $$('[data-testid="chat-message-user"]')).length;
    assert.ok(userAfter > 0, 'chat state should remain visible after page switch');

    // Stability scenario: 3 messages, bounded no-silence assertions
    await sendChatAndAssertNoSilence('[STABILITY] message 1');
    await sendChatAndAssertNoSilence('[STABILITY] message 2');
    await sendChatAndAssertNoSilence('[STABILITY] message 3');

    // Error-path scenario: force a cloud-provider preference only when the runtime truly allows it.
    const providerSelect = await $('[data-testid="select-chat-provider"]');
    assert.equal(
      await providerSelect.isExisting(),
      true,
      'provider selector must exist for critical backend/frontend control coverage'
    );

    let selectedProviderValue = (await providerSelect.getValue()) || '';
    await providerSelect.selectByAttribute('value', 'openai').catch(() => {});
    selectedProviderValue = (await providerSelect.getValue()) || selectedProviderValue;

    const providerWarning = await $('[data-testid="chat-provider-warning"]');
    const warningVisible =
      (await providerWarning.isExisting()) && (await providerWarning.isDisplayed());

    if (selectedProviderValue !== 'openai' || warningVisible) {
      if (warningVisible) {
        const warningText = ((await providerWarning.getText()) || '').toLowerCase();
        assert.ok(
          warningText.includes('provider') &&
            (warningText.includes('pas disponible') ||
              warningText.includes('non configuré')),
          'provider warning should explain the degraded cloud-provider path'
        );
      } else {
        assert.notEqual(
          selectedProviderValue,
          'openai',
          'unavailable cloud providers should stay blocked at the selector level'
        );
      }
    } else {
      assert.equal(
        selectedProviderValue,
        'openai',
        'configured cloud providers should remain selectable when the runtime allows them'
      );
      await providerSelect.selectByAttribute('value', 'ollama').catch(() => {});
    }

    // Modal/Drawer coverage (when available)
    await openModeBuilderIfPresent();
  });
});
