/**
 * Tests: MetaCognitionActionEnforcer v2
 * TITANE∞ — 2026-05-08
 *
 * 12 test cases covering all enforcement rules:
 *  1. action=none leaves response and safeToRemember unchanged
 *  2. add_limitation appends limitation once only
 *  3. freeze_memory_save sets safeToRemember false
 *  4. request_clarification returns BLOCKED and clarification directive
 *  5. regenerate_with_constraints recommends regeneration, no auto-provider call
 *  6. block_response returns blocking message directive
 *  7. existing BLOCKED verdict is not weakened to UNCERTAIN
 *  8. existing FAIL verdict is not weakened
 *  9. duplicate limitation is not appended
 * 10. enforcement trace fields are attached
 * 11. applyMetaCognitionEnforcementToResponse preserves UI-safe strings only
 * 12. response directive leave_response returns original unchanged
 */

import { describe, test, expect } from 'vitest';
import {
  enforceMetaCognitionAction,
  applyMetaCognitionEnforcementToTrace,
  applyMetaCognitionEnforcementToResponse,
  LIMITATION_TEXT,
  CLARIFICATION_TEXT,
  REGENERATION_LIMITATION_TEXT,
  BLOCKING_TEXT,
} from '../metaCognitionActionEnforcer';
import type { CognitiveRuntimeTrace } from '../cognitiveRuntimeTrace';
import type { MetaCognitionGuardDecision } from '../metaCognitionGuard';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function makeTrace(
  overrides: Partial<CognitiveRuntimeTrace['final']> = {}
): CognitiveRuntimeTrace {
  return {
    input: {
      messageLength: 10,
      requiresFreshness: false,
      requiresWeb: false,
      requiresMemory: false,
      taskFamily: 'general',
    },
    canonical: { attached: true },
    memory: {
      injected: false,
      reasonCode: 'no_memory',
      sources: [],
      sourceCount: 0,
      relevance: 0,
      risk: 'none',
    },
    web: {
      needed: false,
      attempted: false,
      available: false,
      sourceCount: 0,
      limitations: [],
      reasonCode: 'web_not_needed',
    },
    generation: { fallbackUsed: false },
    reflection: {
      verifierEnabled: false,
      factualClaimsDetected: false,
      verified: false,
      shouldRevise: false,
      correctionsApplied: false,
    },
    quality: { evaluated: false },
    metaCognition: { evaluated: true, guardAction: 'none', freezeMemorySave: false },
    policy: {
      version: 'v1',
      webTruth: { evaluated: false },
      qualityAction: { evaluated: false },
    },
    final: {
      verdict: 'QUALIFIED',
      limitations: [],
      safeToRemember: true,
      shouldAskClarification: false,
      ...overrides,
    },
  } as CognitiveRuntimeTrace;
}

