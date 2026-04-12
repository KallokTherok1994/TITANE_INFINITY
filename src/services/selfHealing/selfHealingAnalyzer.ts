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

/**
 * v30.3.0: Graduated action escalation — actions scored by risk level + base priority
 * Actions ordered from lowest-risk to highest-risk per anomaly type.
 * At runtime, getGraduatedActions() selects actions based on severity × module health.
 */
interface ScoredAction {
  action: HealingActionType;
  basePriority: number; // 0-1, higher = preferred first
  riskLevel: number; // 0-1, higher = more disruptive
}

const ANOMALY_ACTIONS_SCORED: Record<AnomalyType, ScoredAction[]> = {
  js_runtime_error: [
    { action: 'patch_component', basePriority: 0.9, riskLevel: 0.2 },
    { action: 'reset_state', basePriority: 0.6, riskLevel: 0.5 },
    { action: 'restart_module', basePriority: 0.3, riskLevel: 0.8 },
  ],
  unhandled_promise: [
    { action: 'patch_component', basePriority: 0.8, riskLevel: 0.2 },
    { action: 'reset_state', basePriority: 0.5, riskLevel: 0.5 },
  ],
  react_error_boundary: [
    { action: 'patch_component', basePriority: 0.7, riskLevel: 0.2 },
    { action: 'reset_state', basePriority: 0.6, riskLevel: 0.5 },
    { action: 'restart_module', basePriority: 0.4, riskLevel: 0.8 },
  ],
  tauri_command_fail: [
    { action: 'clear_cache', basePriority: 0.8, riskLevel: 0.2 },
    { action: 'sync_state', basePriority: 0.6, riskLevel: 0.4 },
    { action: 'restart_module', basePriority: 0.3, riskLevel: 0.8 },
  ],
  rust_panic: [
    { action: 'restart_module', basePriority: 0.7, riskLevel: 0.6 },
    { action: 'isolate_module', basePriority: 0.5, riskLevel: 0.7 },
    { action: 'restart_process', basePriority: 0.3, riskLevel: 0.95 },
  ],
  network_failure: [
    { action: 'fallback_provider', basePriority: 0.9, riskLevel: 0.1 },
    { action: 'clear_cache', basePriority: 0.5, riskLevel: 0.3 },
    { action: 'restart_worker', basePriority: 0.3, riskLevel: 0.7 },
  ],
  performance_degradation: [
    { action: 'clear_cache', basePriority: 0.8, riskLevel: 0.2 },
    { action: 'restart_worker', basePriority: 0.5, riskLevel: 0.6 },
    { action: 'isolate_module', basePriority: 0.3, riskLevel: 0.7 },
  ],
  memory_corruption: [
    { action: 'rebuild_memory', basePriority: 0.8, riskLevel: 0.4 },
    { action: 'clear_cache', basePriority: 0.6, riskLevel: 0.3 },
    { action: 'restart_module', basePriority: 0.3, riskLevel: 0.8 },
  ],
  tts_engine_fail: [
    { action: 'fallback_provider', basePriority: 0.8, riskLevel: 0.1 },
    { action: 'restart_module', basePriority: 0.5, riskLevel: 0.6 },
    { action: 'clear_cache', basePriority: 0.4, riskLevel: 0.3 },
  ],
  avatar_render_fail: [
    { action: 'clear_cache', basePriority: 0.7, riskLevel: 0.2 },
    { action: 'reset_state', basePriority: 0.5, riskLevel: 0.5 },
    { action: 'restart_module', basePriority: 0.3, riskLevel: 0.8 },
  ],
  pipeline_stuck: [
    { action: 'restart_worker', basePriority: 0.8, riskLevel: 0.5 },
    { action: 'clear_cache', basePriority: 0.5, riskLevel: 0.3 },
    { action: 'reset_state', basePriority: 0.3, riskLevel: 0.6 },
  ],
  state_desync: [
    { action: 'sync_state', basePriority: 0.9, riskLevel: 0.2 },
    { action: 'reset_state', basePriority: 0.5, riskLevel: 0.5 },
    { action: 'restart_module', basePriority: 0.2, riskLevel: 0.8 },
  ],
  config_invalid: [
    { action: 'repair_json', basePriority: 0.8, riskLevel: 0.2 },
    { action: 'regenerate_config', basePriority: 0.6, riskLevel: 0.4 },
    { action: 'reset_state', basePriority: 0.3, riskLevel: 0.6 },
  ],
  unknown_anomaly: [
    { action: 'mini_audit', basePriority: 0.7, riskLevel: 0.1 },
    { action: 'reset_state', basePriority: 0.4, riskLevel: 0.5 },
    { action: 'noop', basePriority: 0.2, riskLevel: 0.0 },
  ],
};

/**
 * v30.3.0: Get graduated actions based on severity and module health.
 * Low severity + healthy module → prefer low-risk actions
 * High severity + degrading module → escalate to higher-risk actions
 */
