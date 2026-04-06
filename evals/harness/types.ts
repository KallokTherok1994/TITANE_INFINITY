/**
 * TITANE∞ — ZERO-REGRESSION EVAL HARNESS TYPES
 * ═══════════════════════════════════════════════════════════════════
 * Types for the governed evaluation harness.
 * Supports champion/challenger comparison, shadow mode, promotion gates.
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// DATASET TYPES (from JSONL)
// ─────────────────────────────────────────────────────────────────

export type LaneId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface DatasetItem {
  id: string;
  lane: LaneId;
  bucket: string;
  version: string;
  date: string;
  input: string;
  required_context: string;
  expected_behavior: string;
  blocking_checks: string[];
  rubric_notes: string;
  // Lane D extras
  violation_type?: string;
}

// ─────────────────────────────────────────────────────────────────
// EVAL RESULT TYPES
// ─────────────────────────────────────────────────────────────────

export type Verdict =
  | 'PASS'
  | 'FAIL'
  | 'BLOCKED'
  | 'PARTIAL'
  | 'QUALIFIED'
  | 'SHADOW_ONLY'
  | 'CHAMPION_RETAINED'
  | 'CHALLENGER_NOT_BETTER'
  | 'PROMOTION_BLOCKED'
  | 'REGRESSION_DETECTED'
  | 'MEMORY_REGRESSION'
  | 'ROUTER_REGRESSION'
  | 'HONESTY_REGRESSION'
  | 'DESKTOP_CHAIN_REGRESSION'
  | 'AUTOLEARNING_BLOCKED';

export interface BlockingCheckResult {
  check: string;
  passed: boolean;
  evidence: string;
}

export interface RubricScore {
  dimension: string;
  score: number; // 1-5
  blocking: boolean;
  threshold: number;
  passed: boolean;
  notes: string;
}

export interface ItemResult {
  itemId: string;
  lane: LaneId;
  provider: string;
  model: string;
  response: string;
  latencyMs: number;
  tokensUsed: number;
  blockingChecks: BlockingCheckResult[];
  rubricScores: RubricScore[];
  allBlockingPassed: boolean;
  verdict: Verdict;
  errors: string[];
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────
// LANE RESULT
// ─────────────────────────────────────────────────────────────────

export interface LaneResult {
  laneId: LaneId;
  totalItems: number;
  passedItems: number;
  failedItems: number;
  blockedItems: number;
  items: ItemResult[];
  overallVerdict: Verdict;
}

// ─────────────────────────────────────────────────────────────────
// CHAMPION vs CHALLENGER COMPARISON
// ─────────────────────────────────────────────────────────────────

export interface ComparisonItem {
  itemId: string;
  lane: LaneId;
  championResult: ItemResult;
  challengerResult: ItemResult;
  delta: {
    latencyMs: number; // positive = challenger slower
    tokensUsed: number;
    blockingRegression: boolean;
    rubricDelta: Record<string, number>; // dimension -> delta score
  };
  verdict: Verdict;
}

export interface ComparisonResult {
  mode: string; // canonical mode
  champion: { provider: string; model: string };
  challenger: { provider: string; model: string };
  items: ComparisonItem[];
  summary: {
    totalItems: number;
    championWins: number;
    challengerWins: number;
    ties: number;
    regressions: number;
  };
  overallVerdict: Verdict;
}

// ─────────────────────────────────────────────────────────────────
// ANTI-LIE VIOLATION
// ─────────────────────────────────────────────────────────────────

export type AntiLieClassification =
  | 'PRODUCT'
  | 'EVAL'
  | 'HARNESS'
  | 'ARTIFACT'
  | 'ENVIRONMENT'
  | 'GOVERNANCE';

export interface AntiLieViolation {
  violationId: string; // AV-01 to AV-08
  name: string;
  description: string;
  itemId: string;
  classification: AntiLieClassification;
  blocking: boolean;
  evidence: string;
  probableCause: string;
  expectedFix: string;
  rollbackNote: string;
  detected: boolean;
}

// ─────────────────────────────────────────────────────────────────
// PROMOTION GATES
// ─────────────────────────────────────────────────────────────────

export type GateName =
  | 'G_BOOT_TRUTH'
  | 'G_DISCOVERY_TRUTH'
  | 'G_CHAMPION_BASELINE_DEFINED'
  | 'G_EVAL_DATASET_VERSIONED'
  | 'G_SCORECARDS_PRESENT'
  | 'G_CRITICAL_CHAINS_PASS'
  | 'G_HONESTY_NO_REGRESSION'
  | 'G_MEMORY_NO_REGRESSION'
  | 'G_ROUTER_NO_REGRESSION'
  | 'G_AUTOHEAL_NO_MASKING'
  | 'G_DESKTOP_CRITICAL_FLOW_NO_REGRESSION'
  | 'G_X3_STABILITY'
  | 'G_ROLLBACK_READY'
  | 'G_PROOF_PACK_COMPLETE';

export interface GateResult {
  gate: GateName;
  blocking: boolean;
  passed: boolean;
  evidence: string;
  details: string;
}

export interface GatesReport {
  gates: GateResult[];
  allBlockingPassed: boolean;
  promotionAllowed: boolean;
  verdict: Verdict;
}

// ─────────────────────────────────────────────────────────────────
// SCORECARD SCORING
// ─────────────────────────────────────────────────────────────────

export interface ScorecardMetric {
  name: string;
  target: number;
  blocking: boolean;
  championScore: number | null;
  challengerScore: number | null;
  delta: number | null;
  verdict: Verdict;
}

export interface ScorecardResult {
  scorecardId: string;
  version: string;
  metrics: ScorecardMetric[];
  championOverall: string;
  challengerOverall: string | null;
  blockingRegression: boolean;
  verdict: Verdict;
}

// ─────────────────────────────────────────────────────────────────
// X3 STABILITY
// ─────────────────────────────────────────────────────────────────

export interface X3RunResult {
  runNumber: number;
  laneResults: LaneResult[];
  timestamp: number;
}

export interface X3StabilityResult {
  runs: X3RunResult[];
  allRunsMatch: boolean;
  flakyItems: string[]; // items that varied between runs
  verdict: Verdict;
}

// ─────────────────────────────────────────────────────────────────
// PROOF PACK
// ─────────────────────────────────────────────────────────────────

export interface ProofPackManifest {
  path: string;
  files: string[];
  generatedAt: number;
  shortSha: string;
}

// ─────────────────────────────────────────────────────────────────
// FULL EVAL SESSION
// ─────────────────────────────────────────────────────────────────

export interface EvalSession {
  sessionId: string;
  version: string;
  timestamp: number;
  championBaseline: string; // commit SHA
  lanes: LaneResult[];
  comparisons: ComparisonResult[];
  antiLieViolations: AntiLieViolation[];
  scorecards: ScorecardResult[];
  gates: GatesReport;
  x3Stability: X3StabilityResult | null;
  finalVerdict: Verdict;
  proofPackPath: string | null;
}

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────

export interface EvalConfig {
  datasetVersion: string;
  lanes: LaneId[];
  provider: 'champion' | 'challenger' | 'both';
  shadowMode: boolean;
  x3Runs: boolean;
  generateProofPack: boolean;
  timeoutMs: number;
}

export const DEFAULT_EVAL_CONFIG: EvalConfig = {
  datasetVersion: 'v1',
  lanes: ['A', 'B', 'C', 'D', 'E', 'F'],
  provider: 'both',
  shadowMode: true,
  x3Runs: false,
  generateProofPack: true,
  timeoutMs: 30000,
};
