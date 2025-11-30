/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN & MONITORING ENGINE — Configuration & Types
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        adminEngine.config.ts
 * @version     vΩ∞Ω+
 * @phase       A — Design Conceptuel + Types Complets
 *
 * ARCHITECTURE 4 SOUS-SYSTÈMES:
 * 1. State Aggregator — Collecte états/métriques/logs des moteurs
 * 2. Log/Event Engine — Timeline unifiée, filtrage, recherche
 * 3. Admin Actions Engine — Catalogue actions safe, permissions
 * 4. Admin Presentation Layer — Synthèse vitals, UI transformation
 *
 * POSTE DE COMMANDE CENTRAL TITANE∞
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// =============================================================================
// TYPES FONDAMENTAUX — SANTÉ & NIVEAUX
// =============================================================================

/**
 * Niveau de santé global du système
 */
export type HealthLevel = 'OK' | 'WARNING' | 'ALERT' | 'CRITICAL';

/**
 * Niveau de sévérité des logs
 */
export type LogSeverity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

/**
 * Catégorie de log
 */
export type LogCategory = 'INFO' | 'WARN' | 'ERROR' | 'ACTION' | 'SYSTEM' | 'SECURITY' | 'PERFORMANCE';

/**
 * Statut d'un module TITANE∞
 */
export type ModuleHealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE' | 'RECOVERING' | 'UNKNOWN';

/**
 * Identifiant des modules TITANE∞ surveillés
 */
export type TitaneModule =
  | 'selfHealing'
  | 'performance'
  | 'memory'
  | 'prompt'
  | 'cognitive'
  | 'tools'
  | 'search'
  | 'xp'
  | 'evolution'
  | 'tts'
  | 'avatar'
  | 'chat'
  | 'ollama'
  | 'gemini'
  | 'tauri'
  | 'vite'
  | 'admin';

/**
 * Rôle administrateur
 */
export type AdminRole = 'ADMIN' | 'DEV' | 'USER';

/**
 * Niveau de permission requis pour une action
 */
export type PermissionLevel = 'ADMIN_ONLY' | 'DEV_OR_ADMIN' | 'ALL';

/**
 * Catégorie d'action admin
 */
export type ActionCategory =
  | 'CACHE'
  | 'RESET'
  | 'CONFIG'
  | 'HEALING'
  | 'PERFORMANCE'
  | 'LOGS'
  | 'SYSTEM';

/**
 * Résultat d'une action admin
 */
export type ActionResult = 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'DENIED' | 'CANCELLED';

/**
 * Type de source d'événement
 */
export type EventSource =
  | 'SYSTEM'
  | 'USER_ACTION'
  | 'AUTO_HEALING'
  | 'PERFORMANCE'
  | 'SECURITY'
  | 'SCHEDULED';

// =============================================================================
// INTERFACES — ÉTAT GLOBAL & VITALS
// =============================================================================

/**
 * Métriques vitales du système
 */
export interface AdminVitals {
  /** Timestamp de collecte */
  timestamp: number;

  /** CPU process TITANE∞ (0-100%) */
  cpuProcess: number;

  /** CPU global système (0-100%) */
  cpuGlobal: number;

  /** RAM process TITANE∞ (bytes) */
  ramProcess: number;

  /** RAM process en pourcentage */
  ramProcessPercent: number;

  /** RAM système utilisée (bytes) */
  ramSystemUsed: number;

  /** RAM système totale (bytes) */
  ramSystemTotal: number;

  /** IO lecture (bytes/s) */
  ioReadRate: number;

  /** IO écriture (bytes/s) */
  ioWriteRate: number;

  /** Latence Tauri invoke (ms) */
  tauriLatency: number;

  /** Latence Ollama (ms) */
  ollamaLatency: number;

  /** Latence Gemini (ms) */
  geminiLatency: number;

  /** FPS React/Webview */
  fps: number;

  /** Nombre de threads actifs */
  threadsActive: number;

  /** Uptime système (ms) */
  uptime: number;
}

/**
 * Statut d'un module individuel
 */
export interface ModuleStatus {
  /** Identifiant du module */
  moduleId: TitaneModule;

  /** Nom affiché */
  displayName: string;

  /** Statut de santé */
  status: ModuleHealthStatus;

  /** Dernière vérification */
  lastCheck: number;

  /** Dernière erreur (null si aucune) */
  lastError: string | null;

  /** Nombre d'erreurs depuis démarrage */
  errorCount: number;

  /** Nombre de tentatives de healing */
  healAttempts: number;

  /** Latence moyenne (ms) */
  avgLatency: number;

  /** Opérations en attente */
  pendingOps: number;

  /** Métriques spécifiques au module */
  metrics: Record<string, number>;

  /** Anomalies actives */
  activeAnomalies: number;
}

/**
 * Snapshot complet de l'état admin
 */
export interface AdminSnapshot {
  /** ID unique du snapshot */
  id: string;

  /** Timestamp de création */
  timestamp: number;

