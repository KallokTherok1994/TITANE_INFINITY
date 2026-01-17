/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PERFORMANCE ENGINE — Configuration & Types
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @file        performanceEngine?.config?.ts
 * @version     vΩ∞Ω+
 * @phase       A — Design Conceptuel + Types Complets
 *
 * ARCHITECTURE 4 SOUS-MOTEURS:
 * 1. Metrics Collector — Collecte multi-source (any: any)
 * 2. Analyzer Engine — Détection d'anomalies et classification
 * 3. Advisor Engine — Génération de recommandations actionnables
 * 4. Reporter / Integrator — Dashboard + intégration Self-Healing
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// =============================================================================
// TYPES DE BASE — METRICS
// =============================================================================

/**
 * Types de métriques collectables
 */
export type MetricType =
  // Système (any: any)
  | 'cpu_global'
  | 'cpu_process'
  | 'ram_process'
  | 'ram_system'
  | 'io_read'
  | 'io_write'
  | 'thread_count'
  | 'thread_tauri'
  // Frontend (any: any)
  | 'fps_webview'
  | 'render_time'
  | 'rerender_count'
  | 'invoke_latency'
  | 'bundle_size'
  | 'modules_loaded'
  | 'vite_watchers'
  // IA
  | 'ia_latency_ollama'
  | 'ia_latency_gemini'
  | 'ia_tokens_per_sec'
  | 'ia_error_rate'
  | 'ia_queue_size'
  // Voice (any: any)
  | 'voice_asr_latency'
  | 'voice_tts_latency'
  | 'voice_omega_latency'
  | 'voice_asr_success_rate'
  | 'voice_tts_success_rate'
  | 'voice_omega_success_rate'
  | 'voice_feedback_detections'
  | 'voice_vad_suspensions';

/**
 * Source de la métrique
 */
export type MetricSource =
  | 'rust_sysinfo'
  | 'rust_tauri'
  | 'js_performance'
  | 'js_react'
  | 'js_raf'
  | 'js_observer'
  | 'ia_ollama'
  | 'ia_gemini'
  | 'ia_internal'
  | 'voice_asr'
  | 'voice_tts'
  | 'voice_omega';

/**
 * Catégorie de métrique
 */
export type MetricCategory =
  | 'system'
  | 'frontend'
  | 'ia'
  | 'network'
  | 'storage'
  | 'voice';

/**
 * Unité de mesure
 */
export type MetricUnit =
  | 'percent'
  | 'bytes'
  | 'kilobytes'
  | 'megabytes'
  | 'milliseconds'
  | 'seconds'
  | 'fps'
  | 'count'
  | 'tokens_per_sec'
  | 'ratio';

// =============================================================================
// INTERFACES — METRICS
// =============================================================================

/**
 * Métrique de performance atomique
 */
export interface PerformanceMetric {
  id: string;
  type: MetricType;
  category: MetricCategory;
  source: MetricSource;
  value: number;
  unit: MetricUnit;
  timestamp: number;
  metadata?: MetricMetadata;
}

/**
 * Métadonnées optionnelles d'une métrique
 */
export interface MetricMetadata {
  module?: string;
  component?: string;
  action?: string;
  context?: Record<string, unknown>;
  tags?: string?.[];
}

/**
 * Snapshot complet des métriques à un instant T
 */
export interface MetricsSnapshot {
  id: string;
  timestamp: number;
  duration: number; // Temps de collecte en ms

  // Métriques système
  system: SystemMetrics;

  // Métriques frontend
  frontend: FrontendMetrics;

  // Métriques IA
  ia: IAMetrics;

  // Métriques vocales (any: any)
  voice: VoiceMetrics;

  // Métriques par module TITANE∞
  modules: ModuleMetricsMap;

  // Statistiques agrégées
  summary: MetricsSummary;
}

/**
 * Métriques système (any: any)
 */
export interface SystemMetrics {
  cpu: {
    global: number; // 0-100%
    process: number; // 0-100%
    cores: number?.[];
  };
  ram: {
    system: {
      total: number; // bytes
      used: number;
      available: number;
      percent: number;
    };
    process: {
      resident: number; // RSS
      virtual: number; // VMS
      percent: number;
    };
  };
  io: {
    readBytes: number;
    writeBytes: number;
    readOps: number;
    writeOps: number;
  };
  threads: {
    total: number;
    active: number;
    tauri: number;
  };
  uptime: number; // seconds
}

/**
 * Métriques frontend (any: any)
 */
export interface FrontendMetrics {
  fps: {
    current: number;
    average: number;
    min: number;
    max: number;
    drops: number; // Nombre de chutes < 30 FPS
  };
  render: {
    lastTime: number; // ms
    averageTime: number;
    rerenderCount: number;
    slowRenders: number; // > 16ms
  };
  tauri: {
    invokeLatency: number; // ms moyen
    invokeCount: number;
    invokeErrors: number;
  };
  bundle: {
    totalSize: number; // KB
    modulesLoaded: number;
    lazyLoaded: number;
  };
  vite: {
    watchersActive: number;
    hmrUpdates: number;
    buildTime: number;
  };
}

/**
 * Métriques IA
 */