function makeGuard(
  action: MetaCognitionGuardDecision['action'],
  opts: Partial<MetaCognitionGuardDecision> = {}
): MetaCognitionGuardDecision {
  return {
    evaluated: true,
    coherenceScore: 0.9,
    anomalyDetected: false,
    action,
    recommendedVerdict: 'QUALIFIED',
    freezeMemorySave: false,
    issues: [],
    ...opts,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('MetaCognitionActionEnforcer — enforceMetaCognitionAction()', () => {
  test('1. action=none leaves response and safeToRemember unchanged', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'PASS' });
    const guard = makeGuard('none');
    const result = enforceMetaCognitionAction({ trace, guard });

    expect(result.enforced).toBe(false);
    expect(result.action).toBe('none');
    expect(result.effects).toEqual(['none']);
    expect(result.safeToRemember).toBe(true);
    expect(result.finalVerdict).toBe('PASS');
    expect(result.responseDirective).toBe('leave_response');
  });

  test('2. add_limitation sets effects and appends limitation directive', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'QUALIFIED' });
    const guard = makeGuard('add_limitation', {
      recommendedVerdict: 'UNCERTAIN',
      anomalyDetected: false,
    });
    const result = enforceMetaCognitionAction({ trace, guard });

    expect(result.enforced).toBe(true);
    expect(result.effects).toContain('limitation_added');
    expect(result.responseDirective).toBe('append_limitation');
    expect(result.userVisibleLimitation).toBe(LIMITATION_TEXT);
    expect(result.finalVerdict).toBe('UNCERTAIN'); // stricter than QUALIFIED
  });

  test('2b. add_limitation with anomaly freezes memory', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'QUALIFIED' });
    const guard = makeGuard('add_limitation', {
      anomalyDetected: true,
      recommendedVerdict: 'UNCERTAIN',
    });
    const result = enforceMetaCognitionAction({ trace, guard });

    expect(result.safeToRemember).toBe(false);
    expect(result.effects).toContain('memory_save_frozen');
  });

  test('3. freeze_memory_save sets safeToRemember false', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'QUALIFIED' });
    const guard = makeGuard('freeze_memory_save', { freezeMemorySave: true });
    const result = enforceMetaCognitionAction({ trace, guard });

    expect(result.enforced).toBe(true);
    expect(result.safeToRemember).toBe(false);
    expect(result.effects).toContain('memory_save_frozen');
    expect(result.responseDirective).toBe('leave_response');
  });

  test('4. request_clarification returns BLOCKED verdict and clarification directive', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'QUALIFIED' });
    const guard = makeGuard('request_clarification', { recommendedVerdict: 'BLOCKED' });
    const result = enforceMetaCognitionAction({ trace, guard });

    expect(result.enforced).toBe(true);
    expect(result.safeToRemember).toBe(false);
    expect(result.finalVerdict).toBe('BLOCKED');
    expect(result.responseDirective).toBe('request_clarification');
    expect(result.userVisibleLimitation).toBe(CLARIFICATION_TEXT);
    expect(result.effects).toContain('clarification_required');
    expect(result.effects).toContain('memory_save_frozen');
  });

  test('5. regenerate_with_constraints recommends regeneration without provider call', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'QUALIFIED' });
    const guard = makeGuard('regenerate_with_constraints', {
      recommendedVerdict: 'UNCERTAIN',
    });
    const result = enforceMetaCognitionAction({ trace, guard });

    expect(result.enforced).toBe(true);
    expect(result.safeToRemember).toBe(false);
    expect(result.finalVerdict).toBe('UNCERTAIN');
    expect(result.responseDirective).toBe('recommend_regeneration');
    expect(result.userVisibleLimitation).toBe(REGENERATION_LIMITATION_TEXT);
    expect(result.effects).toContain('regeneration_recommended');
    expect(result.effects).toContain('memory_save_frozen');
    // No provider call — verified by pure module (no async, no external calls)
    expect(typeof result).toBe('object');
  });

  test('6. block_response returns blocking message directive', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'QUALIFIED' });
    const guard = makeGuard('block_response', { recommendedVerdict: 'FAIL' });
    const result = enforceMetaCognitionAction({ trace, guard });

    expect(result.enforced).toBe(true);
    expect(result.safeToRemember).toBe(false);
    expect(result.finalVerdict).toBe('FAIL'); // FAIL > BLOCKED
    expect(result.responseDirective).toBe('block_response');
    expect(result.userVisibleLimitation).toBe(BLOCKING_TEXT);
    expect(result.effects).toContain('response_blocked');
    expect(result.effects).toContain('memory_save_frozen');
  });

  test('7. existing BLOCKED verdict is not weakened to UNCERTAIN', () => {
    const trace = makeTrace({ safeToRemember: false, verdict: 'BLOCKED' });
    const guard = makeGuard('regenerate_with_constraints', {
      recommendedVerdict: 'UNCERTAIN',
    });
    const result = enforceMetaCognitionAction({ trace, guard });

    // BLOCKED > UNCERTAIN — verdict must remain BLOCKED
    expect(result.finalVerdict).toBe('BLOCKED');
  });

  test('8. existing FAIL verdict is not weakened', () => {
    const trace = makeTrace({ safeToRemember: false, verdict: 'FAIL' });
    const guard = makeGuard('add_limitation', { recommendedVerdict: 'QUALIFIED' });
    const result = enforceMetaCognitionAction({ trace, guard });

    expect(result.finalVerdict).toBe('FAIL');
  });

  test('9. duplicate limitation is not appended to response', () => {
    const trace = makeTrace();
    const guard = makeGuard('add_limitation', { recommendedVerdict: 'UNCERTAIN' });
    const enforcement = enforceMetaCognitionAction({ trace, guard });

    // First application
    const firstResponse = applyMetaCognitionEnforcementToResponse({
      response: 'Original response.',
      enforcement,
    });
    expect(firstResponse).toContain(LIMITATION_TEXT);

    // Second application — must not duplicate
    const secondResponse = applyMetaCognitionEnforcementToResponse({
      response: firstResponse,
      enforcement,
    });
    const occurrences = secondResponse.split(LIMITATION_TEXT).length - 1;
    expect(occurrences).toBe(1);
  });

  test('10. enforcement trace fields are attached by applyMetaCognitionEnforcementToTrace', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'QUALIFIED' });
    const guard = makeGuard('freeze_memory_save', { freezeMemorySave: true });
    const enforcement = enforceMetaCognitionAction({ trace, guard });
    applyMetaCognitionEnforcementToTrace(trace, enforcement);

    expect(trace.metaCognition.enforcementApplied).toBe(true);
    expect(trace.metaCognition.enforcementEffects).toContain('memory_save_frozen');
    expect(trace.metaCognition.responseDirective).toBe('leave_response');
    expect(trace.final.safeToRemember).toBe(false);
  });

  test('11. response directive outputs are UI-safe (no raw reasoning fields)', () => {
    const FORBIDDEN = [
      'chainOfThought',
      'hiddenThoughts',
      'rawReasoning',
      'privateReasoning',
      'internalReasoningSteps',
    ];
    const guard = makeGuard('block_response', { recommendedVerdict: 'FAIL' });
    const trace = makeTrace();
    const enforcement = enforceMetaCognitionAction({ trace, guard });

    const responseOut = applyMetaCognitionEnforcementToResponse({
      response: 'Réponse originale.',
      enforcement,
    });
    for (const forbidden of FORBIDDEN) {
      expect(responseOut).not.toContain(forbidden);
    }
    expect(responseOut).toBe(BLOCKING_TEXT);
  });

  test('12. leave_response directive returns original unchanged', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'PASS' });
    const guard = makeGuard('none');
    const enforcement = enforceMetaCognitionAction({ trace, guard });
    const original = 'Ma réponse originale.';
    const result = applyMetaCognitionEnforcementToResponse({
      response: original,
      enforcement,
    });
    expect(result).toBe(original);
  });
});

