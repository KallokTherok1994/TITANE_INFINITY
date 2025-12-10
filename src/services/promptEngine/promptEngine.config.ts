/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PROMPT ENGINE — Configuration & Types
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * VERSION: vΩ∞Ω
 * DESCRIPTION: Orchestrateur du Contexte Hiérarchique IA
 *
 * Architecture 6 couches:
 * - L1: Physique (vitals, hardware)
 * - L2: Cognitive (mémoire 3 niveaux)
 * - L3: Symbolique (tags, patterns)
 * - L4: Adaptative (profil user, mode IA)
 * - L5: Meta (règles, permissions)
 * - L6: Singularité (fusion finale)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// =============================================================================
// TYPES DE BASE
// =============================================================================

/**
 * Identifiant unique pour les couches de contexte
 */
export type LayerId =
  | 'physical'
  | 'cognitive'
  | 'symbolic'
  | 'adaptive'
  | 'meta'
  | 'singularity';

/**
 * Mode IA actif (aligné avec Search+Tools Engine)
 */
export type IAMode = 'standard' | 'dev' | 'architect' | 'autonomous';

/**
 * Type de source de contexte
 */
export type ContextSourceType =
  | 'memory_session'
  | 'memory_summarized'
  | 'memory_longterm'
  | 'tools_result'
  | 'tools_state'
  | 'search_result'
  | 'search_cache'
  | 'tts_state'
  | 'selfhealing_status'
  | 'xp_data'
  | 'evolution_data'
  | 'vitals_cpu'
  | 'vitals_ram'
  | 'vitals_disk'
  | 'vitals_network'
  | 'user_profile'
  | 'user_preferences'
  | 'ia_config'
  | 'system_state';

/**
 * Catégorie d'intention utilisateur
 */
export type IntentCategory =
  | 'question'
  | 'command'
  | 'creation'
  | 'modification'
  | 'analysis'
  | 'search'
  | 'conversation'
  | 'system'
  | 'help'
  | 'unknown';

/**
 * Niveau de compression du contexte
 */
export type CompressionLevel = 'none' | 'light' | 'medium' | 'heavy' | 'extreme';

/**
 * Statut de validation
 */
export type ValidationStatus = 'valid' | 'warning' | 'error' | 'pending';

/**
 * Type de nœud de contexte
 */
export type ContextNodeType =
  | 'memory'
  | 'tool'
  | 'search'
  | 'vital'
  | 'preference'
  | 'rule'
  | 'pattern'
  | 'profile'
  | 'state';

/**
 * Niveau de priorité pour le tri
 */
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

/**
 * Ton de conversation
 */
export type ConversationTone =
  | 'professional'
  | 'casual'
  | 'technical'
  | 'friendly'
  | 'formal'
  | 'playful'
  | 'serious';

/**
 * Niveau d'énergie de la réponse
 */
export type EnergyLevel = 'calm' | 'neutral' | 'engaged' | 'enthusiastic' | 'intense';

// =============================================================================
// INTERFACES - CONTEXT NODES
// =============================================================================

/**
 * Source de contexte avec métadonnées
 */
export interface ContextSource {
  type: ContextSourceType;
  engine: string;
  timestamp: number;
  reliability: number; // 0-1
  ttl: number; // Time to live en ms
}

/**
 * Nœud atomique de contexte - unité de base
 */
export interface ContextNode {
  id: string;
  type: ContextNodeType;
  layerId: LayerId;
  content: unknown;
  relevance: number; // 0-1
  priority: PriorityLevel;
  timestamp: number;
  source: ContextSource;
  metadata: NodeMetadata;
  hash: string; // Pour déduplication
}

/**
 * Métadonnées d'un nœud
 */
export interface NodeMetadata {
  tokens?: number;
  compressed: boolean;
  originalSize?: number;
  tags: string[];
  linkedNodes: string[]; // IDs de nœuds liés
  expiresAt?: number;
}

/**
 * Bundle de nœuds pour fusion
 */
export interface ContextBundle {
  id: string;
  layerId: LayerId;
  nodes: ContextNode[];
  groupKey: string;
  compressionLevel: CompressionLevel;
  totalRelevance: number;
  totalTokens: number;
}

// =============================================================================
// INTERFACES - LAYERS
// =============================================================================

/**
 * Métadonnées d'une couche
 */