  /** Niveau de santé global */
  healthLevel: HealthLevel;

  /** Message de statut global */
  statusMessage: string;

  /** Métriques vitales */
  vitals: AdminVitals;

  /** Statut de chaque module */
  modules: Record<TitaneModule, ModuleStatus>;

  /** Anomalies actives (issues du Performance Engine) */
  activeAnomalies: AdminAnomaly[];

  /** Actions récentes effectuées */
  recentActions: AdminActionRecord[];

  /** Score de santé global (0-100) */
  healthScore: number;

  /** Grade de performance (S/A/B/C/D/F) */
  performanceGrade: string;

  /** Mode actuel du système */
  systemMode: SystemMode;
}

/**
 * Mode du système
 */
export type SystemMode = 'NORMAL' | 'SAFE_MODE' | 'PROFILING' | 'MAINTENANCE' | 'RECOVERY';

/**
 * Anomalie détectée
 */
export interface AdminAnomaly {
  /** ID unique */
  id: string;

  /** Module concerné */
  moduleId: TitaneModule;

  /** Type d'anomalie */
  type: string;

  /** Sévérité */
  severity: LogSeverity;

  /** Message descriptif */
  message: string;

  /** Timestamp de détection */
  detectedAt: number;

  /** Durée de l'anomalie (ms) */
  duration: number;

  /** Contexte additionnel */
  context: Record<string, unknown>;

  /** Actions correctives suggérées */
  suggestedActions: string[];

  /** Auto-réparé ? */
  autoHealed: boolean;
}

// =============================================================================
// INTERFACES — LOGS & ÉVÉNEMENTS
// =============================================================================

/**
 * Enregistrement de log structuré
 */
export interface AdminLogRecord {
  /** ID unique */
  id: string;

  /** Timestamp */
  timestamp: number;

  /** Niveau de sévérité */
  severity: LogSeverity;

  /** Catégorie */
  category: LogCategory;

  /** Module source */
  moduleId: TitaneModule;

  /** Message principal */
  message: string;

  /** Détails additionnels */
  details?: string;

  /** Stack trace (si erreur) */
  stackTrace?: string;

  /** Contexte métadonnées */
  context: Record<string, unknown>;

  /** Tags pour recherche */
  tags: string[];

  /** Corrélation avec d'autres logs */
  correlationId?: string;
}

/**
 * Événement système pour la timeline
 */
export interface AdminEvent {
  /** ID unique */
  id: string;

  /** Timestamp */
  timestamp: number;

  /** Source de l'événement */
  source: EventSource;

  /** Type d'événement */
  type: string;

  /** Module concerné */
  moduleId: TitaneModule;

  /** Titre court */
  title: string;

  /** Description complète */
  description: string;

  /** Sévérité */
  severity: LogSeverity;

  /** Impact sur le système */
  impact: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  /** Durée de l'événement (ms, si applicable) */
  duration?: number;

  /** Données associées */
  data: Record<string, unknown>;

  /** Événements liés */
  relatedEvents: string[];

  /** Résolu ? */
  resolved: boolean;
}

/**
 * Filtres pour la recherche de logs
 */
export interface LogFilters {
  /** Période de début */
  startTime?: number;

  /** Période de fin */
  endTime?: number;

  /** Modules à inclure */
  modules?: TitaneModule[];

  /** Sévérités à inclure */
  severities?: LogSeverity[];

  /** Catégories à inclure */
  categories?: LogCategory[];

  /** Recherche textuelle */
  searchText?: string;

  /** Tags requis */
  tags?: string[];

  /** Limite de résultats */
  limit?: number;

  /** Offset pour pagination */
  offset?: number;

  /** Tri (asc/desc) */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Résultat de recherche de logs
 */
export interface LogSearchResult {
  /** Logs trouvés */
  logs: AdminLogRecord[];

  /** Total sans pagination */
  totalCount: number;

  /** Page actuelle */
  page: number;

  /** Taille de page */
  pageSize: number;

  /** Temps de recherche (ms) */
  searchTimeMs: number;
}

// =============================================================================
// INTERFACES — ACTIONS ADMIN
// =============================================================================

/**
 * Définition d'une action admin disponible
 */
export interface AdminActionDefinition {
  /** ID unique de l'action */
  id: string;

  /** Nom affiché */
  displayName: string;

  /** Description */
  description: string;

  /** Catégorie */
  category: ActionCategory;

  /** Module cible (null = global) */
  targetModule: TitaneModule | null;

  /** Niveau de permission requis */
  permissionLevel: PermissionLevel;

  /** Action réversible ? */
  reversible: boolean;

  /** Nécessite confirmation ? */
  requiresConfirmation: boolean;

  /** Icône (Lucide icon name) */
  icon: string;

  /** Couleur indicative */
  color: 'neutral' | 'warning' | 'danger' | 'success';

  /** Préconditions requises */
  preconditions: ActionPrecondition[];

