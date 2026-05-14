#!/usr/bin/env node
/**
 * TITANE∞ v35.1.4 — audit-advanced-agents-runtime
 *
 * For each of the 6 advanced agents (monitoring, diagnostic, explainability,
 * orchestrator, security_active, log_analysis), inspect the corresponding
 * src/services/<agent>/ folder and produce a structured runtime-truth report.
 *
 * Heuristics:
 *  - "RUNTIME_PROVEN" : dashboard imports a non-mock signal source AND has tests
 *  - "PARTIAL"        : dashboard exists but reads only static/local state
 *  - "MISSING"        : dashboard not found
 *
 * Output: reports/advanced-agents-runtime-v35.1.4.json
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? process.cwd());
const AGENTS = [
  { id: 'monitoring',       dashboard: 'MonitoringDashboard.tsx',     testid: 'monitoring-dashboard' },
  { id: 'diagnostic',       dashboard: 'DiagnosticDashboard.tsx',     testid: 'diagnostic-panel' },
  { id: 'explainability',   dashboard: 'ExplainabilityDashboard.tsx', testid: 'explainability-dashboard' },
  { id: 'orchestrator',     dashboard: 'OrchestratorDashboard.tsx',   testid: 'orchestrator-dashboard' },
  { id: 'security_active',  dashboard: 'SecurityDashboard.tsx',       testid: 'security-dashboard' },
  { id: 'log_analysis',     dashboard: 'LogAnalysisDashboard.tsx',    testid: 'log-analysis-dashboard' },
];

const RUNTIME_SIGNAL_HINTS = [
  /invoke\(['"`][^'"`]+['"`]\s*,/,         // Tauri IPC invoke
  /useTauriIpc\s*\(/,
  /useAgentLiveSnapshot\s*\(/,             // canonical TITANE live-snapshot hook
  /fetchMetrics?\s*\(/i,
  /useSWR\(/,
  /eventSource|EventSource/,
  /subscribe\(/,
  /\.on\(['"`]/,
  /useEffect\([^)]*\)\s*=>\s*\{[\s\S]{0,500}\.then\(/,  // async fetch in useEffect
  /getSecurityActiveAgentStatus|getGovernedSecurityAuditSnapshot|getProjectHealthMetrics|getMonitoringAgentStatus|getDiagnosticAgentStatus|getExplainabilityAgentStatus|getOrchestratorAgentStatus|getSecurityAgentStatus|getLogAnalysisAgentStatus/,
  /window\.setInterval\s*\(/,
];

function listTests(dir) {
  const testDir = join(dir, '__tests__');
  if (!existsSync(testDir)) return [];
  try {
    return readdirSync(testDir).filter(f => /\.(test|spec)\.(t|j)sx?$/.test(f));
  } catch { return []; }
}

const out = { version: '35.1.4', generated_at: new Date().toISOString(), agents: [] };
let proven = 0, partial = 0, missing = 0;

for (const a of AGENTS) {
  const dir = join(ROOT, 'src/services', a.id);
  if (!existsSync(dir)) {
    out.agents.push({ ...a, serviceState: 'MISSING', evidence: [], blockers: ['service folder absent'], nextStep: `create src/services/${a.id}/` });
    missing++;
    continue;
  }
  const dashPath = join(dir, a.dashboard);
  const dashExists = existsSync(dashPath);
  const tests = listTests(dir);
  const evidence = [];
  let signalHits = 0;
  let testidPresent = false;
  if (dashExists) {
    const src = readFileSync(dashPath, 'utf8');
    for (const re of RUNTIME_SIGNAL_HINTS) {
      if (re.test(src)) signalHits++;
    }
    if (src.includes(`data-testid="${a.testid}"`) || src.includes(`data-testid={'${a.testid}'}`) || src.includes(`data-testid={"${a.testid}"}`)) {
      testidPresent = true;
      evidence.push(`testid '${a.testid}' present`);
    }
    if (signalHits > 0) evidence.push(`runtime signal hits=${signalHits}`);
    evidence.push(`tests=${tests.length}`);
  }

  const blockers = [];
  if (!dashExists) blockers.push('dashboard file missing');
  if (!testidPresent) blockers.push(`testid '${a.testid}' missing`);
  if (signalHits === 0 && dashExists) blockers.push('no runtime signal source detected (invoke/subscribe/fetch)');
  if (tests.length === 0) blockers.push('no __tests__ files');

  let state;
  if (!dashExists) { state = 'MISSING'; missing++; }
  else if (signalHits > 0 && testidPresent && tests.length > 0) { state = 'RUNTIME_PROVEN'; proven++; }
  else { state = 'PARTIAL'; partial++; }

  out.agents.push({
    ...a,
    serviceState: state,
    evidence,
    blockers,
    nextStep: blockers.length ? `address: ${blockers[0]}` : 'maintain',
    dashboardPath: relative(ROOT, dashPath),
    tests,
  });
}

out.summary = { proven, partial, missing, total: AGENTS.length };
out.verdict = missing === 0 ? (partial === 0 ? 'PASS' : 'PARTIAL') : 'FAIL';

const outDir = join(ROOT, 'reports');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'advanced-agents-runtime-v35.1.4.json');
writeFileSync(outFile, JSON.stringify(out, null, 2));
console.log(`OK agents=${AGENTS.length} proven=${proven} partial=${partial} missing=${missing} verdict=${out.verdict}`);
console.log(`-> ${relative(ROOT, outFile)}`);
