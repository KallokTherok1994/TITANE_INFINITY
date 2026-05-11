/**
 * uiDesktopActions.js
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Safe action policy enforcement for desktop E2E tests.
 * Wraps WDIO interactions with governance-aware guards.
 */

const SAFE_POLICIES = new Set([
  'SAFE_CLICK',
  'READ_ONLY_CLICK',
  'FALLBACK_EXPECTED',
  'NOT_WIRED_EXPECTED',
  'GUARDED_CLICK',
  'FORM_INPUT_SAFE',
  'TEMP_DIR_ONLY',
]);

const SKIP_POLICIES = new Set([
  'REQUIRES_SECRET_SKIP',
  'DESTRUCTIVE_SKIP_WITH_PROOF',
  'EXTERNAL_NETWORK_SKIP_WITH_PROOF',
]);

const REQUIRE_CONFIRM_POLICIES = new Set([
  'REQUIRES_CONFIRMATION',
]);

/**
 * Determine if an action is safe to click in desktop E2E.
 * @param {string} safeActionPolicy
 * @returns {boolean}
 */
function isSafeToClick(safeActionPolicy) {
  return SAFE_POLICIES.has(safeActionPolicy);
}

/**
 * Determine if an action should be skipped.
 * @param {string} safeActionPolicy
 * @returns {boolean}
 */
function shouldSkip(safeActionPolicy) {
  return SKIP_POLICIES.has(safeActionPolicy);
}

/**
 * Determine if an action requires confirmation handling.
 * @param {string} safeActionPolicy
 * @returns {boolean}
 */
function requiresConfirmation(safeActionPolicy) {
  return REQUIRE_CONFIRM_POLICIES.has(safeActionPolicy);
}

/**
 * Navigate to a route via the Tauri app's navigation.
 * Uses BrowserRouter-compatible path routing (no hash).
 * @param {string} route e.g. '/titane'
 */
async function navigateToRoute(route) {
  const path = route.startsWith('/') ? route : `/${route}`;
  await browser.url(`tauri://localhost${path}`);
  await browser.pause(400);
}

/**
 * Click a tab safely.
 * @param {string} selector
 * @param {string} label for logging
 */
async function clickTab(selector, label) {
  let el;
  try {
    el = await $(selector);
  } catch (e) {
    // Selector may not exist — that's a test assertion, not action failure
    return { clicked: false, notFound: true, label };
  }
  
  const exists = await el.isExisting();
  if (!exists) return { clicked: false, notFound: true, label };
  
  const displayed = await el.isDisplayed();
  if (!displayed) return { clicked: false, notDisplayed: true, label };
  
  await el.click();
  await browser.pause(200);
  return { clicked: true, label };
}

/**
 * Click a safe action button.
 * Never calls this for REQUIRES_SECRET_SKIP or DESTRUCTIVE_SKIP_WITH_PROOF.
 * @param {string} selector
 * @param {string} actionId for logging
 * @param {string} safeActionPolicy
 */
async function clickSafeAction(selector, actionId, safeActionPolicy) {
  if (shouldSkip(safeActionPolicy)) {
    return { skipped: true, reason: safeActionPolicy, actionId };
  }
  
  if (requiresConfirmation(safeActionPolicy)) {
    // Only verify the button exists and is clickable; do not proceed
    const el = await $(selector);
    const exists = await el.isExisting();
    return { requiresConfirm: true, buttonExists: exists, actionId };
  }
  
  if (!isSafeToClick(safeActionPolicy)) {
    return { skipped: true, reason: `Unknown policy: ${safeActionPolicy}`, actionId };
  }
  
  const el = await $(selector);
  const exists = await el.isExisting();
  if (!exists) return { notFound: true, actionId, selector };
  
  const enabled = await el.isEnabled();
  if (!enabled) return { disabled: true, actionId };
  
  await el.click();
  await browser.pause(200);
  return { clicked: true, actionId };
}

/**
 * Assert that an action button exists and is either disabled or guarded.
 * Used for sensitive action guarding tests.
 * @param {string} selector
 * @param {string} actionId
 */
async function assertSensitiveActionGuarded(selector, actionId) {
  const el = await $(selector);
  const exists = await el.isExisting();
  
  if (!exists) {
    // Action not in DOM — classified as "not-exposed" guard
    return { guarded: true, method: 'NOT_EXPOSED_IN_DOM', actionId };
  }
  
  const enabled = await el.isEnabled();
  if (!enabled) {
    return { guarded: true, method: 'DISABLED', actionId };
  }
  
  const ariaDisabled = await el.getAttribute('aria-disabled');
  if (ariaDisabled === 'true') {
    return { guarded: true, method: 'ARIA_DISABLED', actionId };
  }
  
  const tabIndex = await el.getAttribute('tabindex');
  if (tabIndex === '-1') {
    return { guarded: true, method: 'TABINDEX_MINUS_ONE', actionId };
  }
  
  // Button exists and is not disabled — record as unguarded (may be expected)
  return { guarded: false, method: 'EXPOSED_AND_ENABLED', actionId };
}

/**
 * Type text into a form field safely (FORM_INPUT_SAFE policy).
 * @param {string} selector
 * @param {string} value non-secret text
 */
async function typeInField(selector, value) {
  const el = await $(selector);
  const exists = await el.isExisting();
  if (!exists) return { notFound: true, selector };
  await el.clearValue();
  await el.setValue(value);
  return { typed: true, selector };
}

/**
 * Dismiss any dialog/modal that may have appeared.
 * Safe: looks for cancel/close buttons only.
 */
async function dismissDialog() {
  const cancelSelectors = [
    '[data-testid="dialog-cancel"]',
    '[data-testid="modal-close"]',
    '[aria-label="Close"]',
    'button[data-dismiss]',
    '.modal-close',
  ];
  
  for (const sel of cancelSelectors) {
    try {
      const el = await $(sel);
      if (await el.isExisting() && await el.isDisplayed()) {
        await el.click();
        await browser.pause(200);
        return { dismissed: true, selector: sel };
      }
    } catch (_) {
      // Continue trying
    }
  }
  return { dismissed: false };
}

export {
  isSafeToClick,
  shouldSkip,
  requiresConfirmation,
  navigateToRoute,
  clickTab,
  clickSafeAction,
  assertSensitiveActionGuarded,
  typeInField,
  dismissDialog,
  SAFE_POLICIES,
  SKIP_POLICIES,
  REQUIRE_CONFIRM_POLICIES,
};
