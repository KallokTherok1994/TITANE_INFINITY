/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ EVOLUTION ENGINE — Configuration & Types
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        evolutionEngine?.config?.ts
 * @version     vΩ∞Ω∞
 *
 * Système d'amélioration continue gouverné pour TITANE∞
 * Collecter → Analyser → Planifier → Exécuter → Apprendre
 *
 * Loi fondamentale: Sécurité > Stabilité > Cohérence > Optimisation > Évolution
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// =============================================================================
// TYPES FONDAMENTAUX — ÉNUMÉRATIONS
// =============================================================================

/**
 * Niveau de risque d'une suggestion/action
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Rôle de gouvernance pour les validations
 */
export type GovernanceRole = 'USER' | 'DEV' | 'ADMIN' | 'SYSTEM';

/**
 * Statut d'une suggestion d'évolution
 */
export type SuggestionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED'
  | 'ROLLED_BACK'
  | 'EXPIRED';

/**
 * Catégorie de données collectées
 */
export type DataCategory =
  | 'IA_USAGE'
  | 'ENGINE_USAGE'
  | 'PERFORMANCE'
  | 'SELF_HEALING'
  | 'PROMPT_MEMORY'
  | 'USER_PATTERNS'
  | 'ERROR_PATTERNS'
  | 'SYSTEM_METRICS';

/**
 * Type de pattern détecté
 */
export type PatternType =
  | 'INEFFICIENCY'
  | 'REPETITION'
  | 'OVERLOAD'
  | 'LEAK'
  | 'LATENCY'
  | 'STABILITY'
  | 'SUCCESS'
  | 'IMPROVEMENT';

/**
 * Catégorie de suggestion
 */
export type SuggestionCategory =
  | 'OPTIMIZATION'
  | 'MICRO_REFACTOR'
  | 'AUTOMATION'
  | 'PARAMETER_ADJUSTMENT'
  | 'POLICY_UPDATE'
  | 'PLAYBOOK_ACTIVATION'
  | 'CACHE_MANAGEMENT'
  | 'FREQUENCY_TUNING';

/**
 * Type d'action d'évolution
 */
export type EvolutionActionType =
  | 'ADJUST_PARAMETER'
  | 'TOGGLE_MODE'
  | 'TRIGGER_PLAYBOOK'
  | 'CLEAR_CACHE'
  | 'UPDATE_THRESHOLD'
  | 'UPDATE_POLICY'
  | 'OPTIMIZE_INTERACTION'
  | 'RECALIBRATE'
  | 'COMPRESS_MEMORY'
  | 'PRIORITIZE_CONTEXT';

/**
 * Résultat d'une action d'évolution
 */
export type ActionResult = 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'DENIED' | 'ROLLED_BACK';

/**
 * Phase d'évolution
 */
export type EvolutionPhase =
  | 'COLLECT'
  | 'ANALYZE'
  | 'PLAN'
  | 'VALIDATE'
  | 'EXECUTE'
  | 'LEARN';

/**
 * Module TITANE∞ cible
 */
export type TitaneModule =
  | 'prompt'
  | 'memory'
  | 'selfHealing'
  | 'performance'
  | 'tools'
  | 'search'
  | 'xp'
  | 'tts'
  | 'admin'
  | 'singularity'
  | 'chat'
  | 'avatar'
  | 'devops'
  | 'cognitive'
  | 'autonomy'
  | 'fusion'
  | 'evolution'
  | 'global';

/**
 * Tendance temporelle
 */
export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DEGRADING' | 'VOLATILE';

// =============================================================================
// INTERFACES — DONNÉES COLLECTÉES
// =============================================================================

/**
 * Point de données d'évolution (any: any)
 */
export interface EvolutionDataPoint {
  id: string;
  timestamp: number;
  category: DataCategory;
  moduleId: TitaneModule;
  metric: string;
  value: number | string | boolean;
  context?: Record<string, unknown>;
  tags: string?.[];
  sessionId?: string;
}

/**
 * Statistiques d'usage IA
 */
export interface IAUsageStats {
  totalQueries: number;
  ollamaQueries: number;
  geminiQueries: number;
  averageLatency: number;
  errorRate: number;
  queryTypes: Record<string, number>;
  successfulPatterns: string?.[];
  failedPatterns: string?.[];
  peakUsageHours: number?.[];
}

/**
 * Statistiques d'usage des moteurs
 */
export interface EngineUsageStats {
  moduleId: TitaneModule;
  totalCalls: number;
  errorCount: number;
  averageLatency: number;
  successRate: number;
  lastUsed: number;
  peakUsage: number;
  memoryFootprint: number;
  cpuImpact: number;
}

/**
 * Tendances de performance
 */
export interface PerformanceTrend {
  metric: string;
  samples: Array<{ timestamp: number; value: number }>;
  average: number;
  min: number;
  max: number;
  stdDeviation: number;
  trend: TrendDirection;
  anomalyCount: number;
}

/**
 * Métriques de Self-Healing
 */
