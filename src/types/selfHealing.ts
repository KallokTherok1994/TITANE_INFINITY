/**
 * TITANE∞ vΩ∞ — TYPES SELF-HEALING ENGINE
 * Super Prompt #5: Système d'auto-réparation et diagnostics
 *
 * A. Définitions TypeScript complètes pour:
 *    - Diagnostics automatiques
 *    - Stratégies de réparation
 *    - Watchdogs et monitoring
 *    - Récupération d'erreurs
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// NIVEAUX ET CATÉGORIES
// ============================================================================

/**
 * Sévérité du problème détecté
 */
export type IssueSeverity =
  | 'info'       // Information, pas d'action requise
  | 'warning'    // Avertissement, action recommandée
  | 'error'      // Erreur, action requise
  | 'critical';  // Critique, action immédiate requise

/**
 * Catégorie de problème
 */
export type IssueCategory =
  | 'memory'          // Problèmes mémoire
  | 'performance'     // Problèmes performance
  | 'network'         // Problèmes réseau
  | 'storage'         // Problèmes stockage
  | 'api'             // Problèmes API
  | 'audio'           // Problèmes audio/TTS
  | 'state'           // Problèmes d'état
  | 'sync'            // Problèmes synchronisation
  | 'security'        // Problèmes sécurité
  | 'configuration';  // Problèmes configuration

/**
 * État de la réparation
 */
export type RepairStatus =
  | 'pending'       // En attente
  | 'in_progress'   // En cours
  | 'success'       // Réussi
  | 'failed'        // Échoué
  | 'skipped'       // Ignoré
  | 'manual';       // Intervention manuelle requise

// ============================================================================
// DIAGNOSTICS
// ============================================================================

/**
 * Problème détecté
 */
export interface DetectedIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;

  // Description
  code: string;
  title: string;
  description: string;

  // Contexte
  source: string;               // Composant source
  stackTrace?: string;
  metadata: Record<string, unknown>;

  // Timing
  detectedAt: number;
  lastOccurrence: number;
  occurrenceCount: number;

  // Réparation
  autoFixable: boolean;
  repairStrategies: RepairStrategy[];

  // État
  acknowledged: boolean;
  resolved: boolean;
  resolvedAt?: number;
}

/**
 * Résultat de diagnostic
 */
export interface DiagnosticResult {
  id: string;
  category: IssueCategory;
  timestamp: number;
  duration: number;

  // Résultats
  healthy: boolean;
  issues: DetectedIssue[];
  metrics: DiagnosticMetrics;

  // Recommandations
  recommendations: string[];
}

/**
 * Métriques de diagnostic
 */
export interface DiagnosticMetrics {
  // Mémoire
  memoryUsedMB: number;
  memoryLimitMB: number;
  memoryUsagePercent: number;

  // Performance
  cpuUsagePercent?: number;
  responseTimeMs: number;
  errorRate: number;

  // Stockage
  storageUsedMB: number;
  storageLimitMB: number;

  // Réseau
  networkLatencyMs: number;
  networkErrors: number;

  // État
  activeConnections: number;
  pendingOperations: number;
  queueLength: number;
}

// ============================================================================
// STRATÉGIES DE RÉPARATION
// ============================================================================

/**
 * Stratégie de réparation
 */
export interface RepairStrategy {
  id: string;
  name: string;
  description: string;

  // Type
  type: RepairType;
  category: IssueCategory;

  // Conditions
  applicableIssueCodes: string[];
  priority: number;               // 1-100

  // Exécution
  automated: boolean;
  requiresRestart: boolean;
  estimatedDurationMs: number;

  // Risques
  riskLevel: 'low' | 'medium' | 'high';
  sideEffects: string[];

  // Rollback
  rollbackable: boolean;
  rollbackStrategy?: string;
}

export type RepairType =
  | 'clear_cache'
  | 'restart_service'
  | 'reload_config'
  | 'reset_state'
  | 'retry_operation'
  | 'fallback_mode'
  | 'garbage_collect'
  | 'reconnect'
  | 'restore_backup'
  | 'reconfigure'
  | 'custom';

/**
 * Action de réparation
 */
export interface RepairAction {
  id: string;
  strategyId: string;
  issueId: string;

  // Exécution
  status: RepairStatus;
  startedAt?: number;
  completedAt?: number;

  // Résultat
  success: boolean;
  result?: string;
  error?: string;

  // Métadonnées
  attempts: number;
  maxAttempts: number;
  metadata: Record<string, unknown>;
}

// ============================================================================
// WATCHDOGS
// ============================================================================

/**
 * Configuration watchdog
 */
export interface WatchdogConfig {
  id: string;
  name: string;
  enabled: boolean;

  // Cible
  target: WatchdogTarget;
  category: IssueCategory;

  // Intervalles
  checkIntervalMs: number;
  timeoutMs: number;

  // Seuils
  thresholds: WatchdogThresholds;

