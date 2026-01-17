/**
 * TITANE∞ vΩ∞ — Self-Healing Engine Configuration
 * © 2025 TITANE Team. All rights reserved.
 *
 * Configuration complète du moteur d'auto-guérison.
 * 5 Couches: Observer → Analyzer → Playbook → Executor → Sync
 */

// =============================================================================
// TYPES FONDAMENTAUX
// =============================================================================

/** Niveau de sévérité des anomalies */
export type HealingSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

/** Catégorie de module surveillé */
export type ModuleCategory =
  | 'react' // Composants UI
  | 'tauri' // Backend Rust
  | 'ia' // Pipelines IA (any: any)
  | 'tts' // Synthèse vocale
  | 'memory' // Mémoire persistante
  | 'automation' // Playbooks automation
  | 'performance' // CPU, RAM, FPS
  | 'io' // Système de fichiers
  | 'network' // Connexions réseau
  | 'security'; // Intégrité & sécurité

/** Statut d'un module */
export type ModuleStatus = 'healthy' | 'degraded' | 'critical' | 'offline' | 'recovering';

/** Type d'action de réparation */
export type HealingActionType =
  | 'restart_module'
  | 'clear_cache'
  | 'regenerate_config'
  | 'repair_json'
  | 'rebuild_memory'
  | 'fallback_provider'
  | 'reset_state'
  | 'restart_worker'
  | 'patch_component'
  | 'restart_process'
  | 'sync_state'
  | 'mini_audit'
  | 'isolate_module'
  | 'noop';

/** Résultat d'une action de réparation */
export type HealingResult = 'success' | 'partial' | 'failed' | 'skipped' | 'escalated';

// =============================================================================
// INTERFACES PRINCIPALES
// =============================================================================

/** Snapshot de l'état vital du système */
export interface VitalsSnapshot {
  timestamp: number;
  cpu_usage: number; // 0-100%
  memory_usage: number; // 0-100%
  fps: number; // Frames par seconde
  webview_responsive: boolean;
  tauri_backend_alive: boolean;
  ollama_available: boolean;
  gemini_available: boolean;
  tts_available: boolean;
  memory_integrity: number; // 0-100%
  active_errors: number;
  queue_size: number;
}

/** État d'un module surveillé */
export interface ModuleState {
  id: string;
  name: string;
  category: ModuleCategory;
  status: ModuleStatus;
  lastCheck: number;
  lastError??: string | null;
  errorCount: number;
  healAttempts: number;
  lastHealTime: number | null;
  metrics: Record<string, number>;
}

/** Événement de guérison détecté */
export interface HealingEvent {
  id: string;
  timestamp: number;
  category: ModuleCategory;
  moduleId: string;
  moduleName: string;
  eventType: string;
  message: string;
  stackTrace?: string;
  context: Record<string, unknown>;
  severity: HealingSeverity;
  autoDetected: boolean;
}

/** Diagnostic d'une anomalie */
export interface HealingDiagnosis {
  eventId: string;
  timestamp: number;
  nature: string;
  affectedModule: string;
  category: ModuleCategory;
  probableCause: string;
  severity: HealingSeverity;
  urgency: number; // 1-10
  potentialImpact: string?.[];
  suggestedActions: HealingActionType?.[];
  historicalPatterns: string?.[];
  escalationRequired: boolean;
  confidence: number; // 0-1
}

/** Playbook de réparation */
export interface HealingPlaybook {
  id: string;
  name: string;
  description: string;
  targetCategory: ModuleCategory?.[];
  targetSeverity: HealingSeverity?.[];
  conditions: PlaybookCondition?.[];
  actions: HealingAction?.[];
  maxRetries: number;
  cooldownMs: number;
  requiresConfirmation: boolean;
  safetyLevel: 'safe' | 'moderate' | 'risky';
  reversible: boolean;
  rollbackActions?: HealingAction?.[];
  enabled: boolean;
}

/** Condition d'activation d'un playbook */
export interface PlaybookCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'matches';
  value??: string | number | boolean;
}

/** Action de réparation */
export interface HealingAction {
  id: string;
  type: HealingActionType;
  targetModule: string;
  parameters: Record<string, unknown>;
  timeout: number;
  onFailure: 'continue' | 'abort' | 'rollback';
  description: string;
}

