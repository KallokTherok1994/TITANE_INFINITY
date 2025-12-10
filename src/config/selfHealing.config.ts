/**
 * TITANE∞ vΩ∞ — CONFIGURATION SELF-HEALING ENGINE
 * Super Prompt #5: Configuration auto-réparation
 *
 * B. Source de vérité pour:
 *    - Watchdogs système
 *    - Stratégies de réparation
 *    - Seuils de diagnostic
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  SelfHealingConfig,
  WatchdogConfig,
  RepairStrategy,
  IssueCategory,
  RepairType,
} from '@/types/selfHealing';

// ============================================================================
// CONFIGURATION PRINCIPALE
// ============================================================================

export const SELF_HEALING_CONFIG: SelfHealingConfig = {
  // Activation
  enabled: true,
  autoRepairEnabled: true,

  // Diagnostics
  diagnosticIntervalMs: 30 * 1000, // 30 secondes
  diagnosticCategories: [
    'memory',
    'performance',
    'network',
    'storage',
    'api',
    'audio',
    'state',
    'sync',
  ],

  // Watchdogs configurés séparément
  watchdogs: [],

  // Réparations
  maxAutoRepairAttempts: 3,
  repairCooldownMs: 60 * 1000, // 1 minute

  // Récupération
  recoveryPointsEnabled: true,
  maxRecoveryPoints: 10,
  recoveryPointIntervalMs: 5 * 60 * 1000, // 5 minutes

  // Notifications
  notifyOnWarning: true,
  notifyOnError: true,
  notifyOnRepair: true,

  // Limites
  maxConcurrentRepairs: 2,
  maxIssuesStored: 100,
};

// ============================================================================
// WATCHDOGS
// ============================================================================

export const WATCHDOG_CONFIGS: WatchdogConfig[] = [
  {
    id: 'memory_usage',
    name: 'Utilisation Mémoire',
    enabled: true,
    target: 'memory',
    category: 'memory',
    checkIntervalMs: 10 * 1000,
    timeoutMs: 5000,
    thresholds: {
      warning: 70, // 70%
      error: 85, // 85%
      critical: 95, // 95%
    },
    onWarning: { type: 'log' },
    onError: { type: 'repair', strategyId: 'garbage_collect' },
    onCritical: { type: 'repair', strategyId: 'emergency_memory_clear' },
  },
  {
    id: 'api_health',
    name: 'Santé API',
    enabled: true,
    target: 'api_health',
    category: 'api',
    checkIntervalMs: 30 * 1000,
    timeoutMs: 10000,
    thresholds: {
      warning: 1, // 1 échec
      error: 3, // 3 échecs
      critical: 5, // 5 échecs
    },
    onWarning: { type: 'log' },
    onError: { type: 'repair', strategyId: 'reconnect_api' },
    onCritical: { type: 'repair', strategyId: 'fallback_mode' },
  },
  {
    id: 'response_time',
    name: 'Temps de Réponse',
    enabled: true,
    target: 'response_time',
    category: 'performance',
    checkIntervalMs: 15 * 1000,
    timeoutMs: 5000,
    thresholds: {
      warning: 500, // 500ms
      error: 2000, // 2s
      critical: 5000, // 5s
    },
    onWarning: { type: 'log' },
    onError: { type: 'notify', message: 'Performance dégradée' },
    onCritical: { type: 'repair', strategyId: 'restart_service' },
  },
  {
    id: 'error_rate',
    name: "Taux d'Erreurs",
    enabled: true,
    target: 'error_rate',
    category: 'state',
    checkIntervalMs: 60 * 1000,
    timeoutMs: 5000,
    thresholds: {
      warning: 5, // 5%
      error: 15, // 15%
      critical: 30, // 30%
    },
    onWarning: { type: 'log' },
    onError: { type: 'repair', strategyId: 'clear_error_state' },
    onCritical: { type: 'escalate' },
  },
  {
    id: 'queue_length',
    name: 'Longueur Queue',
    enabled: true,
    target: 'queue_length',
    category: 'performance',
    checkIntervalMs: 5 * 1000,
    timeoutMs: 2000,
    thresholds: {
      warning: 50,
      error: 100,
      critical: 200,
    },
    onWarning: { type: 'log' },
    onError: { type: 'notify', message: 'Queue surchargée' },
    onCritical: { type: 'repair', strategyId: 'clear_queue' },
  },
  {
    id: 'network_latency',
    name: 'Latence Réseau',
    enabled: true,
    target: 'network',
    category: 'network',
    checkIntervalMs: 20 * 1000,
    timeoutMs: 10000,
    thresholds: {
      warning: 300, // 300ms
      error: 1000, // 1s
      critical: 3000, // 3s
    },
    onWarning: { type: 'log' },
    onError: { type: 'notify', message: 'Latence réseau élevée' },
    onCritical: { type: 'repair', strategyId: 'reconnect_network' },
  },
  {
    id: 'storage_usage',
    name: 'Utilisation Stockage',
    enabled: true,
    target: 'storage',
    category: 'storage',
    checkIntervalMs: 60 * 1000,
    timeoutMs: 5000,
    thresholds: {
      warning: 75,
      error: 90,
      critical: 98,
    },
    onWarning: { type: 'notify', message: 'Espace disque limité' },
    onError: { type: 'repair', strategyId: 'clear_cache' },
    onCritical: { type: 'repair', strategyId: 'emergency_storage_clear' },
  },
];

// ============================================================================
// STRATÉGIES DE RÉPARATION
// ============================================================================

export const REPAIR_STRATEGIES: RepairStrategy[] = [
  // Mémoire
  {
    id: 'garbage_collect',
    name: 'Nettoyage Mémoire',
    description: 'Déclenche le garbage collector et libère la mémoire inutilisée',
    type: 'garbage_collect',
    category: 'memory',
    applicableIssueCodes: ['HIGH_MEMORY_USAGE', 'MEMORY_LEAK'],
    priority: 80,
    automated: true,
    requiresRestart: false,
    estimatedDurationMs: 500,
    riskLevel: 'low',
    sideEffects: ['Légère pause possible'],
    rollbackable: false,
  },
  {
    id: 'emergency_memory_clear',
    name: 'Nettoyage Mémoire Urgent',
    description: 'Vide les caches et libère agressivement la mémoire',
    type: 'clear_cache',
    category: 'memory',
    applicableIssueCodes: ['CRITICAL_MEMORY_USAGE', 'OUT_OF_MEMORY'],
    priority: 100,
    automated: true,
    requiresRestart: false,
    estimatedDurationMs: 2000,
    riskLevel: 'medium',
    sideEffects: ['Perte des données en cache', 'Ralentissement temporaire'],
    rollbackable: false,
  },

  // Performance
  {
    id: 'clear_cache',
    name: 'Vider le Cache',
    description: 'Vide tous les caches applicatifs',
    type: 'clear_cache',
    category: 'performance',
    applicableIssueCodes: ['CACHE_CORRUPTION', 'STALE_CACHE'],
    priority: 60,
    automated: true,
    requiresRestart: false,
    estimatedDurationMs: 1000,
    riskLevel: 'low',
    sideEffects: ['Rechargement des données'],
    rollbackable: false,
  },
  {
    id: 'restart_service',
    name: 'Redémarrer le Service',
    description: 'Redémarre le service concerné',
    type: 'restart_service',
    category: 'performance',
    applicableIssueCodes: ['SERVICE_UNRESPONSIVE', 'SERVICE_DEGRADED'],
    priority: 70,
    automated: true,
    requiresRestart: true,
    estimatedDurationMs: 5000,
    riskLevel: 'medium',
    sideEffects: ['Interruption temporaire'],
    rollbackable: true,
    rollbackStrategy: 'restore_previous_state',
  },
  {
    id: 'clear_queue',
    name: 'Vider la Queue',
    description: 'Vide la queue des opérations en attente',
    type: 'reset_state',
    category: 'performance',
    applicableIssueCodes: ['QUEUE_OVERFLOW', 'QUEUE_BLOCKED'],
    priority: 75,
    automated: true,
    requiresRestart: false,
    estimatedDurationMs: 500,
    riskLevel: 'medium',
    sideEffects: ['Perte des opérations en attente'],
    rollbackable: false,
  },

  // Réseau
  {
    id: 'reconnect_api',
    name: 'Reconnecter API',
    description: 'Rétablit la connexion aux APIs',
    type: 'reconnect',
    category: 'network',
    applicableIssueCodes: ['API_DISCONNECTED', 'API_TIMEOUT'],
    priority: 80,
    automated: true,
    requiresRestart: false,
    estimatedDurationMs: 3000,
    riskLevel: 'low',
    sideEffects: [],
    rollbackable: false,
  },
  {
    id: 'reconnect_network',
    name: 'Reconnecter Réseau',
    description: 'Réinitialise les connexions réseau',
    type: 'reconnect',
    category: 'network',
    applicableIssueCodes: ['NETWORK_ERROR', 'CONNECTION_LOST'],
    priority: 85,
    automated: true,
    requiresRestart: false,
    estimatedDurationMs: 5000,
    riskLevel: 'low',
    sideEffects: ['Reconnexion requise'],
    rollbackable: false,
  },
  {
    id: 'fallback_mode',
    name: 'Mode Dégradé',
    description: 'Active le mode dégradé avec fonctionnalités réduites',
    type: 'fallback_mode',
    category: 'api',
    applicableIssueCodes: ['API_UNAVAILABLE', 'CRITICAL_ERROR'],
    priority: 90,
    automated: true,
    requiresRestart: false,
    estimatedDurationMs: 1000,
    riskLevel: 'medium',
    sideEffects: ['Fonctionnalités limitées'],
    rollbackable: true,
    rollbackStrategy: 'restore_full_mode',
  },

  // État
  {
    id: 'clear_error_state',
    name: 'Effacer État Erreur',
    description: "Réinitialise les compteurs d'erreurs",
    type: 'reset_state',
    category: 'state',
    applicableIssueCodes: ['ERROR_RATE_HIGH', 'STATE_CORRUPTED'],
    priority: 50,
    automated: true,
    requiresRestart: false,
    estimatedDurationMs: 200,
    riskLevel: 'low',
    sideEffects: [],
    rollbackable: false,
  },
  {
    id: 'restore_backup',
    name: 'Restaurer Sauvegarde',
    description: 'Restaure depuis le dernier point de récupération',
    type: 'restore_backup',
    category: 'state',
    applicableIssueCodes: ['STATE_CORRUPTED', 'DATA_LOSS'],
    priority: 95,
    automated: false,
    requiresRestart: true,
    estimatedDurationMs: 10000,
    riskLevel: 'high',
    sideEffects: ['Perte des modifications récentes'],
    rollbackable: true,
    rollbackStrategy: 'restore_current_backup',
  },

  // Stockage
  {
    id: 'emergency_storage_clear',
    name: 'Libérer Stockage Urgent',
    description: 'Supprime les fichiers temporaires et anciens logs',
    type: 'clear_cache',
    category: 'storage',
    applicableIssueCodes: ['STORAGE_FULL', 'DISK_SPACE_LOW'],
    priority: 90,
    automated: true,
    requiresRestart: false,
    estimatedDurationMs: 5000,
    riskLevel: 'medium',
    sideEffects: ['Suppression de fichiers temporaires'],
    rollbackable: false,
  },

  // Audio
  {
    id: 'restart_audio',
    name: 'Redémarrer Audio',
    description: 'Réinitialise le système audio/TTS',
    type: 'restart_service',
    category: 'audio',
    applicableIssueCodes: ['AUDIO_ERROR', 'TTS_FAILURE'],
    priority: 70,
    automated: true,
    requiresRestart: false,
    estimatedDurationMs: 2000,
    riskLevel: 'low',
    sideEffects: ['Interruption audio temporaire'],
    rollbackable: false,
  },
];

// ============================================================================
// CODES D'ISSUES
// ============================================================================

export const ISSUE_CODES: Record<
  string,
  { category: IssueCategory; description: string }
> = {
  // Mémoire
  HIGH_MEMORY_USAGE: { category: 'memory', description: 'Utilisation mémoire élevée' },
  CRITICAL_MEMORY_USAGE: {
    category: 'memory',
    description: 'Utilisation mémoire critique',
  },
  MEMORY_LEAK: { category: 'memory', description: 'Fuite mémoire détectée' },
  OUT_OF_MEMORY: { category: 'memory', description: 'Mémoire insuffisante' },

  // Performance
  SLOW_RESPONSE: { category: 'performance', description: 'Temps de réponse lent' },
  SERVICE_UNRESPONSIVE: { category: 'performance', description: 'Service non répondant' },
  SERVICE_DEGRADED: { category: 'performance', description: 'Service dégradé' },
  QUEUE_OVERFLOW: { category: 'performance', description: 'Queue surchargée' },
  QUEUE_BLOCKED: { category: 'performance', description: 'Queue bloquée' },

  // Réseau
  NETWORK_ERROR: { category: 'network', description: 'Erreur réseau' },
  CONNECTION_LOST: { category: 'network', description: 'Connexion perdue' },
  HIGH_LATENCY: { category: 'network', description: 'Latence élevée' },

  // API
  API_DISCONNECTED: { category: 'api', description: 'API déconnectée' },
  API_TIMEOUT: { category: 'api', description: 'Timeout API' },
  API_UNAVAILABLE: { category: 'api', description: 'API indisponible' },
  API_RATE_LIMITED: { category: 'api', description: 'Limite de taux atteinte' },

  // Stockage
  STORAGE_FULL: { category: 'storage', description: 'Stockage plein' },
  DISK_SPACE_LOW: { category: 'storage', description: 'Espace disque faible' },
  CACHE_CORRUPTION: { category: 'storage', description: 'Cache corrompu' },
  STALE_CACHE: { category: 'storage', description: 'Cache périmé' },

  // Audio
  AUDIO_ERROR: { category: 'audio', description: 'Erreur audio' },
  TTS_FAILURE: { category: 'audio', description: 'Échec TTS' },

  // État
  STATE_CORRUPTED: { category: 'state', description: 'État corrompu' },
  ERROR_RATE_HIGH: { category: 'state', description: "Taux d'erreurs élevé" },
  DATA_LOSS: { category: 'state', description: 'Perte de données' },

  // Sync
  SYNC_FAILED: { category: 'sync', description: 'Synchronisation échouée' },
  SYNC_CONFLICT: { category: 'sync', description: 'Conflit de synchronisation' },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtient la stratégie de réparation pour un code d'issue
 */
export function getRepairStrategiesForIssue(issueCode: string): RepairStrategy[] {
  return REPAIR_STRATEGIES.filter(s => s.applicableIssueCodes.includes(issueCode)).sort(
    (a, b) => b.priority - a.priority
  );
}

/**
 * Obtient un watchdog par ID
 */
export function getWatchdogConfig(id: string): WatchdogConfig | undefined {
  return WATCHDOG_CONFIGS.find(w => w.id === id);
}

/**
 * Obtient les watchdogs pour une catégorie
 */
export function getWatchdogsForCategory(category: IssueCategory): WatchdogConfig[] {
  return WATCHDOG_CONFIGS.filter(w => w.category === category);
}
