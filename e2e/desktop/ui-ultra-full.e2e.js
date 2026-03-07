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

const stableFullPages = topLevelPageOrder.filter(
  page => page.id !== 'fusion' && page.id !== 'optimization'
);

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

    // AR20-like longer prompt
    await sendChatAndAssertNoSilence(
      '[AR20] conversation longue: donne une synthèse structurée avec 5 points et une conclusion.'
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

    // Error-path scenario: force cloud provider preference then verify visible outcome (error or fallback)
    const providerSelect = await $('[data-testid="select-chat-provider"]');
    if (await providerSelect.isExisting()) {
      await providerSelect.selectByAttribute('value', 'openai').catch(() => {});
    }
    await sendChatAndAssertNoSilence(
      '[ERROR_PATH] simulate provider down and ensure visible fallback/error code'
    );

    // Modal/Drawer coverage (when available)
    await openModeBuilderIfPresent();
  });
});
