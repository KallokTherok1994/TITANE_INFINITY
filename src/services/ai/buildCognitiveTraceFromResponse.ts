/**
 * Pure builder for cognitive trace construction from response omega_trace_meta.
 *
 * This module isolates trace construction from the hook layer to:
 * 1. Enable unit testing of individual attachment steps
 * 2. Identify exact failing stage (returned in diagnostics)
 * 3. Replace silent catches with safe error capture
 * 4. Preserve no raw chain-of-thought or model output in errors
 *
 * Strategy: wrap each attachment function in try-catch, capture stage + error,
 * return discriminated result with UI-safe diagnostics only.
 *
 * Semantics:
 * - If build succeeds: return { ok: true, trace, diagnostics }
 * - If build fails at stage N: return { ok: false, trace: null, error: { stage, message }, diagnostics }
 * - Always return UI-safe diagnostics (no raw output, no stack traces, no secrets)
 */

import type { CognitiveRuntimeTrace } from './cognitiveRuntimeTrace';
import type { OmegaTraceMeta } from '@/services/conversationEngine';
import {
  createInitialTrace,
  attachTracePolicyVersion,
  attachMemoryDecision,
  attachGenerationResult,
  attachWebResearchResult,
  attachWebTruthPolicy,
  attachQualityCritique,
  attachQualityActionPolicy,
  resolveFinalVerdict,
  sanitizeTraceForUi,
} from './cognitiveRuntimeTrace';
import {
  evaluateMetaCognitionGuard,
  applyMetaCognitionGuardToTrace,
} from './metaCognitionGuard';
import {
  enforceMetaCognitionAction,
  applyMetaCognitionEnforcementToTrace,
  applyMetaCognitionEnforcementToResponse,
} from './metaCognitionActionEnforcer';
import { evaluateWebTruthPolicy } from './webTruthPolicy';
import { evaluateQualityActionPolicy } from './qualityActionPolicy';
import { QUALITY_THRESHOLD } from './qualityVerifier';

/**
 * Diagnostics attached to result regardless of success/failure.
 * UI-safe only: no raw output, no stack traces, no provider secrets.
 */
export interface CognitiveTraceBuildDiagnostics {
  /** Timestamp when build started */
  timestamp: string;
  /** Number of attachment steps completed before error (if any) */
  stepsCompleted: number;
  /** Whether MetaCognitionGuard was evaluated (even if enforcement failed) */
  guardEvaluated: boolean;
  /** Whether MetaCognitionActionEnforcer was applied (even if attachment failed) */
  enforcementApplied: boolean;
  /** Whether sanitization was attempted */
  sanitizationAttempted: boolean;
  /** UI-safe note about trace construction (max 256 chars) */
  note?: string;
}

/**
 * Failure details returned when trace build fails.
 * Error data is constrained to UI-safe values only.
 */
export interface CognitiveTraceBuildError {
  /** Stage name where error occurred (e.g. "attachCanonicalDecision") */
  stage: string;
  /** UI-safe error message (max 256 chars, no stack trace, no raw output) */
  message: string;
  /** Error constructor name if available (e.g. "TypeError", "RangeError") */
  name?: string;
}

/**
 * Discriminated result type for trace construction.
 * Enables type-safe handling of success vs failure in consuming code.
 */
export type CognitiveTraceBuildResult =
  | {
      ok: true;
      trace: CognitiveRuntimeTrace;
      diagnostics: CognitiveTraceBuildDiagnostics;
    }
  | {
      ok: false;
      trace: null;
      diagnostics: CognitiveTraceBuildDiagnostics;
      error: CognitiveTraceBuildError;
    };

/**
 * Input parameters for trace construction.
 * All fields are normalized from response + hook context.
 */
export interface BuildCognitiveTraceInput {
  /** Raw omega_trace_meta from backend response */
  omegaMeta: OmegaTraceMeta;
  /** User's original message text */
  userMessage: string;
  /** Assistant's generated response text */
  assistantText: string;
  /** Conversation ID (for trace context) */
  conversationId: string;
  /** Turn ID in this conversation (optional) */
  turnId?: string;
  /** Memory links extracted from response.metadata */
  memoryLinks: string[];
  /** Number of citations found in response */
  citationsCount: number;
  /** Whether this response was blocked by missing facts */
  isBlocked: boolean;
  /** Quality score (0-1) if computed, undefined otherwise */
  responseQualityScore?: number;
  /** Inference state derived from response signals */
  inferenceState: 'SAFE_TO_INFER' | 'INFER_WITH_DISCLOSURE' | 'BLOCKED_BY_MISSING_FACT';
  /** Whether factual claims were detected in response */
  factualClaimsDetected: boolean;
  /** Whether web search was attempted */
  webAttempted: boolean;
  /** Whether web search returned results */
  webAvailable: boolean;
  /** Requested provider (if applicable) */
  requestedProvider?: string;
  /** Provider actually used in response */
  providerUsed?: string;
}

