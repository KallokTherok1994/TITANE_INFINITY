/**
 * TITANE∞ vΩ∞ — KNOWLEDGE INTEGRATION ENGINE
 * OPUS v∞.11: Unification cognitive et consolidation
 *
 * Ce moteur est le chef d'orchestre cognitif de TITANE∞ :
 * - Intègre les données de tous les moteurs
 * - Consolide les connaissances
 * - Harmonise les signaux
 * - Détecte et résout les conflits
 * - Maintient la cohérence globale
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  KnowledgeIntegrationState,
  KnowledgeIntegrationEngineConfig,
  IntegratedState,
  IntegrationInput,
  IntegrationOutput,
  ConflictEntry,
  ObservedPattern,
  IntegrationEvent,
  KnowledgeSource,
  ResolutionStrategy,
  ContextNode,
  ContextEdge,
  ContextGraph,
} from '@/types/knowledgeIntegration';

import {
  getDefaultKnowledgeIntegrationState,
  getDefaultKnowledgeIntegrationEngineConfig,
  KNOWLEDGE_INTEGRATION_CONSTANTS,
} from '@/types/knowledgeIntegration';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface StateUpdateCallback {
  (state: KnowledgeIntegrationState): void;
}

interface ConflictCallback {
  (conflicts: ConflictEntry[]): void;
}

interface PatternCallback {
  (patterns: ObservedPattern[]): void;
}

// ============================================================================
// KNOWLEDGE INTEGRATION ENGINE
// ============================================================================

/**
 * Moteur d'intégration des connaissances singleton
 * Unifie et harmonise tous les signaux du système
 */
class KnowledgeIntegrationEngine {
  private static instance: KnowledgeIntegrationEngine | null = null;

  // Configuration
  private config: KnowledgeIntegrationEngineConfig;

  // État
  private state: KnowledgeIntegrationState;
  private isRunning: boolean = false;

  // Callbacks
  private stateUpdateCallback: StateUpdateCallback | null = null;
  private conflictCallback: ConflictCallback | null = null;
  private patternCallback: PatternCallback | null = null;

  // Compteurs pour métriques
  private integrationCount: number = 0;
  private lastIntegrationTime: number = 0;

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  private constructor() {
    this.config = getDefaultKnowledgeIntegrationEngineConfig();
    this.state = getDefaultKnowledgeIntegrationState();
  }

  public static getInstance(): KnowledgeIntegrationEngine {
    if (!KnowledgeIntegrationEngine.instance) {
      KnowledgeIntegrationEngine.instance = new KnowledgeIntegrationEngine();
    }
    return KnowledgeIntegrationEngine.instance;
  }

  public static resetInstance(): void {
    if (KnowledgeIntegrationEngine.instance) {
      KnowledgeIntegrationEngine.instance.stop();
      KnowledgeIntegrationEngine.instance = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.state.isActive = true;
    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();
  }

  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.state.isActive = false;
    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();
  }

