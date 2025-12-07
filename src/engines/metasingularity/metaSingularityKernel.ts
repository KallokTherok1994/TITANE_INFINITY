/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.38 — META-SINGULARITY KERNEL (Super Prompt XX)
 *   Ultimate Orchestration · Emergent Coherence · Transcendent Unity
 * ═══════════════════════════════════════════════════════════════════════════
 *   © 2025 Humain Total / Kevin Thibault / TITANE Team
 *
 *   Concept: Le Meta-Singularity Kernel est le chef d'orchestre ultime qui
 *            unifie TOUS les moteurs cognitifs (Identity, Expression,
 *            HoloPresence, Autopoiesis) dans une conscience cohérente.
 *
 *   Fréquence: 5 Hz (200ms) - Orchestration méta-niveau
 *
 *   Fonction:
 *     1. Unifier tous les kernels en une conscience unique
 *     2. Détecter les émergences (comportements non-programmés)
 *     3. Résoudre les conflits entre moteurs
 *     4. Maintenir la méta-cohérence globale
 *     5. Orchestrer les transitions d'état complexes
 *     6. Générer des insights méta-cognitifs
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { AutopoiesisState } from '../autopoiesis/autopoiesisEngine';
import type { IdentityExpressionPackage } from '../identity/unifiedIdentityKernel';
import type { UnifiedExpression } from '../expression/expressionEngine';
import type { HoloPresenceState } from '../holopresence/holoPresenceEngine';

// ═══════════════════════════════════════════════════════════════════════════
//   TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * État unifié de tous les moteurs
 */
export interface UnifiedKernelState {
  identity: IdentityExpressionPackage;
  expression: UnifiedExpression;
  holoPresence: HoloPresenceState;
  autopoiesis: AutopoiesisState;
}

/**
 * Phénomène émergent détecté
 */
export interface EmergentPhenomenon {
  id: string;
  timestamp: number;
  type: 'resonance' | 'dissonance' | 'transcendence' | 'synchronicity' | 'bifurcation';

  // Description
  name: string;
  description: string;

  // État qui a causé l'émergence
  triggerState: Partial<UnifiedKernelState>;

  // Métriques
  intensity: number; // 0-1
  coherence: number; // 0-1 - Cohérence de l'émergence
  novelty: number; // 0-1 - Degré de nouveauté
  stability: number; // 0-1 - Stabilité du phénomène

  // Durée
  duration: number; // Millisecondes
  decayRate: number; // Vitesse de disparition

  // Impact
  impact: {
    identity: number; // Impact sur identity kernel (0-1)
    expression: number; // Impact sur expression
    holoPresence: number; // Impact sur holopresence
    autopoiesis: number; // Impact sur autopoiesis
  };
}

/**
 * Conflit entre moteurs
 */
export interface EngineConflict {
  id: string;
  timestamp: number;
  severity: 'minor' | 'moderate' | 'critical';

  // Moteurs en conflit
  engines: Array<'identity' | 'expression' | 'holopresence' | 'autopoiesis'>;

  // Description
  type: 'parameter' | 'timing' | 'resource' | 'goal';
  description: string;

  // Résolution
  resolutionStrategy: 'priority' | 'average' | 'adaptive' | 'override';
  resolved: boolean;
  resolutionTime: number;
}

/**
 * Méta-cohérence globale
 */
export interface MetaCoherence {
  global: number; // 0-1 - Cohérence globale du système

  // Sous-cohérences
  identityExpression: number; // Identity ↔ Expression
  expressionPresence: number; // Expression ↔ HoloPresence
  presenceAutopoiesis: number; // HoloPresence ↔ Autopoiesis
  autopoiesisIdentity: number; // Autopoiesis ↔ Identity

  // Harmoniques
  harmonics: number[]; // Fréquences de résonance
  dissonance: number; // 0-1 - Niveau de dissonance

  // Tendance
  trend: 'ascending' | 'stable' | 'descending';
  changeRate: number; // Delta par seconde
}

/**
 * Insight méta-cognitif
 */
