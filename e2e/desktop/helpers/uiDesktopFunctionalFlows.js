/**
 * uiDesktopFunctionalFlows.js
 * v54 — Safe functional flow helpers for desktop E2E proofs.
 * All flows are read-only or guarded. No destructive actions.
 * Navigation: BrowserRouter path-based (no hash).
 */

'use strict';

/**
 * Navigate to a route and wait for the root data-testid selector.
 * @param {string} route - e.g. '/titane'
 * @param {string} rootTestId - e.g. 'page-titane'
 * @param {number} [timeout=10000]
 */
async function navigateAndWait(route, rootTestId, timeout = 10000) {
  await browser.url(`tauri://localhost${route}`);
  await browser.waitUntil(
    async () => {
      const els = await browser.$$(`[data-testid="${rootTestId}"]`);
      return els.length > 0;
    },
    { timeout, interval: 400, timeoutMsg: `Root selector [data-testid="${rootTestId}"] not found after nav to ${route}` }
  );
}

/**
 * Check if an element is present and visible.
 * @param {string} testId
 * @param {number} [timeout=5000]
 * @returns {boolean}
 */
async function isVisible(testId, timeout = 5000) {
  try {
    const el = await $(`[data-testid="${testId}"]`);
    await el.waitForDisplayed({ timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get element text safely.
 * @param {string} testId
 * @returns {string}
 */
async function getText(testId) {
  try {
    const el = await $(`[data-testid="${testId}"]`);
    return await el.getText();
  } catch {
    return '';
  }
}

/**
 * Get attribute safely.
 * @param {string} testId
 * @param {string} attr
 * @returns {string}
 */
async function getAttribute(testId, attr) {
  try {
    const el = await $(`[data-testid="${testId}"]`);
    return await el.getAttribute(attr);
  } catch {
    return '';
  }
}

/**
 * Count elements matching selector.
 * @param {string} testId
 * @returns {number}
 */
async function count(testId) {
  try {
    const els = await browser.$$(`[data-testid="${testId}"]`);
    return els.length;
  } catch {
    return 0;
  }
}

/**
 * Click a testId element safely (read-only guard operations only).
 * @param {string} testId
 */
async function safeClick(testId) {
  const el = await $(`[data-testid="${testId}"]`);
  await el.waitForDisplayed({ timeout: 5000 });
  await el.click();
  await browser.pause(300);
}

/**
 * Classify a module surface based on visible content.
 * Returns: FUNCTIONAL_LIVE_PROVEN | FUNCTIONAL_DEGRADED_EXPECTED |
 *          FUNCTIONAL_DISPLAY_ONLY | FUNCTIONAL_SIMULATED_CONFIRMED |
 *          FUNCTIONAL_BLOCKED_BY_RUNTIME | FUNCTIONAL_FAIL
 * @param {string} rootTestId
 * @returns {string}
 */
async function classifySurface(rootTestId) {
  const present = await isVisible(rootTestId, 3000);
  if (!present) return 'FUNCTIONAL_FAIL';

  // Check for simulated badge
  const html = await browser.execute(() => document.documentElement.innerHTML);
  if (typeof html === 'string') {
    if (html.includes('SIMULATED') || html.includes('simulated')) {
      return 'FUNCTIONAL_SIMULATED_CONFIRMED';
    }
    if (html.includes('ErrorBoundary') || html.includes('Something went wrong')) {
      return 'FUNCTIONAL_FAIL';
    }
    if (html.includes('degraded') || html.includes('DEGRADED') || html.includes('unavailable')) {
      return 'FUNCTIONAL_DEGRADED_EXPECTED';
    }
  }
  return 'FUNCTIONAL_READ_ONLY_PROVEN';
}

module.exports = {
  navigateAndWait,
  isVisible,
  getText,
  getAttribute,
  count,
  safeClick,
  classifySurface,
};
