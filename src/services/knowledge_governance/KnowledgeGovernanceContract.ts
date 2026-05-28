/**
 * TITANE∞ — Knowledge Governance Contract
 * Lock C2 — T2 bounded (scaffold + schemas, no runtime activation required)
 *
 * Governs the quality, attribution, and freshness of knowledge used by TITANE∞.
 * Three dimensions:
 * 1. Source Attribution — where does knowledge come from?
 * 2. Confidence Scoring — how reliable is this knowledge?
 * 3. Staleness Detection — is this knowledge still current?
 *
 * References:
 * - S006 RAG Fusion (multi-source retrieval attribution)
 * - S007 Constitutional AI (governance principles)
 * - S012 Temporal Knowledge (staleness/cutoff awareness)
 * - CD-04 (COGNITIVE_CORE_TRUTH_MATRIX): no temporal decay/cutoff enforcement
 */

import { z } from 'zod';

// ── Source Attribution ──────────────────────────────────────────────────────────
export const KnowledgeSourceTypeSchema = z.enum([
  'user_conversation', // Directly from user messages in conversation
  'ltm_retrieval', // Long-term memory retrieval
  'rag_document', // RAG document chunk
  'web_enrichment', // Web enrichment via memoryWebEnricher
  'ollama_inference', // Derived by local Ollama model
  'gemini_inference', // Derived by Gemini cloud model
  'system_config', // System configuration / static knowledge
  'knowledge_graph', // KnowledgeGraphIndex (HippoRAG-inspired)
  'unknown', // No attribution available
]);
export type KnowledgeSourceType = z.infer<typeof KnowledgeSourceTypeSchema>;

export const KnowledgeSourceAttributionSchema = z.object({
  source_id: z.string().describe('Unique ID of the source document/node/message'),
  source_type: KnowledgeSourceTypeSchema,
  source_uri: z
    .string()
    .nullable()
    .describe('URL, file path, or IPC reference (null if unavailable)'),
  retrieval_timestamp: z
    .string()
    .datetime()
    .describe('When this knowledge was retrieved'),
  retrieval_method: z
    .enum(['direct', 'semantic_search', 'lexical_search', 'hybrid', 'graph_traversal'])
    .describe('How the knowledge was retrieved'),
  session_id: z
    .string()
    .nullable()
    .describe('Conversation session that triggered retrieval'),
});
export type KnowledgeSourceAttribution = z.infer<typeof KnowledgeSourceAttributionSchema>;

// ── Confidence Score ────────────────────────────────────────────────────────────
export const ConfidenceDimensionSchema = z.object({
  /** Source reliability score (0..1) — how trustworthy is this source type */
  source_reliability: z.number().min(0).max(1),
  /** Retrieval relevance score (0..1) — cosine/BM25 similarity to query */
  retrieval_relevance: z.number().min(0).max(1),
  /** Freshness score (0..1) — 1=very fresh, 0=very stale */
  freshness: z.number().min(0).max(1),
  /** Consistency score (0..1) — agreement with other sources */
  cross_source_consistency: z.number().min(0).max(1),
});
export type ConfidenceDimension = z.infer<typeof ConfidenceDimensionSchema>;

export const KnowledgeConfidenceSchema = z.object({
  dimensions: ConfidenceDimensionSchema,
  /** Weighted composite score. Default weights: source=0.3, relevance=0.4, freshness=0.2, consistency=0.1 */
  composite_score: z.number().min(0).max(1),
  confidence_tier: z.enum(['high', 'medium', 'low', 'unverified']),
});
export type KnowledgeConfidence = z.infer<typeof KnowledgeConfidenceSchema>;

// ── Staleness Detection ────────────────────────────────────────────────────────
export const StalenessSignalSchema = z.object({
  age_days: z.number().min(0).describe('Age of source document in days'),
  has_cutoff_date: z.boolean().describe('Whether the source declares a knowledge cutoff'),
  cutoff_date: z.string().datetime().nullable().describe('ISO-8601 declared cutoff date'),
  is_temporal_query: z
    .boolean()
    .describe('Does the query ask about current/recent events?'),
  staleness_risk: z
    .enum(['none', 'low', 'medium', 'high', 'critical'])
    .describe('Assessed staleness risk for this knowledge-query pair'),
  mitigation: z
    .string()
    .nullable()
    .describe('Recommended mitigation (e.g. "Refresh via web enrichment")'),
});
export type StalenessSignal = z.infer<typeof StalenessSignalSchema>;