  /** Temps estimé d'exécution (ms) */
  estimatedDuration: number;

  /** Tags pour recherche */
  tags: string[];
}

/**
 * Précondition pour une action
 */
export interface ActionPrecondition {
  /** Type de condition */
  type: 'MODULE_STATUS' | 'HEALTH_LEVEL' | 'SYSTEM_MODE' | 'CUSTOM';

  /** Module concerné (si applicable) */
  moduleId?: TitaneModule;

  /** Valeur attendue */
  expectedValue: string | string[];

  /** Message si non remplie */
  failureMessage: string;
}

/**
 * Requête d'exécution d'action
 */
export interface AdminActionRequest {
  /** ID de l'action */
  actionId: string;

  /** Rôle de l'utilisateur */
  userRole: AdminRole;

  /** Paramètres optionnels */
  params?: Record<string, unknown>;

  /** ID de corrélation */
  correlationId: string;

  /** Timestamp de la requête */
  requestedAt: number;

  /** Raison fournie par l'utilisateur */
  reason?: string;
}

/**
 * Résultat d'exécution d'action
 */
export interface AdminActionResult {
  /** ID de la requête */
  requestId: string;

  /** ID de l'action */
  actionId: string;

  /** Résultat */
  result: ActionResult;

  /** Message de résultat */
  message: string;

  /** Détails additionnels */
  details?: string;

  /** Timestamp de début */
  startedAt: number;

  /** Timestamp de fin */
  completedAt: number;

  /** Durée (ms) */
  duration: number;

  /** Erreur (si échec) */
  error?: string;

  /** Données retournées */
  data?: Record<string, unknown>;

  /** Action de rollback disponible ? */
  rollbackAvailable: boolean;
}

/**
 * Enregistrement d'action effectuée
 */
export interface AdminActionRecord {
  /** ID unique */
  id: string;

  /** Requête originale */
  request: AdminActionRequest;

  /** Résultat */
  result: AdminActionResult;

  /** Log associé */
  logId?: string;
}

// =============================================================================
// INTERFACES — DASHBOARD & PRÉSENTATION
// =============================================================================

/**
 * État complet du dashboard admin
 */
export interface AdminDashboardState {
  /** Snapshot actuel */
  snapshot: AdminSnapshot | null;

  /** Chargement en cours */
  isLoading: boolean;

  /** Erreur actuelle */
  error: string | null;

  /** Dernière mise à jour */
  lastUpdate: number;

  /** Intervalle de rafraîchissement (ms) */
  refreshInterval: number;

  /** Pause du rafraîchissement */
  isPaused: boolean;

  /** Filtres de logs actifs */
  logFilters: LogFilters;

  /** Logs affichés */
  logs: AdminLogRecord[];

  /** Timeline d'événements */
  timeline: AdminEvent[];

  /** Actions disponibles (filtrées par rôle) */
  availableActions: AdminActionDefinition[];

  /** Rôle actuel de l'utilisateur */
  currentRole: AdminRole;

  /** Vue active */
  activeView: AdminView;

  /** Panneaux ouverts */
  expandedPanels: string[];
}

/**
 * Vue active du dashboard
 */
export type AdminView = 'OVERVIEW' | 'LOGS' | 'TIMELINE' | 'ACTIONS' | 'MODULES' | 'SETTINGS';

/**
 * Configuration du dashboard
 */
export interface AdminDashboardConfig {
  /** Intervalle de polling par défaut (ms) */
  defaultPollingInterval: number;

  /** Nombre max de logs à afficher */
  maxLogsDisplay: number;

  /** Nombre max d'événements timeline */
  maxTimelineEvents: number;

  /** Rétention des logs (jours) */
  logRetentionDays: number;

  /** Activer les notifications */
  enableNotifications: boolean;

  /** Seuils d'alerte personnalisés */
  alertThresholds: AlertThresholds;

  /** Modules à surveiller */
  monitoredModules: TitaneModule[];

  /** Actions autorisées par rôle */
  rolePermissions: Record<AdminRole, string[]>;
}

/**
 * Seuils d'alerte personnalisés
 */
export interface AlertThresholds {
  /** CPU warning (%) */
  cpuWarning: number;
  /** CPU critical (%) */
  cpuCritical: number;
  /** RAM warning (%) */
  ramWarning: number;
  /** RAM critical (%) */
  ramCritical: number;
  /** FPS warning */
  fpsWarning: number;
  /** FPS critical */
  fpsCritical: number;
  /** Latence IA warning (ms) */
  iaLatencyWarning: number;
  /** Latence IA critical (ms) */
  iaLatencyCritical: number;
  /** Erreurs warning (count) */
  errorCountWarning: number;
  /** Erreurs critical (count) */
  errorCountCritical: number;
}

// =============================================================================
// INTERFACES — RÉTENTION & PURGE
// =============================================================================

/**
 * Configuration de rétention des données
 */
export interface RetentionConfig {
  /** Rétention logs (jours) */
  logsRetentionDays: number;

