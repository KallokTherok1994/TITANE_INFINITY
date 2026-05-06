import { describe, it, expect } from 'vitest'
import {
  ResearchQueryClassificationSchema,
  ResearchSourceEvidenceSchema,
  TruthAggregationSchema,
  ResearchTruthVerdictSchema,
  C3ResearchTruthContractSchema,
  classifyResearchQuery,
  aggregateTruthEvidence,
  buildResearchTruthVerdict,
  getC3ResearchTruthContract,
  // v11 sidecar
  ResearchAvailabilityStateSchema,
  ResearchFreshnessClassSchema,
  ResearchSourceStatusSchema,
  ResearchClaimStatusSchema,
  ResearchSourceTypeSchema,
  ResearchSourceSchema,
  ResearchClaimSchema,
  ResearchCitationSchema,
  ResearchTruthResultSchema,
  requiresResearchForClaim,
  canPresentAsFact,
  isSourceVerifiable,
  isCurrentClaim,
  isResearchUnavailable,
  hasContradictions,
  buildCitationSummary,
  validateResearchUnavailableHonesty,
  mapC2RequiresWebValidationToResearchState,
  RESEARCH_UNAVAILABLE_IS_TERMINAL,
} from '../ResearchTruthContract'

const NOW = '2026-05-06T10:00:00.000Z'

const makeEvidence = (id: string, supports: boolean | null, conf = 0.8): import('../ResearchTruthContract').ResearchSourceEvidence => ({
  evidence_id: id,
  source_type: 'rag_document',
  content_snippet: `Evidence ${id}`,
  confidence: conf,
  retrieved_at: NOW,
  supports_claim: supports,
})

