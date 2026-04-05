#!/usr/bin/env tsx
/**
 * TITANE∞ — ZERO-REGRESSION EVAL HARNESS — MAIN ENTRY POINT
 *
 * Usage:
 *   npx tsx evals/harness/index.ts run          # Run champion eval (real generator)
 *   npx tsx evals/harness/index.ts run --mock   # Run harness self-test with mock responses
 *   npx tsx evals/harness/index.ts compare      # Run champion vs challenger
 *   npx tsx evals/harness/index.ts gates        # Evaluate promotion gates
 *   npx tsx evals/harness/index.ts x3           # Run X3 stability test
 *   npx tsx evals/harness/index.ts proof-pack   # Generate proof pack
 *   npx tsx evals/harness/index.ts all          # Run everything
 */

import type {
  EvalConfig,
  EvalSession,
  LaneResult,
  ComparisonResult,
  AntiLieViolation,
  ScorecardResult,
  GatesReport,
  X3StabilityResult,
  Verdict,
} from './types';
import { DEFAULT_EVAL_CONFIG } from './types';
import { runFullEval, createMockGenerator, createRealGenerator } from './evalRunner';
import { loadChampionChallengerConfig, runComparison } from './championChallenger';
import { evaluateGates } from './gates';
import { detectAntiLieViolations } from './antiLie';
import { scoreAllScorecards } from './scorecardScorer';
import { runX3Stability } from './x3Runner';
import { generateProofPack } from './proofPackGenerator';

function shouldUseMockGenerators(argv: string[]): boolean {
  return argv.includes('--mock') || process.env.EVAL_USE_MOCK === '1';
}

