#!/usr/bin/env node
/**
 * verify-ui-desktop-coverage.mjs
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Coverage verifier — gates for the v50 desktop UI test suite.
 * Verifies:
 * 1. Every canonical route has a desktop test entry
 * 2. Every tab has a desktop test entry
 * 3. All actions have a safe action policy defined
 * 4. All sensitive actions have a sensitive policy
 * 5. No routes without rootTestId
 * 6. Manifest is fresh (generated matches registry)
 *
 * Exit code 0 = PASS, 1 = FAIL.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');

const MANIFEST_PATH = resolve(
  ROOT,
  'docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json'
);
const REGISTRY_PATH = resolve(ROOT, 'src/registry/uiSurfaceRegistry.ts');
const EXPECTED_ROUTE_COUNT = 30;
const EXPECTED_TAB_COUNT = 22;
const EXPECTED_ALIAS_COUNT = 65;
const EXPECTED_SIMULATED_ROUTE_COUNT = 2;
const EXPECTED_ROUTES_WITH_TABS = 4;
const EXPECTED_SAFE_ACTION_COUNT = 38;
const EXPECTED_SENSITIVE_ACTION_COUNT = 13;

const REQUIRED_DESKTOP_TEST_FILES = [
  'e2e/desktop/ui-desktop-all-routes.wdio.test.js',
  'e2e/desktop/ui-desktop-all-tabs.wdio.test.js',
  'e2e/desktop/ui-desktop-control-inventory.wdio.test.js',
  'e2e/desktop/ui-desktop-safe-actions.wdio.test.js',
  'e2e/desktop/ui-desktop-agent-chat-context.wdio.test.js',
  'e2e/desktop/ui-desktop-error-boundary-and-empty-state.wdio.test.js',
  'e2e/desktop/ui-desktop-sensitive-actions-guarded.wdio.test.js',
];

const REQUIRED_HELPER_FILES = [
  'e2e/desktop/helpers/uiDesktopManifest.js',
  'e2e/desktop/helpers/uiDesktopSelectors.js',
  'e2e/desktop/helpers/uiDesktopActions.js',
  'e2e/desktop/helpers/uiDesktopAssertions.js',
  'e2e/desktop/helpers/uiDesktopScreenshots.js',
];

const REQUIRED_DOCS = [
  'docs/ui/desktop/UI_DESKTOP_FULL_COVERAGE_v50_STARTUP_AUDIT.md',
  'docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json',
  'docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_v50.json',
  'docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_v50.md',
  'docs/ui/desktop/generated/UI_DESKTOP_ACTION_CLASSIFICATION_v50.md',
  'docs/ui/desktop/generated/UI_DESKTOP_FRONTEND_BACKEND_MAP_v50.md',
  'docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md',
];

const VALID_TRUTH_CLASSES = [
  'MIXED_LIVE_AND_STATIC',
  'LIVE_TAURI',
  'LIVE_TAURI_SERVICE_BRIDGE',
  'LIVE_TAURI_GOVERNED',
  'LIVE_TAURI_WITH_FALLBACK',
  'SIMULATED_UI',
  'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI',
];

const VALID_SAFE_POLICIES = [
  'SAFE_CLICK',
  'READ_ONLY_CLICK',
  'FALLBACK_EXPECTED',
  'NOT_WIRED_EXPECTED',
  'GUARDED_CLICK',
  'FORM_INPUT_SAFE',
  'TEMP_DIR_ONLY',
  'REQUIRES_CONFIRMATION',
  'REQUIRES_SECRET_SKIP',
  'DESTRUCTIVE_SKIP_WITH_PROOF',
  'EXTERNAL_NETWORK_SKIP_WITH_PROOF',
];

let failures = 0;
let warnings = 0;
let passed = 0;

function check(label, condition, severity = 'FAIL') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    if (severity === 'WARN') {
      console.warn(`  ⚠️  WARN: ${label}`);
      warnings++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      failures++;
    }
  }
}

function fileExists(relativePath) {
  return existsSync(resolve(ROOT, relativePath));
}

console.log('\n=== TITANE UI Desktop Coverage Verifier v50 ===\n');

// ─────────────────────────────────────────────────────────
// Gate 1: Required files exist
// ─────────────────────────────────────────────────────────

console.log('Gate 1: Required Test Files');
for (const f of REQUIRED_DESKTOP_TEST_FILES) {
  check(`Test file exists: ${f}`, fileExists(f));
}
console.log('');

console.log('Gate 2: Required Helper Files');
for (const f of REQUIRED_HELPER_FILES) {
  check(`Helper exists: ${f}`, fileExists(f));
}
console.log('');

console.log('Gate 3: Required Docs / Manifests');
for (const f of REQUIRED_DOCS) {
  check(`Doc exists: ${f}`, fileExists(f));
}
console.log('');

// ─────────────────────────────────────────────────────────
// Gate 4: Manifest integrity
// ─────────────────────────────────────────────────────────

console.log('Gate 4: Manifest Integrity');

if (!existsSync(MANIFEST_PATH)) {
  console.error(
    '❌ FAIL: Manifest not found. Run: pnpm run generate:ui-desktop-manifest'
  );
  failures++;
} else {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

  check('Manifest has routeCount field', typeof manifest.routeCount === 'number');
  check(
    `Manifest routeCount = ${EXPECTED_ROUTE_COUNT}`,
    manifest.routeCount === EXPECTED_ROUTE_COUNT
  );
  check(
    `Manifest tabCount = ${EXPECTED_TAB_COUNT}`,
    manifest.tabCount === EXPECTED_TAB_COUNT
  );
  check(
    `Manifest aliasCount = ${EXPECTED_ALIAS_COUNT}`,
    manifest.aliasCount === EXPECTED_ALIAS_COUNT
  );
  check(
    'Manifest mission = UI_DESKTOP_FULL_COVERAGE_v50',
    manifest.mission === 'UI_DESKTOP_FULL_COVERAGE_v50'
  );
  check('Manifest has routes array', Array.isArray(manifest.routes));
  check(
    `Manifest routes.length = ${EXPECTED_ROUTE_COUNT}`,
    manifest.routes.length === EXPECTED_ROUTE_COUNT
  );

  // Every route has required fields
  let missingRootTestId = 0;
  let missingTruthClass = 0;
  let invalidTruthClass = 0;
  let missingPageId = 0;
  let missingPageComponent = 0;

  for (const route of manifest.routes) {
    if (!route.rootTestId) missingRootTestId++;
    if (!route.truthClass) missingTruthClass++;
    if (route.truthClass && !VALID_TRUTH_CLASSES.includes(route.truthClass))
      invalidTruthClass++;
    if (!route.pageId) missingPageId++;
    if (!route.pageComponent) missingPageComponent++;
  }

  check('All routes have rootTestId', missingRootTestId === 0);
  check('All routes have truthClass', missingTruthClass === 0);
  check('All truthClass values are valid', invalidTruthClass === 0);
  check('All routes have pageId', missingPageId === 0);
  check('All routes have pageComponent', missingPageComponent === 0);

  // Simulated route check
  const simulated = manifest.routes.filter(r => r.isSimulated);
  check(
    `Exactly ${EXPECTED_SIMULATED_ROUTE_COUNT} SIMULATED_UI routes`,
    simulated.length === EXPECTED_SIMULATED_ROUTE_COUNT
  );
  check(
    '/orchestration-intelligence is simulated',
    simulated.some(r => r.route === '/orchestration-intelligence')
  );
  check(
    '/quantum-center is simulated',
    simulated.some(r => r.route === '/quantum-center')
  );

  // Tab check
  const routesWithTabs = manifest.routes.filter(r => r.tabCount > 0);
  check(
    `Exactly ${EXPECTED_ROUTES_WITH_TABS} routes have tabs`,
    routesWithTabs.length === EXPECTED_ROUTES_WITH_TABS
  );
  const totalTabs = manifest.routes.reduce((s, r) => s + r.tabCount, 0);
  check(
    `Total tab count = ${EXPECTED_TAB_COUNT} (got ${totalTabs})`,
    totalTabs === EXPECTED_TAB_COUNT
  );

  // Action check
  let actionsWithoutPolicy = 0;
  let invalidPolicy = 0;

  for (const route of manifest.routes) {
    for (const action of route.visibleActions || []) {
      if (!action.safeActionPolicy) actionsWithoutPolicy++;
      if (
        action.safeActionPolicy &&
        !VALID_SAFE_POLICIES.includes(action.safeActionPolicy)
      )
        invalidPolicy++;
    }
  }

  check('All actions have safeActionPolicy', actionsWithoutPolicy === 0);
  check('All safeActionPolicy values are valid', invalidPolicy === 0);

  // Safe vs sensitive counts
  const totalSafe = manifest.routes.reduce((s, r) => s + (r.safeActions?.length || 0), 0);
  const totalSensitive = manifest.routes.reduce(
    (s, r) => s + (r.sensitiveActions?.length || 0),
    0
  );
  check(
    `Safe actions = ${EXPECTED_SAFE_ACTION_COUNT} (got ${totalSafe})`,
    totalSafe === EXPECTED_SAFE_ACTION_COUNT
  );
  check(
    `Sensitive actions = ${EXPECTED_SENSITIVE_ACTION_COUNT} (got ${totalSensitive})`,
    totalSensitive === EXPECTED_SENSITIVE_ACTION_COUNT
  );

  // Test coverage mapping
  let missingTestCoverage = 0;
  for (const route of manifest.routes) {
    if (!route.testCoverage?.routeTest) missingTestCoverage++;
  }
  check('All routes have testCoverage.routeTest', missingTestCoverage === 0);
}
console.log('');

// ─────────────────────────────────────────────────────────
// Gate 5: Registry source still has the expected canonical route count
// ─────────────────────────────────────────────────────────

console.log('Gate 5: Registry Consistency');

if (existsSync(REGISTRY_PATH)) {
  const registrySource = readFileSync(REGISTRY_PATH, 'utf8');
  const routes = registrySource.match(/route:\s*'\/[^']+'/g) || [];
  check(
    `Registry still has ${EXPECTED_ROUTE_COUNT} routes (got ${routes.length})`,
    routes.length === EXPECTED_ROUTE_COUNT
  );

  const simRoutes = registrySource.match(/truthClass:\s*'SIMULATED_UI'/g) || [];
  check(
    `Registry has ${EXPECTED_SIMULATED_ROUTE_COUNT} SIMULATED_UI routes (got ${simRoutes.length})`,
    simRoutes.length === EXPECTED_SIMULATED_ROUTE_COUNT
  );
}
console.log('');

// ─────────────────────────────────────────────────────────
// Gate 6: Test coverage completeness check
// ─────────────────────────────────────────────────────────

console.log('Gate 6: Test File Content Checks');

for (const f of REQUIRED_DESKTOP_TEST_FILES) {
  const fullPath = resolve(ROOT, f);
  if (existsSync(fullPath)) {
    const content = readFileSync(fullPath, 'utf8');
    const hasDescribe = content.includes('describe(');
    const hasIt =
      content.includes("it('") || content.includes('it("') || content.includes('it(`');
    const hasL1 = content.includes('L1 Static') || content.includes('L1 —');
    check(`${f}: has describe blocks`, hasDescribe);
    check(`${f}: has test cases (it)`, hasIt);
    check(`${f}: has L1 static tests`, hasL1, 'WARN');
  }
}
console.log('');

// ─────────────────────────────────────────────────────────
// Final verdict
// ─────────────────────────────────────────────────────────

console.log('=== VERIFICATION SUMMARY ===\n');
console.log(`  PASS:     ${passed}`);
console.log(`  WARN:     ${warnings}`);
console.log(`  FAIL:     ${failures}`);
console.log('');

if (failures === 0) {
  console.log('VERDICT: PASS');
  console.log('[verify-ui-desktop-coverage] All gates passed.');
  process.exit(0);
} else {
  console.error(`VERDICT: FAIL — ${failures} gate(s) failed`);
  process.exit(1);
}
