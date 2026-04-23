import assert from 'node:assert/strict';

import { canonicalRoutePages } from './page-objects/uiPages.po.js';
import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  getCurrentPathname,
  openApp,
  waitAppReady,
} from './ui-driver.wdio.js';

const moreMenuExpectations = new Map([
  ['/twins', 'nav-twins'],
  ['/optimization', 'nav-optimization'],
  ['/performance', 'nav-optimization'],
  ['/total-dev', 'nav-total-dev'],
]);

async function assertNavOwnership(page) {
  const expectedMoreNav = moreMenuExpectations.get(page.route);
  if (expectedMoreNav) {
    const moreButton = await $('[data-testid="btn-nav-more"]');
    await moreButton.waitForExist({ timeout: 10000 });
    await browser.waitUntil(
      async () => (await moreButton.getAttribute('aria-current')) === 'page',
      {
        timeout: 10000,
        interval: 200,
        timeoutMsg: `btn-nav-more should stay active on ${page.route}`,
      }
    );

    await moreButton.click();
    const ownerNav = await $(`[data-testid="${expectedMoreNav}"]`);
    await ownerNav.waitForExist({ timeout: 10000 });
    await browser.waitUntil(
      async () => (await ownerNav.getAttribute('aria-current')) === 'page',
      {
        timeout: 10000,
        interval: 200,
        timeoutMsg: `${expectedMoreNav} should stay active on ${page.route}`,
      }
    );
    return;
  }

  const ownerNav = await $(`[data-testid="${page.navTestId}"]`);
  await ownerNav.waitForExist({ timeout: 10000 });
  await browser.waitUntil(
    async () => (await ownerNav.getAttribute('aria-current')) === 'page',
    {
      timeout: 10000,
      interval: 200,
      timeoutMsg: `${page.navTestId} should stay active on ${page.route}`,
    }
  );
}

describe('Canonical UI pages (WDIO/Tauri)', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it('mounts every canonical UI route on its visible root and keeps navigation ownership aligned', async function () {
    this.timeout(900000);

    await openApp();
    await waitAppReady();

    for (const page of canonicalRoutePages) {
      await browser.url(`tauri://localhost${page.route}`);

      const root = await $(page.root);
      await root.waitForExist({ timeout: 10000 });
      assert.equal(await root.isDisplayed(), true, `root not visible for ${page.id}`);

      const pathname = await getCurrentPathname();
      assert.equal(pathname, page.route, `canonical route mismatch for ${page.id}`);

      await assertNavOwnership(page);
    }
  });
});
