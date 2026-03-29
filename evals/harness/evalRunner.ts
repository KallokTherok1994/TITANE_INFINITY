/**
 * TITANE∞ — ZERO-REGRESSION EVAL HARNESS RUNNER
 * ═══════════════════════════════════════════════════════════════════
 * Loads JSONL datasets, runs items through the pipeline, scores results.
 * Supports champion and challenger evaluation.
 * ═══════════════════════════════════════════════════════════════════
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type {
  DatasetItem,
  ItemResult,
  LaneResult,
  LaneId,
  Verdict,
  EvalConfig,
} from './types';
import { scoreItemResult, determineLaneVerdict } from './scorer';

// ─────────────────────────────────────────────────────────────────
// DATASET LOADING
// ─────────────────────────────────────────────────────────────────

const DATASETS_DIR = join(process.cwd(), 'evals', 'datasets');

/**
 * Load a JSONL dataset file and parse each line as a DatasetItem.
 */
export function loadDataset(version: string, lane: LaneId): DatasetItem[] {
  const laneNames: Record<LaneId, string> = {
    A: 'golden_tasks',
    B: 'critical_chains',
    C: 'regression',
    D: 'honesty',
    E: 'stability',
    F: 'shadow',
  };
  const filename = `lane_${lane.toLowerCase()}_${laneNames[lane]}.jsonl`;

  const filepath = join(DATASETS_DIR, version, filename);

  if (!existsSync(filepath)) {
    console.warn(`[EvalRunner] Dataset not found: ${filepath}`);
    return [];
  }

  const content = readFileSync(filepath, 'utf-8');
  const lines = content
    .trim()
    .split('\n')
    .filter(l => l.trim().length > 0);

  return lines.map(line => {
    try {
      return JSON.parse(line) as DatasetItem;
    } catch (e) {
      console.error(`[EvalRunner] Failed to parse line: ${line.substring(0, 100)}...`);
      throw e;
    }
  });
}

/**
 * Load all datasets for the configured lanes.
 */
export function loadAllDatasets(config: EvalConfig): Map<LaneId, DatasetItem[]> {
  const datasets = new Map<LaneId, DatasetItem[]>();

  for (const lane of config.lanes) {
    const items = loadDataset(config.datasetVersion, lane);
    datasets.set(lane, items);
    console.log(`[EvalRunner] Lane ${lane}: ${items.length} items loaded`);
  }

  return datasets;
}

// ─────────────────────────────────────────────────────────────────
// RESPONSE GENERATION (pluggable)
// ─────────────────────────────────────────────────────────────────

export interface ResponseGenerator {
  name: string;
  generate(
    input: string,
    context: string
  ): Promise<{
    response: string;
    provider: string;
    model: string;
    latencyMs: number;
    tokensUsed: number;
  }>;
}

/**
 * Create a mock generator for testing the harness itself.
 * In production, this would call aiOrchestrator.generate() or processMessage().
 */
export function createMockGenerator(
  provider: string,
  model: string,
  responseTemplate?: string
): ResponseGenerator {
  return {
    name: `${provider}/${model}`,
    async generate(input: string, _context: string) {
      const start = Date.now();
      // Simulate latency
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      const latencyMs = Date.now() - start;

      return {
        response:
          responseTemplate ||
          `[${provider}/${model}] Response to: ${input.substring(0, 50)}`,
        provider,
        model,
        latencyMs,
        tokensUsed: Math.floor(input.length / 4),
      };
    },
  };
}

/**
 * Create a real generator that calls the TITANE pipeline.
 * This is the production path — calls aiOrchestrator.generate().
 */
