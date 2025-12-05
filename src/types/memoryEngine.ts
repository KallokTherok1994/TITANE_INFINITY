/**
 * TITANE∞ vΩ∞ — TYPES MEMORY ENGINE
 * Super Prompt #3: Système de mémoire contextuelle multi-couches
 *
 * A. Définitions TypeScript complètes pour:
 *    - Mémoire court/moyen/long terme
 *    - Contexte conversationnel
 *    - Mémoire associative
 *    - Compression sémantique
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// COUCHES DE MÉMOIRE
// ============================================================================

/**
 * Niveaux de mémoire (court → long terme)
 */
export type MemoryTier =
  | 'instant'      // < 30s - Buffer temps réel
  | 'short'        // 30s - 5min - Contexte immédiat
  | 'medium'       // 5min - 1h - Session active
  | 'long'         // 1h - 24h - Journée
  | 'persistent'   // > 24h - Permanent
  | 'archival';    // Compressé, rarement accédé

/**
 * Types de contenu mémorisable
 */
export type MemoryContentType =
  | 'message'           // Message utilisateur/IA
  | 'context'           // Contexte système
  | 'decision'          // Décision prise
  | 'fact'              // Fait appris
  | 'preference'        // Préférence utilisateur
  | 'skill'             // Compétence acquise
  | 'relationship'      // Relation entre entités
  | 'emotion'           // État émotionnel détecté
  | 'correction'        // Correction d'erreur
  | 'summary';          // Résumé compressé

/**
 * Importance du souvenir (affecte la rétention)
 */
export type MemoryImportance =
  | 'trivial'     // 0-20: Peut être oublié rapidement
  | 'low'         // 20-40: Faible priorité
  | 'medium'      // 40-60: Normal
  | 'high'        // 60-80: Important
  | 'critical';   // 80-100: Ne jamais oublier

/**
 * Source de la mémoire
 */
export type MemorySource =
  | 'user_input'        // Entrée utilisateur directe
  | 'ai_inference'      // Inférence IA
  | 'system_event'      // Événement système
  | 'external_data'     // Données externes
  | 'user_feedback'     // Feedback explicite
  | 'compression';      // Résultat de compression

// ============================================================================
// STRUCTURES DE DONNÉES MÉMOIRE
// ============================================================================

/**
 * Souvenir individuel
 */
export interface Memory {
  id: string;
  tier: MemoryTier;
  contentType: MemoryContentType;
  importance: MemoryImportance;
  importanceScore: number; // 0-100

  // Contenu
  content: string;
  embedding?: number[];           // Vecteur sémantique
  metadata: MemoryMetadata;

  // Timing
  createdAt: number;
  accessedAt: number;
  expiresAt?: number;
  accessCount: number;

  // Relations
  associations: MemoryAssociation[];
  parentId?: string;              // Si compressé depuis autre mémoire
  childIds?: string[];            // Souvenirs dérivés

  // État
  isCompressed: boolean;
  compressionRatio?: number;
  isArchived: boolean;
  decayRate: number;              // Taux d'oubli (0 = jamais oublié)
}

/**
 * Métadonnées enrichies
 */
export interface MemoryMetadata {
  source: MemorySource;
  sessionId: string;
  conversationId?: string;
  userId?: string;

  // Contexte
  chatMode?: string;
  emotionalState?: string;
  confidence: number;             // 0-1

  // Sémantique
  topics: string[];
  entities: MemoryEntity[];
  keywords: string[];
  language: string;

  // Technique
  tokenCount: number;
  originalLength: number;
  compressedLength?: number;
}

/**
 * Entité nommée extraite
 */
export interface MemoryEntity {
  name: string;
  type: 'person' | 'place' | 'organization' | 'concept' | 'project' | 'file' | 'other';
  mentions: number;
  importance: number;             // 0-100
  firstSeen: number;
  lastSeen: number;
}

/**
 * Association entre souvenirs
 */
export interface MemoryAssociation {
  targetId: string;
  type: AssociationType;
  strength: number;               // 0-1
  createdAt: number;
  reinforcements: number;         // Nombre de renforcements
}

export type AssociationType =
  | 'semantic'      // Similarité sémantique
  | 'temporal'      // Proximité temporelle
  | 'causal'        // Relation causale
  | 'reference'     // Référence explicite
  | 'contradiction' // Contradiction
  | 'elaboration'   // Élaboration/détail
  | 'summary';      // Relation résumé

// ============================================================================
// CONTEXTE CONVERSATIONNEL
// ============================================================================

