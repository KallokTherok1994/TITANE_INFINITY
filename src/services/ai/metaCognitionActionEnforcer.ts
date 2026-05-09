/**
 * MetaCognitionActionEnforcer v2 — Bounded Action Enforcement
 * TITANE∞ — 2026-05-08
 *
 * Pure TypeScript module — no async, no provider calls, no IPC, no storage writes.
 *
 * Converts MetaCognitionGuard decisions into bounded runtime effects:
 *   - limitation_added      → append sober limitation note to response
 *   - memory_save_frozen    → set safeToRemember=false on trace
 *   - clarification_required → mark response as needing clarification, BLOCKED verdict
 *   - regeneration_recommended → note constrained regeneration needed, UNCERTAIN verdict
 *   - response_blocked      → replace response with blocking message
 *
 * Invariants:
 *   - Never weakens an existing verdict (FAIL > BLOCKED > UNCERTAIN > QUALIFIED > PASS)
 *   - Never exposes raw chain-of-thought
 *   - Never calls providers, never writes to storage
 *   - Never auto-regenerates
 */

import type {
  CognitiveRuntimeTrace,
  CognitiveRuntimeVerdict,
} from './cognitiveRuntimeTrace';
import type {
  MetaCognitionGuardAction,
  MetaCognitionGuardDecision,
} from './metaCognitionGuard';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MetaCognitionEnforcementEffect =
  | 'none'
  | 'limitation_added'
  | 'memory_save_frozen'
  | 'clarification_required'
  | 'regeneration_recommended'
  | 'response_blocked';