// ── ResearchQueryClassificationSchema ──────────────────────────────────────────
describe('ResearchQueryClassificationSchema', () => {
  it('validates a valid classification', () => {
    const result = ResearchQueryClassificationSchema.safeParse({
      query_id: 'q-001',
      query_text: 'What is the capital of France?',
      classification: 'factual_static',
      requires_research_validation: false,
      reasoning: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty query_text', () => {
    const result = ResearchQueryClassificationSchema.safeParse({
      query_id: 'q-002',
      query_text: '',
      classification: 'factual_static',
      requires_research_validation: false,
      reasoning: null,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid classification', () => {
    const result = ResearchQueryClassificationSchema.safeParse({
      query_id: 'q-003',
      query_text: 'test',
      classification: 'magical',
      requires_research_validation: false,
      reasoning: null,
    })
    expect(result.success).toBe(false)
  })
})

// ── classifyResearchQuery ───────────────────────────────────────────────────────
describe('classifyResearchQuery', () => {
  it('classifies conversational as conversational (no validation needed)', () => {
    const result = classifyResearchQuery('q-001', 'Hi, how are you?')
    expect(result.classification).toBe('conversational')
    expect(result.requires_research_validation).toBe(false)
  })

  it('classifies temporal queries correctly', () => {
    const result = classifyResearchQuery('q-002', 'Who is the current president of France?')
    expect(result.classification).toBe('factual_temporal')
    expect(result.requires_research_validation).toBe(true)
  })

  it('classifies disputed claims', () => {
    const result = classifyResearchQuery('q-003', 'Some say this controversial claim is true')
    expect(result.classification).toBe('claims_disputed')
    expect(result.requires_research_validation).toBe(true)
  })

  it('classifies technical queries', () => {
    const result = classifyResearchQuery('q-004', 'What is the correct algorithm for quicksort?')
    expect(result.classification).toBe('technical_precise')
    expect(result.requires_research_validation).toBe(true)
  })

  it('classifies static factual queries', () => {
    const result = classifyResearchQuery('q-005', 'What is the boiling point of water?')
    expect(result.classification).toBe('factual_static')
    expect(result.requires_research_validation).toBe(false)
  })

  it('returns structured object parseable by schema', () => {
    const result = classifyResearchQuery('q-006', 'Tell me about latest AI models')
    expect(ResearchQueryClassificationSchema.safeParse(result).success).toBe(true)
  })
})

// ── ResearchSourceEvidenceSchema ────────────────────────────────────────────────
describe('ResearchSourceEvidenceSchema', () => {
  it('validates valid evidence', () => {
    const result = ResearchSourceEvidenceSchema.safeParse(makeEvidence('e-001', true))
    expect(result.success).toBe(true)
  })

  it('accepts null supports_claim', () => {
    const result = ResearchSourceEvidenceSchema.safeParse(makeEvidence('e-002', null))
    expect(result.success).toBe(true)
  })

  it('rejects confidence > 1', () => {
    const result = ResearchSourceEvidenceSchema.safeParse({
      ...makeEvidence('e-003', true),
      confidence: 1.5,
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty content_snippet', () => {
    const result = ResearchSourceEvidenceSchema.safeParse({
      ...makeEvidence('e-004', true),
      content_snippet: '',
    })
    expect(result.success).toBe(false)
  })
})

// ── aggregateTruthEvidence ──────────────────────────────────────────────────────
describe('aggregateTruthEvidence', () => {
  it('returns insufficient with empty evidence', () => {
    const agg = aggregateTruthEvidence('test claim', [])
    // edge case: evaluable=0 → insufficient
    expect(agg.evidence_status).toBe('insufficient')
  })

  it('returns unverified with single evaluable source', () => {
    const agg = aggregateTruthEvidence('test claim', [makeEvidence('e-001', true)])
    expect(agg.evidence_status).toBe('unverified')
  })

  it('returns confirmed with 2+ supporting sources', () => {
    const agg = aggregateTruthEvidence('test claim', [
      makeEvidence('e-001', true),
      makeEvidence('e-002', true),
    ])
    expect(agg.evidence_status).toBe('confirmed')
    expect(agg.conflict_detected).toBe(false)
  })

  it('detects conflict with mixed sources', () => {
    const agg = aggregateTruthEvidence('test claim', [
      makeEvidence('e-001', true),
      makeEvidence('e-002', true),
      makeEvidence('e-003', false),
      makeEvidence('e-004', false),
      makeEvidence('e-005', true),
    ])
    expect(agg.conflict_detected).toBe(true)
    expect(agg.evidence_status).toBe('disputed')
  })

  it('counts neutral (null) evidence separately', () => {
    const agg = aggregateTruthEvidence('test claim', [
      makeEvidence('e-001', true),
      makeEvidence('e-002', true),
      makeEvidence('e-003', null),
    ])
    expect(agg.neutral_count).toBe(1)
    expect(agg.supporting_count).toBe(2)
  })

  it('computes aggregate_confidence correctly', () => {
    const agg = aggregateTruthEvidence('test claim', [
      makeEvidence('e-001', true, 0.8),
      makeEvidence('e-002', true, 0.6),
    ])
    expect(agg.aggregate_confidence).toBeCloseTo(0.7, 2)
  })

  it('output parseable by TruthAggregationSchema', () => {
    const agg = aggregateTruthEvidence('Paris is in France', [
      makeEvidence('e-001', true),
      makeEvidence('e-002', true),
    ])
    expect(TruthAggregationSchema.safeParse(agg).success).toBe(true)
  })
})

// ── buildResearchTruthVerdict — flag=false ─────────────────────────────────────
describe('buildResearchTruthVerdict — flag disabled', () => {
  const confirmedAgg = aggregateTruthEvidence('Paris is in France', [
    makeEvidence('e-001', true),
    makeEvidence('e-002', true),
  ])

  it('returns unverifiable when flag=false', () => {
    const verdict = buildResearchTruthVerdict('v-001', 'q-001', confirmedAgg, false)
    expect(verdict.verdict).toBe('unverifiable')
    expect(verdict.flag_active).toBe(false)
    expect(verdict.confidence).toBe(0)
    expect(verdict.provenance_ids).toHaveLength(0)
  })
})

// ── buildResearchTruthVerdict — flag=true ──────────────────────────────────────
describe('buildResearchTruthVerdict — flag enabled', () => {
  it('returns verified for 2+ supporting sources', () => {
    const agg = aggregateTruthEvidence('Paris is in France', [
      makeEvidence('e-001', true),
      makeEvidence('e-002', true),
    ])
    const verdict = buildResearchTruthVerdict('v-002', 'q-002', agg, true)
    expect(verdict.verdict).toBe('verified')
    expect(verdict.flag_active).toBe(true)
    expect(verdict.provenance_ids).toHaveLength(2)
  })

  it('returns disputed for conflicting evidence', () => {
    const agg = aggregateTruthEvidence('claim', [
      makeEvidence('e-001', true),
      makeEvidence('e-002', true),
      makeEvidence('e-003', false),
      makeEvidence('e-004', false),
      makeEvidence('e-005', true),
    ])
    const verdict = buildResearchTruthVerdict('v-003', 'q-003', agg, true)
    expect(verdict.verdict).toBe('disputed')
  })

  it('returns unverifiable for insufficient evidence', () => {
    const agg = aggregateTruthEvidence('claim', [])
    const verdict = buildResearchTruthVerdict('v-004', 'q-004', agg, true)
    expect(verdict.verdict).toBe('unverifiable')
  })

  it('output parseable by ResearchTruthVerdictSchema', () => {
    const agg = aggregateTruthEvidence('test', [
      makeEvidence('e-001', true),
      makeEvidence('e-002', true),
    ])
    const verdict = buildResearchTruthVerdict('550e8400-e29b-41d4-a716-446655440099', 'q-005', agg, true)
    expect(ResearchTruthVerdictSchema.safeParse(verdict).success).toBe(true)
  })
})

// ── getC3ResearchTruthContract ──────────────────────────────────────────────────
describe('getC3ResearchTruthContract', () => {
  it('parses with C3ResearchTruthContractSchema', () => {
    const contract = getC3ResearchTruthContract()
    expect(C3ResearchTruthContractSchema.safeParse(contract).success).toBe(true)
  })

  it('lock must be C3', () => {
    expect(getC3ResearchTruthContract().lock).toBe('C3')
  })

  it('tier must be T3', () => {
    expect(getC3ResearchTruthContract().tier).toBe('T3')
  })

  it('flag_name is TITANE_C3_RESEARCH_TRUTH_ENABLED', () => {
    expect(getC3ResearchTruthContract().flag_name).toBe('TITANE_C3_RESEARCH_TRUTH_ENABLED')
  })

  it('references S003 S006 S012', () => {
    const contract = getC3ResearchTruthContract()
    expect(contract.sources_referenced).toContain('S003')
    expect(contract.sources_referenced).toContain('S012')
  })

  it('min_sources_for_confirmation >= 2', () => {
    expect(getC3ResearchTruthContract().min_sources_for_confirmation).toBeGreaterThanOrEqual(2)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// C3 v11 Sidecar Tests — C3-UNIT-01..10
// ══════════════════════════════════════════════════════════════════════════════

// NOTE: NOW is already declared at line 34 above — reused here.

const makeSource = (
  id: string,
  status: import('../ResearchTruthContract').ResearchSourceStatus,
  sourceType: import('../ResearchTruthContract').ResearchSourceType = 'official',
  url: string | null = 'https://example.com/source',
  dateAccessed: string | null = NOW,
): import('../ResearchTruthContract').ResearchSource => ({
  source_id: id,
  title: `Source ${id}`,
  url,
  source_type: sourceType,
  date_accessed: dateAccessed,
  published_at: NOW,
  last_updated: NOW,
  status,
  relevance: 0.9,
  confidence: 0.85,
  notes: null,
})

const makeClaim = (
  id: string,
  status: import('../ResearchTruthContract').ResearchClaimStatus,
  freshness: import('../ResearchTruthContract').ResearchFreshnessClass = 'stable',
  sourceIds: string[] = [],
  requiresSource = false,
): import('../ResearchTruthContract').ResearchClaim => ({
  claim_id: id,
  text: `Claim ${id}`,
  claim_type: 'fact',
  freshness,
  status,
  source_ids: sourceIds,
  requires_source: requiresSource,
  risk_level: 'low',
  contradicts: [],
  notes: null,
})

const makeResult = (
  state: import('../ResearchTruthContract').ResearchAvailabilityState,
  sources: import('../ResearchTruthContract').ResearchSource[] = [],
  claims: import('../ResearchTruthContract').ResearchClaim[] = [],
  citations: import('../ResearchTruthContract').ResearchCitation[] = [],
  knownLimits: string[] = [],
): import('../ResearchTruthContract').ResearchTruthResult => ({
  request_id: 'req-001',
  query: 'test query',
  research_state: state,
  sources,
  claims,
  citations,
  unsupported_claims: claims
    .filter((c) => ['UNSUPPORTED', 'HYPOTHESIS', 'INSUFFICIENT_EVIDENCE'].includes(c.status))
    .map((c) => c.claim_id),
  contradictions: claims.filter((c) => c.status === 'CONTRADICTED').map((c) => c.claim_id),
  freshness_gate: state === 'RESEARCH_AVAILABLE' && claims.length > 0,
  known_limits: knownLimits,
  generated_at: NOW,
})

// ── C3-UNIT-01 — ResearchTruthResult supports RESEARCH_UNAVAILABLE ─────────────
describe('C3-UNIT-01 — ResearchTruthResult supports RESEARCH_UNAVAILABLE', () => {
  it('ResearchAvailabilityStateSchema includes RESEARCH_UNAVAILABLE', () => {
    const r = ResearchAvailabilityStateSchema.safeParse('RESEARCH_UNAVAILABLE')
    expect(r.success).toBe(true)
  })

  it('ResearchTruthResult with RESEARCH_UNAVAILABLE state is valid', () => {
    const result = makeResult('RESEARCH_UNAVAILABLE', [], [], [], ['Network unavailable'])
    const r = ResearchTruthResultSchema.safeParse({ ...result, freshness_gate: false })
    expect(r.success).toBe(true)
  })

  it('isResearchUnavailable returns true for RESEARCH_UNAVAILABLE', () => {
    const result = makeResult('RESEARCH_UNAVAILABLE', [], [], [], ['Network unavailable'])
    expect(isResearchUnavailable({ ...result, freshness_gate: false })).toBe(true)
  })

  it('isResearchUnavailable returns true for RESEARCH_FAILED', () => {
    const result = makeResult('RESEARCH_FAILED', [], [], [], ['Retrieval failed'])
    expect(isResearchUnavailable({ ...result, freshness_gate: false })).toBe(true)
  })

  it('isResearchUnavailable returns false for RESEARCH_AVAILABLE', () => {
    const result = makeResult('RESEARCH_AVAILABLE')
    expect(isResearchUnavailable(result)).toBe(false)
  })

  it('RESEARCH_UNAVAILABLE_IS_TERMINAL is true', () => {
    expect(RESEARCH_UNAVAILABLE_IS_TERMINAL).toBe(true)
  })
})

// ── C3-UNIT-02 — current/time_sensitive claim requires verified source ──────────
describe('C3-UNIT-02 — current/time_sensitive claim requires verified source', () => {
  it('requiresResearchForClaim returns true for freshness=current', () => {
    const claim = makeClaim('c-001', 'SUPPORTED', 'current', ['s-001'], true)
    expect(requiresResearchForClaim(claim)).toBe(true)
  })

  it('requiresResearchForClaim returns true for freshness=time_sensitive', () => {
    const claim = makeClaim('c-002', 'SUPPORTED', 'time_sensitive', ['s-001'], true)
    expect(requiresResearchForClaim(claim)).toBe(true)
  })

  it('requiresResearchForClaim returns false for freshness=stable', () => {
    const claim = makeClaim('c-003', 'SUPPORTED', 'stable')
    expect(requiresResearchForClaim(claim)).toBe(false)
  })

  it('canPresentAsFact returns false for current claim without verified source', () => {
    const claim = makeClaim('c-004', 'SUPPORTED', 'current', ['s-001'], true)
    const source = makeSource('s-001', 'TO_VERIFY')
    expect(canPresentAsFact(claim, [source])).toBe(false)
  })

  it('canPresentAsFact returns true for current claim with verified source + url + date', () => {
    const claim = makeClaim('c-005', 'SUPPORTED', 'current', ['s-001'], true)
    const source = makeSource('s-001', 'VERIFIED', 'official', 'https://example.com', NOW)
    expect(canPresentAsFact(claim, [source])).toBe(true)
  })
})

// ── C3-UNIT-03 — TO_VERIFY source cannot support definitive current fact ────────
describe('C3-UNIT-03 — TO_VERIFY source cannot support definitive current fact', () => {
  it('canPresentAsFact returns false when all sources are TO_VERIFY for time_sensitive claim', () => {
    const claim = makeClaim('c-001', 'SUPPORTED', 'time_sensitive', ['s-001'], true)
    const source = makeSource('s-001', 'TO_VERIFY')
    expect(canPresentAsFact(claim, [source])).toBe(false)
  })

  it('canPresentAsFact returns false when source has no URL (cannot be verified)', () => {
    const claim = makeClaim('c-002', 'SUPPORTED', 'current', ['s-001'], true)
    const source = makeSource('s-001', 'VERIFIED', 'official', null, NOW)
    expect(canPresentAsFact(claim, [source])).toBe(false)
  })

  it('canPresentAsFact returns false when source has no date_accessed', () => {
    const claim = makeClaim('c-003', 'SUPPORTED', 'current', ['s-001'], true)
    const source = makeSource('s-001', 'VERIFIED', 'official', 'https://example.com', null)
    expect(canPresentAsFact(claim, [source])).toBe(false)
  })

  it('ResearchSourceStatus includes TO_VERIFY', () => {
    expect(ResearchSourceStatusSchema.safeParse('TO_VERIFY').success).toBe(true)
  })
})

// ── C3-UNIT-04 — generated/internal source cannot verify public current fact ────
describe('C3-UNIT-04 — generated/internal source cannot verify public current fact alone', () => {
  it('isSourceVerifiable returns false for generated source', () => {
    const source = makeSource('s-001', 'VERIFIED', 'generated')
    expect(isSourceVerifiable(source)).toBe(false)
  })

  it('isSourceVerifiable returns false for internal source', () => {
    const source = makeSource('s-001', 'VERIFIED', 'internal')
    expect(isSourceVerifiable(source)).toBe(false)
  })

  it('isSourceVerifiable returns true for official verified source with url+date', () => {
    const source = makeSource('s-001', 'VERIFIED', 'official', 'https://example.com', NOW)
    expect(isSourceVerifiable(source)).toBe(true)
  })

  it('isSourceVerifiable returns false for UNKNOWN status', () => {
    const source = makeSource('s-001', 'UNKNOWN', 'official')
    expect(isSourceVerifiable(source)).toBe(false)
  })

  it('canPresentAsFact returns false for current claim with only internal source', () => {
    const claim = makeClaim('c-001', 'SUPPORTED', 'current', ['s-001'], true)
    const source = makeSource('s-001', 'VERIFIED', 'internal')
    expect(canPresentAsFact(claim, [source])).toBe(false)
  })
})

// ── C3-UNIT-05 — unsupported claim remains hypothesis or insufficient evidence ──
describe('C3-UNIT-05 — unsupported claim remains hypothesis or insufficient evidence', () => {
  it('canPresentAsFact returns false for UNSUPPORTED claim', () => {
    const claim = makeClaim('c-001', 'UNSUPPORTED', 'stable', ['s-001'], false)
    const source = makeSource('s-001', 'VERIFIED')
    expect(canPresentAsFact(claim, [source])).toBe(false)
  })

  it('canPresentAsFact returns false for HYPOTHESIS claim', () => {
    const claim = makeClaim('c-001', 'HYPOTHESIS', 'stable', [], false)
    expect(canPresentAsFact(claim, [])).toBe(false)
  })

  it('canPresentAsFact returns false for INSUFFICIENT_EVIDENCE claim', () => {
    const claim = makeClaim('c-001', 'INSUFFICIENT_EVIDENCE', 'stable', [], false)
    expect(canPresentAsFact(claim, [])).toBe(false)
  })

  it('ResearchTruthResult.unsupported_claims tracks UNSUPPORTED/HYPOTHESIS/INSUFFICIENT_EVIDENCE claims', () => {
    const claims = [
      makeClaim('c-001', 'SUPPORTED', 'stable', ['s-001']),
      makeClaim('c-002', 'HYPOTHESIS', 'stable'),
      makeClaim('c-003', 'UNSUPPORTED', 'stable'),
    ]
    const result = makeResult('RESEARCH_AVAILABLE', [], claims)
    expect(result.unsupported_claims).toContain('c-002')
    expect(result.unsupported_claims).toContain('c-003')
    expect(result.unsupported_claims).not.toContain('c-001')
  })
})

// ── C3-UNIT-06 — contradiction blocks settled fact presentation ─────────────────
describe('C3-UNIT-06 — contradiction blocks settled fact presentation', () => {
  it('canPresentAsFact returns false for CONTRADICTED claim', () => {
    const claim = makeClaim('c-001', 'CONTRADICTED', 'stable', ['s-001'], false)
    const source = makeSource('s-001', 'VERIFIED')
    expect(canPresentAsFact(claim, [source])).toBe(false)
  })

  it('hasContradictions returns true when contradictions list is non-empty', () => {
    const claims = [{ ...makeClaim('c-001', 'CONTRADICTED', 'stable') }]
    const result = makeResult('RESEARCH_AVAILABLE', [], claims)
    expect(hasContradictions(result)).toBe(true)
  })

  it('hasContradictions returns false when no contradictions', () => {
    const claims = [makeClaim('c-001', 'SUPPORTED', 'stable', ['s-001'])]
    const result = makeResult('RESEARCH_AVAILABLE', [], claims)
    expect(hasContradictions(result)).toBe(false)
  })

  it('ResearchTruthResult.contradictions tracks CONTRADICTED claim_ids', () => {
    const claims = [
      makeClaim('c-001', 'SUPPORTED', 'stable', ['s-001']),
      makeClaim('c-002', 'CONTRADICTED', 'stable'),
    ]
    const result = makeResult('RESEARCH_AVAILABLE', [], claims)
    expect(result.contradictions).toContain('c-002')
    expect(result.contradictions).not.toContain('c-001')
  })
})

// ── C3-UNIT-07 — citation summary includes URL + date_accessed + source_type ────
describe('C3-UNIT-07 — citation summary includes URL + date_accessed + source_type', () => {
  it('buildCitationSummary returns unavailable markers when no citations', () => {
    const result = makeResult('RESEARCH_UNAVAILABLE', [], [], [], ['No network'])
    const summary = buildCitationSummary({ ...result, freshness_gate: false })
    expect(summary).toContain('RESEARCH_UNAVAILABLE')
  })

  it('buildCitationSummary includes url, date_accessed, source_type for each citation', () => {
    const citation: import('../ResearchTruthContract').ResearchCitation = {
      citation_id: 'cit-001',
      source_id: 's-001',
      claim_id: 'c-001',
      url: 'https://example.com/article',
      date_accessed: NOW,
      source_type: 'article',
      summary: 'Key evidence',
    }
    const result = { ...makeResult('RESEARCH_AVAILABLE'), citations: [citation] }
    const summary = buildCitationSummary(result)
    expect(summary).toContain('https://example.com/article')
    expect(summary).toContain(NOW)
    expect(summary).toContain('article')
  })

  it('ResearchCitationSchema requires url, date_accessed, source_type', () => {
    const r = ResearchCitationSchema.safeParse({
      citation_id: 'cit-001',
      source_id: 's-001',
      claim_id: 'c-001',
      url: 'https://example.com',
      date_accessed: NOW,
      source_type: 'official',
      summary: 'A summary',
    })
    expect(r.success).toBe(true)
  })

  it('buildCitationSummary marks URL_UNAVAILABLE when url is null', () => {
    const citation: import('../ResearchTruthContract').ResearchCitation = {
      citation_id: 'cit-002',
      source_id: 's-002',
      claim_id: 'c-001',
      url: null,
      date_accessed: NOW,
      source_type: 'internal',
      summary: 'Internal evidence',
    }
    const result = { ...makeResult('RESEARCH_AVAILABLE'), citations: [citation] }
    const summary = buildCitationSummary(result)
    expect(summary).toContain('URL_UNAVAILABLE')
  })
})

// ── C3-UNIT-08 — research result tracks known_limits when source proof is incomplete
describe('C3-UNIT-08 — research result tracks known_limits when source proof is incomplete', () => {
  it('ResearchTruthResult.known_limits is non-empty when research is unavailable', () => {
    const result = makeResult('RESEARCH_UNAVAILABLE', [], [], [], [
      'Network not available',
      'No sources retrieved',
    ])
    expect(result.known_limits.length).toBeGreaterThan(0)
  })

  it('validateResearchUnavailableHonesty passes for honest RESEARCH_UNAVAILABLE result', () => {
    const sources = [makeSource('s-001', 'UNAVAILABLE')]
    const result = makeResult('RESEARCH_UNAVAILABLE', sources, [], [], ['Network unavailable'])
    const check = validateResearchUnavailableHonesty({ ...result, freshness_gate: false })
    expect(check.honest).toBe(true)
  })

  it('validateResearchUnavailableHonesty fails when freshness_gate=true', () => {
    const result = makeResult('RESEARCH_UNAVAILABLE', [], [], [], ['Network unavailable'])
    const check = validateResearchUnavailableHonesty({ ...result, freshness_gate: true })
    expect(check.honest).toBe(false)
    expect(check.reason).toContain('freshness_gate')
  })

  it('validateResearchUnavailableHonesty fails when known_limits is empty', () => {
    const result = makeResult('RESEARCH_UNAVAILABLE', [], [], [], [])
    const check = validateResearchUnavailableHonesty({ ...result, freshness_gate: false })
    expect(check.honest).toBe(false)
    expect(check.reason).toContain('known_limits')
  })

  it('ResearchTruthResultSchema requires known_limits array', () => {
    const r = ResearchTruthResultSchema.safeParse({
      request_id: 'req-001',
      query: 'test',
      research_state: 'RESEARCH_UNAVAILABLE',
      sources: [],
      claims: [],
      citations: [],
      unsupported_claims: [],
      contradictions: [],
      freshness_gate: false,
      known_limits: ['Network unavailable'],
      generated_at: NOW,
    })
    expect(r.success).toBe(true)
  })
})

// ── C3-UNIT-09 — C2 requires_web_validation maps to RESEARCH_REQUIRED ───────────
describe('C3-UNIT-09 — C2 requires_web_validation knowledge maps to RESEARCH_REQUIRED', () => {
  it('mapC2RequiresWebValidationToResearchState returns RESEARCH_REQUIRED when true', () => {
    expect(mapC2RequiresWebValidationToResearchState(true)).toBe('RESEARCH_REQUIRED')
  })

  it('mapC2RequiresWebValidationToResearchState returns RESEARCH_NOT_REQUESTED when false', () => {
    expect(mapC2RequiresWebValidationToResearchState(false)).toBe('RESEARCH_NOT_REQUESTED')
  })

  it('ResearchAvailabilityStateSchema includes RESEARCH_REQUIRED', () => {
    expect(ResearchAvailabilityStateSchema.safeParse('RESEARCH_REQUIRED').success).toBe(true)
  })

  it('ResearchAvailabilityStateSchema includes RESEARCH_NOT_REQUESTED', () => {
    expect(ResearchAvailabilityStateSchema.safeParse('RESEARCH_NOT_REQUESTED').success).toBe(true)
  })

  it('high-risk C2 entry (medical/legal) → time_sensitive → requires research', () => {
    // Simulates: C2 kb-legal-001 has requires_web_validation=true and freshness=time_sensitive
    const researchState = mapC2RequiresWebValidationToResearchState(true)
    const claim = makeClaim('c-001', 'TO_VERIFY', 'time_sensitive', [], true)
    expect(researchState).toBe('RESEARCH_REQUIRED')
    expect(requiresResearchForClaim({ ...claim, status: 'SUPPORTED' })).toBe(true)
  })
})

// ── C3-UNIT-10 — RESEARCH_UNAVAILABLE does not silently become RESEARCH_AVAILABLE
describe('C3-UNIT-10 — RESEARCH_UNAVAILABLE does not silently become RESEARCH_AVAILABLE', () => {
  it('validateResearchUnavailableHonesty fails when state is RESEARCH_AVAILABLE', () => {
    // Simulates: someone set state=RESEARCH_AVAILABLE on an unavailable result
    const result = makeResult('RESEARCH_AVAILABLE', [], [], [], [])
    const check = validateResearchUnavailableHonesty(result)
    expect(check.honest).toBe(false)
    expect(check.reason).toContain('RESEARCH_AVAILABLE')
  })

  it('validateResearchUnavailableHonesty fails when non-UNAVAILABLE sources exist', () => {
    const sources = [makeSource('s-001', 'VERIFIED')]
    const result = makeResult('RESEARCH_UNAVAILABLE', sources, [], [], ['Supposed to be unavailable'])
    const check = validateResearchUnavailableHonesty({ ...result, freshness_gate: false })
    expect(check.honest).toBe(false)
    expect(check.reason).toContain('non-UNAVAILABLE')
  })

  it('isResearchUnavailable is consistent with state machine', () => {
    const states: import('../ResearchTruthContract').ResearchAvailabilityState[] = [
      'RESEARCH_NOT_REQUESTED',
      'RESEARCH_REQUIRED',
      'RESEARCH_AVAILABLE',
      'RESEARCH_PARTIAL',
      'RESEARCH_BLOCKED',
    ]
    states.forEach((state) => {
      const result = makeResult(state)
      expect(isResearchUnavailable(result)).toBe(false)
    })
  })

  it('all 7 ResearchAvailabilityState values are valid', () => {
    const states = [
      'RESEARCH_NOT_REQUESTED',
      'RESEARCH_REQUIRED',
      'RESEARCH_AVAILABLE',
      'RESEARCH_UNAVAILABLE',
      'RESEARCH_PARTIAL',
      'RESEARCH_FAILED',
      'RESEARCH_BLOCKED',
    ]
    states.forEach((s) => {
      expect(ResearchAvailabilityStateSchema.safeParse(s).success).toBe(true)
    })
  })
})