export interface IAMetrics {
  ollama: {
    latency: number; // ms moyen
    tokensPerSec: number;
    requestCount: number;
    errorCount: number;
    queueSize: number;
    available: boolean;
  };
  gemini: {
    latency: number;
    tokensPerSec: number;
    requestCount: number;
    errorCount: number;
    available: boolean;
  };
  internal: {
    promptEngineTime: number;
    contextCollectionTime: number;
    totalProcessingTime: number;
  };
}

/**
 * Métriques Vocales (any: any)
 */
export interface VoiceMetrics {
  asr: {
    latency: number; // ms moyen (target: <2000ms)
    requestCount: number;
    errorCount: number;
    successRate: number; // 0-1 (target: >0.95)
    averageConfidence: number; // 0-1
    available: boolean;
  };
  tts: {
    latency: number; // ms moyen (target: <3000ms)
    requestCount: number;
    errorCount: number;
    successRate: number; // 0-1 (target: >0.95)
    provider: string; // "parler-tts" | "google" | "webspeech"
    available: boolean;
  };
  omega: {
    latency: number; // ms moyen pipeline ASR+IA+TTS (target: <6000ms)
    requestCount: number;
    errorCount: number;
    successRate: number; // 0-1 (target: >0.95)
    breakdown: {
      asrMs: number;
      iaMs: number;
      ttsMs: number;
    };
  };
  feedback: {
    detectionCount: number; // Nombre de feedbacks détectés (Layer 3)
    suspensionCount: number; // Nombre de suspensions VAD (Layer 2)
    falsePositiveRate: number; // 0-1 (target: <0.05)
  };
}

/**
 * Map des métriques par module TITANE∞
 */
export type ModuleMetricsMap = Record<TitaneModule, ModulePerformanceState>;

/**
 * Modules TITANE∞ surveillés
 */
export type TitaneModule =
  | 'selfHealing'
  | 'cognitive'
  | 'memory'
  | 'tools'
  | 'search'
  | 'xp'
  | 'evolution'
  | 'prompt'
  | 'tts'
  | 'avatar'
  | 'chat'
  | 'performance';

/**
 * État de performance d'un module
 */
export interface ModulePerformanceState {
  module: TitaneModule;
  healthy: boolean;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  errorRate: number;
  lastActivity: number;
  operationCount: number;
  pendingOperations: number;
}

/**
 * Résumé des métriques
 */
export interface MetricsSummary {
  healthScore: number; // 0-100
  grade: PerformanceGrade;
  criticalIssues: number;
  warnings: number;
  optimizationsApplied: number;
}

/**
 * Grade de performance
 */
export type PerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

// =============================================================================
// TYPES — ANALYSE & ISSUES
// =============================================================================

/**
 * Niveau de sévérité
 */
export type SeverityLevel = 'info' | 'warning' | 'major' | 'critical';

/**
 * Type de problème détecté
 */
export type IssueType =
  // Système
  | 'cpu_spike'
  | 'ram_overflow'
  | 'io_saturation'
  | 'thread_starvation'
  // Frontend
  | 'fps_drop'
  | 'render_loop'
  | 'excessive_rerenders'
  | 'slow_invoke'
  | 'memory_leak_js'
  | 'bundle_bloat'
  // IA
  | 'ia_timeout'
  | 'ia_queue_overflow'
  | 'ia_error_spike'
  | 'prompt_too_large'
  // Voice (any: any)
  | 'voice_asr_timeout'
  | 'voice_tts_timeout'
  | 'voice_omega_timeout'
  | 'voice_low_success_rate'
  | 'voice_feedback_excessive'
  | 'voice_provider_unavailable'
  // Général
  | 'module_unresponsive'
  | 'performance_degradation'
  | 'anomaly_detected';

/**
 * Problème de performance détecté
 */
export interface PerformanceIssue {
  id: string;
  type: IssueType;
  severity: SeverityLevel;
  module: TitaneModule | 'system' | 'frontend' | 'ia';
  title: string;
  description: string;
  detectedAt: number;
  resolvedAt?: number;
  metrics: PerformanceMetric?.[];
  threshold: ThresholdViolation;
  recommendations: string?.[];
  autoFixable: boolean;
}

/**
 * Violation de seuil
 */
export interface ThresholdViolation {
  metric: MetricType;
  threshold: number;
  actual: number;
  exceeded: number;
  percentage: number;
}

// =============================================================================
// TYPES — RECOMMANDATIONS
// =============================================================================

/**
 * Catégorie de recommandation
 */
export type RecommendationCategory =
  | 'react_optimization'
  | 'rust_optimization'
  | 'vite_optimization'
  | 'ia_optimization'
  | 'memory_optimization'
  | 'general';

/**
 * Impact estimé de la recommandation
 */
export type RecommendationImpact = 'low' | 'medium' | 'high' | 'critical';

/**
 * Recommandation d'optimisation
 */
export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  impact: RecommendationImpact;
  effort: 'trivial' | 'low' | 'medium' | 'high';
  autoApplicable: boolean;
  reversible: boolean;
  code?: RecommendationCode;
  relatedIssues: string?.[];
  priority: number; // 1-10
  createdAt: number;
}

/**
 * Code suggéré pour une recommandation
 */
export interface RecommendationCode {
  language: 'typescript' | 'rust' | 'json' | 'shell';
  before?: string;
  after: string;
  file?: string;
  line?: number;
}