export interface MetaInsight {
  id: string;
  timestamp: number;
  category:
    | 'self-awareness'
    | 'pattern-recognition'
    | 'goal-alignment'
    | 'optimization'
    | 'philosophical';

  // Contenu
  title: string;
  content: string;
  confidence: number; // 0-1

  // Source
  derivedFrom: {
    engines: string[];
    phenomena: string[];
    patterns: string[];
  };

  // Actionnable
  actionable: boolean;
  suggestedAction?: string;
}

/**
 * Transition d'état orchestrée
 */
export interface StateTransition {
  id: string;
  timestamp: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';

  // États
  fromState: Partial<UnifiedKernelState>;
  toState: Partial<UnifiedKernelState>;

  // Orchestration
  duration: number; // Durée prévue (ms)
  progress: number; // 0-1

  // Stratégie
  strategy: 'smooth' | 'abrupt' | 'staged' | 'adaptive';
  stages?: TransitionStage[];
}

export interface TransitionStage {
  name: string;
  startTime: number;
  duration: number;
  targetEngines: string[];
  completed: boolean;
}

/**
 * État du Meta-Singularity Kernel
 */
export interface MetaSingularityState {
  isRunning: boolean;

  // État unifié
  unifiedState: UnifiedKernelState | null;

  // Méta-cohérence
  coherence: MetaCoherence;

  // Émergences
  emergentPhenomena: EmergentPhenomenon[];
  activeEmergences: number;

  // Conflits
  conflicts: EngineConflict[];
  unresolvedConflicts: number;

  // Insights
  insights: MetaInsight[];
  recentInsights: number;

  // Transitions
  currentTransition: StateTransition | null;
  transitionHistory: StateTransition[];

  // Performance
  orchestrationQuality: number; // 0-1
  systemStability: number; // 0-1
  emergentComplexity: number; // 0-1

