import { describe, it, expect } from 'vitest'
import {
  KnowledgeSourceAttributionSchema,
  KnowledgeConfidenceSchema,
  StalenessSignalSchema,
  GovernedKnowledgeItemSchema,
  C2KnowledgeGovernanceContractSchema,
  computeCompositeConfidence,
  classifyConfidenceTier,
  buildKnowledgeConfidence,
  computeStalenessSignal,
  freshnessFromAge,
  applyGovernanceGate,
  getC2KnowledgeGovernanceContract,
  KnowledgeItemMetadataSchema,
  KnowledgeGovernanceIndexSchema,
  requiresWebValidationForTimeSensitive,
  publicSourceCannotBeVerifiedWithoutEvidence,
  unknownSourceCannotBeHighConfidence,
  highRiskDomainRequiresNotAllowedUse,
  generatedSourceCannotBeVerifiedWithoutReview,
  spiritualSymbolicIsInterpretive,
  governanceIndexContainsRequiredDomains,
  HIGH_RISK_DOMAINS,
  REQUIRED_GOVERNANCE_DOMAINS,
} from '../KnowledgeGovernanceContract'

const NOW = '2026-05-06T10:00:00.000Z'

// ── KnowledgeSourceAttributionSchema ───────────────────────────────────────────
describe('KnowledgeSourceAttributionSchema', () => {
  const validAttribution = {
    source_id: 'src-001',
    source_type: 'ltm_retrieval' as const,
    source_uri: null,
    retrieval_timestamp: NOW,
    retrieval_method: 'semantic_search' as const,
    session_id: 'sess-001',
  }

  it('validates a valid attribution', () => {
    expect(KnowledgeSourceAttributionSchema.safeParse(validAttribution).success).toBe(true)
  })

  it('rejects unknown source_type', () => {
    expect(
      KnowledgeSourceAttributionSchema.safeParse({
        ...validAttribution,
        source_type: 'alien_db',
      }).success,
    ).toBe(false)
  })

  it('rejects unknown retrieval_method', () => {
    expect(
      KnowledgeSourceAttributionSchema.safeParse({
        ...validAttribution,
        retrieval_method: 'quantum_search',
      }).success,
    ).toBe(false)
  })

  it('accepts all valid source_types', () => {
    const types = [
      'user_conversation',
      'ltm_retrieval',
      'rag_document',
      'web_enrichment',
      'ollama_inference',
      'gemini_inference',
      'system_config',
      'knowledge_graph',
      'unknown',
    ] as const
    for (const t of types) {
      expect(
        KnowledgeSourceAttributionSchema.safeParse({ ...validAttribution, source_type: t }).success,
      ).toBe(true)
    }
  })
})

// ── KnowledgeConfidenceSchema ───────────────────────────────────────────────────
describe('KnowledgeConfidenceSchema', () => {
  const validConf = {
    dimensions: {
      source_reliability: 0.75,
      retrieval_relevance: 0.85,
      freshness: 0.9,
      cross_source_consistency: 1.0,
    },
    composite_score: 0.855,
    confidence_tier: 'high' as const,
  }

  it('validates a valid confidence', () => {
    expect(KnowledgeConfidenceSchema.safeParse(validConf).success).toBe(true)
  })

  it('rejects score > 1', () => {
    expect(KnowledgeConfidenceSchema.safeParse({ ...validConf, composite_score: 1.5 }).success).toBe(false)
  })

  it('rejects score < 0', () => {
    expect(KnowledgeConfidenceSchema.safeParse({ ...validConf, composite_score: -0.1 }).success).toBe(false)
  })

  it('rejects invalid confidence_tier', () => {
    expect(
      KnowledgeConfidenceSchema.safeParse({ ...validConf, confidence_tier: 'excellent' }).success,
    ).toBe(false)
  })
})