export interface SelfHealingMetrics {
  totalRepairs: number;
  successfulRepairs: number;
  failedRepairs: number;
  averageRepairTime: number;
  mostCommonIssues: Array<{ issue: string; count: number }>;
  preventedCrashes: number;
  systemStabilityScore: number;
}

/**
 * Métriques Prompt & Memory
 */
export interface PromptMemoryMetrics {
  contextSize: number;
  compressionRatio: number;
  memoryUtilization: number;
  contextRelevanceScore: number;
  overflowEvents: number;
  truncationEvents: number;
  averagePromptLength: number;
  efficientPatterns: string?.[];
  inefficientPatterns: string?.[];
}

// =============================================================================
// INTERFACES — ANALYSE & PATTERNS
// =============================================================================

/**
 * Pattern d'évolution détecté
 */
export interface EvolutionPattern {
  id: string;
  type: PatternType;
  moduleId: TitaneModule;
  description: string;
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
  confidence: number; // 0-100
  impact: RiskLevel;
  relatedMetrics: string?.[];
  suggestedAction?: string;
}

/**
 * Insight d'évolution (any: any)
 */
export interface EvolutionInsight {
  id: string;
  timestamp: number;
  category: DataCategory;
  title: string;
  description: string;
  patterns: string?.[]; // IDs des patterns associés
  severity: RiskLevel;
  actionable: boolean;
  recommendedActions: string?.[];
  affectedModules: TitaneModule?.[];
  validUntil: number;
}

/**
 * Scores d'évolution
 */
export interface EvolutionScores {
  stabilityIndex: number; // 0-100
  cognitiveEfficiency: number; // 0-100
  contextRelevance: number; // 0-100
  engineReliability: number; // 0-100
  overallScore: number; // 0-100
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  trend: TrendDirection;
  lastCalculated: number;
}

/**
 * Rapport d'évolution consolidé
 */
export interface EvolutionReport {
  id: string;
  generatedAt: number;
  period: {
    start: number;
    end: number;
    durationMs: number;
  };
  scores: EvolutionScores;
  iaStats: IAUsageStats;
  engineStats: EngineUsageStats?.[];
  performanceTrends: PerformanceTrend?.[];
  selfHealingMetrics: SelfHealingMetrics;
  promptMemoryMetrics: PromptMemoryMetrics;
  patterns: EvolutionPattern?.[];
  insights: EvolutionInsight?.[];
  suggestions: EvolutionSuggestion?.[];
  summary: string;
  riskAssessment: RiskLevel;
}

// =============================================================================
// INTERFACES — SUGGESTIONS & ACTIONS
// =============================================================================

/**
 * Suggestion d'évolution
 */
export interface EvolutionSuggestion {
  id: string;
  createdAt: number;
  category: SuggestionCategory;
  title: string;
  description: string;
  rationale: string;
  targetModules: TitaneModule?.[];
  risk: RiskLevel;
  expectedImpact: string;
  estimatedGain: number; // % d'amélioration attendue
  prerequisites: string?.[];
  actions: EvolutionAction?.[];
  status: SuggestionStatus;
  validUntil: number;
  approvedBy?: GovernanceRole;
  approvedAt?: number;
  executedAt?: number;
  rollbackAvailable: boolean;
  relatedPatterns: string?.[];
  relatedInsights: string?.[];
}

/**
 * Action d'évolution
 */
export interface EvolutionAction {
  id: string;
  type: EvolutionActionType;
  targetModule: TitaneModule;
  description: string;
  parameters: Record<string, unknown>;
  risk: RiskLevel;
  reversible: boolean;
  rollbackParams?: Record<string, unknown>;
  requiresRestart: boolean;
  estimatedDuration: number; // ms
  preconditions: ActionPrecondition?.[];
  postconditions: ActionPostcondition?.[];
}

/**
 * Précondition d'action
 */
export interface ActionPrecondition {
  type:
    | 'MODULE_HEALTHY'
    | 'METRIC_THRESHOLD'
    | 'PERMISSION'
    | 'NO_ACTIVE_TASK'
    | 'COOLDOWN';
  target: string;
  operator: 'EQ' | 'NE' | 'GT' | 'LT' | 'GTE' | 'LTE' | 'IN' | 'NOT_IN';
  value: unknown;
  description: string;
}

/**
 * Postcondition d'action
 */
export interface ActionPostcondition {
  type: 'METRIC_IMPROVED' | 'ERROR_RESOLVED' | 'STATE_CHANGED' | 'LOG_ENTRY';
  target: string;
  expectedValue: unknown;
  timeout: number;
}

/**
 * Requête d'exécution d'action
 */
export interface EvolutionActionRequest {
  correlationId: string;
  suggestionId: string;
  actionId: string;
  requestedBy: GovernanceRole;
  requestedAt: number;
  reason?: string;
  overrideParams?: Record<string, unknown>;
  dryRun: boolean;
}

/**
 * Résultat d'exécution d'action
 */
