/**
 * uiDesktopAssertions.js
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Common WDIO assertion helpers for desktop UI tests.
 * Honest classification: LIVE, SIMULATED, DEGRADED, ERROR.
 */

import { GLOBAL_SELECTORS } from './uiDesktopSelectors.js';

const ERROR_BOUNDARY_SELECTORS = [
  '[data-testid="error-boundary"]',
  '.error-boundary',
  '[data-error-boundary]',
  '[data-testid*="error-boundary"]',
];

const DEGRADED_SELECTORS = [
  '[data-testid="degraded-banner"]',
  '[data-degraded]',
  '.degraded-banner',
  '[data-testid*="degraded"]',
];

const LOADING_SELECTORS = [
  '[data-testid="loading-spinner"]',
  '.loading-spinner',
  '.titane-loading',
  '[aria-label="Loading"]',
];

/**
 * Wait for a page root selector to appear.
 * Does NOT throw on timeout — returns classification object.
 * @param {string} rootSelector
 * @param {number} timeoutMs
 * @returns {{ found: boolean, state: 'LOADED'|'NOT_FOUND'|'ERROR_BOUNDARY'|'DEGRADED' }}
 */
async function waitForPageRoot(rootSelector, timeoutMs = 6000) {
  try {
    const el = await $(rootSelector);
    await el.waitForExist({ timeout: timeoutMs });

    // Check for error boundary on page
    const hasErrorBoundary = await hasAnySelector(ERROR_BOUNDARY_SELECTORS);
    if (hasErrorBoundary) {
      return { found: true, state: 'ERROR_BOUNDARY', selector: rootSelector };
    }

    // Check for degraded state
    const hasDegraded = await hasAnySelector(DEGRADED_SELECTORS);
    if (hasDegraded) {
      return { found: true, state: 'DEGRADED', selector: rootSelector };
    }

    return { found: true, state: 'LOADED', selector: rootSelector };
  } catch (_) {
    return { found: false, state: 'NOT_FOUND', selector: rootSelector };
  }
}

/**
 * Check if any of the given selectors exists in the DOM.
 * @param {string[]} selectors
 * @returns {boolean}
 */
async function hasAnySelector(selectors) {
  for (const sel of selectors) {
    try {
      const el = await $(sel);
      if (await el.isExisting()) return true;
    } catch (_) {
      // not found
    }
  }
  return false;
}

/**
 * Check if a tab exists and is clickable.
 * @param {string} selector
 * @returns {{ exists: boolean, displayed: boolean, enabled: boolean, selector: string }}
 */
async function assertTabExists(selector) {
  try {
    const el = await $(selector);
    const exists = await el.isExisting();
    if (!exists) return { exists: false, displayed: false, enabled: false, selector };

    const displayed = await el.isDisplayed();
    const enabled = await el.isEnabled();
    return { exists, displayed, enabled, selector };
  } catch (_) {
    return { exists: false, displayed: false, enabled: false, selector, error: true };
  }
}

/**
 * Assert that no unexpected error boundary is active on the current page.
 * Simulated routes are excluded (expected to show static content).
 * @param {string} route for logging
 * @param {boolean} isSimulated
 * @returns {{ hasErrorBoundary: boolean, isExpectedForSimulated: boolean }}
 */
async function assertNoUnexpectedErrorBoundary(route, isSimulated = false) {
  const hasEB = await hasAnySelector(ERROR_BOUNDARY_SELECTORS);

  if (!hasEB) return { hasErrorBoundary: false, isExpectedForSimulated: false };

  if (isSimulated) {
    return { hasErrorBoundary: true, isExpectedForSimulated: true, route };
  }

  return {
    hasErrorBoundary: true,
    isExpectedForSimulated: false,
    route,
    unexpected: true,
  };
}

/**
 * Assert that a page is loaded (or shows an expected degraded/simulated state).
 * Returns classification for proof logging.
 * @param {string} rootSelector
 * @param {boolean} isSimulated
 * @param {boolean} isDisplayOnly
 * @returns {{ loaded: boolean, classification: string }}
 */
