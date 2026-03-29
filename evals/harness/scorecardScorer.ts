/**
 * TITANE∞ — SCORECARD SCORING ENGINE
 * Calculates scorecard scores from eval results.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ScorecardResult, ScorecardMetric, LaneResult, Verdict } from './types';

const SCORECARDS_DIR = join(process.cwd(), 'evals', 'scorecards', 'v1');

interface ScorecardDefinition {
  scorecard_id: string;
  version: string;
  metrics: Array<{
    name: string;
    target: number;
    blocking: boolean;
    description: string;
  }>;
}

function loadScorecardDef(id: string): ScorecardDefinition | null {
  const path = join(SCORECARDS_DIR, `${id}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function scoreScorecard(
  scorecardId: string,
  laneResults: LaneResult[]
): ScorecardResult | null {
  const def = loadScorecardDef(scorecardId);
  if (!def) return null;
  if (!def.metrics || def.metrics.length === 0) {
    console.warn(`[ScorecardScorer] ${scorecardId}: no metrics array, skipping`);
    return null;
  }

  const allItems = laneResults.flatMap(l => l.items);
  const allPassed = allItems.every(i => i.allBlockingPassed);

  const metrics: ScorecardMetric[] = def.metrics.map(m => {
    const championScore = allPassed ? 1.0 : 0.5;
    const passed = championScore >= m.target;
    return {
      name: m.name,
      target: m.target,
      blocking: m.blocking,
      championScore,
      challengerScore: null,
      delta: null,
      verdict: passed ? ('PASS' as Verdict) : ('FAIL' as Verdict),
    };
  });

  const blockingMetrics = metrics.filter(m => m.blocking);
  const blockingRegression = blockingMetrics.some(m => m.verdict === 'FAIL');

  return {
    scorecardId: def.scorecard_id,
    version: def.version,
    metrics,
    championOverall: blockingRegression ? 'FAIL' : 'PASS',
    challengerOverall: null,
    blockingRegression,
    verdict: blockingRegression ? 'FAIL' : 'PASS',
  };
}

export function scoreAllScorecards(laneResults: LaneResult[]): ScorecardResult[] {
  const ids = [
    'RESPONSE_QUALITY_SCORECARD',
    'MEMORY_TRUTH_SCORECARD',
    'ROUTER_TRUTH_SCORECARD',
    'HONESTY_SCORECARD',
    'AUTOHEAL_TRUTH_SCORECARD',
    'DESKTOP_CRITICAL_FLOW_SCORECARD',
  ];
  return ids
    .map(id => scoreScorecard(id, laneResults))
    .filter((s): s is ScorecardResult => s !== null);
}
