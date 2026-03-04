import assert from "node:assert/strict";

import { topLevelPageOrder, uiPages } from "./page-objects/uiPages.po.js";
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
} from "./ui-driver.wdio.js";

async function openModeBuilderIfPresent() {
  const trigger = await $('[data-testid="btn-mode-builder"]');
  if (!(await trigger.isExisting()) || !(await trigger.isDisplayed()))
    return false;
  await trigger.click();
  await browser.keys("Escape");
  return true;
}

describe("UI Desktop Ultra Full Coverage (WDIO/Tauri)", () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === "failed") {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it("covers mapped pages, tabs, inputs/toggles and chat AR20/navigation/stability/error-path", async function () {
    this.timeout(600000);

    await openApp();
    await waitAppReady();

    for (const page of topLevelPageOrder) {
      await gotoTopNavPage(page);
      const root = await $(page.root);
      if (await root.isExisting()) {
        assert.equal(
          await root.isDisplayed(),
          true,
          `root not visible for ${page.id}`,
        );
      } else {
        const pathname = await getCurrentPathname();
        assert.ok(
          pathname === page.route || pathname.startsWith(`${page.route}/`),
          `route not active for ${page.id}: ${pathname}`,
        );
      }

      await clickAllTabs(page.tabs);
      await fillAllVisibleInputs(`ultra-${page.id}`);
      await toggleAllVisibleCheckboxes();
    }

    // Chat full scenarios
    await gotoTopNavPage(uiPages.titane);
    await clickAllTabs(['[data-testid="tab-conversation"]']);

    // AR20-like longer prompt
    await sendChatAndAssertNoSilence(
      "[AR20] conversation longue: donne une synthèse structurée avec 5 points et une conclusion.",
    );

    // Navigation scenario: leave and come back while preserving conversation surface
    const userBefore = (await $$('[data-testid="chat-message-user"]')).length;
    await gotoTopNavPage(uiPages.stats);
    await gotoTopNavPage(uiPages.titane);
    await clickAllTabs(['[data-testid="tab-conversation"]']);
    const userAfter = (await $$('[data-testid="chat-message-user"]')).length;
    assert.ok(
      userAfter >= userBefore,
      "chat state should remain visible after page switch",
    );

    // Stability scenario: 3 messages, bounded no-silence assertions
    await sendChatAndAssertNoSilence("[STABILITY] message 1");
    await sendChatAndAssertNoSilence("[STABILITY] message 2");
    await sendChatAndAssertNoSilence("[STABILITY] message 3");

    // Error-path scenario: force cloud provider preference then verify visible outcome (error or fallback)
    const providerSelect = await $('[data-testid="select-chat-provider"]');
    if (await providerSelect.isExisting()) {
      await providerSelect.selectByAttribute("value", "openai").catch(() => {});
    }
    await sendChatAndAssertNoSilence(
      "[ERROR_PATH] simulate provider down and ensure visible fallback/error code",
    );

    // Modal/Drawer coverage (when available)
    await openModeBuilderIfPresent();
  });
});