export interface LayerMetadata {
  name: string;
  description: string;
  priority: number; // 1-100 (100 = plus prioritaire)
  maxTokens: number;
  compressionAllowed: boolean;
  requiredForPrompt: boolean;
}

/**
 * Règle de fusion entre couches
 */
export interface FusionRule {
  id: string;
  sourceLayer: LayerId;
  targetLayer: LayerId;
  condition: FusionCondition;
  action: FusionAction;
  priority: number;
}

/**
 * Condition de fusion
 */
export interface FusionCondition {
  type: 'relevance_threshold' | 'token_limit' | 'node_count' | 'conflict' | 'always';
  threshold?: number;
  operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
}

/**
 * Action de fusion
 */
export interface FusionAction {
  type: 'merge' | 'compress' | 'drop' | 'elevate' | 'demote';
  params?: Record<string, unknown>;
}

/**
 * Couche de contexte complète
 */
export interface ContextLayer {
  id: LayerId;
  metadata: LayerMetadata;
  nodes: ContextNode[];
  bundles: ContextBundle[];
  fusionRules: FusionRule[];
  stats: LayerStats;
}

/**
 * Statistiques d'une couche
 */
export interface LayerStats {
  nodeCount: number;
  totalTokens: number;
  averageRelevance: number;
  compressionRatio: number;
  lastUpdated: number;
}

// =============================================================================
// INTERFACES - INTENT
// =============================================================================

/**
 * Intention parsée de l'utilisateur
 */
export interface ParsedIntent {
  primary: IntentCategory;
  secondary?: IntentCategory;
  keywords: string[];
  entities: IntentEntity[];
  sentiment: number; // -1 à 1
  urgency: number; // 0 à 1
  complexity: number; // 0 à 1
}

/**
 * Entité extraite de l'intention
 */
export interface IntentEntity {
  type: string;
  value: string;
  confidence: number;
  position: { start: number; end: number };
}

/**
 * Profil d'intention complet
 */
export interface IntentProfile {
  id: string;
  raw: string;
  parsed: ParsedIntent;
  category: IntentCategory;
  confidence: number;
  requiredContext: ContextSourceType[];
  suggestedMode: IAMode;
  timestamp: number;
}

// =============================================================================
// INTERFACES - MODE & PROFILE
// =============================================================================

/**
 * Configuration de personnalité IA
 */
export interface PersonalityConfig {
  name: string;
  tone: ConversationTone;
  energy: EnergyLevel;
  formality: number; // 0-1
  verbosity: number; // 0-1
  creativity: number; // 0-1
  technicalDepth: number; // 0-1
}

/**
 * Contraintes du mode IA
 */
export interface ModeConstraints {
  maxTokensInput: number;
  maxTokensOutput: number;
  allowedSources: ContextSourceType[];
  deniedSources: ContextSourceType[];
  requiresConfirmation: string[];
  rateLimits: RateLimitConfig;
}

/**
 * Configuration des rate limits
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute: number;
  burstAllowed: number;
}

/**
 * Chaîne de fallback
 */
export interface FallbackChain {
  steps: FallbackStep[];
  maxAttempts: number;
}

/**
 * Étape de fallback
 */
export interface FallbackStep {
  type: 'memory_summary' | 'local_ia' | 'offline' | 'minimal' | 'selfhealing';
  priority: number;
  timeout: number;
  retries: number;
}

/**
 * Profil de mode IA complet
 */
export interface ModeProfile {
  mode: IAMode;
  permissions: PermissionSet;
  personality: PersonalityConfig;
  constraints: ModeConstraints;
  fallbacks: FallbackChain;
}

// =============================================================================
// INTERFACES - PERMISSIONS
// =============================================================================

/**
 * Type d'accès au contexte
 */
export interface ContextAccess {
  source: ContextSourceType;
  level: 'none' | 'read' | 'write' | 'full';
  conditions?: AccessCondition[];
}

/**
 * Condition d'accès
 */
export interface AccessCondition {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'lt';
  value: unknown;
}

/**
 * Set de permissions
 */
export interface PermissionSet {
  memory: ContextAccess;
  tools: ContextAccess;
  search: ContextAccess;
  vitals: ContextAccess;
  selfHealing: ContextAccess;
  system: ContextAccess;
}