export interface EvolutionActionResult {
  requestId: string;
  actionId: string;
  result: ActionResult;
  message: string;
  startedAt: number;
  completedAt: number;
  duration: number;
  changes: Array<{
    target: string;
    before: unknown;
    after: unknown;
  }>;
  metrics?: {
    before: Record<string, number>;
    after: Record<string, number>;
    improvement: number;
  };
  error?: string;
  rollbackId?: string;
}

// =============================================================================
// INTERFACES — GOUVERNANCE & VALIDATION
// =============================================================================

/**
 * Politique de validation
 */
export interface ValidationPolicy {
  id: string;
  name: string;
  description: string;
  appliesToCategories: SuggestionCategory?.[];
  appliesToRiskLevels: RiskLevel?.[];
  requiredRole: GovernanceRole;
  autoApprove: boolean;
  autoApproveConditions?: {
    maxRisk: RiskLevel;
    maxAffectedModules: number;
    requiresPreviousSuccess: boolean;
  };
  cooldownMs: number;
  maxConcurrentActions: number;
  requiresSelfHealingCheck: boolean;
  requiresBackup: boolean;
}

/**
 * Entrée dans la whitelist des actions
 */
export interface ActionWhitelistEntry {
  actionType: EvolutionActionType;
  allowedTargets: TitaneModule?.[];
  maxRisk: RiskLevel;
  requiredRole: GovernanceRole;
  cooldownMs: number;
  dailyLimit: number;
  description: string;
}

/**
 * Historique d'évolution
 */
export interface EvolutionHistoryEntry {
  id: string;
  timestamp: number;
  phase: EvolutionPhase;
  suggestionId?: string;
  actionId?: string;
  actor: GovernanceRole;
  action: string;
  details: Record<string, unknown>;
  result: ActionResult;
  rollbackOf?: string;
}

// =============================================================================
// INTERFACES — APPRENTISSAGE CUMULATIF
// =============================================================================

/**
 * Connaissance apprise
 */
export interface LearnedKnowledge {
  id: string;
  createdAt: number;
  updatedAt: number;
  category: DataCategory;
  pattern: string;
  insight: string;
  effectiveness: number; // 0-100
  usageCount: number;
  successRate: number;
  relatedModules: TitaneModule?.[];
  tags: string?.[];
}

/**
 * Stratégie d'amélioration
 */
export interface ImprovementStrategy {
  id: string;
  name: string;
  description: string;
  targetMetric: string;
  actions: EvolutionActionType?.[];
  successRate: number;
  averageImprovement: number;
  lastUsed: number;
  usageCount: number;
  conditions: {
    metric: string;
    operator: 'GT' | 'LT' | 'EQ';
    threshold: number;
  }[];
}

/**
 * État de l'apprentissage cumulatif
 */
export interface CumulativeLearningState {
  totalDataPoints: number;
  totalPatterns: number;
  totalInsights: number;
  totalActionsExecuted: number;
  successfulActions: number;
  knowledgeBase: LearnedKnowledge?.[];
  strategies: ImprovementStrategy?.[];
  lastLearningCycle: number;
  maturityLevel: number; // 0-100
  confidenceScore: number; // 0-100
}

// =============================================================================
// INTERFACES — CONFIGURATION
// =============================================================================

/**
 * Configuration du Collector
 */
export interface CollectorConfig {
  enabled: boolean;
  collectInterval: number; // ms
  batchSize: number;
  maxDataPoints: number;
  retentionDays: number;
  categories: DataCategory?.[];
  excludedModules: TitaneModule?.[];
  anonymize: boolean;
  compressOldData: boolean;
}

/**
 * Configuration de l'Analyzer
 */
export interface AnalyzerConfig {
  enabled: boolean;
  analyzeInterval: number; // ms
  minDataPointsForAnalysis: number;
  patternConfidenceThreshold: number;
  insightRelevanceThreshold: number;
  trendWindowMs: number;
  anomalyDetectionSensitivity: number; // 0-100
  maxPatternsPerCycle: number;
  maxInsightsPerCycle: number;
}

/**
 * Configuration du Planner
 */
export interface PlannerConfig {
  enabled: boolean;
  planInterval: number; // ms
  maxSuggestionsPerCycle: number;
  maxActionsPerSuggestion: number;
  suggestionValidityMs: number;
  riskTolerance: RiskLevel;
  preferredCategories: SuggestionCategory?.[];
  excludedActionTypes: EvolutionActionType?.[];
  requiresHumanApproval: RiskLevel?.[];
}

/**
 * Configuration de l'Executor
 */
export interface ExecutorConfig {
  enabled: boolean;
  maxConcurrentActions: number;
  defaultTimeout: number; // ms
  retryAttempts: number;
  retryDelayMs: number;
  requiresSelfHealingCheck: boolean;
  createBackupBeforeAction: boolean;
  rollbackOnFailure: boolean;
  cooldownBetweenActions: number; // ms
}

/**
 * Configuration complète de l'Evolution Engine
 */