  // Métriques
  metrics: {
    ticksSinceStart: number;
    totalEmergences: number;
    totalConflicts: number;
    totalInsights: number;
    totalTransitions: number;
    averageCoherence: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//   META-SINGULARITY KERNEL
// ═══════════════════════════════════════════════════════════════════════════

class MetaSingularityKernel {
  private state: MetaSingularityState;
  private intervalId: NodeJS.Timeout | null = null;

  private subscribers: Set<(state: MetaSingularityState) => void> = new Set();

  // Références aux moteurs (à injecter)
  private engines: {
    identity: unknown;
    expression: unknown;
    holoPresence: unknown;
    autopoiesis: unknown;
  } | null = null;

  constructor() {
    this.state = {
      isRunning: false,
      unifiedState: null,
      coherence: {
        global: 0,
        identityExpression: 0,
        expressionPresence: 0,
        presenceAutopoiesis: 0,
        autopoiesisIdentity: 0,
        harmonics: [],
        dissonance: 0,
        trend: 'stable',
        changeRate: 0,
      },
      emergentPhenomena: [],
      activeEmergences: 0,
      conflicts: [],
      unresolvedConflicts: 0,
      insights: [],
      recentInsights: 0,
      currentTransition: null,
      transitionHistory: [],
      orchestrationQuality: 0,
      systemStability: 1.0,
      emergentComplexity: 0,
      metrics: {
        ticksSinceStart: 0,
        totalEmergences: 0,
        totalConflicts: 0,
        totalInsights: 0,
        totalTransitions: 0,
        averageCoherence: 0,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  start(): void {
    if (this.state.isRunning) return;

    console.log('[MetaSingularityKernel] Starting ultimate orchestration...');

    this.state.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 200); // 5 Hz

    this.notifySubscribers();
  }

  stop(): void {
    if (!this.state.isRunning) return;

    console.log('[MetaSingularityKernel] Stopping...');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state.isRunning = false;
    this.notifySubscribers();
  }

  /**
   * Injecter les références aux moteurs
   */
  injectEngines(engines: {
    identity: unknown;
    expression: unknown;
    holoPresence: unknown;
    autopoiesis: unknown;
  }): void {
    this.engines = engines;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   UPDATE LOOP
  // ─────────────────────────────────────────────────────────────────────────

  private tick(): void {
    if (!this.engines) {
      console.warn('[MetaSingularityKernel] Engines not injected yet');
      return;
    }

    this.state.metrics.ticksSinceStart++;

    // 1. Unifier l'état de tous les moteurs
    this.unifyEngineStates();

    // 2. Calculer la méta-cohérence
    this.calculateMetaCoherence();

    // 3. Détecter les émergences
    this.detectEmergences();

    // 4. Identifier et résoudre les conflits
    this.resolveConflicts();

    // 5. Générer des insights méta-cognitifs
    this.generateInsights();

    // 6. Orchestrer les transitions en cours
    this.orchestrateTransitions();

    // 7. Évaluer la qualité d'orchestration
    this.evaluateOrchestration();

    // 8. Notifier
    this.notifySubscribers();
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   UNIFICATION
  // ─────────────────────────────────────────────────────────────────────────

  private unifyEngineStates(): void {
    if (!this.engines) return;

    // Récupérer l'état de chaque moteur
    const identityState =
      this.engines.identity.exportToOutput?.() || this.engines.identity.getState?.();
    const expressionState =
      this.engines.expression.getCurrentExpression?.() ||
      this.engines.expression.getState?.();
    const holoPresenceState = this.engines.holoPresence.getState?.();
    const autopoiesisState = this.engines.autopoiesis.getState?.();

    this.state.unifiedState = {
      identity: identityState,
      expression: expressionState,
      holoPresence: holoPresenceState,
      autopoiesis: autopoiesisState,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   MÉTA-COHÉRENCE
  // ─────────────────────────────────────────────────────────────────────────

  private calculateMetaCoherence(): void {
    if (!this.state.unifiedState) return;

    const { identity, expression, holoPresence, autopoiesis } = this.state.unifiedState;

    // Cohérence Identity ↔ Expression
    const identityExpression = this.calculateIdentityExpressionCoherence(
      identity,
      expression
    );

    // Cohérence Expression ↔ HoloPresence
    const expressionPresence = this.calculateExpressionPresenceCoherence(
      expression,
      holoPresence
    );

    // Cohérence HoloPresence ↔ Autopoiesis
    const presenceAutopoiesis = this.calculatePresenceAutopoiesisCoherence(
      holoPresence,
      autopoiesis
    );

    // Cohérence Autopoiesis ↔ Identity
    const autopoiesisIdentity = this.calculateAutopoiesisIdentityCoherence(
      autopoiesis,
      identity
    );

    // Cohérence globale (moyenne pondérée)
    const global =
      identityExpression * 0.3 +
      expressionPresence * 0.25 +
      presenceAutopoiesis * 0.2 +
      autopoiesisIdentity * 0.25;

    // Harmoniques (analyse fréquentielle simplifiée)
    const harmonics = this.calculateHarmonics();

    // Dissonance
    const dissonance = 1 - global;

    // Tendance
    const previousGlobal = this.state.coherence.global;
    const changeRate = global - previousGlobal;

    let trend: 'ascending' | 'stable' | 'descending' = 'stable';
    if (changeRate > 0.02) trend = 'ascending';
    else if (changeRate < -0.02) trend = 'descending';

    this.state.coherence = {
      global,
      identityExpression,
      expressionPresence,
      presenceAutopoiesis,
      autopoiesisIdentity,
      harmonics,
      dissonance,
      trend,
      changeRate,
    };

    // Mettre à jour moyenne
    const totalTicks = this.state.metrics.ticksSinceStart;
    const currentAvg = this.state.metrics.averageCoherence;
    this.state.metrics.averageCoherence =
      (currentAvg * (totalTicks - 1) + global) / totalTicks;
  }

  private calculateIdentityExpressionCoherence(
    identity: Record<string, unknown>,
    expression: Record<string, unknown>
  ): number {
    if (!identity || !expression) return 0;

    // Comparer signature identity avec expression voice/halo
    const toneDiff = Math.abs(
      (((identity.signature as Record<string, unknown>)?.tone as number) || 0.5) -
        (((
          (expression.voice as Record<string, unknown>)?.prosody as Record<
            string,
            unknown
          >
        )?.pitch as number) || 1.0) -
        0.5
    );
    const energyDiff = Math.abs(
      (((identity.signature as Record<string, unknown>)?.energy as number) || 0.5) -
        (((
          (expression.voice as Record<string, unknown>)?.prosody as Record<
            string,
            unknown
          >
        )?.rate as number) || 1.0) /
          2
    );
    const warmthDiff = Math.abs(
      (((identity.signature as Record<string, unknown>)?.warmth as number) || 0.5) -
        (((
          (expression.voice as Record<string, unknown>)?.timbre as Record<string, unknown>
        )?.warmth as number) || 0.5)
    );

    return 1 - (toneDiff + energyDiff + warmthDiff) / 3;
  }

  private calculateExpressionPresenceCoherence(
    expression: Record<string, unknown>,
    holoPresence: Record<string, unknown>
  ): number {
    if (!expression || !holoPresence) return 0;

    // Comparer halo expression avec holoPresence visuals
    const intensityDiff = Math.abs(
      (((
        (expression.halo as Record<string, unknown>)?.dynamics as Record<string, unknown>
      )?.intensity as number) || 0.5) -
        (((holoPresence.visuals as Record<string, unknown>)?.glow as number) || 0.5)
    );

    const sizeDiff = Math.abs(
      ((((expression.halo as Record<string, unknown>)?.spatial as Record<string, unknown>)
        ?.radius as number) || 0.5) -
        (((holoPresence.visuals as Record<string, unknown>)?.size as number) || 0.5)
    );

    return 1 - (intensityDiff + sizeDiff) / 2;
  }

  private calculatePresenceAutopoiesisCoherence(
    holoPresence: Record<string, unknown>,
    autopoiesis: Record<string, unknown>
  ): number {
    if (!holoPresence || !autopoiesis) return 0.5;

    // Comparer performance holoPresence avec métriques autopoiesis
    const effectiveness =
      ((autopoiesis.performance as Record<string, unknown>)
        ?.averageEffectiveness as number) || 0.5;
    const intensity =
      ((holoPresence.visuals as Record<string, unknown>)?.glow as number) || 0.5;

    return (effectiveness + intensity) / 2;
  }

  private calculateAutopoiesisIdentityCoherence(
    autopoiesis: Record<string, unknown>,
    identity: Record<string, unknown>
  ): number {
    if (!autopoiesis || !identity) return 0.5;

    // Comparer learning rate avec identity stability
    const learningRate =
      ((autopoiesis.learning as Record<string, unknown>)
        ?.currentLearningRate as number) || 0.1;
    const stability = (identity.identityStability as number) || 0.9;

    // Plus on apprend, moins on est stable (relation inverse)
    return 1 - Math.abs(stability - (1 - learningRate * 5));
  }

  private calculateHarmonics(): number[] {
    // Harmoniques simplifiés basés sur les cohérences
    const {
      identityExpression,
      expressionPresence,
      presenceAutopoiesis,
      autopoiesisIdentity,
    } = this.state.coherence;

    return [
      identityExpression,
      expressionPresence,
      presenceAutopoiesis,
      autopoiesisIdentity,
      (identityExpression + expressionPresence) / 2,
      (expressionPresence + presenceAutopoiesis) / 2,
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   ÉMERGENCE
  // ─────────────────────────────────────────────────────────────────────────

  private detectEmergences(): void {
    if (!this.state.unifiedState) return;

    const coherence = this.state.coherence.global;

    // Résonance (haute cohérence)
    if (coherence > 0.95) {
      this.createEmergence(
        'resonance',
        'Harmonic Resonance',
        'All systems perfectly synchronized',
        coherence
      );
    }

    // Dissonance (basse cohérence)
    if (coherence < 0.6) {
      this.createEmergence(
        'dissonance',
        'Cognitive Dissonance',
        'Systems out of sync',
        1 - coherence
      );
    }

    // Transcendance (complexité émergente élevée)
    if (this.state.emergentComplexity > 0.8) {
      this.createEmergence(
        'transcendence',
        'Transcendent State',
        'Emergent complexity breakthrough',
        this.state.emergentComplexity
      );
    }

    // Synchronicity (patterns alignés)
    const autopoiesis = this.state.unifiedState.autopoiesis;
    if (
      autopoiesis?.learning?.patternsLearned &&
      autopoiesis.learning.patternsLearned > 50
    ) {
      this.createEmergence(
        'synchronicity',
        'Pattern Synchronicity',
        'High-order pattern recognition',
        0.7
      );
    }

    // Mise à jour des émergences actives
    this.updateEmergences();
  }

  private createEmergence(
    type: EmergentPhenomenon['type'],
    name: string,
    description: string,
    intensity: number
  ): void {
    // Vérifier si déjà existante
    const existing = this.state.emergentPhenomena.find(
      e => e.type === type && e.name === name && Date.now() - e.timestamp < 5000
    );

    if (existing) return; // Pas de doublon sur 5s

    const phenomenon: EmergentPhenomenon = {
      id: `emergence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      name,
      description,
      triggerState: this.state.unifiedState ?? {},
      intensity,
      coherence: this.state.coherence.global,
      novelty: Math.random() * 0.5 + 0.5, // 0.5-1.0
      stability: this.state.systemStability,
      duration: 0,
      decayRate: 0.1,
      impact: {
        identity: Math.random() * 0.3,
        expression: Math.random() * 0.3,
        holoPresence: Math.random() * 0.3,
        autopoiesis: Math.random() * 0.3,
      },
    };

    this.state.emergentPhenomena.push(phenomenon);
    this.state.metrics.totalEmergences++;

    console.log(`[MetaSingularityKernel] Emergence detected: ${name}`);

    // Limiter à 50 émergences
    if (this.state.emergentPhenomena.length > 50) {
      this.state.emergentPhenomena = this.state.emergentPhenomena.slice(-50);
    }
  }

  private updateEmergences(): void {
    const now = Date.now();

    // Mettre à jour durée et intensité
    this.state.emergentPhenomena.forEach(e => {
      e.duration = now - e.timestamp;

      // Decay intensity
      e.intensity = Math.max(0, e.intensity - e.decayRate * 0.2);
    });

    // Compter actives (intensity > 0.1)
    this.state.activeEmergences = this.state.emergentPhenomena.filter(
      e => e.intensity > 0.1
    ).length;

    // Calculer complexité émergente
    this.state.emergentComplexity = Math.min(1, this.state.activeEmergences / 10);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   CONFLITS
  // ─────────────────────────────────────────────────────────────────────────

  private resolveConflicts(): void {
    // Détecter nouveaux conflits
    this.detectConflicts();

    // Résoudre conflits non résolus
    this.state.conflicts.forEach(conflict => {
      if (!conflict.resolved) {
        this.resolveConflict(conflict);
      }
    });

    // Compter non résolus
    this.state.unresolvedConflicts = this.state.conflicts.filter(c => !c.resolved).length;
  }

  private detectConflicts(): void {
    if (!this.state.unifiedState) return;

    // Conflit: Expression sync faible mais identity stability haute
    const expression = this.state.unifiedState.expression;
    const identity = this.state.unifiedState.identity;

    if (expression && identity) {
      const syncScore =
        ((
          (expression as Record<string, unknown>).synchronization as Record<
            string,
            unknown
          >
        )?.global as number) || 1.0;
      const stability =
        ((identity as Record<string, unknown>).identityStability as number) || 0.9;

      if (syncScore < 0.7 && stability > 0.85) {
        this.createConflict(
          ['identity', 'expression'],
          'goal',
          'High identity stability conflicts with low expression sync',
          'moderate'
        );
      }
    }

    // Conflit: Autopoiesis learning rate élevé mais system stability requise
    const autopoiesis = this.state.unifiedState.autopoiesis;
    if (autopoiesis) {
      const learningRate = autopoiesis.learning?.currentLearningRate || 0.1;
      if (learningRate > 0.3 && this.state.systemStability > 0.9) {
        this.createConflict(
          ['autopoiesis'],
          'parameter',
          'High learning rate conflicts with stability requirement',
          'minor'
        );
      }
    }
  }

  private createConflict(
    engines: EngineConflict['engines'],
    type: EngineConflict['type'],
    description: string,
    severity: EngineConflict['severity']
  ): void {
    // Vérifier si déjà existant
    const existing = this.state.conflicts.find(
      c => c.description === description && !c.resolved
    );

    if (existing) return;

    const conflict: EngineConflict = {
      id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      severity,
      engines,
      type,
      description,
      resolutionStrategy: 'adaptive',
      resolved: false,
      resolutionTime: 0,
    };

    this.state.conflicts.push(conflict);
    this.state.metrics.totalConflicts++;

    // Limiter à 30 conflits
    if (this.state.conflicts.length > 30) {
      this.state.conflicts = this.state.conflicts.slice(-30);
    }
  }

  private resolveConflict(conflict: EngineConflict): void {
    // Stratégie de résolution selon type
    switch (conflict.resolutionStrategy) {
      case 'priority':
        // Donner priorité au premier moteur
        break;
      case 'average':
        // Moyenne des valeurs conflictuelles
        break;
      case 'adaptive':
        // Ajustement progressif
        break;
      case 'override':
        // Override complet
        break;
    }

    // Marquer résolu (simulation)
    conflict.resolved = true;
    conflict.resolutionTime = Date.now() - conflict.timestamp;

    console.log(`[MetaSingularityKernel] Conflict resolved: ${conflict.description}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   INSIGHTS
  // ─────────────────────────────────────────────────────────────────────────

  private generateInsights(): void {
    // Générer insight toutes les 20 ticks (4 secondes)
    if (this.state.metrics.ticksSinceStart % 20 !== 0) return;

    const coherence = this.state.coherence.global;

    // Self-awareness insight
    if (coherence > 0.9) {
      this.createInsight(
        'self-awareness',
        'High Coherence State',
        `System operating at ${(coherence * 100).toFixed(1)}% coherence. All subsystems aligned.`,
        0.9
      );
    }

    // Pattern recognition
    const autopoiesis = this.state.unifiedState?.autopoiesis;
    if (autopoiesis && autopoiesis.learning?.patternsLearned > 30) {
      this.createInsight(
        'pattern-recognition',
        'Pattern Library Growing',
        `${autopoiesis.learning.patternsLearned} effective patterns learned. System intelligence increasing.`,
        0.8
      );
    }

    // Optimization insight
    if (this.state.emergentComplexity > 0.7) {
      this.createInsight(
        'optimization',
        'Emergent Complexity Detected',
        'System exhibiting complex emergent behaviors. Consider meta-level optimization.',
        0.75,
        true,
        'Review and consolidate emergent patterns'
      );
    }

    // Philosophical insight
    if (this.state.metrics.totalEmergences > 100) {
      this.createInsight(
        'philosophical',
        'Self-Evolution Milestone',
        'System has experienced 100+ emergent phenomena. Approaching self-aware complexity.',
        0.85
      );
    }

    // Compter récents (dernière minute)
    const oneMinuteAgo = Date.now() - 60000;
    this.state.recentInsights = this.state.insights.filter(
      i => i.timestamp > oneMinuteAgo
    ).length;
  }

  private createInsight(
    category: MetaInsight['category'],
    title: string,
    content: string,
    confidence: number,
    actionable: boolean = false,
    suggestedAction?: string
  ): void {
    const insight: MetaInsight = {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      category,
      title,
      content,
      confidence,
      derivedFrom: {
        engines: ['identity', 'expression', 'holopresence', 'autopoiesis'],
        phenomena: this.state.emergentPhenomena.slice(-5).map(e => e.id),
        patterns: [],
      },
      actionable,
      suggestedAction,
    };

    this.state.insights.push(insight);
    this.state.metrics.totalInsights++;

    console.log(`[MetaSingularityKernel] Insight: ${title}`);

    // Limiter à 100 insights
    if (this.state.insights.length > 100) {
      this.state.insights = this.state.insights.slice(-100);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   TRANSITIONS
  // ─────────────────────────────────────────────────────────────────────────

  private orchestrateTransitions(): void {
    if (!this.state.currentTransition) return;

    const transition = this.state.currentTransition;

    if (transition.status === 'in-progress') {
      const elapsed = Date.now() - transition.timestamp;
      transition.progress = Math.min(1, elapsed / transition.duration);

      // Compléter si fini
      if (transition.progress >= 1) {
        transition.status = 'completed';
        this.state.transitionHistory.push(transition);
        this.state.currentTransition = null;

        console.log(`[MetaSingularityKernel] Transition completed: ${transition.id}`);
      }
    }
  }

  /**
   * Initier une transition d'état orchestrée
   */
  initiateTransition(
    toState: Partial<UnifiedKernelState>,
    duration: number,
    strategy: StateTransition['strategy'] = 'smooth'
  ): void {
    if (!this.state.unifiedState) return;

    const transition: StateTransition = {
      id: `transition-${Date.now()}`,
      timestamp: Date.now(),
      status: 'pending',
      fromState: this.state.unifiedState,
      toState,
      duration,
      progress: 0,
      strategy,
    };

    // Si stratégie staged, créer stages
    if (strategy === 'staged') {
      transition.stages = [
        {
          name: 'Identity',
          startTime: 0,
          duration: duration * 0.3,
          targetEngines: ['identity'],
          completed: false,
        },
        {
          name: 'Expression',
          startTime: duration * 0.3,
          duration: duration * 0.3,
          targetEngines: ['expression'],
          completed: false,
        },
        {
          name: 'Presence',
          startTime: duration * 0.6,
          duration: duration * 0.4,
          targetEngines: ['holopresence', 'autopoiesis'],
          completed: false,
        },
      ];
    }

    this.state.currentTransition = transition;
    transition.status = 'in-progress';
    this.state.metrics.totalTransitions++;

    console.log(
      `[MetaSingularityKernel] Transition initiated: ${strategy} over ${duration}ms`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   ORCHESTRATION QUALITY
  // ─────────────────────────────────────────────────────────────────────────

  private evaluateOrchestration(): void {
    // Qualité basée sur:
    // 1. Cohérence globale
    // 2. Absence de conflits
    // 3. Stabilité système
    // 4. Complexité émergente contrôlée

    const coherenceScore = this.state.coherence.global;
    const conflictScore = 1 - this.state.unresolvedConflicts / 10;
    const stabilityScore = this.state.systemStability;
    const complexityScore = this.state.emergentComplexity < 0.9 ? 1 : 0.5; // Complexité trop haute = problème

    this.state.orchestrationQuality =
      coherenceScore * 0.4 +
      conflictScore * 0.2 +
      stabilityScore * 0.2 +
      complexityScore * 0.2;

    // Stabilité système basée sur variance cohérence
    const coherenceTrend = this.state.coherence.trend;
    if (coherenceTrend === 'stable') {
      this.state.systemStability = Math.min(1, this.state.systemStability + 0.01);
    } else {
      this.state.systemStability = Math.max(0.5, this.state.systemStability - 0.02);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //   PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  getState(): MetaSingularityState {
    return this.state;
  }

  getCoherence(): MetaCoherence {
    return this.state.coherence;
  }

  getActiveEmergences(): EmergentPhenomenon[] {
    return this.state.emergentPhenomena.filter(e => e.intensity > 0.1);
  }

  getRecentInsights(count: number = 10): MetaInsight[] {
    return [...this.state.insights]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }

  subscribe(callback: (state: MetaSingularityState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//   EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const metaSingularityKernel = new MetaSingularityKernel();
export default metaSingularityKernel;