// ── Governed Knowledge Item ─────────────────────────────────────────────────────
export const GovernedKnowledgeItemSchema = z.object({
  item_id: z.string().uuid(),
  content: z.string().min(1),
  attribution: KnowledgeSourceAttributionSchema,
  confidence: KnowledgeConfidenceSchema,
  staleness: StalenessSignalSchema,
  /** Whether this item passed governance gate (confidence composite >= threshold) */
  governance_passed: z.boolean(),
  governance_threshold: z
    .number()
    .min(0)
    .max(1)
    .describe('Minimum composite score to pass'),
});
export type GovernedKnowledgeItem = z.infer<typeof GovernedKnowledgeItemSchema>;

// ── C2 Governance Contract ──────────────────────────────────────────────────────
export const C2KnowledgeGovernanceContractSchema = z.object({
  lock: z.literal('C2'),
  tier: z.literal('T2'),
  governance_threshold_default: z.number().min(0).max(1),
  staleness_max_age_days_default: z.number().min(0),
  temporal_query_staleness_risk_cap: z.enum(['medium', 'high', 'critical']),
  drift_addressed: z.array(z.string()),
});
export type C2KnowledgeGovernanceContract = z.infer<
  typeof C2KnowledgeGovernanceContractSchema
>;

// ── Confidence Computation ──────────────────────────────────────────────────────
const SOURCE_RELIABILITY: Record<KnowledgeSourceType, number> = {
  user_conversation: 0.9,
  ltm_retrieval: 0.75,
  rag_document: 0.8,
  web_enrichment: 0.6,
  ollama_inference: 0.55,
  gemini_inference: 0.65,
  system_config: 0.95,
  knowledge_graph: 0.7,
  unknown: 0.1,
};

const WEIGHTS = { source: 0.3, relevance: 0.4, freshness: 0.2, consistency: 0.1 };

/**
 * Compute a composite confidence score from its dimensions.
 * Uses default weights: source=0.3, relevance=0.4, freshness=0.2, consistency=0.1
 */
export function computeCompositeConfidence(dims: ConfidenceDimension): number {
  return (
    dims.source_reliability * WEIGHTS.source +
    dims.retrieval_relevance * WEIGHTS.relevance +
    dims.freshness * WEIGHTS.freshness +
    dims.cross_source_consistency * WEIGHTS.consistency
  );
}

/**
 * Classify composite score into confidence tier.
 * ≥ 0.75 = high | ≥ 0.5 = medium | ≥ 0.25 = low | < 0.25 = unverified
 */
export function classifyConfidenceTier(
  score: number
): 'high' | 'medium' | 'low' | 'unverified' {
  if (score >= 0.75) return 'high';
  if (score >= 0.5) return 'medium';
  if (score >= 0.25) return 'low';
  return 'unverified';
}

/**
 * Build a KnowledgeConfidence from partial inputs.
 */
export function buildKnowledgeConfidence(
  sourceType: KnowledgeSourceType,
  retrievalRelevance: number,
  freshness: number,
  crossSourceConsistency = 1.0
): KnowledgeConfidence {
  const dims: ConfidenceDimension = {
    source_reliability: SOURCE_RELIABILITY[sourceType],
    retrieval_relevance: Math.max(0, Math.min(1, retrievalRelevance)),
    freshness: Math.max(0, Math.min(1, freshness)),
    cross_source_consistency: Math.max(0, Math.min(1, crossSourceConsistency)),
  };
  const score = computeCompositeConfidence(dims);
  return {
    dimensions: dims,
    composite_score: Math.round(score * 1000) / 1000,
    confidence_tier: classifyConfidenceTier(score),
  };
}

// ── Staleness Computation ───────────────────────────────────────────────────────
const STALENESS_MAX_DAYS = 180;

/**
 * Compute staleness signal for a knowledge item.
 * Addresses drift CD-04: no temporal decay/cutoff enforcement.
 */
