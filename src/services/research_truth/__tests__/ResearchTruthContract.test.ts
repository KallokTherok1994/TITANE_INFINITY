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
