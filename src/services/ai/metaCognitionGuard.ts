/**
 * MetaCognitionGuard v1 — Trace-Aware Coherence Gate
 * TITANE∞ — 2026-05-08
 *
 * Pure TypeScript module — no side effects, no async, no provider calls, no IPC.
 *
 * Consumes a CognitiveRuntimeTrace and detects coherence anomalies:
 * - False PASS (web unproven, quality low, policy floor ignored)
 * - Canonical missing / blocking inference state
 * - Memory save risk
 * - Raw reasoning leak risk
 *
 * Recommends bounded actions only. Never modifies assistant text.
 * Never exposes raw chain-of-thought.
 */

import type { CognitiveRuntimeTrace, CognitiveRuntimeVerdict } from './cognitiveRuntimeTrace';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MetaCognitionSeverity = 'info' | 'warning' | 'critical';

export type MetaCognitionIssueCode =
  | 'none'
  | 'false_pass_web_unproven'
  | 'false_pass_quality_low'
  | 'false_pass_policy_floor_ignored'
  | 'canonical_missing'
  | 'blocking_inference_state'
  | 'memory_save_risk'
  | 'memory_context_conflict'
  | 'raw_reasoning_leak_risk'
  | 'trace_incomplete'
  | 'verdict_inconsistent'
  | 'meta_anomaly';

export type MetaCognitionGuardAction =
  | 'none'
  | 'add_limitation'
  | 'request_clarification'
  | 'regenerate_with_constraints'
  | 'freeze_memory_save'
  | 'block_response';

export interface MetaCognitionIssue {
  code: MetaCognitionIssueCode;
  severity: MetaCognitionSeverity;
  message: string;
  evidence: string[];
}