export function createRealGenerator(provider: string, model: string): ResponseGenerator {
  return {
    name: `${provider}/${model}`,
    async generate(input: string, context: string) {
      const start = Date.now();

      // Dynamic import to avoid circular dependencies
      // Note: In production, use the @ alias. For harness, use relative path.
      const orchestratorPath = new URL(
        '../../../src/services/ai/orchestrator.ts',
        import.meta.url
      ).pathname;
      const { aiOrchestrator } = await import(orchestratorPath);

      const preferredProvider = provider as
        | 'auto'
        | 'ollama'
        | 'gemini'
        | 'openai'
        | 'claude'
        | 'local';

      const response = await aiOrchestrator.generate(input, [], {
        preferredProvider,
      });

      const latencyMs = Date.now() - start;

      return {
        response: response.content,
        provider: response.provider || provider,
        model: response.model || model,
        latencyMs,
        tokensUsed: response.tokens || 0,
      };
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// LANE RUNNER
// ─────────────────────────────────────────────────────────────────

/**
 * Run all items in a lane through a generator and score them.
 */
export async function runLane(
  laneId: LaneId,
  items: DatasetItem[],
  generator: ResponseGenerator,
  timeoutMs: number = 30000
): Promise<LaneResult> {
  console.log(
    `[EvalRunner] Running lane ${laneId} with ${items.length} items (${generator.name})`
  );

  const results: ItemResult[] = [];

  for (const item of items) {
    if (!item.input) {
      console.log(`[EvalRunner]   ${item.id}: SKIP (no input — shadow template)`);
      continue;
    }
    console.log(`[EvalRunner]   ${item.id}: ${item.input.substring(0, 60)}...`);

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout (${timeoutMs}ms)`)), timeoutMs)
      );

      const genResult = await Promise.race([
        generator.generate(item.input, item.required_context),
        timeoutPromise,
      ]);

      const itemResult = scoreItemResult(
        item,
        genResult.response,
        genResult.provider,
        genResult.model,
        genResult.latencyMs,
        genResult.tokensUsed
      );

      results.push(itemResult);
      console.log(
        `[EvalRunner]   ${item.id}: ${itemResult.verdict} (${itemResult.latencyMs}ms)`
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[EvalRunner]   ${item.id}: ERROR — ${errorMsg}`);

      results.push({
        itemId: item.id,
        lane: laneId,
        provider: generator.name,
        model: 'error',
        response: '',
        latencyMs: 0,
        tokensUsed: 0,
        blockingChecks: item.blocking_checks.map(check => ({
          check,
          passed: false,
          evidence: `Error: ${errorMsg}`,
        })),
        rubricScores: [],
        allBlockingPassed: false,
        verdict: 'BLOCKED',
        errors: [errorMsg],
        timestamp: Date.now(),
      });
    }
  }

  const passedItems = results.filter(r => r.verdict === 'PASS').length;
  const failedItems = results.filter(r => r.verdict === 'FAIL').length;
  const blockedItems = results.filter(r => r.verdict === 'BLOCKED').length;

  return {
    laneId,
    totalItems: items.length,
    passedItems,
    failedItems,
    blockedItems,
    items: results,
    overallVerdict: determineLaneVerdict(results),
  };
}

// ─────────────────────────────────────────────────────────────────
// FULL EVAL RUNNER
// ─────────────────────────────────────────────────────────────────

export interface EvalRunResult {
  lanes: LaneResult[];
  overallVerdict: Verdict;
  summary: {
    totalItems: number;
    totalPassed: number;
    totalFailed: number;
    totalBlocked: number;
  };
}

/**
 * Run all configured lanes through a generator.
 */
export async function runFullEval(
  config: EvalConfig,
  generator: ResponseGenerator
): Promise<EvalRunResult> {
  const datasets = loadAllDatasets(config);
  const laneResults: LaneResult[] = [];

  for (const [laneId, items] of datasets) {
    if (items.length === 0) continue;
    const result = await runLane(laneId, items, generator, config.timeoutMs);
    laneResults.push(result);
  }

  const totalItems = laneResults.reduce((sum, l) => sum + l.totalItems, 0);
  const totalPassed = laneResults.reduce((sum, l) => sum + l.passedItems, 0);
  const totalFailed = laneResults.reduce((sum, l) => sum + l.failedItems, 0);
  const totalBlocked = laneResults.reduce((sum, l) => sum + l.blockedItems, 0);

  const hasFailures = laneResults.some(l => l.overallVerdict === 'FAIL');
  const hasBlocked = laneResults.some(l => l.overallVerdict === 'BLOCKED');

  const overallVerdict: Verdict = hasBlocked ? 'BLOCKED' : hasFailures ? 'FAIL' : 'PASS';

  return {
    lanes: laneResults,
    overallVerdict,
    summary: { totalItems, totalPassed, totalFailed, totalBlocked },
  };
}
