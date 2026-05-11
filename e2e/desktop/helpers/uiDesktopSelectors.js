/**
 * uiDesktopSelectors.js
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Canonical WDIO selector builders derived from the registry.
 * Wraps manifest data into runtime-ready selector strings.
 */

import { getRouteEntry } from './uiDesktopManifest.js';

/**
 * Build the root page selector for a given route.
 * @param {string} route e.g. '/titane'
 * @returns {string} e.g. '[data-testid="page-titane"]'
 */
function pageRootSelector(route) {
  const entry = getRouteEntry(route);
  if (!entry || !entry.rootTestId) {
    throw new Error(`[uiDesktopSelectors] No rootTestId for route: ${route}`);
  }
  return `[data-testid="${entry.rootTestId}"]`;
}

/**
 * Build selector for a specific tab by tabId.
 * @param {string} route
 * @param {string} tabId
 * @returns {string}
 */
function tabSelector(route, tabId) {
  const entry = getRouteEntry(route);
  if (!entry) throw new Error(`[uiDesktopSelectors] No entry for route: ${route}`);
  const tab = entry.tabs.find(t => t.tabId === tabId);
  if (!tab)
    throw new Error(`[uiDesktopSelectors] Tab ${tabId} not found on route ${route}`);
  return tab.selector;
}

/**
 * Build selector for an action by actionId.
 * @param {string} actionId
 * @returns {string}
 */
function actionSelector(actionId) {
  return `[data-testid="${actionId}"]`;
}

/**
 * Get all tab selectors for a route.
 * @param {string} route
 * @returns {{ tabId: string, label: string, selector: string }[]}
 */
function allTabSelectorsForRoute(route) {
  const entry = getRouteEntry(route);
  if (!entry) return [];
  return entry.tabs.map(t => ({
    tabId: t.tabId,
    label: t.label,
    selector: t.selector,
    testId: t.testId,
    status: t.status,
  }));
}

/**
 * Get all visible action selectors for a route.
 * @param {string} route
 * @returns {{ actionId: string, label: string, selector: string, safeActionPolicy: string }[]}
 */
function allActionSelectorsForRoute(route) {
  const entry = getRouteEntry(route);
  if (!entry) return [];
  return entry.visibleActions.map(a => ({
    actionId: a.actionId,
    label: a.label,
    selector: `[data-testid="${a.actionId}"]`,
    safeActionPolicy: a.safeActionPolicy,
    isSensitive: a.isSensitive,
    wiringStatus: a.wiringStatus,
  }));
}

/**
 * Common page layout selectors.
 */
const GLOBAL_SELECTORS = {
  navBar: '[data-testid="nav-bar"], nav, .titane-nav, .titane-sidebar',
  errorBoundary: '[data-testid="error-boundary"], .error-boundary, [data-error-boundary]',
  loadingSpinner: '[data-testid="loading-spinner"], .loading-spinner, .titane-loading',
  degradedBanner: '[data-testid="degraded-banner"], .degraded-banner, [data-degraded]',
  chatComposer:
    '[data-testid="chat-composer"], textarea[placeholder*="Message"], input[placeholder*="Message"]',
  conversationTab: '[data-testid="tab-conversation"], [data-testid*="conversation"]',
};

export {
  pageRootSelector,
  tabSelector,
  actionSelector,
  allTabSelectorsForRoute,
  allActionSelectorsForRoute,
  GLOBAL_SELECTORS,
};