  public reset(): void {
    this.state = getDefaultKnowledgeIntegrationState();
    this.integrationCount = 0;
    this.lastIntegrationTime = 0;
    this.notifyStateUpdate();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  public getConfig(): KnowledgeIntegrationEngineConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<KnowledgeIntegrationEngineConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  public getState(): KnowledgeIntegrationState {
    return { ...this.state };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════

  public onStateUpdate(callback: StateUpdateCallback): () => void {
    this.stateUpdateCallback = callback;
    return () => {
      this.stateUpdateCallback = null;
    };
  }

  public onConflict(callback: ConflictCallback): () => void {
    this.conflictCallback = callback;
    return () => {
      this.conflictCallback = null;
    };
  }

  public onPattern(callback: PatternCallback): () => void {
    this.patternCallback = callback;
    return () => {
      this.patternCallback = null;
    };
  }

  private notifyStateUpdate(): void {
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback(this.getState());
    }
  }

  private notifyConflicts(conflicts: ConflictEntry[]): void {
    if (this.conflictCallback && conflicts.length > 0) {
      this.conflictCallback(conflicts);
    }
  }

  private notifyPatterns(patterns: ObservedPattern[]): void {
    if (this.patternCallback && patterns.length > 0) {
      this.patternCallback(patterns);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - INTÉGRATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Intègre les connaissances de plusieurs sources
   */
  public integrateKnowledge(input: IntegrationInput): IntegrationOutput {
    const now = Date.now();
    this.integrationCount++;
    this.lastIntegrationTime = now;

    // 1. Construire l'état intégré
    const integratedState = this.buildIntegratedState(input);

    // 2. Détecter les conflits
    const newConflicts = this.detectConflicts(integratedState, input);

    // 3. Résoudre les conflits
    const resolvedConflicts = this.resolveConflicts(newConflicts);

    // 4. Mettre à jour les patterns
    const newPatterns = this.updatePatterns(integratedState, input);

    // 5. Mettre à jour le graphe contextuel
    this.updateContextGraph(input);

    // 6. Calculer les scores de cohérence
    const coherenceScore = this.computeCoherenceScore(integratedState, newConflicts);
    const stabilityScore = this.computeStabilityScore();

    // 7. Créer l'événement d'intégration
    const event = this.createIntegrationEvent(input, coherenceScore);

    // 8. Mettre à jour le profil
    this.state.profile.integratedState = integratedState;
    this.state.profile.coherenceScore = coherenceScore;
    this.state.profile.stabilityScore = stabilityScore;
    this.state.profile.totalIntegrations++;
    this.state.profile.lastUpdate = now;

    // Ajouter les nouveaux conflits non résolus aux conflits en attente
    const unresolvedConflicts = newConflicts.filter(c => !c.resolved);
    this.state.pendingConflicts.push(...unresolvedConflicts);
    this.state.profile.conflictMatrix = [...this.state.profile.conflictMatrix, ...unresolvedConflicts]
      .slice(-KNOWLEDGE_INTEGRATION_CONSTANTS.MAX_CONFLICTS);

    // Ajouter l'événement à l'historique
    this.state.profile.integrationEvents.unshift(event);
    if (this.state.profile.integrationEvents.length > this.config.maxIntegrationEvents) {
      this.state.profile.integrationEvents = this.state.profile.integrationEvents.slice(0, this.config.maxIntegrationEvents);
    }

    // Mettre à jour les métriques temps réel
    this.updateRealtimeMetrics(newConflicts, coherenceScore);

    this.state.lastUpdate = now;
    this.notifyStateUpdate();
    this.notifyConflicts(newConflicts);
    this.notifyPatterns(newPatterns);

    // Générer les recommandations
    const recommendations = this.generateRecommendations(coherenceScore, newConflicts);

    return {
      success: true,
      integratedState,
      newConflicts,
      resolvedConflicts,
      newPatterns,
      coherenceScore,
      stabilityScore,
      recommendations,
      event,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - DÉTECTION DE CONFLITS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Détecte les conflits dans l'état intégré
   */
  public detectConflicts(
    integratedState: IntegratedState,
    _input?: IntegrationInput
  ): ConflictEntry[] {
    const conflicts: ConflictEntry[] = [];
    const now = Date.now();

    // Conflit 1: Tension haute mais énergie haute
    if (integratedState.multimodal.tension > 0.7 && integratedState.multimodal.energy > 0.7) {
      // Vérifier si le flow est actif (ce qui pourrait expliquer)
      if (!integratedState.flow.isActive) {
        conflicts.push({
          id: `conflict_${now}_1`,
          type: 'inconsistency',
          moduleA: 'multimodal',
          moduleB: 'multimodal',
          description: 'Tension et énergie simultanément élevées sans état de flow',
          severity: 0.5,
          conflictingData: {
            fromA: { tension: integratedState.multimodal.tension },
            fromB: { energy: integratedState.multimodal.energy },
          },
          resolved: false,
          detectedAt: now,
        });
      }
    }

    // Conflit 2: Style de présence incompatible avec l'état multimodal
    if (integratedState.presence.style === 'directive' && integratedState.multimodal.tension > 0.7) {
      conflicts.push({
        id: `conflict_${now}_2`,
        type: 'contradiction',
        moduleA: 'presence',
        moduleB: 'multimodal',
        description: 'Style directif inadapté en situation de haute tension',
        severity: 0.7,
        conflictingData: {
          fromA: { style: integratedState.presence.style },
          fromB: { tension: integratedState.multimodal.tension },
        },
        resolved: false,
        detectedAt: now,
      });
    }

    // Conflit 3: Flow actif mais énergie très basse
    if (integratedState.flow.isActive && integratedState.multimodal.energy < 0.3) {
      conflicts.push({
        id: `conflict_${now}_3`,
        type: 'inconsistency',
        moduleA: 'flow',
        moduleB: 'multimodal',
        description: 'État de flow détecté avec énergie très basse',
        severity: 0.6,
        conflictingData: {
          fromA: { flow: integratedState.flow },
          fromB: { energy: integratedState.multimodal.energy },
        },
        resolved: false,
        detectedAt: now,
      });
    }

    // Conflit 4: Stress élevé mais résonance en mode "energizing"
    if (integratedState.stress.level > 0.7 && integratedState.resonance.mode === 'energizing') {
      conflicts.push({
        id: `conflict_${now}_4`,
        type: 'contradiction',
        moduleA: 'stress',
        moduleB: 'resonance',
        description: 'Mode de résonance énergisant inapproprié en situation de stress',
        severity: 0.8,
        conflictingData: {
          fromA: { stressLevel: integratedState.stress.level },
          fromB: { resonanceMode: integratedState.resonance.mode },
        },
        resolved: false,
        detectedAt: now,
      });
    }

    // Conflit 5: Prédiction de déclin mais tendance de stress en baisse
    if (integratedState.predictive.trend === 'declining' && integratedState.stress.trend === 'falling') {
      conflicts.push({
        id: `conflict_${now}_5`,
        type: 'contradiction',
        moduleA: 'predictive',
        moduleB: 'stress',
        description: 'Tendance prédictive en déclin contradictoire avec amélioration du stress',
        severity: 0.4,
        conflictingData: {
          fromA: { predictiveTrend: integratedState.predictive.trend },
          fromB: { stressTrend: integratedState.stress.trend },
        },
        resolved: false,
        detectedAt: now,
      });
    }

    return conflicts;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - RÉSOLUTION DE CONFLITS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Résout les conflits détectés
   */
  public resolveConflicts(conflicts: ConflictEntry[]): ConflictEntry[] {
    const resolvedConflicts: ConflictEntry[] = [];

    for (const conflict of conflicts) {
      const resolved = this.resolveConflict(conflict);
      if (resolved) {
        resolvedConflicts.push(resolved);
        this.state.profile.totalConflictsResolved++;
      }
    }

    return resolvedConflicts;
  }

  /**
   * Résout un conflit individuel
   */
  private resolveConflict(conflict: ConflictEntry): ConflictEntry | null {
    const strategy = this.determineResolutionStrategy(conflict);
    const now = Date.now();

    switch (strategy) {
      case 'source_priority': {
        // La source avec la priorité la plus haute gagne
        const priorityA = this.config.conflictResolution.sourcePriority.indexOf(conflict.moduleA);
        const priorityB = this.config.conflictResolution.sourcePriority.indexOf(conflict.moduleB);
        const winner = priorityA <= priorityB ? conflict.moduleA : conflict.moduleB;

        return {
          ...conflict,
          resolved: true,
          resolutionStrategy: strategy,
          resolutionResult: {
            winner,
            action: `Priorité donnée à ${winner}`,
          },
          resolvedAt: now,
        };
      }

      case 'weighted_merge': {
        // Fusion pondérée des deux sources
        const weightA = KNOWLEDGE_INTEGRATION_CONSTANTS.SOURCE_WEIGHTS[conflict.moduleA] || 0.5;
        const weightB = KNOWLEDGE_INTEGRATION_CONSTANTS.SOURCE_WEIGHTS[conflict.moduleB] || 0.5;

        return {
          ...conflict,
          resolved: true,
          resolutionStrategy: strategy,
          resolutionResult: {
            weights: { [conflict.moduleA]: weightA, [conflict.moduleB]: weightB },
            action: 'Fusion pondérée appliquée',
          },
          resolvedAt: now,
        };
      }

      case 'newer_wins': {
        // On ne peut pas facilement déterminer "newer" sans timestamps, donc on utilise A
        return {
          ...conflict,
          resolved: true,
          resolutionStrategy: strategy,
          resolutionResult: {
            winner: conflict.moduleA,
            action: 'Donnée la plus récente retenue',
          },
          resolvedAt: now,
        };
      }

      case 'manual_review': {
        // Ne pas résoudre automatiquement
        return null;
      }

      default: {
        // Résolution par défaut: source_priority
        const priorityA = this.config.conflictResolution.sourcePriority.indexOf(conflict.moduleA);
        const priorityB = this.config.conflictResolution.sourcePriority.indexOf(conflict.moduleB);
        const winner = priorityA <= priorityB ? conflict.moduleA : conflict.moduleB;

        return {
          ...conflict,
          resolved: true,
          resolutionStrategy: 'source_priority',
          resolutionResult: { winner },
          resolvedAt: now,
        };
      }
    }
  }

  private determineResolutionStrategy(conflict: ConflictEntry): ResolutionStrategy {
    // Conflits critiques: révision manuelle
    if (conflict.severity >= this.config.thresholds.urgentConflictSeverity) {
      return 'weighted_merge'; // Pour les conflits critiques, on fusionne
    }

    // Contradictions: priorité source
    if (conflict.type === 'contradiction') {
      return 'source_priority';
    }

    // Incohérences: fusion pondérée
    if (conflict.type === 'inconsistency') {
      return 'weighted_merge';
    }

    // Par défaut
    return this.config.conflictResolution.defaultStrategy;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - MISE À JOUR DE L'ÉTAT INTÉGRÉ
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Met à jour l'état intégré
   */
  public updateIntegratedState(partial: Partial<IntegratedState>): void {
    this.state.profile.integratedState = {
      ...this.state.profile.integratedState,
      ...partial,
      timestamp: Date.now(),
    };
    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();
  }

  /**
   * Récupère l'état intégré actuel
   */
  public getIntegratedState(): IntegratedState {
    return { ...this.state.profile.integratedState };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - SCORES DE COHÉRENCE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Calcule les scores de cohérence
   */
  public computeCoherenceScores(): { coherence: number; stability: number } {
    return {
      coherence: this.state.profile.coherenceScore,
      stability: this.state.profile.stabilityScore,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - GRAPHE CONTEXTUEL
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Ajoute un nœud au graphe contextuel
   */
  public addContextNode(node: Omit<ContextNode, 'id' | 'createdAt' | 'lastActivated'>): ContextNode {
    const now = Date.now();
    const newNode: ContextNode = {
      ...node,
      id: `node_${now}`,
      createdAt: now,
      lastActivated: now,
    };

    this.state.profile.contextGraph.nodes.push(newNode);

    // Limiter le nombre de nœuds
    if (this.state.profile.contextGraph.nodes.length > this.config.contextGraph.maxNodes) {
      // Supprimer les nœuds les moins importants et les plus anciens
      this.state.profile.contextGraph.nodes.sort((a, b) => {
        const scoreA = a.importance * (1 / (now - a.lastActivated + 1));
        const scoreB = b.importance * (1 / (now - b.lastActivated + 1));
        return scoreB - scoreA;
      });
      this.state.profile.contextGraph.nodes = this.state.profile.contextGraph.nodes.slice(0, this.config.contextGraph.maxNodes);
    }

    this.state.profile.contextGraph.lastUpdate = now;
    this.notifyStateUpdate();

    return newNode;
  }

  /**
   * Ajoute une arête au graphe contextuel
   */
  public addContextEdge(edge: Omit<ContextEdge, 'id' | 'createdAt'>): ContextEdge {
    const now = Date.now();
    const newEdge: ContextEdge = {
      ...edge,
      id: `edge_${now}`,
      createdAt: now,
    };

    this.state.profile.contextGraph.edges.push(newEdge);

    // Limiter le nombre d'arêtes
    if (this.state.profile.contextGraph.edges.length > this.config.contextGraph.maxEdges) {
      // Supprimer les arêtes les plus faibles
      this.state.profile.contextGraph.edges.sort((a, b) => b.strength - a.strength);
      this.state.profile.contextGraph.edges = this.state.profile.contextGraph.edges.slice(0, this.config.contextGraph.maxEdges);
    }

    this.state.profile.contextGraph.lastUpdate = now;
    this.notifyStateUpdate();

    return newEdge;
  }

  /**
   * Récupère le graphe contextuel
   */
  public getContextGraph(): ContextGraph {
    return { ...this.state.profile.contextGraph };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - PATTERNS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Récupère les patterns observés
   */
  public getPatterns(): ObservedPattern[] {
    return [...this.state.profile.patternMap];
  }

  /**
   * Recherche un pattern par clé
   */
  public findPattern(key: string): ObservedPattern | undefined {
    return this.state.profile.patternMap.find(p => p.key === key);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - MODE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Change le mode d'intégration
   */
  public setMode(mode: 'passive' | 'active' | 'learning'): void {
    this.state.mode = mode;
    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();
  }

  /**
   * Récupère le mode actuel
   */
  public getMode(): 'passive' | 'active' | 'learning' {
    return this.state.mode;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - MÉTHODE PROCESS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Méthode de traitement principale (pour intégration pipeline)
   */
  public process(input: IntegrationInput): IntegrationOutput {
    return this.integrateKnowledge(input);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - CONSTRUCTION DE L'ÉTAT INTÉGRÉ
  // ═══════════════════════════════════════════════════════════════════════

  private buildIntegratedState(input: IntegrationInput): IntegratedState {
    const current = this.state.profile.integratedState;
    const now = Date.now();

    return {
      multimodal: input.multimodalState
        ? {
            energy: input.multimodalState.energy,
            tension: input.multimodalState.tension,
            engagement: input.multimodalState.engagement,
            stability: input.multimodalState.stability,
          }
        : current.multimodal,

      predictive: input.predictiveState
        ? {
            trend: input.predictiveState.trend as 'improving' | 'stable' | 'declining',
            confidence: input.predictiveState.confidence,
            nextPrediction: String(input.predictiveState.predictions[0] || ''),
          }
        : current.predictive,

      rhythm: input.rhythmState
        ? {
            currentPhase: input.rhythmState.currentPhase,
            energyLevel: input.rhythmState.energyLevel,
            optimalWindow: input.rhythmState.isOptimalWindow,
          }
        : current.rhythm,

      presence: input.presenceState
        ? {
            style: input.presenceState.style,
            alignmentScore: input.presenceState.alignmentScore,
            stability: current.presence.stability,
          }
        : current.presence,

      resonance: input.resonanceState
        ? {
            mode: input.resonanceState.mode,
            resonanceScore: input.resonanceState.resonanceScore,
            adaptationActive: true,
          }
        : current.resonance,

      flow: input.flowState
        ? {
            isActive: input.flowState.isActive,
            zone: input.flowState.zone,
            intensity: input.flowState.intensity,
          }
        : current.flow,

      stress: input.stressState
        ? {
            level: input.stressState.level,
            trend: input.stressState.trend as 'rising' | 'stable' | 'falling',
            interventionNeeded: input.stressState.level > 0.7,
          }
        : current.stress,

      globalCoherence: current.globalCoherence, // Sera recalculé
      timestamp: now,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - PATTERNS
  // ═══════════════════════════════════════════════════════════════════════

  private updatePatterns(
    integratedState: IntegratedState,
    _input: IntegrationInput
  ): ObservedPattern[] {
    if (!this.config.learning.enabled) {
      return [];
    }

    const newPatterns: ObservedPattern[] = [];
    const _now = Date.now();

    // Pattern: Haute énergie + Faible tension = Bon moment
    if (integratedState.multimodal.energy > 0.7 && integratedState.multimodal.tension < 0.4) {
      const pattern = this.updateOrCreatePattern({
        key: 'optimal_energy_state',
        value: 'Énergie haute et tension basse',
        source: 'multimodal',
        triggerConditions: ['energy > 0.7', 'tension < 0.4'],
      });
      if (pattern.observationCount === 1) {
        newPatterns.push(pattern);
      }
    }

    // Pattern: Flow + Basse énergie = Alerte
    if (integratedState.flow.isActive && integratedState.multimodal.energy < 0.4) {
      const pattern = this.updateOrCreatePattern({
        key: 'flow_energy_warning',
        value: 'Flow actif avec énergie en baisse',
        source: 'flow',
        triggerConditions: ['flow.isActive', 'energy < 0.4'],
      });
      if (pattern.observationCount === 1) {
        newPatterns.push(pattern);
      }
    }

    // Pattern: Stress croissant
    if (integratedState.stress.trend === 'rising' && integratedState.stress.level > 0.5) {
      const pattern = this.updateOrCreatePattern({
        key: 'stress_escalation',
        value: 'Stress en escalade',
        source: 'stress',
        triggerConditions: ['stress.trend = rising', 'stress.level > 0.5'],
      });
      if (pattern.observationCount === 1) {
        newPatterns.push(pattern);
      }
    }

    return newPatterns;
  }

  private updateOrCreatePattern(data: {
    key: string;
    value: string;
    source: KnowledgeSource;
    triggerConditions: string[];
  }): ObservedPattern {
    const now = Date.now();
    const existingIndex = this.state.profile.patternMap.findIndex(p => p.key === data.key);

    if (existingIndex >= 0) {
      // Mettre à jour le pattern existant
      const existing = this.state.profile.patternMap[existingIndex];
      const updated: ObservedPattern = {
        ...existing,
        observationCount: existing.observationCount + 1,
        frequency: Math.min(1, existing.frequency + this.config.learning.learningRate),
        confidence: Math.min(1, existing.confidence + 0.05),
        lastObserved: now,
        confirmedBy: [...new Set([...existing.confirmedBy, data.source])],
      };
      this.state.profile.patternMap[existingIndex] = updated;
      return updated;
    } else {
      // Créer un nouveau pattern
      const newPattern: ObservedPattern = {
        id: `pattern_${now}`,
        key: data.key,
        value: data.value,
        confidence: 0.3,
        frequency: this.config.learning.learningRate,
        confirmedBy: [data.source],
        triggerConditions: data.triggerConditions,
        lastObserved: now,
        observationCount: 1,
      };
      this.state.profile.patternMap.push(newPattern);

      // Ajouter à l'historique d'apprentissage
      this.state.profile.learningHistory.push({
        pattern: data.key,
        learnedAt: now,
        confidence: 0.3,
      });

      return newPattern;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - GRAPHE CONTEXTUEL
  // ═══════════════════════════════════════════════════════════════════════

  private updateContextGraph(input: IntegrationInput): void {
    const now = Date.now();

    // Appliquer le decay sur les nœuds existants
    for (const node of this.state.profile.contextGraph.nodes) {
      const timeSinceActivation = now - node.lastActivated;
      if (timeSinceActivation > 60000) { // Plus d'une minute
        node.importance *= this.config.contextGraph.inactivityDecay;
      }
    }

    // Ajouter des nœuds basés sur l'état actuel
    if (input.contextState?.currentTopic) {
      const currentTopic = input.contextState.currentTopic;
      const existingNode = this.state.profile.contextGraph.nodes.find(
        n => n.label === currentTopic
      );

      if (existingNode) {
        existingNode.lastActivated = now;
        existingNode.importance = Math.min(1, existingNode.importance + 0.1);
      } else {
        this.addContextNode({
          type: 'topic',
          label: input.contextState.currentTopic,
          data: { depth: input.contextState.conversationDepth },
          importance: 0.5,
        });
      }
    }

    this.state.profile.contextGraph.lastUpdate = now;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - SCORES
  // ═══════════════════════════════════════════════════════════════════════

  private computeCoherenceScore(
    integratedState: IntegratedState,
    conflicts: ConflictEntry[]
  ): number {
    // Score de base
    let score = 1.0;

    // Pénaliser les conflits
    for (const conflict of conflicts) {
      score -= conflict.severity * 0.1;
    }

    // Bonus pour alignement présence/multimodal
    const alignmentBonus = integratedState.presence.alignmentScore * 0.1;
    score += alignmentBonus;

    // Bonus pour résonance
    const resonanceBonus = integratedState.resonance.resonanceScore * 0.05;
    score += resonanceBonus;

    // Pénalité si stress intervention nécessaire
    if (integratedState.stress.interventionNeeded) {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private computeStabilityScore(): number {
    // Basé sur l'historique des évaluations récentes
    const recentEvents = this.state.profile.integrationEvents.slice(0, 10);

    if (recentEvents.length === 0) {
      return 0.8;
    }

    // Calculer la moyenne des impacts sur la cohérence
    const avgImpact = recentEvents.reduce((sum, e) => sum + e.coherenceImpact, 0) / recentEvents.length;

    // Score de stabilité basé sur l'écart des impacts
    const variance = recentEvents.reduce((sum, e) => sum + Math.pow(e.coherenceImpact - avgImpact, 2), 0) / recentEvents.length;

    return Math.max(0, 1 - variance * 2);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - ÉVÉNEMENTS
  // ═══════════════════════════════════════════════════════════════════════

  private createIntegrationEvent(
    input: IntegrationInput,
    coherenceScore: number
  ): IntegrationEvent {
    return {
      id: `event_${Date.now()}`,
      type: 'integration',
      source: input.source,
      description: `Intégration depuis ${input.source}`,
      data: {
        hasMultimodal: !!input.multimodalState,
        hasPresence: !!input.presenceState,
        hasResonance: !!input.resonanceState,
        hasFlow: !!input.flowState,
      },
      coherenceImpact: coherenceScore - this.state.profile.coherenceScore,
      timestamp: Date.now(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - MÉTRIQUES
  // ═══════════════════════════════════════════════════════════════════════

  private updateRealtimeMetrics(conflicts: ConflictEntry[], coherenceScore: number): void {
    const now = Date.now();

    // Calcul du taux d'intégration par minute
    const timeDiff = (now - this.lastIntegrationTime) / 60000; // en minutes
    if (timeDiff > 0 && timeDiff < 1) {
      this.state.realtimeMetrics.integrationsPerMinute = 1 / timeDiff;
    }

    // Taux de conflits
    this.state.realtimeMetrics.conflictRate = conflicts.length > 0
      ? conflicts.length / this.integrationCount
      : this.state.realtimeMetrics.conflictRate * 0.95;

    // Cohérence moyenne
    this.state.realtimeMetrics.averageCoherence =
      this.state.realtimeMetrics.averageCoherence * 0.9 + coherenceScore * 0.1;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - RECOMMANDATIONS
  // ═══════════════════════════════════════════════════════════════════════

  private generateRecommendations(
    coherenceScore: number,
    conflicts: ConflictEntry[]
  ): string[] {
    const recommendations: string[] = [];

    if (coherenceScore < this.config.thresholds.minCoherenceScore) {
      recommendations.push('Cohérence globale faible, vérifier l\'alignement des moteurs');
    }

    const criticalConflicts = conflicts.filter(c => c.severity >= this.config.thresholds.urgentConflictSeverity);
    if (criticalConflicts.length > 0) {
      recommendations.push(`${criticalConflicts.length} conflit(s) critique(s) nécessitent attention`);
    }

    const stressConflicts = conflicts.filter(c => c.moduleA === 'stress' || c.moduleB === 'stress');
    if (stressConflicts.length > 0) {
      recommendations.push('Conflits liés au stress détectés, prioriser la régulation');
    }

    if (this.state.profile.integratedState.flow.isActive && conflicts.length > 0) {
      recommendations.push('Flow actif avec conflits, minimiser les interruptions');
    }

    if (recommendations.length === 0) {
      recommendations.push('Système stable, intégration nominale');
    }

    return recommendations;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export { KnowledgeIntegrationEngine };
export default KnowledgeIntegrationEngine;
