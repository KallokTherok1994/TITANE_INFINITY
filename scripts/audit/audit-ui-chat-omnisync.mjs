#!/usr/bin/env node
/**
 * TITANE∞ — UI + Chat Omnisync Audit Script
 * Phase 1: Inventory all UI surfaces and classify their truth status.
 *
 * Non-mutating. Outputs JSON reports to reports/ui-chat-omnisync-completion-YYYY-MM-DD/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/ui-chat-omnisync-completion-2026-05-16');
fs.mkdirSync(REPORT_DIR, { recursive: true });

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function fileExists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function grepInFile(content, pattern) {
  return pattern.test(content);
}

// ─── SURFACE DEFINITIONS ───────────────────────────────────────────────────
const SURFACES = [
  // TITANE module
  { id: 'titane.conversation', route: '/titane?tab=conversation', file: 'src/components/sections/ConversationSection.tsx', tab: 'conversation' },
  { id: 'titane.overview', route: '/titane?tab=overview', file: 'src/components/sections/OverviewSection.tsx', tab: 'overview' },
  { id: 'titane.memory', route: '/titane?tab=memory-map', file: 'src/components/sections/MemorySection.tsx', tab: 'memory-map' },
  { id: 'titane.progression', route: '/titane?tab=progression', file: 'src/components/sections/ProgressionSection.tsx', tab: 'progression' },
  { id: 'titane.transformation', route: '/titane?tab=transformation', file: 'src/components/sections/TransformationSection.tsx', tab: 'transformation' },
  // TIME module
  { id: 'time.now', route: '/time?tab=now', file: 'src/pages/TimePage.tsx', tab: 'now' },
  { id: 'time.agenda', route: '/time?tab=agenda', file: 'src/pages/TimePage.tsx', tab: 'agenda' },
  { id: 'time.memory', route: '/time?tab=memory', file: 'src/pages/TimePage.tsx', tab: 'memory' },
  { id: 'time.timeline', route: '/time?tab=timeline', file: 'src/pages/TimePage.tsx', tab: 'timeline' },
  { id: 'time.cognitive', route: '/time?tab=cognitive', file: 'src/pages/TimePage.tsx', tab: 'cognitive' },
  { id: 'time.snapshots', route: '/time?tab=snapshots', file: 'src/pages/TimePage.tsx', tab: 'snapshots' },
  { id: 'time.twin', route: '/time?tab=twin', file: 'src/pages/TimePage.tsx', tab: 'twin' },
  // TWIN module
  { id: 'twin.main', route: '/twins', file: 'src/pages/TwinsPage.tsx', tab: null },
];

// ─── CLASSIFIER ────────────────────────────────────────────────────────────
function classifySurface(surface) {
  const content = readFile(path.join(ROOT, surface.file));
  const pageContent = surface.file.includes('TimePage')
    ? readFile(path.join(ROOT, 'src/pages/TimePage.tsx'))
    : content;

  const result = {
    id: surface.id,
    route: surface.route,
    file: surface.file,
    tab: surface.tab,
    hasSurfaceRoot: grepInFile(content, /SurfaceRoot|data-surface-truth/),
    hasSurfaceTruthBadge: grepInFile(content, /SurfaceTruthBadge|PageHealthBanner/),
    hasTestId: grepInFile(content, /data-testid/),
    hasRealServiceImport: grepInFile(content, /tauriClient|useTabriInvoke|safeInvokeCanonical|useTwin|useTime|useMemory|useConversation|persistentMemory|xpEngine/),
    hasHardcodedData: false,
    hardcodedSymptoms: [],
    liveDataSources: [],
    testFiles: [],
    status: 'UNKNOWN',
    warnings: [],
  };

  // Detect hardcoded data patterns
  const hardcodedPatterns = [
    { pattern: /value="[0-9]+%"/, label: 'hardcoded_percentage' },
    { pattern: /value="\d+ min"/, label: 'hardcoded_duration' },
    { pattern: /\b(87%|92%|78%|82%|71%|85%)\b/, label: 'hardcoded_kpi' },
    { pattern: /'Aujourd\'hui \d+:\d+'/, label: 'hardcoded_date' },
    { pattern: /'Hier \d+:\d+'/, label: 'hardcoded_date' },
    { pattern: /value="12"/, label: 'hardcoded_session_count' },
    { pattern: /Architecture v25|Code review|Fusion modules/, label: 'hardcoded_activity_name' },
    { pattern: /Objectif hebdomadaire: 12h/, label: 'hardcoded_goal' },
  ];

  for (const { pattern, label } of hardcodedPatterns) {
    if (grepInFile(content, pattern)) {
      result.hasHardcodedData = true;
      if (!result.hardcodedSymptoms.includes(label)) {
        result.hardcodedSymptoms.push(label);
      }
    }
  }

  // Detect live data sources
  if (grepInFile(content, /tauriClient/)) result.liveDataSources.push('tauri_ipc');
  if (grepInFile(content, /safeInvokeCanonical/)) result.liveDataSources.push('tauri_invoke');
  if (grepInFile(content, /useTimeAgenda/)) result.liveDataSources.push('time_agenda_hook');
  if (grepInFile(content, /useTemporalIntelligence/)) result.liveDataSources.push('temporal_intelligence_hook');
  if (grepInFile(content, /useConversationEngine|useChat/)) result.liveDataSources.push('conversation_engine');
  if (grepInFile(content, /xpEngine/)) result.liveDataSources.push('xp_engine');
  if (grepInFile(content, /persistentMemory|persistentMemoryGetStats/)) result.liveDataSources.push('persistent_memory');
  if (grepInFile(content, /useTwinIdentity|useTwinEvolution/)) result.liveDataSources.push('twin_hooks');
  if (grepInFile(content, /listTwinChatReviewItems|twinChatReview/)) result.liveDataSources.push('twin_chat_review');

  // Find test files
  const baseName = path.basename(surface.file, path.extname(surface.file));
  const testDirs = ['src/__tests__', 'src/components/sections/__tests__', 'src/pages/__tests__'];
  for (const dir of testDirs) {
    const dirPath = path.join(ROOT, dir);
    if (!fileExists(dirPath)) continue;
    try {
      const files = fs.readdirSync(dirPath);
      for (const f of files) {
        if (f.toLowerCase().includes(baseName.toLowerCase()) || f.toLowerCase().includes(surface.tab || '')) {
          result.testFiles.push(path.join(dir, f));
        }
      }
    } catch { /* ok */ }
  }

  // Classify status
  if (result.hasHardcodedData && result.liveDataSources.length === 0) {
    result.status = 'SIMULATED_UI';
    result.warnings.push('All visible data appears hardcoded — no live service connection detected');
  } else if (result.hasHardcodedData && result.liveDataSources.length > 0) {
    result.status = 'ACTIVE_PARTIAL';
    result.warnings.push('Mix of live and hardcoded data — hardcoded sections should be marked as curated/demo');
  } else if (result.liveDataSources.length > 0) {
    result.status = 'LIVE';
  } else {
    result.status = 'UNKNOWN';
    result.warnings.push('Cannot determine data source — manual review required');
  }

  // SurfaceTruth coverage warning
  if (!result.hasSurfaceRoot && !result.hasSurfaceTruthBadge) {
    result.warnings.push('No SurfaceRoot or SurfaceTruthBadge found — add one for runtime truth');
  }

  return result;
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
const inventory = SURFACES.map(classifySurface);

