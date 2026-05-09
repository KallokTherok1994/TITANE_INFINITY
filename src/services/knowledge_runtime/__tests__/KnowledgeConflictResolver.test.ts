import { describe, expect, it } from 'vitest';
import { detectKnowledgeConflicts } from '@/services/knowledge_runtime/KnowledgeConflictResolver';
import type { GovernedRankedItem } from '@/services/knowledge_runtime/KnowledgeRuntimeTypes';

function makeItem(
  category: string,
  overrides: Partial<GovernedRankedItem> = {}
): GovernedRankedItem {
  return {
    entry: {
      id: category,
      category,
      version: 'v1',
      description: category,
      content: {},
    },
    registry: {
      knowledgeId: category,
      category,
      title: category,
      domain: 'financial',
      version: '1.0',
      sourceType: 'curated',
      sourceRef: null,
      url: null,
      lastReviewed: null,
      confidence: 0.8,
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
    semanticScore: 0.5,
    finalScore: 0.7,
    authorityScore: 0.8,
    freshnessPenalty: 0,
    riskPenalty: 0,
    confusionPenalty: 0,
    ...overrides,
  };
}

describe('KnowledgeConflictResolver', () => {
  it('detects mixed-authority conflicts in the same family', () => {
    const conflicts = detectKnowledgeConflicts([
      makeItem('bourse_trading', { requiresResearch: true }),
      makeItem('bourse_trading_avance', { requiresResearch: false }),
    ]);

    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0]?.severity).toBe('medium');
  });

  it('blocks restricted mixed-authority conflicts', () => {
    const conflicts = detectKnowledgeConflicts([
      makeItem('medical_general', {
        requiresResearch: true,
        registry: {
          ...makeItem('medical_general').registry,
          domain: 'medical',
          riskLevel: 'restricted',
        },
      }),
      makeItem('medical_reference', {
        requiresResearch: false,
        registry: {
          ...makeItem('medical_reference').registry,
          domain: 'medical',
          riskLevel: 'restricted',
        },
      }),
    ]);

    expect(conflicts[0]?.blocking).toBe(true);
    expect(conflicts[0]?.severity).toBe('high');
  });
});
