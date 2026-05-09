import governanceIndexRaw from '../../../data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json';
import {
  KnowledgeGovernanceIndexSchema,
  type KnowledgeDomain,
  type KnowledgeGovernanceIndex,
} from '@/services/knowledge_governance/KnowledgeGovernanceContract';
import type {
  KnowledgeRegistryCoverage,
  KnowledgeRegistryEntry,
} from '@/services/knowledge_runtime/KnowledgeRuntimeTypes';

type BundledModule = { default?: Record<string, unknown> } | Record<string, unknown>;

const KB_MODULES = import.meta.glob('../../../data/knowledge_base/default/*.json', {
  eager: true,
}) as Record<string, BundledModule>;

let registryCache: KnowledgeRegistryEntry[] | null = null;
let coverageCache: KnowledgeRegistryCoverage | null = null;

function basenameWithoutJson(path: string): string {
  return path.split('/').pop()?.replace(/\.json$/i, '') ?? 'unknown';
}

function inferDomain(category: string): KnowledgeDomain {
  const normalized = category.toLowerCase();
  if (
    normalized.includes('medical') ||
    normalized.includes('medec') ||
    normalized.includes('sante') ||
    normalized.includes('nutrition') ||
    normalized.includes('psy')
  ) {
    return 'medical';
  }
  if (normalized.includes('droit') || normalized.includes('notarial') || normalized.includes('jurid')) {
    return 'legal';
  }
  if (
    normalized.includes('bourse') ||
    normalized.includes('trading') ||
    normalized.includes('crypto') ||
    normalized.includes('finance') ||
    normalized.includes('invest')
  ) {
    return 'financial';
  }
  if (
    normalized.includes('cyber') ||
    normalized.includes('security') ||
    normalized.includes('securit') ||
    normalized.includes('safety')
  ) {
    return 'safety';
  }
  if (
    normalized.includes('spiritual') ||
    normalized.includes('chakra') ||
    normalized.includes('astrologie') ||
    normalized.includes('numerologie')
  ) {
    return 'spiritual_symbolic';
  }
  if (normalized.includes('memory')) return 'memory';
  if (normalized.includes('architect')) return 'architecture';
  if (normalized.includes('knowledge')) return 'knowledge';
  return 'unknown';
}

function inferRiskLevel(domain: KnowledgeDomain): KnowledgeRegistryEntry['riskLevel'] {
  switch (domain) {
    case 'medical':
      return 'restricted';
    case 'legal':
    case 'financial':
    case 'safety':
      return 'high';
    case 'spiritual_symbolic':
      return 'medium';
    default:
      return 'low';
  }
}

function inferRequiresWebValidation(domain: KnowledgeDomain): boolean {
  return domain === 'medical' || domain === 'legal' || domain === 'financial' || domain === 'safety';
}

function inferValidationStatus(
  domain: KnowledgeDomain
): KnowledgeRegistryEntry['validationStatus'] {
  return inferRequiresWebValidation(domain) ? 'unknown' : 'curated';
}

function inferNotAllowedUse(domain: KnowledgeDomain): string[] {
  switch (domain) {
    case 'medical':
      return ['diagnosis', 'treatment_prescription', 'emergency_advice'];
    case 'legal':
      return ['definitive_legal_advice', 'contract_enforcement'];
    case 'financial':
      return ['investment_advice', 'trading_recommendation'];
    case 'safety':
      return ['definitive_security_certification', 'replace_professional_audit'];
    case 'spiritual_symbolic':
      return ['factual_certainty_claims', 'scientific_proof'];
    default:
      return [];
  }
}

function parseGovernanceIndex(): KnowledgeGovernanceIndex {
  return KnowledgeGovernanceIndexSchema.parse(governanceIndexRaw);
}

function normalizeIndexedEntry(
  entry: KnowledgeGovernanceIndex['entries'][number]
): KnowledgeRegistryEntry {
  const category = entry.source_ref ? basenameWithoutJson(entry.source_ref) : entry.knowledge_id;
  return {
    knowledgeId: entry.knowledge_id,
    category,
    title: entry.title,
    domain: entry.domain,
    version: entry.version,
    sourceType: entry.source_type,
    sourceRef: entry.source_ref,
    url: entry.url,
    lastReviewed: entry.last_reviewed,
    confidence: entry.confidence,
    freshness: entry.freshness,
    requiresWebValidation: entry.requires_web_validation,
    riskLevel: entry.risk_level,
    allowedUse: entry.allowed_use,
    notAllowedUse: entry.not_allowed_use,
    validationStatus: entry.validation_status,
    notes: entry.notes,
    metadataOrigin: 'indexed',
  };
}

function buildSyntheticEntry(category: string): KnowledgeRegistryEntry {
  const domain = inferDomain(category);
  return {
    knowledgeId: `synthetic-${category}`,
    category,
    title: category,
    domain,
    version: 'synthetic-1',
    sourceType: 'unknown',
    sourceRef: `data/knowledge_base/default/${category}.json`,
    url: null,
    lastReviewed: null,
    confidence: 0.5,
    freshness: inferRequiresWebValidation(domain) ? 'time_sensitive' : 'stable',
    requiresWebValidation: inferRequiresWebValidation(domain),
    riskLevel: inferRiskLevel(domain),
    allowedUse: ['general_information'],
    notAllowedUse: inferNotAllowedUse(domain),
    validationStatus: inferValidationStatus(domain),
    notes: 'Synthetic governance entry generated at runtime because the KB file is not explicitly indexed.',
    metadataOrigin: 'synthetic',
  };
}

function getBundledCategories(): string[] {
  return Object.keys(KB_MODULES)
    .map(path => basenameWithoutJson(path))
    .sort((a, b) => a.localeCompare(b));
}

function buildRegistry(): KnowledgeRegistryEntry[] {
  const index = parseGovernanceIndex();
  const normalized = index.entries.map(normalizeIndexedEntry);
  const byCategory = new Map(normalized.map(entry => [entry.category, entry]));

  for (const category of getBundledCategories()) {
    if (!byCategory.has(category)) {
      byCategory.set(category, buildSyntheticEntry(category));
    }
  }

  return Array.from(byCategory.values()).sort((a, b) => a.category.localeCompare(b.category));
}

export async function getKnowledgeRegistryEntries(): Promise<KnowledgeRegistryEntry[]> {
  if (!registryCache) {
    registryCache = buildRegistry();
  }
  return registryCache;
}

export async function getKnowledgeRegistryEntryByCategory(
  category: string
): Promise<KnowledgeRegistryEntry | null> {
  const entries = await getKnowledgeRegistryEntries();
  const found =
    entries.find(entry => entry.category === category || entry.knowledgeId === category) ??
    null;
  return found ?? buildSyntheticEntry(category);
}

export async function getKnowledgeRegistryCoverage(): Promise<KnowledgeRegistryCoverage> {
  if (coverageCache) return coverageCache;

  const entries = await getKnowledgeRegistryEntries();
  const totalFiles = getBundledCategories().length;
  const indexedCount = entries.filter(entry => entry.metadataOrigin === 'indexed').length;
  const syntheticCount = entries.filter(entry => entry.metadataOrigin === 'synthetic').length;
  const coveredCategories = new Set(entries.map(entry => entry.category));
  const missing = getBundledCategories().filter(category => !coveredCategories.has(category));

  coverageCache = {
    totalFiles,
    indexedCount,
    syntheticCount,
    covered: totalFiles - missing.length,
    missing,
  };

  return coverageCache;
}

export function resetKnowledgeRegistryCache(): void {
  registryCache = null;
  coverageCache = null;
}
