import { describe, expect, it } from 'vitest';

import {
  attachCanonicalDecision,
  attachMemoryDecision,
  attachQualityCritique,
  attachTracePolicyVersion,
  attachWebResearchResult,
  attachWebTruthPolicy,
  attachQualityActionPolicy,
  createInitialTrace,
  resolveFinalVerdict,
  type CanonicalDecisionInput,
} from '../cognitiveRuntimeTrace';
import {
  applyMetaCognitionGuardToTrace,
  evaluateMetaCognitionGuard,
} from '../metaCognitionGuard';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function stableCanonical(): CanonicalDecisionInput {
  return {
    mode: 'conversation',
    modeClassification: { canonicalMode: 'conversation', confidence: 0.9 },
    profileId: 'BALANCED',
    inferenceState: 'SAFE_TO_INFER',
    truthStatus: 'STABLE',
    confidence: 0.9,
    messageComplexity: 0.4,
    signals: [],
  };
}

/** Build a fully healthy trace that should yield action=none, anomalyDetected=false. */
function buildHealthyTrace() {
  const cTrace = createInitialTrace({
    messageLength: 100,
    requiresFreshness: false,
    requiresWeb: false,
    requiresMemory: false,
    taskFamily: 'conversation',
  });
  attachCanonicalDecision(cTrace, stableCanonical());
  attachTracePolicyVersion(cTrace, { version: 'v2' });
  attachMemoryDecision(cTrace, {
    use: false,
    sources: [],
    reasonCode: 'no_context',
    relevance: 'low',
  });
  attachWebResearchResult(cTrace, {
    needed: false,
    attempted: false,
    available: false,
    sourceCount: 0,
    limitations: [],
    reasonCode: 'not_needed',
  });
  attachWebTruthPolicy(cTrace, {
    evaluated: true,
    need: 'not_needed',
    status: 'not_needed',
    shouldUseWeb: false,
    shouldWarnUser: false,
    limitations: [],
  });
  attachQualityActionPolicy(cTrace, {
    evaluated: true,
    action: 'none',
    minimumVerdict: 'PASS',
    reasonCode: 'quality_pass',
    warnUser: false,
  });
  resolveFinalVerdict(cTrace);
  return cTrace;
}

