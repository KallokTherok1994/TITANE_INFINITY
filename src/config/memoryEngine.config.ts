/**
 * TITANE∞ vΩ∞ — CONFIGURATION MEMORY ENGINE
 * Super Prompt #3: Configuration complète du système de mémoire
 *
 * B. Source de vérité pour:
 *    - Limites par tier
 *    - Politiques de rétention
 *    - Stratégies de compression
 *    - Paramètres de recherche
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  MemoryEngineConfig,
  MemoryTier,
  TierLimit,
  RetentionPolicy,
  CompressionConfig,
  CompressionStrategy,
  MemoryImportance,
} from '@/types/memoryEngine';

// ============================================================================
// CONFIGURATION PRINCIPALE
// ============================================================================

export const MEMORY_ENGINE_CONFIG: MemoryEngineConfig = {
  // Limites par tier
  tierLimits: {
    instant: {
      maxMemories: 20,
      maxTokens: 2000,
      maxAgeMs: 30 * 1000, // 30 secondes
      decayEnabled: false,
    },
    short: {
      maxMemories: 50,
      maxTokens: 8000,
      maxAgeMs: 5 * 60 * 1000, // 5 minutes
      decayEnabled: false,
    },
    medium: {
      maxMemories: 200,
      maxTokens: 32000,
      maxAgeMs: 60 * 60 * 1000, // 1 heure
      decayEnabled: true,
    },
    long: {
      maxMemories: 1000,
      maxTokens: 128000,
      maxAgeMs: 24 * 60 * 60 * 1000, // 24 heures
      decayEnabled: true,
    },
    persistent: {
      maxMemories: 10000,
      maxTokens: 512000,
      maxAgeMs: 365 * 24 * 60 * 60 * 1000, // 1 an
      decayEnabled: true,
    },
    archival: {
      maxMemories: 100000,
      maxTokens: 2000000,
      maxAgeMs: Infinity,
      decayEnabled: false,
    },
  },

  // Contexte conversationnel
  maxContextTokens: 8192,
  maxRecentMessages: 20,
  maxWorkingMemorySlots: 7, // Règle 7±2 de Miller

  // Compression automatique
  autoCompressionEnabled: true,
  compressionThreshold: 4096, // Tokens avant compression
  defaultCompressionStrategy: 'hierarchical',

  // Recherche sémantique
  embeddingDimension: 384, // all-MiniLM-L6-v2
  searchCacheEnabled: true,
  searchCacheTTL: 5 * 60 * 1000, // 5 minutes

  // Maintenance
  maintenanceIntervalMs: 5 * 60 * 1000, // 5 minutes
  autoArchiveAfterDays: 30,
  autoDeleteAfterDays: 365,

  // Synchronisation backend
  syncEnabled: true,
  syncIntervalMs: 10 * 1000, // 10 secondes
  syncBatchSize: 50,
};

// ============================================================================
// POLITIQUES DE RÉTENTION PAR TIER
// ============================================================================

export const RETENTION_POLICIES: Record<MemoryTier, RetentionPolicy> = {
  instant: {
    tier: 'instant',
    maxAge: 30 * 1000,
    maxCount: 20,
    importanceDecay: 0,
    onExpiry: 'promote',
    promotionTier: 'short',
  },
  short: {
    tier: 'short',
    maxAge: 5 * 60 * 1000,
    maxCount: 50,
    importanceDecay: 0,
    onExpiry: 'compress',
    compressionConfig: {
      strategy: 'extractive',
      targetTokens: 100,
      minImportanceThreshold: 30,
      preserveEntities: true,
      preserveKeyFacts: true,
      maxSourceMemories: 10,
    },
  },
  medium: {
    tier: 'medium',
    maxAge: 60 * 60 * 1000,
    maxCount: 200,
    importanceDecay: 5, // -5 points/jour
    onExpiry: 'compress',
    compressionConfig: {
      strategy: 'abstractive',
      targetTokens: 200,
      minImportanceThreshold: 40,
      preserveEntities: true,
      preserveKeyFacts: true,
      maxSourceMemories: 20,
    },
  },
  long: {
    tier: 'long',
    maxAge: 24 * 60 * 60 * 1000,
    maxCount: 1000,
    importanceDecay: 2, // -2 points/jour
    onExpiry: 'promote',
    promotionTier: 'persistent',
  },
  persistent: {
    tier: 'persistent',
    maxAge: 365 * 24 * 60 * 60 * 1000,
    maxCount: 10000,
    importanceDecay: 0.5, // -0.5 points/jour
    onExpiry: 'archive',
  },
  archival: {
    tier: 'archival',
    maxAge: Infinity,
    maxCount: 100000,
    importanceDecay: 0,
    onExpiry: 'delete',
  },
};

// ============================================================================
// STRATÉGIES DE COMPRESSION
// ============================================================================

export const COMPRESSION_STRATEGIES: Record<CompressionStrategy, CompressionConfig> = {
  extractive: {
    strategy: 'extractive',
    targetTokens: 100,
    minImportanceThreshold: 30,
    preserveEntities: true,
    preserveKeyFacts: true,
    maxSourceMemories: 10,
  },
  abstractive: {
    strategy: 'abstractive',
    targetTokens: 150,
    minImportanceThreshold: 40,
    preserveEntities: true,
    preserveKeyFacts: true,
    maxSourceMemories: 20,
  },
  hierarchical: {
    strategy: 'hierarchical',
    targetTokens: 200,
    minImportanceThreshold: 50,
    preserveEntities: true,
    preserveKeyFacts: true,
    maxSourceMemories: 50,
  },
  semantic: {
    strategy: 'semantic',
    targetTokens: 100,
    minImportanceThreshold: 60,
    preserveEntities: true,
    preserveKeyFacts: false,
    maxSourceMemories: 30,
  },
  temporal: {
    strategy: 'temporal',
    targetTokens: 250,
    minImportanceThreshold: 20,
    preserveEntities: false,
    preserveKeyFacts: true,
    maxSourceMemories: 100,
  },
};

// ============================================================================
// SCORES D'IMPORTANCE
// ============================================================================

export const IMPORTANCE_THRESHOLDS: Record<
  MemoryImportance,
  { min: number; max: number }
> = {
  trivial: { min: 0, max: 20 },
  low: { min: 20, max: 40 },
  medium: { min: 40, max: 60 },
  high: { min: 60, max: 80 },
  critical: { min: 80, max: 100 },
};

export const IMPORTANCE_MODIFIERS: Record<string, number> = {
  // Actions utilisateur
  explicit_save: 30, // L'utilisateur demande de mémoriser
  explicit_delete: -100, // L'utilisateur demande d'oublier
  correction: 25, // Correction d'une erreur
  repeated_access: 5, // Accès répété

  // Contenu
  contains_name: 15, // Contient un nom propre
  contains_date: 10, // Contient une date importante
  contains_number: 5, // Contient des données numériques
  long_content: 10, // Message long et détaillé

  // Contexte
  high_emotion: 20, // Contexte émotionnel fort
  decision_made: 25, // Une décision a été prise
  task_completed: 15, // Tâche terminée
  error_occurred: 20, // Erreur survenue

  // Associations
  many_associations: 10, // Beaucoup de liens avec d'autres souvenirs
  critical_topic: 30, // Sujet marqué comme critique
};

// ============================================================================
// TAUX DE DÉCROISSANCE
// ============================================================================

export const DECAY_RATES: Record<MemoryTier, number> = {
  instant: 0, // Pas de décroissance (expire vite)
  short: 0, // Pas de décroissance
  medium: 0.05, // -5% importance / heure
  long: 0.02, // -2% importance / heure
  persistent: 0.001, // -0.1% importance / heure
  archival: 0, // Pas de décroissance
};

// ============================================================================
// CONFIGURATION RECHERCHE
// ============================================================================

export const SEARCH_CONFIG = {
  // Pondération des scores
  weights: {
    textMatch: 0.4,
    semanticSimilarity: 0.4,
    recency: 0.1,
    importance: 0.1,
  },

  // Seuils
  minRelevanceScore: 0.3,
  minSemanticSimilarity: 0.5,

  // Limites
  defaultLimit: 10,
  maxLimit: 100,

  // Cache
  cacheEnabled: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 1000,

  // Expansion
  expandAssociationsDefault: true,
  maxAssociationDepth: 2,
  minAssociationStrength: 0.3,
};

// ============================================================================
// CONFIGURATION CONTEXTE
// ============================================================================

export const CONTEXT_CONFIG = {
  // Messages
  maxRecentMessages: 20,
  messageTokenLimit: 500, // Par message
  systemMessageTokenLimit: 1000,

  // Résumés
  summaryTriggerMessages: 10, // Résumer tous les 10 messages
  summaryTargetTokens: 200,
  maxSummaries: 5,

  // Mémoire de travail
  workingMemorySlots: 7,
  slotExpiryTurns: 5,
  slotPriorityDecay: 0.1,

  // Émotions
  emotionHistorySize: 20,
  emotionSmoothingFactor: 0.3,
};

// ============================================================================
// CONFIGURATION MAINTENANCE
// ============================================================================

export const MAINTENANCE_CONFIG = {
  // Intervalles
  checkIntervalMs: 60 * 1000, // Vérification toutes les minutes
  fullMaintenanceIntervalMs: 30 * 60 * 1000, // Maintenance complète toutes les 30 min

  // Seuils de déclenchement
  memoryCountThreshold: 0.9, // 90% de la limite
  tokenCountThreshold: 0.85, // 85% de la limite tokens
  fragmentationThreshold: 0.3, // 30% fragmentation

  // Actions automatiques
  autoCompressEnabled: true,
  autoPromoteEnabled: true,
  autoArchiveEnabled: true,
  autoDeleteEnabled: false, // Désactivé par défaut (sécurité)

  // Limites par opération
  maxCompressionsPerCycle: 20,
  maxPromotionsPerCycle: 50,
  maxDeletionsPerCycle: 10,
};

// ============================================================================
// CONFIGURATION SYNC BACKEND
// ============================================================================

export const SYNC_CONFIG = {
  enabled: true,

  // Timing
  intervalMs: 10 * 1000, // Sync toutes les 10s
  debounceMs: 1000, // Debounce des modifications

  // Batch
  batchSize: 50,
  maxPendingOperations: 200,

  // Retry
  maxRetries: 3,
  retryDelayMs: 5000,
  exponentialBackoff: true,

  // Priorités
  priorityOrder: ['delete', 'update', 'create'],

  // Compression réseau
  compressPayloads: true,
  minPayloadSizeForCompression: 1024,
};

// ============================================================================
// COMMANDES TAURI
// ============================================================================

export const MEMORY_COMMANDS = {
  // CRUD
  store: 'memory_store',
  retrieve: 'memory_retrieve',
  update: 'memory_update',
  delete: 'memory_delete',

  // Recherche
  search: 'memory_search',
  searchSemantic: 'memory_search_semantic',

  // Gestion
  compress: 'memory_compress',
  promote: 'memory_promote',
  archive: 'memory_archive',

  // Contexte
  contextSave: 'context_save',
  contextRestore: 'context_restore',
  contextClear: 'context_clear',

  // Stats
  getStats: 'memory_stats',
  getHealth: 'memory_health',

  // Maintenance
  runMaintenance: 'memory_maintenance',

  // Import/Export
  export: 'memory_export',
  import: 'memory_import',
} as const;

// ============================================================================
// TOPICS PRÉDÉFINIS
// ============================================================================

export const PREDEFINED_TOPICS = [
  'développement',
  'architecture',
  'design',
  'audio',
  'IA',
  'performance',
  'sécurité',
  'tests',
  'documentation',
  'déploiement',
  'configuration',
  'utilisateur',
  'erreurs',
  'bugs',
  'features',
  'projet',
  'personnel',
  'tâches',
  'planning',
  'communication',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Obtient la configuration pour un tier
 */
