import type {
  GovernedRankedItem,
  KnowledgeSelectionVerdict,
  MemoryCandidate,
  MemoryCandidateStructureType,
} from '@/services/knowledge_runtime/KnowledgeRuntimeTypes';
import { decideMemoryPromotion } from '@/services/knowledge_runtime/MemoryPromotionPolicy';

function makeCandidateId(
  category: string,
  structureType: MemoryCandidateStructureType
): string {
  return `memcand-${category}-${structureType}`;
}

function inferStructureType(item: GovernedRankedItem): MemoryCandidateStructureType {
  if (item.registry.freshness === 'time_sensitive') return 'temporal_fact';
  if (item.entry.category.includes('preference')) return 'preference';
  if (item.entry.category.includes('rule') || item.entry.category.includes('guideline')) {
    return 'rule';
  }
  if (
    item.entry.category.includes('strategy') ||
    item.entry.category.includes('workflow')
  ) {
    return 'heuristic';
  }
  return 'content';
}

function buildInitialCandidate(
  item: GovernedRankedItem,
  nowIso: string
): MemoryCandidate {
  const structureType = inferStructureType(item);
  return {
    id: makeCandidateId(item.entry.category, structureType),
    origin: 'kb_selection',
    knowledgeId: item.registry.knowledgeId,
    category: item.entry.category,
    content: item.entry.description,
    structureType,
    confidence: item.authorityScore,
    createdAt: nowIso,
    lastSeenAt: nowIso,
    usageCount: 1,
    stabilityScore: Number(Math.max(0, item.finalScore).toFixed(4)),
    contradictionFlag: false,
    probationStatus: 'candidate',
    expiresAt:
      structureType === 'temporal_fact'
        ? new Date(new Date(nowIso).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    supportingSignals: item.usageWarnings.slice(0, 4),
  };
}

export class MemoryCandidateLedger {
  private readonly candidates = new Map<string, MemoryCandidate>();

  upsertCandidate(candidate: MemoryCandidate): MemoryCandidate {
    const existing = this.candidates.get(candidate.id);
    if (!existing) {
      this.candidates.set(candidate.id, candidate);
      return candidate;
    }

    const next: MemoryCandidate = {
      ...existing,
      lastSeenAt: candidate.lastSeenAt,
      usageCount: existing.usageCount + 1,
      confidence: Math.max(existing.confidence, candidate.confidence),
      stabilityScore: Number(
        ((existing.stabilityScore + candidate.stabilityScore) / 2).toFixed(4)
      ),
      contradictionFlag: existing.contradictionFlag || candidate.contradictionFlag,
      supportingSignals: Array.from(
        new Set([...existing.supportingSignals, ...candidate.supportingSignals])
      ).slice(0, 6),
    };

    this.candidates.set(next.id, next);
    return next;
  }

  ingestSelectionVerdict(
    rankedItems: GovernedRankedItem[],
    verdict: KnowledgeSelectionVerdict,
    nowIso = new Date().toISOString()
  ): MemoryCandidate[] {
    const blocked = new Set(verdict.blocked);
    const conflicts = new Set(
      verdict.conflicts.flatMap(conflict => [
        conflict.leftKnowledgeId,
        conflict.rightKnowledgeId,
      ])
    );

    return rankedItems
      .filter(item => verdict.selected.includes(item.entry.category))
      .filter(item => !item.requiresResearch && !blocked.has(item.entry.category))
      .map(item => {
        const base = buildInitialCandidate(item, nowIso);
        const withConflicts: MemoryCandidate = {
          ...base,
          contradictionFlag: conflicts.has(item.entry.category),
        };
        const stored = this.upsertCandidate(withConflicts);
        const decision = decideMemoryPromotion(stored);
        const probationStatus =
          decision.action === 'promote'
            ? 'ready'
            : decision.action === 'enter_probation'
              ? 'probation'
              : decision.action === 'reject'
                ? 'rejected'
                : stored.probationStatus;
        const updated = { ...stored, probationStatus };
        this.candidates.set(updated.id, updated);
        return updated;
      });
  }

  listCandidates(): MemoryCandidate[] {
    return Array.from(this.candidates.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  getCandidate(id: string): MemoryCandidate | null {
    return this.candidates.get(id) ?? null;
  }

  clear(): void {
    this.candidates.clear();
  }
}