/**
 * Politique de permissions complète
 */
export interface PermissionPolicy {
  mode: IAMode;
  allowed: ContextAccess[];
  denied: ContextAccess[];
  requiresConfirmation: ContextAccess[];
  rateLimits: RateLimitConfig;
  auditEnabled: boolean;
}

// =============================================================================
// INTERFACES - MERGED CONTEXT
// =============================================================================

/**
 * Rapport de conflit
 */
export interface ConflictReport {
  id: string;
  type:
    | 'data_conflict'
    | 'permission_conflict'
    | 'priority_conflict'
    | 'resource_conflict';
  layers: LayerId[];
  nodes: string[];
  description: string;
  resolution?: ConflictResolution;
  resolved: boolean;
}

/**
 * Résolution de conflit
 */
export interface ConflictResolution {
  strategy: 'priority' | 'merge' | 'drop_older' | 'drop_lower' | 'manual';
  appliedAt: number;
  result: string;
}

/**
 * Contexte fusionné (pré-prompt)
 */
export interface MergedContext {
  id: string;
  layers: Map<LayerId, ContextLayer>;
  conflicts: ConflictReport[];
  compressionRatio: number;
  totalTokens: number;
  validationStatus: ValidationStatus;
  warnings: string[];
  timestamp: number;
}

// =============================================================================
// INTERFACES - PROMPT BLUEPRINT
// =============================================================================

/**
 * Section du prompt
 */
export interface PromptSection {
  id: number;
  name: string;
  content: string;
  tokens: number;
  required: boolean;
  order: number;
}

/**
 * Métadonnées du blueprint
 */
export interface BlueprintMetadata {
  version: string;
  generatedAt: number;
  mode: IAMode;
  intentId: string;
  contextHash: string;
}

/**
 * Budget de tokens
 */
export interface TokenBudget {
  total: number;
  allocated: Map<number, number>; // section ID -> tokens
  remaining: number;
  overflow: boolean;
}

/**
 * Hint d'optimisation
 */
export interface OptimizationHint {
  sectionId: number;
  type: 'compress' | 'truncate' | 'prioritize' | 'drop';
  reason: string;
  savings: number;
}

/**
 * Blueprint du prompt (structure avant formatage)
 */
export interface PromptBlueprint {
  id: string;
  sections: PromptSection[];
  metadata: BlueprintMetadata;
  tokenBudget: TokenBudget;
  optimizationHints: OptimizationHint[];
}

// =============================================================================
// INTERFACES - SINGULARITY PROMPT
// =============================================================================

/**
 * Entrée d'audit
 */
export interface AuditEntry {
  timestamp: number;
  action: string;
  layer?: LayerId;
  details: string;
  success: boolean;
}

/**
 * Métadonnées du prompt final
 */
export interface PromptMetadata {
  version: string;
  mode: IAMode;
  intent: IntentProfile;
  generatedAt: number;
  processingTime: number;
  sourcesUsed: ContextSourceType[];
  compressionApplied: boolean;
  fallbacksUsed: string[];
}

/**
 * Prompt final prêt à envoyer (Singularité)
 */
export interface SingularityPrompt {
  id: string;
  content: string;
  sections: PromptSection[];
  metadata: PromptMetadata;
  tokenCount: number;
  hash: string;
  auditTrail: AuditEntry[];
  validationStatus: ValidationStatus;
}

// =============================================================================
// INTERFACES - ENGINE CONFIG
// =============================================================================

/**
 * Configuration du collecteur de contexte
 */
export interface CollectorConfig {
  enabled: boolean;
  sources: ContextSourceType[];
  timeout: number;
  parallelFetch: boolean;
  cacheEnabled: boolean;
  cacheTTL: number;
}

/**
 * Configuration du filtre
 */
export interface FilterConfig {
  minRelevance: number;
  deduplication: boolean;
  permissionCheck: boolean;
  sanitization: boolean;
  maxNodesPerLayer: number;
}

/**
 * Configuration de la compression
 */
export interface CompressionConfig {
  enabled: boolean;
  targetRatio: number;
  maxTokensPerSection: number;
  preserveHighPriority: boolean;
  summarizationModel: string;
}

/**
 * Configuration du Prompt Engine
 */