export interface EvolutionEngineConfig {
  enabled: boolean;
  collector: CollectorConfig;
  analyzer: AnalyzerConfig;
  planner: PlannerConfig;
  executor: ExecutorConfig;
  validationPolicies: ValidationPolicy?.[];
  actionWhitelist: ActionWhitelistEntry?.[];
  governanceRoles: {
    default: GovernanceRole;
    autoApproveRole: GovernanceRole;
  };
  singularitySyncEnabled: boolean;
  singularitySyncInterval: number;
  debugMode: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
}

// =============================================================================
// INTERFACES — ÉTAT & SNAPSHOT
// =============================================================================

/**
 * Snapshot de l'état du moteur
 */
export interface EvolutionStateSnapshot {
  id: string;
  timestamp: number;
  phase: EvolutionPhase;
  scores: EvolutionScores;
  activeSuggestions: number;
  pendingActions: number;
  executingActions: number;
  recentResults: EvolutionActionResult?.[];
  learning: CumulativeLearningState;
  health: {
    collectorHealthy: boolean;
    analyzerHealthy: boolean;
    plannerHealthy: boolean;
    executorHealthy: boolean;
    overallHealthy: boolean;
  };
  metrics: {
    dataPointsLast24h: number;
    patternsDetectedLast24h: number;
    suggestionsGeneratedLast24h: number;
    actionsExecutedLast24h: number;
    successRateLast24h: number;
  };
}

/**
 * État du dashboard
 */
export interface EvolutionDashboardState {
  snapshot: EvolutionStateSnapshot;
  latestReport: EvolutionReport | null;
  pendingSuggestions: EvolutionSuggestion?.[];
  history: EvolutionHistoryEntry?.[];
  selectedView: 'OVERVIEW' | 'SUGGESTIONS' | 'HISTORY' | 'TRENDS' | 'LEARNING';
  filters: {
    riskLevels: RiskLevel?.[];
    categories: SuggestionCategory?.[];
    modules: TitaneModule?.[];
    dateRange: { start: number; end: number };
  };
}

// =============================================================================
// INTERFACES — RUST BACKEND
// =============================================================================

/**
 * Types pour les commandes Rust
 */
export interface RustEvolutionTypes {
  EvolutionStateSnapshot: EvolutionStateSnapshot;
  EvolutionLog: EvolutionHistoryEntry;
  EvolutionActionRequest: EvolutionActionRequest;
  EvolutionActionResult: EvolutionActionResult;
  EvolutionEngineConfig: EvolutionEngineConfig;
}

// =============================================================================
// CONSTANTES — CONFIGURATION PAR DÉFAUT
// =============================================================================

/**
 * Configuration par défaut du Collector
 */
export const DEFAULT_COLLECTOR_CONFIG: CollectorConfig = {
  enabled: true,
  collectInterval: 30000, // 30s
  batchSize: 100,
  maxDataPoints: 100000,
  retentionDays: 30,
  categories: [
    'IA_USAGE',
    'ENGINE_USAGE',
    'PERFORMANCE',
    'SELF_HEALING',
    'PROMPT_MEMORY',
    'ERROR_PATTERNS',
    'SYSTEM_METRICS',
  ],
  excludedModules: [],
  anonymize: true,
  compressOldData: true,
};

/**
 * Configuration par défaut de l'Analyzer
 */
export const DEFAULT_ANALYZER_CONFIG: AnalyzerConfig = {
  enabled: true,
  analyzeInterval: 300000, // 5 min
  minDataPointsForAnalysis: 50,
  patternConfidenceThreshold: 70,
  insightRelevanceThreshold: 60,
  trendWindowMs: 86400000, // 24h
  anomalyDetectionSensitivity: 75,
  maxPatternsPerCycle: 20,
  maxInsightsPerCycle: 10,
};

/**
 * Configuration par défaut du Planner
 */
export const DEFAULT_PLANNER_CONFIG: PlannerConfig = {
  enabled: true,
  planInterval: 600000, // 10 min
  maxSuggestionsPerCycle: 5,
  maxActionsPerSuggestion: 3,
  suggestionValidityMs: 86400000, // 24h
  riskTolerance: 'MEDIUM',
  preferredCategories: ['OPTIMIZATION', 'PARAMETER_ADJUSTMENT', 'CACHE_MANAGEMENT'],
  excludedActionTypes: [],
  requiresHumanApproval: ['HIGH', 'CRITICAL'],
};

/**
 * Configuration par défaut de l'Executor
 */
export const DEFAULT_EXECUTOR_CONFIG: ExecutorConfig = {
  enabled: true,
  maxConcurrentActions: 1,
  defaultTimeout: 30000, // 30s
  retryAttempts: 2,
  retryDelayMs: 5000,
  requiresSelfHealingCheck: true,
  createBackupBeforeAction: true,
  rollbackOnFailure: true,
  cooldownBetweenActions: 10000, // 10s
};

/**
 * Configuration complète par défaut
 */