const staleSurfaces = inventory.filter(s => s.status === 'SIMULATED_UI' || s.hasHardcodedData);
const liveSurfaces = inventory.filter(s => s.status === 'LIVE');
const partialSurfaces = inventory.filter(s => s.status === 'ACTIVE_PARTIAL');

// Write inventory JSON
fs.writeFileSync(
  path.join(REPORT_DIR, 'frontend-ui-omnisync-inventory.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), surfaces: inventory }, null, 2)
);

// Write stale surfaces
fs.writeFileSync(
  path.join(REPORT_DIR, 'ui-stale-surfaces.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), staleSurfaces }, null, 2)
);

// Write markdown audit
const md = [
  '# TITANE∞ UI Chat Omnisync Audit',
  `Generated: ${new Date().toISOString()}`,
  '',
  `## Summary`,
  `- Total surfaces: ${inventory.length}`,
  `- LIVE: ${liveSurfaces.length}`,
  `- ACTIVE_PARTIAL: ${partialSurfaces.length}`,
  `- SIMULATED_UI: ${inventory.filter(s => s.status === 'SIMULATED_UI').length}`,
  `- UNKNOWN: ${inventory.filter(s => s.status === 'UNKNOWN').length}`,
  '',
  '## Surface Status Table',
  '',
  '| Surface ID | Route | Status | Live Sources | Hardcoded | SurfaceTruth |',
  '|---|---|---|---|---|---|',
  ...inventory.map(s => [
    `| ${s.id}`,
    `${s.route}`,
    `**${s.status}**`,
    s.liveDataSources.join(', ') || '—',
    s.hasHardcodedData ? '⚠️ YES' : '✓',
    (s.hasSurfaceRoot || s.hasSurfaceTruthBadge) ? '✓' : '⚠️ missing',
    '|',
  ].join(' | ')),
  '',
  '## Warnings',
  ...inventory.flatMap(s => s.warnings.map(w => `- **${s.id}**: ${w}`)),
  '',
  '## Stale Surfaces Detail',
  ...staleSurfaces.map(s => [
    `### ${s.id} (${s.status})`,
    `File: \`${s.file}\``,
    `Hardcoded symptoms: ${s.hardcodedSymptoms.join(', ') || 'none'}`,
    `Live sources: ${s.liveDataSources.join(', ') || 'none'}`,
    '',
  ].join('\n')),
].join('\n');

fs.writeFileSync(path.join(REPORT_DIR, 'UI_CHAT_OMNISYNC_AUDIT.md'), md);

// Console output
console.log('\n📊 TITANE∞ UI Chat Omnisync Audit\n');
console.log(`Total surfaces: ${inventory.length}`);
console.log(`LIVE: ${liveSurfaces.length} | PARTIAL: ${partialSurfaces.length} | SIMULATED: ${inventory.filter(s => s.status === 'SIMULATED_UI').length}`);
console.log('\nStale/Simulated surfaces:');
for (const s of staleSurfaces) {
  console.log(`  ⚠️  ${s.id} (${s.status}) — symptoms: ${s.hardcodedSymptoms.join(', ')}`);
}
console.log('\nReports written to:', REPORT_DIR);
