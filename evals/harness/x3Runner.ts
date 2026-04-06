/**
 * TITANE∞ — X3 STABILITY RUNNER
 * Runs critical lanes (A, B, D) 3 times and checks for flakiness.
 */

import type {
  X3RunResult,
  X3StabilityResult,
  LaneResult,
  LaneId,
  Verdict,
} from './types';
import type { ResponseGenerator } from './evalRunner';
import { runLane, loadDataset } from './evalRunner';

const X3_LANES: LaneId[] = ['A', 'B', 'D'];

export async function runX3Stability(
  generator: ResponseGenerator,
  datasetVersion: string,
  timeoutMs: number
): Promise<X3StabilityResult> {
  console.log('[X3Runner] Starting X3 stability test...');
  const runs: X3RunResult[] = [];

  for (let runNum = 1; runNum <= 3; runNum++) {
    console.log(`[X3Runner] Run ${runNum}/3`);
    const laneResults: LaneResult[] = [];
    for (const lane of X3_LANES) {
      const items = loadDataset(datasetVersion, lane);
      if (items.length === 0) continue;
      const result = await runLane(lane, items, generator, timeoutMs);
      laneResults.push(result);
    }
    runs.push({ runNumber: runNum, laneResults, timestamp: Date.now() });
  }

  const flakyItems: string[] = [];
  const itemVerdicts = new Map<string, Verdict[]>();
  for (const run of runs) {
    for (const lane of run.laneResults) {
      for (const item of lane.items) {
        const key = `${lane.laneId}/${item.itemId}`;
        if (!itemVerdicts.has(key)) itemVerdicts.set(key, []);
        itemVerdicts.get(key)!.push(item.verdict);
      }
    }
  }
  for (const [key, verdicts] of itemVerdicts) {
    if (!verdicts.every(v => v === verdicts[0])) flakyItems.push(key);
  }

  const allRunsMatch = flakyItems.length === 0;
  return { runs, allRunsMatch, flakyItems, verdict: allRunsMatch ? 'PASS' : 'FAIL' };
}