/**
 * Contexte de conversation actif
 */
export interface ConversationContext {
  id: string;
  sessionId: string;
  startedAt: number;
  lastActivityAt: number;

  // Messages récents (court terme)
  recentMessages: ContextMessage[];
  maxRecentMessages: number;

  // État courant
  currentTopic?: string;
  currentIntent?: string;
  emotionalTone: EmotionalTone;

  // Historique compressé
  summaries: ContextSummary[];
  totalMessageCount: number;

  // Mémoire de travail
  workingMemory: WorkingMemorySlot[];
  maxWorkingMemorySlots: number;

  // Statistiques
  stats: ConversationStats;
}

/**
 * Message dans le contexte
 */
export interface ContextMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;

  // Enrichissement
  intent?: string;
  sentiment?: number;             // -1 à 1
  topics?: string[];
  referencedMemories?: string[];

  // Tokens
  tokenCount: number;
}

/**
 * Résumé de contexte
 */
export interface ContextSummary {
  id: string;
  content: string;
  messageRange: [number, number]; // [start, end] message indices
  createdAt: number;
  topics: string[];
  keyPoints: string[];
  tokenCount: number;
}

/**
 * Slot de mémoire de travail (7±2 éléments)
 */
export interface WorkingMemorySlot {
  id: string;
  content: string;
  priority: number;               // 0-100
  addedAt: number;
  sourceMemoryId?: string;
  expiresAfterTurns: number;
  turnsRemaining: number;
}

/**
 * Tonalité émotionnelle
 */
export interface EmotionalTone {
  valence: number;                // -1 (négatif) à 1 (positif)
  arousal: number;                // 0 (calme) à 1 (excité)
  dominantEmotion?: string;
  confidence: number;
  history: EmotionSnapshot[];
}

export interface EmotionSnapshot {
  timestamp: number;
  valence: number;
  arousal: number;
  emotion?: string;
}

/**
 * Statistiques de conversation
 */
export interface ConversationStats {
  userMessageCount: number;
  assistantMessageCount: number;
  averageMessageLength: number;
  topicsDiscussed: string[];
  memoriesAccessed: number;
  memoriesCreated: number;
  compressionEvents: number;
}

// ============================================================================
// COMPRESSION SÉMANTIQUE
// ============================================================================

/**
 * Stratégie de compression
 */
export type CompressionStrategy =
  | 'extractive'    // Extraction des phrases clés
  | 'abstractive'   // Résumé génératif
  | 'hierarchical'  // Compression multi-niveaux
  | 'semantic'      // Fusion par similarité sémantique
  | 'temporal';     // Agrégation temporelle

/**
 * Résultat de compression
 */
export interface CompressionResult {
  originalMemoryIds: string[];
  compressedMemory: Memory;
  strategy: CompressionStrategy;

  // Métriques
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  informationRetention: number;   // 0-1 estimation

  // Timing
  processedAt: number;
  processingTimeMs: number;
}

/**
 * Configuration de compression
 */
export interface CompressionConfig {
  strategy: CompressionStrategy;
  targetTokens: number;
  minImportanceThreshold: number;
  preserveEntities: boolean;
  preserveKeyFacts: boolean;
  maxSourceMemories: number;
}

// ============================================================================
// RECHERCHE ET RÉCUPÉRATION
// ============================================================================

/**
 * Requête de recherche mémoire
 */
export interface MemorySearchQuery {
  // Recherche textuelle
  text?: string;
  embedding?: number[];

  // Filtres
  tiers?: MemoryTier[];
  contentTypes?: MemoryContentType[];
  importanceMin?: number;
  timeRange?: TimeRange;
  sessionId?: string;
  topics?: string[];

  // Paramètres
  limit: number;
  offset?: number;
  sortBy: MemorySortField;
  sortOrder: 'asc' | 'desc';

  // Options avancées
  includeArchived?: boolean;
  expandAssociations?: boolean;
  minRelevance?: number;
}

export interface TimeRange {
  start?: number;
  end?: number;
}

export type MemorySortField =
  | 'relevance'
  | 'recency'
  | 'importance'
  | 'accessCount'
  | 'createdAt';

/**
 * Résultat de recherche
 */
export interface MemorySearchResult {
  memories: ScoredMemory[];
  totalCount: number;
  queryTimeMs: number;

  // Métadonnées
  topicsFound: string[];
  tiersSearched: MemoryTier[];
  usedEmbedding: boolean;
}

