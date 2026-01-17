/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING ANALYZER — Layer 2
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Couche d'analyse et de diagnostic des anomalies
 *
 * @responsibilities
 * - Analyse des événements capturés par l'Observer
 * - Classification de la nature et sévérité
 * - Identification des causes probables
 * - Détection de patterns récurrents
 * - Calcul de l'urgence et de l'impact
 * - Génération de diagnostics structurés
 * - Proposition d'actions de réparation
 *
 * @architecture Layer 2 of 5 (Observer → Analyzer → Playbook → Executor → Sync)
 * @version vΩ∞
 * @created 2025-01-07
 */

import {
  type HealingEvent,
  type HealingDiagnosis,
  type HealingSeverity,
  type HealingActionType,
  type ModuleCategory,
  type PatternRecord,
} from './selfHealing.config';
import { type ObservedError, type AnomalyType } from './selfHealingObserver';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration de l'Analyzer */
export interface AnalyzerConfig {
  enabled: boolean;
  confidenceThreshold: number;
  patternDetectionWindow: number;
  patternMinOccurrences: number;
  maxHistorySize: number;
  autoEscalate: boolean;
  escalationThreshold: HealingSeverity;
}

/** Contexte d'analyse enrichi */
export interface AnalysisContext {
  recentEvents: HealingEvent[];
  systemState: SystemSnapshot;
  patterns: PatternRecord[];
  moduleHealth: Map<string, ModuleHealthScore>;
}

/** Snapshot de l'état système */
export interface SystemSnapshot {
  timestamp: number;
  cpuUsage?: number;
  memoryUsage?: number;
  activeModules: string[];
  pendingOperations: number;
  lastSuccessfulHeal?: number;
}

/** Score de santé d'un module */
export interface ModuleHealthScore {
  moduleId: string;
  score: number; // 0-100
  errorCount: number;
  lastError?: number;
  healAttempts: number;
  trend: 'improving' | 'stable' | 'degrading';
}

