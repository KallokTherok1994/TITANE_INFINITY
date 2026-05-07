/**
 * TITANE∞ — Research Truth Engine Contract
 * Lock C3 — T2/T3 (scaffold + flag-gated activation)
 *
 * Governs multi-source research truth validation for TITANE∞.
 * Integrates with Knowledge Governance (C2) for source attribution.
 *
 * Three sub-systems:
 * 1. ResearchQueryClassification — detect if a query requires research validation
 * 2. MultiSourceTruthAggregation — merge evidence from ≥2 sources with conflict detection
 * 3. ResearchTruthVerdict — final verdict with confidence + provenance trail
 *
 * References:
 * - S003 ReAct: reasoning + acting research trace
 * - S012 Red Teaming: adversarial claim validation
 * - S006 ToolLLM: tool-augmented evidence retrieval
 * - Knowledge Governance (C2): confidence + staleness from KnowledgeGovernanceContract
 *
 * Feature Flag: TITANE_C3_RESEARCH_TRUTH_ENABLED (default=false)
 * T3 activation: reading and writing of truth verdicts guarded by flag
 */

import { z } from 'zod';

// ── Feature Flag ────────────────────────────────────────────────────────────────
export const RESEARCH_TRUTH_FLAG =
  import.meta.env?.['VITE_TITANE_C3_RESEARCH_TRUTH'] === 'true';

// ── Query Classification ────────────────────────────────────────────────────────
export const ResearchQueryClassSchema = z.enum([
  'factual_static', // Stable facts unlikely to change (e.g. capital cities)
  'factual_temporal', // Facts that change over time (e.g. current leaders)
  'claims_disputed', // Contested claims requiring multi-source validation
  'technical_precise', // Technical precision matters (code, specs, math)
  'subjective', // Opinion or preference — no objective truth
  'conversational', // Small-talk, no truth validation needed
]);
export type ResearchQueryClass = z.infer<typeof ResearchQueryClassSchema>;

export const ResearchQueryClassificationSchema = z.object({
  query_id: z.string(),
  query_text: z.string().min(1),
  classification: ResearchQueryClassSchema,
  requires_research_validation: z.boolean(),
  reasoning: z
    .string()
    .nullable()
    .describe('One-sentence justification for the classification'),
});
export type ResearchQueryClassification = z.infer<
  typeof ResearchQueryClassificationSchema
>;

// ── Source Evidence ─────────────────────────────────────────────────────────────
export const EvidenceStatusSchema = z.enum([
  'confirmed', // Multiple sources agree
  'disputed', // Sources disagree
  'unverified', // Single source only
  'insufficient', // Not enough evidence to classify
]);
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;

export const ResearchSourceEvidenceSchema = z.object({
  evidence_id: z.string(),
  source_type: z.enum([
    'web_retrieval',
    'rag_document',
    'ltm_memory',
    'ollama_inference',
    'gemini_inference',
    'tool_call_result',
  ]),
  content_snippet: z.string().min(1),
  confidence: z.number().min(0).max(1),
  retrieved_at: z.string().datetime(),
  supports_claim: z.boolean().nullable().describe('null if not directly evaluable'),
});
export type ResearchSourceEvidence = z.infer<typeof ResearchSourceEvidenceSchema>;

// ── Multi-source Aggregation ────────────────────────────────────────────────────
export const TruthAggregationSchema = z.object({
  claim: z.string().min(1),
  evidence_items: z.array(ResearchSourceEvidenceSchema).min(1),
  supporting_count: z.number().min(0),
  opposing_count: z.number().min(0),
  neutral_count: z.number().min(0),
  evidence_status: EvidenceStatusSchema,
  conflict_detected: z.boolean(),
  conflict_detail: z.string().nullable(),
  aggregate_confidence: z.number().min(0).max(1),
});
export type TruthAggregation = z.infer<typeof TruthAggregationSchema>;

// ── Truth Verdict ───────────────────────────────────────────────────────────────
export const ResearchTruthVerdictSchema = z.object({
  verdict_id: z.string().uuid(),
  query_id: z.string(),
  claim: z.string(),
  verdict: z.enum([
    'verified',
    'partially_verified',
    'disputed',
    'unverifiable',
    'false_claim',
  ]),
  confidence: z.number().min(0).max(1),
  evidence_summary: z.string(),
  provenance_ids: z.array(z.string()),
  generated_at: z.string().datetime(),
  flag_active: z.boolean(),
});
export type ResearchTruthVerdict = z.infer<typeof ResearchTruthVerdictSchema>;