export interface MetaCognitionEnforcementDecision {
  enforced: boolean;
  action: MetaCognitionGuardAction;
  effects: MetaCognitionEnforcementEffect[];
  finalVerdict: CognitiveRuntimeVerdict;
  safeToRemember: boolean;
  responseDirective:
    | 'leave_response'
    | 'append_limitation'
    | 'request_clarification'
    | 'recommend_regeneration'
    | 'block_response';
  userVisibleLimitation?: string;
  reasonCodes: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL — verdict strength ordering (higher = stricter)
// ─────────────────────────────────────────────────────────────────────────────

const VERDICT_STRENGTH: Record<CognitiveRuntimeVerdict, number> = {
  PASS: 0,
  QUALIFIED: 1,
  UNCERTAIN: 2,
  BLOCKED: 3,
  FAIL: 4,
};

/** Returns the stricter (higher-strength) of two verdicts — never weakens. */
function maxVerdict(
  a: CognitiveRuntimeVerdict,
  b: CognitiveRuntimeVerdict
): CognitiveRuntimeVerdict {
  return VERDICT_STRENGTH[a] >= VERDICT_STRENGTH[b] ? a : b;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC MESSAGES — UI-safe, no raw reasoning
// ─────────────────────────────────────────────────────────────────────────────

export const LIMITATION_TEXT =
  'Limite\u00a0: cette réponse doit être considérée comme partiellement qualifiée, car certaines preuves runtime sont incomplètes.';

export const CLARIFICATION_TEXT =
  'Je dois clarifier un point avant de répondre correctement. Peux-tu préciser l\u2019élément manquant\u00a0?';

export const REGENERATION_LIMITATION_TEXT =
  'Limite\u00a0: une régénération contrainte serait nécessaire pour fiabiliser cette réponse.';

export const BLOCKING_TEXT =
  'Je ne peux pas produire une réponse fiable dans cet état\u00a0: les signaux internes indiquent une incohérence critique ou un risque de fausse certitude.';

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a guard decision into a bounded enforcement decision.
 *
 * Pure function — reads trace and guard, returns an EnforcementDecision.
 * No side effects.
 */
export function enforceMetaCognitionAction(input: {
  trace: CognitiveRuntimeTrace;
  guard: MetaCognitionGuardDecision;
  assistantText?: string;
}): MetaCognitionEnforcementDecision {
  const { trace, guard } = input;
  const traceVerdict = trace.final.verdict;
  const traceSafeToRemember = trace.final.safeToRemember;

  // Action=none → pass-through, preserve trace state
  if (guard.action === 'none') {
    return {
      enforced: false,
      action: 'none',
      effects: ['none'],
      finalVerdict: traceVerdict,
      safeToRemember: traceSafeToRemember,
      responseDirective: 'leave_response',
      reasonCodes: ['guard_action_none'],
    };
  }

  const effects: MetaCognitionEnforcementEffect[] = [];
  const reasonCodes: string[] = [];
  let safeToRemember = traceSafeToRemember;
  let responseDirective: MetaCognitionEnforcementDecision['responseDirective'] =
    'leave_response';
  let userVisibleLimitation: string | undefined;

  // Base verdict = strictest of (trace, guard.recommendedVerdict)
  let finalVerdict: CognitiveRuntimeVerdict = maxVerdict(
    traceVerdict,
    guard.recommendedVerdict
  );

  // ── Rule 1: add_limitation ────────────────────────────────────────────────
  if (guard.action === 'add_limitation') {
    effects.push('limitation_added');
    reasonCodes.push('guard_add_limitation');
    responseDirective = 'append_limitation';
    userVisibleLimitation = LIMITATION_TEXT;
    // Memory: freeze if anomaly detected or web was unproven
    if (
      guard.anomalyDetected ||
      guard.issues.some(i => i.code === 'false_pass_web_unproven')
    ) {
      safeToRemember = false;
      effects.push('memory_save_frozen');
      reasonCodes.push('anomaly_or_web_unproven');
    }
    // Verdict: no stronger than guard.recommendedVerdict (already applied by maxVerdict)
  }

  // ── Rule 2: freeze_memory_save ────────────────────────────────────────────
  else if (guard.action === 'freeze_memory_save' || guard.freezeMemorySave) {
    effects.push('memory_save_frozen');
    reasonCodes.push('guard_freeze_memory_save');
    safeToRemember = false;
    // Directive: leave_response unless stronger issue overrides
    responseDirective = 'leave_response';
    // Verdict: keep existing or stricter (already applied by maxVerdict)
  }

  // ── Rule 3: request_clarification ────────────────────────────────────────
  else if (guard.action === 'request_clarification') {
    effects.push('clarification_required');
    effects.push('memory_save_frozen');
    reasonCodes.push('guard_request_clarification');
    safeToRemember = false;
    responseDirective = 'request_clarification';
    userVisibleLimitation = CLARIFICATION_TEXT;
    finalVerdict = maxVerdict(finalVerdict, 'BLOCKED');
  }

  // ── Rule 4: regenerate_with_constraints ──────────────────────────────────
  else if (guard.action === 'regenerate_with_constraints') {
    effects.push('regeneration_recommended');
    effects.push('memory_save_frozen');
    reasonCodes.push('guard_regenerate_with_constraints');
    safeToRemember = false;
    responseDirective = 'recommend_regeneration';
    userVisibleLimitation = REGENERATION_LIMITATION_TEXT;
    // Verdict: at least UNCERTAIN
    finalVerdict = maxVerdict(finalVerdict, 'UNCERTAIN');
    // Note: no auto-regeneration in v2 — directive is informational
  }

  // ── Rule 5: block_response ────────────────────────────────────────────────
  else if (guard.action === 'block_response') {
    effects.push('response_blocked');
    effects.push('memory_save_frozen');
    reasonCodes.push('guard_block_response');
    safeToRemember = false;
    responseDirective = 'block_response';
    userVisibleLimitation = BLOCKING_TEXT;
    // Verdict: at least BLOCKED; or FAIL if guard recommended it
    finalVerdict = maxVerdict(finalVerdict, 'BLOCKED');
  }

  // ── Fallback: catch-all if action is a future unknown value ───────────────
  else {
    effects.push('memory_save_frozen');
    reasonCodes.push('unknown_guard_action_freeze');
    safeToRemember = false;
    responseDirective = 'leave_response';
  }

  // ── Freeze memory if guard.freezeMemorySave is set (orthogonal to action) ─
  if (guard.freezeMemorySave && !effects.includes('memory_save_frozen')) {
    effects.push('memory_save_frozen');
    reasonCodes.push('guard_freeze_memory_save_flag');
    safeToRemember = false;
  }

  return {
    enforced: true,
    action: guard.action,
    effects,
    finalVerdict,
    safeToRemember,
    responseDirective,
    userVisibleLimitation,
    reasonCodes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACE APPLICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mutates the trace in-place to apply enforcement effects:
 * - sets trace.final.safeToRemember
 * - sets trace.final.verdict (never weakens)
 * - sets trace.metaCognition enforcement fields
 *
 * Returns the trace reference for convenience.
 */
export function applyMetaCognitionEnforcementToTrace(
  trace: CognitiveRuntimeTrace,
  enforcement: MetaCognitionEnforcementDecision
): CognitiveRuntimeTrace {
  // Never weaken the existing verdict
  const existingStrength = VERDICT_STRENGTH[trace.final.verdict];
  const enforcedStrength = VERDICT_STRENGTH[enforcement.finalVerdict];
  if (enforcedStrength > existingStrength) {
    trace.final.verdict = enforcement.finalVerdict;
  }

  // Set safeToRemember
  if (!enforcement.safeToRemember) {
    trace.final.safeToRemember = false;
  }

  // Attach enforcement fields to metaCognition
  trace.metaCognition.enforcementApplied = enforcement.enforced;
  trace.metaCognition.enforcementEffects = enforcement.effects;
  trace.metaCognition.responseDirective = enforcement.responseDirective;

  return trace;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE APPLICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a potentially modified response string based on enforcement directive.
 *
 * Pure function — no side effects.
 *
 * - 'leave_response'        → returns original response unchanged
 * - 'append_limitation'     → appends limitation note if not already present
 * - 'request_clarification' → returns clarification message
 * - 'recommend_regeneration'→ appends regeneration limitation note
 * - 'block_response'        → returns blocking message
 */
export function applyMetaCognitionEnforcementToResponse(input: {
  response: string;
  enforcement: MetaCognitionEnforcementDecision;
}): string {
  const { response, enforcement } = input;

  switch (enforcement.responseDirective) {
    case 'leave_response':
      return response;

    case 'append_limitation': {
      const limitationText = enforcement.userVisibleLimitation ?? LIMITATION_TEXT;
      // Do not duplicate limitation if already present
      if (response.includes(limitationText)) {
        return response;
      }
      return `${response}\n\n${limitationText}`;
    }

    case 'request_clarification':
      return enforcement.userVisibleLimitation ?? CLARIFICATION_TEXT;

    case 'recommend_regeneration': {
      const regenText = enforcement.userVisibleLimitation ?? REGENERATION_LIMITATION_TEXT;
      if (response.includes(regenText)) {
        return response;
      }
      return `${response}\n\n${regenText}`;
    }

    case 'block_response':
      return enforcement.userVisibleLimitation ?? BLOCKING_TEXT;

    default:
      return response;
  }
}