export interface PromptEngineConfig {
  enabled: boolean;
  defaultMode: IAMode;
  maxTotalTokens: number;
  collector: CollectorConfig;
  filter: FilterConfig;
  compression: CompressionConfig;
  fallbackEnabled: boolean;
  auditLogging: boolean;
  debugMode: boolean;
}

// =============================================================================
// INTERFACES - REQUEST/RESPONSE
// =============================================================================

/**
 * Requête de génération de prompt
 */
export interface PromptRequest {
  id: string;
  userInput: string;
  mode?: IAMode;
  contextOverrides?: Partial<Record<LayerId, unknown>>;
  options?: PromptRequestOptions;
  timestamp: number;
}

/**
 * Options de requête
 */
export interface PromptRequestOptions {
  skipLayers?: LayerId[];
  maxTokens?: number;
  compressionLevel?: CompressionLevel;
  includeAudit?: boolean;
  debugInfo?: boolean;
}

/**
 * Réponse de génération de prompt
 */
export interface PromptResponse {
  success: boolean;
  prompt?: SingularityPrompt;
  error?: PromptError;
  debug?: PromptDebugInfo;
  timestamp: number;
  processingTime: number;
}

/**
 * Erreur de prompt
 */
export interface PromptError {
  code: string;
  message: string;
  layer?: LayerId;
  recoverable: boolean;
  fallbackApplied?: string;
}

/**
 * Info de debug
 */
export interface PromptDebugInfo {
  layers: Map<LayerId, LayerStats>;
  conflicts: ConflictReport[];
  optimizations: OptimizationHint[];
  timeline: DebugTimelineEntry[];
}

/**
 * Entrée de timeline debug
 */
export interface DebugTimelineEntry {
  timestamp: number;
  phase: string;
  duration: number;
  details: string;
}

// =============================================================================
// CONSTANTES - CONFIGURATION PAR DÉFAUT
// =============================================================================

/**
 * Métadonnées des couches par défaut
 */
export const DEFAULT_LAYER_METADATA: Record<LayerId, LayerMetadata> = {
  physical: {
    name: 'Physique',
    description: 'État système, vitals, capacités hardware',
    priority: 10,
    maxTokens: 200,
    compressionAllowed: true,
    requiredForPrompt: false,
  },
  cognitive: {
    name: 'Cognitive',
    description: 'Mémoire session, résumée, long terme',
    priority: 80,
    maxTokens: 1000,
    compressionAllowed: true,
    requiredForPrompt: true,
  },
  symbolic: {
    name: 'Symbolique',
    description: 'Thèmes, tags, patterns détectés',
    priority: 40,
    maxTokens: 300,
    compressionAllowed: true,
    requiredForPrompt: false,
  },
  adaptive: {
    name: 'Adaptative',
    description: 'Profil utilisateur, style, mode IA',
    priority: 70,
    maxTokens: 400,
    compressionAllowed: false,
    requiredForPrompt: true,
  },
  meta: {
    name: 'Meta',
    description: 'Règles, permissions, gouvernance',
    priority: 90,
    maxTokens: 300,
    compressionAllowed: false,
    requiredForPrompt: true,
  },
  singularity: {
    name: 'Singularité',
    description: 'Fusion finale, prompt consolidé',
    priority: 100,
    maxTokens: 4000,
    compressionAllowed: true,
    requiredForPrompt: true,
  },
};

/**
 * Profils de mode IA par défaut
 */