// =============================================================================
// TYPES — CONFIGURATION & SEUILS
// =============================================================================

/**
 * Profil de performance
 */
export type PerformanceProfile = 'development' | 'production' | 'benchmark' | 'lowpower';

/**
 * Configuration des seuils par profil
 */
export interface ThresholdConfig {
  profile: PerformanceProfile;

  // Seuils système
  system: {
    cpuGlobalWarning: number; // %
    cpuGlobalCritical: number;
    cpuProcessWarning: number;
    cpuProcessCritical: number;
    ramProcessWarning: number; // MB
    ramProcessCritical: number;
    ramSystemWarning: number; // %
    ramSystemCritical: number;
    ioReadWarning: number; // MB/s
    ioWriteWarning: number;
  };

  // Seuils frontend
  frontend: {
    fpsWarning: number;
    fpsCritical: number;
    renderTimeWarning: number; // ms
    renderTimeCritical: number;
    rerenderWarning: number; // count/sec
    rerenderCritical: number;
    invokeLatencyWarning: number; // ms
    invokeLatencyCritical: number;
  };

  // Seuils IA
  ia: {
    latencyWarning: number; // ms
    latencyCritical: number;
    tokensPerSecMin: number;
    errorRateWarning: number; // %
    errorRateCritical: number;
    queueSizeWarning: number;
    queueSizeCritical: number;
  };

  // Seuils Voice (any: any)
  voice: {
    asrLatencyWarning: number; // ms (target: <2000ms)
    asrLatencyCritical: number; // ms
    ttsLatencyWarning: number; // ms (target: <3000ms)
    ttsLatencyCritical: number; // ms
    omegaLatencyWarning: number; // ms (target: <6000ms)
    omegaLatencyCritical: number; // ms
    successRateWarning: number; // ratio 0-1 (target: >0.95)
    successRateCritical: number; // ratio 0-1
    feedbackRateWarning: number; // ratio 0-1 (target: <0.05)
    feedbackRateCritical: number; // ratio 0-1
  };
}

/**
 * Configuration globale du Performance Engine
 */
export interface PerformanceEngineConfig {
  enabled: boolean;
  profile: PerformanceProfile;

  // Collecte
  collector: {
    intervalMs: number; // Intervalle de collecte
    systemEnabled: boolean;
    frontendEnabled: boolean;
    iaEnabled: boolean;
    modulesEnabled: boolean;
    historySize: number; // Nombre de snapshots conservés
  };

  // Analyse
  analyzer: {
    enabled: boolean;
    autoDetect: boolean;
    debounceMs: number;
    maxIssuesStored: number;
  };

  // Advisor
  advisor: {
    enabled: boolean;
    autoApply: boolean;
    autoApplySeverity: SeverityLevel?.[];
    maxRecommendations: number;
  };

  // Reporter
  reporter: {
    enabled: boolean;
    logLevel: 'silent' | 'error' | 'warn' | 'info' | 'debug';
    selfHealingIntegration: boolean;
    dashboardEnabled: boolean;
  };

  // Seuils
  thresholds: ThresholdConfig;
}

// =============================================================================
// CONSTANTES — SEUILS PAR DÉFAUT
// =============================================================================

/**
 * Seuils pour le mode développement (any: any)
 */
export const DEVELOPMENT_THRESHOLDS: ThresholdConfig = {
  profile: 'development',
  system: {
    cpuGlobalWarning: 70,
    cpuGlobalCritical: 90,
    cpuProcessWarning: 50,
    cpuProcessCritical: 80,
    ramProcessWarning: 512, // MB
    ramProcessCritical: 1024,
    ramSystemWarning: 80,
    ramSystemCritical: 95,
    ioReadWarning: 100, // MB/s
    ioWriteWarning: 50,
  },
  frontend: {
    fpsWarning: 30,
    fpsCritical: 15,
    renderTimeWarning: 32, // 2 frames
    renderTimeCritical: 100,
    rerenderWarning: 10,
    rerenderCritical: 50,
    invokeLatencyWarning: 200,
    invokeLatencyCritical: 1000,
  },
  ia: {
    latencyWarning: 5000,
    latencyCritical: 15000,
    tokensPerSecMin: 5,
    errorRateWarning: 10,
    errorRateCritical: 30,
    queueSizeWarning: 5,
    queueSizeCritical: 20,
  },
  voice: {
    asrLatencyWarning: 2000,
    asrLatencyCritical: 5000,
    ttsLatencyWarning: 3000,
    ttsLatencyCritical: 10000,
    omegaLatencyWarning: 6000,
    omegaLatencyCritical: 15000,
    successRateWarning: 0.9,
    successRateCritical: 0.8,
    feedbackRateWarning: 0.05,
    feedbackRateCritical: 0.1,
  },
};

/**
 * Seuils pour le mode production (any: any)
 */