  /** Rétention événements (jours) */
  eventsRetentionDays: number;

  /** Rétention actions (jours) */
  actionsRetentionDays: number;

  /** Taille max buffer logs (entries) */
  maxLogBufferSize: number;

  /** Taille max buffer events (entries) */
  maxEventBufferSize: number;

  /** Purge automatique activée */
  autoPurgeEnabled: boolean;

  /** Intervalle de purge auto (heures) */
  autoPurgeIntervalHours: number;

  /** Chemin de sauvegarde locale */
  localBackupPath: string;

  /** Conserver backup avant purge */
  keepBackupBeforePurge: boolean;
}

/**
 * Résultat d'une opération de purge
 */
export interface PurgeResult {
  /** Timestamp de l'opération */
  timestamp: number;

  /** Type de données purgées */
  dataType: 'LOGS' | 'EVENTS' | 'ACTIONS' | 'ALL';

  /** Nombre d'entrées supprimées */
  deletedCount: number;

  /** Espace libéré (bytes) */
  freedBytes: number;

  /** Backup créé */
  backupCreated: boolean;

  /** Chemin du backup */
  backupPath?: string;

  /** Succès */
  success: boolean;

  /** Message */
  message: string;
}

// =============================================================================
// CONSTANTES — ACTIONS ADMIN CATALOGUE
// =============================================================================

/**
 * Catalogue complet des actions admin disponibles
 */
export const ADMIN_ACTIONS_CATALOG: AdminActionDefinition[] = [
  // === CACHE ===
  {
    id: 'purge_tts_cache',
    displayName: 'Purger Cache TTS',
    description: 'Supprime les fichiers audio TTS en cache pour libérer de l\'espace',
    category: 'CACHE',
    targetModule: 'tts',
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: false,
    requiresConfirmation: true,
    icon: 'Trash2',
    color: 'warning',
    preconditions: [],
    estimatedDuration: 2000,
    tags: ['cache', 'tts', 'cleanup', 'storage'],
  },
  {
    id: 'purge_memory_cache',
    displayName: 'Purger Cache Mémoire Résumée',
    description: 'Supprime les résumés de mémoire en cache (mémoire persistante préservée)',
    category: 'CACHE',
    targetModule: 'memory',
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: false,
    requiresConfirmation: true,
    icon: 'Database',
    color: 'warning',
    preconditions: [],
    estimatedDuration: 1500,
    tags: ['cache', 'memory', 'cleanup'],
  },
  {
    id: 'purge_old_logs',
    displayName: 'Purger Logs Anciens',
    description: 'Supprime les logs de plus de 7 jours avec backup optionnel',
    category: 'LOGS',
    targetModule: 'admin',
    permissionLevel: 'ADMIN_ONLY',
    reversible: false,
    requiresConfirmation: true,
    icon: 'FileX',
    color: 'warning',
    preconditions: [],
    estimatedDuration: 5000,
    tags: ['logs', 'cleanup', 'maintenance'],
  },

  // === RESET ===
  {
    id: 'reset_tts_engine',
    displayName: 'Réinitialiser TTS Engine',
    description: 'Redémarre le moteur TTS et réinitialise sa configuration',
    category: 'RESET',
    targetModule: 'tts',
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: true,
    requiresConfirmation: true,
    icon: 'RefreshCw',
    color: 'warning',
    preconditions: [],
    estimatedDuration: 3000,
    tags: ['reset', 'tts', 'engine'],
  },
  {
    id: 'reset_ollama_engine',
    displayName: 'Réinitialiser Ollama',
    description: 'Redémarre la connexion Ollama et réinitialise le pipeline',
    category: 'RESET',
    targetModule: 'ollama',
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: true,
    requiresConfirmation: true,
    icon: 'Bot',
    color: 'warning',
    preconditions: [],
    estimatedDuration: 5000,
    tags: ['reset', 'ollama', 'ia', 'engine'],
  },
  {
    id: 'reset_performance_state',
    displayName: 'Réinitialiser État Performance',
    description: 'Remet à zéro les métriques et compteurs de performance',
    category: 'RESET',
    targetModule: 'performance',
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: false,
    requiresConfirmation: true,
    icon: 'Gauge',
    color: 'neutral',
    preconditions: [],
    estimatedDuration: 1000,
    tags: ['reset', 'performance', 'metrics'],
  },

  // === CONFIG ===
  {
    id: 'reload_ia_config',
    displayName: 'Recharger Config IA',
    description: 'Recharge la configuration des providers IA (Ollama, Gemini)',
    category: 'CONFIG',
    targetModule: null,
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: true,
    requiresConfirmation: false,
    icon: 'Settings',
    color: 'neutral',
    preconditions: [],
    estimatedDuration: 2000,
    tags: ['config', 'ia', 'reload'],
  },
  {
    id: 'reload_vite_watchers',
    displayName: 'Relancer Watchers Vite',
    description: 'Redémarre les watchers de fichiers Vite pour le dev',
    category: 'CONFIG',
    targetModule: 'vite',
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: true,
    requiresConfirmation: false,
    icon: 'Eye',
    color: 'neutral',
    preconditions: [
      {
        type: 'SYSTEM_MODE',
        expectedValue: ['NORMAL', 'PROFILING'],
        failureMessage: 'Vite watchers ne peuvent être relancés qu\'en mode normal ou profiling',
      },
    ],
    estimatedDuration: 3000,
    tags: ['config', 'vite', 'dev', 'watchers'],
  },

  // === HEALING ===
  {
    id: 'run_playbook_memory_repair',
    displayName: 'Playbook: Réparation Mémoire',
    description: 'Exécute le playbook de réparation de la mémoire persistante',
    category: 'HEALING',
    targetModule: 'memory',
    permissionLevel: 'ADMIN_ONLY',
    reversible: false,
    requiresConfirmation: true,
    icon: 'Wrench',
    color: 'danger',
    preconditions: [
      {
        type: 'MODULE_STATUS',
        moduleId: 'selfHealing',
        expectedValue: ['HEALTHY', 'DEGRADED'],
        failureMessage: 'Self-Healing Engine doit être actif',
      },
    ],
    estimatedDuration: 10000,
    tags: ['healing', 'playbook', 'memory', 'repair'],
  },
  {
    id: 'run_playbook_ia_fallback',
    displayName: 'Playbook: Fallback IA',
    description: 'Exécute le playbook de basculement vers un provider IA alternatif',
    category: 'HEALING',
    targetModule: null,
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: true,
    requiresConfirmation: true,
    icon: 'GitBranch',
    color: 'warning',
    preconditions: [],
    estimatedDuration: 5000,
    tags: ['healing', 'playbook', 'ia', 'fallback'],
  },
  {
    id: 'run_mini_audit',
    displayName: 'Mini-Audit Système',
    description: 'Exécute un audit rapide de l\'intégrité du système',
    category: 'HEALING',
    targetModule: null,
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: false,
    requiresConfirmation: false,
    icon: 'Search',
    color: 'neutral',
    preconditions: [],
    estimatedDuration: 8000,
    tags: ['healing', 'audit', 'integrity', 'check'],
  },

  // === PERFORMANCE ===
  {
    id: 'enable_profiling_mode',
    displayName: 'Activer Mode Profiling',
    description: 'Active le mode profiling pour collecter des métriques détaillées',
    category: 'PERFORMANCE',
    targetModule: 'performance',
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: true,
    requiresConfirmation: true,
    icon: 'Activity',
    color: 'warning',
    preconditions: [
      {
        type: 'SYSTEM_MODE',
        expectedValue: ['NORMAL'],
        failureMessage: 'Le système doit être en mode normal pour activer le profiling',
      },
    ],
    estimatedDuration: 500,
    tags: ['performance', 'profiling', 'debug'],
  },
  {
    id: 'disable_profiling_mode',
    displayName: 'Désactiver Mode Profiling',
    description: 'Désactive le mode profiling et revient en mode normal',
    category: 'PERFORMANCE',
    targetModule: 'performance',
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: true,
    requiresConfirmation: false,
    icon: 'ActivitySquare',
    color: 'success',
    preconditions: [
      {
        type: 'SYSTEM_MODE',
        expectedValue: ['PROFILING'],
        failureMessage: 'Le mode profiling doit être actif',
      },
    ],
    estimatedDuration: 500,
    tags: ['performance', 'profiling', 'disable'],
  },
  {
    id: 'force_gc',
    displayName: 'Forcer Garbage Collection',
    description: 'Force un cycle de garbage collection pour libérer la mémoire',
    category: 'PERFORMANCE',
    targetModule: null,
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: false,
    requiresConfirmation: false,
    icon: 'Trash',
    color: 'neutral',
    preconditions: [],
    estimatedDuration: 1000,
    tags: ['performance', 'gc', 'memory', 'cleanup'],
  },

  // === SYSTEM ===
  {
    id: 'enable_safe_mode',
    displayName: 'Activer Safe Mode',
    description: 'Active le mode sécurisé TITANE∞ avec fonctionnalités réduites',
    category: 'SYSTEM',
    targetModule: null,
    permissionLevel: 'ADMIN_ONLY',
    reversible: true,
    requiresConfirmation: true,
    icon: 'Shield',
    color: 'danger',
    preconditions: [],
    estimatedDuration: 2000,
    tags: ['system', 'safe-mode', 'security'],
  },
  {
    id: 'disable_safe_mode',
    displayName: 'Désactiver Safe Mode',
    description: 'Désactive le mode sécurisé et restaure les fonctionnalités complètes',
    category: 'SYSTEM',
    targetModule: null,
    permissionLevel: 'ADMIN_ONLY',
    reversible: true,
    requiresConfirmation: true,
    icon: 'ShieldOff',
    color: 'success',
    preconditions: [
      {
        type: 'SYSTEM_MODE',
        expectedValue: ['SAFE_MODE'],
        failureMessage: 'Le système doit être en Safe Mode',
      },
    ],
    estimatedDuration: 2000,
    tags: ['system', 'safe-mode', 'disable'],
  },
  {
    id: 'sync_all_modules',
    displayName: 'Synchroniser Tous les Modules',
    description: 'Force une synchronisation d\'état entre tous les modules TITANE∞',
    category: 'SYSTEM',
    targetModule: null,
    permissionLevel: 'DEV_OR_ADMIN',
    reversible: false,
    requiresConfirmation: true,
    icon: 'RefreshCcw',
    color: 'neutral',
    preconditions: [],
    estimatedDuration: 5000,
    tags: ['system', 'sync', 'modules'],
  },
];

// =============================================================================
// CONSTANTES — CONFIGURATION PAR DÉFAUT
// =============================================================================

/**
 * Configuration par défaut des seuils d'alerte
 */
export const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  cpuWarning: 70,
  cpuCritical: 90,
  ramWarning: 75,
  ramCritical: 90,
  fpsWarning: 30,
  fpsCritical: 15,
  iaLatencyWarning: 3000,
  iaLatencyCritical: 10000,
  errorCountWarning: 10,
  errorCountCritical: 50,
};

