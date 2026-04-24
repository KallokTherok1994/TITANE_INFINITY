import assert from 'node:assert/strict';

import { canonicalRoutePages } from './page-objects/uiPages.po.js';
import {
  auditCanonicalDesktopPage,
  captureFailureScreenshot,
  ensureArtifactsDir,
  openApp,
  waitAppReady,
  writeDesktopPageAuditReport,
} from './ui-driver.wdio.js';

const moreMenuExpectations = new Map([
  ['/twins', 'nav-twins'],
  ['/optimization', 'nav-optimization'],
  ['/performance', 'nav-optimization'],
  ['/total-dev', 'nav-total-dev'],
]);

describe('Canonical UI pages (WDIO/Tauri)', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it('audits every canonical UI route root, owner navigation and declared desktop tabs', async function () {
    this.timeout(900000);
    const pageAudits = [];

    for (const [index, page] of canonicalRoutePages.entries()) {
      if (index > 0) {
        await browser.reloadSession();
      }

      await openApp();
      await waitAppReady();

      await browser.url(`tauri://localhost${page.route}`);

      pageAudits.push(
        await auditCanonicalDesktopPage(page, {
          moreMenuExpectations,
        })
      );
    }

    const reportPath = await writeDesktopPageAuditReport({
      suite: 'canonical-ui-pages',
      runtime: 'tauri-wdio',
      auditedAt: new Date().toISOString(),
      pageCount: canonicalRoutePages.length,
      tabbedPageCount: pageAudits.filter(page => page.declaredTabCount > 0).length,
      pages: pageAudits,
    });

    assert.equal(pageAudits.length, canonicalRoutePages.length);
    assert.ok(reportPath.endsWith('canonical-ui-pages-audit.json'));
  });
});