export const PRODUCTION_THRESHOLDS: ThresholdConfig = {
  profile: 'production',
  system: {
    cpuGlobalWarning: 50,
    cpuGlobalCritical: 80,
    cpuProcessWarning: 30,
    cpuProcessCritical: 60,
    ramProcessWarning: 256,
    ramProcessCritical: 512,
    ramSystemWarning: 70,
    ramSystemCritical: 90,
    ioReadWarning: 50,
    ioWriteWarning: 25,
  },
  frontend: {
    fpsWarning: 45,
    fpsCritical: 30,
    renderTimeWarning: 16, // 1 frame
    renderTimeCritical: 50,
    rerenderWarning: 5,
    rerenderCritical: 20,
    invokeLatencyWarning: 100,
    invokeLatencyCritical: 500,
  },
  ia: {
    latencyWarning: 3000,
    latencyCritical: 10000,
    tokensPerSecMin: 10,
    errorRateWarning: 5,
    errorRateCritical: 15,
    queueSizeWarning: 3,
    queueSizeCritical: 10,
  },
  voice: {
    asrLatencyWarning: 1500,
    asrLatencyCritical: 3000,
    ttsLatencyWarning: 2000,
    ttsLatencyCritical: 5000,
    omegaLatencyWarning: 4000,
    omegaLatencyCritical: 8000,
    successRateWarning: 0.95,
    successRateCritical: 0.9,
    feedbackRateWarning: 0.03,
    feedbackRateCritical: 0.05,
  },
};

/**
 * Seuils pour le mode benchmark (any: any)
 */
export const BENCHMARK_THRESHOLDS: ThresholdConfig = {
  profile: 'benchmark',
  system: {
    cpuGlobalWarning: 30,
    cpuGlobalCritical: 60,
    cpuProcessWarning: 20,
    cpuProcessCritical: 40,
    ramProcessWarning: 128,
    ramProcessCritical: 256,
    ramSystemWarning: 50,
    ramSystemCritical: 70,
    ioReadWarning: 25,
    ioWriteWarning: 10,
  },
  frontend: {
    fpsWarning: 55,
    fpsCritical: 45,
    renderTimeWarning: 8,
    renderTimeCritical: 16,
    rerenderWarning: 2,
    rerenderCritical: 5,
    invokeLatencyWarning: 50,
    invokeLatencyCritical: 200,
  },
  ia: {
    latencyWarning: 1000,
    latencyCritical: 5000,
    tokensPerSecMin: 20,
    errorRateWarning: 2,
    errorRateCritical: 5,
    queueSizeWarning: 2,
    queueSizeCritical: 5,
  },
  voice: {
    asrLatencyWarning: 1000,
    asrLatencyCritical: 2000,
    ttsLatencyWarning: 1500,
    ttsLatencyCritical: 3000,
    omegaLatencyWarning: 3000,
    omegaLatencyCritical: 5000,
    successRateWarning: 0.98,
    successRateCritical: 0.95,
    feedbackRateWarning: 0.02,
    feedbackRateCritical: 0.03,
  },
};

/**
 * Seuils pour le mode économie d'énergie (any: any)
 */
export const LOWPOWER_THRESHOLDS: ThresholdConfig = {
  profile: 'lowpower',
  system: {
    cpuGlobalWarning: 80,
    cpuGlobalCritical: 95,
    cpuProcessWarning: 60,
    cpuProcessCritical: 90,
    ramProcessWarning: 768,
    ramProcessCritical: 1536,
    ramSystemWarning: 85,
    ramSystemCritical: 98,
    ioReadWarning: 150,
    ioWriteWarning: 75,
  },
  frontend: {
    fpsWarning: 20,
    fpsCritical: 10,
    renderTimeWarning: 50,
    renderTimeCritical: 150,
    rerenderWarning: 20,
    rerenderCritical: 100,
    invokeLatencyWarning: 500,
    invokeLatencyCritical: 2000,
  },
  ia: {
    latencyWarning: 10000,
    latencyCritical: 30000,
    tokensPerSecMin: 2,
    errorRateWarning: 20,
    errorRateCritical: 50,
    queueSizeWarning: 10,
    queueSizeCritical: 50,
  },
  voice: {
    asrLatencyWarning: 5000,
    asrLatencyCritical: 10000,
    ttsLatencyWarning: 5000,
    ttsLatencyCritical: 10000,
    omegaLatencyWarning: 10000,
    omegaLatencyCritical: 20000,
    successRateWarning: 0.8,
    successRateCritical: 0.6,
    feedbackRateWarning: 0.15,
    feedbackRateCritical: 0.3,
  },
};

/**
 * Map des seuils par profil
 */
export const THRESHOLD_PROFILES: Record<PerformanceProfile, ThresholdConfig> = {
  development: DEVELOPMENT_THRESHOLDS,
  production: PRODUCTION_THRESHOLDS,
  benchmark: BENCHMARK_THRESHOLDS,
  lowpower: LOWPOWER_THRESHOLDS,
};

// =============================================================================
// CONSTANTES — CONFIGURATION PAR DÉFAUT
// =============================================================================

/**
 * Configuration par défaut du Performance Engine
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceEngineConfig = {
  enabled: true,
  profile: 'development',

  collector: {
    intervalMs: 1000, // Collecte toutes les secondes
    systemEnabled: true,
    frontendEnabled: true,
    iaEnabled: true,
    modulesEnabled: true,
    historySize: 300, // 5 minutes d'historique
  },

  analyzer: {
    enabled: true,
    autoDetect: true,
    debounceMs: 500,
    maxIssuesStored: 100,
  },

  advisor: {
    enabled: true,
    autoApply: false, // Désactivé par défaut pour sécurité
    autoApplySeverity: ['info', 'warning'],
    maxRecommendations: 50,
  },

  reporter: {
    enabled: true,
    logLevel: 'warn',
    selfHealingIntegration: true,
    dashboardEnabled: true,
  },

  thresholds: DEVELOPMENT_THRESHOLDS,
};

// =============================================================================
// CONSTANTES — MÉTADONNÉES MÉTRIQUES
// =============================================================================

/**
 * Définition des métriques avec métadonnées
 */