/**
 * Configuration par défaut de rétention
 */
export const DEFAULT_RETENTION_CONFIG: RetentionConfig = {
  logsRetentionDays: 7,
  eventsRetentionDays: 14,
  actionsRetentionDays: 30,
  maxLogBufferSize: 10000,
  maxEventBufferSize: 5000,
  autoPurgeEnabled: true,
  autoPurgeIntervalHours: 24,
  localBackupPath: './data/admin-backups',
  keepBackupBeforePurge: true,
};

/**
 * Configuration par défaut du dashboard
 */
export const DEFAULT_DASHBOARD_CONFIG: AdminDashboardConfig = {
  defaultPollingInterval: 5000,
  maxLogsDisplay: 500,
  maxTimelineEvents: 200,
  logRetentionDays: 7,
  enableNotifications: true,
  alertThresholds: DEFAULT_ALERT_THRESHOLDS,
  monitoredModules: [
    'selfHealing',
    'performance',
    'memory',
    'prompt',
    'cognitive',
    'tools',
    'search',
    'xp',
    'evolution',
    'tts',
    'avatar',
    'chat',
    'ollama',
    'gemini',
    'tauri',
  ],
  rolePermissions: {
    ADMIN: ADMIN_ACTIONS_CATALOG.map((a) => a.id),
    DEV: ADMIN_ACTIONS_CATALOG.filter((a) => a.permissionLevel !== 'ADMIN_ONLY').map((a) => a.id),
    USER: [],
  },
};