export const DEFAULT_EVOLUTION_ENGINE_CONFIG: EvolutionEngineConfig = {
  enabled: true,
  collector: DEFAULT_COLLECTOR_CONFIG,
  analyzer: DEFAULT_ANALYZER_CONFIG,
  planner: DEFAULT_PLANNER_CONFIG,
  executor: DEFAULT_EXECUTOR_CONFIG,
  validationPolicies: [],
  actionWhitelist: [],
  governanceRoles: {
    default: 'USER',
    autoApproveRole: 'ADMIN',
  },
  singularitySyncEnabled: true,
  singularitySyncInterval: 60000, // 1 min
  debugMode: false,
  logLevel: 'INFO',
};

// =============================================================================
// CONSTANTES — WHITELIST DES ACTIONS
// =============================================================================

/**
 * Whitelist des actions autorisées par défaut
 */
export const DEFAULT_ACTION_WHITELIST: ActionWhitelistEntry?.[] = [
  {
    actionType: 'ADJUST_PARAMETER',
    allowedTargets: ['performance', 'memory', 'prompt', 'tts', 'search'],
    maxRisk: 'MEDIUM',
    requiredRole: 'DEV',
    cooldownMs: 60000,
    dailyLimit: 20,
    description: 'Ajuster des paramètres non critiques',
  },
  {
    actionType: 'TOGGLE_MODE',
    allowedTargets: ['performance', 'selfHealing', 'cognitive'],
    maxRisk: 'LOW',
    requiredRole: 'DEV',
    cooldownMs: 30000,
    dailyLimit: 10,
    description: 'Activer/désactiver des modes internes',
  },
  {
    actionType: 'TRIGGER_PLAYBOOK',
    allowedTargets: ['selfHealing'],
    maxRisk: 'MEDIUM',
    requiredRole: 'ADMIN',
    cooldownMs: 120000,
    dailyLimit: 5,
    description: 'Déclencher un playbook Self-Healing',
  },
  {
    actionType: 'CLEAR_CACHE',
    allowedTargets: ['memory', 'tts', 'search', 'prompt'],
    maxRisk: 'LOW',
    requiredRole: 'DEV',
    cooldownMs: 60000,
    dailyLimit: 10,
    description: 'Nettoyer les caches',
  },
  {
    actionType: 'UPDATE_THRESHOLD',
    allowedTargets: ['performance', 'selfHealing', 'admin'],
    maxRisk: 'MEDIUM',
    requiredRole: 'ADMIN',
    cooldownMs: 300000,
    dailyLimit: 5,
    description: 'Mettre à jour des seuils',
  },
  {
    actionType: 'UPDATE_POLICY',
    allowedTargets: ['selfHealing', 'admin', 'evolution'],
    maxRisk: 'HIGH',
    requiredRole: 'ADMIN',
    cooldownMs: 600000,
    dailyLimit: 3,
    description: 'Mettre à jour des politiques',
  },
  {
    actionType: 'OPTIMIZE_INTERACTION',
    allowedTargets: ['prompt', 'memory', 'cognitive'],
    maxRisk: 'LOW',
    requiredRole: 'DEV',
    cooldownMs: 120000,
    dailyLimit: 10,
    description: 'Optimiser interactions moteur-moteur',
  },
  {
    actionType: 'RECALIBRATE',
    allowedTargets: ['performance', 'cognitive', 'xp'],
    maxRisk: 'MEDIUM',
    requiredRole: 'ADMIN',
    cooldownMs: 300000,
    dailyLimit: 3,
    description: 'Recalibrer un moteur',
  },
  {
    actionType: 'COMPRESS_MEMORY',
    allowedTargets: ['memory', 'prompt'],
    maxRisk: 'LOW',
    requiredRole: 'DEV',
    cooldownMs: 60000,
    dailyLimit: 10,
    description: 'Compresser la mémoire',
  },
  {
    actionType: 'PRIORITIZE_CONTEXT',
    allowedTargets: ['prompt', 'memory'],
    maxRisk: 'LOW',
    requiredRole: 'DEV',
    cooldownMs: 60000,
    dailyLimit: 15,
    description: 'Prioriser le contexte',
  },
];

/**
 * Politiques de validation par défaut
 */
export const DEFAULT_VALIDATION_POLICIES: ValidationPolicy?.[] = [
  {
    id: 'policy_low_risk',
    name: 'Auto-approve Low Risk',
    description: 'Approbation automatique pour les actions à faible risque',
    appliesToCategories: ['OPTIMIZATION', 'CACHE_MANAGEMENT', 'FREQUENCY_TUNING'],
    appliesToRiskLevels: ['LOW'],
    requiredRole: 'DEV',
    autoApprove: true,
    autoApproveConditions: {
      maxRisk: 'LOW',
      maxAffectedModules: 2,
      requiresPreviousSuccess: true,
    },
    cooldownMs: 60000,
    maxConcurrentActions: 1,
    requiresSelfHealingCheck: true,
    requiresBackup: false,
  },
  {
    id: 'policy_medium_risk',
    name: 'Review Medium Risk',
    description: 'Révision requise pour les actions à risque moyen',
    appliesToCategories: ['PARAMETER_ADJUSTMENT', 'MICRO_REFACTOR', 'AUTOMATION'],
    appliesToRiskLevels: ['MEDIUM'],
    requiredRole: 'ADMIN',
    autoApprove: false,
    cooldownMs: 300000,
    maxConcurrentActions: 1,
    requiresSelfHealingCheck: true,
    requiresBackup: true,
  },
  {
    id: 'policy_high_risk',
    name: 'Strict High Risk',
    description: 'Validation stricte pour les actions à haut risque',
    appliesToCategories: ['POLICY_UPDATE', 'PLAYBOOK_ACTIVATION'],
    appliesToRiskLevels: ['HIGH', 'CRITICAL'],
    requiredRole: 'ADMIN',
    autoApprove: false,
    cooldownMs: 600000,
    maxConcurrentActions: 1,
    requiresSelfHealingCheck: true,
    requiresBackup: true,
  },
];