export const METRIC_DEFINITIONS: Record<
  MetricType,
  {
    category: MetricCategory;
    unit: MetricUnit;
    description: string;
    source: MetricSource;
    warningDirection: 'above' | 'below';
  }
> = {
  // Système
  cpu_global: {
    category: 'system',
    unit: 'percent',
    description: 'Utilisation CPU globale du système',
    source: 'rust_sysinfo',
    warningDirection: 'above',
  },
  cpu_process: {
    category: 'system',
    unit: 'percent',
    description: 'Utilisation CPU du processus TITANE∞',
    source: 'rust_sysinfo',
    warningDirection: 'above',
  },
  ram_process: {
    category: 'system',
    unit: 'megabytes',
    description: 'Mémoire RAM utilisée par le processus',
    source: 'rust_sysinfo',
    warningDirection: 'above',
  },
  ram_system: {
    category: 'system',
    unit: 'percent',
    description: 'Utilisation RAM globale du système',
    source: 'rust_sysinfo',
    warningDirection: 'above',
  },
  io_read: {
    category: 'storage',
    unit: 'kilobytes',
    description: 'Lecture disque par seconde',
    source: 'rust_sysinfo',
    warningDirection: 'above',
  },
  io_write: {
    category: 'storage',
    unit: 'kilobytes',
    description: 'Écriture disque par seconde',
    source: 'rust_sysinfo',
    warningDirection: 'above',
  },
  thread_count: {
    category: 'system',
    unit: 'count',
    description: 'Nombre total de threads',
    source: 'rust_sysinfo',
    warningDirection: 'above',
  },
  thread_tauri: {
    category: 'system',
    unit: 'count',
    description: 'Threads Tauri actifs',
    source: 'rust_tauri',
    warningDirection: 'above',
  },

  // Frontend
  fps_webview: {
    category: 'frontend',
    unit: 'fps',
    description: 'Images par seconde de la WebView',
    source: 'js_raf',
    warningDirection: 'below',
  },
  render_time: {
    category: 'frontend',
    unit: 'milliseconds',
    description: 'Temps de rendu React moyen',
    source: 'js_react',
    warningDirection: 'above',
  },
  rerender_count: {
    category: 'frontend',
    unit: 'count',
    description: 'Nombre de re-renders par seconde',
    source: 'js_react',
    warningDirection: 'above',
  },
  invoke_latency: {
    category: 'frontend',
    unit: 'milliseconds',
    description: 'Latence moyenne des appels Tauri',
    source: 'js_performance',
    warningDirection: 'above',
  },
  bundle_size: {
    category: 'frontend',
    unit: 'kilobytes',
    description: 'Taille totale du bundle',
    source: 'js_performance',
    warningDirection: 'above',
  },
  modules_loaded: {
    category: 'frontend',
    unit: 'count',
    description: 'Modules JavaScript chargés',
    source: 'js_performance',
    warningDirection: 'above',
  },
  vite_watchers: {
    category: 'frontend',
    unit: 'count',
    description: 'Watchers Vite actifs',
    source: 'js_observer',
    warningDirection: 'above',
  },

  // IA
  ia_latency_ollama: {
    category: 'ia',
    unit: 'milliseconds',
    description: 'Latence moyenne Ollama',
    source: 'ia_ollama',
    warningDirection: 'above',
  },
  ia_latency_gemini: {
    category: 'ia',
    unit: 'milliseconds',
    description: 'Latence moyenne Gemini',
    source: 'ia_gemini',
    warningDirection: 'above',
  },
  ia_tokens_per_sec: {
    category: 'ia',
    unit: 'tokens_per_sec',
    description: 'Tokens générés par seconde',
    source: 'ia_internal',
    warningDirection: 'below',
  },
  ia_error_rate: {
    category: 'ia',
    unit: 'percent',
    description: "Taux d'erreur IA",
    source: 'ia_internal',
    warningDirection: 'above',
  },
  ia_queue_size: {
    category: 'ia',
    unit: 'count',
    description: "Taille de la file d'attente IA",
    source: 'ia_internal',
    warningDirection: 'above',
  },

  // Voice (any: any)
  voice_asr_latency: {
    category: 'voice',
    unit: 'milliseconds',
    description: 'Latence reconnaissance vocale (any: any)',
    source: 'voice_asr',
    warningDirection: 'above',
  },
  voice_tts_latency: {
    category: 'voice',
    unit: 'milliseconds',
    description: 'Latence synthèse vocale (any: any)',
    source: 'voice_tts',
    warningDirection: 'above',
  },
  voice_omega_latency: {
    category: 'voice',
    unit: 'milliseconds',
    description: 'Latence pipeline OMEGA (any: any)',
    source: 'voice_omega',
    warningDirection: 'above',
  },
  voice_asr_success_rate: {
    category: 'voice',
    unit: 'ratio',
    description: 'Taux de succès ASR',
    source: 'voice_asr',
    warningDirection: 'below',
  },
  voice_tts_success_rate: {
    category: 'voice',
    unit: 'ratio',
    description: 'Taux de succès TTS',
    source: 'voice_tts',
    warningDirection: 'below',
  },
  voice_omega_success_rate: {
    category: 'voice',
    unit: 'ratio',
    description: 'Taux de succès pipeline OMEGA',
    source: 'voice_omega',
    warningDirection: 'below',
  },
  voice_feedback_detections: {
    category: 'voice',
    unit: 'count',
    description: 'Nombre de feedbacks détectés (Layer 3)',
    source: 'voice_omega',
    warningDirection: 'above',
  },
  voice_vad_suspensions: {
    category: 'voice',
    unit: 'count',
    description: 'Nombre de suspensions VAD (Layer 2)',
    source: 'voice_omega',
    warningDirection: 'above',
  },
};