/**
 * Noms affichés des modules
 */
export const MODULE_DISPLAY_NAMES: Record<TitaneModule, string> = {
  selfHealing: 'Self-Healing Engine',
  performance: 'Performance Engine',
  memory: 'Memory Engine',
  prompt: 'Prompt Engine',
  cognitive: 'Cognitive Core',
  tools: 'Tools Engine',
  search: 'Search Engine',
  xp: 'XP Engine',
  evolution: 'Evolution Engine',
  tts: 'TTS Engine',
  avatar: 'Avatar System',
  chat: 'Chat Core',
  ollama: 'Ollama IA',
  gemini: 'Gemini IA',
  tauri: 'Tauri Backend',
  vite: 'Vite Dev Server',
  admin: 'Admin Engine',
};

/**
 * Icônes des modules (Lucide icons)
 */
export const MODULE_ICONS: Record<TitaneModule, string> = {
  selfHealing: 'Heart',
  performance: 'Gauge',
  memory: 'Database',
  prompt: 'MessageSquare',
  cognitive: 'Brain',
  tools: 'Wrench',
  search: 'Search',
  xp: 'Star',
  evolution: 'TrendingUp',
  tts: 'Volume2',
  avatar: 'User',
  chat: 'MessageCircle',
  ollama: 'Bot',
  gemini: 'Sparkles',
  tauri: 'Box',
  vite: 'Zap',
  admin: 'Settings',
};

/**
 * Couleurs des niveaux de santé
 */
export const HEALTH_LEVEL_COLORS: Record<HealthLevel, string> = {
  OK: '#22c55e',      // vert
  WARNING: '#f59e0b', // orange
  ALERT: '#f97316',   // orange foncé
  CRITICAL: '#ef4444', // rouge
};

/**
 * Couleurs des sévérités de log
 */
export const LOG_SEVERITY_COLORS: Record<LogSeverity, string> = {
  DEBUG: '#6b7280',   // gris
  INFO: '#3b82f6',    // bleu
  WARN: '#f59e0b',    // orange
  ERROR: '#ef4444',   // rouge
  CRITICAL: '#dc2626', // rouge foncé
};

/**
 * Couleurs des statuts de module
 */
