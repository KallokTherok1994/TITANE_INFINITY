/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING PLAYBOOK ENGINE — Layer 3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Moteur de sélection et génération de playbooks de réparation
 *
 * @responsibilities
 * - Sélection du playbook optimal pour un diagnostic
 * - Génération de plans d'action personnalisés
 * - Validation des pré-conditions
 * - Estimation du temps et risque
 * - Gestion des dépendances entre actions
 * - Support du rollback
 *
 * @architecture Layer 3 of 5 (Observer → Analyzer → Playbook → Executor → Sync)
 * @version vΩ∞
 * @created 2025-01-07
 */

import {
  type HealingDiagnosis,
  type HealingPlaybook,
  type HealingAction,
  type HealingActionType,
  type HealingSeverity,
  type ModuleCategory,
  type PlaybookCondition,
} from './selfHealing.config';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration du Playbook Engine */
export interface PlaybookEngineConfig {
  enabled: boolean;
  maxActionsPerPlaybook: number;
  defaultTimeout: number;
  requireConfirmationFor: HealingSeverity[];
  allowRiskyActions: boolean;
  autoRollbackOnFailure: boolean;
}

/** Plan d'exécution généré */
export interface ExecutionPlan {
  id: string;
  playbookId: string;
  playbookName: string;
  diagnosisId: string;
  timestamp: number;
  estimatedDuration: number;
  riskLevel: 'safe' | 'moderate' | 'risky';
  actions: PlannedAction[];
  rollbackActions: PlannedAction[];
  requiresConfirmation: boolean;
  metadata: Record<string, unknown>;
}

/** Action planifiée avec dépendances */
export interface PlannedAction {
  id: string;
  sequence: number;
  action: HealingAction;
  dependencies: string[];
  estimatedDuration: number;
  canParallelize: boolean;
  status: 'pending' | 'ready' | 'blocked';
}