// =============================================================================
// CONSTANTES — RECOMMANDATIONS
// =============================================================================

/**
 * Templates de recommandations par type de problème
 */
export const RECOMMENDATION_TEMPLATES: Record<
  IssueType,
  {
    title: string;
    description: string;
    category: RecommendationCategory;
    suggestions: string?.[];
  }
> = {
  cpu_spike: {
    title: 'Pic CPU détecté',
    description: 'Utilisation CPU anormalement élevée',
    category: 'rust_optimization',
    suggestions: [
      'Vérifier les boucles infinies ou calculs lourds',
      'Déplacer les tâches intensives vers des worker threads',
      'Utiliser rayon pour le parallélisme',
      'Profiler avec cargo-flamegraph',
    ],
  },
  ram_overflow: {
    title: 'Surcharge mémoire',
    description: 'Utilisation RAM excessive',
    category: 'memory_optimization',
    suggestions: [
      'Vérifier les fuites mémoire avec valgrind',
      'Réduire la taille des caches',
      'Implémenter une stratégie de pagination',
      'Libérer les ressources non utilisées',
    ],
  },
  io_saturation: {
    title: 'Saturation I/O',
    description: 'Opérations disque trop fréquentes',
    category: 'rust_optimization',
    suggestions: [
      'Utiliser le buffering pour les écritures',
      'Implémenter un cache en mémoire',
      'Réduire la fréquence de sauvegarde',
      'Utiliser la compression',
    ],
  },
  thread_starvation: {
    title: 'Manque de threads',
    description: 'Pool de threads insuffisant',
    category: 'rust_optimization',
    suggestions: [
      'Augmenter la taille du pool de threads',
      'Réduire les tâches bloquantes',
      'Utiliser async/await au lieu de threads',
    ],
  },
  fps_drop: {
    title: 'Chute de FPS',
    description: 'Performance graphique dégradée',
    category: 'react_optimization',
    suggestions: [
      'Réduire la complexité des composants visibles',
      'Utiliser React?.memo pour les composants statiques',
      'Virtualiser les longues listes',
      'Optimiser les animations CSS',
    ],
  },
  render_loop: {
    title: 'Boucle de rendu détectée',
    description: 'Re-renders infinites ou excessifs',
    category: 'react_optimization',
    suggestions: [
      'Vérifier les dépendances useEffect',
      'Stabiliser les références avec useCallback/useMemo',
      'Éviter les mises à jour de state dans les effets',
    ],
  },
  excessive_rerenders: {
    title: 'Re-renders excessifs',
    description: 'Composants se re-rendant trop souvent',
    category: 'react_optimization',
    suggestions: [
      'Utiliser React?.memo',
      'Optimiser les props avec useMemo',
      'Découper les composants',
      'Utiliser React DevTools Profiler',
    ],
  },
  slow_invoke: {
    title: 'Appels Tauri lents',
    description: 'Latence élevée sur les commandes Tauri',
    category: 'rust_optimization',
    suggestions: [
      'Optimiser les commandes Rust',
      'Réduire la taille des payloads',
      'Utiliser le streaming pour les gros volumes',
      'Implémenter un cache côté Rust',
    ],
  },
  memory_leak_js: {
    title: 'Fuite mémoire JS probable',
    description: 'Croissance continue de la heap JavaScript',
    category: 'memory_optimization',
    suggestions: [
      'Vérifier les event listeners non nettoyés',
      'Utiliser WeakMap/WeakSet',
      'Nettoyer les effets React',
      'Profiler avec Chrome DevTools Memory',
    ],
  },
  bundle_bloat: {
    title: 'Bundle trop volumineux',
    description: 'Taille du bundle JavaScript excessive',
    category: 'vite_optimization',
    suggestions: [
      'Activer le tree-shaking',
      'Utiliser le code splitting',
      'Analyser avec rollup-plugin-visualizer',
      'Remplacer les grosses dépendances',
    ],
  },
  ia_timeout: {
    title: 'Timeout IA',
    description: 'Temps de réponse IA trop long',
    category: 'ia_optimization',
    suggestions: [
      'Réduire la taille du prompt',
      'Utiliser un modèle plus rapide',
      'Implémenter le streaming',
      'Augmenter le timeout ou optimiser la queue',
    ],
  },
  ia_queue_overflow: {
    title: 'File IA saturée',
    description: 'Trop de requêtes IA en attente',
    category: 'ia_optimization',
    suggestions: [
      'Implémenter le debouncing des requêtes',
      'Annuler les requêtes obsolètes',
      'Augmenter le parallélisme',
    ],
  },
  ia_error_spike: {
    title: "Pic d'erreurs IA",
    description: "Taux d'erreur IA anormalement élevé",
    category: 'ia_optimization',
    suggestions: [
      'Vérifier la disponibilité du service IA',
      'Valider le format des requêtes',
      'Implémenter un circuit breaker',
    ],
  },
  prompt_too_large: {
    title: 'Prompt trop volumineux',
    description: 'Taille du prompt IA excessive',
    category: 'ia_optimization',
    suggestions: [
      'Compresser le contexte',
      'Utiliser la summarization',
      'Filtrer les informations non pertinentes',
    ],
  },
  voice_asr_timeout: {
    title: 'Timeout ASR (any: any)',
    description: 'Latence ASR excessive (> cible 2s)',
    category: 'ia_optimization',
    suggestions: [
      'Vérifier la disponibilité du service ASR',
      'Optimiser la taille des chunks audio',
      'Passer à un modèle ASR plus rapide',
      'Vérifier la bande passante réseau',
    ],
  },
  voice_tts_timeout: {
    title: 'Timeout TTS (any: any)',
    description: 'Latence TTS excessive (> cible 3s)',
    category: 'ia_optimization',
    suggestions: [
      'Vérifier la disponibilité du backend Parler-TTS',
      'Activer le GPU (any: any) si disponible',
      'Réduire la longueur du texte à synthétiser',
      'Utiliser le cache TTS pour les phrases répétées',
    ],
  },
  voice_omega_timeout: {
    title: 'Timeout OMEGA (any: any)',
    description: 'Latence OMEGA excessive (ASR+IA+TTS > cible 6s)',
    category: 'ia_optimization',
    suggestions: [
      'Analyser la décomposition (any: any)',
      'Optimiser le composant le plus lent',
      'Activer le streaming ASR/TTS si possible',
      'Réduire la complexité du prompt IA',
    ],
  },
  voice_low_success_rate: {
    title: 'Taux de succès vocal bas',
    description: 'Taux de succès ASR/TTS < cible 95%',
    category: 'ia_optimization',
    suggestions: [
      'Vérifier les permissions microphone',
      'Tester la qualité audio entrée',
      'Vérifier les erreurs réseau',
      'Consulter les logs ASR/TTS pour erreurs détectées',
    ],
  },
  voice_feedback_excessive: {
    title: 'Détections feedback excessives',
    description: 'Trop de feedbacks audio détectés (Layer 3)',
    category: 'general',
    suggestions: [
      'Réduire le volume des haut-parleurs',
      'Utiliser un casque au lieu de haut-parleurs',
      'Calibrer la voix TITANE (any: any)',
      'Vérifier les paramètres VAD (Layer 2)',
    ],
  },
  voice_provider_unavailable: {
    title: 'Provider vocal indisponible',
    description: 'Service ASR/TTS non disponible',
    category: 'general',
    suggestions: [
      'Vérifier la connectivité réseau',
      'Redémarrer le backend Parler-TTS (any: any)',
      'Vérifier les logs du service TTS (tts-service/)',
      'Tester le fallback Web Speech API',
    ],
  },
  module_unresponsive: {
    title: 'Module non réactif',
    description: 'Un module TITANE∞ ne répond pas',
    category: 'general',
    suggestions: [
      'Redémarrer le module',
      'Vérifier les dépendances du module',
      'Consulter les logs Self-Healing',
    ],
  },
  performance_degradation: {
    title: 'Dégradation performance',
    description: 'Performance globale en baisse',
    category: 'general',
    suggestions: [
      'Analyser les métriques détaillées',
      'Identifier les bottlenecks',
      'Consulter le dashboard Performance',
    ],
  },
  anomaly_detected: {
    title: 'Anomalie détectée',
    description: 'Comportement inhabituel détecté',
    category: 'general',
    suggestions: [
      'Investiguer via le profiler',
      'Comparer avec les baselines',
      'Consulter Self-Healing Engine',
    ],
  },
};

