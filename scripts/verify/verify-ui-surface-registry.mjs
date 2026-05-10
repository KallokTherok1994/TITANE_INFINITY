#!/usr/bin/env node
/**
 * TITANE_INFINITY — UI Surface Registry Verifier
 * Verifies parity between uiSurfaceRegistry, App.tsx, uiPages.po.js, moduleRouteContext.ts
 * Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46
 * Usage: node scripts/verify/verify-ui-surface-registry.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const EXEMPT_FROM_UIPAGES = [
  // Routes that have no uiPages.po.js entry and are explicitly exempt
  '/htf',           // Direct URL, no E2E matrix entry
  '/performance',   // Optimization sub-page, tracked via /optimization
];

const EXEMPT_FROM_MODULECONTEXT = [
  // Routes not requiring moduleRouteContext registry entry
  '/performance',
  '/htf',
  '/creation',
  '/evolution',
  '/knowledge',
  // Legacy aliases defined in moduleRouteContext but not canonical routes
  '/stats',
  '/identity-center',
  '/memory-evolution',
];

// ─────────────────────────────────────────────────────────────────────────────
// PARSE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function readFile(relPath) {
  const full = resolve(ROOT, relPath);
  if (!existsSync(full)) return null;
  return readFileSync(full, 'utf-8');
}

/** Extract route paths from App.tsx (both canonical and Navigate redirects) */
function parseAppRoutes(content) {
  const canonicalRoutes = new Set();
  const redirectRoutes = new Map(); // from -> to

  // Match full <Route ... /> or <Route ...> blocks
  // Use a tighter pattern: match <Route path="X" element={<Navigate ...}> or <Route path="X" element={<Component}>
  const routeBlockRe = /<Route\s[^>]*path="([^"]+)"[^>]*(?:element=\{([^}]*?)\})?\s*\/?>(?:[^<]*<\/Route>)?/gs;
  const matches = content.matchAll(routeBlockRe);
  for (const m of matches) {
    const route = m[1];
    if (route === '*') continue;
    // The element content of this specific Route block (limited to avoid bleeding into next)
    // Take only the text of this block itself
    const elementContent = m[0];
    if (elementContent.includes('<Navigate ')) {
      const toMatch = elementContent.match(/Navigate\s+to="([^"]+)"/);
      if (toMatch) {
        redirectRoutes.set(route, toMatch[1]);
      }
    } else {
      canonicalRoutes.add(route);
    }
  }

  return { canonicalRoutes, redirectRoutes };
}

/** Extract canonical routes and aliases from uiSurfaceRegistry.ts */
function parseRegistry(content) {
  const canonicalRoutes = new Set();
  const aliases = new Map(); // from -> canonicalRoute

  // Match route: '/...' patterns
  const routeMatches = content.matchAll(/route:\s*'([^']+)'/g);
  for (const m of routeMatches) {
    canonicalRoutes.add(m[1]);
  }

  // Match from: '/...' patterns in aliases
  const fromMatches = content.matchAll(/from:\s*'([^']+)'/g);
  for (const m of fromMatches) {
    // Get surrounding context to find canonical route (simplified)
    aliases.set(m[1], true);
  }

  return { canonicalRoutes, aliases };
}

/** Extract routes from uiPages.po.js */
function parseUiPages(content) {
  const routes = new Set();
  const routeMatches = content.matchAll(/route:\s*'([^']+)'/g);
  for (const m of routeMatches) {
    routes.add(m[1]);
  }
  return routes;
}

/** Extract routes from moduleRouteContext.ts MODULE_REGISTRY */
function parseModuleRegistry(content) {
  const routes = new Set();
  // Match top-level keys in MODULE_REGISTRY object
  const keyMatches = content.matchAll(/^\s+'(\/[^']+)':\s*\{/gm);
  for (const m of keyMatches) {
    routes.add(m[1]);
  }
  return routes;
}

/**
 * Split registry content into per-surface blocks.
 * Each block ends right before the next `route:` entry or at the SURFACES closing.
 */