function getGraduatedActions(
  anomalyType: AnomalyType,
  severity: HealingSeverity,
  moduleHealthScore?: number
): HealingActionType[] {
  const scored =
    ANOMALY_ACTIONS_SCORED[anomalyType] || ANOMALY_ACTIONS_SCORED.unknown_anomaly;
  const severityWeight = SEVERITY_TO_URGENCY[severity] / 10; // 0.1-1.0
  // Lower health → more willing to accept risky actions
  const healthFactor =
    moduleHealthScore !== undefined ? (100 - moduleHealthScore) / 100 : 0.5;
  // Escalation factor: high severity + low health = accept more risk
  const riskTolerance = severityWeight * 0.6 + healthFactor * 0.4;

  return scored
    .map(s => ({
      action: s.action,
      // Score = base priority boosted by risk tolerance matching
      // Low risk tolerance → prefer high basePriority + low riskLevel
      // High risk tolerance → accept all actions, prefer basePriority
      effectiveScore:
        s.basePriority * 0.6 + (1 - Math.abs(s.riskLevel - riskTolerance)) * 0.4,
    }))
    .sort((a, b) => b.effectiveScore - a.effectiveScore)
    .map(s => s.action);
}

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

    console.log(
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

  /**
   * v30.3.0: Confidence-weighted multi-rule aggregation
   * Instead of winner-takes-all, aggregate matching rules weighted by priority
   * Combines insights from all matching rules for richer diagnosis
   */
  private applyRules(event: HealingEvent, context: AnalysisContext): HealingDiagnosis {
    // Diagnostic de base
    let diagnosis = this.createDefaultDiagnosis(event);

    // Collect all matching rules with their diagnoses
    const matchedRules: Array<{
      rule: DiagnosticRule;
      diag: Partial<HealingDiagnosis>;
      confidence: number;
    }> = [];

    for (const rule of this.diagnosticRules) {
      try {
        if (rule.matchCondition(event, context)) {
          const ruleDiagnosis = rule.diagnose(event, context);
          const ruleConfidence = 0.6 + rule.priority / 200;
          matchedRules.push({ rule, diag: ruleDiagnosis, confidence: ruleConfidence });
        }
      } catch (err) {
        console.warn(`[SelfHealingAnalyzer] Rule ${rule.id} failed:`, err);
      }
    }

    if (matchedRules.length > 0) {
      // Sort by confidence descending
      matchedRules.sort((a, b) => b.confidence - a.confidence);
      const primary = matchedRules[0];
      if (!primary) return diagnosis;

      // Primary rule provides the base diagnosis
      diagnosis = {
        ...diagnosis,
        ...primary.diag,
        confidence: primary.confidence,
      };

      // v30.3.0: Aggregate secondary rules — merge their insights
      // Each additional matching rule slightly boosts confidence (diminishing returns)
      // and contributes unique impact/pattern information
      for (let i = 1; i < matchedRules.length; i++) {
        const secondary = matchedRules[i];
        if (!secondary) continue;
        // Confidence boost: +0.03 per additional rule, diminishing after 3
        const boostIncrement = i <= 3 ? 0.03 : 0.01;
        diagnosis.confidence = Math.min(0.98, diagnosis.confidence + boostIncrement);

        // Merge unique impacts
        if (secondary.diag.potentialImpact) {
          const existing = new Set(diagnosis.potentialImpact || []);
          for (const impact of secondary.diag.potentialImpact) {
            if (!existing.has(impact)) {
              diagnosis.potentialImpact = [...(diagnosis.potentialImpact || []), impact];
            }
          }
        }
        // Merge unique historical patterns
        if (secondary.diag.historicalPatterns) {
          const existing = new Set(diagnosis.historicalPatterns || []);
          for (const pattern of secondary.diag.historicalPatterns) {
            if (!existing.has(pattern)) {
              diagnosis.historicalPatterns = [
                ...(diagnosis.historicalPatterns || []),
                pattern,
              ];
            }
          }
        }
        // Escalation: if ANY rule requires escalation, escalate
        if (secondary.diag.escalationRequired) {
          diagnosis.escalationRequired = true;
        }
      }
    }

    // v30.3.0: Use graduated actions based on severity and module health
    if (!diagnosis.suggestedActions || diagnosis.suggestedActions.length === 0) {
      const eventType = event.eventType as AnomalyType;
      const moduleHealth = this.moduleHealth.get(event.moduleId);
      diagnosis.suggestedActions = getGraduatedActions(
        eventType,
        event.severity,
        moduleHealth?.score
      );
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

    // v30.3.0: Use graduated actions based on severity and current module health
    const moduleHealth = this.moduleHealth.get(event.moduleId);
    const graduatedActions = getGraduatedActions(
      eventType,
      event.severity,
      moduleHealth?.score
    );

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
      suggestedActions: graduatedActions,
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

  /**
   * v30.3.0: Graduated escalation with multi-factor scoring
   * Instead of binary severity threshold, compute escalation score
   * considering severity, frequency, module health degradation trend
   */
  private shouldEscalate(severity: HealingSeverity, context: AnalysisContext): boolean {
    const severityOrder: HealingSeverity[] = [
      'info',
      'low',
      'medium',
      'high',
      'critical',
    ];
    const currentIndex = severityOrder.indexOf(severity);
    const thresholdIndex = severityOrder.indexOf(this.config.escalationThreshold);

    // Direct escalation for severity >= threshold
    if (currentIndex >= thresholdIndex) return true;

    // v30.3.0: Multi-factor escalation scoring
    // Factor 1: Recent high-severity event density (0-1)
    const recentHighSeverity = context.recentEvents.filter(
      e => e.severity === 'critical' || e.severity === 'high'
    ).length;
    const eventDensityScore = Math.min(1.0, recentHighSeverity / 5);

    // Factor 2: Module degradation trend (0-1) — any degrading module adds pressure
    let degradingModules = 0;
    for (const health of context.moduleHealth.values()) {
      if (health.trend === 'degrading') degradingModules++;
    }
    const degradationScore = Math.min(1.0, degradingModules / 3);

    // Factor 3: Pattern recurrence — recurring patterns indicate systemic issue
    const recurringPatterns = context.patterns.filter(
      p => p.occurrences >= this.config.patternMinOccurrences
    ).length;
    const patternScore = Math.min(1.0, recurringPatterns / 2);

    // Combined escalation score: weighted average
    const escalationScore =
      eventDensityScore * 0.45 + degradationScore * 0.3 + patternScore * 0.25;

    // Escalate if combined score exceeds threshold
    return escalationScore >= 0.6;
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