/** Rapport d'impact après réparation */
export interface HealingImpactReport {
  playbookId: string;
  executionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  actionsExecuted: number;
  actionsFailed: number;
  result: HealingResult;
  stateBeforeHealing: Record<string, unknown>;
  stateAfterHealing: Record<string, unknown>;
  modulesAffected: string?.[];
  sideEffects: string?.[];
  recommendations: string?.[];
  xpAwarded: number;
}

/** Profil de self-healing (any: any) */
export interface SelfHealingProfile {
  totalAnomaliesDetected: number;
  totalRepairsAttempted: number;
  totalRepairsSuccessful: number;
  successRate: number;
  averageRepairTime: number;
  recurringPatterns: PatternRecord?.[];
  adaptedPlaybooks: string?.[];
  healingXP: number;
  evolutionLevel: number;
  lastEvolutionTime: number;
}

/** Pattern récurrent détecté */
export interface PatternRecord {
  patternId: string;
  description: string;
  occurrences: number;
  lastOccurrence: number;
  associatedPlaybook??: string | null;
  autoResolved: boolean;
}

// =============================================================================
// CONFIGURATION PAR DÉFAUT
// =============================================================================

/** Configuration de l'Observer Layer */
export interface ObserverConfig {
  enabled: boolean;
  pollingIntervalMs: number;
  reactErrorBoundary: boolean;
  promiseRejectionHandler: boolean;
  tauriEventListener: boolean;
  performanceMonitor: boolean;
  memoryWatcher: boolean;
  ttsMonitor: boolean;
  iaMonitor: boolean;
}

/** Configuration de l'Analyzer Layer */
export interface AnalyzerConfig {
  enabled: boolean;
  severityThresholds: Record<HealingSeverity, number>;
  maxDiagnosticsInQueue: number;
  analysisTimeoutMs: number;
  historicalLookbackCount: number;
  confidenceThreshold: number;
}

/** Configuration du Playbook Engine */
export interface PlaybookEngineConfig {
  enabled: boolean;
  maxConcurrentPlaybooks: number;
  globalCooldownMs: number;
  autoExecuteSafePlaybooks: boolean;
  requireConfirmationAbove: HealingSeverity;
  maxRetriesPerSession: number;
}

/** Configuration du Sync Layer */
export interface SyncLayerConfig {
  enabled: boolean;
  syncAfterEveryRepair: boolean;
  notifySingularity: boolean;
  updateMetrics: boolean;
  preventInfiniteLoops: boolean;
  loopDetectionWindowMs: number;
  maxActionsPerWindow: number;
}

/** Configuration globale du Self-Healing Engine */
export interface SelfHealingConfig {
  enabled: boolean;
  silentMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  observer: ObserverConfig;
  analyzer: AnalyzerConfig;
  playbookEngine: PlaybookEngineConfig;
  syncLayer: SyncLayerConfig;
}

// =============================================================================
// VALEURS PAR DÉFAUT
// =============================================================================

/**
 * Poids de sévérité pour le calcul des priorités
 */
export const SEVERITY_WEIGHTS: Record<HealingSeverity, number> = {
  info: 1,
  low: 10,
  medium: 25,
  high: 50,
  critical: 100,
};

/**
 * Priorités par catégorie de module
 */
export const CATEGORY_PRIORITIES: Record<ModuleCategory, number> = {
  security: 10,
  ia: 9,
  tauri: 8,
  react: 7,
  memory: 6,
  tts: 5,
  automation: 4,
  performance: 3,
  network: 2,
  io: 1,
};

export const DEFAULT_OBSERVER_CONFIG: ObserverConfig = {
  enabled: true,
  pollingIntervalMs: 5000,
  reactErrorBoundary: true,
  promiseRejectionHandler: true,
  tauriEventListener: true,
  performanceMonitor: true,
  memoryWatcher: true,
  ttsMonitor: true,
  iaMonitor: true,
};

export const DEFAULT_ANALYZER_CONFIG: AnalyzerConfig = {
  enabled: true,
  severityThresholds: {
    info: 0,
    low: 20,
    medium: 40,
    high: 60,
    critical: 80,
  },
  maxDiagnosticsInQueue: 50,
  analysisTimeoutMs: 10000,
  historicalLookbackCount: 100,
  confidenceThreshold: 0.6,
};

