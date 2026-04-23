import assert from 'node:assert/strict';

import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  getCurrentPathname,
  openApp,
  waitAppReady,
} from './ui-driver.wdio.js';

describe('Skills page crash probe (WDIO/Tauri)', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it('opens /skills directly and keeps the session alive', async function () {
    this.timeout(180000);

    await openApp();
    await waitAppReady();

    await browser.url('tauri://localhost/skills');

    const root = await $('[data-testid="page-skills"]');
    await root.waitForExist({ timeout: 10000 });
    assert.equal(await root.isDisplayed(), true, 'page-skills not visible');

    const pathname = await getCurrentPathname();
    assert.equal(pathname, '/skills', 'canonical route mismatch for /skills');

    const titaneNav = await $('[data-testid="nav-titane"]');
    await titaneNav.waitForExist({ timeout: 10000 });
    assert.equal(await titaneNav.getAttribute('aria-current'), 'page');
  });
});
