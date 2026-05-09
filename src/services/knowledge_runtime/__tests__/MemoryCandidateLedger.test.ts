import { describe, expect, it } from 'vitest';
import { MemoryCandidateLedger } from '@/services/knowledge_runtime/MemoryCandidateLedger';
import type {
  GovernedRankedItem,
  KnowledgeSelectionVerdict,
} from '@/services/knowledge_runtime/KnowledgeRuntimeTypes';

function makeRankedItem(
  category: string,
  overrides: Partial<GovernedRankedItem> = {}
): GovernedRankedItem {
  return {
    entry: {
      id: category,
      category,
      version: 'v1',
      description: `${category} description`,
      content: {},
    },
    registry: {
      knowledgeId: category,
      category,
      title: category,
      domain: 'architecture',
      version: '1.0',
      sourceType: 'curated',
      sourceRef: null,
      url: null,
      lastReviewed: null,
      confidence: 0.85,
      freshness: 'stable',
      requiresWebValidation: false,
      riskLevel: 'low',
      allowedUse: [],
      notAllowedUse: [],
      validationStatus: 'curated',
      notes: null,
      metadataOrigin: 'indexed',
    },
    governanceAllowed: true,
    requiresResearch: false,
    freshnessRisk: 'none',
    usageWarnings: [],
    lexicalScore: 0.8,
    semanticScore: 0.6,
    finalScore: 0.78,
    authorityScore: 0.9,
    freshnessPenalty: 0,
    riskPenalty: 0,
    confusionPenalty: 0,
    ...overrides,
  };
}

describe('MemoryCandidateLedger', () => {
  it('ingests selected stable knowledge as candidates', () => {
    const ledger = new MemoryCandidateLedger();
    const verdict: KnowledgeSelectionVerdict = {
      selected: ['system_architecture'],
      deferred: [],
      blocked: [],
      researchRequired: [],
      conflicts: [],
      rationale: [],
    };

    const candidates = ledger.ingestSelectionVerdict(
      [makeRankedItem('system_architecture')],
      verdict,
      '2026-05-09T00:00:00.000Z'
    );

    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.probationStatus).toBe('candidate');
  });

  it('skips research-required knowledge', () => {
    const ledger = new MemoryCandidateLedger();
    const verdict: KnowledgeSelectionVerdict = {
      selected: ['bourse_trading'],
      deferred: [],
      blocked: [],
      researchRequired: ['bourse_trading'],
      conflicts: [],
      rationale: [],
    };

    const candidates = ledger.ingestSelectionVerdict(
      [makeRankedItem('bourse_trading', { requiresResearch: true })],
      verdict,
      '2026-05-09T00:00:00.000Z'
    );

    expect(candidates).toEqual([]);
  });

  it('promotes repeated structural candidates into probation/ready states', () => {
    const ledger = new MemoryCandidateLedger();
    const verdict: KnowledgeSelectionVerdict = {
      selected: ['workflow_strategy'],
      deferred: [],
      blocked: [],
      researchRequired: [],
      conflicts: [],
      rationale: [],
    };
    const item = makeRankedItem('workflow_strategy', {
      entry: {
        id: 'workflow_strategy',
        category: 'workflow_strategy',
        version: 'v1',
        description: 'workflow strategy',
        content: {},
      },
    });

    ledger.ingestSelectionVerdict([item], verdict, '2026-05-09T00:00:00.000Z');
    const second = ledger.ingestSelectionVerdict([item], verdict, '2026-05-10T00:00:00.000Z');

    expect(['probation', 'ready']).toContain(second[0]?.probationStatus ?? '');
  });
});