export interface MetaCognitionGuardDecision {
  evaluated: true;
  coherenceScore: number;
  anomalyDetected: boolean;
  action: MetaCognitionGuardAction;
  recommendedVerdict: CognitiveRuntimeVerdict;
  freezeMemorySave: boolean;
  issues: MetaCognitionIssue[];
  requiredAdjustment?: string;
  recommendedNextState?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL — action / verdict strength ordering
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_STRENGTH: Record<MetaCognitionGuardAction, number> = {
  none: 0,
  add_limitation: 1,
  freeze_memory_save: 2,
  request_clarification: 3,
  regenerate_with_constraints: 4,
  block_response: 5,
};

const VERDICT_STRENGTH: Record<CognitiveRuntimeVerdict, number> = {
  PASS: 0,
  QUALIFIED: 1,
  UNCERTAIN: 2,
  BLOCKED: 3,
  FAIL: 4,
};

function strongerAction(a: MetaCognitionGuardAction, b: MetaCognitionGuardAction): MetaCognitionGuardAction {
  return ACTION_STRENGTH[a] >= ACTION_STRENGTH[b] ? a : b;
}

function strongerVerdict(a: CognitiveRuntimeVerdict, b: CognitiveRuntimeVerdict): CognitiveRuntimeVerdict {
  return VERDICT_STRENGTH[a] >= VERDICT_STRENGTH[b] ? a : b;
}

/** Forbidden raw-reasoning field names that must never appear in the trace. */
const FORBIDDEN_RAW_KEYS = [
  'chainOfThought',
  'hiddenThoughts',
  'rawReasoning',
  'privateReasoning',
  'internalReasoningSteps',
];

function containsForbiddenKey(obj: unknown, depth = 0): boolean {
  if (depth > 10 || obj === null || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (FORBIDDEN_RAW_KEYS.includes(key)) return true;
    if (containsForbiddenKey((obj as Record<string, unknown>)[key], depth + 1)) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GUARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluates the guard rules against a CognitiveRuntimeTrace.
 * Pure function — no mutation.
 */
export function evaluateMetaCognitionGuard(
  trace: CognitiveRuntimeTrace,
): MetaCognitionGuardDecision {
  const issues: MetaCognitionIssue[] = [];
  let action: MetaCognitionGuardAction = 'none';
  let recommendedVerdict: CognitiveRuntimeVerdict = trace.final.verdict;
  let freezeMemorySave = !trace.final.safeToRemember;

  const currentVerdict = trace.final.verdict;

  // ── Rule 7: Raw reasoning leak risk (check first — highest priority) ──────
  if (containsForbiddenKey(trace)) {
    issues.push({
      code: 'raw_reasoning_leak_risk',
      severity: 'critical',
      message: 'Forbidden raw-reasoning field detected inside trace',
      evidence: FORBIDDEN_RAW_KEYS.filter(k => JSON.stringify(trace).includes(`"${k}"`)),
    });
    action = strongerAction(action, 'block_response');
    recommendedVerdict = strongerVerdict(recommendedVerdict, 'FAIL');
    freezeMemorySave = true;
  }

  // ── Rule 4: Canonical missing ─────────────────────────────────────────────
  if (!trace.canonical.attached) {
    issues.push({
      code: 'canonical_missing',
      severity: 'critical',
      message: 'Canonical discernment was not attached to this trace',
      evidence: ['trace.canonical.attached === false'],
    });
    action = strongerAction(action, 'block_response');
    recommendedVerdict = strongerVerdict(recommendedVerdict, 'BLOCKED');
    freezeMemorySave = true;
  }

  // ── Rule 5: Blocking inference state ─────────────────────────────────────
  const inferenceState = trace.canonical.inferenceState;
  if (
    inferenceState === 'CLARIFY_REQUIRED' ||
    inferenceState === 'BLOCKED_BY_MISSING_FACT'
  ) {
    issues.push({
      code: 'blocking_inference_state',
      severity: 'critical',
      message: `Blocking inference state: ${inferenceState}`,
      evidence: [`canonical.inferenceState=${inferenceState}`],
    });
    action = strongerAction(action, 'request_clarification');
    recommendedVerdict = strongerVerdict(recommendedVerdict, 'BLOCKED');
    freezeMemorySave = true;
  }

  // ── Rule 1: False PASS — web unproven ────────────────────────────────────
  if (
    currentVerdict === 'PASS' &&
    trace.web.needed === true &&
    trace.web.available !== true &&
    trace.web.sourceCount === 0
  ) {
    issues.push({
      code: 'false_pass_web_unproven',
      severity: 'critical',
      message: 'PASS verdict but web is needed and unavailable',
      evidence: [
        `web.needed=${trace.web.needed}`,
        `web.available=${trace.web.available}`,
        `web.sourceCount=${trace.web.sourceCount}`,
      ],
    });
    action = strongerAction(action, 'add_limitation');
    recommendedVerdict = strongerVerdict(recommendedVerdict, 'UNCERTAIN');
    freezeMemorySave = true;
  }

  // ── Rule 2: False PASS — quality low ─────────────────────────────────────
  if (
    currentVerdict === 'PASS' &&
    trace.quality.evaluated === true &&
    trace.quality.overallScore !== undefined
  ) {
    if (trace.quality.overallScore < 0.45) {
      issues.push({
        code: 'false_pass_quality_low',
        severity: 'critical',
        message: `PASS verdict but quality score critically low (${trace.quality.overallScore.toFixed(2)} < 0.45)`,
        evidence: [`quality.overallScore=${trace.quality.overallScore}`],
      });
      action = strongerAction(action, 'regenerate_with_constraints');
      recommendedVerdict = strongerVerdict(recommendedVerdict, 'FAIL');
      freezeMemorySave = true;
    } else if (trace.quality.overallScore < 0.65) {
      issues.push({
        code: 'false_pass_quality_low',
        severity: 'critical',
        message: `PASS verdict but quality score below threshold (${trace.quality.overallScore.toFixed(2)} < 0.65)`,
        evidence: [`quality.overallScore=${trace.quality.overallScore}`],
      });
      action = strongerAction(action, 'regenerate_with_constraints');
      recommendedVerdict = strongerVerdict(recommendedVerdict, 'UNCERTAIN');
      freezeMemorySave = true;
    }
  }

  // ── Rule 3: Policy floor ignored ─────────────────────────────────────────
  const qualityFloor = trace.policy.qualityAction?.minimumVerdict;
  if (
    qualityFloor &&
    VERDICT_STRENGTH[qualityFloor] > VERDICT_STRENGTH[currentVerdict]
  ) {
    issues.push({
      code: 'false_pass_policy_floor_ignored',
      severity: 'critical',
      message: `Verdict (${currentVerdict}) is weaker than qualityAction policy floor (${qualityFloor})`,
      evidence: [
        `final.verdict=${currentVerdict}`,
        `policy.qualityAction.minimumVerdict=${qualityFloor}`,
      ],
    });
    action = strongerAction(action, 'regenerate_with_constraints');
    recommendedVerdict = strongerVerdict(recommendedVerdict, qualityFloor);
    freezeMemorySave = true;
  }

  // ── Rule 6: Memory save risk ──────────────────────────────────────────────
  const memRisk = trace.memory.risk;
  if (
    memRisk === 'stale' ||
    memRisk === 'irrelevant' ||
    memRisk === 'overfitting' ||
    memRisk === 'conflict_with_current_message'
  ) {
    issues.push({
      code: memRisk === 'conflict_with_current_message' ? 'memory_context_conflict' : 'memory_save_risk',
      severity: memRisk === 'conflict_with_current_message' ? 'critical' : 'warning',
      message: `Memory save risk: ${memRisk}`,
      evidence: [`memory.risk=${memRisk}`],
    });
    action = strongerAction(action, 'freeze_memory_save');
    freezeMemorySave = true;
  }

  // Also freeze on non-PASS final verdict (unless action is already stronger)
  if (
    currentVerdict === 'UNCERTAIN' ||
    currentVerdict === 'BLOCKED' ||
    currentVerdict === 'FAIL'
  ) {
    freezeMemorySave = true;
  }

  // ── Guard invariant: never recommend a weaker verdict ─────────────────────
  recommendedVerdict = strongerVerdict(recommendedVerdict, currentVerdict);

  // ── Coherence score: degraded per critical issue ──────────────────────────
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const coherenceScore = Math.max(0, 1.0 - criticalCount * 0.25 - warningCount * 0.1);

  return {
    evaluated: true,
    coherenceScore,
    anomalyDetected: issues.length > 0,
    action,
    recommendedVerdict,
    freezeMemorySave,
    issues,
    requiredAdjustment: issues.length > 0 ? issues[0]!.message : undefined,
    recommendedNextState: issues.length > 0 ? issues[0]!.code : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLY DECISION TO TRACE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Applies a MetaCognitionGuardDecision to a CognitiveRuntimeTrace.
 * Mutates the trace in-place (consistent with other attach* helpers).
 * Safe to call after resolveFinalVerdict().
 */
export function applyMetaCognitionGuardToTrace(
  trace: CognitiveRuntimeTrace,
  decision: MetaCognitionGuardDecision,
): CognitiveRuntimeTrace {
  trace.metaCognition = {
    ...trace.metaCognition,
    evaluated: true,
    coherenceScore: decision.coherenceScore,
    anomalyDetected: decision.anomalyDetected,
    requiredAdjustment: decision.requiredAdjustment,
    recommendedNextState: decision.recommendedNextState,
    guardAction: decision.action,
    freezeMemorySave: decision.freezeMemorySave,
    issues: decision.issues,
  };

  if (decision.freezeMemorySave) {
    trace.final.safeToRemember = false;
  }

  // Update final verdict only if guard recommends a strictly stronger one
  if (VERDICT_STRENGTH[decision.recommendedVerdict] > VERDICT_STRENGTH[trace.final.verdict]) {
    trace.final.verdict = decision.recommendedVerdict;
  }

  return trace;
}