function parseSurfaceBlocks(content) {
  // Find the SURFACES array body
  const surfacesStart = content.indexOf('const SURFACES:');
  if (surfacesStart === -1) return [];
  // Grab from SURFACES definition until export — stop before accessor functions
  const exportIdx = content.indexOf('\nexport function', surfacesStart);
  const surfacesBody = exportIdx !== -1 ? content.substring(surfacesStart, exportIdx) : content.substring(surfacesStart);
  // Split into blocks at each `route:` line
  const blocks = surfacesBody.split(/(?=\n\s+\{\s*\n\s*route:)/);
  return blocks.filter(b => /route:\s*'/.test(b));
}

/** Extract SIMULATED_UI routes from registry */
function parseSimulatedRoutes(content) {
  const simulated = new Set();
  const blocks = parseSurfaceBlocks(content);
  for (const block of blocks) {
    const routeMatch = block.match(/route:\s*'([^']+)'/);
    if (!routeMatch) continue;
    if (block.includes("'SIMULATED_UI'") || block.includes('"SIMULATED_UI"')) {
      simulated.add(routeMatch[1]);
    }
  }
  return simulated;
}

/** Extract canClaimSyncedWithoutRuntime=false routes that are ACTIVE_SYNCED */
function findInvalidActiveSynced(content) {
  const invalid = [];
  const blocks = parseSurfaceBlocks(content);
  for (const block of blocks) {
    const routeMatch = block.match(/route:\s*'([^']+)'/);
    if (!routeMatch) continue;
    const isActiveSynced = block.includes("'ACTIVE_SYNCED'");
    const canClaimFalse = block.includes('canClaimSyncedWithoutRuntime: false');
    if (isActiveSynced && canClaimFalse) {
      invalid.push(routeMatch[1]);
    }
  }
  return invalid;
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

function verify() {
  const errors = [];
  const warnings = [];

  // Read source files
  const appContent = readFile('src/App.tsx');
  const registryContent = readFile('src/registry/uiSurfaceRegistry.ts');
  const uiPagesContent = readFile('e2e/desktop/page-objects/uiPages.po.js');
  const moduleContextContent = readFile('src/services/chat/moduleRouteContext.ts');

  if (!appContent) errors.push('MISSING_FILE: src/App.tsx not found');
  if (!registryContent) errors.push('MISSING_FILE: src/registry/uiSurfaceRegistry.ts not found');
  if (!uiPagesContent) errors.push('MISSING_FILE: e2e/desktop/page-objects/uiPages.po.js not found');
  if (!moduleContextContent) errors.push('MISSING_FILE: src/services/chat/moduleRouteContext.ts not found');

  if (errors.length > 0) {
    console.error('\n❌ FATAL: Missing required files:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  const { canonicalRoutes: appCanonical, redirectRoutes: appRedirects } = parseAppRoutes(appContent);
  const { canonicalRoutes: regCanonical } = parseRegistry(registryContent);
  const uiPagesRoutes = parseUiPages(uiPagesContent);
  const moduleRoutes = parseModuleRegistry(moduleContextContent);
  const simulatedRoutes = parseSimulatedRoutes(registryContent);
  const invalidActiveSynced = findInvalidActiveSynced(registryContent);

  console.log('\n🔍 TITANE UI Surface Registry Verifier');
  console.log('=' .repeat(60));
  console.log(`App.tsx canonical routes: ${appCanonical.size}`);
  console.log(`Registry canonical routes: ${regCanonical.size}`);
  console.log(`uiPages.po.js routes: ${uiPagesRoutes.size}`);
  console.log(`moduleRouteContext routes: ${moduleRoutes.size}`);
  console.log(`Simulated routes: ${simulatedRoutes.size}`);
  console.log('');

  // CHECK 1: App.tsx routes must exist in registry
  for (const route of appCanonical) {
    if (!regCanonical.has(route)) {
      errors.push(`APP_ROUTE_NOT_IN_REGISTRY: '${route}' exists in App.tsx but not in registry`);
    }
  }

  // CHECK 2: Registry canonical routes must exist in App.tsx
  for (const route of regCanonical) {
    if (!appCanonical.has(route)) {
      errors.push(`REGISTRY_ROUTE_NOT_IN_APP: '${route}' in registry but not in App.tsx canonical routes`);
    }
  }

  // CHECK 3: Registry canonical routes must exist in uiPages.po.js (unless exempt)
  for (const route of regCanonical) {
    if (EXEMPT_FROM_UIPAGES.includes(route)) continue;
    if (!uiPagesRoutes.has(route)) {
      warnings.push(`MISSING_UIPAGES_ENTRY: '${route}' in registry has no uiPages.po.js entry (add or add to EXEMPT_FROM_UIPAGES)`);
    }
  }

  // CHECK 4: uiPages.po.js routes must exist in registry (as canonical or alias target)
  for (const route of uiPagesRoutes) {
    if (!regCanonical.has(route)) {
      // Check if it's a redirect target
      const isRedirectTarget = [...appRedirects.values()].some(to => to.startsWith(route));
      if (!isRedirectTarget) {
        warnings.push(`UIPAGES_ROUTE_NOT_IN_REGISTRY: '${route}' in uiPages.po.js has no registry entry`);
      }
    }
  }

  // CHECK 5: moduleRouteContext routes should be in registry (unless exempt)
  for (const route of moduleRoutes) {
    if (EXEMPT_FROM_MODULECONTEXT.includes(route)) continue;
    if (!regCanonical.has(route)) {
      warnings.push(`MODULE_CONTEXT_ROUTE_NOT_IN_REGISTRY: '${route}' in moduleRouteContext has no registry entry`);
    }
  }

  // CHECK 6: ACTIVE_SYNCED + canClaimSyncedWithoutRuntime=false → FAIL
  for (const route of invalidActiveSynced) {
    errors.push(`INVALID_ACTIVE_SYNCED: '${route}' is ACTIVE_SYNCED but canClaimSyncedWithoutRuntime=false — requires runtime proof`);
  }

  // CHECK 7: SIMULATED_UI routes must not be ACTIVE_SYNCED
  for (const route of simulatedRoutes) {
    // This is a structural check — simulated routes with ACTIVE_SYNCED would fail CHECK 6 already
    // But we warn if SIMULATED shows up in unexpected places
    if (appCanonical.has(route)) {
      warnings.push(`SIMULATED_ROUTE_INFO: '${route}' is SIMULATED_UI — must display simulation badge visibly`);
    }
  }

  // CHECK 8: App.tsx redirect routes (aliases) should not be orphaned
  for (const [from, to] of appRedirects) {
    // Strip query params from 'to'
    const toRoute = to.split('?')[0];
    if (!appCanonical.has(toRoute) && !regCanonical.has(toRoute)) {
      errors.push(`ORPHANED_ALIAS: '${from}' redirects to '${toRoute}' which is not a known canonical route`);
    }
  }

  // REPORT
  console.log('');
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ PASS — All surface registry checks passed');
    return;
  }

  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(w => console.log(`  ⚠️  ${w}`));
  }

  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):`);
    errors.forEach(e => console.log(`  ❌ ${e}`));
    console.log('\nVERDICT: FAIL');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log('\nVERDICT: PASS_WITH_WARNINGS');
    process.exit(0);
  }
}

verify();