export const DEFAULT_MODE_PROFILES: Record<IAMode, ModeProfile> = {
  standard: {
    mode: 'standard',
    permissions: {
      memory: { source: 'memory_session', level: 'read' },
      tools: { source: 'tools_result', level: 'read' },
      search: { source: 'search_result', level: 'read' },
      vitals: { source: 'vitals_cpu', level: 'read' },
      selfHealing: { source: 'selfhealing_status', level: 'none' },
      system: { source: 'system_state', level: 'none' },
    },
    personality: {
      name: 'Assistant Standard',
      tone: 'friendly',
      energy: 'engaged',
      formality: 0.5,
      verbosity: 0.5,
      creativity: 0.5,
      technicalDepth: 0.3,
    },
    constraints: {
      maxTokensInput: 2000,
      maxTokensOutput: 1000,
      allowedSources: ['memory_session', 'memory_summarized', 'user_profile'],
      deniedSources: ['selfhealing_status', 'system_state'],
      requiresConfirmation: [],
      rateLimits: { requestsPerMinute: 20, tokensPerMinute: 10000, burstAllowed: 5 },
    },
    fallbacks: {
      steps: [
        { type: 'memory_summary', priority: 1, timeout: 5000, retries: 2 },
        { type: 'minimal', priority: 2, timeout: 3000, retries: 1 },
      ],
      maxAttempts: 3,
    },
  },
  dev: {
    mode: 'dev',
    permissions: {
      memory: { source: 'memory_session', level: 'write' },
      tools: { source: 'tools_result', level: 'write' },
      search: { source: 'search_result', level: 'write' },
      vitals: { source: 'vitals_cpu', level: 'read' },
      selfHealing: { source: 'selfhealing_status', level: 'read' },
      system: { source: 'system_state', level: 'read' },
    },
    personality: {
      name: 'Dev Assistant',
      tone: 'technical',
      energy: 'engaged',
      formality: 0.4,
      verbosity: 0.6,
      creativity: 0.6,
      technicalDepth: 0.8,
    },
    constraints: {
      maxTokensInput: 4000,
      maxTokensOutput: 2000,
      allowedSources: [
        'memory_session',
        'memory_summarized',
        'memory_longterm',
        'tools_result',
        'tools_state',
        'search_result',
        'user_profile',
        'vitals_cpu',
        'vitals_ram',
      ],
      deniedSources: [],
      requiresConfirmation: ['system_state'],
      rateLimits: { requestsPerMinute: 50, tokensPerMinute: 30000, burstAllowed: 10 },
    },
    fallbacks: {
      steps: [
        { type: 'memory_summary', priority: 1, timeout: 5000, retries: 2 },
        { type: 'local_ia', priority: 2, timeout: 10000, retries: 2 },
        { type: 'minimal', priority: 3, timeout: 3000, retries: 1 },
      ],
      maxAttempts: 5,
    },
  },
  architect: {
    mode: 'architect',
    permissions: {
      memory: { source: 'memory_session', level: 'full' },
      tools: { source: 'tools_result', level: 'full' },
      search: { source: 'search_result', level: 'full' },
      vitals: { source: 'vitals_cpu', level: 'write' },
      selfHealing: { source: 'selfhealing_status', level: 'write' },
      system: { source: 'system_state', level: 'read' },
    },
    personality: {
      name: 'Architecte Système',
      tone: 'professional',
      energy: 'intense',
      formality: 0.7,
      verbosity: 0.7,
      creativity: 0.8,
      technicalDepth: 1.0,
    },
    constraints: {
      maxTokensInput: 8000,
      maxTokensOutput: 4000,
      allowedSources: [
        'memory_session',
        'memory_summarized',
        'memory_longterm',
        'tools_result',
        'tools_state',
        'search_result',
        'search_cache',
        'tts_state',
        'selfhealing_status',
        'xp_data',
        'evolution_data',
        'vitals_cpu',
        'vitals_ram',
        'vitals_disk',
        'vitals_network',
        'user_profile',
        'user_preferences',
        'ia_config',
      ],
      deniedSources: [],
      requiresConfirmation: [],
      rateLimits: { requestsPerMinute: 100, tokensPerMinute: 100000, burstAllowed: 20 },
    },
    fallbacks: {
      steps: [
        { type: 'memory_summary', priority: 1, timeout: 5000, retries: 3 },
        { type: 'local_ia', priority: 2, timeout: 15000, retries: 3 },
        { type: 'selfhealing', priority: 3, timeout: 10000, retries: 2 },
        { type: 'offline', priority: 4, timeout: 5000, retries: 1 },
      ],
      maxAttempts: 10,
    },
  },
  autonomous: {
    mode: 'autonomous',
    permissions: {
      memory: { source: 'memory_session', level: 'full' },
      tools: { source: 'tools_result', level: 'full' },
      search: { source: 'search_result', level: 'full' },
      vitals: { source: 'vitals_cpu', level: 'full' },
      selfHealing: { source: 'selfhealing_status', level: 'full' },
      system: { source: 'system_state', level: 'full' },
    },
    personality: {
      name: 'Agent Autonome',
      tone: 'professional',
      energy: 'intense',
      formality: 0.6,
      verbosity: 0.8,
      creativity: 1.0,
      technicalDepth: 1.0,
    },
    constraints: {
      maxTokensInput: 16000,
      maxTokensOutput: 8000,
      allowedSources: [
        'memory_session',
        'memory_summarized',
        'memory_longterm',
        'tools_result',
        'tools_state',
        'search_result',
        'search_cache',
        'tts_state',
        'selfhealing_status',
        'xp_data',
        'evolution_data',
        'vitals_cpu',
        'vitals_ram',
        'vitals_disk',
        'vitals_network',
        'user_profile',
        'user_preferences',
        'ia_config',
        'system_state',
      ],
      deniedSources: [],
      requiresConfirmation: [],
      rateLimits: { requestsPerMinute: 200, tokensPerMinute: 500000, burstAllowed: 50 },
    },
    fallbacks: {
      steps: [
        { type: 'memory_summary', priority: 1, timeout: 3000, retries: 5 },
        { type: 'local_ia', priority: 2, timeout: 20000, retries: 5 },
        { type: 'selfhealing', priority: 3, timeout: 15000, retries: 3 },
        { type: 'offline', priority: 4, timeout: 10000, retries: 2 },
        { type: 'minimal', priority: 5, timeout: 5000, retries: 1 },
      ],
      maxAttempts: 20,
    },
  },
};