// ── computeCompositeConfidence ──────────────────────────────────────────────────
describe('computeCompositeConfidence', () => {
  it('computes correct composite for known input', () => {
    const score = computeCompositeConfidence({
      source_reliability: 1.0,
      retrieval_relevance: 1.0,
      freshness: 1.0,
      cross_source_consistency: 1.0,
    })
    expect(score).toBeCloseTo(1.0, 5)
  })

  it('returns 0 for all-zero dimensions', () => {
    const score = computeCompositeConfidence({
      source_reliability: 0,
      retrieval_relevance: 0,
      freshness: 0,
      cross_source_consistency: 0,
    })
    expect(score).toBe(0)
  })

  it('weights relevance highest (0.4)', () => {
    const scoreA = computeCompositeConfidence({
      source_reliability: 0,
      retrieval_relevance: 1.0,
      freshness: 0,
      cross_source_consistency: 0,
    })
    const scoreB = computeCompositeConfidence({
      source_reliability: 1.0,
      retrieval_relevance: 0,
      freshness: 0,
      cross_source_consistency: 0,
    })
    expect(scoreA).toBeGreaterThan(scoreB)
  })
})

// ── classifyConfidenceTier ──────────────────────────────────────────────────────
describe('classifyConfidenceTier', () => {
  it('returns high for >= 0.75', () => {
    expect(classifyConfidenceTier(0.75)).toBe('high')
    expect(classifyConfidenceTier(1.0)).toBe('high')
  })

  it('returns medium for [0.5, 0.75)', () => {
    expect(classifyConfidenceTier(0.5)).toBe('medium')
    expect(classifyConfidenceTier(0.74)).toBe('medium')
  })

  it('returns low for [0.25, 0.5)', () => {
    expect(classifyConfidenceTier(0.25)).toBe('low')
    expect(classifyConfidenceTier(0.49)).toBe('low')
  })

  it('returns unverified for < 0.25', () => {
    expect(classifyConfidenceTier(0.0)).toBe('unverified')
    expect(classifyConfidenceTier(0.24)).toBe('unverified')
  })
})

// ── buildKnowledgeConfidence ────────────────────────────────────────────────────
describe('buildKnowledgeConfidence', () => {
  it('system_config has highest source_reliability', () => {
    const conf = buildKnowledgeConfidence('system_config', 1.0, 1.0)
    expect(conf.dimensions.source_reliability).toBe(0.95)
  })

  it('unknown source has lowest source_reliability', () => {
    const conf = buildKnowledgeConfidence('unknown', 1.0, 1.0)
    expect(conf.dimensions.source_reliability).toBe(0.1)
  })

  it('clamps retrieval_relevance to [0,1]', () => {
    const conf = buildKnowledgeConfidence('ltm_retrieval', 1.5, 0.5)
    expect(conf.dimensions.retrieval_relevance).toBe(1.0)
  })

  it('returns correct confidence_tier', () => {
    const high = buildKnowledgeConfidence('system_config', 1.0, 1.0)
    expect(high.confidence_tier).toBe('high')
    const low = buildKnowledgeConfidence('unknown', 0.1, 0.1)
    expect(low.confidence_tier).toBe('unverified')
  })
})

// ── computeStalenessSignal ──────────────────────────────────────────────────────
describe('computeStalenessSignal', () => {
  it('returns none risk for fresh non-temporal content', () => {
    const signal = computeStalenessSignal(0, false)
    expect(signal.staleness_risk).toBe('none')
    expect(signal.mitigation).toBeNull()
  })

  it('returns critical for very stale + temporal query', () => {
    const signal = computeStalenessSignal(200, true)
    expect(signal.staleness_risk).toBe('critical')
    expect(signal.mitigation).not.toBeNull()
  })

  it('returns high for very stale + non-temporal', () => {
    const signal = computeStalenessSignal(200, false)
    expect(signal.staleness_risk).toBe('high')
  })

  it('age_days is preserved', () => {
    const signal = computeStalenessSignal(42, false)
    expect(signal.age_days).toBe(42)
  })

  it('records cutoff_date when provided', () => {
    const signal = computeStalenessSignal(5, false, '2026-01-01T00:00:00.000Z')
    expect(signal.has_cutoff_date).toBe(true)
    expect(signal.cutoff_date).toBe('2026-01-01T00:00:00.000Z')
  })

  it('temporal query with medium age → high risk', () => {
    const signal = computeStalenessSignal(61, true)
    expect(signal.staleness_risk).toBe('high')
  })
})

