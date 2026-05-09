import { describe, expect, it } from 'vitest';
import {
  buildKnowledgeSelectionVerdict,
  rerankKnowledgeCandidates,
} from '@/services/knowledge_runtime/KnowledgeRetrievalKernel';
import type { KnowledgeBaseEntry } from '@/services/api/defaultKnowledgeBase';

function entry(category: string, description: string): KnowledgeBaseEntry {
  return {
    id: category,
    category,
    version: 'v1',
    description,
    content: { description },
  };
}

describe('KnowledgeRetrievalKernel', () => {
  it('prefers stable authority over high-risk knowledge when lexical scores are close', async () => {
    const ranked = await rerankKnowledgeCandidates('architecture fiable titane', [
      {
        entry: entry('system_architecture', 'Architecture coeur TITANE fiable et stable'),
        lexicalScore: 12,
        excerpt: 'Architecture coeur TITANE fiable et stable',
      },
      {
        entry: entry('bourse_trading', 'Architecture de trading speculative'),
        lexicalScore: 13,
        excerpt: 'Architecture de trading speculative',
      },
    ]);

    expect(ranked[0]?.entry.category).toBe('system_architecture');
  });

  it('marks sensitive knowledge as research required in the verdict', async () => {
    const ranked = await rerankKnowledgeCandidates('conseil bourse aujourd hui', [
      {
        entry: entry('bourse_trading', 'Conseils de bourse et trading'),
        lexicalScore: 18,
        excerpt: 'Conseils de bourse et trading',
      },
    ]);

    const verdict = buildKnowledgeSelectionVerdict(ranked, 3);
    expect(verdict.researchRequired).toContain('bourse_trading');
  });

  it('can block high-severity conflicts from the final selection', async () => {
    const ranked = await rerankKnowledgeCandidates('medical advice now', [
      {
        entry: entry('medical_general', 'medical general current advice'),
        lexicalScore: 18,
        excerpt: 'medical general current advice',
      },
      {
        entry: entry('medical_reference', 'medical reference stable guide'),
        lexicalScore: 17,
        excerpt: 'medical reference stable guide',
      },
    ]);

    const forcedConflict = ranked.map((item, index) => ({
      ...item,
      requiresResearch: index === 0,
      registry: {
        ...item.registry,
        domain: 'medical',
        riskLevel: 'restricted',
      },
    }));

    const verdict = buildKnowledgeSelectionVerdict(forcedConflict, 3);
    expect(verdict.blocked.length).toBeGreaterThan(0);
    expect(verdict.conflicts.some(conflict => conflict.blocking)).toBe(true);
  });
});
