/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — CENTRE D'ÉVOLUTION COGNITIVE - TYPES UNIFIÉS
 *   Types TypeScript pour Progression, Knowledge, Evolution, Memory
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESSION / XP
// ─────────────────────────────────────────────────────────────────────────────

export type XPSource =
  | 'chat_message'
  | 'file_import'
  | 'automation_success'
  | 'diagnostic_pass'
  | 'self_repair'
  | 'system_fix'
  | 'milestone_unlock'
  | 'daily_login'
  | 'evolution_cycle'
  | 'knowledge_ingest'
  | 'manual';

export interface XPEvent {
  id: string;
  timestamp: number;
  amount: number;
  source: XPSource;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ProgressionMilestone {
  id: string;
  name: string;
  description: string;
  requiredXP: number;
  requiredLevel: number;
  unlockedAt?: number;
  icon: string;
  reward?: string;
}

export interface ProgressionState {
  level: number;
  totalXP: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  milestones: ProgressionMilestone[];
  unlockedMilestones: string[];
  lastXPGain: XPEvent | null;
  streakDays: number;
  lastActiveDate: string;
  createdAt: number;
  updatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE VAULT
// ─────────────────────────────────────────────────────────────────────────────

export type KnowledgeCategory =
  | 'code-rust'
  | 'code-typescript'
  | 'code-react'
  | 'code-tauri'
  | 'code-python'
  | 'code-other'
  | 'document'
  | 'config'
  | 'data'
  | 'notes'
  | 'snippet'
  | 'unknown';

export type KnowledgeFormat =
  | 'pdf'
  | 'docx'
  | 'markdown'
  | 'plaintext'
  | 'json'
  | 'yaml'
  | 'csv'
  | 'xml'
  | 'code'
  | 'unknown';

export type IngestionStatus =
  | 'pending'
  | 'processing'
  | 'indexed'
  | 'failed'
  | 'archived';

export interface KnowledgeMetadata {
  author: string | null;
  createdAt: number;
  modifiedAt: number;
  sizeBytes: number;
  language: string | null;
  keywords: string[];
  lineCount: number;
  wordCount: number;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  path: string;
  category: KnowledgeCategory;
  format: KnowledgeFormat;
  summary: string;
  content: string;
  metadata: KnowledgeMetadata;
  status: IngestionStatus;
  indexedAt: number;
  lastAccessedAt: number;
  accessCount: number;
  relevanceScore: number;
  tags: string[];
}

export interface KnowledgeVaultState {
  totalDocuments: number;
  totalSizeBytes: number;
  categoryCounts: Record<KnowledgeCategory, number>;
  lastIngestion: number | null;
  indexVersion: string;
  entries: KnowledgeEntry[];
}

export interface KnowledgeSearchResult {
  entry: KnowledgeEntry;
  score: number;
  matchedKeywords: string[];
  snippet: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EVOLUTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export type EvolutionPhase =
  | 'nascent'      // Phase initiale
  | 'learning'    // Apprentissage actif
  | 'adapting'    // Adaptation
  | 'optimizing'  // Optimisation
  | 'evolving'    // Évolution autonome
  | 'singularity'; // Phase finale

export type MutationType =
  | 'optimize'
  | 'refactor'
  | 'simplify'
  | 'enhance'
  | 'fix'
  | 'merge';

export interface EvolutionMutation {
  id: string;
  type: MutationType;
  target: string;
  description: string;
  expectedImprovement: number;
  riskLevel: 'P0' | 'P1' | 'P2' | 'P3';
  appliedAt?: number;
  success?: boolean;
}

export interface EvolutionCycle {
  id: string;
  cycleNumber: number;
  timestamp: number;
  phase: EvolutionPhase;
  mutationsProposed: number;
  mutationsApplied: number;
  improvements: Record<string, number>;
  metrics: {
    stability: number;
    coherence: number;
    performance: number;
    cognitiveDepth: number;
  };
}

export interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  title: string;
  description: string;
  changes: string[];
  breaking?: boolean;
}

export interface EvolutionState {
  version: string;
  phase: EvolutionPhase;
  totalCycles: number;
  totalMutations: number;
  currentMetrics: {
    stability: number;
    coherence: number;
    performance: number;
    cognitiveDepth: number;
  };
  lastCycle: EvolutionCycle | null;
  cycleHistory: EvolutionCycle[];
  changelog: ChangelogEntry[];
  lastUpdate: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY (CT/MT/LT)
// ─────────────────────────────────────────────────────────────────────────────

export type MemoryLevel = 'short_term' | 'medium_term' | 'long_term';

export type MemoryTopic =
  | 'conversation'
  | 'code'
  | 'learning'
  | 'preference'
  | 'context'
  | 'task'
  | 'knowledge'
  | 'system';

export interface MemoryMetadata {
  source: string;
  modeId: string | null;
  sessionId: string | null;
  createdAt: number;
  updatedAt: number;
  accessCount: number;
  lastAccessedAt: number;
  relatedIds: string[];
  encrypted: boolean;
}

export interface CognitiveMemoryEntry {
  id: string;
  level: MemoryLevel;
  topic: MemoryTopic;
  title: string;
  content: string;
  summary: string;
  importance: number; // 1-5
  tags: string[];
  metadata: MemoryMetadata;
  embedding?: number[];
}

export interface MemoryCluster {
  id: string;
  topic: MemoryTopic;
  entryIds: string[];
  summary: string;
  centroid?: number[];
  coherence: number;
  createdAt: number;
}

export interface MemorySnapshot {
  id: string;
  timestamp: number;
  shortTermCount: number;
  mediumTermCount: number;
  longTermCount: number;
  totalSizeBytes: number;
  compressionRatio: number;
  clusters: MemoryCluster[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY ENGINE TYPES (for MemoryEngine class)
// ─────────────────────────────────────────────────────────────────────────────

export type MemoryType =
  | 'short-term'
  | 'long-term'
  | 'episodic'
  | 'semantic'
  | 'procedural';

export interface MemoryEntry {
  id: string;
  content: string;
  type: MemoryType;
  context: string;
  tags: string[];
  importance: number;
  strength: number;
  createdAt: number;
  lastAccess: number;
  accessCount: number;
  consolidated: boolean;
  associations: string[];
}

export interface MemoryStats {
  totalMemories: number;
  shortTermCount: number;
  longTermCount: number;
  episodicCount: number;
  semanticCount: number;
  proceduralCount: number;
  averageStrength: number;
  oldestMemory: number | null;
  newestMemory: number | null;
  totalRecalls: number;
  consolidationRate: number;
}

export interface MemoryState {
  memories: MemoryEntry[];
  stats: MemoryStats;
  lastConsolidation: number;
  decayEnabled: boolean;
}

export interface RecallResult {
  memory: MemoryEntry;
  relevance: number;
  confidence: number;
}

export interface CognitiveMemoryState {
  shortTerm: CognitiveMemoryEntry[];
  mediumTerm: CognitiveMemoryEntry[];
  longTerm: CognitiveMemoryEntry[];
  clusters: MemoryCluster[];
  stats: {
    totalEntries: number;
    totalSizeBytes: number;
    compressedSizeBytes: number;
    compressionRatio: number;
    lastCompression: number | null;
    lastPurge: number | null;
  };
  lastSnapshot: MemorySnapshot | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CENTRE D'ÉVOLUTION COGNITIVE (ÉTAT UNIFIÉ)
// ─────────────────────────────────────────────────────────────────────────────

export interface CognitiveEvolutionState {
  progression: ProgressionState;
  knowledge: KnowledgeVaultState;
  evolution: EvolutionState;
  memory: CognitiveMemoryState;
  lastSync: number;
  version: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGULARITY STATE INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

export interface SingularityCognitiveState {
  progression: {
    level: number;
    totalXP: number;
    streakDays: number;
  };
  memory: {
    totalMemories: number;
    activeMemories: number;
    memoryUsage: number;
    compressionRatio: number;
    lastRetrieval: number;
  };
  knowledge: {
    indexedCount: number;
    totalSizeBytes: number;
    categories: string[];
  };
  evolution: {
    version: string;
    phase: EvolutionPhase;
    totalCycles: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// API TYPES (Tauri Commands)
// ─────────────────────────────────────────────────────────────────────────────

export interface AddXPRequest {
  amount: number;
  source: XPSource;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface IngestDocumentRequest {
  path: string;
  content?: string;
  category?: KnowledgeCategory;
  metadata?: Partial<KnowledgeMetadata>;
}

export interface SearchKnowledgeRequest {
  query: string;
  limit?: number;
  categories?: KnowledgeCategory[];
  minRelevance?: number;
}

export interface PurgeMemoryRequest {
  level: MemoryLevel | 'all';
  olderThan?: number;
  minImportance?: number;
}

export interface CompressMemoryRequest {
  level?: MemoryLevel;
  aggressive?: boolean;
}
