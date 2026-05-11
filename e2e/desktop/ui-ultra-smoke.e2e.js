import assert from 'node:assert/strict';

import { topLevelPageOrder, uiPages } from './page-objects/uiPages.po.js';
import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  openApp,
  waitAppReady,
  gotoTopNavPage,
  clickAllTabs,
  toggleAllVisibleCheckboxes,
  sendChatAndAssertNoSilence,
  getCurrentPathname,
} from './ui-driver.wdio.js';

describe('UI Desktop Ultra Smoke (WDIO/Tauri)', () => {
  const stableSmokePages = topLevelPageOrder;

  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it('launches app, validates ready protocol, runs smoke navigation and no-silence chat', async function () {
    this.timeout(300000);

    await openApp();
    await waitAppReady();

    for (const page of stableSmokePages) {
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
    }

    await gotoTopNavPage(uiPages.titane);
    await clickAllTabs(['[data-testid="tab-conversation"]']);
    await sendChatAndAssertNoSilence(
      '[OFFLINE5] smoke: répondre même en mode dégradé local-first'
    );

    await gotoTopNavPage(uiPages.admin);
    await clickAllTabs(['[data-testid="tab-admin-audio"]']);
    const toggled = await toggleAllVisibleCheckboxes();
    if (toggled < 1) {
      // Only fail if there are ENABLED visible checkboxes that could not be toggled.
      // Disabled checkboxes are expected (read-only settings) and are not a failure.
      const checkboxes = await $$('input[type="checkbox"]');
      let enabledVisibleCheckboxes = 0;
      for (const checkbox of checkboxes) {
        if ((await checkbox.isDisplayed()) && (await checkbox.isEnabled())) {
          enabledVisibleCheckboxes += 1;
        }
      }
      assert.equal(
        enabledVisibleCheckboxes,
        0,
        'checkboxes are visible and enabled but none could be toggled in smoke flow'
      );
    }
  });
});
