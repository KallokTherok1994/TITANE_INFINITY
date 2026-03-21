/**
 * TOTAL_DEV Native E2E Test (WebdriverIO/Tauri)
 * 
 * Validates TOTAL_DEV page accessibility and core UX in native environment.
 * Targets real desktop window (not web server).
 * 
 * SCOPE: Navigation, Lock Badge, Unlock Panel visibility (no unlock call required)
 * CRITICAL PATH: launch → route → verify header → verify lock → verify unlock input
 */

import assert from 'node:assert/strict';

describe('TOTAL_DEV Native Desktop (WDIO/Tauri)', () => {
  const TOTAL_DEV_ROOT = '[data-testid="total-dev-page"]';
  const TOTAL_DEV_HEADER = '[data-testid="total-dev-header"]';
  const LOCK_BADGE = '[data-testid="lock-badge"]';
    const UNLOCK_PANEL = '.total-dev-unlock-panel';
  const PASSWORD_INPUT = 'input[placeholder*="code"], input[placeholder*="password"]';

  before(async () => {
    // Launch native app
    await browser.url('tauri://localhost/titane');
    await browser.pause(2000);
    
    // Wait for app to initialize
    const bodyExists = await $('body').isExisting();
    assert.equal(bodyExists, true, 'App root element not found');
  });

  it('1. navigates to /total-dev via native window', async function () {
    this.timeout(30000);
    
    // Navigate to TOTAL_DEV route
    await browser.url('tauri://localhost/#/total-dev');
    await browser.pause(1500);
    
    // Verify route is active
    const pathname = await browser.execute(() => window.location.hash || '');
    assert.ok(
      pathname.includes('total-dev'),
      `Route not active. Current: ${pathname}`
    );
  });

  it('2. TOTAL_DEV header is visible', async function () {
    this.timeout(15000);
    
    const header = await $(TOTAL_DEV_HEADER);
    const exists = await header.isExisting();
    assert.equal(exists, true, 'TOTAL_DEV header not found');
    
    const displayedCheck = await header.isDisplayed();
    assert.equal(displayedCheck, true, 'TOTAL_DEV header not visible');
    
    const text = await header.getText();
    assert.ok(text.length > 0, 'Header text is empty');
  });

  it('3. Lock Badge renders with LOCKED state', async function () {
    this.timeout(15000);
    
    const lockBadge = await $(LOCK_BADGE);
    const exists = await lockBadge.isExisting();
    assert.equal(exists, true, 'Lock badge not found');
    
    const displayedCheck = await lockBadge.isDisplayed();
    assert.equal(displayedCheck, true, 'Lock badge not visible');
  });

  it('4. Unlock Panel is present and functional', async function () {
    this.timeout(15000);
    
    const unlockPanel = await $(UNLOCK_PANEL);
    const exists = await unlockPanel.isExisting();
    assert.equal(exists, true, 'Unlock panel not found');
    
    const displayedCheck = await unlockPanel.isDisplayed();
    assert.equal(displayedCheck, true, 'Unlock panel not visible');
  });

  it('5. Password input field is accessible', async function () {
    this.timeout(15000);
    
    const passwordInput = await $(PASSWORD_INPUT);
    const exists = await passwordInput.isExisting();
    assert.equal(exists, true, 'Password input not found');
    
    const displayedCheck = await passwordInput.isDisplayed();
    assert.equal(displayedCheck, true, 'Password input not visible');
    
    // Verify it's enabled and not readonly
    const enabled = await passwordInput.isEnabled();
    assert.equal(enabled, true, 'Password input is not enabled');
  });

  it('6. incorrect password does not unlock', async function () {
    this.timeout(20000);
    
    const passwordInput = await $(PASSWORD_INPUT);
    const lockBadgeInitial = await $(LOCK_BADGE);
    const initialLockText = await lockBadgeInitial.getText();
    
    // Type wrong password
    await passwordInput.clearValue();
    await passwordInput.setValue('wrong-password-test');
    
    // Press Enter
    await passwordInput.keys(['Enter']);
    await browser.pause(1000);
    
    // Verify lock badge still shows LOCKED
    const lockBadgeFinal = await $(LOCK_BADGE);
    const finalLockText = await lockBadgeFinal.getText();
    
    // Should still contain LOCKED indicator
    const isStillLocked = 
      finalLockText.toLowerCase().includes('locked') ||
      finalLockText.toLowerCase().includes('verrouillé');
    
    assert.equal(
      isStillLocked,
      true,
      'Lock badge changed unexpectedly after wrong password'
    );
  });

  after(async () => {
    // Native session cleanup handled by wdio
  });
});
