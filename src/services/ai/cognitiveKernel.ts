/**
 * TITANE∞ v22Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v22Ω — COGNITIVE KERNEL (ÉMERGENCE COGNITIVE)
 *   Noyau cognitif interne pour intelligence émergente
 *   - Champ cognitif local (principes systémiques)
 *   - États cognitifs internes (santé, intention, mémoire)
 *   - Processus cognitif émergent (perception → décision → expression)
 *   - Cohérence transversale (harmonisation globale)
 *   - Auto-optimisation cognitive (apprentissage continu)
 * ═══════════════════════════════════════════════════════════════════
 */

const isDev = process.env.NODE_ENV === 'development';

// ─────────────────────────────────────────────────────────────────
// TYPES COGNITIVE KERNEL
// ─────────────────────────────────────────────────────────────────

/**
 * Principes cognitifs fondamentaux du système
 */
export interface CognitivePrinciples {
  clarity: number;       // 0-100: Simplicité à chaque niveau
  robustness: number;    // 0-100: Minimisation instabilité
  coherence: number;     // 0-100: Uniformité patterns/noms
  parsimony: number;     // 0-100: Absence complexité superflue
  adaptation: number;    // 0-100: Réactivité aux conditions
  continuity: number;    // 0-100: Respect état actuel
}

/**
 * États d'environnement du système
 */
export interface EnvironmentState {
  providerHealth: Map<string, number>;  // Provider -> health score 0-100
  averageLatency: number;                // Latence moyenne ms
  responseQuality: number;               // Qualité perçue 0-100
  errorFrequency: number;                // Fréquence erreurs (par heure)
  chatStability: number;                 // Stabilité module chat 0-100
  governanceStatus: 'configured' | 'partial' | 'unconfigured';
}

/**
 * États d'intention du système
 */
export interface IntentionState {
  goal: 'best-response' | 'stable-fallback' | 'error-recovery' | 'optimization';
  priority: 'quality' | 'speed' | 'reliability' | 'balanced';
  targetProvider: string | null;
  avoidErrors: boolean;
  maintainCoherence: boolean;
}

/**
 * Mémoire locale éphémère (non persistante)
 */
export interface EphemeralMemory {
  lastEffectiveProviders: string[];      // 5 derniers providers efficaces
  recentErrorPatterns: Map<string, number>;  // Pattern -> occurrences
  bestModelsByContext: Map<string, string>;  // Context -> model
  recentAdaptations: Array<{
    timestamp: number;
    type: string;
    impact: number;
  }>;
}

/**
 * Pipeline cognitif (perception → décision)
 */
export interface CognitiveProcess {
  perception: {
    systemState: EnvironmentState;
    lastResult: any;
    microHistory: EphemeralMemory;
    structuralCoherence: number;
  };
  evaluation: {
    bestProvider: string;
    stabilityScore: number;
    adaptationNeeded: boolean;
    robustnessImpact: number;
  };
  projection: {
    nextStep: string;
    potentialRisks: string[];
    bestSequence: string[];
  };
  decision: {
    selectedProvider: string;
    modelConfig: any;
    fallbackStrategy: string[];
    structuralCorrections: string[];
  };
}

/**
 * Résultat d'une décision cognitive
 */
export interface CognitiveDecision {
  provider: string;
  reason: string;
  confidence: number;
  alternatives: string[];
  adaptations: string[];
  coherenceScore: number;
}

// ─────────────────────────────────────────────────────────────────
// COGNITIVE KERNEL CLASS
// ─────────────────────────────────────────────────────────────────

class CognitiveKernel {
  // ═══ CHAMP COGNITIF LOCAL ═══
  private principles: CognitivePrinciples = {
    clarity: 100,
    robustness: 100,
    coherence: 100,
    parsimony: 100,
    adaptation: 100,
    continuity: 100,
  };

  // ═══ ÉTATS COGNITIFS ═══
  private environmentState: EnvironmentState = {
    providerHealth: new Map(),
    averageLatency: 0,
    responseQuality: 100,
    errorFrequency: 0,
    chatStability: 100,
    governanceStatus: 'unconfigured',
  };

