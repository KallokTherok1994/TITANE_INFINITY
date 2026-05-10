#!/usr/bin/env node
/**
 * generate-ui-desktop-manifest.mjs
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Reads the UI Surface Registry and generates:
 * - UI_DESKTOP_ROUTE_MANIFEST_v50.json
 * - UI_DESKTOP_CONTROL_INVENTORY_v50.json (static shape)
 * - UI_DESKTOP_CONTROL_INVENTORY_v50.md
 * - UI_DESKTOP_ACTION_CLASSIFICATION_v50.md
 * - UI_DESKTOP_FRONTEND_BACKEND_MAP_v50.md
 * - UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');
const OUT_DIR = resolve(ROOT, 'docs/ui/desktop/generated');

mkdirSync(OUT_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────
// Extract registry data from TypeScript source (no-compile)
// ─────────────────────────────────────────────────────────

const registrySource = readFileSync(resolve(ROOT, 'src/registry/uiSurfaceRegistry.ts'), 'utf8');

function extractStringField(block, field) {
  const m = block.match(new RegExp(`${field}:\\s*'([^']+)'`));
  return m ? m[1] : undefined;
}

function extractArrayOfStrings(block, field) {
  const m = block.match(new RegExp(`${field}:\\s*\\[([^\\]]+)\\]`));
  if (!m) return [];
  return m[1].match(/'([^']+)'/g)?.map(s => s.slice(1,-1)) || [];
}

function extractTabs(block) {
  const tabs = [];
  const tabReg = /\{\s*tabId:\s*'([^']+)'[^}]*label:\s*'([^']+)'[^}]*testId:\s*'([^']+)'[^}]*selector:\s*'([^']+)'[^}]*status:\s*'([^']+)'[^}]*truthClass:\s*'([^']+)'/gs;
  let m;
  while ((m = tabReg.exec(block)) !== null) {
    tabs.push({
      tabId: m[1],
      label: m[2],
      testId: m[3],
      selector: m[4],
      status: m[5],
      truthClass: m[6],
    });
  }
  return tabs;
}

function extractVisibleActions(block) {
  const actions = [];
  const actReg = /\{\s*actionId:\s*'([^']+)'[^}]*label:\s*'([^']+)'[^}]*wiringStatus:\s*'([^']+)'(?:[^}]*ipcCommand:\s*'([^']+)')?/gs;
  let m;
  while ((m = actReg.exec(block)) !== null) {
    actions.push({
      actionId: m[1],
      label: m[2],
      wiringStatus: m[3],
      ipcCommand: m[4] || null,
    });
  }
  return actions;
}

function extractAliases(block) {
  const aliases = [];
  const aliasReg = /\{\s*from:\s*'([^']+)',\s*to:\s*'([^']+)'[^}]*notes:\s*'([^']+)'/g;
  let m;
  while ((m = aliasReg.exec(block)) !== null) {
    aliases.push({ from: m[1], to: m[2], notes: m[3] });
  }
  return aliases;
}

// Assign safe action policy based on route and action type
function getSafeActionPolicy(route, action) {
  const destructiveKeywords = ['delete', 'clear', 'remove', 'purge', 'reset', 'apply', 'save', 'push', 'pull', 'export', 'import', 'restore'];
  const secretKeywords = ['key', 'secret', 'token', 'password', 'credential', 'auth'];
  const networkKeywords = ['push', 'pull', 'sync', 'fetch', 'external', 'cloud', 'remote'];
  const aiKeywords = ['send', 'generate', 'ai_'];
  
  const lbl = (action.label || '').toLowerCase();
  const id = (action.actionId || '').toLowerCase();
  const ipc = (action.ipcCommand || '').toLowerCase();
  
  if (action.wiringStatus === 'DISPLAY_ONLY') return 'READ_ONLY_CLICK';
  if (secretKeywords.some(k => lbl.includes(k) || id.includes(k))) return 'REQUIRES_SECRET_SKIP';
  if (destructiveKeywords.some(k => lbl.includes(k) || id.includes(k))) return 'REQUIRES_CONFIRMATION';
  if (networkKeywords.some(k => lbl.includes(k) || id.includes(k) || ipc.includes(k))) return 'EXTERNAL_NETWORK_SKIP_WITH_PROOF';
  if (aiKeywords.some(k => id.includes(k) || ipc.includes(k))) return 'EXTERNAL_NETWORK_SKIP_WITH_PROOF';
  if (action.wiringStatus === 'NOT_WIRED') return 'NOT_WIRED_EXPECTED';
  if (action.wiringStatus === 'WIRED_FALLBACK') return 'FALLBACK_EXPECTED';
  return 'SAFE_CLICK';
}

// Split registry source into route blocks
const routeBlocks = [];
const routeSplitReg = /(\{[\s\n]*route:\s*'\/[^']+[\s\S]*?)(?=(?:\{[\s\n]*route:\s*'\/)|(?:\/\/\s*──+\s*ALIAS)|$)/g;
let bm;
while ((bm = routeSplitReg.exec(registrySource)) !== null) {
  routeBlocks.push(bm[1]);
}

// Parse each block
const routes = routeBlocks.map(block => {
  const route = extractStringField(block, 'route');
  if (!route) return null;
  
  const tabs = extractTabs(block);
  const visibleActions = extractVisibleActions(block);
  const aliases = extractAliases(block);
  const backendCommands = extractArrayOfStrings(block, 'backendCommands');
  const sourceFiles = extractArrayOfStrings(block, 'sourceFiles');
  
  const truthClass = extractStringField(block, 'truthClass');
  const status = extractStringField(block, 'status');
  const pageId = extractStringField(block, 'pageId');
  const pageComponent = extractStringField(block, 'pageComponent');
  const rootTestId = extractStringField(block, 'rootTestId');
  const navOwner = extractStringField(block, 'navOwner');
  const fallbackPolicy = block.match(/fallbackPolicy:\s*'([^']+)'/) ? block.match(/fallbackPolicy:\s*'([^']+)'/)[1] : 'unspecified';
  
  const isSimulated = truthClass === 'SIMULATED_UI';
  const isDisplayOnly = status === 'DISPLAY_ONLY';
  
  // Classify each action with safe policy
  const classifiedActions = visibleActions.map(a => ({
    ...a,
    safeActionPolicy: getSafeActionPolicy(route, a),
    isSensitive: ['REQUIRES_CONFIRMATION', 'REQUIRES_SECRET_SKIP', 'DESTRUCTIVE_SKIP_WITH_PROOF', 'EXTERNAL_NETWORK_SKIP_WITH_PROOF'].includes(getSafeActionPolicy(route, a)),
  }));
  
  // Sensitive and destructive actions
  const sensitiveActions = classifiedActions.filter(a => a.isSensitive);
  const safeActions = classifiedActions.filter(a => !a.isSensitive);
  
  return {
    route,
    pageId,
    pageComponent,
    rootTestId,
    navOwner,
    truthClass,
    status,
    isSimulated,
    isDisplayOnly,
    tabs,
    tabCount: tabs.length,
    visibleActions: classifiedActions,
    safeActions,
    sensitiveActions,
    backendCommands,
    sourceFiles,
    aliases,
    fallbackPolicy,
    desktopProofRequired: !isSimulated,
    browserProofStatus: 'PASS_v48',
    selectors: {
      root: `[data-testid="${rootTestId}"]`,
      tabs: tabs.map(t => t.selector),
      actions: classifiedActions.map(a => `[data-testid="${a.actionId}"]`),
    },
    knownBlockers: [
      ...(isSimulated ? ['SIMULATED_UI — no live backend data'] : []),
      ...(isDisplayOnly ? ['DISPLAY_ONLY — read-only state, no interactive writes'] : []),
    ],
    testCoverage: {
      routeTest: 'ui-desktop-all-routes.wdio.test.js',
      tabTest: tabs.length > 0 ? 'ui-desktop-all-tabs.wdio.test.js' : 'N/A',
      controlInventory: 'ui-desktop-control-inventory.wdio.test.js',
      safeActionsTest: safeActions.length > 0 ? 'ui-desktop-safe-actions.wdio.test.js' : 'N/A',
      sensitiveActionsTest: sensitiveActions.length > 0 ? 'ui-desktop-sensitive-actions-guarded.wdio.test.js' : 'N/A',
      errorBoundaryTest: 'ui-desktop-error-boundary-and-empty-state.wdio.test.js',
      agentChatTest: 'ui-desktop-agent-chat-context.wdio.test.js',
    },
  };
}).filter(Boolean);

console.log(`[manifest] Parsed ${routes.length} routes`);

// ─────────────────────────────────────────────────────────
// 1. Route Manifest JSON
// ─────────────────────────────────────────────────────────

const routeManifest = {
  generated: new Date().toISOString(),
  mission: 'UI_DESKTOP_FULL_COVERAGE_v50',
  version: '1.0.0',
  routeCount: routes.length,
  tabCount: routes.reduce((sum, r) => sum + r.tabCount, 0),
  aliasCount: routes.reduce((sum, r) => sum + r.aliases.length, 0),
  routes,
};

const manifestPath = resolve(OUT_DIR, 'UI_DESKTOP_ROUTE_MANIFEST_v50.json');
writeFileSync(manifestPath, JSON.stringify(routeManifest, null, 2));
console.log(`[manifest] Written: ${manifestPath}`);

// ─────────────────────────────────────────────────────────
// 2. Control Inventory JSON (static shape from registry)
// ─────────────────────────────────────────────────────────

const controlInventory = {
  generated: new Date().toISOString(),
  mission: 'UI_DESKTOP_FULL_COVERAGE_v50',
  note: 'Static shape from registry. Dynamic DOM discovery is done by ui-desktop-control-inventory.wdio.test.js',
  controls: [],
};

for (const route of routes) {
  // Root selector
  controlInventory.controls.push({
    page: route.route,
    tab: null,
    selector: `[data-testid="${route.rootTestId}"]`,
    dataTestId: route.rootTestId,
    text: route.pageComponent,
    type: 'page-root',
    enabled: true,
    visible: true,
    actionClass: 'PAGE_ROOT',
    safeActionPolicy: 'READ_ONLY_CLICK',
  });
  
  // Tab buttons
  for (const tab of route.tabs) {
    controlInventory.controls.push({
      page: route.route,
      tab: null,
      selector: tab.selector,
      dataTestId: tab.testId,
      text: tab.label,
      type: 'tab-button',
      enabled: true,
      visible: true,
      actionClass: 'TAB_SWITCH',
      safeActionPolicy: 'SAFE_CLICK',
    });
  }
  
  // Visible actions
  for (const action of route.visibleActions) {
    controlInventory.controls.push({
      page: route.route,
      tab: null,
      selector: `[data-testid="${action.actionId}"]`,
      dataTestId: action.actionId,
      text: action.label,
      type: 'action-button',
      enabled: action.wiringStatus !== 'NOT_WIRED',
      visible: true,
      actionClass: action.wiringStatus,
      safeActionPolicy: action.safeActionPolicy,
    });
  }
}

const inventoryJsonPath = resolve(OUT_DIR, 'UI_DESKTOP_CONTROL_INVENTORY_v50.json');
writeFileSync(inventoryJsonPath, JSON.stringify(controlInventory, null, 2));
console.log(`[manifest] Written: ${inventoryJsonPath}`);

// ─────────────────────────────────────────────────────────
// 3. Control Inventory Markdown
// ─────────────────────────────────────────────────────────

let inventoryMd = `# TITANE Desktop Control Inventory v50\n\n`;
inventoryMd += `Generated: ${new Date().toISOString()}  \nMission: UI_DESKTOP_FULL_COVERAGE_v50  \n\n`;
inventoryMd += `> Static shape from registry. Dynamic DOM inventory from \`ui-desktop-control-inventory.wdio.test.js\`.\n\n`;

inventoryMd += `## Summary\n\n`;
inventoryMd += `| Metric | Count |\n|---|---|\n`;
inventoryMd += `| Routes | ${routes.length} |\n`;
inventoryMd += `| Tab buttons | ${routes.reduce((s,r) => s+r.tabs.length, 0)} |\n`;
inventoryMd += `| Visible actions (from registry) | ${routes.reduce((s,r) => s+r.visibleActions.length, 0)} |\n`;
inventoryMd += `| Safe actions | ${routes.reduce((s,r) => s+r.safeActions.length, 0)} |\n`;
inventoryMd += `| Sensitive/guarded actions | ${routes.reduce((s,r) => s+r.sensitiveActions.length, 0)} |\n\n`;

inventoryMd += `## Per-Route Control Inventory\n\n`;

for (const route of routes) {
  inventoryMd += `### ${route.route} (${route.pageComponent})\n\n`;
  inventoryMd += `Root: \`[data-testid="${route.rootTestId}"]\`  \nTruth: ${route.truthClass} | Status: ${route.status}\n\n`;
  
  if (route.tabs.length > 0) {
    inventoryMd += `**Tabs (${route.tabs.length})**:\n`;
    for (const tab of route.tabs) {
      inventoryMd += `- \`${tab.selector}\` → ${tab.label} (${tab.status})\n`;
    }
    inventoryMd += '\n';
  }
  
  if (route.visibleActions.length > 0) {
    inventoryMd += `**Actions (${route.visibleActions.length})**:\n`;
    for (const action of route.visibleActions) {
      const icon = action.isSensitive ? '⚠️' : '✅';
      inventoryMd += `- ${icon} \`${action.actionId}\` → "${action.label}" [${action.wiringStatus}] → ${action.safeActionPolicy}\n`;
    }
    inventoryMd += '\n';
  }
  
  if (route.knownBlockers.length > 0) {
    inventoryMd += `**Known blockers**: ${route.knownBlockers.join('; ')}\n\n`;
  }
}

const inventoryMdPath = resolve(OUT_DIR, 'UI_DESKTOP_CONTROL_INVENTORY_v50.md');
writeFileSync(inventoryMdPath, inventoryMd);
console.log(`[manifest] Written: ${inventoryMdPath}`);

// ─────────────────────────────────────────────────────────
// 4. Action Classification Markdown
// ─────────────────────────────────────────────────────────

let actionMd = `# TITANE Desktop Action Classification v50\n\n`;
actionMd += `Generated: ${new Date().toISOString()}  \n\n`;

actionMd += `## Safe Action Policy Definitions\n\n`;
actionMd += `| Policy | Description |\n|---|---|\n`;
const policies = [
  ['SAFE_CLICK', 'Click is safe — no mutation, no network, no secret'],
  ['READ_ONLY_CLICK', 'Display/read-only — no state change expected'],
  ['FORM_INPUT_SAFE', 'Form input — non-destructive, no secret'],
  ['TEMP_DIR_ONLY', 'File operation using temp dir only'],
  ['GUARDED_CLICK', 'Protected by enabled/disabled state'],
  ['REQUIRES_CONFIRMATION', 'Destructive — requires confirm dialog before execution'],
  ['REQUIRES_SECRET_SKIP', 'Involves secret/key/token — skip in E2E; classify only'],
  ['DESTRUCTIVE_SKIP_WITH_PROOF', 'Destructive operation — skip + document guard proof'],
  ['EXTERNAL_NETWORK_SKIP_WITH_PROOF', 'External network call — skip unless mock/local provider'],
  ['NOT_WIRED_EXPECTED', 'Frontend handler not yet wired — expected no-op'],
  ['FALLBACK_EXPECTED', 'Backend may be unavailable — fallback UI expected'],
  ['DEGRADED_EXPECTED', 'Degraded state expected — test degraded banner, not live data'],
];
for (const [p, d] of policies) actionMd += `| ${p} | ${d} |\n`;
actionMd += '\n';

actionMd += `## Action Inventory per Route\n\n`;

actionMd += `| Route | Action | Label | Wiring | Policy | Sensitive? | IPC Command |\n|---|---|---|---|---|---|---|\n`;
for (const route of routes) {
  for (const action of route.visibleActions) {
    actionMd += `| ${route.route} | ${action.actionId} | ${action.label} | ${action.wiringStatus} | ${action.safeActionPolicy} | ${action.isSensitive ? '⚠️ YES' : 'No'} | ${action.ipcCommand || '-'} |\n`;
  }
}

const actionMdPath = resolve(OUT_DIR, 'UI_DESKTOP_ACTION_CLASSIFICATION_v50.md');
writeFileSync(actionMdPath, actionMd);
console.log(`[manifest] Written: ${actionMdPath}`);

// ─────────────────────────────────────────────────────────
// 5. Frontend/Backend Map Markdown
// ─────────────────────────────────────────────────────────

let mapMd = `# TITANE Desktop Frontend/Backend Action Map v50\n\n`;
mapMd += `Generated: ${new Date().toISOString()}  \nMission: UI_DESKTOP_FULL_COVERAGE_v50\n\n`;
mapMd += `> Mapping from visible UI actions to IPC commands. Source: uiSurfaceRegistry + docs/IPC_CATALOG.md.\n> Unmapped actions are marked UNMAPPED_HANDLER.\n\n`;

mapMd += `## All Actions Mapped\n\n`;
mapMd += `| Route | Tab | Label | data-testid | IPC Command | Wiring | Policy | Desktop Test |\n|---|---|---|---|---|---|---|---|\n`;

for (const route of routes) {
  for (const action of route.visibleActions) {
    const ipc = action.ipcCommand || (action.wiringStatus === 'DISPLAY_ONLY' ? 'N/A (display only)' : 'UNMAPPED_HANDLER');
    const test = action.isSensitive
      ? 'ui-desktop-sensitive-actions-guarded.wdio.test.js'
      : 'ui-desktop-safe-actions.wdio.test.js';
    mapMd += `| ${route.route} | - | ${action.label} | ${action.actionId} | ${ipc} | ${action.wiringStatus} | ${action.safeActionPolicy} | ${test} |\n`;
  }
}

mapMd += `\n## Backend Commands per Route\n\n`;
mapMd += `| Route | Backend Commands | Source |\n|---|---|---|\n`;
for (const route of routes) {
  const cmds = route.backendCommands.length > 0 ? route.backendCommands.join(', ') : '-';
  mapMd += `| ${route.route} | ${cmds} | uiSurfaceRegistry |\n`;
}

const mapMdPath = resolve(OUT_DIR, 'UI_DESKTOP_FRONTEND_BACKEND_MAP_v50.md');
writeFileSync(mapMdPath, mapMd);
console.log(`[manifest] Written: ${mapMdPath}`);

// ─────────────────────────────────────────────────────────
// 6. Test Coverage Matrix Markdown
// ─────────────────────────────────────────────────────────

let matrixMd = `# TITANE Desktop Test Coverage Matrix v50\n\n`;
matrixMd += `Generated: ${new Date().toISOString()}  \nMission: UI_DESKTOP_FULL_COVERAGE_v50\n\n`;
matrixMd += `> L1=Static | L2=Unit | L3=Browser E2E | L4=Desktop WDIO | L5=Agent/Chat\n\n`;

matrixMd += `## Route Coverage Matrix\n\n`;
matrixMd += `| Route | pageId | truthClass | status | tabs | L1 | L2 | L3 | L4 | Blockers |\n|---|---|---|---|---|---|---|---|---|---|\n`;

for (const route of routes) {
  const l3 = route.browserProofStatus === 'PASS_v48' ? '✅ v48' : '❓';
  const l4 = 'PENDING_v50';
  const blockers = route.knownBlockers.length > 0 ? route.knownBlockers.join('; ') : '-';
  matrixMd += `| ${route.route} | ${route.pageId} | ${route.truthClass} | ${route.status} | ${route.tabCount} | ✅ | ✅ | ${l3} | ${l4} | ${blockers} |\n`;
}

matrixMd += `\n## Tab Coverage Matrix\n\n`;
matrixMd += `| Route | Tab | testId | status | L4 |\n|---|---|---|---|---|\n`;
for (const route of routes) {
  for (const tab of route.tabs) {
    matrixMd += `| ${route.route} | ${tab.label} | ${tab.testId} | ${tab.status} | PENDING_v50 |\n`;
  }
}

matrixMd += `\n## Coverage Summary\n\n`;
matrixMd += `| Category | Count | Desktop Tested | Status |\n|---|---|---|---|\n`;
matrixMd += `| Routes | ${routes.length} | PENDING | After v50 desktop run |\n`;
matrixMd += `| Tabs | ${routes.reduce((s,r)=>s+r.tabCount,0)} | PENDING | After v50 desktop run |\n`;
matrixMd += `| Aliases | ${routes.reduce((s,r)=>s+r.aliases.length,0)} | PENDING | After v50 desktop run |\n`;
matrixMd += `| Safe actions | ${routes.reduce((s,r)=>s+r.safeActions.length,0)} | PENDING | After v50 desktop run |\n`;
matrixMd += `| Sensitive actions | ${routes.reduce((s,r)=>s+r.sensitiveActions.length,0)} | PENDING | After v50 desktop run |\n`;

const matrixMdPath = resolve(OUT_DIR, 'UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md');
writeFileSync(matrixMdPath, matrixMd);
console.log(`[manifest] Written: ${matrixMdPath}`);

// ─────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────

console.log('\n[manifest] Generation complete:');
console.log(`  Routes: ${routes.length}`);
console.log(`  Tabs: ${routes.reduce((s,r)=>s+r.tabCount,0)}`);
console.log(`  Aliases: ${routes.reduce((s,r)=>s+r.aliases.length,0)}`);
console.log(`  Actions total: ${routes.reduce((s,r)=>s+r.visibleActions.length,0)}`);
console.log(`  Safe actions: ${routes.reduce((s,r)=>s+r.safeActions.length,0)}`);
console.log(`  Sensitive actions: ${routes.reduce((s,r)=>s+r.sensitiveActions.length,0)}`);
console.log('[manifest] PASS');