export function computeStalenessSignal(
  ageDays: number,
  isTemporalQuery: boolean,
  cutoffDate: string | null = null
): StalenessSignal {
  const freshnessFraction = Math.max(0, 1 - ageDays / STALENESS_MAX_DAYS);

  let risk: StalenessSignal['staleness_risk'] = 'none';
  let mitigation: string | null = null;

  if (ageDays > STALENESS_MAX_DAYS) {
    risk = isTemporalQuery ? 'critical' : 'high';
    mitigation = 'Refresh via web enrichment or re-query with current date context';
  } else if (ageDays > 60) {
    risk = isTemporalQuery ? 'high' : 'medium';
    mitigation = isTemporalQuery ? 'Verify with fresh source for temporal query' : null;
  } else if (ageDays > 14) {
    risk = isTemporalQuery ? 'medium' : 'low';
    mitigation = isTemporalQuery ? 'Confirm currency for time-sensitive query' : null;
  } else if (isTemporalQuery) {
    risk = 'low';
    mitigation = 'Source is recent; minor risk for temporal query';
  }

  return {
    age_days: ageDays,
    has_cutoff_date: cutoffDate !== null,
    cutoff_date: cutoffDate,
    is_temporal_query: isTemporalQuery,
    staleness_risk: risk,
    mitigation,
  };
}

// Expose freshness as 0..1 from age
export function freshnessFromAge(ageDays: number): number {
  return Math.max(0, Math.round((1 - ageDays / STALENESS_MAX_DAYS) * 1000) / 1000);
}

// ── Governance Gate ─────────────────────────────────────────────────────────────
const GOVERNANCE_THRESHOLD = 0.4;

/**
 * Apply governance gate: returns true if item passes minimum confidence threshold.
 */
export function applyGovernanceGate(
  confidence: KnowledgeConfidence,
  threshold = GOVERNANCE_THRESHOLD
): boolean {
  return confidence.composite_score >= threshold;
}

// ── Contract Instance ───────────────────────────────────────────────────────────
export function getC2KnowledgeGovernanceContract(): C2KnowledgeGovernanceContract {
  return {
    lock: 'C2',
    tier: 'T2',
    governance_threshold_default: GOVERNANCE_THRESHOLD,
    staleness_max_age_days_default: STALENESS_MAX_DAYS,
    temporal_query_staleness_risk_cap: 'critical',
    drift_addressed: ['CD-04'],
  };
}

// ── Knowledge Metadata Sidecar (C2 v10 extension) ──────────────────────────────
// These types govern the sidecar index (KNOWLEDGE_GOVERNANCE_INDEX.json),
// not the runtime retrieval path. No runtime activation required (T2 bounded).

export const KNOWLEDGE_DOMAINS = [
  'architecture',
  'memory',
  'knowledge',
  'research',
  'provider_routing',
  'omega',
  'singularity',
  'twin',
  'agents',
  'instructions',
  'desktop_e2e',
  'safety',
  'legal',
  'medical',
  'financial',
  'spiritual_symbolic',
  'business_strategy',
  'biodiversity',
  'personal_knowledge',
  'unknown',
] as const;
export type KnowledgeDomain = (typeof KNOWLEDGE_DOMAINS)[number];

export const KnowledgeDomainSchema = z.enum(KNOWLEDGE_DOMAINS);

export const ITEM_SOURCE_TYPES = [
  'curated',
  'generated',
  'internal',
  'public',
  'unknown',
] as const;
export type KnowledgeItemSourceType = (typeof ITEM_SOURCE_TYPES)[number];

export const KnowledgeItemSourceTypeSchema = z.enum(ITEM_SOURCE_TYPES);

export const VALIDATION_STATUSES = [
  'verified',
  'curated',
  'to_verify',
  'outdated',
  'rejected',
  'unknown',
] as const;
export type KnowledgeValidationStatus = (typeof VALIDATION_STATUSES)[number];

export const KnowledgeValidationStatusSchema = z.enum(VALIDATION_STATUSES);

/**
 * Sidecar metadata entry for a knowledge surface.
 * Governs provenance, freshness, confidence, allowed-use, and risk boundaries.
 * Content is never rewritten — this is governance-only metadata.
 */
