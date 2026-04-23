import assert from 'node:assert/strict';

import { devEngineRoutePages } from './page-objects/uiPages.po.js';
import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  getCurrentPathname,
  openApp,
  waitAppReady,
} from './ui-driver.wdio.js';

describe('Desktop engine route inventory (WDIO/Tauri)', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it('mounts each DEV-owned engine route with a visible canonical root and active DEV nav state', async function () {
    this.timeout(300000);

    await openApp();
    await waitAppReady();

    for (const page of devEngineRoutePages) {
      await browser.url(`tauri://localhost${page.route}`);

      const root = await $(page.root);
      await root.waitForExist({ timeout: 10000 });
      assert.equal(await root.isDisplayed(), true, `root not visible for ${page.id}`);

      const pathname = await getCurrentPathname();
      assert.equal(pathname, page.route, `canonical route mismatch for ${page.id}`);

      const devNav = await $('[data-testid="nav-dev"]');
      await devNav.waitForExist({ timeout: 10000 });
      await browser.waitUntil(
        async () => (await devNav.getAttribute('aria-current')) === 'page',
        {
          timeout: 10000,
          interval: 200,
          timeoutMsg: `nav-dev should stay active on ${page.route}`,
        }
      );
    }
  });
});