  private intentionState: IntentionState = {
    goal: 'best-response',
    priority: 'balanced',
    targetProvider: null,
    avoidErrors: true,
    maintainCoherence: true,
  };

  private ephemeralMemory: EphemeralMemory = {
    lastEffectiveProviders: [],
    recentErrorPatterns: new Map(),
    bestModelsByContext: new Map(),
    recentAdaptations: [],
  };

  // ═══ CARTOGRAPHIE COGNITIVE ═══
  private cognitiveMap = {
    providers: ['titane-local', 'tauri-chat', 'openai', 'claude', 'gemini', 'ollama'],
    orchestrator: 'neural-selection',
    chatUI: 'message-display',
    iaService: 'api-validation',
    governance: 'secrets-management',
    relationships: {
      'providers -> orchestrator': 'selection',
      'orchestrator -> chatUI': 'response-delivery',
      'iaService -> governance': 'config-sync',
      'governance -> providers': 'credentials',
    },
  };

  private initialized = false;

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE A: CONSTRUCTION DU CHAMP COGNITIF LOCAL
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Initialiser le kernel cognitif
   */
  initialize(): void {
    if (this.initialized) return;

    isDev && console.log('[COGNITIVE KERNEL] 🧠 Initialisation du champ cognitif...');

    // Principes fondamentaux (immuables)
    this.principles = {
      clarity: 100,       // Toujours viser la simplicité
      robustness: 100,    // Minimiser l'instabilité
      coherence: 100,     // Uniformité patterns
      parsimony: 100,     // Pas de code superflu
      adaptation: 100,    // Réagir aux conditions réelles
      continuity: 100,    // Respecter l'état actuel
    };

    // Cartographie cognitive (relations internes)
    isDev && console.log('[COGNITIVE KERNEL] 📊 Cartographie cognitive:', this.cognitiveMap);

    this.initialized = true;
    isDev && console.log('[COGNITIVE KERNEL] ✅ Champ cognitif établi');
  }