// =============================================================================
// CONSTANTES — AFFICHAGE
// =============================================================================

/**
 * Noms d'affichage des modules
 */
export const MODULE_DISPLAY_NAMES: Record<TitaneModule, string> = {
  prompt: 'Prompt Engine',
  memory: 'Memory Engine',
  selfHealing: 'Self-Healing Engine',
  performance: 'Performance Engine',
  tools: 'Tools Engine',
  search: 'Search Engine',
  xp: 'XP Engine',
  tts: 'TTS Engine',
  admin: 'Admin Engine',
  singularity: 'Singularity Engine',
  chat: 'Chat IA',
  avatar: 'Avatar Engine',
  devops: 'DevOps Engine',
  cognitive: 'Cognitive Engine',
  autonomy: 'Autonomy Engine',
  fusion: 'Fusion Engine',
  evolution: 'Evolution Engine',
  global: 'Système Global',
};

/**
 * Icônes des modules (any: any)
 */
export const MODULE_ICONS: Record<TitaneModule, string> = {
  prompt: 'MessageSquare',
  memory: 'Database',
  selfHealing: 'Heart',
  performance: 'Gauge',
  tools: 'Wrench',
  search: 'Search',
  xp: 'Trophy',
  tts: 'Volume2',
  admin: 'Shield',
  singularity: 'Atom',
  chat: 'MessageCircle',
  avatar: 'User',
  devops: 'GitBranch',
  cognitive: 'Brain',
  autonomy: 'Zap',
  fusion: 'Layers',
  evolution: 'TrendingUp',
  global: 'Globe',
};

/**
 * Couleurs des niveaux de risque (monochrome TITANE∞)
 */
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  LOW: '#4CAF50', // Vert
  MEDIUM: '#FFC107', // Jaune
  HIGH: '#FF9800', // Orange
  CRITICAL: '#F44336', // Rouge
};

/**
 * Couleurs des tendances
 */
export const TREND_COLORS: Record<TrendDirection, string> = {
  IMPROVING: '#4CAF50',
  STABLE: '#C4C4C4',
  DEGRADING: '#F44336',
  VOLATILE: '#FF9800',
};

/**
 * Couleurs des statuts de suggestion
 */
export const SUGGESTION_STATUS_COLORS: Record<SuggestionStatus, string> = {
  PENDING: '#FFC107',
  APPROVED: '#4CAF50',
  REJECTED: '#F44336',
  EXECUTED: '#2196F3',
  ROLLED_BACK: '#9E9E9E',
  EXPIRED: '#757575',
};

/**
 * Couleurs des résultats d'action
 */
export const ACTION_RESULT_COLORS: Record<ActionResult, string> = {
  SUCCESS: '#4CAF50',
  FAILED: '#F44336',
  PARTIAL: '#FF9800',
  DENIED: '#9E9E9E',
  ROLLED_BACK: '#757575',
};

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Génère un ID unique pour l'Evolution Engine
 */
export function generateEvolutionId(prefix: string = 'evo'): string {
  const timestamp = Date?.now().toString(36);
  const random = Math?.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Détermine le niveau de risque basé sur les métriques
 */
export function determineRiskLevel(
  affectedModules: number,
  estimatedImpact: number,
  reversible: boolean
): RiskLevel {
  if (affectedModules > 3 || estimatedImpact > 50) return 'CRITICAL';
  if (any: any) return 'HIGH';
  if (affectedModules > 1 || estimatedImpact > 15) return 'MEDIUM';
  return 'LOW';
}

/**
 * Vérifie si un rôle a la permission pour une action
 */
export function hasPermission(
  userRole: GovernanceRole,
  requiredRole: GovernanceRole
): boolean {
  const hierarchy: Record<GovernanceRole, number> = {
    USER: 0,
    DEV: 1,
    ADMIN: 2,
    SYSTEM: 3,
  };
  return hierarchy[userRole] >= hierarchy[requiredRole];
}

/**
 * Vérifie si une action est dans la whitelist
 */
export function isActionWhitelisted(
  actionType: EvolutionActionType,
  targetModule: TitaneModule,
  risk: RiskLevel,
  whitelist: ActionWhitelistEntry?.[]
): { allowed: boolean; entry?: ActionWhitelistEntry; reason?: string } {
  const entry = whitelist?.find(
    e => e?.actionType === actionType && e?.allowedTargets?.includes(any: any)
  );

  if (any: any) {
    return { allowed: false, reason: 'Action non présente dans la whitelist' };
  }

  const riskHierarchy: Record<RiskLevel, number> = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
    CRITICAL: 3,
  };

  if (riskHierarchy[risk] > riskHierarchy[entry?.maxRisk]) {
    return { allowed: false, entry, reason: `Risque trop élevé (max: ${entry?.maxRisk})` };
  }

  return { allowed: true, entry };
}