export function getTierConfig(tier: MemoryTier): TierLimit {
  return MEMORY_ENGINE_CONFIG.tierLimits[tier];
}

/**
 * Obtient la politique de rétention pour un tier
 */
export function getRetentionPolicy(tier: MemoryTier): RetentionPolicy {
  return RETENTION_POLICIES[tier];
}

/**
 * Calcule le score d'importance ajusté
 */
export function calculateAdjustedImportance(
  baseScore: number,
  modifiers: string[]
): number {
  let adjusted = baseScore;

  for (const modifier of modifiers) {
    if (modifier in IMPORTANCE_MODIFIERS) {
      adjusted += IMPORTANCE_MODIFIERS[modifier] ?? 0;
    }
  }

  return Math.max(0, Math.min(100, adjusted));
}

/**
 * Détermine le niveau d'importance à partir du score
 */
export function getImportanceLevel(score: number): MemoryImportance {
  for (const [level, range] of Object.entries(IMPORTANCE_THRESHOLDS)) {
    if (score >= range.min && score < range.max) {
      return level as MemoryImportance;
    }
  }
  return score >= 80 ? 'critical' : 'trivial';
}

/**
 * Calcule le tier approprié pour un souvenir
 */
export function suggestTier(
  age: number,
  importance: number,
  accessCount: number
): MemoryTier {
  // Accès fréquent = garder accessible
  if (accessCount > 10) {
    return importance > 60 ? 'persistent' : 'long';
  }

  // Très important = persistent
  if (importance > 80) {
    return 'persistent';
  }

  // Basé sur l'âge
  const ageHours = age / (60 * 60 * 1000);

  if (ageHours < 0.1) return 'instant';
  if (ageHours < 1) return 'short';
  if (ageHours < 24) return 'medium';
  if (ageHours < 168) return 'long'; // 1 semaine

  return importance > 40 ? 'persistent' : 'archival';
}

/**
 * Vérifie si une maintenance est nécessaire
 */
export function shouldRunMaintenance(
  stats: { totalMemories: number; totalTokens: number },
  config: TierLimit
): boolean {
  const memoryRatio = stats.totalMemories / config.maxMemories;
  const tokenRatio = stats.totalTokens / config.maxTokens;

  return (
    memoryRatio > MAINTENANCE_CONFIG.memoryCountThreshold ||
    tokenRatio > MAINTENANCE_CONFIG.tokenCountThreshold
  );
}
