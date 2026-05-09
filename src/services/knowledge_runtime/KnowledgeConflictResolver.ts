import type {
  GovernedRankedItem,
  KnowledgeConflict,
} from '@/services/knowledge_runtime/KnowledgeRuntimeTypes';

function sameDomainFamily(left: GovernedRankedItem, right: GovernedRankedItem): boolean {
  if (left.registry.domain === right.registry.domain) return true;
  const leftPrefix = left.entry.category.split('_').slice(0, 2).join('_');
  const rightPrefix = right.entry.category.split('_').slice(0, 2).join('_');
  return leftPrefix.length > 0 && leftPrefix === rightPrefix;
}

export function detectKnowledgeConflicts(
  items: GovernedRankedItem[]
): KnowledgeConflict[] {
  const conflicts: KnowledgeConflict[] = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const left = items[i];
      const right = items[j];
      if (!left || !right || !sameDomainFamily(left, right)) continue;

      if (left.requiresResearch !== right.requiresResearch) {
        const highRisk =
          left.registry.riskLevel === 'restricted' ||
          right.registry.riskLevel === 'restricted';
        conflicts.push({
          leftKnowledgeId: left.entry.category,
          rightKnowledgeId: right.entry.category,
          severity: highRisk ? 'high' : 'medium',
          reason:
            'Mixed authority within the same knowledge family: one item requires fresh research while the other does not.',
          blocking: highRisk,
        });
        continue;
      }

      if (
        left.registry.validationStatus !== right.registry.validationStatus &&
        (left.registry.validationStatus === 'unknown' ||
          right.registry.validationStatus === 'unknown')
      ) {
        conflicts.push({
          leftKnowledgeId: left.entry.category,
          rightKnowledgeId: right.entry.category,
          severity: 'low',
          reason: 'Validation status diverges within the same knowledge family.',
          blocking: false,
        });
      }
    }
  }

  return conflicts;
}