async function assertPageClassification(
  rootSelector,
  isSimulated = false,
  isDisplayOnly = false
) {
  const result = await waitForPageRoot(rootSelector, isSimulated ? 3000 : 6000);

  if (!result.found) {
    if (isSimulated) {
      return {
        loaded: false,
        classification: 'SIMULATED_NOT_FOUND_EXPECTED',
        selector: rootSelector,
      };
    }
    return {
      loaded: false,
      classification: 'NOT_FOUND_UNEXPECTED',
      selector: rootSelector,
    };
  }

  if (result.state === 'ERROR_BOUNDARY') {
    if (isSimulated) {
      return {
        loaded: true,
        classification: 'SIMULATED_WITH_ERROR_BOUNDARY_EXPECTED',
        selector: rootSelector,
      };
    }
    return {
      loaded: true,
      classification: 'ERROR_BOUNDARY_UNEXPECTED',
      selector: rootSelector,
    };
  }

  if (result.state === 'DEGRADED') {
    return {
      loaded: true,
      classification: 'DEGRADED_CLASSIFIED',
      selector: rootSelector,
    };
  }

  if (isDisplayOnly) {
    return {
      loaded: true,
      classification: 'DISPLAY_ONLY_LOADED',
      selector: rootSelector,
    };
  }

  return { loaded: true, classification: 'LIVE_LOADED', selector: rootSelector };
}

/**
 * Scan for all interactive elements in the current page.
 * Returns count of buttons, inputs, links, tabs, and selects.
 */
async function scanInteractiveElements() {
  const results = {};

  const scans = [
    ['buttons', 'button'],
    ['inputs', 'input'],
    ['links', 'a[href]'],
    ['selects', 'select'],
    ['textareas', 'textarea'],
    ['dataTestIds', '[data-testid]'],
  ];

  for (const [key, selector] of scans) {
    try {
      const els = await $$(selector);
      results[key] = els.length;
    } catch (_) {
      results[key] = 0;
    }
  }

  return results;
}

/**
 * Check that the page title or heading is non-empty.
 * Looks for h1, h2, or a named element.
 * @returns {{ hasTitle: boolean, text: string }}
 */
async function assertPageHasTitle() {
  for (const sel of ['h1', 'h2', '[data-testid*="title"]', '[data-testid*="heading"]']) {
    try {
      const el = await $(sel);
      if (await el.isExisting()) {
        const text = await el.getText();
        if (text && text.trim().length > 0) {
          return { hasTitle: true, text: text.trim(), selector: sel };
        }
      }
    } catch (_) {
      // continue
    }
  }
  return { hasTitle: false, text: '' };
}

/**
 * Wait for loading spinners to disappear.
 * @param {number} maxMs
 */
async function waitForLoadingComplete(maxMs = 5000) {
  const start = Date.now();

  while (Date.now() - start < maxMs) {
    const loading = await hasAnySelector(LOADING_SELECTORS);
    if (!loading) return { loadingCleared: true, ms: Date.now() - start };
    await browser.pause(200);
  }

  return { loadingCleared: false, ms: maxMs };
}

/**
 * Classify the page state.
 * @returns {'LIVE' | 'DEGRADED' | 'ERROR_BOUNDARY' | 'LOADING' | 'BLANK'}
 */
async function classifyPageState() {
  const hasEB = await hasAnySelector(ERROR_BOUNDARY_SELECTORS);
  if (hasEB) return 'ERROR_BOUNDARY';

  const hasDegraded = await hasAnySelector(DEGRADED_SELECTORS);
  if (hasDegraded) return 'DEGRADED';

  const loading = await hasAnySelector(LOADING_SELECTORS);
  if (loading) return 'LOADING';

  const body = await $('body');
  const text = await body.getText();
  if (!text || text.trim().length < 5) return 'BLANK';

  return 'LIVE';
}

export {
  waitForPageRoot,
  hasAnySelector,
  assertTabExists,
  assertNoUnexpectedErrorBoundary,
  assertPageClassification,
  scanInteractiveElements,
  assertPageHasTitle,
  waitForLoadingComplete,
  classifyPageState,
  ERROR_BOUNDARY_SELECTORS,
  DEGRADED_SELECTORS,
  LOADING_SELECTORS,
};