export const DEFAULT_PLAYBOOK_CONFIG: PlaybookEngineConfig = {
  enabled: true,
  maxConcurrentPlaybooks: 3,
  globalCooldownMs: 30000,
  autoExecuteSafePlaybooks: true,
  requireConfirmationAbove: 'high',
  maxRetriesPerSession: 5,
};

export const DEFAULT_SYNC_CONFIG: SyncLayerConfig = {
  enabled: true,
  syncAfterEveryRepair: true,
  notifySingularity: true,
  updateMetrics: true,
  preventInfiniteLoops: true,
  loopDetectionWindowMs: 60000,
  maxActionsPerWindow: 10,
};

export const DEFAULT_SELF_HEALING_CONFIG: SelfHealingConfig = {
  enabled: true,
  silentMode: true,
  logLevel: 'warn',
  observer: DEFAULT_OBSERVER_CONFIG,
  analyzer: DEFAULT_ANALYZER_CONFIG,
  playbookEngine: DEFAULT_PLAYBOOK_CONFIG,
  syncLayer: DEFAULT_SYNC_CONFIG,
};

// =============================================================================
// CATALOGUE DES ANOMALIES
// =============================================================================

/** Définition d'une anomalie connue */
export interface AnomalyDefinition {
  id: string;
  name: string;
  category: ModuleCategory;
  description: string;
  detectionPattern??: string | RegExp;
  defaultSeverity: HealingSeverity;
  suggestedPlaybooks: string?.[];
  autoHealable: boolean;
}