// ── freshnessFromAge ────────────────────────────────────────────────────────────
describe('freshnessFromAge', () => {
  it('returns 1.0 for age=0', () => {
    expect(freshnessFromAge(0)).toBe(1.0)
  })

  it('returns 0 for age >= STALENESS_MAX_DAYS (180)', () => {
    expect(freshnessFromAge(180)).toBe(0)
    expect(freshnessFromAge(999)).toBe(0)
  })

  it('returns intermediate value for age=90', () => {
    const f = freshnessFromAge(90)
    expect(f).toBeGreaterThan(0)
    expect(f).toBeLessThan(1)
  })
})

// ── applyGovernanceGate ─────────────────────────────────────────────────────────
describe('applyGovernanceGate', () => {
  it('returns true when composite >= default threshold (0.4)', () => {
    const conf = buildKnowledgeConfidence('ltm_retrieval', 0.8, 0.8)
    expect(applyGovernanceGate(conf)).toBe(true)
  })

  it('returns false when composite < threshold', () => {
    const conf = buildKnowledgeConfidence('unknown', 0.0, 0.0)
    expect(applyGovernanceGate(conf)).toBe(false)
  })

  it('custom threshold respected', () => {
    const conf = buildKnowledgeConfidence('ollama_inference', 0.5, 0.8)
    expect(applyGovernanceGate(conf, 0.9)).toBe(false)
  })
})

