/**
 * uiDesktopManifest.js
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Loads and exposes the generated desktop route manifest.
 * Safe to call from any WDIO test file.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MANIFEST_PATH = resolve(__dirname, '../../../docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json');
const ACTION_CLASS_PATH = resolve(__dirname, '../../../docs/ui/desktop/generated/UI_DESKTOP_ACTION_CLASSIFICATION_v50.json');

let _manifest = null;

/**
 * Load and cache the route manifest.
 * Throws if manifest is missing (must run generate:ui-desktop-manifest first).
 */
function loadManifest() {
  if (_manifest) return _manifest;
  
  if (!existsSync(MANIFEST_PATH)) {
    throw new Error(`[uiDesktopManifest] Manifest not found at ${MANIFEST_PATH}. Run: node scripts/generate/generate-ui-desktop-manifest.mjs`);
  }
  
  _manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  return _manifest;
}

/**
 * Get all canonical routes.
 * @returns {string[]}
 */
function getAllRoutes() {
  return loadManifest().routes.map(r => r.route);
}

/**
 * Get route entry by route path.
 * @param {string} route
 * @returns {object | undefined}
 */
function getRouteEntry(route) {
  return loadManifest().routes.find(r => r.route === route);
}

/**
 * Get all tabs across all routes.
 * @returns {{ route: string, tab: object }[]}
 */
function getAllTabs() {
  const manifest = loadManifest();
  const tabs = [];
  for (const route of manifest.routes) {
    for (const tab of route.tabs) {
      tabs.push({ route: route.route, tab });
    }
  }
  return tabs;
}

/**
 * Get routes with tabs only.
 * @returns {{ route: string, tabs: object[] }[]}
 */
function getRoutesWithTabs() {
  return loadManifest().routes.filter(r => r.tabs.length > 0).map(r => ({
    route: r.route,
    tabs: r.tabs,
    rootTestId: r.rootTestId,
  }));
}

/**
 * Get all safe actions (SAFE_CLICK / READ_ONLY_CLICK / FALLBACK_EXPECTED / NOT_WIRED_EXPECTED).
 * @returns {{ route: string, action: object }[]}
 */
function getAllSafeActions() {
  const manifest = loadManifest();
  const actions = [];
  for (const route of manifest.routes) {
    for (const action of route.safeActions) {
      actions.push({ route: route.route, action });
    }
  }
  return actions;
}

/**
 * Get all sensitive/guarded actions.
 * @returns {{ route: string, action: object }[]}
 */
function getAllSensitiveActions() {
  const manifest = loadManifest();
  const actions = [];
  for (const route of manifest.routes) {
    for (const action of route.sensitiveActions) {
      actions.push({ route: route.route, action });
    }
  }
  return actions;
}

/**
 * Get non-simulated routes (those that should load real UI).
 * @returns {object[]}
 */
function getRealRoutes() {
  return loadManifest().routes.filter(r => !r.isSimulated);
}

/**
 * Get simulated routes.
 * @returns {object[]}
 */
function getSimulatedRoutes() {
  return loadManifest().routes.filter(r => r.isSimulated);
}

/**
 * Get count summary.
 * @returns {object}
 */
function getSummary() {
  const manifest = loadManifest();
  return {
    routeCount: manifest.routeCount,
    tabCount: manifest.tabCount,
    aliasCount: manifest.aliasCount,
    generated: manifest.generated,
    mission: manifest.mission,
  };
}

export {
  loadManifest,
  getAllRoutes,
  getRouteEntry,
  getAllTabs,
  getRoutesWithTabs,
  getAllSafeActions,
  getAllSensitiveActions,
  getRealRoutes,
  getSimulatedRoutes,
  getSummary,
};