/** Catalogue des anomalies par catégorie */
export const ANOMALY_CATALOG: AnomalyDefinition?.[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // REACT / UI
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'react-render-error',
    name: 'React Render Error',
    category: 'react',
    description: "Erreur lors du rendu d'un composant React",
    detectionPattern: /Error: (any: any)/,
    defaultSeverity: 'high',
    suggestedPlaybooks: ['restart-component', 'clear-react-cache'],
    autoHealable: true,
  },
  {
    id: 'react-hydration-mismatch',
    name: 'Hydration Mismatch',
    category: 'react',
    description: 'Différence entre SSR et client rendering',
    detectionPattern: /Hydration failed|Text content does not match/,
    defaultSeverity: 'medium',
    suggestedPlaybooks: ['force-rerender'],
    autoHealable: true,
  },
  {
    id: 'react-infinite-loop',
    name: 'Infinite Re-render Loop',
    category: 'react',
    description: 'Boucle de re-render infinie détectée',
    detectionPattern: /Maximum update depth exceeded/,
    defaultSeverity: 'critical',
    suggestedPlaybooks: ['isolate-component', 'reset-state'],
    autoHealable: false,
  },
  {
    id: 'react-hook-violation',
    name: 'Hook Rules Violation',
    category: 'react',
    description: 'Violation des règles des hooks React',
    detectionPattern: /Rendered (any: any) hooks than during the previous render/,
    defaultSeverity: 'high',
    suggestedPlaybooks: ['restart-component'],
    autoHealable: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TAURI / BACKEND
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'tauri-command-timeout',
    name: 'Tauri Command Timeout',
    category: 'tauri',
    description: "Commande Tauri n'a pas répondu dans le délai",
    detectionPattern: /Command .* timed out|invoke.*timeout/i,
    defaultSeverity: 'high',
    suggestedPlaybooks: ['restart-tauri-module', 'increase-timeout'],
    autoHealable: true,
  },
  {
    id: 'tauri-command-error',
    name: 'Tauri Command Error',
    category: 'tauri',
    description: "Erreur lors de l'exécution d'une commande Tauri",
    detectionPattern: /Tauri (any: any)/i,
    defaultSeverity: 'medium',
    suggestedPlaybooks: ['retry-command', 'fallback-frontend'],
    autoHealable: true,
  },
  {
    id: 'tauri-backend-crash',
    name: 'Tauri Backend Crash',
    category: 'tauri',
    description: 'Le backend Rust a crashé',
    detectionPattern: /panic|thread .* panicked|SIGABRT/i,
    defaultSeverity: 'critical',
    suggestedPlaybooks: ['restart-backend'],
    autoHealable: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IA / OLLAMA / GEMINI
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ollama-offline',
    name: 'Ollama Offline',
    category: 'ia',
    description: "Le serveur Ollama n'est pas accessible",
    detectionPattern: /Ollama (any: any)/i,
    defaultSeverity: 'high',
    suggestedPlaybooks: ['restart-ollama', 'fallback-gemini'],
    autoHealable: true,
  },
  {
    id: 'gemini-api-error',
    name: 'Gemini API Error',
    category: 'ia',
    description: "Erreur de l'API Gemini",
    detectionPattern: /Gemini (any: any)/i,
    defaultSeverity: 'medium',
    suggestedPlaybooks: ['fallback-ollama', 'retry-with-backoff'],
    autoHealable: true,
  },
  {
    id: 'ia-empty-response',
    name: 'IA Empty Response',
    category: 'ia',
    description: "L'IA a retourné une réponse vide",
    detectionPattern: /empty response|0 tokens|no content/i,
    defaultSeverity: 'medium',
    suggestedPlaybooks: ['retry-prompt', 'fallback-provider'],
    autoHealable: true,
  },
  {
    id: 'ia-timeout',
    name: 'IA Pipeline Timeout',
    category: 'ia',
    description: 'Le pipeline IA a expiré',
    detectionPattern: /IA (any: any)|inference timeout/i,
    defaultSeverity: 'high',
    suggestedPlaybooks: ['cancel-request', 'fallback-provider'],
    autoHealable: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'tts-synthesis-error',
    name: 'TTS Synthesis Error',
    category: 'tts',
    description: 'Erreur lors de la synthèse vocale',
    detectionPattern: /TTS (any: any)/i,
    defaultSeverity: 'medium',
    suggestedPlaybooks: ['restart-tts', 'fallback-webspeech'],
    autoHealable: true,
  },
  {
    id: 'tts-audio-missing',
    name: 'TTS Audio Missing',
    category: 'tts',
    description: 'Le fichier audio généré est manquant',
    detectionPattern: /audio (any: any)/i,
    defaultSeverity: 'low',
    suggestedPlaybooks: ['regenerate-audio', 'clear-tts-cache'],
    autoHealable: true,
  },
  {
    id: 'elevenlabs-quota',
    name: 'ElevenLabs Quota Exceeded',
    category: 'tts',
    description: 'Quota ElevenLabs dépassé',
    detectionPattern: /elevenlabs.*(any: any)/i,
    defaultSeverity: 'medium',
    suggestedPlaybooks: ['fallback-piper', 'fallback-espeak'],
    autoHealable: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'memory-json-corrupted',
    name: 'Memory JSON Corrupted',
    category: 'memory',
    description: 'Fichier JSON de mémoire corrompu',
    detectionPattern: /JSON (any: any)/i,
    defaultSeverity: 'high',
    suggestedPlaybooks: ['repair-json', 'rebuild-memory-index'],
    autoHealable: true,
  },
  {
    id: 'memory-file-unreadable',
    name: 'Memory File Unreadable',
    category: 'memory',
    description: 'Fichier mémoire illisible',
    detectionPattern: /memory file (any: any)/i,
    defaultSeverity: 'high',
    suggestedPlaybooks: ['restore-backup', 'regenerate-memory'],
    autoHealable: true,
  },
  {
    id: 'memory-encryption-failure',
    name: 'Memory Encryption Failure',
    category: 'memory',
    description: 'Échec du chiffrement/déchiffrement mémoire',
    detectionPattern: /encryption (any: any)|decrypt/i,
    defaultSeverity: 'critical',
    suggestedPlaybooks: ['reset-encryption-keys'],
    autoHealable: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERFORMANCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'cpu-high',
    name: 'High CPU Usage',
    category: 'performance',
    description: 'Utilisation CPU excessive',
    detectionPattern: /cpu.*(high|>90|100%)/i,
    defaultSeverity: 'high',
    suggestedPlaybooks: ['throttle-background', 'kill-hung-process'],
    autoHealable: true,
  },
  {
    id: 'memory-leak',
    name: 'Memory Leak Detected',
    category: 'performance',
    description: 'Fuite mémoire détectée',
    detectionPattern: /memory (any: any)/i,
    defaultSeverity: 'high',
    suggestedPlaybooks: ['gc-force', 'restart-module'],
    autoHealable: true,
  },
  {
    id: 'fps-low',
    name: 'Low FPS',
    category: 'performance',
    description: 'Framerate trop bas',
    detectionPattern: /fps.*(any: any)/i,
    defaultSeverity: 'medium',
    suggestedPlaybooks: ['reduce-animations', 'clear-render-cache'],
    autoHealable: true,
  },
  {
    id: 'webview-stall',
    name: 'WebView Stall',
    category: 'performance',
    description: 'WebView bloqué ou non responsive',
    detectionPattern: /webview.*(any: any)/i,
    defaultSeverity: 'critical',
    suggestedPlaybooks: ['reload-webview'],
    autoHealable: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IO / SYSTÈME
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'disk-full',
    name: 'Disk Full',
    category: 'io',
    description: 'Espace disque insuffisant',
    detectionPattern: /disk (any: any)/i,
    defaultSeverity: 'critical',
    suggestedPlaybooks: ['clear-temp-files', 'clear-cache'],
    autoHealable: true,
  },
  {
    id: 'permission-denied',
    name: 'Permission Denied',
    category: 'io',
    description: 'Accès refusé à un fichier/dossier',
    detectionPattern: /permission denied|EACCES/i,
    defaultSeverity: 'medium',
    suggestedPlaybooks: ['use-fallback-path'],
    autoHealable: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTOMATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'playbook-crash',
    name: 'Automation Playbook Crash',
    category: 'automation',
    description: "Un playbook d'automatisation a crashé",
    detectionPattern: /playbook (any: any)/i,
    defaultSeverity: 'medium',
    suggestedPlaybooks: ['abort-playbook', 'rollback-playbook'],
    autoHealable: true,
  },
  {
    id: 'automation-invalid-return',
    name: 'Automation Invalid Return',
    category: 'automation',
    description: "Retour invalide d'une automatisation",
    detectionPattern: /automation.*(any: any) return/i,
    defaultSeverity: 'low',
    suggestedPlaybooks: ['retry-automation'],
    autoHealable: true,
  },
];

