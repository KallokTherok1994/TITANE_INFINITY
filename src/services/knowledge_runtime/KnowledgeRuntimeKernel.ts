import type { KnowledgeBaseEntry } from '@/services/api/defaultKnowledgeBase';
import {
  getKnowledgeRegistryEntryByCategory,
} from '@/services/knowledge_runtime/KnowledgeRegistry';
import type {
  GovernedKnowledgeMatch,
  KnowledgeEvidencePacket,
  ResearchGateDecision,
} from '@/services/knowledge_runtime/KnowledgeRuntimeTypes';

function buildResearchGateDecision(
  domain: GovernedKnowledgeMatch['registry']['domain'],
  freshness: GovernedKnowledgeMatch['registry']['freshness'],
  requiresWebValidation: boolean
): ResearchGateDecision {
  if (!requiresWebValidation) {
    return { state: 'NOT_NEEDED', reason: 'Stable or low-risk knowledge.', blocking: false };
  }

  if (freshness === 'time_sensitive') {
    return {
      state: 'REQUIRED',
      reason: `Domain ${domain} is time-sensitive and requires web validation.`,
      blocking: true,
    };
  }

  return {
    state: 'REQUIRED',
    reason: `Domain ${domain} is high-risk and requires web validation.`,
    blocking: true,
  };
}

function deriveFreshnessRisk(
  match: Pick<GovernedKnowledgeMatch, 'registry' | 'requiresResearch'>
): GovernedKnowledgeMatch['freshnessRisk'] {
  if (match.requiresResearch && match.registry.riskLevel === 'restricted') return 'critical';
  if (match.requiresResearch) return 'high';
  if (match.registry.freshness === 'time_sensitive') return 'medium';
  if (match.registry.freshness === 'unknown') return 'low';
  return 'none';
}

function buildWarnings(
  registry: GovernedKnowledgeMatch['registry'],
  researchGate: ResearchGateDecision
): string[] {
  const warnings: string[] = [];
  if (registry.metadataOrigin === 'synthetic') {
    warnings.push('metadata synthesized at runtime');
  }
  if (registry.validationStatus === 'unknown') {
    warnings.push('validation status unknown');
  }
  if (researchGate.state === 'REQUIRED') {
    warnings.push('research required before definitive use');
  }
  if (registry.notAllowedUse.length > 0) {
    warnings.push(`not allowed use: ${registry.notAllowedUse.join(', ')}`);
  }
  return warnings;
}

export async function qualifyKnowledgeEntries(
  entries: KnowledgeBaseEntry[]
): Promise<GovernedKnowledgeMatch[]> {
  const matches = await Promise.all(
    entries.map(async entry => {
      const registry =
        (await getKnowledgeRegistryEntryByCategory(entry.category)) ??
        (await getKnowledgeRegistryEntryByCategory(entry.id));

      if (!registry) {
        throw new Error(`Missing registry entry for knowledge category "${entry.category}"`);
      }

      const researchGate = buildResearchGateDecision(
        registry.domain,
        registry.freshness,
        registry.requiresWebValidation
      );

      const provisional: GovernedKnowledgeMatch = {
        entry,
        registry,
        governanceAllowed: true,
        requiresResearch: researchGate.state === 'REQUIRED',
        freshnessRisk: 'none',
        usageWarnings: [],
      };

      const freshnessRisk = deriveFreshnessRisk(provisional);
      const usageWarnings = buildWarnings(registry, researchGate);

      return {
        ...provisional,
        freshnessRisk,
        usageWarnings,
      };
    })
  );

  return matches;
}

export function buildKnowledgeEvidencePacket(
  matches: GovernedKnowledgeMatch[]
): KnowledgeEvidencePacket {
  const stableKnowledge: string[] = [];
  const researchRequiredKnowledge: string[] = [];
  const warnings = new Set<string>();
  const blockedClaims: string[] = [];

  for (const match of matches) {
    const summary = `${match.entry.category} [${match.registry.validationStatus}/${match.registry.freshness}/${match.registry.riskLevel}]`;
    if (match.requiresResearch) {
      researchRequiredKnowledge.push(summary);
      blockedClaims.push(`${match.entry.category}: research required before definitive use`);
    } else {
      stableKnowledge.push(summary);
    }
    for (const warning of match.usageWarnings) {
      warnings.add(`${match.entry.category}: ${warning}`);
    }
  }

  return {
    stableKnowledge,
    researchRequiredKnowledge,
    warnings: Array.from(warnings),
    blockedClaims,
  };
}
