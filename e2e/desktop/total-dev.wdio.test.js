/**
 * TOTAL_DEV Native E2E Test (WebdriverIO/Tauri)
 * 
 * Validates TOTAL_DEV page accessibility and core UX in native environment.
 * Targets real desktop window (not web server).
 * 
 * SCOPE: Navigation, Lock Badge, Unlock Panel visibility (no unlock call required)
 * CRITICAL PATH: launch → nav click → verify header → verify lock → verify unlock input
 */

import assert from 'node:assert/strict';

describe('TOTAL_DEV Native Desktop (WDIO/Tauri)', () => {
  const TOTAL_DEV_HEADER = '[data-testid="total-dev-header"]';
  const LOCK_BADGE = '[data-testid="lock-badge"]';
  const UNLOCK_PANEL = '.total-dev-unlock-panel';
  const PASSWORD_INPUT = 'input[placeholder*="code"], input[placeholder*="password"]';
  const NAV_TOTAL_DEV = 'text=TOTAL DEV';
  const NAV_MORE = '[data-testid="btn-nav-more"]';

  before(async () => {
    // Launch native app
    await browser.url('tauri://localhost');
    await browser.pause(4000);
    
    // Wait for app to initialize
    const bodyExists = await $('body').isExisting();
    assert.equal(bodyExists, true, 'App root element not found');
  });

  it('1. navigates to TOTAL_DEV via top nav click', async function () {
    this.timeout(30000);
    
    // Wait for nav to be ready
    await browser.waitUntil(
      async () => {
        const nav = await $('[data-testid="nav-top-main"]');
        return nav.isExisting();
      },
      { timeout: 10000 }
    );
    
    // Try to find TOTAL_DEV nav item directly, or open "More" menu
    let totalDevNav = await $(NAV_TOTAL_DEV);
    if (!(await totalDevNav.isExisting())) {
      // Try clicking the "More" menu first
      const moreBtn = await $(NAV_MORE);
      if (await moreBtn.isExisting()) {
        await moreBtn.click();
        await browser.pause(500);
      }
    }
    
    // Now find and click TOTAL_DEV
    totalDevNav = await $(NAV_TOTAL_DEV);
    const exists = await totalDevNav.isExisting();
    assert.equal(exists, true, 'TOTAL_DEV nav item not found');
    
    await totalDevNav.click();
    await browser.pause(2000);
    
    // Verify route changed
    const url = await browser.execute(() => window.location.href || '');
    assert.ok(
      url.includes('/total-dev') || url.includes('total-dev'),
      `URL didn't change to /total-dev. Current: ${url}`
    );
  });

  it('2. TOTAL_DEV header is visible', async function () {
    this.timeout(30000);
    
    // Wait for header to appear
    await browser.waitUntil(
      async () => {
        const header = await $(TOTAL_DEV_HEADER);
        return header.isExisting();
      },
      {
        timeout: 10000,
        timeoutMsg: 'TOTAL_DEV header element did not appear'
      }
    );
    
    const header = await $(TOTAL_DEV_HEADER);
    const displayedCheck = await header.isDisplayed();
    assert.equal(displayedCheck, true, 'TOTAL_DEV header not visible');
    
    const text = await header.getText();
    assert.ok(text.includes('TOTAL_DEV'), 'Header text does not contain TOTAL_DEV');
  });

  it('3. Lock Badge renders', async function () {
    this.timeout(30000);
    
    const lockBadge = await $(LOCK_BADGE);
    const exists = await lockBadge.isExisting();
    assert.equal(exists, true, 'Lock badge not found');
  });

  it('4. Unlock Panel is present', async function () {
    this.timeout(30000);
    
    const unlockPanel = await $(UNLOCK_PANEL);
    const exists = await unlockPanel.isExisting();
    assert.equal(exists, true, 'Unlock panel not found');
  });

  it('5. Password input field is accessible', async function () {
    this.timeout(30000);
    
    const passwordInput = await $(PASSWORD_INPUT);
    const exists = await passwordInput.isExisting();
    assert.equal(exists, true, 'Password input not found');
    
    const enabled = await passwordInput.isEnabled();
    assert.equal(enabled, true, 'Password input is not enabled');
  });

  it('6. Page layout is complete', async function () {
    this.timeout(30000);
    
    // Verify all critical elements are present
    const header = await $(TOTAL_DEV_HEADER);
    const badge = await $(LOCK_BADGE);
    const panel = await $(UNLOCK_PANEL);
    
    assert.equal(await header.isExisting(), true, 'Header missing');
    assert.equal(await badge.isExisting(), true, 'Badge missing');
    assert.equal(await panel.isExisting(), true, 'Panel missing');
  });

  after(async () => {
    // Native session cleanup handled by wdio
  });
});
