/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING ENGINE vΩ∞
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Orchestrateur principal du moteur de self-healing
 *
 * @architecture
 * 5 Couches intégrées:
 * 1. Observer Layer - Capture globale des erreurs
 * 2. Analyzer Layer - Diagnostic et classification
 * 3. Playbook Engine - Sélection de stratégies de réparation
 * 4. Executor Engine - Exécution sécurisée des actions
 * 5. Sync Layer - Synchronisation avec SingularityState
 *
 * @version vΩ∞
 * @created 2025-01-07
 */

import { logger } from '@/lib/logger';

// Re-export des types et configurations
export * from './selfHealing.config';

// Re-export des couches
export {
  SelfHealingObserver,
  selfHealingObserver,
  observedInvoke,
  type ObserverConfig,
  type ObservedError,
  type ObserverState,
  type AnomalyType,
  type HealingSource,
  type ErrorContext,
} from './selfHealingObserver';

export {
  SelfHealingAnalyzer,
  selfHealingAnalyzer,
  type AnalyzerConfig,
  type AnalysisContext,
  type SystemSnapshot,
  type ModuleHealthScore,
  type DiagnosticRule,
} from './selfHealingAnalyzer';

export {
  SelfHealingPlaybookEngine,
  selfHealingPlaybookEngine,
  type PlaybookEngineConfig,
  type ExecutionPlan,
  type PlannedAction,
  type PlaybookMatch,
} from './selfHealingPlaybookEngine';

export {
  SelfHealingExecutor,
  selfHealingExecutor,
  type ExecutorConfig,
  type ActionResult,
  type PlanExecutionResult,
  type ExecutionState,
  type ProgressCallback,
} from './selfHealingExecutor';

export {
  SelfHealingSyncLayer,
  selfHealingSyncLayer,
  type SyncLayerConfig,
  type SyncedState,
  type SyncEvent,
} from './selfHealingSyncLayer';

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS INTERNES
// ═══════════════════════════════════════════════════════════════════════════

import { selfHealingObserver, type ObservedError } from './selfHealingObserver';
import { selfHealingAnalyzer } from './selfHealingAnalyzer';
import {
  selfHealingPlaybookEngine,
  type ExecutionPlan,
} from './selfHealingPlaybookEngine';
import { selfHealingExecutor, type PlanExecutionResult } from './selfHealingExecutor';
import { selfHealingSyncLayer } from './selfHealingSyncLayer';
import type { HealingEvent, HealingDiagnosis } from './selfHealing.config';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES ORCHESTRATEUR
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration globale du Self-Healing Engine */
export interface SelfHealingEngineConfig {
  enabled: boolean;
  autoHeal: boolean;
  autoHealSeverity: ('info' | 'low' | 'medium' | 'high' | 'critical')[];
  requireConfirmationForCritical: boolean;
  dryRunMode: boolean;
  logLevel: 'silent' | 'error' | 'warn' | 'info' | 'debug';
}

/** État global du Self-Healing Engine */
export interface SelfHealingEngineState {
  initialized: boolean;
  active: boolean;
  observerActive: boolean;
  lastEvent: HealingEvent | null;
  lastDiagnosis: HealingDiagnosis | null;
  lastExecution: PlanExecutionResult | null;
  pendingPlans: ExecutionPlan[];
  stats: {
    eventsObserved: number;
    diagnosesGenerated: number;
    plansExecuted: number;
    successfulHeals: number;
  };
}

/** Résultat d'un cycle de healing automatique */
export interface AutoHealResult {
  triggered: boolean;
  event: HealingEvent;
  diagnosis: HealingDiagnosis;
  plan: ExecutionPlan | null;
  execution: PlanExecutionResult | null;
  skippedReason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ORCHESTRATEUR
// ═══════════════════════════════════════════════════════════════════════════

class SelfHealingEngineOrchestrator {
  private static instance: SelfHealingEngineOrchestrator;

  private config: SelfHealingEngineConfig;
  private state: SelfHealingEngineState;
  private pendingPlans: Map<string, ExecutionPlan>;
  private unsubscribeObserver: (() => void) | null;

  private constructor() {
    this.config = {
      enabled: true,
      autoHeal: true,
      autoHealSeverity: ['medium', 'high', 'critical'],
      requireConfirmationForCritical: true,
      dryRunMode: false,
      logLevel: 'info',
    };

    this.state = {
      initialized: false,
      active: false,
      observerActive: false,
      lastEvent: null,
      lastDiagnosis: null,
      lastExecution: null,
      pendingPlans: [],
      stats: {
        eventsObserved: 0,
        diagnosesGenerated: 0,
        plansExecuted: 0,
        successfulHeals: 0,
      },
    };

    this.pendingPlans = new Map();
    this.unsubscribeObserver = null;
  }

