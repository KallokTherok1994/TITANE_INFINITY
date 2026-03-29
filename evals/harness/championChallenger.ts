/**
 * TITANE∞ — CHAMPION/CHALLENGER COMPARATOR
 * ═══════════════════════════════════════════════════════════════════
 * Compares champion vs challenger results on the same dataset items.
 * Runs challengers in SHADOW mode only — never promotes automatically.
 * ═══════════════════════════════════════════════════════════════════
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type {
  ComparisonItem,
  ComparisonResult,
  ItemResult,
  LaneId,
  Verdict,
} from './types';
import type { ResponseGenerator } from './evalRunner';
import { runLane, loadDataset } from './evalRunner';

interface ChampionChallengerConfig {
  mode: string;
  champion: { provider: string; model: string };
  challenger: { provider: string; model: string; rationale: string };
}

const CONFIG_PATH = join(process.cwd(), 'config', 'championChallenger.json');

/**
 * Load champion/challenger config.
 */
export function loadChampionChallengerConfig(): {
  enabled: boolean;
  comparisons: ChampionChallengerConfig[];
} {
  if (!existsSync(CONFIG_PATH)) {
    console.warn('[ChampionChallenger] Config not found');
    return { enabled: false, comparisons: [] };
  }

  const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  const enabled = raw.comparison?.enabled ?? false;
  const sampleRate = raw.comparison?.sample_rate ?? 0;

  if (!enabled || sampleRate <= 0) {
    return { enabled: false, comparisons: [] };
  }

  const comparisons: ChampionChallengerConfig[] = [];

  for (const [mode, champion] of Object.entries(raw.champions ?? {})) {
    const challengers = raw.challengers?.[mode] ?? [];
    for (const challenger of challengers) {
      comparisons.push({
        mode,
        champion: champion as { provider: string; model: string },
        challenger: challenger as { provider: string; model: string; rationale: string },
      });
    }
  }

  return { enabled, comparisons };
}

/**
 * Compare two item results and determine if challenger regressed.
 */
function compareItems(
  championResult: ItemResult,
  challengerResult: ItemResult
): ComparisonItem {
  const latencyDelta = challengerResult.latencyMs - championResult.latencyMs;
  const tokensDelta = challengerResult.tokensUsed - championResult.tokensUsed;
  const blockingRegression =
    championResult.allBlockingPassed && !challengerResult.allBlockingPassed;

  // Calculate rubric deltas
  const rubricDelta: Record<string, number> = {};
  for (const champScore of championResult.rubricScores) {
    const challScore = challengerResult.rubricScores.find(
      s => s.dimension === champScore.dimension
    );
    if (challScore) {
      rubricDelta[champScore.dimension] = challScore.score - champScore.score;
    }
  }

  let verdict: Verdict;
  if (blockingRegression) {
    verdict = 'REGRESSION_DETECTED';
  } else if (
    challengerResult.allBlockingPassed &&
    Object.values(rubricDelta).some(d => d > 0)
  ) {
    verdict = 'SHADOW_ONLY';
  } else if (
    challengerResult.allBlockingPassed &&
    Object.values(rubricDelta).every(d => d === 0)
  ) {
    verdict = 'CHALLENGER_NOT_BETTER';
  } else {
    verdict = 'SHADOW_ONLY';
  }

  return {
    itemId: championResult.itemId,
    lane: championResult.lane,
    championResult,
    challengerResult,
    delta: {
      latencyMs: latencyDelta,
      tokensUsed: tokensDelta,
      blockingRegression,
      rubricDelta,
    },
    verdict,
  };
}

/**
 * Run a full comparison for one mode/champion/challenger pair.
 */
export async function runComparison(
  config: ChampionChallengerConfig,
  championGenerator: ResponseGenerator,
  challengerGenerator: ResponseGenerator,
  datasetVersion: string,
  lanes: LaneId[],
  timeoutMs: number
): Promise<ComparisonResult> {
  console.log(
    `[ChampionChallenger] Comparing ${config.champion.provider}/${config.champion.model} vs ${config.challenger.provider}/${config.challenger.model} on mode ${config.mode}`
  );

  const comparisonItems: ComparisonItem[] = [];
  let championWins = 0;
  let challengerWins = 0;
  let ties = 0;
  let regressions = 0;

  for (const lane of lanes) {
    const items = loadDataset(datasetVersion, lane);
    if (items.length === 0) continue;

    // Run champion
    const championLane = await runLane(lane, items, championGenerator, timeoutMs);

    // Run challenger (shadow)
    const challengerLane = await runLane(lane, items, challengerGenerator, timeoutMs);

    // Compare item by item
    for (let i = 0; i < items.length; i++) {
      const champResult = championLane.items[i];
      const challResult = challengerLane.items[i];

      if (!champResult || !challResult) continue;

      const comparison = compareItems(champResult, challResult);
      comparisonItems.push(comparison);

      if (comparison.verdict === 'REGRESSION_DETECTED') {
        regressions++;
      } else if (comparison.delta.blockingRegression) {
        regressions++;
      } else {
        const totalDelta = Object.values(comparison.delta.rubricDelta).reduce(
          (sum, d) => sum + d,
          0
        );
        if (totalDelta > 0) challengerWins++;
        else if (totalDelta < 0) championWins++;
        else ties++;
      }
    }
  }

  const hasRegressions = regressions > 0;
  const overallVerdict: Verdict = hasRegressions
    ? 'PROMOTION_BLOCKED'
    : challengerWins > championWins
      ? 'SHADOW_ONLY'
      : 'CHAMPION_RETAINED';

  return {
    mode: config.mode,
    champion: config.champion,
    challenger: config.challenger,
    items: comparisonItems,
    summary: {
      totalItems: comparisonItems.length,
      championWins,
      challengerWins,
      ties,
      regressions,
    },
    overallVerdict,
  };
}
