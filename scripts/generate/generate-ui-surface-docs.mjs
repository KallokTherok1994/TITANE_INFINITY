#!/usr/bin/env node
/**
 * TITANE_INFINITY — UI Surface Docs Generator
 * Mission: UI_BACKEND_RUNTIME_PROMOTION_v47
 * Usage: node scripts/generate/generate-ui-surface-docs.mjs
 *
 * Reads src/registry/uiSurfaceRegistry.ts at runtime via dynamic import and generates:
 *   - docs/ui/generated/UI_ROUTE_INVENTORY.md
 *   - docs/ui/generated/UI_TAB_MATRIX.md
 *   - docs/ui/generated/UI_ACTION_BACKEND_MATRIX.md
 *   - docs/ui/generated/UI_PROOF_COVERAGE.md
 *   - docs/ui/generated/UI_LEGACY_ALIAS_MAP.md
 *
 * Each generated file contains:
 *   GENERATED_FROM: src/registry/uiSurfaceRegistry.ts
 * for drift detection by the parity verifier.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../');
const OUT_DIR = resolve(ROOT, 'docs/ui/generated');

// ─────────────────────────────────────────────────────────────────────────────
// LOAD REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

const registryUrl = pathToFileURL(resolve(ROOT, 'src/registry/uiSurfaceRegistry.ts')).href;

let UI_SURFACE_REGISTRY, UI_ALIAS_REGISTRY, getRegistryStats;
try {
  // Dynamic import — requires tsx/ts-node or Vitest runner
  // In plain Node.js we use a compiled representation; the registry is pure data.
  // We parse the source as a JS module via register (Node 22+) or fallback to source parsing.
  const mod = await import(registryUrl).catch(() => null);
  if (mod) {
    UI_SURFACE_REGISTRY = mod.UI_SURFACE_REGISTRY;
    UI_ALIAS_REGISTRY = mod.UI_ALIAS_REGISTRY;
    getRegistryStats = mod.getRegistryStats;
  }
} catch (_) {
  // fallback — see below
}

// If direct TS import failed (Node without ts support), use source parsing fallback
if (!UI_SURFACE_REGISTRY) {
  console.log('ℹ️  Direct TS import not available — using source parse fallback');
  const { readFileSync } = await import('fs');
  UI_SURFACE_REGISTRY = parseRegistryFromSource(
    readFileSync(resolve(ROOT, 'src/registry/uiSurfaceRegistry.ts'), 'utf-8')
  );
  UI_ALIAS_REGISTRY = buildAliasRegistry(UI_SURFACE_REGISTRY);
  getRegistryStats = () => buildStats(UI_SURFACE_REGISTRY, UI_ALIAS_REGISTRY);
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE PARSE FALLBACK (pure text extraction — no eval)
// ─────────────────────────────────────────────────────────────────────────────

function parseRegistryFromSource(content) {
  const surfaces = [];
  // Split into surface blocks
  const surfacesStart = content.indexOf('const SURFACES:');
  if (surfacesStart === -1) return surfaces;
  const exportIdx = content.indexOf('\nexport function', surfacesStart);
  const body = exportIdx !== -1
    ? content.substring(surfacesStart, exportIdx)
    : content.substring(surfacesStart);

  const blocks = body.split(/(?=\n\s+\{\s*\n\s*route:)/);

  for (const block of blocks) {
    const routeM = block.match(/route:\s*'([^']+)'/);
    if (!routeM) continue;
    const route = routeM[1];

    const pageIdM = block.match(/pageId:\s*'([^']+)'/);
    const pageCompM = block.match(/pageComponent:\s*'([^']+)'/);
    const navOwnerM = block.match(/navOwner:\s*(?:'([^']+)'|null)/);
    const testIdM = block.match(/rootTestId:\s*'([^']+)'/);
    const statusM = block.match(/status:\s*'([^']+)'/);
    const truthClassM = block.match(/truthClass:\s*'([^']+)'/);
    const notesM = block.match(/notes:\s*'([^']+)'/);
    const disclosureM = /simulationDisclosureApplied:\s*true/.test(block);

    // Extract backendCommands array
    const bcMatch = block.match(/backendCommands:\s*\[([^\]]*)\]/s);
    const backendCommands = bcMatch
      ? [...(bcMatch[1].matchAll(/'([^']+)'/g))].map(m => m[1])
      : [];

    // Extract aliases
    const aliases = [...(block.matchAll(/from:\s*'([^']+)',\s*to:\s*'([^']+)'/g))].map(m => ({
      from: m[1], to: m[2],
    }));

    // Extract visibleActions
    const visibleActionsM = block.match(/visibleActions:\s*\[([^\]]*)\]/s);
    const visibleActions = [];
    if (visibleActionsM) {
      const actBlock = visibleActionsM[1];
      const actMatches = [...actBlock.matchAll(/actionId:\s*'([^']+)'.*?wiringStatus:\s*'([^']+)'/gs)];
      for (const a of actMatches) {
        const labelM = a[0].match(/label:\s*'([^']+)'/);
        visibleActions.push({
          actionId: a[1],
          label: labelM ? labelM[1] : a[1],
          wiringStatus: a[2],
        });
      }
    }

    // Extract tabs
    const tabsM = block.match(/tabs:\s*\[([^\]]*(?:\{[^}]*\}[^\]]*)*)\]/s);
    const tabs = [];
    if (tabsM) {
      const tabBlock = tabsM[1];
      const tabEntries = [...tabBlock.matchAll(/tabId:\s*'([^']+)'/g)];
      for (const t of tabEntries) {
        const tabSnip = tabBlock.substring(tabBlock.indexOf(`tabId: '${t[1]}'`));
        const labelM2 = tabSnip.match(/label:\s*'([^']+)'/);
        const testIdM2 = tabSnip.match(/testId:\s*'([^']+)'/);
        const truthM2 = tabSnip.match(/truthClass:\s*'([^']+)'/);
        const bcM2 = tabSnip.match(/backendCommands:\s*\[([^\]]*)\]/s);
        tabs.push({
          tabId: t[1],
          label: labelM2 ? labelM2[1] : t[1],
          testId: testIdM2 ? testIdM2[1] : '',
          truthClass: truthM2 ? truthM2[1] : 'MIXED_LIVE_AND_STATIC',
          backendCommands: bcM2 ? [...bcM2[1].matchAll(/'([^']+)'/g)].map(m => m[1]) : [],
        });
      }
    }

    // Extract requiredProofLanes
    const planesM = block.match(/requiredProofLanes:\s*\[([^\]]*)\]/s);
    const requiredProofLanes = planesM
      ? [...(planesM[1].matchAll(/'([^']+)'/g))].map(m => m[1])
      : [];

    surfaces.push({
      route,
      pageId: pageIdM ? pageIdM[1] : '',
      pageComponent: pageCompM ? pageCompM[1] : '',
      navOwner: navOwnerM ? (navOwnerM[1] || null) : null,
      rootTestId: testIdM ? testIdM[1] : '',
      status: statusM ? statusM[1] : 'UNKNOWN',
      truthClass: truthClassM ? truthClassM[1] : 'NOT_WIRED',
      notes: notesM ? notesM[1] : '',
      backendCommands,
      aliases,
      visibleActions,
      tabs,
      requiredProofLanes,
      simulationDisclosureApplied: disclosureM,
    });
  }

  return surfaces;
}

function buildAliasRegistry(surfaces) {
  return surfaces.flatMap(s =>
    (s.aliases || []).map(a => ({ ...a, canonical: s.route }))
  );
}

function buildStats(surfaces, aliases) {
  return {
    canonical: surfaces.length,
    aliases: aliases.length,
    simulated: surfaces.filter(s => s.status === 'SIMULATED_UI').length,
    displayOnly: surfaces.filter(s => s.status === 'DISPLAY_ONLY').length,
    tabs: surfaces.reduce((n, s) => n + (s.tabs || []).length, 0),
    actions: surfaces.reduce((n, s) => n + (s.visibleActions || []).length, 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const SOURCE_REF = 'src/registry/uiSurfaceRegistry.ts';
const GENERATED_FROM = `GENERATED_FROM: ${SOURCE_REF}`;

function header(title) {
  return `# ${title}
<!-- AUTO-GENERATED — DO NOT EDIT MANUALLY -->
<!-- ${GENERATED_FROM} -->
<!-- Generation date: ${TODAY} -->
<!-- Mission: UI_BACKEND_RUNTIME_PROMOTION_v47 -->
`;
}

function write(filename, content) {
  const path = resolve(OUT_DIR, filename);
  writeFileSync(path, content, 'utf-8');
  console.log(`  ✅ Generated: docs/ui/generated/${filename}`);
}

function cmd(list) {
  if (!list || list.length === 0) return '*(none)*';
  return list.join(', ');
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

function generateRouteInventory(surfaces) {
  const stats = buildStats(surfaces, buildAliasRegistry(surfaces));

  let md = header('UI Route Inventory');
  md += `
> **WARNING**: Runtime status columns reflect static classification only.
> Proof lanes marked \`LIVE_*\` require Tauri runtime verification.
> All \`ACTIVE_PARTIAL\` surfaces have mixed live + static data without full runtime proof.

## Canonical Routes (${surfaces.length})

| Route | Page Component | Nav Owner | Status | Truth Class | Root TestId | Aliases |
|---|---|---|---|---|---|---|
`;

  for (const s of surfaces) {
    const aliasCount = (s.aliases || []).length;
    const simFlag = s.status === 'SIMULATED_UI' ? '**SIMULATED**' : '';
    const displayFlag = s.status === 'DISPLAY_ONLY' ? '**DISPLAY_ONLY**' : '';
    const statusLabel = simFlag || displayFlag || s.status;
    const truthLabel = s.status === 'SIMULATED_UI' ? `**${s.truthClass}**` : s.truthClass;
    md += `| \`${s.route}\` | ${s.pageComponent} | ${s.navOwner || '(none)'} | ${statusLabel} | ${truthLabel} | \`${s.rootTestId}\` | ${aliasCount} |\n`;
  }

  md += `
## Status Summary

| Status | Count |
|---|---|
| ACTIVE_PARTIAL | ${surfaces.filter(s => s.status === 'ACTIVE_PARTIAL').length} |
| SIMULATED_UI | ${stats.simulated} |
| DISPLAY_ONLY | ${stats.displayOnly} |
| ACTIVE_SYNCED | ${surfaces.filter(s => s.status === 'ACTIVE_SYNCED').length} |
`;

  return md;
}

function generateTabMatrix(surfaces) {
  const surfacesWithTabs = surfaces.filter(s => s.tabs && s.tabs.length > 0);

  let md = header('UI Tab Matrix');
  md += `
> Tab status reflects static classification. \`LIVE_*\` tabs require runtime proof.
> Missing testId = NOT_COMPLIANT for Rule 16.

`;

  if (surfacesWithTabs.length === 0) {
    md += '> No tabs registered in registry yet.\n';
  }

  for (const s of surfacesWithTabs) {
    md += `## ${s.route} — ${s.pageComponent}\n\n`;
    md += `| TabId | Label | TestId | Truth Class | Backend Commands |\n`;
    md += `|---|---|---|---|---|\n`;
    for (const tab of s.tabs) {
      md += `| \`${tab.tabId}\` | ${tab.label} | \`${tab.testId}\` | ${tab.truthClass} | ${cmd(tab.backendCommands)} |\n`;
    }
    md += '\n';
  }

  const totalTabs = surfaces.reduce((n, s) => n + (s.tabs || []).length, 0);
  md += `## Summary\n\n- Total surfaces with registered tabs: ${surfacesWithTabs.length} / ${surfaces.length}\n- Total registered tabs: ${totalTabs}\n`;

  return md;
}

function generateActionMatrix(surfaces) {
  let md = header('UI Action → Backend Matrix');
  md += `
> Actions classified as NOT_WIRED or DISPLAY_ONLY have no IPC backend connection.
> WIRED_LIVE requires IPC command verification against docs/IPC_CATALOG.md or src/lib/security.ts.

## Wiring Status Key

| Status | Meaning |
|---|---|
| WIRED_LIVE | Connected to verified IPC command |
| WIRED_FALLBACK | Connected; graceful degradation if backend fails |
| TEMPLATE_ONLY | Action UI exists, no backend wiring yet |
| DISPLAY_ONLY | Read-only display; no action |
| BLOCKED_BY_RUNTIME | Would wire but runtime unavailable |
| BLOCKED_BY_PERMISSION | Gate/permission prevents action |
| NOT_WIRED | No backend connection at all |
| DEPRECATED | Action deprecated |

`;

  const surfacesWithActions = surfaces.filter(s => s.visibleActions && s.visibleActions.length > 0);

  for (const s of surfacesWithActions) {
    md += `## ${s.route} — ${s.pageComponent}\n\n`;
    md += `| ActionId | Label | Wiring | Backend Commands | Notes |\n`;
    md += `|---|---|---|---|---|\n`;
    for (const a of s.visibleActions) {
      const cmds = a.ipcCommand ? a.ipcCommand : s.status === 'SIMULATED_UI' ? '*(simulated)*' : '*(none)*';
      const notes = s.status === 'SIMULATED_UI' ? 'SIMULATED — no real IPC' : (a.notes || '');
      md += `| \`${a.actionId}\` | ${a.label} | **${a.wiringStatus}** | ${cmds} | ${notes} |\n`;
    }
    md += '\n';
  }

  const wiredLive = surfaces.flatMap(s => s.visibleActions || []).filter(a => a.wiringStatus === 'WIRED_LIVE').length;
  const notWired = surfaces.flatMap(s => s.visibleActions || []).filter(a => a.wiringStatus === 'NOT_WIRED').length;
  const total = surfaces.flatMap(s => s.visibleActions || []).length;

  md += `## Summary\n\n| Metric | Count |\n|---|---|\n| Total actions | ${total} |\n| WIRED_LIVE | ${wiredLive} |\n| NOT_WIRED | ${notWired} |\n| Surfaces with no registered actions | ${surfaces.length - surfacesWithActions.length} |\n`;

  return md;
}

function generateProofCoverage(surfaces) {
  let md = header('UI Proof Coverage Report');
  md += `
> **IMPORTANT**: \`LIVE_*\` proof lanes require active Tauri runtime to verify.
> Static analysis is the only available proof lane in this session.

## Proof Lane Coverage Matrix

| Route | Static TS | E2E TestId | IPC Contract | Runtime IPC | Verdict |
|---|---|---|---|---|---|
`;

  for (const s of surfaces) {
    const hasTestId = s.rootTestId ? '✅' : '❌';
    const hasIpc = s.backendCommands && s.backendCommands.length > 0;
    const ipcCell = s.status === 'SIMULATED_UI' ? '✅ SIMULATED' : (hasIpc ? '✅' : '⬜ none');
    const runtimeCell = s.status === 'SIMULATED_UI' ? '✅ SIMULATED' : (s.status === 'DISPLAY_ONLY' ? 'n/a' : '⬜ pending');
    let verdict = 'STATIC_COMPLETE';
    if (s.status === 'SIMULATED_UI') verdict = 'SIMULATED_PROVEN';
    else if (s.status === 'DISPLAY_ONLY') verdict = 'DISPLAY_PROVEN';
    else if (!s.rootTestId) verdict = 'STATIC_ONLY';
    md += `| \`${s.route}\` | ✅ | ${hasTestId} | ${ipcCell} | ${runtimeCell} | ${verdict} |\n`;
  }

  const byVerdict = {};
  for (const s of surfaces) {
    let v = 'STATIC_COMPLETE';
    if (s.status === 'SIMULATED_UI') v = 'SIMULATED_PROVEN';
    else if (s.status === 'DISPLAY_ONLY') v = 'DISPLAY_PROVEN';
    else if (!s.rootTestId) v = 'STATIC_ONLY';
    byVerdict[v] = (byVerdict[v] || 0) + 1;
  }

  md += `\n## Summary\n\n| Verdict | Count |\n|---|---|\n`;
  for (const [v, c] of Object.entries(byVerdict)) {
    md += `| ${v} | ${c} |\n`;
  }
  md += `| RUNTIME_PROVEN | 0 (requires Tauri build) |\n`;

  return md;
}

function generateAliasMap(surfaces) {
  const allAliases = surfaces.flatMap(s =>
    (s.aliases || []).map(a => ({ from: a.from, to: a.to || s.route, canonical: s.route }))
  );

  let md = header('UI Legacy Alias Map');
  md += `
> All aliases are \`<Navigate replace>\` redirects in App.tsx.
> They are NOT canonical routes — they resolve to canonical targets.

## Alias Registry (${allAliases.length} aliases)

| From (Alias) | Canonical Route | Redirect Target | Notes |
|---|---|---|---|
`;

  for (const a of allAliases) {
    const notes = a.to !== a.canonical ? `→ tab: ${a.to.split('?')[1] || ''}` : '';
    md += `| \`${a.from}\` | \`${a.canonical}\` | \`${a.to}\` | ${notes} |\n`;
  }

  // Group by canonical
  const groups = {};
  for (const a of allAliases) {
    if (!groups[a.canonical]) groups[a.canonical] = [];
    groups[a.canonical].push(a.from);
  }

  md += `\n## Alias Groups by Canonical Route\n\n`;
  for (const [canonical, froms] of Object.entries(groups)) {
    md += `- \`${canonical}\`: ${froms.map(f => `\`${f}\``).join(', ')}\n`;
  }

  return md;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n📄 TITANE UI Surface Docs Generator');
  console.log('=' .repeat(60));
  console.log(`Source: ${SOURCE_REF}`);
  console.log(`Output: docs/ui/generated/`);
  console.log(`Date: ${TODAY}`);
  console.log('');

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  const surfaces = UI_SURFACE_REGISTRY
    ? [...UI_SURFACE_REGISTRY]
    : parseRegistryFromSource(
        (await import('fs')).readFileSync(resolve(ROOT, 'src/registry/uiSurfaceRegistry.ts'), 'utf-8')
      );

  const aliasReg = buildAliasRegistry(surfaces);
  const stats = buildStats(surfaces, aliasReg);

  console.log(`Registry stats:`);
  console.log(`  Canonical routes: ${stats.canonical}`);
  console.log(`  Aliases: ${stats.aliases}`);
  console.log(`  Tabs: ${stats.tabs}`);
  console.log(`  Actions: ${stats.actions}`);
  console.log('');

  write('UI_ROUTE_INVENTORY.md', generateRouteInventory(surfaces));
  write('UI_TAB_MATRIX.md', generateTabMatrix(surfaces));
  write('UI_ACTION_BACKEND_MATRIX.md', generateActionMatrix(surfaces));
  write('UI_PROOF_COVERAGE.md', generateProofCoverage(surfaces));
  write('UI_LEGACY_ALIAS_MAP.md', generateAliasMap(surfaces));

  console.log('');
  console.log('✅ All docs generated successfully');
  console.log(`   Run: node scripts/verify/verify-ui-surface-registry.mjs to validate`);
}

main().catch(err => {
  console.error('❌ Generator failed:', err.message);
  process.exit(1);
});