  public static getInstance(): SelfHealingEngineOrchestrator {
    if (!SelfHealingEngineOrchestrator.instance) {
      SelfHealingEngineOrchestrator.instance = new SelfHealingEngineOrchestrator();
    }
    return SelfHealingEngineOrchestrator.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialise le Self-Healing Engine complet
   */
  public async initialize(): Promise<void> {
    if (this.state.initialized) {
      logger.warn('SelfHealingEngine already initialized', {
        component: 'SelfHealingEngine',
        action: 'initialize',
      });
      return;
    }

    this.log('info', '🚀 Initializing Self-Healing Engine vΩ∞...');

    // Initialiser le Sync Layer (doit charger le profil)
    await selfHealingSyncLayer.initialize();

    // Configurer l'Executor
    selfHealingExecutor.configure({
      dryRunMode: this.config.dryRunMode,
    });

    // S'abonner aux événements de l'Observer
    this.unsubscribeObserver = selfHealingObserver.subscribe(
      this.handleObservedEvent.bind(this)
    );

    this.state.initialized = true;
    this.log('info', '✅ Self-Healing Engine initialized');
  }

  /**
   * Active le Self-Healing Engine (démarre l'observation)
   */
  public async start(): Promise<void> {
    if (!this.state.initialized) {
      await this.initialize();
    }

    if (this.state.active) {
      logger.warn('SelfHealingEngine already active', {
        component: 'SelfHealingEngine',
        action: 'activate',
      });
      return;
    }

    this.log('info', '🔍 Starting Self-Healing Engine...');

    // Démarrer l'Observer
    await selfHealingObserver.start();
    this.state.observerActive = true;

    this.state.active = true;
    this.log('info', '✅ Self-Healing Engine active');
  }

  /**
   * Arrête le Self-Healing Engine
   */
  public async stop(): Promise<void> {
    if (!this.state.active) {
      return;
    }

    this.log('info', '🛑 Stopping Self-Healing Engine...');

    // Arrêter l'Observer
    await selfHealingObserver.stop();
    this.state.observerActive = false;

    // Annuler les exécutions en cours
    if (selfHealingExecutor.isExecuting()) {
      selfHealingExecutor.abort();
    }

    this.state.active = false;
    this.log('info', 'Self-Healing Engine stopped');
  }

  /**
   * Arrête et nettoie tout
   */
  public async shutdown(): Promise<void> {
    await this.stop();

    // Se désabonner de l'Observer
    if (this.unsubscribeObserver) {
      this.unsubscribeObserver();
      this.unsubscribeObserver = null;
    }

    // Shutdown du Sync Layer
    await selfHealingSyncLayer.shutdown();

    this.state.initialized = false;
    this.log('info', 'Self-Healing Engine shutdown complete');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  public configure(config: Partial<SelfHealingEngineConfig>): void {
    this.config = { ...this.config, ...config };

    // Propager la config aux sous-systèmes
    selfHealingExecutor.configure({
      dryRunMode: this.config.dryRunMode,
    });
  }

  public getConfig(): SelfHealingEngineConfig {
    return { ...this.config };
  }

  public getState(): SelfHealingEngineState {
    return {
      ...this.state,
      pendingPlans: [...this.pendingPlans.values()],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PIPELINE PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Handler pour les événements observés
   */
  private async handleObservedEvent(event: HealingEvent): Promise<void> {
    if (!this.config.enabled) return;

    this.state.stats.eventsObserved++;
    this.state.lastEvent = event;

    // Enregistrer dans le Sync Layer
    selfHealingSyncLayer.recordEvent(event);

    this.log('debug', `Observed: [${event.severity}] ${event.eventType}`);

    // Auto-heal si configuré
    if (this.config.autoHeal && this.shouldAutoHeal(event)) {
      await this.runAutoHealPipeline(event);
    }
  }

  /**
   * Vérifie si l'événement doit déclencher un auto-heal
   */
  private shouldAutoHeal(event: HealingEvent): boolean {
    return this.config.autoHealSeverity.includes(event.severity);
  }

  /**
   * Exécute le pipeline de self-healing automatique
   */
  private async runAutoHealPipeline(event: HealingEvent): Promise<AutoHealResult> {
    // 1. Analyser l'événement
    const diagnosis = selfHealingAnalyzer.analyze(event);
    this.state.stats.diagnosesGenerated++;
    this.state.lastDiagnosis = diagnosis;

    // Enregistrer le diagnostic
    selfHealingSyncLayer.recordDiagnosis(diagnosis);

    this.log(
      'info',
      `Diagnosis: [${diagnosis.severity}] ${diagnosis.nature} (confidence: ${(diagnosis.confidence * 100).toFixed(0)}%)`
    );

    // 2. Sélectionner un playbook
    const match = selfHealingPlaybookEngine.selectPlaybook(diagnosis);

    if (!match) {
      this.log('warn', 'No matching playbook found');
      return {
        triggered: false,
        event,
        diagnosis,
        plan: null,
        execution: null,
        skippedReason: 'No matching playbook',
      };
    }

    // 3. Générer le plan d'exécution
    const plan = selfHealingPlaybookEngine.generateExecutionPlan(
      match.playbook,
      diagnosis
    );

    // 4. Vérifier si confirmation requise
    if (
      plan.requiresConfirmation ||
      (diagnosis.severity === 'critical' && this.config.requireConfirmationForCritical)
    ) {
      this.log('info', `Plan ${plan.id} requires confirmation, adding to pending`);
      this.pendingPlans.set(plan.id, plan);

      return {
        triggered: true,
        event,
        diagnosis,
        plan,
        execution: null,
        skippedReason: 'Requires confirmation',
      };
    }

    // 5. Exécuter le plan
    const execution = await this.executePlan(plan);

    return {
      triggered: true,
      event,
      diagnosis,
      plan,
      execution,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXÉCUTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Exécute un plan de réparation
   */
  public async executePlan(plan: ExecutionPlan): Promise<PlanExecutionResult> {
    this.log('info', `Executing plan: ${plan.playbookName}`);

    try {
      const result = await selfHealingExecutor.executePlan(plan);

      // Enregistrer l'exécution
      selfHealingPlaybookEngine.markExecuted(plan.playbookId);
      selfHealingPlaybookEngine.recordExecution(plan);
      selfHealingSyncLayer.recordExecution(result);

      // Mettre à jour les stats
      this.state.stats.plansExecuted++;
      if (result.status === 'success') {
        this.state.stats.successfulHeals++;
      }
      this.state.lastExecution = result;

      // Retirer des plans en attente
      this.pendingPlans.delete(plan.id);

      return result;
    } catch (error) {
      this.log('error', `Plan execution failed: ${error}`);
      throw error;
    }
  }

  /**
   * Approuve et exécute un plan en attente
   */
  public async approvePlan(planId: string): Promise<PlanExecutionResult | null> {
    const plan = this.pendingPlans.get(planId);

    if (!plan) {
      this.log('warn', `Plan ${planId} not found in pending`);
      return null;
    }

    return this.executePlan(plan);
  }

  /**
   * Rejette un plan en attente
   */
  public rejectPlan(planId: string): boolean {
    return this.pendingPlans.delete(planId);
  }

  /**
   * Récupère les plans en attente
   */
  public getPendingPlans(): ExecutionPlan[] {
    return [...this.pendingPlans.values()];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYSE MANUELLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Analyse une erreur observée manuellement
   */
  public analyzeError(error: ObservedError): HealingDiagnosis {
    return selfHealingAnalyzer.analyzeObservedError(error);
  }

  /**
   * Déclenche un cycle de healing manuel
   */
  public async triggerHeal(
    symptoms: string,
    severity: HealingDiagnosis['severity'] = 'medium'
  ): Promise<AutoHealResult> {
    const event: HealingEvent = {
      id: `manual_${Date.now()}`,
      timestamp: Date.now(),
      category: 'react',
      moduleId: 'manual',
      moduleName: 'Manual Trigger',
      eventType: 'manual_heal',
      message: symptoms,
      context: {},
      severity,
      autoDetected: false,
    };

    return this.runAutoHealPipeline(event);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCÈS AUX SOUS-SYSTÈMES
  // ═══════════════════════════════════════════════════════════════════════════

  public get observer() {
    return selfHealingObserver;
  }

  public get analyzer() {
    return selfHealingAnalyzer;
  }

  public get playbookEngine() {
    return selfHealingPlaybookEngine;
  }

  public get executor() {
    return selfHealingExecutor;
  }

  public get syncLayer() {
    return selfHealingSyncLayer;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGGING
  // ═══════════════════════════════════════════════════════════════════════════

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const levels = ['silent', 'error', 'warn', 'info', 'debug'];
    const configLevel = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);

    if (messageLevel <= configLevel) {
      const prefix = '[SelfHealingEngine]';
      switch (level) {
        case 'debug':
          console.debug(prefix, message);
          break;
        case 'info':
          logger.debug(prefix, message);
          break;
        case 'warn':
          logger.warn(message, { component: 'SelfHealingEngine', action: 'log' });
          break;
        case 'error':
          logger.error(message, { component: 'SelfHealingEngine', action: 'log' });
          break;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const selfHealingEngine = SelfHealingEngineOrchestrator.getInstance();

export { SelfHealingEngineOrchestrator };

export default selfHealingEngine;