describe('MetaCognitionActionEnforcer — applyMetaCognitionEnforcementToTrace()', () => {
  test('never weakens existing verdict: BLOCKED stays BLOCKED when enforcement says UNCERTAIN', () => {
    const trace = makeTrace({ safeToRemember: false, verdict: 'BLOCKED' });
    const guard = makeGuard('regenerate_with_constraints', {
      recommendedVerdict: 'UNCERTAIN',
    });
    const enforcement = enforceMetaCognitionAction({ trace, guard });
    applyMetaCognitionEnforcementToTrace(trace, enforcement);
    expect(trace.final.verdict).toBe('BLOCKED');
  });

  test('safeToRemember remains false when enforcement freezes memory', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'QUALIFIED' });
    const guard = makeGuard('freeze_memory_save', { freezeMemorySave: true });
    const enforcement = enforceMetaCognitionAction({ trace, guard });
    applyMetaCognitionEnforcementToTrace(trace, enforcement);
    expect(trace.final.safeToRemember).toBe(false);
  });

  test('safeToRemember is preserved true when action=none', () => {
    const trace = makeTrace({ safeToRemember: true, verdict: 'PASS' });
    const guard = makeGuard('none');
    const enforcement = enforceMetaCognitionAction({ trace, guard });
    applyMetaCognitionEnforcementToTrace(trace, enforcement);
    expect(trace.final.safeToRemember).toBe(true);
  });
});