export const KnowledgeItemMetadataSchema = z.object({
  knowledge_id: z.string().min(1),
  title: z.string().min(1),
  domain: KnowledgeDomainSchema,
  version: z.string().default('1.0'),
  source_type: KnowledgeItemSourceTypeSchema,
  source_ref: z.string().nullable().default(null),
  url: z.string().nullable().default(null),
  last_reviewed: z.string().nullable().default(null),
  confidence: z.number().min(0).max(1).default(0.5),
  freshness: z.enum(['stable', 'time_sensitive', 'unknown']).default('unknown'),
  requires_web_validation: z.boolean().default(false),
  risk_level: z.enum(['low', 'medium', 'high', 'restricted']).default('low'),
  allowed_use: z.array(z.string()).default([]),
  not_allowed_use: z.array(z.string()).default([]),
  validation_status: KnowledgeValidationStatusSchema.default('unknown'),
  notes: z.string().nullable().default(null),
});
export type KnowledgeItemMetadata = z.infer<typeof KnowledgeItemMetadataSchema>;

/** Governance sidecar index (top-level wrapper) */
export const KnowledgeGovernanceIndexSchema = z.object({
  schema_version: z.literal('C2-v1'),
  generated_at: z.string().datetime(),
  lock: z.literal('C2'),
  entries: z.array(KnowledgeItemMetadataSchema),
});
export type KnowledgeGovernanceIndex = z.infer<typeof KnowledgeGovernanceIndexSchema>;

// ── Sidecar Policy Functions ────────────────────────────────────────────────────
/** C2 Policy: time_sensitive freshness requires web validation */
export function requiresWebValidationForTimeSensitive(
  metadata: Pick<KnowledgeItemMetadata, 'freshness' | 'requires_web_validation'>
): boolean {
  return metadata.freshness === 'time_sensitive'
    ? metadata.requires_web_validation
    : true;
}

/** C2 Policy: public source without URL/date cannot be validation_status=verified */
export function publicSourceCannotBeVerifiedWithoutEvidence(
  metadata: Pick<
    KnowledgeItemMetadata,
    'source_type' | 'validation_status' | 'url' | 'last_reviewed'
  >
): boolean {
  if (metadata.source_type !== 'public') return true;
  if (metadata.validation_status !== 'verified') return true;
  return metadata.url !== null || metadata.last_reviewed !== null;
}

/** C2 Policy: unknown source_type cannot have high confidence (>= 0.75) */
export function unknownSourceCannotBeHighConfidence(
  metadata: Pick<KnowledgeItemMetadata, 'source_type' | 'confidence'>
): boolean {
  if (metadata.source_type !== 'unknown') return true;
  return metadata.confidence < 0.75;
}

/** C2 Policy: high-risk domains (legal/medical/financial/safety) must declare not_allowed_use boundaries */
export const HIGH_RISK_DOMAINS: ReadonlySet<KnowledgeDomain> = new Set([
  'legal',
  'medical',
  'financial',
  'safety',
]);

export function highRiskDomainRequiresNotAllowedUse(
  metadata: Pick<KnowledgeItemMetadata, 'domain' | 'not_allowed_use'>
): boolean {
  if (!HIGH_RISK_DOMAINS.has(metadata.domain)) return true;
  return metadata.not_allowed_use.length > 0;
}

/** C2 Policy: generated source_type cannot be validation_status=verified without review marker */
export function generatedSourceCannotBeVerifiedWithoutReview(
  metadata: Pick<KnowledgeItemMetadata, 'source_type' | 'validation_status' | 'notes'>
): boolean {
  if (metadata.source_type !== 'generated') return true;
  if (metadata.validation_status !== 'verified') return true;
  return metadata.notes !== null && metadata.notes.toLowerCase().includes('review');
}

/** C2 Policy: spiritual_symbolic domain content is interpretive, not factual-certainty */
export function spiritualSymbolicIsInterpretive(
  metadata: Pick<KnowledgeItemMetadata, 'domain' | 'validation_status'>
): boolean {
  if (metadata.domain !== 'spiritual_symbolic') return true;
  return metadata.validation_status !== 'verified';
}

/** C2 Policy: governance index must contain at least the required top-level domains */
export const REQUIRED_GOVERNANCE_DOMAINS: ReadonlySet<KnowledgeDomain> = new Set([
  'architecture',
  'memory',
  'knowledge',
  'safety',
  'legal',
  'medical',
  'financial',
  'spiritual_symbolic',
]);

export function governanceIndexContainsRequiredDomains(
  entries: ReadonlyArray<Pick<KnowledgeItemMetadata, 'domain'>>
): boolean {
  const present = new Set(entries.map(e => e.domain));
  for (const domain of REQUIRED_GOVERNANCE_DOMAINS) {
    if (!present.has(domain)) return false;
  }
  return true;
}
