import type { KnowledgeBaseEntry } from '@/services/api/defaultKnowledgeBase';
import {
  buildKnowledgeEvidencePacket,
  qualifyKnowledgeEntries,
} from '@/services/knowledge_runtime/KnowledgeRuntimeKernel';
import { detectKnowledgeConflicts } from '@/services/knowledge_runtime/KnowledgeConflictResolver';
import type {
  GovernedRankedItem,
  KnowledgeEvidencePacket,
  KnowledgeSelectionVerdict,
} from '@/services/knowledge_runtime/KnowledgeRuntimeTypes';

interface RankedKnowledgeInput {
  entry: KnowledgeBaseEntry;
  lexicalScore: number;
  excerpt: string;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .filter(token => token.length >= 3);
}

function computeSemanticScore(query: string, entry: KnowledgeBaseEntry, excerpt: string): number {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return 0;

  const contentTokens = new Set(
    tokenize(`${entry.category} ${entry.description} ${excerpt}`).slice(0, 80)
  );
  if (contentTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of queryTokens) {
    if (contentTokens.has(token)) intersection++;
  }

  const union = new Set([...queryTokens, ...contentTokens]).size;
  return union === 0 ? 0 : Number((intersection / union).toFixed(4));
}

function computeAuthorityScore(item: Awaited<ReturnType<typeof qualifyKnowledgeEntries>>[number]): number {
  let score = item.registry.confidence;
  if (item.registry.validationStatus === 'curated') score += 0.1;
  if (item.registry.validationStatus === 'verified') score += 0.15;
  if (item.registry.metadataOrigin === 'synthetic') score -= 0.1;
  return Math.max(0, Math.min(1, Number(score.toFixed(4))));
}

function computeRiskPenalty(item: Awaited<ReturnType<typeof qualifyKnowledgeEntries>>[number]): number {
  switch (item.registry.riskLevel) {
    case 'restricted':
      return 0.35;
    case 'high':
      return 0.22;
    case 'medium':
      return 0.08;
    default:
      return 0;
  }
}

function computeFreshnessPenalty(item: Awaited<ReturnType<typeof qualifyKnowledgeEntries>>[number]): number {
  switch (item.registry.freshness) {
    case 'time_sensitive':
      return item.requiresResearch ? 0.2 : 0.08;
    case 'unknown':
      return 0.1;
    default:
      return 0;
  }
}

function computeConfusionPenalty(item: Awaited<ReturnType<typeof qualifyKnowledgeEntries>>[number]): number {
  let penalty = 0;
  if (item.registry.metadataOrigin === 'synthetic') penalty += 0.08;
  if (item.usageWarnings.length >= 3) penalty += 0.06;
  if (item.requiresResearch) penalty += 0.1;
  return Number(penalty.toFixed(4));
}

export async function rerankKnowledgeCandidates(
  query: string,
  candidates: RankedKnowledgeInput[]
): Promise<GovernedRankedItem[]> {
  const governed = await qualifyKnowledgeEntries(candidates.map(candidate => candidate.entry));
  const byCategory = new Map(governed.map(item => [item.entry.category, item]));

  const ranked: GovernedRankedItem[] = candidates
    .map(candidate => {
      const governedItem = byCategory.get(candidate.entry.category);
      if (!governedItem) {
        throw new Error(`Missing governed knowledge item for ${candidate.entry.category}`);
      }

      const semanticScore = computeSemanticScore(query, candidate.entry, candidate.excerpt);
      const authorityScore = computeAuthorityScore(governedItem);
      const freshnessPenalty = computeFreshnessPenalty(governedItem);
      const riskPenalty = computeRiskPenalty(governedItem);
      const confusionPenalty = computeConfusionPenalty(governedItem);
      const lexicalNormalized = Math.min(1, candidate.lexicalScore / 20);
      const finalScore = Number(
        (
          lexicalNormalized * 0.45 +
          semanticScore * 0.25 +
          authorityScore * 0.3 -
          freshnessPenalty -
          riskPenalty -
          confusionPenalty
        ).toFixed(4)
      );

      return {
        ...governedItem,
        lexicalScore: Number(lexicalNormalized.toFixed(4)),
        semanticScore,
        authorityScore,
        freshnessPenalty,
        riskPenalty,
        confusionPenalty,
        finalScore,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore || a.entry.category.localeCompare(b.entry.category));

  return ranked;
}

export function buildKnowledgeSelectionVerdict(
  rankedItems: GovernedRankedItem[],
  limit: number
): KnowledgeSelectionVerdict {
  const conflicts = detectKnowledgeConflicts(rankedItems);
  const blockedByConflict = new Set(
    conflicts.filter(conflict => conflict.blocking).flatMap(conflict => [
      conflict.leftKnowledgeId,
      conflict.rightKnowledgeId,
    ])
  );

  const selected: string[] = [];
  const deferred: string[] = [];
  const blocked: string[] = [];
  const researchRequired: string[] = [];
  const rationale: string[] = [];

  for (const item of rankedItems) {
    const id = item.entry.category;
    if (blockedByConflict.has(id)) {
      blocked.push(id);
      rationale.push(`${id}: blocked by high-severity conflict`);
      continue;
    }
    if (item.requiresResearch) {
      researchRequired.push(id);
    }
    if (item.finalScore > 0 && selected.length < Math.max(1, limit)) {
      selected.push(id);
      rationale.push(
        `${id}: selected (score=${item.finalScore.toFixed(2)}, authority=${item.authorityScore.toFixed(2)})`
      );
    } else {
      deferred.push(id);
      rationale.push(`${id}: deferred (score=${item.finalScore.toFixed(2)})`);
    }
  }

  return {
    selected,
    deferred,
    blocked,
    researchRequired,
    conflicts,
    rationale,
  };
}

export function buildSelectionEvidencePacket(
  rankedItems: GovernedRankedItem[],
  verdict: KnowledgeSelectionVerdict
): KnowledgeEvidencePacket {
  const selectedMatches = rankedItems.filter(item => verdict.selected.includes(item.entry.category));
  const packet = buildKnowledgeEvidencePacket(selectedMatches);
  return {
    ...packet,
    blockedClaims: [
      ...packet.blockedClaims,
      ...verdict.blocked.map(item => `${item}: blocked by governed conflict`),
    ],
    selectionRationale: verdict.rationale,
  };
}