/**
 * Convert error to UI-safe CognitiveTraceBuildError.
 * Strips raw stack, raw output, internal details, and secrets.
 */
function toSafeBuildError(error: unknown, stage: string): CognitiveTraceBuildError {
  if (error instanceof Error) {
    return {
      stage,
      name: error.name,
      // Truncate message and remove any raw output patterns
      message: error.message
        .slice(0, 256)
        .replace(/\{.*?\}/g, '[object]')
        .replace(/\[object Object\]/g, '[error]'),
    };
  }
  return {
    stage,
    name: 'UnknownError',
    message: String(error).slice(0, 256),
  };
}

/**
 * Build cognitive trace from response omega_trace_meta with safe error handling.
 *
 * This is the pure version of the hook's trace construction sequence.
 * If any step fails, error is captured and returned in discriminated result.
 * Never throws. Never exposes raw chain-of-thought.
 *
 * @param input - Normalized trace construction parameters
 * @returns Discriminated result: success with trace + diagnostics, or failure with error + diagnostics
 */
export function buildCognitiveTraceFromResponse(
  input: BuildCognitiveTraceInput
): CognitiveTraceBuildResult {
  const startTime = new Date().toISOString();
  const diagnostics: CognitiveTraceBuildDiagnostics = {
    timestamp: startTime,
    stepsCompleted: 0,
    guardEvaluated: false,
    enforcementApplied: false,
    sanitizationAttempted: false,
  };

  try {
    // Step 1: Create initial trace from response signals
    const cTrace = createInitialTrace({
      messageLength: input.assistantText.length,
      requiresFreshness: input.omegaMeta.canonical_truth_status === 'FRESH_REQUIRED',
      requiresWeb: input.webAttempted,
      requiresMemory: input.memoryLinks.some(
        l => l.includes('memory_action:USE') || l.includes('memory:present')
      ),
      taskFamily: (input.omegaMeta.canonical_mode ??
        'unknown') as CognitiveRuntimeTrace['input']['taskFamily'],
    });
    diagnostics.stepsCompleted = 1;

    // Step 2: Attach trace policy version
    try {
      attachTracePolicyVersion(cTrace, { version: 'v2' });
    } catch (e) {
      throw new Error(
        `attachTracePolicyVersion: ${e instanceof Error ? e.message : String(e)}`
      );
    }
    diagnostics.stepsCompleted = 2;

    // Step 3: Attach memory decision
    try {
      const memoryUsed = input.memoryLinks.some(
        l => l.includes('memory_action:USE') || l.includes('memory:present')
      );
      attachMemoryDecision(cTrace, {
        use: memoryUsed,
        sources: input.memoryLinks.filter(l => l.includes('memory')),
        reasonCode: memoryUsed ? 'ltm_match' : 'no_context',
        relevance: memoryUsed ? 'medium' : ('low' as const),
      });
    } catch (e) {
      throw new Error(
        `attachMemoryDecision: ${e instanceof Error ? e.message : String(e)}`
      );
    }
    diagnostics.stepsCompleted = 3;

    // Step 4: Attach generation result
    try {
      attachGenerationResult(cTrace, {
        providerRequested: String(input.requestedProvider ?? 'unknown'),
        providerUsed: input.providerUsed,
        modelRequested: undefined,
        modelUsed: undefined,
        fallbackUsed: input.omegaMeta.fallback_used ?? false,
        latencyMs: undefined,
      });
    } catch (e) {
      throw new Error(
        `attachGenerationResult: ${e instanceof Error ? e.message : String(e)}`
      );
    }
    diagnostics.stepsCompleted = 4;

    // Step 5: Evaluate and attach web truth policy
    try {
      const webPolicy = evaluateWebTruthPolicy({
        userMessage: input.userMessage,
        requiresFreshness: input.omegaMeta.canonical_truth_status === 'FRESH_REQUIRED',
        citationsCount: input.citationsCount,
        factualClaimsDetected: input.factualClaimsDetected,
        webAttempted: input.webAttempted,
        webAvailable: input.webAvailable,
        blocked: input.isBlocked,
        failureReasonCode:
          input.citationsCount > 0
            ? 'web_success'
            : input.omegaMeta.canonical_truth_status,
      });

      attachWebResearchResult(cTrace, {
        needed: webPolicy.shouldUseWeb,
        attempted: input.webAttempted,
        available: input.webAvailable,
        sourceCount: input.citationsCount,
        limitations: webPolicy.limitations,
        reasonCode:
          input.citationsCount > 0
            ? 'web_success'
            : webPolicy.shouldUseWeb
              ? 'web_failed'
              : 'not_needed',
      });

      attachWebTruthPolicy(cTrace, webPolicy);
    } catch (e) {
      throw new Error(
        `attachWebTruthPolicy: ${e instanceof Error ? e.message : String(e)}`
      );
    }
    diagnostics.stepsCompleted = 5;

    // Step 6: Attach quality critique and action policy
    try {
      if (input.responseQualityScore !== undefined) {
        attachQualityCritique(cTrace, {
          alignmentScore: input.responseQualityScore,
          completenessScore: input.responseQualityScore,
          depthMatchScore: input.responseQualityScore,
          overallScore: input.responseQualityScore,
          shouldEnhance: input.responseQualityScore < 0.65,
          enhancementHint: '',
        });
      }

      attachQualityActionPolicy(
        cTrace,
        evaluateQualityActionPolicy({
          score: input.responseQualityScore,
          evaluated: input.responseQualityScore !== undefined,
          shouldEnhance:
            input.responseQualityScore !== undefined
              ? input.responseQualityScore < QUALITY_THRESHOLD
              : false,
          inferenceState: input.inferenceState,
        })
      );
    } catch (e) {
      throw new Error(
        `attachQualityActionPolicy: ${e instanceof Error ? e.message : String(e)}`
      );
    }
    diagnostics.stepsCompleted = 6;

    // Step 7: Resolve final verdict
    try {
      resolveFinalVerdict(cTrace);
    } catch (e) {
      throw new Error(
        `resolveFinalVerdict: ${e instanceof Error ? e.message : String(e)}`
      );
    }
    diagnostics.stepsCompleted = 7;

    // Step 8: Evaluate and apply MetaCognitionGuard
    let guardDecision: any = null;
    try {
      guardDecision = evaluateMetaCognitionGuard(cTrace);
      diagnostics.guardEvaluated = true;
      applyMetaCognitionGuardToTrace(cTrace, guardDecision);
    } catch (e) {
      throw new Error(
        `evaluateMetaCognitionGuard: ${e instanceof Error ? e.message : String(e)}`
      );
    }
    diagnostics.stepsCompleted = 8;

    // Step 9: Enforce MetaCognitionAction
    try {
      if (!guardDecision) {
        throw new Error('Guard decision not available for enforcement');
      }

      const enforcement = enforceMetaCognitionAction({
        trace: cTrace,
        guard: guardDecision,
        assistantText: input.assistantText,
      });
      diagnostics.enforcementApplied = true;

      applyMetaCognitionEnforcementToResponse({
        response: input.assistantText,
        enforcement,
      });

      applyMetaCognitionEnforcementToTrace(cTrace, enforcement);
    } catch (e) {
      throw new Error(
        `enforceMetaCognitionAction: ${e instanceof Error ? e.message : String(e)}`
      );
    }
    diagnostics.stepsCompleted = 9;

    // Step 10: Sanitize for UI
    try {
      diagnostics.sanitizationAttempted = true;
      const sanitized = sanitizeTraceForUi(cTrace);

      return {
        ok: true,
        trace: sanitized,
        diagnostics,
      };
    } catch (e) {
      throw new Error(
        `sanitizeTraceForUi: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  } catch (error) {
    // Extract stage and message from error for diagnostics
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stageMatch = errorMessage.match(/^([^:]+):/);
    const stage = stageMatch?.[1] ?? 'unknown';
    const message = errorMessage.replace(/^[^:]+:\s*/, '');

    return {
      ok: false,
      trace: null,
      diagnostics,
      error: {
        stage,
        message: message.slice(0, 256),
        name: error instanceof Error ? error.constructor.name : 'Error',
      },
    };
  }
}
