import { describe, expect, it } from 'vitest';

import {
  attachCanonicalDecision,
  attachMemoryDecision,
  attachQualityActionPolicy,
  attachQualityCritique,
  attachReflectiveCritique,
  attachTracePolicyVersion,
  attachWebResearchResult,
  attachWebTruthPolicy,
  createInitialTrace,
  resolveFinalVerdict,
  sanitizeTraceForUi,
  type CanonicalDecisionInput,
  type CognitiveRuntimeTrace,
} from '../cognitiveRuntimeTrace';

function makeStableCanonicalDecision(): CanonicalDecisionInput {
  return {
    mode: 'default',
    modeClassification: { canonicalMode: 'DIRECT', confidence: 0.9 },
    profileId: 'BALANCED',
    inferenceState: 'SAFE_TO_INFER',
    truthStatus: 'STABLE_PARTIAL',
    confidence: 0.85,
    messageComplexity: 0.3,
    signals: [{ source: 'intent', type: 'intent_classification', value: 'information_request' }],
  };
}

function makeBaseTrace(): CognitiveRuntimeTrace {
  const trace = createInitialTrace({
    messageLength: 42,
    requiresFreshness: false,
    requiresWeb: false,
    requiresMemory: false,
    taskFamily: 'unknown',
  });
  attachCanonicalDecision(trace, makeStableCanonicalDecision());
  attachTracePolicyVersion(trace, { version: 'v2' });
  attachMemoryDecision(trace, {
    use: false,
    sources: [],
    reasonCode: 'no_context',
    relevance: 'low',
  });
  attachWebResearchResult(trace, {
    needed: false,
    attempted: false,
    available: false,
    sourceCount: 0,
    limitations: [],
    reasonCode: 'not_needed',
  });
  attachWebTruthPolicy(trace, {
    need: 'not_needed',
    status: 'not_needed',
    shouldUseWeb: false,
    shouldWarnUser: false,
    limitations: [],
  });
  return trace;
}

describe('cognitiveRuntimeTrace', () => {
  it('creates a trace with expected initial shape', () => {
    const trace = createInitialTrace({
      messageLength: 100,
      requiresFreshness: false,
      requiresWeb: false,
      requiresMemory: false,
      taskFamily: 'unknown',
    });

    expect(trace.traceId).toBeTruthy();
    expect(trace.timestamp).toBeGreaterThan(0);
    expect(trace.input.messageLength).toBe(100);
    expect(trace.canonical.attached).toBe(false);
    expect(trace.policy.version).toBe('v1');
    expect(trace.policy.webTruth.evaluated).toBe(false);
    expect(trace.policy.qualityAction.evaluated).toBe(false);
    expect(trace.final.verdict).toBe('QUALIFIED');
  });

  it('resolves PASS for a stable complete v2 trace', () => {
    const trace = makeBaseTrace();
    attachReflectiveCritique(trace, {
      confidence: 0.8,
      verified: true,
      hasFactualClaims: false,
      shouldRevise: false,
      webSources: [],
    });
    attachQualityCritique(trace, {
      alignmentScore: 0.9,
      completenessScore: 0.85,
      depthMatchScore: 0.75,
      overallScore: 0.85,
      shouldEnhance: false,
      enhancementHint: '',
    });
    attachQualityActionPolicy(trace, {
      action: 'none',
      minimumVerdict: 'PASS',
      reasonCode: 'quality_pass',
      warnUser: false,
    });

    resolveFinalVerdict(trace);

    expect(trace.final.verdict).toBe('PASS');
    expect(trace.final.safeToRemember).toBe(true);
    expect(trace.final.limitations).toHaveLength(0);
  });

  it('resolves QUALIFIED when quality is not evaluated', () => {
    const trace = makeBaseTrace();
    attachQualityActionPolicy(trace, {
      action: 'enhance',
      minimumVerdict: 'QUALIFIED',
      reasonCode: 'not_evaluated',
      warnUser: false,
    });

    resolveFinalVerdict(trace);

    expect(trace.final.verdict).toBe('QUALIFIED');
    expect(trace.final.limitations).toContain('quality-action:not_evaluated');
  });

  it('resolves UNCERTAIN when web policy requires web but no source was produced', () => {
    const trace = makeBaseTrace();
    attachWebResearchResult(trace, {
      needed: true,
      attempted: true,
      available: true,
      sourceCount: 0,
      limitations: ['web-attempted-without-sources'],
      reasonCode: 'web_failed',
    });
    attachWebTruthPolicy(trace, {
      need: 'freshness_required',
      status: 'attempted_no_sources',
      shouldUseWeb: true,
      shouldWarnUser: true,
      limitations: ['web-attempted-without-sources'],
    });
    attachQualityCritique(trace, {
      alignmentScore: 0.8,
      completenessScore: 0.8,
      depthMatchScore: 0.8,
      overallScore: 0.8,
      shouldEnhance: false,
      enhancementHint: '',
    });
    attachQualityActionPolicy(trace, {
      action: 'none',
      minimumVerdict: 'PASS',
      reasonCode: 'quality_pass',
      warnUser: false,
    });

    resolveFinalVerdict(trace);

    expect(trace.final.verdict).toBe('UNCERTAIN');
    expect(trace.final.limitations).toContain('web-policy:attempted_no_sources');
  });

  it('resolves BLOCKED when quality action sets a blocked minimum verdict', () => {
    const trace = makeBaseTrace();
    attachQualityCritique(trace, {
      alignmentScore: 0.2,
      completenessScore: 0.2,
      depthMatchScore: 0.2,
      overallScore: 0.2,
      shouldEnhance: true,
      enhancementHint: 'clarify',
    });
    attachQualityActionPolicy(trace, {
      action: 'clarify',
      minimumVerdict: 'BLOCKED',
      reasonCode: 'clarify_required',
      warnUser: true,
    });

    resolveFinalVerdict(trace);

    expect(trace.final.verdict).toBe('BLOCKED');
    expect(trace.final.shouldAskClarification).toBe(true);
  });

  it('sanitizes forbidden fields and preserves v2 policy blocks', () => {
    const trace = makeBaseTrace() as CognitiveRuntimeTrace & {
      chainOfThought?: string;
    };
    trace.chainOfThought = 'secret';

    const sanitized = sanitizeTraceForUi(trace);

    expect((sanitized as Record<string, unknown>).chainOfThought).toBeUndefined();
    expect(sanitized.policy.version).toBe('v2');
    expect(sanitized.policy.webTruth.evaluated).toBe(true);
  });
});