/** Build a trace with web needed but unavailable and current verdict=PASS. */
function buildWebNeededUnavailableTrace() {
  const cTrace = createInitialTrace({
    messageLength: 100,
    requiresFreshness: true,
    requiresWeb: true,
    requiresMemory: false,
    taskFamily: 'research',
  });
  attachCanonicalDecision(cTrace, stableCanonical());
  attachTracePolicyVersion(cTrace, { version: 'v2' });
  attachMemoryDecision(cTrace, {
    use: false,
    sources: [],
    reasonCode: 'no_context',
    relevance: 'low',
  });
  attachWebResearchResult(cTrace, {
    needed: true,
    attempted: true,
    available: false,
    sourceCount: 0,
    limitations: ['web-unavailable'],
    reasonCode: 'web_failed',
  });
  attachWebTruthPolicy(cTrace, {
    evaluated: true,
    need: 'freshness_required',
    status: 'web_unavailable',
    shouldUseWeb: true,
    shouldWarnUser: true,
    limitations: ['web-unavailable'],
  });
  attachQualityActionPolicy(cTrace, {
    evaluated: false,
    action: 'none',
    minimumVerdict: 'PASS',
    reasonCode: 'quality_pass',
    warnUser: false,
  });
  resolveFinalVerdict(cTrace);
  // Force verdict to PASS to simulate a false-pass scenario
  cTrace.final.verdict = 'PASS';
  cTrace.final.safeToRemember = true;
  return cTrace;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST CASES
// ─────────────────────────────────────────────────────────────────────────────

describe('MetaCognitionGuard v1', () => {
  // Test 1 — healthy trace
  it('1. healthy trace → action none, no anomaly, coherence ≥ 0.9', () => {
    const trace = buildHealthyTrace();
    const decision = evaluateMetaCognitionGuard(trace);

    expect(decision.evaluated).toBe(true);
    expect(decision.action).toBe('none');
    expect(decision.anomalyDetected).toBe(false);
    expect(decision.issues).toHaveLength(0);
    expect(decision.coherenceScore).toBeGreaterThanOrEqual(0.9);
  });

  // Test 2 — web needed + unavailable + verdict PASS → false_pass_web_unproven
  it('2. web needed + unavailable + PASS → add_limitation, UNCERTAIN, freeze memory', () => {
    const trace = buildWebNeededUnavailableTrace();
    const decision = evaluateMetaCognitionGuard(trace);

    const webIssue = decision.issues.find(i => i.code === 'false_pass_web_unproven');
    expect(webIssue).toBeDefined();
    expect(decision.action).toBe('add_limitation');
    expect(decision.recommendedVerdict).toBe('UNCERTAIN');
    expect(decision.freezeMemorySave).toBe(true);
    expect(decision.anomalyDetected).toBe(true);
  });

  // Test 3 — quality low (0.5) + PASS → regenerate_with_constraints, UNCERTAIN
  it('3. quality low (0.5 < 0.65) + PASS → regenerate_with_constraints, UNCERTAIN', () => {
    const trace = buildHealthyTrace();
    attachQualityCritique(trace, {
      alignmentScore: 0.5,
      completenessScore: 0.5,
      depthMatchScore: 0.5,
      overallScore: 0.5,
      shouldEnhance: true,
      enhancementHint: 'needs more depth',
    });
    trace.final.verdict = 'PASS';
    trace.final.safeToRemember = true;

    const decision = evaluateMetaCognitionGuard(trace);

    const qualityIssue = decision.issues.find(i => i.code === 'false_pass_quality_low');
    expect(qualityIssue).toBeDefined();
    expect(decision.action).toBe('regenerate_with_constraints');
    expect(decision.recommendedVerdict).toBe('UNCERTAIN');
    expect(decision.freezeMemorySave).toBe(true);
  });

  // Test 4 — quality critical (0.3 < 0.45) + PASS → block or FAIL
  it('4. quality critical (0.3 < 0.45) + PASS → regenerate_with_constraints, FAIL', () => {
    const trace = buildHealthyTrace();
    attachQualityCritique(trace, {
      alignmentScore: 0.3,
      completenessScore: 0.3,
      depthMatchScore: 0.3,
      overallScore: 0.3,
      shouldEnhance: true,
      enhancementHint: '',
    });
    trace.final.verdict = 'PASS';
    trace.final.safeToRemember = true;

    const decision = evaluateMetaCognitionGuard(trace);

    const qualityIssue = decision.issues.find(i => i.code === 'false_pass_quality_low');
    expect(qualityIssue).toBeDefined();
    // regenerate_with_constraints + FAIL
    expect(decision.action).toBe('regenerate_with_constraints');
    expect(decision.recommendedVerdict).toBe('FAIL');
    expect(decision.freezeMemorySave).toBe(true);
  });

  // Test 5 — canonical missing → block_response, BLOCKED
  it('5. canonical missing → block_response, BLOCKED', () => {
    const trace = createInitialTrace({
      messageLength: 80,
      requiresFreshness: false,
      requiresWeb: false,
      requiresMemory: false,
      taskFamily: 'conversation',
    });
    // Deliberately skip attachCanonicalDecision to simulate missing canonical
    trace.final.verdict = 'PASS';
    trace.final.safeToRemember = true;

    const decision = evaluateMetaCognitionGuard(trace);

    const canonicalIssue = decision.issues.find(i => i.code === 'canonical_missing');
    expect(canonicalIssue).toBeDefined();
    expect(decision.action).toBe('block_response');
    expect(decision.recommendedVerdict).toBe('BLOCKED');
    expect(decision.freezeMemorySave).toBe(true);
  });

  // Test 6 — CLARIFY_REQUIRED → request_clarification, BLOCKED
  it('6. CLARIFY_REQUIRED inference state → request_clarification, BLOCKED', () => {
    const trace = buildHealthyTrace();
    trace.canonical.inferenceState = 'CLARIFY_REQUIRED';
    trace.final.verdict = 'PASS';
    trace.final.safeToRemember = true;

    const decision = evaluateMetaCognitionGuard(trace);

    const blockingIssue = decision.issues.find(
      i => i.code === 'blocking_inference_state'
    );
    expect(blockingIssue).toBeDefined();
    expect(['request_clarification', 'block_response']).toContain(decision.action);
    expect(['BLOCKED', 'FAIL']).toContain(decision.recommendedVerdict);
    expect(decision.freezeMemorySave).toBe(true);
  });

  // Test 7 — memory risk conflict → freeze_memory_save
  it('7. memory risk=conflict_with_current_message → freeze_memory_save', () => {
    const trace = buildHealthyTrace();
    trace.memory.risk = 'conflict_with_current_message';

    const decision = evaluateMetaCognitionGuard(trace);

    const memIssue = decision.issues.find(i => i.code === 'memory_context_conflict');
    expect(memIssue).toBeDefined();
    expect(decision.freezeMemorySave).toBe(true);
    // action must be at least freeze_memory_save
    const ACTION_STRENGTH: Record<string, number> = {
      none: 0,
      add_limitation: 1,
      freeze_memory_save: 2,
      request_clarification: 3,
      regenerate_with_constraints: 4,
      block_response: 5,
    };
    expect(ACTION_STRENGTH[decision.action]).toBeGreaterThanOrEqual(
      ACTION_STRENGTH['freeze_memory_save']
    );
  });

  // Test 8 — raw reasoning key in trace → block_response, FAIL
  it('8. raw reasoning key present → block_response, FAIL', () => {
    const trace = buildHealthyTrace();
    // Inject forbidden key
    (trace as unknown as Record<string, unknown>)['chainOfThought'] = 'secret reasoning';

    const decision = evaluateMetaCognitionGuard(trace);

    const leakIssue = decision.issues.find(i => i.code === 'raw_reasoning_leak_risk');
    expect(leakIssue).toBeDefined();
    expect(decision.action).toBe('block_response');
    expect(decision.recommendedVerdict).toBe('FAIL');
    expect(decision.freezeMemorySave).toBe(true);
  });

  // Test 9 — multiple issues → strongest action wins
  it('9. multiple issues → strongest action wins (block_response > add_limitation)', () => {
    const trace = buildWebNeededUnavailableTrace();
    // Add canonical missing on top
    trace.canonical.attached = false;

    const decision = evaluateMetaCognitionGuard(trace);

    // canonical_missing triggers block_response, which should dominate add_limitation
    expect(decision.action).toBe('block_response');
    expect(decision.issues.length).toBeGreaterThanOrEqual(2);
  });

  // Test 10 — recommended verdict never weakens existing
  it('10. recommended verdict never weakens existing verdict', () => {
    const trace = buildHealthyTrace();
    trace.final.verdict = 'FAIL'; // already FAIL — guard must not weaken to PASS

    const decision = evaluateMetaCognitionGuard(trace);

    // recommendedVerdict must be >= FAIL
    const STRENGTH: Record<string, number> = {
      PASS: 0,
      QUALIFIED: 1,
      UNCERTAIN: 2,
      BLOCKED: 3,
      FAIL: 4,
    };
    expect(STRENGTH[decision.recommendedVerdict]).toBeGreaterThanOrEqual(
      STRENGTH['FAIL']
    );
  });

  // Test 11 — policy floor ignored → strictest floor applied
  it('11. qualityAction.minimumVerdict=BLOCKED but verdict=PASS → floor enforced', () => {
    const trace = buildHealthyTrace();
    trace.policy.qualityAction.minimumVerdict = 'BLOCKED';
    trace.final.verdict = 'PASS';

    const decision = evaluateMetaCognitionGuard(trace);

    const floorIssue = decision.issues.find(
      i => i.code === 'false_pass_policy_floor_ignored'
    );
    expect(floorIssue).toBeDefined();
    const STRENGTH: Record<string, number> = {
      PASS: 0,
      QUALIFIED: 1,
      UNCERTAIN: 2,
      BLOCKED: 3,
      FAIL: 4,
    };
    expect(STRENGTH[decision.recommendedVerdict]).toBeGreaterThanOrEqual(
      STRENGTH['BLOCKED']
    );
  });

  // Test 12 — applyMetaCognitionGuardToTrace updates metaCognition and safeToRemember
  it('12. applyMetaCognitionGuardToTrace updates metaCognition and safeToRemember', () => {
    const trace = buildHealthyTrace();
    const decision = evaluateMetaCognitionGuard(trace);
    const updatedTrace = applyMetaCognitionGuardToTrace(trace, decision);

    expect(updatedTrace.metaCognition.evaluated).toBe(true);
    expect(updatedTrace.metaCognition.guardAction).toBe(decision.action);
    expect(updatedTrace.metaCognition.freezeMemorySave).toBe(decision.freezeMemorySave);
    expect(updatedTrace.metaCognition.issues).toEqual(decision.issues);
    expect(updatedTrace.metaCognition.coherenceScore).toBe(decision.coherenceScore);
    // Guard must never weaken existing verdict
    const STRENGTH: Record<string, number> = {
      PASS: 0,
      QUALIFIED: 1,
      UNCERTAIN: 2,
      BLOCKED: 3,
      FAIL: 4,
    };
    expect(STRENGTH[updatedTrace.final.verdict]).toBeGreaterThanOrEqual(
      STRENGTH[decision.recommendedVerdict]
    );
    // For healthy trace, safeToRemember should remain true
    expect(updatedTrace.final.safeToRemember).toBe(true);
  });
});