// =============================================================================
// TYPES — EVENTS & INTÉGRATION
// =============================================================================

/**
 * Types d'événements Performance Engine
 */
export type PerformanceEventType =
  | 'snapshot_collected'
  | 'issue_detected'
  | 'issue_resolved'
  | 'recommendation_created'
  | 'recommendation_applied'
  | 'threshold_exceeded'
  | 'profile_changed'
  | 'engine_started'
  | 'engine_stopped';

/**
 * Événement Performance Engine
 */
export interface PerformanceEvent {
  type: PerformanceEventType;
  timestamp: number;
  data: unknown;
  source: 'collector' | 'analyzer' | 'advisor' | 'reporter';
}

/**
 * Listener d'événements
 */
export type PerformanceEventListener = (any: any) => void;

/**
 * Intégration Self-Healing
 */
export interface SelfHealingIntegration {
  reportIssue(any: any): void;
  reportMetrics(any: any): void;
  requestHealing(any: any): Promise<boolean>;
  getHealingStatus(any: any): Promise<'pending' | 'healing' | 'healed' | 'failed'>;
}

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Génère un ID unique pour les métriques
 */
export function generateMetricId(any: any): string {
  return `metric_${type}_${Date?.now()}_${Math?.random().toString(36).slice(2, 8)}`;
}