// ── StalenessSignalSchema ───────────────────────────────────────────────────────
describe('StalenessSignalSchema', () => {
  it('validates a valid staleness signal', () => {
    const result = StalenessSignalSchema.safeParse({
      age_days: 30,
      has_cutoff_date: false,
      cutoff_date: null,
      is_temporal_query: false,
      staleness_risk: 'low',
      mitigation: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects negative age_days', () => {
    const result = StalenessSignalSchema.safeParse({
      age_days: -1,
      has_cutoff_date: false,
      cutoff_date: null,
      is_temporal_query: false,
      staleness_risk: 'none',
      mitigation: null,
    })
    expect(result.success).toBe(false)
  })
})

// ── getC2KnowledgeGovernanceContract ───────────────────────────────────────────
describe('getC2KnowledgeGovernanceContract', () => {
  it('parses with C2KnowledgeGovernanceContractSchema', () => {
    const contract = getC2KnowledgeGovernanceContract()
    expect(C2KnowledgeGovernanceContractSchema.safeParse(contract).success).toBe(true)
  })

  it('lock must be C2', () => {
    expect(getC2KnowledgeGovernanceContract().lock).toBe('C2')
  })

  it('tier must be T2', () => {
    expect(getC2KnowledgeGovernanceContract().tier).toBe('T2')
  })

  it('addresses drift CD-04', () => {
    const contract = getC2KnowledgeGovernanceContract()
    expect(contract.drift_addressed).toContain('CD-04')
  })

  it('governance_threshold_default is 0.4', () => {
    expect(getC2KnowledgeGovernanceContract().governance_threshold_default).toBe(0.4)
  })
})

// ── GovernedKnowledgeItemSchema ─────────────────────────────────────────────────
describe('GovernedKnowledgeItemSchema', () => {
  const validItem = {
    item_id: '550e8400-e29b-41d4-a716-446655440100',
    content: 'Paris is the capital of France',
    attribution: {
      source_id: 'doc-001',
      source_type: 'rag_document' as const,
      source_uri: null,
      retrieval_timestamp: NOW,
      retrieval_method: 'hybrid' as const,
      session_id: null,
    },
    confidence: {
      dimensions: {
        source_reliability: 0.8,
        retrieval_relevance: 0.95,
        freshness: 0.9,
        cross_source_consistency: 0.85,
      },
      composite_score: 0.88,
      confidence_tier: 'high' as const,
    },
    staleness: {
      age_days: 5,
      has_cutoff_date: false,
      cutoff_date: null,
      is_temporal_query: false,
      staleness_risk: 'none' as const,
      mitigation: null,
    },
    governance_passed: true,
    governance_threshold: 0.4,
  }

  it('validates a complete governed knowledge item', () => {
    expect(GovernedKnowledgeItemSchema.safeParse(validItem).success).toBe(true)
  })

  it('rejects item with empty content', () => {
    expect(GovernedKnowledgeItemSchema.safeParse({ ...validItem, content: '' }).success).toBe(false)
  })

  it('rejects governance_threshold > 1', () => {
    expect(GovernedKnowledgeItemSchema.safeParse({ ...validItem, governance_threshold: 1.5 }).success).toBe(false)
  })
})

// ── C2-UNIT-01 — Knowledge governance metadata schema validates a valid entry ──
describe('C2-UNIT-01 — KnowledgeItemMetadataSchema validates a valid entry', () => {
  const validMeta = {
    knowledge_id: 'kb-arch-001',
    title: 'Software Architecture Patterns',
    domain: 'architecture',
    version: '1.0',
    source_type: 'curated',
    source_ref: 'internal-docs',
    url: null,
    last_reviewed: '2026-05-06',
    confidence: 0.85,
    freshness: 'stable',
    requires_web_validation: false,
    risk_level: 'low',
    allowed_use: ['design_guidance', 'documentation'],
    not_allowed_use: [],
    validation_status: 'curated',
    notes: null,
  }

  it('accepts a fully valid metadata entry', () => {
    expect(KnowledgeItemMetadataSchema.safeParse(validMeta).success).toBe(true)
  })

  it('rejects missing knowledge_id', () => {
    const { knowledge_id: _, ...rest } = validMeta
    expect(KnowledgeItemMetadataSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects invalid domain', () => {
    expect(KnowledgeItemMetadataSchema.safeParse({ ...validMeta, domain: 'alien' }).success).toBe(false)
  })

  it('accepts all validation_status values', () => {
    const statuses = ['verified', 'curated', 'to_verify', 'outdated', 'rejected', 'unknown']
    for (const vs of statuses) {
      expect(KnowledgeItemMetadataSchema.safeParse({ ...validMeta, validation_status: vs }).success).toBe(true)
    }
  })

  it('rejects confidence > 1', () => {
    expect(KnowledgeItemMetadataSchema.safeParse({ ...validMeta, confidence: 1.5 }).success).toBe(false)
  })

  it('KnowledgeGovernanceIndexSchema validates a complete index', () => {
    const index = {
      schema_version: 'C2-v1',
      generated_at: '2026-05-06T00:00:00.000Z',
      lock: 'C2',
      entries: [validMeta],
    }
    expect(KnowledgeGovernanceIndexSchema.safeParse(index).success).toBe(true)
  })
})

// ── C2-UNIT-02 — time_sensitive knowledge requires web validation ────────────
describe('C2-UNIT-02 — time_sensitive knowledge requires web_validation', () => {
  it('time_sensitive + requires_web_validation=true is compliant', () => {
    expect(requiresWebValidationForTimeSensitive({
      freshness: 'time_sensitive',
      requires_web_validation: true,
    })).toBe(true)
  })

  it('time_sensitive + requires_web_validation=false is non-compliant', () => {
    expect(requiresWebValidationForTimeSensitive({
      freshness: 'time_sensitive',
      requires_web_validation: false,
    })).toBe(false)
  })

  it('stable freshness passes regardless of requires_web_validation', () => {
    expect(requiresWebValidationForTimeSensitive({
      freshness: 'stable',
      requires_web_validation: false,
    })).toBe(true)
  })

  it('unknown freshness passes regardless of requires_web_validation', () => {
    expect(requiresWebValidationForTimeSensitive({
      freshness: 'unknown',
      requires_web_validation: false,
    })).toBe(true)
  })
})

// ── C2-UNIT-03 — public knowledge without URL/date cannot be VERIFIED ─────────
describe('C2-UNIT-03 — public source without evidence cannot be verified', () => {
  it('public + verified + url present is compliant', () => {
    expect(publicSourceCannotBeVerifiedWithoutEvidence({
      source_type: 'public',
      validation_status: 'verified',
      url: 'https://example.com',
      last_reviewed: null,
    })).toBe(true)
  })

  it('public + verified + last_reviewed present is compliant', () => {
    expect(publicSourceCannotBeVerifiedWithoutEvidence({
      source_type: 'public',
      validation_status: 'verified',
      url: null,
      last_reviewed: '2026-05-06',
    })).toBe(true)
  })

  it('public + verified + no URL/date is non-compliant', () => {
    expect(publicSourceCannotBeVerifiedWithoutEvidence({
      source_type: 'public',
      validation_status: 'verified',
      url: null,
      last_reviewed: null,
    })).toBe(false)
  })

  it('public + to_verify + no URL/date is compliant (not claiming verified)', () => {
    expect(publicSourceCannotBeVerifiedWithoutEvidence({
      source_type: 'public',
      validation_status: 'to_verify',
      url: null,
      last_reviewed: null,
    })).toBe(true)
  })

  it('curated source with no URL is compliant (not public)', () => {
    expect(publicSourceCannotBeVerifiedWithoutEvidence({
      source_type: 'curated',
      validation_status: 'verified',
      url: null,
      last_reviewed: null,
    })).toBe(true)
  })
})

// ── C2-UNIT-04 — unknown source_type cannot have high confidence ───────────────
describe('C2-UNIT-04 — unknown source_type cannot be high confidence', () => {
  it('unknown + confidence=0.9 is non-compliant', () => {
    expect(unknownSourceCannotBeHighConfidence({
      source_type: 'unknown',
      confidence: 0.9,
    })).toBe(false)
  })

  it('unknown + confidence=0.75 (boundary) is non-compliant', () => {
    expect(unknownSourceCannotBeHighConfidence({
      source_type: 'unknown',
      confidence: 0.75,
    })).toBe(false)
  })

  it('unknown + confidence=0.74 is compliant', () => {
    expect(unknownSourceCannotBeHighConfidence({
      source_type: 'unknown',
      confidence: 0.74,
    })).toBe(true)
  })

  it('curated + confidence=0.9 is compliant', () => {
    expect(unknownSourceCannotBeHighConfidence({
      source_type: 'curated',
      confidence: 0.9,
    })).toBe(true)
  })
})

// ── C2-UNIT-05 — legal/medical/financial/safety require not_allowed_use ────────
describe('C2-UNIT-05 — high-risk domains require not_allowed_use boundaries', () => {
  it('HIGH_RISK_DOMAINS includes legal, medical, financial, safety', () => {
    expect(HIGH_RISK_DOMAINS.has('legal')).toBe(true)
    expect(HIGH_RISK_DOMAINS.has('medical')).toBe(true)
    expect(HIGH_RISK_DOMAINS.has('financial')).toBe(true)
    expect(HIGH_RISK_DOMAINS.has('safety')).toBe(true)
  })

  it('legal domain without not_allowed_use is non-compliant', () => {
    expect(highRiskDomainRequiresNotAllowedUse({
      domain: 'legal',
      not_allowed_use: [],
    })).toBe(false)
  })

  it('medical domain with not_allowed_use declared is compliant', () => {
    expect(highRiskDomainRequiresNotAllowedUse({
      domain: 'medical',
      not_allowed_use: ['definitive_diagnosis', 'treatment_prescription'],
    })).toBe(true)
  })

  it('architecture domain without not_allowed_use is compliant (not high-risk)', () => {
    expect(highRiskDomainRequiresNotAllowedUse({
      domain: 'architecture',
      not_allowed_use: [],
    })).toBe(true)
  })
})

// ── C2-UNIT-06 — generated source cannot be verified without review marker ─────
describe('C2-UNIT-06 — generated source cannot be verified without review', () => {
  it('generated + verified + notes includes "review" is compliant', () => {
    expect(generatedSourceCannotBeVerifiedWithoutReview({
      source_type: 'generated',
      validation_status: 'verified',
      notes: 'human review completed 2026-05-06',
    })).toBe(true)
  })

  it('generated + verified + no notes is non-compliant', () => {
    expect(generatedSourceCannotBeVerifiedWithoutReview({
      source_type: 'generated',
      validation_status: 'verified',
      notes: null,
    })).toBe(false)
  })

  it('generated + to_verify + no notes is compliant (not claiming verified)', () => {
    expect(generatedSourceCannotBeVerifiedWithoutReview({
      source_type: 'generated',
      validation_status: 'to_verify',
      notes: null,
    })).toBe(true)
  })

  it('curated + verified + no notes is compliant (not generated)', () => {
    expect(generatedSourceCannotBeVerifiedWithoutReview({
      source_type: 'curated',
      validation_status: 'verified',
      notes: null,
    })).toBe(true)
  })
})

// ── C2-UNIT-07 — spiritual_symbolic is interpretive, not factual-certainty ──────
describe('C2-UNIT-07 — spiritual_symbolic domain is interpretive', () => {
  it('spiritual_symbolic + verified is non-compliant (factual certainty claim)', () => {
    expect(spiritualSymbolicIsInterpretive({
      domain: 'spiritual_symbolic',
      validation_status: 'verified',
    })).toBe(false)
  })

  it('spiritual_symbolic + curated is compliant', () => {
    expect(spiritualSymbolicIsInterpretive({
      domain: 'spiritual_symbolic',
      validation_status: 'curated',
    })).toBe(true)
  })

  it('spiritual_symbolic + to_verify is compliant', () => {
    expect(spiritualSymbolicIsInterpretive({
      domain: 'spiritual_symbolic',
      validation_status: 'to_verify',
    })).toBe(true)
  })

  it('architecture domain can be verified (not spiritual_symbolic)', () => {
    expect(spiritualSymbolicIsInterpretive({
      domain: 'architecture',
      validation_status: 'verified',
    })).toBe(true)
  })
})

// ── C2-UNIT-08 — governance index contains required top-level domains ──────────
describe('C2-UNIT-08 — governance index covers required domains', () => {
  const makeDomainEntries = (domains: string[]) =>
    domains.map((d) => ({ domain: d as never }))

  it('REQUIRED_GOVERNANCE_DOMAINS includes all 8 required domains', () => {
    const required = [
      'architecture',
      'memory',
      'knowledge',
      'safety',
      'legal',
      'medical',
      'financial',
      'spiritual_symbolic',
    ]
    for (const d of required) {
      expect(REQUIRED_GOVERNANCE_DOMAINS.has(d as never)).toBe(true)
    }
  })

  it('index with all required domains passes', () => {
    const entries = makeDomainEntries([
      'architecture', 'memory', 'knowledge', 'safety',
      'legal', 'medical', 'financial', 'spiritual_symbolic',
    ])
    expect(governanceIndexContainsRequiredDomains(entries)).toBe(true)
  })

  it('index missing "medical" fails', () => {
    const entries = makeDomainEntries([
      'architecture', 'memory', 'knowledge', 'safety',
      'legal', 'financial', 'spiritual_symbolic',
    ])
    expect(governanceIndexContainsRequiredDomains(entries)).toBe(false)
  })

  it('empty index fails', () => {
    expect(governanceIndexContainsRequiredDomains([])).toBe(false)
  })

  it('index with extra domains still passes if required are present', () => {
    const entries = makeDomainEntries([
      'architecture', 'memory', 'knowledge', 'safety',
      'legal', 'medical', 'financial', 'spiritual_symbolic',
      'unknown', 'agents', 'omega',
    ])
    expect(governanceIndexContainsRequiredDomains(entries)).toBe(true)
  })
})