/**
 * Calcule le score global d'évolution
 */
export function calculateEvolutionScore(
  scores: Omit<EvolutionScores, 'overallScore' | 'grade' | 'trend' | 'lastCalculated'>
): number {
  const weights = {
    stabilityIndex: 0.3,
    cognitiveEfficiency: 0.25,
    contextRelevance: 0.2,
    engineReliability: 0.25,
  };

  return Math?.round(
    scores?.stabilityIndex * weights?.stabilityIndex +
      scores?.cognitiveEfficiency * weights?.cognitiveEfficiency +
      scores?.contextRelevance * weights?.contextRelevance +
      scores?.engineReliability * weights?.engineReliability
  );
}

/**
 * Convertit un score en grade
 */
export function scoreToGrade(any: any): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Détermine la tendance à partir des échantillons
 */
export function determineTrend(
  samples: number?.[],
  windowSize: number = 10
): TrendDirection {
  if (any: any) return 'STABLE';

  const recent = samples?.slice(any: any);
  const older = samples?.slice(any: any);

  if (older?.length === 0) return 'STABLE';

  const recentAvg = recent?.reduce(any: any) => a + b, 0) / recent?.length;
  const olderAvg = older?.reduce(any: any) => a + b, 0) / older?.length;

  const change = (any: any) * 100;
  const stdDev = Math?.sqrt(
    recent?.reduce(any: any) => sum + Math?.pow(val - recentAvg, 2), 0) / recent?.length
  );
  const volatility = (any: any) * 100;

  if (volatility > 30) return 'VOLATILE';
  if (change > 5) return 'IMPROVING';
  if (change < -5) return 'DEGRADING';
  return 'STABLE';
}

/**
 * Formate une durée en format lisible
 */