/** Règle de diagnostic */
export interface DiagnosticRule {
  id: string;
  name: string;
  description: string;
  matchCondition: (event: HealingEvent, context: AnalysisContext) => boolean;
  diagnose: (event: HealingEvent, context: AnalysisContext) => Partial<HealingDiagnosis>;
  priority: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: AnalyzerConfig = {
  enabled: true,
  confidenceThreshold: 0.6,
  patternDetectionWindow: 300000, // 5 minutes
  patternMinOccurrences: 3,
  maxHistorySize: 500,
  autoEscalate: true,
  escalationThreshold: 'critical',
};

/** Mapping sévérité vers urgence */
const SEVERITY_TO_URGENCY: Record<HealingSeverity, number> = {
  info: 1,
  low: 3,
  medium: 5,
  high: 7,
  critical: 10,
};

/** Actions suggérées par type d'anomalie */
const ANOMALY_ACTIONS: Record<AnomalyType, HealingActionType[]> = {
  js_runtime_error: ['patch_component', 'reset_state', 'restart_module'],
  unhandled_promise: ['patch_component', 'reset_state'],
  react_error_boundary: ['restart_module', 'reset_state', 'patch_component'],
  tauri_command_fail: ['restart_module', 'clear_cache', 'sync_state'],
  rust_panic: ['restart_process', 'isolate_module', 'restart_module'],
  network_failure: ['fallback_provider', 'clear_cache', 'restart_worker'],
  performance_degradation: ['clear_cache', 'restart_worker', 'isolate_module'],
  memory_corruption: ['rebuild_memory', 'clear_cache', 'restart_module'],
  tts_engine_fail: ['restart_module', 'fallback_provider', 'clear_cache'],
  avatar_render_fail: ['restart_module', 'clear_cache', 'reset_state'],
  pipeline_stuck: ['restart_worker', 'clear_cache', 'reset_state'],
  state_desync: ['sync_state', 'reset_state', 'restart_module'],
  config_invalid: ['regenerate_config', 'repair_json', 'reset_state'],
  unknown_anomaly: ['mini_audit', 'reset_state', 'noop'],
};

/** Causes probables par type d'anomalie */
const ANOMALY_CAUSES: Record<AnomalyType, string[]> = {
  js_runtime_error: [
    'Variable non définie',
    'Accès à une propriété null/undefined',
    'Erreur de typage',
    'Stack overflow',
  ],
  unhandled_promise: [
    'Timeout réseau',
    'API indisponible',
    'Erreur de parsing JSON',
    'Rejection explicite',
  ],
  react_error_boundary: [
    'Composant mal initialisé',
    'Props invalides',
    'État corrompu',
    'Rendu conditionnel défaillant',
  ],
  tauri_command_fail: [
    'Commande non enregistrée',
    'Payload invalide',
    'Permission refusée',
    'Backend Rust panic',
  ],
  rust_panic: [
    'Déréférencement de pointeur null',
    'Index hors limites',
    'Unwrap sur None/Err',
    'Assertion échouée',
  ],
  network_failure: [
    'Serveur indisponible',
    'Timeout dépassé',
    'DNS non résolu',
    'CORS bloqué',
  ],
  performance_degradation: [
    'Fuite mémoire',
    'Boucle infinie',
    'Trop de rendus React',
    'Requêtes excessives',
  ],
  memory_corruption: [
    'Données persistantes corrompues',
    'JSON malformé',
    'Version incompatible',
    'Écriture partielle',
  ],
  tts_engine_fail: [
    'Modèle TTS non chargé',
    'Audio context fermé',
    'Rate limit atteint',
    'Format audio non supporté',
  ],
  avatar_render_fail: [
    'WebGL context perdu',
    'Modèle 3D corrompu',
    'Animation invalide',
    'Ressource manquante',
  ],
  pipeline_stuck: [
    'Worker bloqué',
    'Queue saturée',
    'Dépendance circulaire',
    'Timeout pipeline',
  ],
  state_desync: [
    'Race condition',
    'Événement manqué',
    'Store mal initialisé',
    "Mutation directe d'état",
  ],
  config_invalid: [
    'Fichier config corrompu',
    'Clé manquante',
    'Valeur hors limites',
    'Format incompatible',
  ],
  unknown_anomaly: ['Cause indéterminée', 'Erreur silencieuse', 'État inattendu'],
};

// ═══════════════════════════════════════════════════════════════════════════
// DIAGNOSTIC RULES
// ═══════════════════════════════════════════════════════════════════════════

const DIAGNOSTIC_RULES: DiagnosticRule[] = [
  {
    id: 'critical_cascade',
    name: 'Cascade Critique',
    description: "Détecte une cascade d'erreurs critiques",
    matchCondition: (event, context) => {
      const recentCritical = context.recentEvents.filter(
        e => e.severity === 'critical' && Date.now() - e.timestamp < 60000
      );
      return event.severity === 'critical' && recentCritical.length >= 2;
    },
    diagnose: () => ({
      nature: 'cascade_failure',
      probableCause: 'Défaillance en cascade - plusieurs modules critiques affectés',
      urgency: 10,
      escalationRequired: true,
      potentialImpact: [
        'Instabilité système majeure',
        'Perte potentielle de données',
        'Dégradation expérience utilisateur',
      ],
    }),
    priority: 100,
  },
  {
    id: 'recurring_pattern',
    name: 'Pattern Récurrent',
    description: "Détecte un pattern d'erreur récurrent",
    matchCondition: (event, context) => {
      const similar = context.recentEvents.filter(
        e => e.eventType === event.eventType && e.moduleId === event.moduleId
      );
      return similar.length >= 3;
    },
    diagnose: (event, context) => {
      const similar = context.recentEvents.filter(
        e => e.eventType === event.eventType && e.moduleId === event.moduleId
      );
      return {
        nature: 'recurring_error',
        probableCause: `Erreur récurrente (${similar.length} occurrences) - cause systémique probable`,
        historicalPatterns: [`Pattern ${event.eventType} détecté ${similar.length}x`],
        suggestedActions: ['mini_audit', 'restart_module', 'clear_cache'],
      };
    },
    priority: 80,
  },
  {
    id: 'module_degradation',
    name: 'Dégradation Module',
    description: "Détecte la dégradation progressive d'un module",
    matchCondition: (event, context) => {
      const health = context.moduleHealth.get(event.moduleId);
      return health !== undefined && health.trend === 'degrading' && health.score < 50;
    },
    diagnose: (event, context) => {
      const health = context.moduleHealth.get(event.moduleId);
      return {
        nature: 'module_degradation',
        probableCause: `Module ${event.moduleName} en dégradation (score: ${health?.score || 0}%)`,
        urgency: health && health.score < 30 ? 8 : 6,
        potentialImpact: [
          `Module ${event.moduleName} risque de devenir non fonctionnel`,
          'Fonctionnalités dépendantes affectées',
        ],
      };
    },
    priority: 70,
  },
  {
    id: 'memory_pressure',
    name: 'Pression Mémoire',
    description: 'Détecte les problèmes de mémoire',
    matchCondition: (event, context) => {
      return (
        event.eventType === 'memory_corruption' ||
        (context.systemState.memoryUsage !== undefined &&
          context.systemState.memoryUsage > 85)
      );
    },
    diagnose: (_, context) => ({
      nature: 'memory_pressure',
      probableCause: `Pression mémoire élevée (${context.systemState.memoryUsage || 'N/A'}%)`,
      urgency: 7,
      suggestedActions: ['clear_cache', 'restart_worker', 'isolate_module'],
      potentialImpact: [
        'Ralentissement général',
        'Risque de crash',
        'Perte de données en mémoire',
      ],
    }),
    priority: 75,
  },
  {
    id: 'ia_pipeline_issue',
    name: 'Problème Pipeline IA',
    description: 'Détecte les problèmes de pipeline IA',
    matchCondition: event => {
      return event.category === 'ia' || event.eventType === 'pipeline_stuck';
    },
    diagnose: event => ({
      nature: 'ia_pipeline_failure',
      affectedModule: event.moduleName,
      probableCause: 'Pipeline IA bloqué ou timeout',
      suggestedActions: ['restart_worker', 'fallback_provider', 'clear_cache'],
      potentialImpact: [
        'Réponses IA indisponibles',
        'Queue de messages en attente',
        'Expérience utilisateur dégradée',
      ],
    }),
    priority: 65,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ANALYZER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class SelfHealingAnalyzer {
  private static instance: SelfHealingAnalyzer;

  private config: AnalyzerConfig;
  private eventHistory: HealingEvent[];
  private patterns: Map<string, PatternRecord>;
  private moduleHealth: Map<string, ModuleHealthScore>;
  private diagnosticRules: DiagnosticRule[];

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.eventHistory = [];
    this.patterns = new Map();
    this.moduleHealth = new Map();
    this.diagnosticRules = [...DIAGNOSTIC_RULES];
  }

  public static getInstance(): SelfHealingAnalyzer {
    if (!SelfHealingAnalyzer.instance) {
      SelfHealingAnalyzer.instance = new SelfHealingAnalyzer();
    }
    return SelfHealingAnalyzer.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  public configure(config: Partial<AnalyzerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): AnalyzerConfig {
    return { ...this.config };
  }

  public addDiagnosticRule(rule: DiagnosticRule): void {
    this.diagnosticRules.push(rule);
    this.diagnosticRules.sort((a, b) => b.priority - a.priority);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Analyse un événement et génère un diagnostic
   */
  public analyze(event: HealingEvent): HealingDiagnosis {
    if (!this.config.enabled) {
      return this.createDefaultDiagnosis(event);
    }

    // Ajouter à l'historique
    this.addToHistory(event);

    // Mettre à jour la santé du module
    this.updateModuleHealth(event);

    // Détecter les patterns
    this.detectPatterns(event);

    // Créer le contexte d'analyse
    const context = this.buildContext();

    // Appliquer les règles de diagnostic
    const diagnosis = this.applyRules(event, context);

    logger.debug(
      `[SelfHealingAnalyzer] 🔬 Diagnosis: [${diagnosis.severity}] ${diagnosis.nature} - confidence: ${(diagnosis.confidence * 100).toFixed(0)}%`
    );

    return diagnosis;
  }

  /**
   * Analyse multiple événements en batch
   */
  public analyzeBatch(events: HealingEvent[]): HealingDiagnosis[] {
    return events.map(event => this.analyze(event));
  }

  /**
   * Analyse un ObservedError (depuis l'Observer)
   */
  public analyzeObservedError(error: ObservedError): HealingDiagnosis {
    const event: HealingEvent = {
      id: error.id,
      timestamp: error.timestamp,
      category: this.mapSourceToCategory(error.source),
      moduleId: `${error.source}_${error.type}`,
      moduleName: error.type,
      eventType: error.type,
      message: error.message,
      stackTrace: error.context.stack,
      context: error.context as unknown as Record<string, unknown>,
      severity: error.severity,
      autoDetected: true,
    };

    return this.analyze(event);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private addToHistory(event: HealingEvent): void {
    this.eventHistory.push(event);

    // Limiter la taille de l'historique
    if (this.eventHistory.length > this.config.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.config.maxHistorySize);
    }
  }

  private updateModuleHealth(event: HealingEvent): void {
    const existing = this.moduleHealth.get(event.moduleId);
    const now = Date.now();

    if (existing) {
      // Calculer le nouveau score
      const timeSinceLastError = existing.lastError ? now - existing.lastError : Infinity;
      const decayFactor = Math.min(1, timeSinceLastError / 60000); // Récupération sur 1 minute
      const severityPenalty = SEVERITY_TO_URGENCY[event.severity] * 5;

      const newScore = Math.max(
        0,
        Math.min(100, existing.score * (0.9 + 0.1 * decayFactor) - severityPenalty)
      );

      // Déterminer la tendance
      let trend: 'improving' | 'stable' | 'degrading' = 'stable';
      if (newScore > existing.score + 5) trend = 'improving';
      else if (newScore < existing.score - 5) trend = 'degrading';

      this.moduleHealth.set(event.moduleId, {
        ...existing,
        score: newScore,
        errorCount: existing.errorCount + 1,
        lastError: now,
        trend,
      });
    } else {
      // Nouveau module
      const initialScore = 100 - SEVERITY_TO_URGENCY[event.severity] * 10;
      this.moduleHealth.set(event.moduleId, {
        moduleId: event.moduleId,
        score: initialScore,
        errorCount: 1,
        lastError: now,
        healAttempts: 0,
        trend: initialScore < 70 ? 'degrading' : 'stable',
      });
    }
  }

  private detectPatterns(event: HealingEvent): void {
    const patternKey = `${event.category}:${event.eventType}`;
    const existing = this.patterns.get(patternKey);
    const now = Date.now();

    if (existing) {
      // Vérifier si dans la fenêtre de détection
      if (now - existing.lastOccurrence < this.config.patternDetectionWindow) {
        this.patterns.set(patternKey, {
          ...existing,
          occurrences: existing.occurrences + 1,
          lastOccurrence: now,
        });
      } else {
        // Reset si hors fenêtre
        this.patterns.set(patternKey, {
          ...existing,
          occurrences: 1,
          lastOccurrence: now,
        });
      }
    } else {
      // Nouveau pattern
      this.patterns.set(patternKey, {
        patternId: patternKey,
        description: `Pattern ${event.eventType} dans ${event.category}`,
        occurrences: 1,
        lastOccurrence: now,
        associatedPlaybook: null,
        autoResolved: false,
      });
    }
  }

  private buildContext(): AnalysisContext {
    const now = Date.now();
    const windowStart = now - this.config.patternDetectionWindow;

    return {
      recentEvents: this.eventHistory.filter(e => e.timestamp >= windowStart),
      systemState: {
        timestamp: now,
        activeModules: [...this.moduleHealth.keys()],
        pendingOperations: 0,
      },
      patterns: [...this.patterns.values()],
      moduleHealth: this.moduleHealth,
    };
  }

  private applyRules(event: HealingEvent, context: AnalysisContext): HealingDiagnosis {
    // Diagnostic de base
    let diagnosis = this.createDefaultDiagnosis(event);
    let maxConfidence = 0.5;

    // Appliquer les règles (triées par priorité)
    for (const rule of this.diagnosticRules) {
      try {
        if (rule.matchCondition(event, context)) {
          const ruleDiagnosis = rule.diagnose(event, context);
          const ruleConfidence = 0.6 + rule.priority / 200;

          if (ruleConfidence > maxConfidence) {
            diagnosis = {
              ...diagnosis,
              ...ruleDiagnosis,
              confidence: ruleConfidence,
            };
            maxConfidence = ruleConfidence;
          }
        }
      } catch (err) {
        logger.warn(`[SelfHealingAnalyzer] Rule ${rule.id} failed:`, err);
      }
    }

    // Ajouter les actions suggérées si pas déjà définies
    if (!diagnosis.suggestedActions || diagnosis.suggestedActions.length === 0) {
      const eventType = event.eventType as AnomalyType;
      diagnosis.suggestedActions = ANOMALY_ACTIONS[eventType] || ['noop'];
    }

    // Vérifier si escalation requise
    if (this.config.autoEscalate && this.shouldEscalate(diagnosis.severity, context)) {
      diagnosis.escalationRequired = true;
    }

    return diagnosis;
  }

  private createDefaultDiagnosis(event: HealingEvent): HealingDiagnosis {
    const eventType = event.eventType as AnomalyType;
    const causes = ANOMALY_CAUSES[eventType] || ANOMALY_CAUSES.unknown_anomaly;

    return {
      eventId: event.id,
      timestamp: Date.now(),
      nature: event.eventType,
      affectedModule: event.moduleName,
      category: event.category,
      probableCause: causes[0] || 'Cause inconnue',
      severity: event.severity,
      urgency: SEVERITY_TO_URGENCY[event.severity],
      potentialImpact: this.estimateImpact(event),
      suggestedActions: ANOMALY_ACTIONS[eventType] || ['noop'],
      historicalPatterns: this.getRelatedPatterns(event),
      escalationRequired: event.severity === 'critical',
      confidence: 0.5,
    };
  }

  private estimateImpact(event: HealingEvent): string[] {
    const impacts: string[] = [];

    switch (event.category) {
      case 'react':
        impacts.push('Interface utilisateur potentiellement non responsive');
        break;
      case 'tauri':
        impacts.push('Communication frontend-backend compromise');
        break;
      case 'ia':
        impacts.push('Fonctionnalités IA indisponibles');
        break;
      case 'tts':
        impacts.push('Synthèse vocale désactivée');
        break;
      case 'memory':
        impacts.push('Risque de perte de données');
        break;
      case 'network':
        impacts.push('Fonctionnalités réseau dégradées');
        break;
      case 'performance':
        impacts.push("Ralentissement général de l'application");
        break;
    }

    if (event.severity === 'critical') {
      impacts.push("Risque d'instabilité système majeure");
    }

    return impacts;
  }

  private getRelatedPatterns(event: HealingEvent): string[] {
    const related: string[] = [];

    for (const [key, pattern] of this.patterns) {
      if (key.includes(event.category) || key.includes(event.eventType)) {
        related.push(`${pattern.description} (${pattern.occurrences}x)`);
      }
    }

    return related;
  }

  private shouldEscalate(severity: HealingSeverity, context: AnalysisContext): boolean {
    // Escalade si sévérité >= seuil
    const severityOrder: HealingSeverity[] = [
      'info',
      'low',
      'medium',
      'high',
      'critical',
    ];
    const currentIndex = severityOrder.indexOf(severity);
    const thresholdIndex = severityOrder.indexOf(this.config.escalationThreshold);

    if (currentIndex >= thresholdIndex) return true;

    // Escalade si trop d'erreurs récentes
    const recentCriticalCount = context.recentEvents.filter(
      e => e.severity === 'critical' || e.severity === 'high'
    ).length;

    return recentCriticalCount >= 5;
  }

  private mapSourceToCategory(source: string): ModuleCategory {
    const mapping: Record<string, ModuleCategory> = {
      js: 'react',
      react: 'react',
      tauri: 'tauri',
      rust: 'tauri',
      network: 'network',
      performance: 'performance',
    };
    return mapping[source] || 'react';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  public getModuleHealth(moduleId: string): ModuleHealthScore | undefined {
    return this.moduleHealth.get(moduleId);
  }

  public getAllModuleHealth(): ModuleHealthScore[] {
    return [...this.moduleHealth.values()];
  }

  public getPatterns(): PatternRecord[] {
    return [...this.patterns.values()];
  }

  public getRecurringPatterns(): PatternRecord[] {
    return [...this.patterns.values()].filter(
      p => p.occurrences >= this.config.patternMinOccurrences
    );
  }

  public getEventHistory(maxAge?: number): HealingEvent[] {
    if (maxAge === undefined) {
      return [...this.eventHistory];
    }

    const now = Date.now();
    return this.eventHistory.filter(e => now - e.timestamp <= maxAge);
  }

  public clearHistory(): void {
    this.eventHistory = [];
    this.patterns.clear();
    // Garder moduleHealth pour le suivi long terme
  }

  public resetModuleHealth(moduleId?: string): void {
    if (moduleId) {
      this.moduleHealth.delete(moduleId);
    } else {
      this.moduleHealth.clear();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const selfHealingAnalyzer = SelfHealingAnalyzer.getInstance();

export default selfHealingAnalyzer;