/**
 * Noms des sections du prompt final (9 sections)
 */
export const PROMPT_SECTION_NAMES: Record<number, string> = {
  1: 'MODE IA ACTIF',
  2: 'OBJECTIF UTILISATEUR',
  3: 'INTENTION DÉCODÉE',
  4: 'CONTEXTE COURANT',
  5: 'MÉMOIRE HIÉRARCHISÉE',
  6: 'INFORMATIONS COMPLÉMENTAIRES',
  7: 'RÈGLES & RESTRICTIONS',
  8: 'STYLE / TONALITÉ ADAPTATIVE',
  9: "INSTRUCTIONS FINALES POUR L'IA",
};

/**
 * Budget de tokens par section (par défaut)
 */
export const DEFAULT_TOKEN_BUDGET: Record<number, number> = {
  1: 100, // Mode IA
  2: 200, // Objectif
  3: 150, // Intention
  4: 300, // Contexte courant
  5: 1000, // Mémoire
  6: 500, // Infos complémentaires
  7: 200, // Règles
  8: 150, // Style
  9: 400, // Instructions finales
};

/**
 * Configuration par défaut du Prompt Engine
 */
export const DEFAULT_PROMPT_ENGINE_CONFIG: PromptEngineConfig = {
  enabled: true,
  defaultMode: 'standard',
  maxTotalTokens: 4000,
  collector: {
    enabled: true,
    sources: [
      'memory_session',
      'memory_summarized',
      'user_profile',
      'user_preferences',
      'ia_config',
      'vitals_cpu',
      'vitals_ram',
    ],
    timeout: 5000,
    parallelFetch: true,
    cacheEnabled: true,
    cacheTTL: 60000, // 1 minute
  },
  filter: {
    minRelevance: 0.3,
    deduplication: true,
    permissionCheck: true,
    sanitization: true,
    maxNodesPerLayer: 50,
  },
  compression: {
    enabled: true,
    targetRatio: 0.7,
    maxTokensPerSection: 500,
    preserveHighPriority: true,
    summarizationModel: 'local',
  },
  fallbackEnabled: true,
  auditLogging: true,
  debugMode: false,
};

/**
 * Mots-clés pour la détection d'intention
 */