// ── C3 Contract ─────────────────────────────────────────────────────────────────
export const C3ResearchTruthContractSchema = z.object({
  lock: z.literal('C3'),
  tier: z.literal('T3'),
  flag_name: z.literal('TITANE_C3_RESEARCH_TRUTH_ENABLED'),
  flag_active: z.boolean(),
  min_sources_for_confirmation: z.number().min(2),
  conflict_threshold: z.number().min(0).max(1),
  sources_referenced: z.array(z.string()),
});
export type C3ResearchTruthContract = z.infer<typeof C3ResearchTruthContractSchema>;

// ── Query Classifier ────────────────────────────────────────────────────────────
const TEMPORAL_KEYWORDS = ['current', 'now', 'today', 'latest', 'recent', 'this year'];
const DISPUTED_KEYWORDS = [
  'controversial',
  'debated',
  'some say',
  'disputed',
  'conflicting',
];
const TECHNICAL_KEYWORDS = [
  'code',
  'algorithm',
  'specification',
  'implementation',
  'syntax',
];
const CONVERSATIONAL_KEYWORDS = ['hello', 'hi there', 'thanks', 'bye', 'how are you'];

/**
 * Classify a query to determine whether research truth validation is needed.
 * Lightweight heuristic classifier — T2/T3 bounded (no LLM call).
 */
export function classifyResearchQuery(
  queryId: string,
  queryText: string
): ResearchQueryClassification {
  const lower = queryText.toLowerCase();

  if (CONVERSATIONAL_KEYWORDS.some(k => lower.includes(k))) {
    return {
      query_id: queryId,
      query_text: queryText,
      classification: 'conversational',
      requires_research_validation: false,
      reasoning: 'Conversational query — no truth validation needed',
    };
  }
  if (TEMPORAL_KEYWORDS.some(k => lower.includes(k))) {
    return {
      query_id: queryId,
      query_text: queryText,
      classification: 'factual_temporal',
      requires_research_validation: true,
      reasoning: 'Query references current/temporal information — validation recommended',
    };
  }
  if (DISPUTED_KEYWORDS.some(k => lower.includes(k))) {
    return {
      query_id: queryId,
      query_text: queryText,
      classification: 'claims_disputed',
      requires_research_validation: true,
      reasoning:
        'Query contains disputed claim markers — multi-source validation required',
    };
  }
  if (TECHNICAL_KEYWORDS.some(k => lower.includes(k))) {
    return {
      query_id: queryId,
      query_text: queryText,
      classification: 'technical_precise',
      requires_research_validation: true,
      reasoning: 'Technical precision query — source-backed validation recommended',
    };
  }
  return {
    query_id: queryId,
    query_text: queryText,
    classification: 'factual_static',
    requires_research_validation: false,
    reasoning: null,
  };
}

// ── Multi-source Aggregation ────────────────────────────────────────────────────
const MIN_SOURCES_FOR_CONFIRMATION = 2;
const CONFLICT_THRESHOLD = 0.3;

/**
 * Aggregate multiple evidence items for a claim.
 * At least MIN_SOURCES_FOR_CONFIRMATION required for 'confirmed' status.
 * Conflict is detected when supporting ratio is neither dominant (< 1-THRESHOLD) nor absent (> THRESHOLD).
 */
export function aggregateTruthEvidence(
  claim: string,
  evidence: ResearchSourceEvidence[]
): TruthAggregation {
  const evaluable = evidence.filter(e => e.supports_claim !== null);
  const supporting = evaluable.filter(e => e.supports_claim === true).length;
  const opposing = evaluable.filter(e => e.supports_claim === false).length;
  const neutral = evidence.length - evaluable.length;

  const total = evaluable.length || 1;
  const supportRatio = supporting / total;

  let status: EvidenceStatus;
  let conflictDetected = false;
  let conflictDetail: string | null = null;

  if (evaluable.length === 0) {
    status = 'insufficient';
  } else if (evaluable.length < MIN_SOURCES_FOR_CONFIRMATION) {
    status = 'unverified';
  } else if (supportRatio >= 1 - CONFLICT_THRESHOLD) {
    status = 'confirmed';
  } else if (supportRatio <= CONFLICT_THRESHOLD) {
    status = 'confirmed'; // confirmed as false / all oppose
  } else {
    status = 'disputed';
    conflictDetected = true;
    conflictDetail = `${supporting} supporting vs ${opposing} opposing out of ${evaluable.length} evaluable sources`;
  }

  const aggregateConfidence =
    evaluable.length === 0
      ? 0
      : evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length;

  return {
    claim,
    evidence_items: evidence,
    supporting_count: supporting,
    opposing_count: opposing,
    neutral_count: neutral,
    evidence_status: status,
    conflict_detected: conflictDetected,
    conflict_detail: conflictDetail,
    aggregate_confidence: Math.round(aggregateConfidence * 1000) / 1000,
  };
}