export const MODULE_STATUS_COLORS: Record<ModuleHealthStatus, string> = {
  HEALTHY: '#22c55e',
  DEGRADED: '#f59e0b',
  CRITICAL: '#ef4444',
  OFFLINE: '#6b7280',
  RECOVERING: '#8b5cf6',
  UNKNOWN: '#9ca3af',
};

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Génère un ID unique pour les logs/événements
 */
export function generateAdminId(prefix: string = 'adm'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Détermine le niveau de santé global basé sur les métriques
 */
export function determineHealthLevel(
  vitals: AdminVitals,
  thresholds: AlertThresholds = DEFAULT_ALERT_THRESHOLDS
): HealthLevel {
  // Critical checks
  if (
    vitals.cpuProcess >= thresholds.cpuCritical ||
    vitals.ramProcessPercent >= thresholds.ramCritical ||
    vitals.fps <= thresholds.fpsCritical
  ) {
    return 'CRITICAL';
  }

  // Alert checks
  if (
    vitals.ollamaLatency >= thresholds.iaLatencyCritical ||
    vitals.geminiLatency >= thresholds.iaLatencyCritical
  ) {
    return 'ALERT';
  }

  // Warning checks
  if (
    vitals.cpuProcess >= thresholds.cpuWarning ||
    vitals.ramProcessPercent >= thresholds.ramWarning ||
    vitals.fps <= thresholds.fpsWarning ||
    vitals.ollamaLatency >= thresholds.iaLatencyWarning ||
    vitals.geminiLatency >= thresholds.iaLatencyWarning
  ) {
    return 'WARNING';
  }

  return 'OK';
}

/**
 * Vérifie si un rôle a la permission pour une action
 */
export function hasPermission(role: AdminRole, action: AdminActionDefinition): boolean {
  switch (action.permissionLevel) {
    case 'ADMIN_ONLY':
      return role === 'ADMIN';
    case 'DEV_OR_ADMIN':
      return role === 'ADMIN' || role === 'DEV';
    case 'ALL':
      return true;
    default:
      return false;
  }
}

/**
 * Filtre les actions disponibles pour un rôle
 */
export function getActionsForRole(role: AdminRole): AdminActionDefinition[] {
  return ADMIN_ACTIONS_CATALOG.filter((action) => hasPermission(role, action));
}

/**
 * Vérifie les préconditions d'une action
 */
export function checkPreconditions(
  action: AdminActionDefinition,
  snapshot: AdminSnapshot
): { valid: boolean; failedConditions: string[] } {
  const failedConditions: string[] = [];

  for (const precondition of action.preconditions) {
    let isValid = false;

    switch (precondition.type) {
      case 'SYSTEM_MODE': {
        const expectedModes = Array.isArray(precondition.expectedValue)
          ? precondition.expectedValue
          : [precondition.expectedValue];
        isValid = expectedModes.includes(snapshot.systemMode);
        break;
      }
      case 'MODULE_STATUS': {
        if (precondition.moduleId) {
          const moduleStatus = snapshot.modules[precondition.moduleId];
          const expectedStatuses = Array.isArray(precondition.expectedValue)
            ? precondition.expectedValue
            : [precondition.expectedValue];
          isValid = moduleStatus && expectedStatuses.includes(moduleStatus.status);
        }
        break;
      }
      case 'HEALTH_LEVEL': {
        const expectedLevels = Array.isArray(precondition.expectedValue)
          ? precondition.expectedValue
          : [precondition.expectedValue];
        isValid = expectedLevels.includes(snapshot.healthLevel);
        break;
      }
      default:
        isValid = true;
    }

    if (!isValid) {
      failedConditions.push(precondition.failureMessage);
    }
  }

  return {
    valid: failedConditions.length === 0,
    failedConditions,
  };
}

/**
 * Calcule le score de santé global (0-100)
 */
export function calculateHealthScore(
  vitals: AdminVitals,
  modules: Record<TitaneModule, ModuleStatus>,
  thresholds: AlertThresholds = DEFAULT_ALERT_THRESHOLDS
): number {
  let score = 100;

  // CPU penalty (max -20)
  if (vitals.cpuProcess >= thresholds.cpuCritical) {
    score -= 20;
  } else if (vitals.cpuProcess >= thresholds.cpuWarning) {
    score -= 10;
  }

  // RAM penalty (max -20)
  if (vitals.ramProcessPercent >= thresholds.ramCritical) {
    score -= 20;
  } else if (vitals.ramProcessPercent >= thresholds.ramWarning) {
    score -= 10;
  }

  // FPS penalty (max -20)
  if (vitals.fps <= thresholds.fpsCritical) {
    score -= 20;
  } else if (vitals.fps <= thresholds.fpsWarning) {
    score -= 10;
  }

  // IA latency penalty (max -15)
  const maxIaLatency = Math.max(vitals.ollamaLatency, vitals.geminiLatency);
  if (maxIaLatency >= thresholds.iaLatencyCritical) {
    score -= 15;
  } else if (maxIaLatency >= thresholds.iaLatencyWarning) {
    score -= 7;
  }

  // Module status penalties (max -25)
  const moduleValues = Object.values(modules);
  const criticalModules = moduleValues.filter((m) => m.status === 'CRITICAL').length;
  const degradedModules = moduleValues.filter((m) => m.status === 'DEGRADED').length;
  const offlineModules = moduleValues.filter((m) => m.status === 'OFFLINE').length;

  score -= criticalModules * 10;
  score -= degradedModules * 3;
  score -= offlineModules * 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Convertit un score de santé en grade
 */
export function scoreToGrade(score: number): string {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Formate une durée en format lisible
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}min`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Formate des bytes en format lisible
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formate un timestamp en date/heure locale
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Crée un snapshot admin vide
 */
export function createEmptySnapshot(): AdminSnapshot {
  const now = Date.now();
  const emptyVitals: AdminVitals = {
    timestamp: now,
    cpuProcess: 0,
    cpuGlobal: 0,
    ramProcess: 0,
    ramProcessPercent: 0,
    ramSystemUsed: 0,
    ramSystemTotal: 0,
    ioReadRate: 0,
    ioWriteRate: 0,
    tauriLatency: 0,
    ollamaLatency: 0,
    geminiLatency: 0,
    fps: 60,
    threadsActive: 0,
    uptime: 0,
  };

  const emptyModuleStatus = (moduleId: TitaneModule): ModuleStatus => ({
    moduleId,
    displayName: MODULE_DISPLAY_NAMES[moduleId],
    status: 'UNKNOWN',
    lastCheck: now,
    lastError: null,
    errorCount: 0,
    healAttempts: 0,
    avgLatency: 0,
    pendingOps: 0,
    metrics: {},
    activeAnomalies: 0,
  });

  const modules: Record<TitaneModule, ModuleStatus> = {
    selfHealing: emptyModuleStatus('selfHealing'),
    performance: emptyModuleStatus('performance'),
    memory: emptyModuleStatus('memory'),
    prompt: emptyModuleStatus('prompt'),
    cognitive: emptyModuleStatus('cognitive'),
    tools: emptyModuleStatus('tools'),
    search: emptyModuleStatus('search'),
    xp: emptyModuleStatus('xp'),
    evolution: emptyModuleStatus('evolution'),
    tts: emptyModuleStatus('tts'),
    avatar: emptyModuleStatus('avatar'),
    chat: emptyModuleStatus('chat'),
    ollama: emptyModuleStatus('ollama'),
    gemini: emptyModuleStatus('gemini'),
    tauri: emptyModuleStatus('tauri'),
    vite: emptyModuleStatus('vite'),
    admin: emptyModuleStatus('admin'),
  };

  return {
    id: generateAdminId('snap'),
    timestamp: now,
    healthLevel: 'OK',
    statusMessage: 'Système initialisé',
    vitals: emptyVitals,
    modules,
    activeAnomalies: [],
    recentActions: [],
    healthScore: 100,
    performanceGrade: 'S',
    systemMode: 'NORMAL',
  };
}

/**
 * Crée un log record
 */
export function createLogRecord(
  severity: LogSeverity,
  category: LogCategory,
  moduleId: TitaneModule,
  message: string,
  details?: string,
  context: Record<string, unknown> = {},
  tags: string[] = []
): AdminLogRecord {
  return {
    id: generateAdminId('log'),
    timestamp: Date.now(),
    severity,
    category,
    moduleId,
    message,
    details,
    context,
    tags,
  };
}

/**
 * Crée un événement admin
 */
export function createAdminEvent(
  source: EventSource,
  type: string,
  moduleId: TitaneModule,
  title: string,
  description: string,
  severity: LogSeverity = 'INFO',
  impact: AdminEvent['impact'] = 'NONE',
  data: Record<string, unknown> = {}
): AdminEvent {
  return {
    id: generateAdminId('evt'),
    timestamp: Date.now(),
    source,
    type,
    moduleId,
    title,
    description,
    severity,
    impact,
    data,
    relatedEvents: [],
    resolved: false,
  };
}

// =============================================================================
// EXPORTS TYPES POUR RUST (via Tauri)
// =============================================================================

/**
 * Types exportés pour génération Rust
 */
export type RustAdminTypes = {
  HealthLevel: HealthLevel;
  LogSeverity: LogSeverity;
  LogCategory: LogCategory;
  ModuleHealthStatus: ModuleHealthStatus;
  TitaneModule: TitaneModule;
  AdminRole: AdminRole;
  ActionResult: ActionResult;
  SystemMode: SystemMode;
  AdminVitals: AdminVitals;
  ModuleStatus: ModuleStatus;
  AdminSnapshot: AdminSnapshot;
  AdminLogRecord: AdminLogRecord;
  AdminEvent: AdminEvent;
  AdminActionRequest: AdminActionRequest;
  AdminActionResult: AdminActionResult;
};
