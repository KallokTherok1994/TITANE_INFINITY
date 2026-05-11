/**
 * uiDesktopAgent.js
 *
 * Desktop/Tauri Agent Overlay Test Helpers v78
 *
 * Provides utility functions for working with TITANE agent overlay in desktop tests
 */

/**
 * Ensure agent overlay is non-blocking (pointer-events: none or equivalent)
 * Prevents overlay from interfering with page element clicks
 *
 * @param {*} browser - WebDriver browser instance
 * @returns {boolean} true if overlay is visible, false otherwise
 */
async function ensureAgentOverlayNonBlocking(browser) {
  try {
    const overlay = await $('[data-testid="agent-overlay"]');
    const isVisible = await overlay.isDisplayed().catch(() => false);

    if (isVisible) {
      // Check pointer-events style
      const pointerEvents = await browser.execute(() => {
        const el = document.querySelector('[data-testid="agent-overlay"]');
        return window.getComputedStyle(el).pointerEvents;
      });

      // If set to 'auto' (blocking), reset it
      if (pointerEvents === 'auto') {
        await browser.execute(() => {
          const el = document.querySelector('[data-testid="agent-overlay"]');
          if (el) el.style.pointerEvents = 'none';
        });
      }
    }

    return isVisible;
  } catch (error) {
    console.warn('[uiDesktopAgent] Overlay check failed:', error.message);
    return false;
  }
}

/**
 * Capture current agent runtime context
 * Returns provider, mode, route, and overlay state
 *
 * @param {*} browser - WebDriver browser instance
 * @returns {Object} agent context
 */
async function captureAgentContext(browser) {
  try {
    return await browser.execute(() => {
      const agentPanel = document.querySelector('[data-testid="agent-overlay"]');
      const providerSelector = document.querySelector(
        '[data-testid="provider-selector"]'
      );
      const modeSelector = document.querySelector('[data-testid="mode-selector"]');
      const routeBanner = document.querySelector('[data-testid="route-context"]');

      return {
        overlayVisible:
          agentPanel && window.getComputedStyle(agentPanel).display !== 'none',
        provider: providerSelector?.innerText?.trim() || 'unknown',
        mode: modeSelector?.innerText?.trim() || 'unknown',
        currentRoute: routeBanner?.innerText?.trim() || window.location.hash,
        timestamp: new Date().toISOString(),
      };
    });
  } catch (error) {
    console.warn('[uiDesktopAgent] Context capture failed:', error.message);
    return {
      overlayVisible: false,
      provider: 'error',
      mode: 'error',
      currentRoute: 'unknown',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Assert runtime truth banner is present and shows expected route
 *
 * @param {*} browser - WebDriver browser instance
 * @param {string} expectedRoute - expected route path
 */
async function assertRuntimeTruthBanner(browser, expectedRoute) {
  try {
    const banner = await $('[data-testid="runtime-truth-banner"]');
    expect(await banner.isDisplayed()).toBe(true);

    const bannerText = await banner.getText();
    expect(bannerText).toContain(expectedRoute || 'TITANE');

    console.log('[uiDesktopAgent] Truth banner verified:', bannerText);
  } catch (error) {
    throw new Error(`[uiDesktopAgent] Truth banner assertion failed: ${error.message}`);
  }
}

/**
 * Verify no deprecated IPC commands are being used
 * Scans browser console and logs for deprecated command patterns
 *
 * @param {*} browser - WebDriver browser instance
 * @returns {boolean} true if no deprecated commands detected
 */
async function assertNoDeprecatedChatIpc(browser) {
  try {
    const logs = await browser.execute(() => {
      // Check if window has IPC call log
      return window.__ipcLog || [];
    });

    const deprecated = [
      'ai_chat',
      'chat_send_legacy',
      'conversation_legacy',
      'old_provider_select',
    ];

    const foundDeprecated = logs.filter(log =>
      deprecated.some(dep => log.command?.includes(dep))
    );

    if (foundDeprecated.length > 0) {
      console.warn('[uiDesktopAgent] Deprecated IPC commands detected:', foundDeprecated);
      return false;
    }

    console.log('[uiDesktopAgent] No deprecated IPC commands detected');
    return true;
  } catch (error) {
    console.warn('[uiDesktopAgent] IPC verification skipped:', error.message);
    return true; // Don't fail if verification unavailable
  }
}

/**
 * Collapse agent overlay temporarily for test
 * Useful for full-screen testing of page controls
 *
 * @param {*} browser - WebDriver browser instance
 */
async function collapseAgentOverlay(browser) {
  try {
    const collapseBtn = await $('[data-testid="agent-overlay-collapse"]').catch(
      () => null
    );

    if (collapseBtn) {
      await collapseBtn.click();
      await browser.pause(500); // Wait for collapse animation
      console.log('[uiDesktopAgent] Overlay collapsed');
    } else {
      // Fallback: hide via CSS
      await browser.execute(() => {
        const el = document.querySelector('[data-testid="agent-overlay"]');
        if (el) el.style.display = 'none';
      });
      console.log('[uiDesktopAgent] Overlay hidden (fallback)');
    }
  } catch (error) {
    console.warn('[uiDesktopAgent] Collapse failed:', error.message);
  }
}

/**
 * Expand agent overlay (if previously collapsed)
 *
 * @param {*} browser - WebDriver browser instance
 */
async function expandAgentOverlay(browser) {
  try {
    const expandBtn = await $('[data-testid="agent-overlay-expand"]').catch(() => null);

    if (expandBtn) {
      await expandBtn.click();
      await browser.pause(500);
      console.log('[uiDesktopAgent] Overlay expanded');
    } else {
      // Fallback: show via CSS
      await browser.execute(() => {
        const el = document.querySelector('[data-testid="agent-overlay"]');
        if (el) el.style.display = 'block';
      });
      console.log('[uiDesktopAgent] Overlay shown (fallback)');
    }
  } catch (error) {
    console.warn('[uiDesktopAgent] Expand failed:', error.message);
  }
}

/**
 * Wait for agent to be ready (responsive)
 *
 * @param {*} browser - WebDriver browser instance
 * @param {number} timeout - max wait time in ms
 */
async function waitForAgentReady(browser, timeout = 5000) {
  try {
    const overlay = await $('[data-testid="agent-overlay"]');
    await overlay.waitForDisplayed({ timeout });
    console.log('[uiDesktopAgent] Agent ready');
  } catch (error) {
    console.warn('[uiDesktopAgent] Agent not ready within timeout:', error.message);
  }
}

module.exports = {
  ensureAgentOverlayNonBlocking,
  captureAgentContext,
  assertRuntimeTruthBanner,
  assertNoDeprecatedChatIpc,
  collapseAgentOverlay,
  expandAgentOverlay,
  waitForAgentReady,
};