// ── Truth Verdict Builder (T3 flag-gated) ──────────────────────────────────────
/**
 * Build a ResearchTruthVerdict from an aggregation.
 * Only runs fully when RESEARCH_TRUTH_FLAG is active.
 * When flag=false, returns 'unverifiable' with low confidence (safe default).
 */
export function buildResearchTruthVerdict(
  verdictId: string,
  queryId: string,
  aggregation: TruthAggregation,
  flagActive = RESEARCH_TRUTH_FLAG
): ResearchTruthVerdict {
  const now = new Date().toISOString();

  if (!flagActive) {
    return {
      verdict_id: verdictId,
      query_id: queryId,
      claim: aggregation.claim,
      verdict: 'unverifiable',
      confidence: 0,
      evidence_summary: 'Research Truth Engine flag inactive — verdict deferred',
      provenance_ids: [],
      generated_at: now,
      flag_active: false,
    };
  }

  const { evidence_status, conflict_detected, aggregate_confidence, evidence_items } =
    aggregation;

  let verdict: ResearchTruthVerdict['verdict'];
  if (evidence_status === 'insufficient') {
    verdict = 'unverifiable';
  } else if (conflict_detected) {
    verdict = 'disputed';
  } else if (
    evidence_status === 'confirmed' &&
    aggregation.supporting_count >= MIN_SOURCES_FOR_CONFIRMATION
  ) {
    verdict = 'verified';
  } else if (
    evidence_status === 'confirmed' &&
    aggregation.opposing_count >= MIN_SOURCES_FOR_CONFIRMATION
  ) {
    verdict = 'false_claim';
  } else {
    verdict = 'partially_verified';
  }

  return {
    verdict_id: verdictId,
    query_id: queryId,
    claim: aggregation.claim,
    verdict,
    confidence: aggregate_confidence,
    evidence_summary: `${evidence_items.length} sources evaluated. Status: ${evidence_status}. Conflict: ${conflict_detected}.`,
    provenance_ids: evidence_items.map(e => e.evidence_id),
    generated_at: now,
    flag_active: true,
  };
}

