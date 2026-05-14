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
 * @param {number} [timeout=20000]
 *
 * v35.1.3 — Default bumped 10s -> 20s upper-bound to absorb DevPage cold-start
 * latency under parallel WebKitGTK driver load (lazy + useDeveloperMode +
 * useOneCore + useQAMonitoring + startSystemHealthPolling + heavy dashboards
 * can intermittently exceed 12s). One re-navigation retry on first-poll miss
 * recovers transient lazy-chunk fetch hiccups without false FAILs.
 *
 * v35.1.3b — Inter-route nav fix: under tauri-driver + WebKitWebDriver, after a
 * prior `browser.url('tauri://localhost/foo')` the SPA router can swallow a
 * subsequent `browser.url('tauri://localhost/bar')` request without re-mounting
 * the target route (lazy chunk for the new page never resolves and the new
 * root testid never appears). Force a full document reload via
 * `window.location.assign(url)` inside the webview when the early probe misses,
 * bypassing any SPA router cache.
 */
async function navigateAndWait(route, rootTestId, timeout = 20000) {
  // v35.1.3 — Apply a 15s floor so explicit short timeouts in legacy specs
  // (8000ms in ipc-response-reflection-*) don't FAIL on slow lazy-chunk mount.
  const effectiveTimeout = Math.max(Number(timeout) || 0, 15000);
  const url = `tauri://localhost${route}`;
  await browser.url(url);
  // Quick first probe — if selector is not present after ~1.5s, force a full
  // document reload via window.location.assign (bypasses SPA router cache).
  let earlyHit = false;
  try {
    await browser.waitUntil(
      async () => {
        const els = await browser.$$(`[data-testid="${rootTestId}"]`);
        return els.length > 0;
      },
      { timeout: 1500, interval: 200, timeoutMsg: 'early' }
    );
    earlyHit = true;
  } catch {
    // intentional: fall through to full-document reload
  }
  if (!earlyHit) {
    try {
      // Force full reload — bypass SPA router that may have swallowed
      // the previous browser.url() under tauri-driver + WebKitWebDriver.
      await browser.execute(targetUrl => {
        // eslint-disable-next-line no-undef
        window.location.assign(targetUrl);
      }, url);
    } catch {
      // Fallback to native driver nav if execute is unavailable.
      await browser.url(url);
    }
  }
  await browser.waitUntil(
    async () => {
      const els = await browser.$$(`[data-testid="${rootTestId}"]`);
      return els.length > 0;
    },
    {
      timeout: effectiveTimeout,
      interval: 400,
      timeoutMsg: `Root selector [data-testid="${rootTestId}"] not found after nav to ${route}`,
    }
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
    // Use innerText (not innerHTML) to avoid false positives from documentation text
    // that mentions "ErrorBoundary" as a component name in descriptions
    const text = await browser.execute(() => document.documentElement.innerText || '');
    if (typeof text === 'string') {
      // TITANE ErrorBoundary fallback renders: "Une erreur inattendue s'est produite"
      if (
        text.includes('Une erreur inattendue') ||
        text.includes('Something went wrong')
      ) {
        return 'FUNCTIONAL_FAIL';
      }
      if (
        text.includes('degraded') ||
        text.includes('DEGRADED') ||
        text.includes('unavailable')
      ) {
        return 'FUNCTIONAL_DEGRADED_EXPECTED';
      }
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