  // Actions
  onWarning: WatchdogAction;
  onError: WatchdogAction;
  onCritical: WatchdogAction;
}

export type WatchdogTarget =
  | 'memory'
  | 'cpu'
  | 'network'
  | 'storage'
  | 'api_health'
  | 'queue_length'
  | 'error_rate'
  | 'response_time';

export interface WatchdogThresholds {
  warning: number;
  error: number;
  critical: number;
}

export type WatchdogAction =
  | { type: 'log' }
  | { type: 'notify'; message: string }
  | { type: 'repair'; strategyId: string }
  | { type: 'escalate' }
  | { type: 'custom'; handler: string };

/**
 * État du watchdog
 */
export interface WatchdogState {
  id: string;
  lastCheck: number;
  lastValue: number;
  status: 'healthy' | 'warning' | 'error' | 'critical';
  consecutiveFailures: number;
  history: WatchdogHistoryEntry[];
}

export interface WatchdogHistoryEntry {
  timestamp: number;
  value: number;
  status: 'healthy' | 'warning' | 'error' | 'critical';
}

// ============================================================================
// RÉCUPÉRATION
// ============================================================================

/**
 * Point de récupération
 */
export interface RecoveryPoint {
  id: string;
  name: string;
  description?: string;

  // Type
  type: 'automatic' | 'manual';
  category: 'state' | 'config' | 'full';

  // Données
  data: unknown;
  checksum: string;
  sizeBytes: number;

  // Timing
  createdAt: number;
  expiresAt?: number;

  // Métadonnées
  version: string;
  metadata: Record<string, unknown>;
}

/**
 * Session de récupération
 */
export interface RecoverySession {
  id: string;
  startedAt: number;
  triggeredBy: 'automatic' | 'user' | 'watchdog';

  // Issues traitées
  issues: string[];

  // Actions
  actions: RepairAction[];

  // État
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  completedAt?: number;

  // Résultats
  issuesResolved: number;
  issuesFailed: number;

  // Logs
  logs: RecoveryLog[];
}

export interface RecoveryLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Résultat de health check
 */
export interface HealthCheckResult {
  timestamp: number;
  overall: HealthStatus;

  // Par catégorie
  categories: Record<IssueCategory, HealthStatus>;

  // Composants
  components: ComponentHealth[];

  // Métriques
  metrics: DiagnosticMetrics;

  // Issues actives
  activeIssues: number;
  criticalIssues: number;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'critical';

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  message?: string;
  lastCheck: number;
  responseTime?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration du Self-Healing Engine
 */
export interface SelfHealingConfig {
  // Activation
  enabled: boolean;
  autoRepairEnabled: boolean;

  // Diagnostics
  diagnosticIntervalMs: number;
  diagnosticCategories: IssueCategory[];

  // Watchdogs
  watchdogs: WatchdogConfig[];

  // Réparations
  maxAutoRepairAttempts: number;
  repairCooldownMs: number;

  // Récupération
  recoveryPointsEnabled: boolean;
  maxRecoveryPoints: number;
  recoveryPointIntervalMs: number;

  // Notifications
  notifyOnWarning: boolean;
  notifyOnError: boolean;
  notifyOnRepair: boolean;

  // Limites
  maxConcurrentRepairs: number;
  maxIssuesStored: number;
}

// ============================================================================
// ÉVÉNEMENTS
// ============================================================================

/**
 * Callbacks pour événements self-healing
 */
export interface SelfHealingCallbacks {
  onIssueDetected?: (issue: DetectedIssue) => void;
  onIssueResolved?: (issue: DetectedIssue) => void;
  onRepairStarted?: (action: RepairAction) => void;
  onRepairCompleted?: (action: RepairAction) => void;
  onHealthChange?: (health: HealthCheckResult) => void;
  onRecoveryStarted?: (session: RecoverySession) => void;
  onRecoveryCompleted?: (session: RecoverySession) => void;
}

/**
 * État observable du Self-Healing Engine
 */
export interface SelfHealingState {
  isInitialized: boolean;
  isRunning: boolean;

  // Santé
  health: HealthCheckResult | null;
  lastHealthCheck: number;

  // Issues
  activeIssues: DetectedIssue[];
  resolvedIssues: DetectedIssue[];

  // Réparations
  pendingRepairs: RepairAction[];
  activeRepairs: RepairAction[];
  completedRepairs: RepairAction[];

  // Watchdogs
  watchdogStates: Record<string, WatchdogState>;

  // Récupération
  recoveryPoints: RecoveryPoint[];
  activeRecoverySession: RecoverySession | null;

  // Stats
  stats: SelfHealingStats;
}

export interface SelfHealingStats {
  totalIssuesDetected: number;
  totalIssuesResolved: number;
  totalRepairsAttempted: number;
  totalRepairsSuccessful: number;
  averageRepairTimeMs: number;
  uptimePercent: number;
}