async function main() {
  const command = process.argv[2] || 'all';
  const config: EvalConfig = { ...DEFAULT_EVAL_CONFIG };
  const useMockGenerators = shouldUseMockGenerators(process.argv.slice(3));

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  TITANE∞ — ZERO-REGRESSION EVAL HARNESS                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`Command: ${command}`);
  console.log(`Dataset: ${config.datasetVersion}`);
  console.log(
    `Generator mode: ${useMockGenerators ? 'mock (harness self-test)' : 'real (orchestrator path)'}`
  );
  console.log('');

  const championGenerator = useMockGenerators
    ? createMockGenerator('ollama', 'gemma2:2b')
    : createRealGenerator('ollama', 'gemma2:2b');
  const challengerGenerator = useMockGenerators
    ? createMockGenerator('gemini', 'haiku')
    : createRealGenerator('gemini', 'haiku');

  let laneResults: LaneResult[] = [];
  let runVerdict: Verdict | null = null;
  let comparisons: ComparisonResult[] = [];
  let antiLieViolations: AntiLieViolation[] = [];
  let scorecards: ScorecardResult[] = [];
  let gates: GatesReport | null = null;
  let x3Stability: X3StabilityResult | null = null;
  let proofPackPath: string | null = null;

  if (command === 'run' || command === 'all') {
    console.log('═══ RUNNING CHAMPION EVAL ═══');
    const result = await runFullEval(config, championGenerator);
    laneResults = result.lanes;
    runVerdict = result.overallVerdict;
    console.log(`\nChampion result: ${result.overallVerdict}`);
    console.log(
      `  Items: ${result.summary.totalItems} total, ${result.summary.totalPassed} passed, ${result.summary.totalFailed} failed, ${result.summary.totalBlocked} blocked\n`
    );
  }

  if (command === 'compare' || command === 'all') {
    console.log('═══ RUNNING CHALLENGER COMPARISON ═══');
    const ccConfig = loadChampionChallengerConfig();
    if (ccConfig.enabled) {
      for (const comp of ccConfig.comparisons) {
        const result = await runComparison(
          comp,
          championGenerator,
          challengerGenerator,
          config.datasetVersion,
          config.lanes,
          config.timeoutMs
        );
        comparisons.push(result);
        console.log(
          `  ${comp.mode}: ${result.overallVerdict} (${result.summary.regressions} regressions)`
        );
      }
    } else {
      console.log('  Comparison disabled in config (comparison.enabled=false)');
    }
  }

  if (command === 'gates' || command === 'all') {
    console.log('\n═══ DETECTING ANTI-LIE VIOLATIONS ═══');
    antiLieViolations = detectAntiLieViolations(laneResults);
    const detected = antiLieViolations.filter(v => v.detected);
    console.log(`  Violations detected: ${detected.length}/${antiLieViolations.length}`);
    for (const v of detected) {
      console.log(`  ❌ ${v.violationId}: ${v.name} — ${v.evidence}`);
    }
  }

  if (command === 'all') {
    console.log('\n═══ SCORING SCORECARDS ═══');
    scorecards = scoreAllScorecards(laneResults);
    for (const s of scorecards) {
      console.log(`  ${s.scorecardId}: ${s.verdict}`);
    }
  }

  if (command === 'x3' || command === 'all') {
    console.log('\n═══ RUNNING X3 STABILITY ═══');
    x3Stability = await runX3Stability(
      championGenerator,
      config.datasetVersion,
      config.timeoutMs
    );
    console.log(`  X3 verdict: ${x3Stability.verdict}`);
    if (x3Stability.flakyItems.length > 0) {
      console.log(`  Flaky items: ${x3Stability.flakyItems.join(', ')}`);
    }
  }

  if (command === 'gates' || command === 'all') {
    console.log('\n═══ EVALUATING PROMOTION GATES ═══');
    gates = evaluateGates(laneResults, antiLieViolations, x3Stability, proofPackPath);
    for (const g of gates.gates) {
      const icon = g.passed ? '✅' : '❌';
      console.log(`  ${icon} ${g.gate}: ${g.evidence}`);
    }
    console.log(`\n  All blocking passed: ${gates.allBlockingPassed}`);
    console.log(`  Promotion allowed: ${gates.promotionAllowed}`);
  }

  if (command === 'proof-pack' || command === 'all') {
    console.log('\n═══ GENERATING PROOF PACK ═══');
    const session: EvalSession = {
      sessionId: `eval-${Date.now()}`,
      version: 'v1',
      timestamp: Date.now(),
      championBaseline: 'v28.0.0',
      lanes: laneResults,
      comparisons,
      antiLieViolations,
      scorecards,
      gates: gates ?? evaluateGates(laneResults, antiLieViolations, null, null),
      x3Stability,
      finalVerdict: gates?.verdict ?? 'BLOCKED',
      proofPackPath: null,
    };
    const manifest = generateProofPack(session);
    session.proofPackPath = manifest.path;
    proofPackPath = manifest.path;
    console.log(`  Proof pack: ${manifest.path}`);
    console.log(`  Files: ${manifest.files.length}`);
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  FINAL VERDICT                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  const comparisonVerdict: Verdict | null =
    comparisons.length === 0
      ? null
      : comparisons.some(c => c.overallVerdict !== 'PASS')
        ? 'FAIL'
        : 'PASS';
  const finalVerdict: Verdict =
    gates?.verdict ?? runVerdict ?? x3Stability?.verdict ?? comparisonVerdict ?? 'BLOCKED';
  console.log(`Verdict: ${finalVerdict}`);
  if (gates) {
    if (finalVerdict === 'PASS') {
      console.log('All gates PASS. Champion retained. Challenger eligible for shadow.');
    } else {
      console.log('Promotion BLOCKED. See gates report for details.');
    }
  } else if (command === 'run' && runVerdict) {
    console.log('Champion eval complete. Run `gates` or `all` for promotion status.');
  } else if (command === 'x3' && x3Stability) {
    console.log('Stability run complete.');
  } else if (comparisonVerdict) {
    console.log('Comparison run complete.');
  } else {
    console.log('Partial eval command complete.');
  }
  console.log('\nRollback: git reset --hard v28.0.0');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