export const INTENT_KEYWORDS: Record<IntentCategory, string[]> = {
  question: [
    'quoi',
    'comment',
    'pourquoi',
    'où',
    'quand',
    'qui',
    'est-ce que',
    '?',
    'what',
    'how',
    'why',
    'where',
    'when',
    'who',
  ],
  command: [
    'fais',
    'créé',
    'supprime',
    'modifie',
    'lance',
    'exécute',
    'ouvre',
    'ferme',
    'do',
    'create',
    'delete',
    'modify',
    'run',
    'execute',
  ],
  creation: [
    'créé',
    'génère',
    'écris',
    'compose',
    'construis',
    'create',
    'generate',
    'write',
    'compose',
    'build',
  ],
  modification: [
    'modifie',
    'change',
    'update',
    'corrige',
    'améliore',
    'modify',
    'change',
    'update',
    'fix',
    'improve',
  ],
  analysis: [
    'analyse',
    'examine',
    'évalue',
    'compare',
    'review',
    'analyze',
    'examine',
    'evaluate',
    'compare',
    'review',
  ],
  search: [
    'cherche',
    'trouve',
    'recherche',
    'localise',
    'search',
    'find',
    'look for',
    'locate',
  ],
  conversation: [
    'salut',
    'bonjour',
    'merci',
    'ok',
    'bien',
    'hello',
    'hi',
    'thanks',
    'ok',
    'good',
  ],
  system: [
    'système',
    'config',
    'paramètre',
    'réglage',
    'system',
    'config',
    'setting',
    'preference',
  ],
  help: ['aide', 'help', 'assistance', 'support', 'explique', 'explain'],
  unknown: [],
};

/**
 * Priorités des sources de contexte
 */
export const SOURCE_PRIORITY: Record<ContextSourceType, number> = {
  memory_session: 90,
  memory_summarized: 70,
  memory_longterm: 50,
  tools_result: 80,
  tools_state: 60,
  search_result: 75,
  search_cache: 55,
  tts_state: 30,
  selfhealing_status: 85,
  xp_data: 40,
  evolution_data: 45,
  vitals_cpu: 65,
  vitals_ram: 65,
  vitals_disk: 60,
  vitals_network: 60,
  user_profile: 95,
  user_preferences: 88,
  ia_config: 92,
  system_state: 70,
};

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Génère un ID unique pour les nœuds/prompts
 */
export function generateContextId(prefix: string = 'ctx'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calcule le hash d'un contenu pour déduplication
 */
export function hashContent(content: unknown): string {
  const str = JSON.stringify(content);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Estime le nombre de tokens dans un texte
 */
export function estimateTokens(text: string): number {
  // Approximation: ~4 caractères par token en moyenne
  return Math.ceil(text.length / 4);
}

/**
 * Valide une requête de prompt
 */
export function validatePromptRequest(request: PromptRequest): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.id) {
    errors.push('Request ID is required');
  }

  if (!request.userInput || request.userInput.trim().length === 0) {
    errors.push('User input is required');
  }

  if (
    request.mode &&
    !['standard', 'dev', 'architect', 'autonomous'].includes(request.mode)
  ) {
    errors.push(`Invalid mode: ${request.mode}`);
  }

  if (request.options?.maxTokens && request.options.maxTokens < 100) {
    errors.push('maxTokens must be at least 100');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Obtient la priorité d'une source
 */
export function getSourcePriority(source: ContextSourceType): number {
  return SOURCE_PRIORITY[source] ?? 50;
}

/**
 * Vérifie si une source est autorisée pour un mode
 */
export function isSourceAllowedForMode(source: ContextSourceType, mode: IAMode): boolean {
  const profile = DEFAULT_MODE_PROFILES[mode];
  if (!profile) return false;

  if (profile.constraints.deniedSources.includes(source)) {
    return false;
  }

  return profile.constraints.allowedSources.includes(source);
}

/**
 * Crée un nœud de contexte vide
 */
export function createEmptyContextNode(
  type: ContextNodeType,
  layerId: LayerId,
  source: ContextSource
): ContextNode {
  return {
    id: generateContextId('node'),
    type,
    layerId,
    content: null,
    relevance: 0,
    priority: 'low',
    timestamp: Date.now(),
    source,
    metadata: {
      compressed: false,
      tags: [],
      linkedNodes: [],
    },
    hash: '',
  };
}

/**
 * Crée une couche de contexte vide
 */
export function createEmptyContextLayer(layerId: LayerId): ContextLayer {
  return {
    id: layerId,
    metadata: DEFAULT_LAYER_METADATA[layerId],
    nodes: [],
    bundles: [],
    fusionRules: [],
    stats: {
      nodeCount: 0,
      totalTokens: 0,
      averageRelevance: 0,
      compressionRatio: 1,
      lastUpdated: Date.now(),
    },
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  // Config exports
  DEFAULT_LAYER_METADATA as LAYER_METADATA,
  DEFAULT_MODE_PROFILES as MODE_PROFILES,
  DEFAULT_PROMPT_ENGINE_CONFIG as PROMPT_ENGINE_CONFIG,
};