  /**
   * Obtenir les principes cognitifs actuels
   */
  getPrinciples(): CognitivePrinciples {
    return { ...this.principles };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE B: ÉTATS COGNITIFS INTERNES
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Mettre à jour l'état d'environnement
   */
  updateEnvironmentState(updates: Partial<EnvironmentState>): void {
    this.environmentState = {
      ...this.environmentState,
      ...updates,
    };

    // Ajuster les principes selon l'environnement
    this.adaptPrinciplesToEnvironment();
  }

  /**
   * Mettre à jour l'état d'intention
   */
  updateIntentionState(updates: Partial<IntentionState>): void {
    this.intentionState = {
      ...this.intentionState,
      ...updates,
    };
  }

  /**
   * Enregistrer dans la mémoire éphémère
   */
  recordInMemory(type: 'provider' | 'error' | 'model' | 'adaptation', data: any): void {
    const now = Date.now();

    if (type === 'provider') {
      this.ephemeralMemory.lastEffectiveProviders.unshift(data.provider);
      // Garder seulement les 5 derniers
      if (this.ephemeralMemory.lastEffectiveProviders.length > 5) {
        this.ephemeralMemory.lastEffectiveProviders.pop();
      }
    } else if (type === 'error') {
      const count = this.ephemeralMemory.recentErrorPatterns.get(data.pattern) || 0;
      this.ephemeralMemory.recentErrorPatterns.set(data.pattern, count + 1);
    } else if (type === 'model') {
      this.ephemeralMemory.bestModelsByContext.set(data.context, data.model);
    } else if (type === 'adaptation') {
      this.ephemeralMemory.recentAdaptations.push({
        timestamp: now,
        type: data.type,
        impact: data.impact,
      });
      // Garder seulement les 10 dernières
      if (this.ephemeralMemory.recentAdaptations.length > 10) {
        this.ephemeralMemory.recentAdaptations.shift();
      }
    }
  }

  /**
   * Adapter les principes selon l'environnement
   */
  private adaptPrinciplesToEnvironment(): void {
    // Si erreurs fréquentes → augmenter robustesse, réduire adaptation
    if (this.environmentState.errorFrequency > 5) {
      this.principles.robustness = Math.min(100, this.principles.robustness + 5);
      this.principles.adaptation = Math.max(50, this.principles.adaptation - 5);
    }

    // Si latence élevée → augmenter adaptation
    if (this.environmentState.averageLatency > 3000) {
      this.principles.adaptation = Math.min(100, this.principles.adaptation + 10);
    }

    // Si qualité basse → augmenter cohérence
    if (this.environmentState.responseQuality < 70) {
      this.principles.coherence = Math.min(100, this.principles.coherence + 5);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE C: PROCESSUS COGNITIF EMERGENT
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Exécuter le pipeline cognitif complet
   */
  executeCognitiveProcess(context: {
    message: string;
    providers: string[];
    metrics: any;
  }): CognitiveDecision {
    // 1. PERCEPTION
    const perception = this.perceive(context);

    // 2. ÉVALUATION
    const evaluation = this.evaluate(perception, context);

    // 3. PROJECTION
    const projection = this.project(evaluation, context);

    // 4. DÉCISION
    const decision = this.decide(projection, context);

    // 5. ENREGISTREMENT
    this.recordInMemory('provider', { provider: decision.provider });

    return {
      provider: decision.provider,
      reason: decision.reason,
      confidence: decision.confidence,
      alternatives: decision.alternatives,
      adaptations: decision.adaptations,
      coherenceScore: this.calculateCoherenceScore(),
    };
  }

  /**
   * 1. Perception: Lire l'état du système
   */
  private perceive(context: any): CognitiveProcess['perception'] {
    return {
      systemState: this.environmentState,
      lastResult: context.metrics,
      microHistory: this.ephemeralMemory,
      structuralCoherence: this.calculateCoherenceScore(),
    };
  }

  /**
   * 2. Évaluation: Analyser et scorer
   */
  private evaluate(
    perception: CognitiveProcess['perception'],
    context: any
  ): CognitiveProcess['evaluation'] {
    // Scorer chaque provider disponible
    const providerScores = context.providers.map((provider: string) => {
      const health = perception.systemState.providerHealth.get(provider) || 0;
      const recentSuccess = perception.microHistory.lastEffectiveProviders.includes(provider);
      const score = health * 0.7 + (recentSuccess ? 30 : 0);
      return { provider, score };
    });

    // Trier par score
    providerScores.sort((a, b) => b.score - a.score);

    const bestProvider = providerScores[0]?.provider || 'titane-local';
    const stabilityScore = perception.systemState.chatStability;
    const adaptationNeeded = perception.systemState.errorFrequency > 3;
    const robustnessImpact = this.principles.robustness;

    return {
      bestProvider,
      stabilityScore,
      adaptationNeeded,
      robustnessImpact,
    };
  }

  /**
   * 3. Projection: Anticiper la suite
   */
  private project(
    evaluation: CognitiveProcess['evaluation'],
    context: any
  ): CognitiveProcess['projection'] {
    const nextStep = evaluation.adaptationNeeded ? 'optimize-fallback' : 'execute-normal';

    const potentialRisks = [];
    if (evaluation.stabilityScore < 70) {
      potentialRisks.push('chat-instability');
    }
    if (this.environmentState.averageLatency > 5000) {
      potentialRisks.push('high-latency');
    }

    const bestSequence = [
      evaluation.bestProvider,
      ...context.providers.filter((p: string) => p !== evaluation.bestProvider).slice(0, 2),
    ];

    return {
      nextStep,
      potentialRisks,
      bestSequence,
    };
  }

  /**
   * 4. Décision: Choisir et agir
   */
  private decide(
    projection: CognitiveProcess['projection'],
    _context: any
  ): {
    provider: string;
    reason: string;
    confidence: number;
    alternatives: string[];
    adaptations: string[];
  } {
    const provider = projection.bestSequence[0];
    const reason = this.determineReason(provider, projection);
    const confidence = this.calculateConfidence(provider, projection);
    const alternatives = projection.bestSequence.slice(1);
    const adaptations = this.suggestAdaptations(projection);

    return {
      provider,
      reason,
      confidence,
      alternatives,
      adaptations,
    };
  }

  /**
   * Déterminer la raison du choix
   */
  private determineReason(provider: string, projection: CognitiveProcess['projection']): string {
    if (projection.potentialRisks.length > 0) {
      return 'Sélection conservatrice (risques détectés)';
    }
    if (this.ephemeralMemory.lastEffectiveProviders[0] === provider) {
      return 'Continuité cognitive (dernier provider efficace)';
    }
    return 'Sélection optimale (scoring neural)';
  }

  /**
   * Calculer le niveau de confiance
   */
  private calculateConfidence(provider: string, projection: CognitiveProcess['projection']): number {
    const health = this.environmentState.providerHealth.get(provider) || 50;
    const riskPenalty = projection.potentialRisks.length * 10;
    return Math.max(0, Math.min(100, health - riskPenalty));
  }

  /**
   * Suggérer des adaptations
   */
  private suggestAdaptations(projection: CognitiveProcess['projection']): string[] {
    const adaptations = [];

    if (projection.potentialRisks.includes('high-latency')) {
      adaptations.push('Réduire timeout requests');
    }
    if (projection.potentialRisks.includes('chat-instability')) {
      adaptations.push('Activer fallback conservateur');
    }
    if (projection.nextStep === 'optimize-fallback') {
      adaptations.push('Optimiser cascade fallback');
    }

    return adaptations;
  }

  /**
   * Calculer le score de cohérence
   */
  private calculateCoherenceScore(): number {
    const principleScore = Object.values(this.principles).reduce((sum, val) => sum + val, 0) / 6;
    const environmentScore = this.environmentState.chatStability;
    return (principleScore + environmentScore) / 2;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE D: COHÉRENCE COGNITIVE TRANSVERSALE
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Harmoniser les messages du chat
   */
  harmonizeChatMessages(messages: any[]): any[] {
    return messages.map((msg) => ({
      ...msg,
      // Structure uniforme
      role: msg.role || 'user',
      content: this.enhanceMessageClarity(msg.content),
      timestamp: msg.timestamp || Date.now(),
      // Métadonnées cohérentes
      metadata: {
        ...msg.metadata,
        structured: true,
        coherenceScore: this.calculateCoherenceScore(),
      },
    }));
  }

  /**
   * Améliorer la clarté d'un message
   */
  private enhanceMessageClarity(content: string): string {
    // Nettoyer les structures incohérentes
    let enhanced = content.trim();

    // Uniformiser les sauts de ligne
    enhanced = enhanced.replace(/\n{3,}/g, '\n\n');

    // Assurer ponctuation correcte
    if (enhanced.length > 0 && !enhanced.match(/[.!?]$/)) {
      enhanced += '.';
    }

    return enhanced;
  }

  /**
   * Harmoniser les erreurs
   */
  harmonizeError(error: any): {
    message: string;
    type: string;
    recovery: string;
    userFriendly: boolean;
  } {
    const errorType = this.classifyError(error);

    return {
      message: this.makeErrorUserFriendly(error.message || String(error)),
      type: errorType,
      recovery: this.suggestRecovery(errorType),
      userFriendly: true,
    };
  }

  /**
   * Classifier une erreur
   */
  private classifyError(error: any): string {
    const message = String(error.message || error).toLowerCase();

    if (message.includes('timeout')) return 'timeout';
    if (message.includes('network')) return 'network';
    if (message.includes('api') || message.includes('key')) return 'auth';
    if (message.includes('rate')) return 'rate-limit';

    return 'unknown';
  }

  /**
   * Rendre une erreur compréhensible
   */
  private makeErrorUserFriendly(message: string): string {
    // Simplifier les erreurs techniques
    if (message.includes('ECONNREFUSED')) {
      return 'Impossible de se connecter au service';
    }
    if (message.includes('401') || message.includes('403')) {
      return 'Erreur d\'authentification (vérifier clé API)';
    }
    if (message.includes('429')) {
      return 'Limite de taux atteinte (réessayer dans quelques instants)';
    }

    return message;
  }

  /**
   * Suggérer une stratégie de récupération
   */
  private suggestRecovery(errorType: string): string {
    const recoveryMap: Record<string, string> = {
      timeout: 'Réessayer avec timeout plus long',
      network: 'Vérifier connexion internet',
      auth: 'Vérifier clés API dans Governance',
      'rate-limit': 'Attendre avant réessai',
      unknown: 'Utiliser fallback provider',
    };

    return recoveryMap[errorType] || recoveryMap.unknown;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE E: AUTO-OPTIMISATION COGNITIVE
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Mettre à jour les préférences de providers
   */
  updateProviderPreferences(provider: string, success: boolean, latency: number): void {
    // Mettre à jour la santé du provider
    const currentHealth = this.environmentState.providerHealth.get(provider) || 50;
    const healthChange = success ? 5 : -10;
    const latencyPenalty = latency > 3000 ? -5 : 0;
    const newHealth = Math.max(0, Math.min(100, currentHealth + healthChange + latencyPenalty));

    this.environmentState.providerHealth.set(provider, newHealth);

    // Enregistrer dans la mémoire
    if (success) {
      this.recordInMemory('provider', { provider });
    }

    // Adaptation cognitive
    this.recordInMemory('adaptation', {
      type: 'provider-preference',
      impact: Math.abs(healthChange),
    });
  }

  /**
   * Simplifier automatiquement
   */
  autoSimplify(): string[] {
    const simplifications = [];

    // Nettoyer patterns d'erreurs anciens (> 1h)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.ephemeralMemory.recentAdaptations = this.ephemeralMemory.recentAdaptations.filter(
      (a) => a.timestamp > oneHourAgo
    );

    if (this.ephemeralMemory.recentAdaptations.length < 5) {
      simplifications.push('Nettoyage mémoire adaptations anciennes');
    }

    // Réduire les providers avec santé < 10
    const unhealthyProviders = Array.from(this.environmentState.providerHealth.entries())
      .filter(([_, health]) => health < 10)
      .map(([provider]) => provider);

    if (unhealthyProviders.length > 0) {
      simplifications.push(`Désactivation temporaire: ${unhealthyProviders.join(', ')}`);
    }

    return simplifications;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE F: VALIDATION COGNITIVE
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Valider la santé cognitive du système
   */
  validateCognitiveHealth(): {
    thinking: boolean;
    behaving: boolean;
    stable: boolean;
    issues: string[];
  } {
    const issues = [];

    // Vérifier cohérence globale
    const coherenceScore = this.calculateCoherenceScore();
    if (coherenceScore < 70) {
      issues.push('Cohérence globale faible');
    }

    // Vérifier stratégie orchestration
    const hasHealthyProvider = Array.from(this.environmentState.providerHealth.values()).some(
      (h) => h > 50
    );
    if (!hasHealthyProvider) {
      issues.push('Aucun provider en bonne santé');
    }

    // Vérifier adaptation aux erreurs
    if (this.environmentState.errorFrequency > 10) {
      issues.push('Fréquence erreurs trop élevée');
    }

    return {
      thinking: coherenceScore > 70,
      behaving: hasHealthyProvider,
      stable: this.environmentState.errorFrequency < 5,
      issues,
    };
  }

  /**
   * Obtenir un rapport cognitif complet
   */
  getCognitiveReport(): {
    principles: CognitivePrinciples;
    environment: EnvironmentState;
    intention: IntentionState;
    memory: {
      recentProviders: string[];
      errorPatterns: number;
      adaptations: number;
    };
    health: ReturnType<typeof this.validateCognitiveHealth>;
    coherenceScore: number;
  } {
    return {
      principles: this.getPrinciples(),
      environment: { ...this.environmentState },
      intention: { ...this.intentionState },
      memory: {
        recentProviders: this.ephemeralMemory.lastEffectiveProviders,
        errorPatterns: this.ephemeralMemory.recentErrorPatterns.size,
        adaptations: this.ephemeralMemory.recentAdaptations.length,
      },
      health: this.validateCognitiveHealth(),
      coherenceScore: this.calculateCoherenceScore(),
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const cognitiveKernel = new CognitiveKernel();

// Auto-initialisation
cognitiveKernel.initialize();