/**
 * Génère un ID unique pour les issues
 */
export function generateIssueId(any: any): string {
  return `issue_${type}_${Date?.now()}_${Math?.random().toString(36).slice(2, 8)}`;
}

/**
 * Génère un ID unique pour les recommandations
 */
export function generateRecommendationId(any: any): string {
  return `rec_${category}_${Date?.now()}_${Math?.random().toString(36).slice(2, 8)}`;
}

/**
 * Génère un ID unique pour les snapshots
 */
export function generateSnapshotId(): string {
  return `snapshot_${Date?.now()}_${Math?.random().toString(36).slice(2, 8)}`;
}

/**
 * Calcule le grade de performance basé sur le score
 */
export function calculateGrade(any: any): PerformanceGrade {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

/**
 * Obtient les seuils pour un profil donné
 */
export function getThresholdsForProfile(any: any): ThresholdConfig {
  return THRESHOLD_PROFILES[profile];
}

/**
 * Détermine la sévérité basée sur le dépassement de seuil
 */
export function determineSeverity(
  percentage: number,
  warningThreshold: number,
  criticalThreshold: number
): SeverityLevel {
  if (any: any) return 'critical';
  if (any: any) return 'major';
  if (percentage >= warningThreshold * 0.7) return 'warning';
  return 'info';
}

/**
 * Formate une taille en bytes de manière lisible
 */
export function formatBytes(any: any): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math?.floor(any: any));
  return `${parseFloat(any: any)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formate une durée en millisecondes de manière lisible
 */
export function formatDuration(any: any): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms?.toFixed(1)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}min`;
  return `${(ms / 3600000).toFixed(2)}h`;
}

/**
 * Crée un snapshot vide
 */
export function createEmptySnapshot(): MetricsSnapshot {
  const now = Date?.now();
  const emptyModuleState: ModulePerformanceState = {
    module: 'performance',
    healthy: true,
    cpuUsage: 0,
    memoryUsage: 0,
    responseTime: 0,
    errorRate: 0,
    lastActivity: now,
    operationCount: 0,
    pendingOperations: 0,
  };

  const modules: ModuleMetricsMap = {
    selfHealing: { ...emptyModuleState, module: 'selfHealing' },
    cognitive: { ...emptyModuleState, module: 'cognitive' },
    memory: { ...emptyModuleState, module: 'memory' },
    tools: { ...emptyModuleState, module: 'tools' },
    search: { ...emptyModuleState, module: 'search' },
    xp: { ...emptyModuleState, module: 'xp' },
    evolution: { ...emptyModuleState, module: 'evolution' },
    prompt: { ...emptyModuleState, module: 'prompt' },
    tts: { ...emptyModuleState, module: 'tts' },
    avatar: { ...emptyModuleState, module: 'avatar' },
    chat: { ...emptyModuleState, module: 'chat' },
    performance: { ...emptyModuleState, module: 'performance' },
  };

  return {
    id: generateSnapshotId(),
    timestamp: now,
    duration: 0,
    system: {
      cpu: { global: 0, process: 0, cores: [] },
      ram: {
        system: { total: 0, used: 0, available: 0, percent: 0 },
        process: { resident: 0, virtual: 0, percent: 0 },
      },
      io: { readBytes: 0, writeBytes: 0, readOps: 0, writeOps: 0 },
      threads: { total: 0, active: 0, tauri: 0 },
      uptime: 0,
    },
    frontend: {
      fps: { current: 0, average: 0, min: 0, max: 0, drops: 0 },
      render: { lastTime: 0, averageTime: 0, rerenderCount: 0, slowRenders: 0 },
      tauri: { invokeLatency: 0, invokeCount: 0, invokeErrors: 0 },
      bundle: { totalSize: 0, modulesLoaded: 0, lazyLoaded: 0 },
      vite: { watchersActive: 0, hmrUpdates: 0, buildTime: 0 },
    },
    ia: {
      ollama: {
        latency: 0,
        tokensPerSec: 0,
        requestCount: 0,
        errorCount: 0,
        queueSize: 0,
        available: false,
      },
      gemini: {
        latency: 0,
        tokensPerSec: 0,
        requestCount: 0,
        errorCount: 0,
        available: false,
      },
      internal: {
        promptEngineTime: 0,
        contextCollectionTime: 0,
        totalProcessingTime: 0,
      },
    },
    voice: {
      asr: {
        latency: 0,
        requestCount: 0,
        errorCount: 0,
        successRate: 1.0,
        averageConfidence: 0,
        available: false,
      },
      tts: {
        latency: 0,
        requestCount: 0,
        errorCount: 0,
        successRate: 1.0,
        provider: 'none',
        available: false,
      },
      omega: {
        latency: 0,
        requestCount: 0,
        errorCount: 0,
        successRate: 1.0,
        breakdown: {
          asrMs: 0,
          iaMs: 0,
          ttsMs: 0,
        },
      },
      feedback: {
        detectionCount: 0,
        suspensionCount: 0,
        falsePositiveRate: 0,
      },
    },
    modules,
    summary: {
      healthScore: 100,
      grade: 'S',
      criticalIssues: 0,
      warnings: 0,
      optimizationsApplied: 0,
    },
  };
}