/** Résultat de sélection de playbook */
export interface PlaybookMatch {
  playbook: HealingPlaybook;
  score: number;
  matchedConditions: string[];
  missingConditions: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: PlaybookEngineConfig = {
  enabled: true,
  maxActionsPerPlaybook: 10,
  defaultTimeout: 30000,
  requireConfirmationFor: ['critical'],
  allowRiskyActions: false,
  autoRollbackOnFailure: true,
};

/** Estimation de durée par type d'action (ms) */
const ACTION_DURATION_ESTIMATES: Record<HealingActionType, number> = {
  restart_module: 2000,
  clear_cache: 500,
  regenerate_config: 1000,
  repair_json: 500,
  rebuild_memory: 5000,
  fallback_provider: 1500,
  reset_state: 300,
  restart_worker: 3000,
  patch_component: 1000,
  restart_process: 5000,
  sync_state: 800,
  mini_audit: 10000,
  isolate_module: 1000,
  noop: 0,
};

/** Risque associé à chaque type d'action */
const ACTION_RISK: Record<HealingActionType, 'safe' | 'moderate' | 'risky'> = {
  restart_module: 'moderate',
  clear_cache: 'safe',
  regenerate_config: 'moderate',
  repair_json: 'safe',
  rebuild_memory: 'risky',
  fallback_provider: 'safe',
  reset_state: 'moderate',
  restart_worker: 'moderate',
  patch_component: 'risky',
  restart_process: 'risky',
  sync_state: 'safe',
  mini_audit: 'safe',
  isolate_module: 'moderate',
  noop: 'safe',
};

// ═══════════════════════════════════════════════════════════════════════════
// PLAYBOOK REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

const PLAYBOOK_REGISTRY: HealingPlaybook[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // PLAYBOOKS REACT/UI
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'react-error-recovery',
    name: 'Récupération Erreur React',
    description: 'Restaure un composant React après une erreur',
    targetCategory: ['react'],
    targetSeverity: ['medium', 'high'],
    conditions: [{ field: 'nature', operator: 'contains', value: 'react' }],
    actions: [
      {
        id: 'reset-component-state',
        type: 'reset_state',
        targetModule: 'react',
        parameters: { scope: 'component' },
        timeout: 5000,
        onFailure: 'continue',
        description: "Réinitialiser l'état du composant",
      },
      {
        id: 'clear-react-cache',
        type: 'clear_cache',
        targetModule: 'react',
        parameters: { type: 'render' },
        timeout: 3000,
        onFailure: 'continue',
        description: 'Vider le cache de rendu React',
      },
    ],
    maxRetries: 3,
    cooldownMs: 10000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: true,
    enabled: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYBOOKS TAURI
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'tauri-command-recovery',
    name: 'Récupération Commande Tauri',
    description: 'Restaure la communication avec le backend Tauri',
    targetCategory: ['tauri'],
    targetSeverity: ['medium', 'high', 'critical'],
    conditions: [{ field: 'nature', operator: 'contains', value: 'tauri' }],
    actions: [
      {
        id: 'sync-state-tauri',
        type: 'sync_state',
        targetModule: 'singularity',
        parameters: { force: true },
        timeout: 5000,
        onFailure: 'continue',
        description: "Synchroniser l'état Singularity",
      },
      {
        id: 'restart-tauri-module',
        type: 'restart_module',
        targetModule: 'tauri',
        parameters: {},
        timeout: 10000,
        onFailure: 'abort',
        description: 'Redémarrer le module Tauri concerné',
      },
    ],
    maxRetries: 2,
    cooldownMs: 30000,
    requiresConfirmation: false,
    safetyLevel: 'moderate',
    reversible: true,
    enabled: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYBOOKS IA/PIPELINE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ia-pipeline-recovery',
    name: 'Récupération Pipeline IA',
    description: 'Restaure un pipeline IA bloqué',
    targetCategory: ['ia'],
    targetSeverity: ['medium', 'high', 'critical'],
    conditions: [{ field: 'category', operator: 'eq', value: 'ia' }],
    actions: [
      {
        id: 'clear-ia-queue',
        type: 'clear_cache',
        targetModule: 'ia-pipeline',
        parameters: { type: 'queue' },
        timeout: 3000,
        onFailure: 'continue',
        description: 'Vider la queue du pipeline IA',
      },
      {
        id: 'restart-ia-worker',
        type: 'restart_worker',
        targetModule: 'ia-pipeline',
        parameters: {},
        timeout: 10000,
        onFailure: 'continue',
        description: 'Redémarrer le worker IA',
      },
      {
        id: 'fallback-provider',
        type: 'fallback_provider',
        targetModule: 'ia',
        parameters: { providers: ['ollama', 'gemini'] },
        timeout: 5000,
        onFailure: 'abort',
        description: 'Basculer vers un provider IA de secours',
      },
    ],
    maxRetries: 2,
    cooldownMs: 60000,
    requiresConfirmation: false,
    safetyLevel: 'moderate',
    reversible: true,
    enabled: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYBOOKS TTS
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'tts-recovery',
    name: 'Récupération TTS',
    description: 'Restaure le moteur de synthèse vocale',
    targetCategory: ['tts'],
    targetSeverity: ['low', 'medium', 'high'],
    conditions: [{ field: 'category', operator: 'eq', value: 'tts' }],
    actions: [
      {
        id: 'clear-tts-cache',
        type: 'clear_cache',
        targetModule: 'tts',
        parameters: { type: 'audio' },
        timeout: 3000,
        onFailure: 'continue',
        description: 'Vider le cache audio TTS',
      },
      {
        id: 'restart-tts-module',
        type: 'restart_module',
        targetModule: 'tts',
        parameters: {},
        timeout: 8000,
        onFailure: 'continue',
        description: 'Redémarrer le module TTS',
      },
      {
        id: 'fallback-tts-provider',
        type: 'fallback_provider',
        targetModule: 'tts',
        parameters: { providers: ['kokoro', 'browser'] },
        timeout: 5000,
        onFailure: 'abort',
        description: 'Basculer vers TTS de secours',
      },
    ],
    maxRetries: 3,
    cooldownMs: 30000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: true,
    enabled: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYBOOKS MEMORY
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'memory-recovery',
    name: 'Récupération Mémoire',
    description: 'Répare la mémoire persistante corrompue',
    targetCategory: ['memory'],
    targetSeverity: ['high', 'critical'],
    conditions: [{ field: 'category', operator: 'eq', value: 'memory' }],
    actions: [
      {
        id: 'repair-memory-json',
        type: 'repair_json',
        targetModule: 'memory',
        parameters: { file: 'memory.json' },
        timeout: 5000,
        onFailure: 'continue',
        description: 'Réparer le fichier JSON de mémoire',
      },
      {
        id: 'rebuild-memory-index',
        type: 'rebuild_memory',
        targetModule: 'memory',
        parameters: { type: 'index' },
        timeout: 15000,
        onFailure: 'abort',
        description: "Reconstruire l'index mémoire",
      },
    ],
    maxRetries: 1,
    cooldownMs: 120000,
    requiresConfirmation: true,
    safetyLevel: 'risky',
    reversible: false,
    rollbackActions: [
      {
        id: 'restore-memory-backup',
        type: 'reset_state',
        targetModule: 'memory',
        parameters: { source: 'backup' },
        timeout: 10000,
        onFailure: 'abort',
        description: 'Restaurer depuis la sauvegarde',
      },
    ],
    enabled: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYBOOKS PERFORMANCE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'performance-optimization',
    name: 'Optimisation Performance',
    description: 'Améliore les performances système',
    targetCategory: ['performance'],
    targetSeverity: ['low', 'medium', 'high'],
    conditions: [{ field: 'category', operator: 'eq', value: 'performance' }],
    actions: [
      {
        id: 'clear-all-caches',
        type: 'clear_cache',
        targetModule: 'system',
        parameters: { type: 'all' },
        timeout: 5000,
        onFailure: 'continue',
        description: 'Vider tous les caches',
      },
      {
        id: 'isolate-heavy-module',
        type: 'isolate_module',
        targetModule: 'detected',
        parameters: {},
        timeout: 3000,
        onFailure: 'continue',
        description: 'Isoler le module gourmand',
      },
    ],
    maxRetries: 2,
    cooldownMs: 60000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: true,
    enabled: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYBOOKS NETWORK
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'network-recovery',
    name: 'Récupération Réseau',
    description: 'Restaure la connectivité réseau',
    targetCategory: ['network'],
    targetSeverity: ['medium', 'high'],
    conditions: [{ field: 'category', operator: 'eq', value: 'network' }],
    actions: [
      {
        id: 'clear-network-cache',
        type: 'clear_cache',
        targetModule: 'network',
        parameters: { type: 'dns' },
        timeout: 3000,
        onFailure: 'continue',
        description: 'Vider le cache réseau',
      },
      {
        id: 'fallback-network-provider',
        type: 'fallback_provider',
        targetModule: 'network',
        parameters: {},
        timeout: 5000,
        onFailure: 'abort',
        description: 'Utiliser un provider de secours',
      },
    ],
    maxRetries: 3,
    cooldownMs: 15000,
    requiresConfirmation: false,
    safetyLevel: 'safe',
    reversible: true,
    enabled: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYBOOK CRITIQUE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'critical-recovery',
    name: 'Récupération Critique',
    description: "Récupération d'urgence pour situations critiques",
    targetCategory: ['react', 'tauri', 'ia', 'tts', 'memory'],
    targetSeverity: ['critical'],
    conditions: [{ field: 'severity', operator: 'eq', value: 'critical' }],
    actions: [
      {
        id: 'emergency-state-sync',
        type: 'sync_state',
        targetModule: 'singularity',
        parameters: { force: true, emergency: true },
        timeout: 10000,
        onFailure: 'continue',
        description: "Synchronisation d'urgence de l'état",
      },
      {
        id: 'mini-audit',
        type: 'mini_audit',
        targetModule: 'system',
        parameters: {},
        timeout: 30000,
        onFailure: 'continue',
        description: 'Mini-audit du système',
      },
      {
        id: 'restart-critical-modules',
        type: 'restart_process',
        targetModule: 'affected',
        parameters: {},
        timeout: 20000,
        onFailure: 'abort',
        description: 'Redémarrer les modules critiques',
      },
    ],
    maxRetries: 1,
    cooldownMs: 300000,
    requiresConfirmation: true,
    safetyLevel: 'risky',
    reversible: false,
    enabled: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PLAYBOOK ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class SelfHealingPlaybookEngine {
  private static instance: SelfHealingPlaybookEngine;

  private config: PlaybookEngineConfig;
  private playbooks: Map<string, HealingPlaybook>;
  private executionHistory: ExecutionPlan[];
  private cooldowns: Map<string, number>;

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.playbooks = new Map();
    this.executionHistory = [];
    this.cooldowns = new Map();

    // Charger les playbooks par défaut
    for (const playbook of PLAYBOOK_REGISTRY) {
      this.playbooks.set(playbook.id, playbook);
    }
  }

  public static getInstance(): SelfHealingPlaybookEngine {
    if (!SelfHealingPlaybookEngine.instance) {
      SelfHealingPlaybookEngine.instance = new SelfHealingPlaybookEngine();
    }
    return SelfHealingPlaybookEngine.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  public configure(config: Partial<PlaybookEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): PlaybookEngineConfig {
    return { ...this.config };
  }

  public registerPlaybook(playbook: HealingPlaybook): void {
    this.playbooks.set(playbook.id, playbook);
  }

  public unregisterPlaybook(playbookId: string): boolean {
    return this.playbooks.delete(playbookId);
  }

  public getPlaybook(playbookId: string): HealingPlaybook | undefined {
    return this.playbooks.get(playbookId);
  }

  public getAllPlaybooks(): HealingPlaybook[] {
    return [...this.playbooks.values()];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBOOK SELECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Sélectionne le meilleur playbook pour un diagnostic
   */
  public selectPlaybook(diagnosis: HealingDiagnosis): PlaybookMatch | null {
    if (!this.config.enabled) {
      return null;
    }

    const matches: PlaybookMatch[] = [];

    for (const playbook of this.playbooks.values()) {
      if (!playbook.enabled) continue;
      if (this.isOnCooldown(playbook.id)) continue;

      // Vérifier la catégorie
      if (!playbook.targetCategory.includes(diagnosis.category)) continue;

      // Vérifier la sévérité
      if (!playbook.targetSeverity.includes(diagnosis.severity)) continue;

      // Vérifier le niveau de risque
      if (!this.config.allowRiskyActions && playbook.safetyLevel === 'risky') continue;

      // Évaluer les conditions
      const { score, matched, missing } = this.evaluateConditions(playbook, diagnosis);

      if (score > 0) {
        matches.push({
          playbook,
          score,
          matchedConditions: matched,
          missingConditions: missing,
        });
      }
    }

    // Trier par score décroissant
    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
      logger.debug('No matching playbook found for diagnosis');
      return null;
    }

    const best = matches[0];
    if (!best) return null;
    logger.debug(
      `[PlaybookEngine] 📋 Selected playbook: ${best.playbook.name} (score: ${best.score})`
    );

    return best;
  }

  /**
   * Génère un plan d'exécution à partir d'un playbook et diagnostic
   */
  public generateExecutionPlan(
    playbook: HealingPlaybook,
    diagnosis: HealingDiagnosis
  ): ExecutionPlan {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Planifier les actions
    const plannedActions = this.planActions(playbook, diagnosis);

    // Planifier les rollback actions
    const rollbackActions = playbook.rollbackActions
      ? this.planActions({ ...playbook, actions: playbook.rollbackActions }, diagnosis)
      : [];

    // Calculer la durée estimée
    const estimatedDuration = plannedActions.reduce(
      (sum, pa) => sum + pa.estimatedDuration,
      0
    );

    // Déterminer le niveau de risque global
    const riskLevel = this.calculateOverallRisk(plannedActions);

    // Vérifier si confirmation requise
    const requiresConfirmation =
      playbook.requiresConfirmation ||
      this.config.requireConfirmationFor.includes(diagnosis.severity) ||
      riskLevel === 'risky';

    const plan: ExecutionPlan = {
      id: planId,
      playbookId: playbook.id,
      playbookName: playbook.name,
      diagnosisId: diagnosis.eventId,
      timestamp: Date.now(),
      estimatedDuration,
      riskLevel,
      actions: plannedActions,
      rollbackActions,
      requiresConfirmation,
      metadata: {
        category: diagnosis.category,
        severity: diagnosis.severity,
        nature: diagnosis.nature,
      },
    };

    logger.debug(
      `[PlaybookEngine] 📝 Generated plan: ${plan.id} (${plannedActions.length} actions, ~${Math.round(estimatedDuration / 1000)}s)`
    );

    return plan;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private evaluateConditions(
    playbook: HealingPlaybook,
    diagnosis: HealingDiagnosis
  ): { score: number; matched: string[]; missing: string[] } {
    const matched: string[] = [];
    const missing: string[] = [];

    // Score de base pour la catégorie et sévérité (déjà vérifié)
    let score = 50;

    // Évaluer chaque condition
    for (const condition of playbook.conditions) {
      const isMatched = this.evaluateCondition(condition, diagnosis);

      if (isMatched) {
        matched.push(`${condition.field} ${condition.operator} ${condition.value}`);
        score += 20;
      } else {
        missing.push(`${condition.field} ${condition.operator} ${condition.value}`);
        score -= 5;
      }
    }

    // Bonus pour playbooks spécifiques
    if (playbook.targetCategory.length === 1) {
      score += 10;
    }

    return { score: Math.max(0, score), matched, missing };
  }

  private evaluateCondition(
    condition: PlaybookCondition,
    diagnosis: HealingDiagnosis
  ): boolean {
    const value = this.getFieldValue(condition.field, diagnosis);

    switch (condition.operator) {
      case 'eq':
        return value === condition.value;
      case 'ne':
        return value !== condition.value;
      case 'gt':
        return typeof value === 'number' && value > (condition.value as number);
      case 'lt':
        return typeof value === 'number' && value < (condition.value as number);
      case 'contains':
        return typeof value === 'string' && value.includes(String(condition.value));
      case 'matches':
        return (
          typeof value === 'string' && new RegExp(String(condition.value)).test(value)
        );
      default:
        return false;
    }
  }

  private getFieldValue(field: string, diagnosis: HealingDiagnosis): unknown {
    const fieldMap: Record<string, unknown> = {
      nature: diagnosis.nature,
      category: diagnosis.category,
      severity: diagnosis.severity,
      urgency: diagnosis.urgency,
      confidence: diagnosis.confidence,
      affectedModule: diagnosis.affectedModule,
      probableCause: diagnosis.probableCause,
      escalationRequired: diagnosis.escalationRequired,
    };

    return fieldMap[field];
  }

  private planActions(
    playbook: HealingPlaybook,
    diagnosis: HealingDiagnosis
  ): PlannedAction[] {
    const planned: PlannedAction[] = [];

    for (
      let i = 0;
      i < playbook.actions.length && i < this.config.maxActionsPerPlaybook;
      i++
    ) {
      const action = playbook.actions[i];
      if (!action) continue;

      // Résoudre le module cible si dynamique
      const resolvedAction = this.resolveActionTarget(action, diagnosis);

      const estimatedDuration = ACTION_DURATION_ESTIMATES[action.type];
      planned.push({
        id: `${playbook.id}_action_${i}`,
        sequence: i,
        action: resolvedAction,
        dependencies: i > 0 ? [`${playbook.id}_action_${i - 1}`] : [],
        estimatedDuration: estimatedDuration ?? this.config.defaultTimeout,
        canParallelize: i === 0 || action.onFailure === 'continue',
        status: i === 0 ? 'ready' : 'pending',
      });
    }

    return planned;
  }

  private resolveActionTarget(
    action: HealingAction,
    diagnosis: HealingDiagnosis
  ): HealingAction {
    // Résoudre les targets dynamiques
    let targetModule = action.targetModule;

    if (targetModule === 'affected' || targetModule === 'detected') {
      targetModule = diagnosis.affectedModule;
    }

    return {
      ...action,
      targetModule,
    };
  }

  private calculateOverallRisk(actions: PlannedAction[]): 'safe' | 'moderate' | 'risky' {
    const risks = actions.map(a => ACTION_RISK[a.action.type] ?? 'safe');

    if (risks.includes('risky')) return 'risky';
    if (risks.includes('moderate')) return 'moderate';
    return 'safe';
  }

  private isOnCooldown(playbookId: string): boolean {
    const lastExecution = this.cooldowns.get(playbookId);
    if (!lastExecution) return false;

    const playbook = this.playbooks.get(playbookId);
    if (!playbook) return false;

    return Date.now() - lastExecution < playbook.cooldownMs;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Marque un playbook comme exécuté (pour cooldown)
   */
  public markExecuted(playbookId: string): void {
    this.cooldowns.set(playbookId, Date.now());
  }

  /**
   * Ajoute un plan à l'historique
   */
  public recordExecution(plan: ExecutionPlan): void {
    this.executionHistory.push(plan);

    // Limiter la taille de l'historique
    if (this.executionHistory.length > 100) {
      this.executionHistory = this.executionHistory.slice(-100);
    }
  }

  /**
   * Récupère l'historique d'exécution
   */
  public getExecutionHistory(limit?: number): ExecutionPlan[] {
    if (limit) {
      return this.executionHistory.slice(-limit);
    }
    return [...this.executionHistory];
  }

  /**
   * Vérifie si des actions risquées sont dans un plan
   */
  public hasRiskyActions(plan: ExecutionPlan): boolean {
    return plan.actions.some(a => ACTION_RISK[a.action.type] === 'risky');
  }

  /**
   * Obtient un résumé des playbooks disponibles
   */
  public getPlaybookSummary(): Array<{
    id: string;
    name: string;
    categories: ModuleCategory[];
    severities: HealingSeverity[];
    safetyLevel: string;
    enabled: boolean;
    onCooldown: boolean;
  }> {
    return [...this.playbooks.values()].map(p => ({
      id: p.id,
      name: p.name,
      categories: p.targetCategory,
      severities: p.targetSeverity,
      safetyLevel: p.safetyLevel,
      enabled: p.enabled,
      onCooldown: this.isOnCooldown(p.id),
    }));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const selfHealingPlaybookEngine = SelfHealingPlaybookEngine.getInstance();

export default selfHealingPlaybookEngine;
