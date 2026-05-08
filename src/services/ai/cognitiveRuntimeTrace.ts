import type {
  QualityAction,
  QualityActionPolicyDecision,
} from '@/services/ai/qualityActionPolicy';
import type {
  WebTruthNeed,
  WebTruthPolicyDecision,
  WebTruthStatus,
} from '@/services/ai/webTruthPolicy';

/**
 * TITANE∞ v33.1.0 — CognitiveRuntimeTrace v1
 *
 * Pure, additive, serializable observable truth object for each chat turn.
 * Collects signals from the pipeline (canonical decision, memory, generation,
 * web research, reflection, quality) and resolves a final verdict.
 *
 * Design rules:
 * - Pure module: no side effects, no I/O, no LLM calls, no async.
 * - Mutating helpers: each attach* function mutates the trace in-place (no copies).
 * - UI-safe: sanitizeTraceForUi() strips any internal fields before display.
 * - No forbidden fields: hiddenThoughts, chainOfThought, etc. are never stored.
 * - Rollback: delete this file + remove import/usage in chatEngine.ts.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Mirrors qualityVerifier.ts QUALITY_THRESHOLD. */
const QUALITY_THRESHOLD = 0.65;
const CONFIDENCE_UNCERTAIN_THRESHOLD = 0.55;
const QUALITY_FAIL_THRESHOLD = 0.45;

/** Fields that must never appear in the trace (COT exposure guard). */
const FORBIDDEN_FIELDS = new Set([
  'hiddenThoughts',
  'chainOfThought',
  'internalReasoningSteps',
  'rawReasoning',
  'privateReasoning',
]);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CognitiveRuntimeVerdict =
  | 'PASS'
  | 'QUALIFIED'
  | 'UNCERTAIN'
  | 'BLOCKED'
  | 'FAIL';

export type WebReasonCode =
  | 'not_needed'
  | 'freshness_required'
  | 'factual_claims_detected'
  | 'web_unavailable'
  | 'web_success'
  | 'web_failed'
  | 'blocked';

export type MemoryRisk =
  | 'none'
  | 'stale'
  | 'irrelevant'
  | 'overfitting'
  | 'conflict_with_current_message'
  | 'unknown';

export interface CognitiveRuntimeTrace {
  traceId: string;
  conversationId?: string;
  turnId?: string;
  timestamp: number;

  input: {
    messageLength: number;
    requiresFreshness: boolean;
    requiresWeb: boolean;
    requiresMemory: boolean;
    taskFamily:
      | 'conversation'
      | 'reflection'
      | 'strategy'
      | 'research'
      | 'coding'
      | 'debug'
      | 'creative'
      | 'decision'
      | 'unknown';
  };

  canonical: {
    attached: boolean;
    mode?: string;
    canonicalMode?: string;
    profileId?: string;
    inferenceState?: string;
    truthStatus?: string;
    confidence?: number;
    messageComplexity?: number;
    reasoningSummary?: string;
    signalCount?: number;
  };

  memory: {
    injected: boolean;
    reasonCode: string;
    sources: string[];
    sourceCount: number;
    relevance: 'low' | 'medium' | 'high';
    risk: MemoryRisk;
  };

  web: {
    needed: boolean;
    attempted: boolean;
    available: boolean;
    sourceCount: number;
    confidence?: number;
    limitations: string[];
    reasonCode: WebReasonCode;
  };

  generation: {
    providerRequested?: string;
    providerUsed?: string;
    modelRequested?: string;
    modelUsed?: string;
    fallbackUsed: boolean;
    latencyMs?: number;
  };

  reflection: {
    verifierEnabled: boolean;
    factualClaimsDetected: boolean;
    verified: boolean;
    confidence?: number;
    shouldRevise: boolean;
    correctionsApplied: boolean;
  };

  quality: {
    evaluated: boolean;
    alignmentScore?: number;
    completenessScore?: number;
    depthMatchScore?: number;
    overallScore?: number;
    shouldEnhance?: boolean;
    enhancementHint?: string;
  };

  metaCognition: {
    evaluated: boolean;
    coherenceScore?: number;
    anomalyDetected?: boolean;
    requiredAdjustment?: string;
    recommendedNextState?: string;
    /** v1 MetaCognitionGuard fields — set by applyMetaCognitionGuardToTrace() */
    guardAction?: import('./metaCognitionGuard').MetaCognitionGuardAction;
    freezeMemorySave?: boolean;
    issues?: import('./metaCognitionGuard').MetaCognitionIssue[];
  };