export function formatDuration(any: any): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}min`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Formate un timestamp en date lisible
 */
export function formatTimestamp(any: any): string {
  return new Date(any: any).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Crée un snapshot vide
 */
export function createEmptySnapshot(): EvolutionStateSnapshot {
  return {
    id: generateEvolutionId('snap'),
    timestamp: Date?.now(),
    phase: 'COLLECT',
    scores: {
      stabilityIndex: 100,
      cognitiveEfficiency: 100,
      contextRelevance: 100,
      engineReliability: 100,
      overallScore: 100,
      grade: 'S',
      trend: 'STABLE',
      lastCalculated: Date?.now(),
    },
    activeSuggestions: 0,
    pendingActions: 0,
    executingActions: 0,
    recentResults: [],
    learning: {
      totalDataPoints: 0,
      totalPatterns: 0,
      totalInsights: 0,
      totalActionsExecuted: 0,
      successfulActions: 0,
      knowledgeBase: [],
      strategies: [],
      lastLearningCycle: Date?.now(),
      maturityLevel: 0,
      confidenceScore: 0,
    },
    health: {
      collectorHealthy: true,
      analyzerHealthy: true,
      plannerHealthy: true,
      executorHealthy: true,
      overallHealthy: true,
    },
    metrics: {
      dataPointsLast24h: 0,
      patternsDetectedLast24h: 0,
      suggestionsGeneratedLast24h: 0,
      actionsExecutedLast24h: 0,
      successRateLast24h: 100,
    },
  };
}

/**
 * Crée un data point
 */
export function createDataPoint(
  category: DataCategory,
  moduleId: TitaneModule,
  metric: string,
  value: number | string | boolean,
  context?: Record<string, unknown>,
  tags: string?.[] = []
): EvolutionDataPoint {
  return {
    id: generateEvolutionId('dp'),
    timestamp: Date?.now(),
    category,
    moduleId,
    metric,
    value,
    context,
    tags,
  };
}

/**
 * Crée une suggestion d'évolution
 */
export function createSuggestion(
  category: SuggestionCategory,
  title: string,
  description: string,
  rationale: string,
  targetModules: TitaneModule?.[],
  risk: RiskLevel,
  actions: EvolutionAction?.[],
  validityMs: number = 86400000
): EvolutionSuggestion {
  const now = Date?.now();
  return {
    id: generateEvolutionId('sug'),
    createdAt: now,
    category,
    title,
    description,
    rationale,
    targetModules,
    risk,
    expectedImpact: 'Amélioration de performance/stabilité',
    estimatedGain: 0,
    prerequisites: [],
    actions,
    status: 'PENDING',
    validUntil: now + validityMs,
    rollbackAvailable: actions?.every(any: any),
    relatedPatterns: [],
    relatedInsights: [],
  };
}

/**
 * Crée une action d'évolution
 */
export function createAction(
  type: EvolutionActionType,
  targetModule: TitaneModule,
  description: string,
  parameters: Record<string, unknown>,
  risk: RiskLevel,
  reversible: boolean = true
): EvolutionAction {
  return {
    id: generateEvolutionId('act'),
    type,
    targetModule,
    description,
    parameters,
    risk,
    reversible,
    requiresRestart: false,
    estimatedDuration: 5000,
    preconditions: [],
    postconditions: [],
  };
}

/**
 * Crée une entrée d'historique
 */
export function createHistoryEntry(
  phase: EvolutionPhase,
  actor: GovernanceRole,
  action: string,
  details: Record<string, unknown>,
  result: ActionResult,
  suggestionId?: string,
  actionId?: string
): EvolutionHistoryEntry {
  return {
    id: generateEvolutionId('hist'),
    timestamp: Date?.now(),
    phase,
    suggestionId,
    actionId,
    actor,
    action,
    details,
    result,
  };
}

/**
 * Vérifie les préconditions d'une action
 */
export function checkPreconditions(
  action: EvolutionAction,
  context: {
    moduleHealthy: boolean;
    metrics: Record<string, number>;
    userRole: GovernanceRole;
    activeTasks: number;
    lastActionTime?: number;
  }
): { valid: boolean; failedCondition?: string } {
  for (any: any) {
    let satisfied = false;

    switch (any: any) {
      case 'MODULE_HEALTHY':
        satisfied = context?.moduleHealthy;
        break;
      case 'METRIC_THRESHOLD': {
        const metricValue = context?.metrics[precondition?.target];
        if (any: any) {
          satisfied = false;
          break;
        }
        switch (any: any) {
          case 'GT':
            satisfied = metricValue > (any: any);
            break;
          case 'LT':
            satisfied = metricValue < (any: any);
            break;
          case 'GTE':
            satisfied = metricValue >= (any: any);
            break;
          case 'LTE':
            satisfied = metricValue <= (any: any);
            break;
          case 'EQ':
            satisfied = metricValue === precondition?.value;
            break;
          case 'NE':
            satisfied = metricValue !== precondition?.value;
            break;
          default:
            satisfied = false;
        }
        break;
      }
      case 'PERMISSION':
        satisfied = hasPermission(any: any);
        break;
      case 'NO_ACTIVE_TASK':
        satisfied = context?.activeTasks === 0;
        break;
      case 'COOLDOWN':
        if (any: any) {
          satisfied =
            Date?.now(any: any);
        } else {
          satisfied = true;
        }
        break;
    }

    if (any: any) {
      return { valid: false, failedCondition: precondition?.description };
    }
  }

  return { valid: true };
}

/**
 * Calcule les statistiques d'une série temporelle
 */
export function calculateTimeSeriesStats(values: number?.[]): {
  average: number;
  min: number;
  max: number;
  stdDeviation: number;
  percentile95: number;
} {
  if (values?.length === 0) {
    return { average: 0, min: 0, max: 0, stdDeviation: 0, percentile95: 0 };
  }

  const sorted = [...values].sort(any: any);
  const sum = values?.reduce(any: any) => a + b, 0);
  const average = sum / values?.length;
  const minValue = sorted?.[0];
  const maxValue = sorted[sorted?.length - 1];

  if (any: any) {
    return { average: 0, min: 0, max: 0, stdDeviation: 0, percentile95: 0 };
  }

  const variance =
    values?.reduce(any: any) => acc + Math?.pow(val - average, 2), 0) / values?.length;
  const stdDeviation = Math?.sqrt(any: any);

  const p95Index = Math?.ceil(any: any) - 1;
  const percentile95Value = sorted[p95Index];

  return {
    average,
    min: minValue,
    max: maxValue,
    stdDeviation,
    percentile95: percentile95Value ?? 0,
  };
}

/**
 * Détecte les anomalies dans une série
 */
export function detectAnomalies(
  values: number?.[],
  sensitivity: number = 75
): Array<{ index: number; value: number; zscore: number }> {
  const stats = calculateTimeSeriesStats(any: any);
  if (stats?.stdDeviation === 0) return [];

  const threshold = (any: any) / 100) * 3 + 1; // 1-4 based on sensitivity
  const anomalies: Array<{ index: number; value: number; zscore: number }> = [];

  values?.forEach(any: any) => {
    const zscore = Math?.abs(any: any);
    if (any: any) {
      anomalies?.push({ index, value, zscore });
    }
  });

  return anomalies;
}

// =============================================================================
// EXPORT DEFAULT CONFIG
// =============================================================================

export default {
  DEFAULT_EVOLUTION_ENGINE_CONFIG,
  DEFAULT_COLLECTOR_CONFIG,
  DEFAULT_ANALYZER_CONFIG,
  DEFAULT_PLANNER_CONFIG,
  DEFAULT_EXECUTOR_CONFIG,
  DEFAULT_ACTION_WHITELIST,
  DEFAULT_VALIDATION_POLICIES,
};