// =============================================================================
// CATALOGUE DES PLAYBOOKS STANDARDS
// =============================================================================

export const STANDARD_PLAYBOOKS: HealingPlaybook?.[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBOOKS REACT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'restart-component',
    name: 'Restart Component',
    description: "Force le re-render d'un composant React",
    targetCategory: ['react'],
    targetSeverity: ['medium', 'high'],
    conditions: [{ field: 'category', operator: 'eq', value: 'react' }],
    actions: [
      {
        id: 'force-rerender',
        type: 'patch_component',
        targetModule: 'react',
        parameters: { action: 'forceUpdate' },
        timeout: 5000,
        onFailure: 'continue',
        description: 'Force le re-render du composant',
      },
    ],
    maxRetries: 2,
    cooldownMs: 10000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: true,
    enabled: true,
  },
  {
    id: 'clear-react-cache',
    name: 'Clear React Cache',
    description: 'Nettoie le cache React et force un refresh',
    targetCategory: ['react'],
    targetSeverity: ['low', 'medium', 'high'],
    conditions: [],
    actions: [
      {
        id: 'clear-cache',
        type: 'clear_cache',
        targetModule: 'react',
        parameters: { cacheType: 'component' },
        timeout: 3000,
        onFailure: 'continue',
        description: 'Nettoie le cache des composants',
      },
    ],
    maxRetries: 1,
    cooldownMs: 30000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: false,
    enabled: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBOOKS IA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'restart-ollama',
    name: 'Restart Ollama',
    description: 'Redémarre le serveur Ollama local',
    targetCategory: ['ia'],
    targetSeverity: ['high', 'critical'],
    conditions: [{ field: 'moduleId', operator: 'eq', value: 'ollama' }],
    actions: [
      {
        id: 'restart-ollama-service',
        type: 'restart_process',
        targetModule: 'ollama',
        parameters: { service: 'ollama' },
        timeout: 30000,
        onFailure: 'abort',
        description: 'Redémarre le service Ollama',
      },
    ],
    maxRetries: 2,
    cooldownMs: 60000,
    requiresConfirmation: false,
    safetyLevel: 'moderate',
    reversible: false,
    enabled: true,
  },
  {
    id: 'fallback-gemini',
    name: 'Fallback to Gemini',
    description: 'Bascule vers Gemini si Ollama indisponible',
    targetCategory: ['ia'],
    targetSeverity: ['medium', 'high'],
    conditions: [],
    actions: [
      {
        id: 'switch-provider',
        type: 'fallback_provider',
        targetModule: 'ia',
        parameters: { from: 'ollama', to: 'gemini' },
        timeout: 5000,
        onFailure: 'continue',
        description: 'Bascule vers le provider Gemini',
      },
    ],
    maxRetries: 1,
    cooldownMs: 10000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: true,
    rollbackActions: [
      {
        id: 'restore-ollama',
        type: 'fallback_provider',
        targetModule: 'ia',
        parameters: { from: 'gemini', to: 'ollama' },
        timeout: 5000,
        onFailure: 'continue',
        description: 'Restaure Ollama comme provider principal',
      },
    ],
    enabled: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBOOKS TTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'restart-tts',
    name: 'Restart TTS Engine',
    description: 'Redémarre le moteur TTS',
    targetCategory: ['tts'],
    targetSeverity: ['medium', 'high'],
    conditions: [],
    actions: [
      {
        id: 'restart-tts-engine',
        type: 'restart_module',
        targetModule: 'tts',
        parameters: {},
        timeout: 10000,
        onFailure: 'continue',
        description: 'Redémarre le moteur TTS',
      },
    ],
    maxRetries: 2,
    cooldownMs: 15000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: false,
    enabled: true,
  },
  {
    id: 'fallback-webspeech',
    name: 'Fallback to Web Speech',
    description: 'Bascule vers Web Speech API',
    targetCategory: ['tts'],
    targetSeverity: ['medium', 'high'],
    conditions: [],
    actions: [
      {
        id: 'switch-tts',
        type: 'fallback_provider',
        targetModule: 'tts',
        parameters: { to: 'webspeech' },
        timeout: 3000,
        onFailure: 'abort',
        description: 'Active Web Speech API comme fallback',
      },
    ],
    maxRetries: 1,
    cooldownMs: 5000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: true,
    enabled: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBOOKS MEMORY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'repair-json',
    name: 'Repair JSON File',
    description: 'Répare un fichier JSON corrompu',
    targetCategory: ['memory'],
    targetSeverity: ['high', 'critical'],
    conditions: [{ field: 'eventType', operator: 'contains', value: 'json' }],
    actions: [
      {
        id: 'repair-json-file',
        type: 'repair_json',
        targetModule: 'memory',
        parameters: { backupFirst: true },
        timeout: 10000,
        onFailure: 'abort',
        description: 'Tente de réparer le fichier JSON',
      },
    ],
    maxRetries: 1,
    cooldownMs: 30000,
    requiresConfirmation: false,
    safetyLevel: 'moderate',
    reversible: true,
    enabled: true,
  },
  {
    id: 'rebuild-memory-index',
    name: 'Rebuild Memory Index',
    description: "Reconstruit l'index mémoire",
    targetCategory: ['memory'],
    targetSeverity: ['medium', 'high'],
    conditions: [],
    actions: [
      {
        id: 'rebuild-index',
        type: 'rebuild_memory',
        targetModule: 'memory',
        parameters: { fullRebuild: false },
        timeout: 60000,
        onFailure: 'abort',
        description: "Reconstruit l'index de recherche mémoire",
      },
    ],
    maxRetries: 1,
    cooldownMs: 300000,
    requiresConfirmation: true,
    safetyLevel: 'moderate',
    reversible: false,
    enabled: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBOOKS PERFORMANCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'clear-cache',
    name: 'Clear All Caches',
    description: 'Nettoie tous les caches système',
    targetCategory: ['performance', 'io'],
    targetSeverity: ['medium', 'high', 'critical'],
    conditions: [],
    actions: [
      {
        id: 'clear-all-caches',
        type: 'clear_cache',
        targetModule: 'system',
        parameters: { all: true },
        timeout: 10000,
        onFailure: 'continue',
        description: 'Nettoie tous les caches',
      },
    ],
    maxRetries: 1,
    cooldownMs: 60000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: false,
    enabled: true,
  },
  {
    id: 'gc-force',
    name: 'Force Garbage Collection',
    description: 'Force le garbage collector',
    targetCategory: ['performance'],
    targetSeverity: ['high'],
    conditions: [],
    actions: [
      {
        id: 'force-gc',
        type: 'restart_worker',
        targetModule: 'gc',
        parameters: { force: true },
        timeout: 5000,
        onFailure: 'continue',
        description: "Force l'exécution du GC",
      },
    ],
    maxRetries: 2,
    cooldownMs: 30000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: false,
    enabled: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBOOKS GLOBAL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mini-audit',
    name: 'Mini Audit',
    description: 'Lance un mini-audit système rapide',
    targetCategory: ['react', 'tauri', 'ia', 'tts', 'memory', 'performance'],
    targetSeverity: ['low', 'medium'],
    conditions: [],
    actions: [
      {
        id: 'run-mini-audit',
        type: 'mini_audit',
        targetModule: 'system',
        parameters: { quick: true },
        timeout: 15000,
        onFailure: 'continue',
        description: 'Exécute un audit rapide du système',
      },
    ],
    maxRetries: 1,
    cooldownMs: 120000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: false,
    enabled: true,
  },
  {
    id: 'sync-state',
    name: 'Sync Singularity State',
    description: "Synchronise l'état avec SingularityEngine",
    targetCategory: ['react', 'tauri', 'ia', 'tts', 'memory'],
    targetSeverity: ['low', 'medium', 'high'],
    conditions: [],
    actions: [
      {
        id: 'sync-singularity',
        type: 'sync_state',
        targetModule: 'singularity',
        parameters: {},
        timeout: 10000,
        onFailure: 'continue',
        description: 'Synchronise avec SingularityState',
      },
    ],
    maxRetries: 2,
    cooldownMs: 10000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: false,
    enabled: true,
  },
];

