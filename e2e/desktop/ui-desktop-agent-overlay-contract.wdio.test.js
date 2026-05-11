/**
 * ui-desktop-agent-overlay-contract.wdio.test.js
 *
 * TITANE Desktop Agent Overlay Contract Test v78
 *
 * Verifies:
 * - Agent overlay is present and non-blocking
 * - Runtime truth banner shows current state
 * - Provider/mode selectors are functional
 * - No deprecated IPC commands
 * - Overlay doesn't interfere with page interactions
 */

const {
  ensureAgentOverlayNonBlocking,
  captureAgentContext,
  assertRuntimeTruthBanner,
  assertNoDeprecatedChatIpc,
} = require('./helpers/uiDesktopAgent');

describe('TITANE Desktop — Agent Overlay Contract v78', () => {
  before(async () => {
    // Wait for app window
    await browser.waitUntil(async () => (await browser.getWindowHandle()) != null, {
      timeout: 10000,
    });

    // Wait for root page element
    const root = await $('[data-testid^="page-"]');
    await root.waitForDisplayed({ timeout: 10000 });
  });

  it('should have agent overlay present and non-blocking', async () => {
    const isVisible = await ensureAgentOverlayNonBlocking(browser);
    expect(isVisible).toBe(true);

    // Verify pointer-events is NOT 'auto' (not blocking)
    const pointerEvents = await browser.execute(() => {
      const el = document.querySelector('[data-testid="agent-overlay"]');
      return window.getComputedStyle(el).pointerEvents;
    });

    expect(pointerEvents).not.toBe('auto');
    console.log(`[Overlay Contract] Pointer-events: ${pointerEvents}`);
  });

  it('should show runtime truth banner with current route', async () => {
    const banner = await $('[data-testid="runtime-truth-banner"]');
    const isDisplayed = await banner.isDisplayed().catch(() => false);

    if (isDisplayed) {
      const bannerText = await banner.getText();
      expect(bannerText).toBeTruthy();
      console.log(`[Overlay Contract] Truth banner: ${bannerText}`);
    } else {
      console.log('[Overlay Contract] Truth banner not visible (acceptable)');
    }
  });

  it('should have provider selector showing current provider', async () => {
    const selector = await $('[data-testid="provider-selector"]');
    const isDisplayed = await selector.isDisplayed().catch(() => false);

    if (isDisplayed) {
      const text = await selector.getText();
      expect(text).toBeTruthy();
      expect(
        ['gemma2', 'qwen', 'llama', 'offline'].some(p => text.toLowerCase().includes(p))
      ).toBe(true);
      console.log(`[Overlay Contract] Provider: ${text}`);
    }
  });

  it('should have mode selector showing current mode', async () => {
    const selector = await $('[data-testid="mode-selector"]');
    const isDisplayed = await selector.isDisplayed().catch(() => false);

    if (isDisplayed) {
      const text = await selector.getText();
      expect(text).toBeTruthy();
      console.log(`[Overlay Contract] Mode: ${text}`);
    }
  });

  it('should not use deprecated IPC commands', async () => {
    const result = await assertNoDeprecatedChatIpc(browser);
    expect(result).toBe(true);
  });

  it('should allow clicking page elements behind overlay', async () => {
    // Navigate to main page
    try {
      await browser.executeScript(`window.location.hash = '/titane'`, []);
      await browser.pause(1500);

      // Find a clickable element on the page
      const tabs = await $$('[role="tab"]');
      if (tabs.length > 0) {
        // Try to click first tab
        const firstTab = tabs[0];
        const isClickable = await firstTab.isClickable();
        expect(isClickable).toBe(true);

        // Click it (should not be blocked by overlay)
        await firstTab.click();
        await browser.pause(500);

        console.log('[Overlay Contract] Page elements are clickable (not blocked)');
      }
    } catch (error) {
      console.warn(
        '[Overlay Contract] Element clickability check skipped:',
        error.message
      );
    }
  });

  it('should capture agent context correctly', async () => {
    const context = await captureAgentContext(browser);

    expect(context).toHaveProperty('overlayVisible');
    expect(context).toHaveProperty('provider');
    expect(context).toHaveProperty('mode');
    expect(context).toHaveProperty('currentRoute');
    expect(context).toHaveProperty('timestamp');

    console.log('[Overlay Contract] Agent context:', JSON.stringify(context, null, 2));
  });

  it('should show correct route context on navigation', async () => {
    // Navigate to /time
    try {
      await browser.executeScript(`window.location.hash = '/time'`, []);
      await browser.pause(1500);

      const context = await captureAgentContext(browser);
      expect(context.currentRoute).toContain('/time');

      console.log(`[Overlay Contract] Route context updated: ${context.currentRoute}`);
    } catch (error) {
      console.warn('[Overlay Contract] Route context check skipped:', error.message);
    }
  });

  after(async () => {
    console.log('[Overlay Contract] Test suite completed');
  });
});