  policy: {
    version: 'v1' | 'v2';
    webTruth: {
      evaluated: boolean;
      need?: WebTruthNeed;
      status?: WebTruthStatus;
      shouldUseWeb?: boolean;
      shouldWarnUser?: boolean;
    };
    qualityAction: {
      evaluated: boolean;
      action?: QualityAction;
      minimumVerdict?: 'PASS' | 'QUALIFIED' | 'UNCERTAIN' | 'BLOCKED';
      reasonCode?: string;
      warnUser?: boolean;
    };
  };

  final: {
    verdict: CognitiveRuntimeVerdict;
    limitations: string[];
    safeToRemember: boolean;
    shouldAskClarification: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LOOSE INPUT TYPES — decouple from other service types
// ─────────────────────────────────────────────────────────────────────────────

export interface TraceInputInit {
  messageLength: number;
  requiresFreshness: boolean;
  requiresWeb: boolean;
  requiresMemory: boolean;
  taskFamily: CognitiveRuntimeTrace['input']['taskFamily'];
  conversationId?: string;
  turnId?: string;
}

export interface CanonicalDecisionInput {
  mode: string;
  modeClassification?: { canonicalMode: string; confidence: number };
  profileId: string;
  inferenceState: string;
  truthStatus: string;
  confidence: number;
  messageComplexity: number;
  signals?: Array<{ source: string; type: string; value: unknown }>;
}

export interface MemoryDecisionInput {
  use: boolean;
  sources: string[];
  reasonCode: string;
  relevance: 'low' | 'medium' | 'high';
}

export interface GenerationMetaInput {
  providerRequested?: string;
  providerUsed?: string;
  modelRequested?: string;
  modelUsed?: string;
  fallbackUsed: boolean;
  latencyMs?: number;
}

export interface WebResearchInput {
  needed: boolean;
  attempted: boolean;
  available: boolean;
  sourceCount: number;
  confidence?: number;
  limitations: string[];
  reasonCode: WebReasonCode;
}

export interface ReflectiveCritiqueInput {
  confidence: number;
  verified: boolean;
  hasFactualClaims: boolean;
  shouldRevise: boolean;
  webSources: Array<unknown>;
  corrections?: Array<unknown>;
  processingMs?: number;
}

export interface QualityCritiqueInput {
  alignmentScore: number;
  completenessScore: number;
  depthMatchScore: number;
  overallScore: number;
  shouldEnhance: boolean;
  enhancementHint: string;
}

export interface MetaCognitiveReportInput {
  coherence_score: number;
  anomaly_detected: boolean;
  required_adjustment?: string;
  recommended_next_state?: { action?: string } | null;
}

export interface TracePolicyVersionInput {
  version?: 'v1' | 'v2';
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function generateTraceId(): string {
  if (
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as Record<string, unknown>).crypto === 'object' &&
    typeof (
      (globalThis as Record<string, unknown>).crypto as Record<string, unknown>
    ).randomUUID === 'function'
  ) {
    return (
      globalThis.crypto as unknown as { randomUUID: () => string }
    ).randomUUID();
  }
  // Fallback: no crypto.randomUUID (test environments)
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function inferTaskFamily(
  decision: CanonicalDecisionInput,
): CognitiveRuntimeTrace['input']['taskFamily'] {
  const mode = decision.mode?.toLowerCase() ?? '';
  const profile = decision.profileId?.toLowerCase() ?? '';
  const canonicalMode = decision.modeClassification?.canonicalMode?.toLowerCase() ?? '';

  if (canonicalMode === 'deep_reasoning' || canonicalMode === 'architect')
    return 'strategy';
  if (canonicalMode === 'repair') return 'debug';
  if (canonicalMode === 'certify') return 'reflection';
  if (canonicalMode === 'exploration') return 'creative';
  if (mode === 'brainstorming') return 'creative';
  if (mode === 'journal' || mode === 'reflection') return 'reflection';
  if (mode === 'debug_cognitive') return 'debug';
  if (mode === 'strategy' || mode === 'planning') return 'strategy';
  if (mode === 'dev') return 'coding';
  if (mode === 'veille_recherche') return 'research';
  if (mode === 'decision') return 'decision';
  if (profile === 'omega' || profile === 'architect') return 'strategy';
  return 'conversation';
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a fresh CognitiveRuntimeTrace for a new chat turn.
 * Call immediately after input validation.
 */
export function createInitialTrace(input: TraceInputInit): CognitiveRuntimeTrace {
  return {
    traceId: generateTraceId(),
    conversationId: input.conversationId,
    turnId: input.turnId,
    timestamp: Date.now(),
    input: {
      messageLength: input.messageLength,
      requiresFreshness: input.requiresFreshness,
      requiresWeb: input.requiresWeb,
      requiresMemory: input.requiresMemory,
      taskFamily: input.taskFamily,
    },
    canonical: {
      attached: false,
    },
    memory: {
      injected: false,
      reasonCode: 'not_evaluated',
      sources: [],
      sourceCount: 0,
      relevance: 'low',
      risk: 'unknown',
    },
    web: {
      needed: false,
      attempted: false,
      available: false,
      sourceCount: 0,
      limitations: [],
      reasonCode: 'not_needed',
    },
    generation: {
      fallbackUsed: false,
    },
    reflection: {
      verifierEnabled: false,
      factualClaimsDetected: false,
      verified: false,
      shouldRevise: false,
      correctionsApplied: false,
    },
    quality: {
      evaluated: false,
    },
    metaCognition: {
      evaluated: false,
    },
    policy: {
      version: 'v1',
      webTruth: {
        evaluated: false,
      },
      qualityAction: {
        evaluated: false,
      },
    },
    final: {
      verdict: 'QUALIFIED',
      limitations: [],
      safeToRemember: false,
      shouldAskClarification: false,
    },
  };
}

/**
 * Attaches canonical discernment kernel decision to the trace.
 * Updates input.taskFamily from kernel signals.
 * Call immediately after canonicalDiscernmentKernel.discern().
 */
export function attachCanonicalDecision(
  trace: CognitiveRuntimeTrace,
  decision: CanonicalDecisionInput,
): void {
  trace.canonical = {
    attached: true,
    mode: decision.mode,
    canonicalMode: decision.modeClassification?.canonicalMode,
    profileId: decision.profileId,
    inferenceState: decision.inferenceState,
    truthStatus: decision.truthStatus,
    confidence: decision.confidence,
    messageComplexity: decision.messageComplexity,
    signalCount: decision.signals?.length ?? 0,
  };
  trace.input.taskFamily = inferTaskFamily(decision);
}

/**
 * Attaches memory gate decision to the trace.
 * Call after canonical discernment, once context.sources.length is known.
 * @param contextSourceCount - actual number of loaded context sources.
 */
export function attachMemoryDecision(
  trace: CognitiveRuntimeTrace,
  memoryDecision: MemoryDecisionInput,
  contextSourceCount = 0,
): void {
  trace.input.requiresMemory = memoryDecision.use;
  trace.memory = {
    injected: memoryDecision.use && contextSourceCount > 0,
    reasonCode: memoryDecision.reasonCode,
    sources: memoryDecision.sources ?? [],
    sourceCount: contextSourceCount,
    relevance: memoryDecision.relevance,
    risk: 'unknown',
  };
}

/**
 * Attaches generation result (provider, model, latency, fallback).
 * Call after orchestrator response is received and validated.
 */
export function attachGenerationResult(
  trace: CognitiveRuntimeTrace,
  meta: GenerationMetaInput,
): void {
  trace.generation = {
    providerRequested: meta.providerRequested,
    providerUsed: meta.providerUsed,
    modelRequested: meta.modelRequested,
    modelUsed: meta.modelUsed,
    fallbackUsed: meta.fallbackUsed,
    latencyMs: meta.latencyMs,
  };
}

/**
 * Attaches web research result (derived from reflective verifier or webResearchService).
 * Call after web research is determined to have been needed/attempted.
 * Also updates input.requiresFreshness and input.requiresWeb.
 */
export function attachWebResearchResult(
  trace: CognitiveRuntimeTrace,
  web: WebResearchInput,
): void {
  trace.web = {
    needed: web.needed,
    attempted: web.attempted,
    available: web.available,
    sourceCount: web.sourceCount,
    confidence: web.confidence,
    limitations: web.limitations,
    reasonCode: web.reasonCode,
  };
  trace.input.requiresFreshness = web.needed;
  trace.input.requiresWeb = web.needed;
}

/**
 * Attaches reflective verifier (Self-RAG) critique to the trace.
 * Call after verifyCritique() returns inside reflective verification phase.
 */
export function attachReflectiveCritique(
  trace: CognitiveRuntimeTrace,
  critique: ReflectiveCritiqueInput,
): void {
  trace.reflection = {
    verifierEnabled: true,
    factualClaimsDetected: critique.hasFactualClaims,
    verified: critique.verified,
    confidence: critique.confidence,
    shouldRevise: critique.shouldRevise,
    correctionsApplied: critique.shouldRevise && critique.webSources.length > 0,
  };
}

/**
 * Attaches quality verifier heuristic critique to the trace.
 * Call after evaluateResponseQuality() returns.
 */
export function attachQualityCritique(
  trace: CognitiveRuntimeTrace,
  critique: QualityCritiqueInput,
): void {
  trace.quality = {
    evaluated: true,
    alignmentScore: critique.alignmentScore,
    completenessScore: critique.completenessScore,
    depthMatchScore: critique.depthMatchScore,
    overallScore: critique.overallScore,
    shouldEnhance: critique.shouldEnhance,
    enhancementHint: critique.enhancementHint,
  };
}

/**
 * Attaches Rust meta-cognitive report to the trace.
 * Currently discovery-only: meta_cognition.rs is not wired to the TS pipeline.
 * Call this when/if a MetaCognitiveReport is deserialized from a future IPC path.
 */
export function attachMetaCognitiveReport(
  trace: CognitiveRuntimeTrace,
  report: MetaCognitiveReportInput,
): void {
  trace.metaCognition = {
    evaluated: true,
    coherenceScore: report.coherence_score,
    anomalyDetected: report.anomaly_detected,
    requiredAdjustment: report.required_adjustment,
    recommendedNextState: report.recommended_next_state?.action,
  };
}

export function attachTracePolicyVersion(
  trace: CognitiveRuntimeTrace,
  policy: TracePolicyVersionInput,
): void {
  trace.policy.version = policy.version ?? 'v2';
}

export function attachWebTruthPolicy(
  trace: CognitiveRuntimeTrace,
  decision: WebTruthPolicyDecision,
): void {
  trace.policy.webTruth = {
    evaluated: true,
    need: decision.need,
    status: decision.status,
    shouldUseWeb: decision.shouldUseWeb,
    shouldWarnUser: decision.shouldWarnUser,
  };
  if (decision.limitations.length > 0) {
    trace.web.limitations = Array.from(
      new Set([...trace.web.limitations, ...decision.limitations]),
    );
  }
}

export function attachQualityActionPolicy(
  trace: CognitiveRuntimeTrace,
  decision: QualityActionPolicyDecision,
): void {
  trace.policy.qualityAction = {
    evaluated: true,
    action: decision.action,
    minimumVerdict: decision.minimumVerdict,
    reasonCode: decision.reasonCode,
    warnUser: decision.warnUser,
  };
}

/**
 * Resolves the final verdict and populates trace.final.
 * Call at the end of the pipeline, after all attach* calls, before returning the response.
 *
 * Verdict rules:
 * - BLOCKED  : inference is blocking or canonical not attached.
 * - FAIL     : forbidden field detected (COT leak guard).
 * - UNCERTAIN: confidence low, or web needed but unavailable without limitation recorded,
 *              or quality critically below threshold.
 * - PASS     : canonical attached, not blocking, quality acceptable (or not evaluated),
 *              web OK or limitation explicit, no critical anomaly.
 * - QUALIFIED: coherent but proof is partial (verifier not run, quality not evaluated, etc.).
 */
export function resolveFinalVerdict(trace: CognitiveRuntimeTrace): void {
  const limitations: string[] = [];

  // --- FAIL guard: forbidden field leak (defensive check) ---
  // The trace object itself never stores forbidden fields, but if somehow one is present:
  const traceAsRecord = trace as unknown as Record<string, unknown>;
  for (const field of FORBIDDEN_FIELDS) {
    if (field in traceAsRecord && traceAsRecord[field] !== undefined) {
      trace.final = {
        verdict: 'FAIL',
        limitations: [`forbidden-field-leaked:${field}`],
        safeToRemember: false,
        shouldAskClarification: false,
      };
      return;
    }
  }

  // --- BLOCKED: inference state is blocking ---
  const inferenceState = trace.canonical.inferenceState;
  if (
    !trace.canonical.attached ||
    inferenceState === 'BLOCKED_BY_MISSING_FACT' ||
    inferenceState === 'CLARIFY_REQUIRED'
  ) {
    limitations.push(
      trace.canonical.attached
        ? `inference-blocked:${inferenceState ?? 'unknown'}`
        : 'canonical-not-attached',
    );
    trace.final = {
      verdict: 'BLOCKED',
      limitations,
      safeToRemember: false,
      shouldAskClarification:
        inferenceState === 'CLARIFY_REQUIRED' || !trace.canonical.attached,
    };
    return;
  }

  // --- Collect limitations ---
  const qualityOk =
    !trace.quality.evaluated ||
    (trace.quality.overallScore !== undefined &&
      trace.quality.overallScore >= QUALITY_THRESHOLD);

  const qualityCritical =
    trace.quality.evaluated &&
    trace.quality.overallScore !== undefined &&
    trace.quality.overallScore < QUALITY_FAIL_THRESHOLD;

  const webPolicyStatus = trace.policy.webTruth.status;
  const webPolicyNeed = trace.policy.webTruth.need;
  const strictWebFailure =
    trace.policy.webTruth.evaluated &&
    webPolicyNeed !== 'not_needed' &&
    webPolicyStatus !== 'attempted_success';

  if (trace.quality.evaluated && !qualityOk) {
    limitations.push(
      `quality-below-threshold:${trace.quality.overallScore?.toFixed(2) ?? 'unknown'}`,
    );
  }

  const webOk =
    !trace.web.needed || trace.web.available || trace.web.limitations.length > 0;

  if (!webOk) {
    limitations.push('web-needed-but-unavailable');
    trace.web.limitations.push('web-unavailable-no-fallback');
  }

  if (trace.policy.webTruth.evaluated && webPolicyStatus) {
    if (strictWebFailure) {
      limitations.push(`web-policy:${webPolicyStatus}`);
    }
  }

  const confidenceLow =
    trace.canonical.confidence !== undefined &&
    trace.canonical.confidence < CONFIDENCE_UNCERTAIN_THRESHOLD;

  if (confidenceLow) {
    limitations.push(
      `confidence-low:${trace.canonical.confidence?.toFixed(2) ?? 'unknown'}`,
    );
  }

  if (
    trace.reflection.verifierEnabled &&
    trace.reflection.factualClaimsDetected &&
    !trace.reflection.verified
  ) {
    limitations.push('factual-claims-unverified');
  }

  if (
    trace.policy.qualityAction.evaluated &&
    trace.policy.qualityAction.reasonCode &&
    trace.policy.qualityAction.reasonCode !== 'quality_pass'
  ) {
    limitations.push(`quality-action:${trace.policy.qualityAction.reasonCode}`);
  }

  const minimumVerdict = trace.policy.qualityAction.minimumVerdict;
  const wantsClarification =
    inferenceState === 'INFER_WITH_DISCLOSURE' ||
    inferenceState === 'CLARIFY_REQUIRED' ||
    (trace.canonical.confidence !== undefined && trace.canonical.confidence < 0.4) ||
    trace.policy.qualityAction.action === 'clarify' ||
    trace.policy.qualityAction.action === 'ask_followup';

  if (minimumVerdict === 'BLOCKED') {
    trace.final = {
      verdict: 'BLOCKED',
      limitations,
      safeToRemember: false,
      shouldAskClarification: true,
    };
    return;
  }

  // --- UNCERTAIN ---
  if (
    confidenceLow ||
    (!webOk && trace.web.needed) ||
    qualityCritical ||
    strictWebFailure ||
    minimumVerdict === 'UNCERTAIN'
  ) {
    trace.final = {
      verdict: 'UNCERTAIN',
      limitations,
      safeToRemember: false,
      shouldAskClarification: wantsClarification,
    };
    return;
  }

  // --- PASS ---
  // Requires quality evaluation to have run (otherwise only QUALIFIED)
  if (
    trace.canonical.attached &&
    trace.quality.evaluated &&
    qualityOk &&
    minimumVerdict !== 'QUALIFIED' &&
    webOk &&
    !confidenceLow &&
    !trace.metaCognition.anomalyDetected
  ) {
    trace.final = {
      verdict: 'PASS',
      limitations,
      safeToRemember: true,
      shouldAskClarification: wantsClarification,
    };
    return;
  }

  // --- QUALIFIED (default): coherent but partial proof ---
  trace.final = {
    verdict: 'QUALIFIED',
    limitations,
    safeToRemember: limitations.length === 0,
    shouldAskClarification: wantsClarification,
  };
}

/**
 * Returns a UI-safe deep copy of the trace with forbidden fields stripped
 * and overly long strings truncated (max 512 chars).
 *
 * Defensive: TITANE trace never stores forbidden fields, but this ensures
 * they cannot appear in UI output even if upstream code changes.
 */
export function sanitizeTraceForUi(trace: CognitiveRuntimeTrace): CognitiveRuntimeTrace {
  function truncateStrings(obj: unknown, depth = 0): unknown {
    if (depth > 8) return obj;
    if (typeof obj === 'string') {
      return obj.length > 512 ? `${obj.slice(0, 512)}…[truncated]` : obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => truncateStrings(item, depth + 1));
    }
    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (!FORBIDDEN_FIELDS.has(k)) {
          result[k] = truncateStrings(v, depth + 1);
        }
      }
      return result;
    }
    return obj;
  }

  const raw = JSON.parse(JSON.stringify(trace)) as Record<string, unknown>;
  return truncateStrings(raw, 0) as CognitiveRuntimeTrace;
}
