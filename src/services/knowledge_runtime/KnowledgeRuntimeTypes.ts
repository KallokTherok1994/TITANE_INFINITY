import type {
  KnowledgeDomain,
  KnowledgeItemSourceType,
  KnowledgeValidationStatus,
} from '@/services/knowledge_governance/KnowledgeGovernanceContract';
import type { KnowledgeBaseEntry } from '@/services/api/defaultKnowledgeBase';

export type KnowledgeFreshness = 'stable' | 'time_sensitive' | 'unknown';
export type KnowledgeRiskLevel = 'low' | 'medium' | 'high' | 'restricted';
export type KnowledgeFreshnessRisk = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type KnowledgeMetadataOrigin = 'indexed' | 'synthetic';

export interface KnowledgeRegistryEntry {
  knowledgeId: string;
  category: string;
  title: string;
  domain: KnowledgeDomain;
  version: string;
  sourceType: KnowledgeItemSourceType;
  sourceRef: string | null;
  url: string | null;
  lastReviewed: string | null;
  confidence: number;
  freshness: KnowledgeFreshness;
  requiresWebValidation: boolean;
  riskLevel: KnowledgeRiskLevel;
  allowedUse: string[];
  notAllowedUse: string[];
  validationStatus: KnowledgeValidationStatus;
  notes: string | null;
  metadataOrigin: KnowledgeMetadataOrigin;
}

export interface GovernedKnowledgeMatch {
  entry: KnowledgeBaseEntry;
  registry: KnowledgeRegistryEntry;
  governanceAllowed: boolean;
  requiresResearch: boolean;
  freshnessRisk: KnowledgeFreshnessRisk;
  usageWarnings: string[];
}

export interface RetrievalCandidate {
  knowledgeId: string;
  category: string;
  lexicalScore: number;
  semanticScore: number;
  fusedScore: number;
  source: 'kb' | 'memory' | 'research';
}

export interface GovernedRankedItem extends GovernedKnowledgeMatch {
  lexicalScore: number;
  semanticScore: number;
  finalScore: number;
  authorityScore: number;
  freshnessPenalty: number;
  riskPenalty: number;
  confusionPenalty: number;
}

export interface KnowledgeConflict {
  leftKnowledgeId: string;
  rightKnowledgeId: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  blocking: boolean;
}

export interface KnowledgeSelectionVerdict {
  selected: string[];
  deferred: string[];
  blocked: string[];
  researchRequired: string[];
  conflicts: KnowledgeConflict[];
  rationale: string[];
}

export interface KnowledgeEvidencePacket {
  stableKnowledge: string[];
  researchRequiredKnowledge: string[];
  warnings: string[];
  blockedClaims: string[];
  selectionRationale?: string[];
}

export interface ResearchGateDecision {
  state: 'NOT_NEEDED' | 'REQUIRED' | 'CONFIRMED' | 'FAILED' | 'UNAVAILABLE';
  reason: string;
  blocking: boolean;
}

export interface KnowledgeRegistryCoverage {
  totalFiles: number;
  indexedCount: number;
  syntheticCount: number;
  covered: number;
  missing: string[];
}

export type MemoryCandidateOrigin =
  | 'web_research'
  | 'conversation'
  | 'kb_selection'
  | 'user_fact';

export type MemoryCandidateStructureType =
  | 'content'
  | 'heuristic'
  | 'preference'
  | 'rule'
  | 'temporal_fact';

export type MemoryCandidateProbationStatus =
  | 'candidate'
  | 'probation'
  | 'ready'
  | 'rejected';

export interface MemoryCandidate {
  id: string;
  origin: MemoryCandidateOrigin;
  knowledgeId: string;
  category: string;
  content: string;
  structureType: MemoryCandidateStructureType;
  confidence: number;
  createdAt: string;
  lastSeenAt: string;
  usageCount: number;
  stabilityScore: number;
  contradictionFlag: boolean;
  probationStatus: MemoryCandidateProbationStatus;
  expiresAt: string | null;
  supportingSignals: string[];
}

export interface PromotionDecision {
  action: 'keep_trace' | 'enter_probation' | 'promote' | 'defer' | 'reject';
  reason: string;
  nextReviewAt?: string;
}

export interface AgingDecision {
  status: 'stable' | 'aging' | 'stale' | 'expire_now';
  reason: string;
}
