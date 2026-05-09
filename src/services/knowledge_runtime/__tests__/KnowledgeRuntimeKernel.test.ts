import { describe, expect, it } from 'vitest';
import {
  buildKnowledgeEvidencePacket,
  qualifyKnowledgeEntries,
} from '@/services/knowledge_runtime/KnowledgeRuntimeKernel';
import type { KnowledgeBaseEntry } from '@/services/api/defaultKnowledgeBase';

describe('KnowledgeRuntimeKernel', () => {
  it('keeps stable low-risk knowledge without research requirement', async () => {
    const entries: KnowledgeBaseEntry[] = [
      {
        id: 'system_architecture',
        category: 'system_architecture',
        version: 'v30.0.0',
        description: 'Architecture cœur TITANE∞',
        content: { rings: 4 },
      },
    ];

    const matches = await qualifyKnowledgeEntries(entries);

    expect(matches[0]?.requiresResearch).toBe(false);
    expect(matches[0]?.freshnessRisk).toBe('none');
  });

  it('marks high-risk time-sensitive knowledge as research required', async () => {
    const entries: KnowledgeBaseEntry[] = [
      {
        id: 'bourse_trading',
        category: 'bourse_trading',
        version: 'v30.0.0',
        description: 'Notions de bourse et trading',
        content: { markets: true },
      },
    ];

    const matches = await qualifyKnowledgeEntries(entries);

    expect(matches[0]?.requiresResearch).toBe(true);
    expect(['high', 'critical']).toContain(matches[0]?.freshnessRisk ?? '');
  });

  it('surfaces warnings for synthetic unqualified metadata', async () => {
    const entries: KnowledgeBaseEntry[] = [
      {
        id: 'chronobiologie_rythmes',
        category: 'chronobiologie_rythmes',
        version: 'v30.0.0',
        description: 'Chronobiologie',
        content: { rhythm: true },
      },
    ];

    const matches = await qualifyKnowledgeEntries(entries);

    expect(matches[0]?.usageWarnings.some(w => w.includes('metadata synthesized'))).toBe(
      true
    );
  });

  it('builds an evidence packet separating stable and research-required knowledge', async () => {
    const entries: KnowledgeBaseEntry[] = [
      {
        id: 'system_architecture',
        category: 'system_architecture',
        version: 'v30.0.0',
        description: 'Architecture cœur TITANE∞',
        content: { rings: 4 },
      },
      {
        id: 'bourse_trading',
        category: 'bourse_trading',
        version: 'v30.0.0',
        description: 'Notions de bourse et trading',
        content: { markets: true },
      },
    ];

    const packet = buildKnowledgeEvidencePacket(await qualifyKnowledgeEntries(entries));

    expect(
      packet.stableKnowledge.some(item => item.includes('system_architecture'))
    ).toBe(true);
    expect(
      packet.researchRequiredKnowledge.some(item => item.includes('bourse_trading'))
    ).toBe(true);
    expect(packet.blockedClaims.length).toBeGreaterThan(0);
  });
});