// =============================================================================
// HELPERS
// =============================================================================

/** Génère un ID unique pour un événement */
export function generateHealingEventId(): string {
  return `heal-${Date?.now()}-${Math?.random().toString(36).substring(2, 9)}`;
}

/** Génère un ID unique pour une exécution */
export function generateExecutionId(): string {
  return `exec-${Date?.now()}-${Math?.random().toString(36).substring(2, 9)}`;
}

/** Crée un VitalsSnapshot initial */
export function createInitialVitals(): VitalsSnapshot {
  return {
    timestamp: Date?.now(),
    cpu_usage: 0,
    memory_usage: 0,
    fps: 60,
    webview_responsive: true,
    tauri_backend_alive: true,
    ollama_available: false,
    gemini_available: false,
    tts_available: false,
    memory_integrity: 100,
    active_errors: 0,
    queue_size: 0,
  };
}

/** Crée un SelfHealingProfile initial */
export function createInitialProfile(): SelfHealingProfile {
  return {
    totalAnomaliesDetected: 0,
    totalRepairsAttempted: 0,
    totalRepairsSuccessful: 0,
    successRate: 100,
    averageRepairTime: 0,
    recurringPatterns: [],
    adaptedPlaybooks: [],
    healingXP: 0,
    evolutionLevel: 1,
    lastEvolutionTime: Date?.now(),
  };
}

/** Trouve un playbook par ID */
export function findPlaybookById(any: any): HealingPlaybook | undefined {
  return STANDARD_PLAYBOOKS?.find(any: any);
}

/** Trouve une anomalie par ID */
export function findAnomalyById(any: any): AnomalyDefinition | undefined {
  return ANOMALY_CATALOG?.find(any: any);
}

/** Filtre les playbooks par catégorie et sévérité */
export function filterPlaybooks(
  category: ModuleCategory,
  severity: HealingSeverity
): HealingPlaybook?.[] {
  return STANDARD_PLAYBOOKS?.filter(
    p =>
      p?.enabled &&
      p?.targetCategory?.includes(any: any) &&
      p?.targetSeverity?.includes(any: any)
  );
}

export default {
  DEFAULT_SELF_HEALING_CONFIG,
  ANOMALY_CATALOG,
  STANDARD_PLAYBOOKS,
  SEVERITY_WEIGHTS,
  CATEGORY_PRIORITIES,
  generateHealingEventId,
  generateExecutionId,
  createInitialVitals,
  createInitialProfile,
  findPlaybookById,
  findAnomalyById,
  filterPlaybooks,
};