export interface ScoredMemory extends Memory {
  score: number;                  // Score de pertinence 0-1
  matchType: 'exact' | 'semantic' | 'association';
  highlightedContent?: string;
}

// ============================================================================
// GESTION DU CYCLE DE VIE
// ============================================================================

/**
 * Politique de rétention
 */
export interface RetentionPolicy {
  tier: MemoryTier;
  maxAge: number;                 // ms avant promotion/archivage
  maxCount: number;               // Limite de souvenirs
  importanceDecay: number;        // Réduction importance/jour

  // Actions
  onExpiry: 'promote' | 'compress' | 'archive' | 'delete';
  promotionTier?: MemoryTier;
  compressionConfig?: CompressionConfig;
}

/**
 * Événement de maintenance
 */
export interface MaintenanceEvent {
  type: 'compression' | 'promotion' | 'archival' | 'deletion' | 'decay';
  timestamp: number;
  affectedMemories: string[];
  beforeStats: MemoryStats;
  afterStats: MemoryStats;
}

/**
 * Statistiques mémoire globales
 */
export interface MemoryStats {
  totalMemories: number;
  byTier: Record<MemoryTier, number>;
  byContentType: Record<MemoryContentType, number>;

  // Taille
  totalTokens: number;
  totalBytes: number;

  // Performance
  averageAccessTime: number;
  cacheHitRate: number;

  // Santé
  fragmentationLevel: number;     // 0-1
  oldestMemoryAge: number;
  recentCompressions: number;
}

// ============================================================================
// SYNCHRONISATION BACKEND
// ============================================================================

/**
 * Commandes mémoire Tauri
 */
export interface MemoryCommand {
  type: MemoryCommandType;
  payload: unknown;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
}

export type MemoryCommandType =
  | 'memory_store'
  | 'memory_retrieve'
  | 'memory_search'
  | 'memory_compress'
  | 'memory_delete'
  | 'memory_promote'
  | 'memory_archive'
  | 'memory_stats'
  | 'memory_maintenance'
  | 'memory_export'
  | 'memory_import'
  | 'context_save'
  | 'context_restore'
  | 'context_clear';

/**
 * Réponse du backend mémoire
 */
export interface MemoryResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: MemoryError;
  timing: {
    receivedAt: number;
    processedAt: number;
    durationMs: number;
  };
}

export interface MemoryError {
  code: string;
  message: string;
  recoverable: boolean;
  suggestion?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration globale du Memory Engine
 */
export interface MemoryEngineConfig {
  // Limites par tier
  tierLimits: Record<MemoryTier, TierLimit>;

  // Contexte
  maxContextTokens: number;
  maxRecentMessages: number;
  maxWorkingMemorySlots: number;

  // Compression
  autoCompressionEnabled: boolean;
  compressionThreshold: number;   // Tokens avant compression
  defaultCompressionStrategy: CompressionStrategy;

  // Recherche
  embeddingDimension: number;
  searchCacheEnabled: boolean;
  searchCacheTTL: number;

  // Maintenance
  maintenanceIntervalMs: number;
  autoArchiveAfterDays: number;
  autoDeleteAfterDays: number;

  // Sync
  syncEnabled: boolean;
  syncIntervalMs: number;
  syncBatchSize: number;
}

export interface TierLimit {
  maxMemories: number;
  maxTokens: number;
  maxAgeMs: number;
  decayEnabled: boolean;
}

// ============================================================================
// HOOKS ET CALLBACKS
// ============================================================================

/**
 * Callbacks pour événements mémoire
 */
export interface MemoryEventCallbacks {
  onMemoryCreated?: (memory: Memory) => void;
  onMemoryAccessed?: (memory: Memory) => void;
  onMemoryUpdated?: (memory: Memory, changes: Partial<Memory>) => void;
  onMemoryDeleted?: (memoryId: string) => void;
  onCompressionCompleted?: (result: CompressionResult) => void;
  onMaintenanceCompleted?: (event: MaintenanceEvent) => void;
  onContextUpdated?: (context: ConversationContext) => void;
  onError?: (error: MemoryError) => void;
}

/**
 * État observable du Memory Engine
 */
export interface MemoryEngineState {
  isInitialized: boolean;
  isProcessing: boolean;
  isSyncing: boolean;
  lastMaintenanceAt: number;
  lastSyncAt: number;
  stats: MemoryStats;
  activeContext?: ConversationContext;
  pendingOperations: number;
  errors: MemoryError[];
}