// ── Contract Instance ───────────────────────────────────────────────────────────
export function getC3ResearchTruthContract(): C3ResearchTruthContract {
  return {
    lock: 'C3',
    tier: 'T3',
    flag_name: 'TITANE_C3_RESEARCH_TRUTH_ENABLED',
    flag_active: RESEARCH_TRUTH_FLAG,
    min_sources_for_confirmation: MIN_SOURCES_FOR_CONFIRMATION,
    conflict_threshold: CONFLICT_THRESHOLD,
    sources_referenced: ['S003', 'S006', 'S012'],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// C3 v11 SIDECAR — Research Truth Engine Policy Layer
// Additive extension — original 303 lines untouched
// ══════════════════════════════════════════════════════════════════════════════

// ── Research Availability State Machine ────────────────────────────────────────
export const ResearchAvailabilityStateSchema = z.enum([
  'RESEARCH_NOT_REQUESTED',
  'RESEARCH_REQUIRED',
  'RESEARCH_AVAILABLE',
  'RESEARCH_UNAVAILABLE',
  'RESEARCH_PARTIAL',
  'RESEARCH_FAILED',
  'RESEARCH_BLOCKED',
]);
export type ResearchAvailabilityState = z.infer<typeof ResearchAvailabilityStateSchema>;

// ── Freshness Classes ───────────────────────────────────────────────────────────
export const ResearchFreshnessClassSchema = z.enum([
  'stable',
  'time_sensitive',
  'current',
  'unknown',
  'expired',
]);
export type ResearchFreshnessClass = z.infer<typeof ResearchFreshnessClassSchema>;

// ── Source Status ───────────────────────────────────────────────────────────────
export const ResearchSourceStatusSchema = z.enum([
  'VERIFIED',
  'TO_VERIFY',
  'OUTDATED',
  'REJECTED',
  'UNAVAILABLE',
  'UNKNOWN',
]);
export type ResearchSourceStatus = z.infer<typeof ResearchSourceStatusSchema>;

// ── Claim Status ────────────────────────────────────────────────────────────────
export const ResearchClaimStatusSchema = z.enum([
  'SUPPORTED',
  'UNSUPPORTED',
  'CONTRADICTED',
  'STALE',
  'HYPOTHESIS',
  'INSUFFICIENT_EVIDENCE',
]);
export type ResearchClaimStatus = z.infer<typeof ResearchClaimStatusSchema>;

// ── Source Types ────────────────────────────────────────────────────────────────
export const ResearchSourceTypeSchema = z.enum([
  'official',
  'vendor',
  'standard',
  'paper',
  'article',
  'internal',
  'generated',
  'unknown',
]);
export type ResearchSourceType = z.infer<typeof ResearchSourceTypeSchema>;

// ── Research Source (full provenance) ──────────────────────────────────────────
export const ResearchSourceSchema = z.object({
  source_id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().nullable().describe('Required for VERIFIED non-internal sources'),
  source_type: ResearchSourceTypeSchema,
  date_accessed: z
    .string()
    .datetime()
    .nullable()
    .describe('Required for VERIFIED sources'),
  published_at: z.string().datetime().nullable(),
  last_updated: z.string().datetime().nullable(),
  status: ResearchSourceStatusSchema,
  relevance: z.number().min(0).max(1).describe('0..1 relevance to the claim'),
  confidence: z.number().min(0).max(1),
  notes: z.string().nullable(),
});
export type ResearchSource = z.infer<typeof ResearchSourceSchema>;

// ── Research Claim ──────────────────────────────────────────────────────────────
export const ResearchClaimSchema = z.object({
  claim_id: z.string().min(1),
  text: z.string().min(1),
  claim_type: z.enum(['fact', 'hypothesis', 'opinion', 'contested', 'internal']),
  freshness: ResearchFreshnessClassSchema,
  status: ResearchClaimStatusSchema,
  source_ids: z.array(z.string()),
  requires_source: z.boolean(),
  risk_level: z.enum(['low', 'medium', 'high', 'restricted']),
  contradicts: z.array(z.string()).describe('claim_ids that contradict this claim'),
  notes: z.string().nullable(),
});
export type ResearchClaim = z.infer<typeof ResearchClaimSchema>;

// ── Research Citation ───────────────────────────────────────────────────────────
export const ResearchCitationSchema = z.object({
  citation_id: z.string().min(1),
  source_id: z.string().min(1),
  claim_id: z.string().min(1),
  url: z.string().url().nullable(),
  date_accessed: z.string().datetime().nullable(),
  source_type: ResearchSourceTypeSchema,
  summary: z.string().min(1),
});
export type ResearchCitation = z.infer<typeof ResearchCitationSchema>;

// ── Research Truth Result ───────────────────────────────────────────────────────
export const ResearchTruthResultSchema = z.object({
  request_id: z.string().min(1),
  query: z.string().min(1),
  research_state: ResearchAvailabilityStateSchema,
  sources: z.array(ResearchSourceSchema),
  claims: z.array(ResearchClaimSchema),
  citations: z.array(ResearchCitationSchema),
  unsupported_claims: z
    .array(z.string())
    .describe('claim_ids that are UNSUPPORTED/HYPOTHESIS/INSUFFICIENT_EVIDENCE'),
  contradictions: z.array(z.string()).describe('claim_ids with CONTRADICTED status'),
  freshness_gate: z
    .boolean()
    .describe('true if all time_sensitive/current claims have VERIFIED sources'),
  known_limits: z
    .array(z.string())
    .describe('Explicit list of limits when source proof is incomplete'),
  generated_at: z.string().datetime(),
});
export type ResearchTruthResult = z.infer<typeof ResearchTruthResultSchema>;

// ── Policy Helpers ──────────────────────────────────────────────────────────────

/** A claim with freshness=current or time_sensitive requires source. */
export function requiresResearchForClaim(claim: ResearchClaim): boolean {
  return claim.freshness === 'current' || claim.freshness === 'time_sensitive';
}

/**
 * A claim can be presented as fact only if:
 * - It has at least one VERIFIED source
 * - Its status is SUPPORTED
 * - It is not CONTRADICTED
 * - All current/time_sensitive claims have a verified source with url + date_accessed
 */
export function canPresentAsFact(
  claim: ResearchClaim,
  sources: ResearchSource[]
): boolean {
  if (claim.status === 'CONTRADICTED') return false;
  if (claim.status !== 'SUPPORTED') return false;
  if (claim.source_ids.length === 0 && claim.requires_source) return false;

  const claimSources = sources.filter(s => claim.source_ids.includes(s.source_id));
  const hasVerified = claimSources.some(s => s.status === 'VERIFIED');
  if (!hasVerified && claim.requires_source) return false;

  // time_sensitive / current requires verified source with URL + date_accessed and must be verifiable (not generated/internal)
  if (claim.freshness === 'current' || claim.freshness === 'time_sensitive') {
    return claimSources.some(
      s =>
        s.status === 'VERIFIED' &&
        s.url !== null &&
        s.date_accessed !== null &&
        s.source_type !== 'generated' &&
        s.source_type !== 'internal'
    );
  }

  return true;
}

/** A source is verifiable when it has url + date_accessed + status is not REJECTED/UNAVAILABLE/UNKNOWN. */
export function isSourceVerifiable(source: ResearchSource): boolean {
  if (
    source.status === 'REJECTED' ||
    source.status === 'UNAVAILABLE' ||
    source.status === 'UNKNOWN'
  )
    return false;
  if (source.source_type === 'generated' || source.source_type === 'internal')
    return false;
  return source.url !== null && source.date_accessed !== null;
}

/** A claim is a current claim if freshness is 'current' or 'time_sensitive'. */
export function isCurrentClaim(claim: ResearchClaim): boolean {
  return claim.freshness === 'current' || claim.freshness === 'time_sensitive';
}

/** Research is unavailable when state is RESEARCH_UNAVAILABLE or RESEARCH_FAILED. */
export function isResearchUnavailable(result: ResearchTruthResult): boolean {
  return (
    result.research_state === 'RESEARCH_UNAVAILABLE' ||
    result.research_state === 'RESEARCH_FAILED'
  );
}

/** Result has contradictions when any claim has CONTRADICTED status. */
export function hasContradictions(result: ResearchTruthResult): boolean {
  return result.contradictions.length > 0;
}

/**
 * Build a citation summary string from a ResearchTruthResult.
 * Each citation must include URL, date_accessed, source_type.
 * Missing URL or date is recorded as UNAVAILABLE in the summary.
 */
export function buildCitationSummary(result: ResearchTruthResult): string {
  if (result.citations.length === 0) {
    return 'No citations available. Research state: ' + result.research_state;
  }
  const lines = result.citations.map(c => {
    const url = c.url ?? 'URL_UNAVAILABLE';
    const date = c.date_accessed ?? 'DATE_UNAVAILABLE';
    return `[${c.citation_id}] ${c.summary} | type=${c.source_type} | url=${url} | accessed=${date}`;
  });
  return lines.join('\n');
}

/** RESEARCH_UNAVAILABLE state cannot silently become RESEARCH_AVAILABLE. */
export const RESEARCH_UNAVAILABLE_IS_TERMINAL = true;

/**
 * Validate that a RESEARCH_UNAVAILABLE result is honest:
 * - research_state must be RESEARCH_UNAVAILABLE or RESEARCH_FAILED
 * - sources array must be empty or contain only UNAVAILABLE status sources
 * - freshness_gate must be false
 * - known_limits must be non-empty
 */
export function validateResearchUnavailableHonesty(result: ResearchTruthResult): {
  honest: boolean;
  reason: string;
} {
  if (
    result.research_state !== 'RESEARCH_UNAVAILABLE' &&
    result.research_state !== 'RESEARCH_FAILED'
  ) {
    return {
      honest: false,
      reason: `State is ${result.research_state}, not UNAVAILABLE/FAILED`,
    };
  }
  if (result.freshness_gate) {
    return {
      honest: false,
      reason: 'freshness_gate cannot be true when research is unavailable',
    };
  }
  if (result.known_limits.length === 0) {
    return {
      honest: false,
      reason: 'known_limits must be non-empty when research is unavailable',
    };
  }
  const nonUnavailableSources = result.sources.filter(s => s.status !== 'UNAVAILABLE');
  if (nonUnavailableSources.length > 0) {
    return {
      honest: false,
      reason: `RESEARCH_UNAVAILABLE result has ${nonUnavailableSources.length} non-UNAVAILABLE source(s)`,
    };
  }
  return { honest: true, reason: 'RESEARCH_UNAVAILABLE state is honest' };
}

/**
 * Map a C2 KnowledgeItemMetadata requires_web_validation flag to a ResearchAvailabilityState.
 * If requires_web_validation=true → RESEARCH_REQUIRED.
 * Otherwise → RESEARCH_NOT_REQUESTED.
 */
export function mapC2RequiresWebValidationToResearchState(
  requiresWebValidation: boolean
): ResearchAvailabilityState {
  return requiresWebValidation ? 'RESEARCH_REQUIRED' : 'RESEARCH_NOT_REQUESTED';
}
