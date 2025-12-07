/**
 * TITANE_INFINITY v∞.35 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ PREDICTIVE REFLECTION ENGINE v∞.LII
 *   Anticipation · Adaptation · Predictive Cognition
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce moteur prédit :
 * - L'intention utilisateur avant qu'elle ne soit formulée
 * - L'évolution émotionnelle et énergétique
 * - Les besoins dans les prochaines secondes
 * - Les ajustements nécessaires (voix, aura, spatial, rythme)
 * - La cohérence interne de TITANE∞
 * - Les dérives ou tensions avant qu'elles n'impactent l'expérience
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Besoin prédit de l'utilisateur
 */
export type PredictedNeed =
  | 'clarity' // Clarté, structure
  | 'support' // Soutien émotionnel
  | 'focus' // Concentration, guidage
  | 'silence' // Espace, respiration
  | 'exploration' // Ouverture, créativité
  | 'calm' // Apaisement, ralentissement
  | 'invitation'; // Engagement, interaction

/**
 * Direction prédite de la conversation
 */
export type ConversationDirection =
  | 'neutral' // Maintien du cours
  | 'deepening' // Approfondissement
  | 'pivoting' // Changement de direction
  | 'concluding' // Conclusion
  | 'exploring'; // Exploration ouverte

/**
 * Intention prédite de l'utilisateur
 */
export type PredictedIntent =
  | 'none' // Pas d'intention claire
  | 'express' // Besoin d'expression
  | 'support' // Besoin de soutien
  | 'engage' // Besoin d'engagement
  | 'continue' // Continue la discussion
  | 'question' // Pose une question
  | 'reflect'; // Réflexion partagée

/**
 * État émotionnel prédit
 */
export interface PredictedEmotion {
  valence: number; // -1 (négatif) → 0 (neutre) → 1 (positif)
  arousal: number; // 0 (calme) → 1 (excité)
}

/**
 * Prédictions sur l'état interne de TITANE∞
 */
export interface TitaneSelfPrediction {
  internalCoherenceDrift: number; // 0..1 - Dérive de cohérence
  cognitiveLoadTrajectory: number; // -1..1 - Tendance de charge cognitive
  emotionalTrajectory: number; // -1..1 - Tendance émotionnelle
  stabilityForecast: number; // 0..1 - Prévision de stabilité
}

/**
 * Ajustements recommandés pour les autres moteurs
 */
export interface RecommendedAdjustments {
  toneShift: number; // -1..1 - Changement de ton vocal
  auraShift: number; // -1..1 - Changement d'intensité aura
  haloShift: number; // -1..1 - Changement d'intensité halo
  narrativeShift: number; // -1..1 - Changement de style narratif
  rhythmShift: number; // -1..1 - Changement de tempo
}

/**
 * État complet de la frame prédictive
 */
export interface PredictiveFrame {
  // Prédictions utilisateur
  predictedUserIntent: PredictedIntent;
  predictedUserEmotion: PredictedEmotion;
  predictedEngagement: number; // 0..1
  predictedConversationDirection: ConversationDirection;
  predictedNeed: PredictedNeed;

  // Auto-prédictions TITANE∞
  titaneSelfPrediction: TitaneSelfPrediction;

  // Ajustements recommandés
  recommendedAdjustments: RecommendedAdjustments;

  // Métadonnées
  timestamp: number;
  confidence: number; // 0..1 - Confiance dans les prédictions
}

/**
 * Contexte perceptuel simplifié (pour éviter dépendances circulaires)
 */
export interface PerceptualContext {
  userPresence: number; // 0..1
  userEmotionalEstimate: {
    valence: number;
    arousal: number;
  };
  attentionFocus: 'user' | 'content' | 'none';
  voiceEnergy: number; // 0..1
  voicePitch: number; // Hz
  voiceTempo: number; // Multiplier 0.5..2
  silenceDuration: number; // ms
}

/**
 * Contexte nerveux/interne simplifié
 */
export interface NervousContext {
  tensionMap: Record<string, number>;
  cognitiveDrift: number; // -1..1
  noiseLevel: number; // 0..1
}

// ═══════════════════════════════════════════════════════════════════════════
// PREDICTIVE REFLECTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class PredictiveReflectionEngine {
  private state: PredictiveFrame;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: ((state: PredictiveFrame) => void)[] = [];

  // Historique court terme pour prédictions
  private emotionHistory: PredictedEmotion[] = [];
  private engagementHistory: number[] = [];
  private readonly HISTORY_SIZE = 50; // 2.5s à 20Hz

  constructor() {
    this.state = this.getDefaultState();
    console.log('🔮 [PREDICTIVE] Initializing Predictive Reflection Engine...');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ───────────────────────────────────────────────────────────────────────────

  start(): void {
    if (this.updateInterval) return;

    console.log('🔮 [PREDICTIVE] Starting prediction engine at 20Hz...');
    this.updateInterval = setInterval(() => this.tick(), 50); // 20 Hz
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🔮 [PREDICTIVE] Prediction engine stopped.');
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE LOOP
  // ───────────────────────────────────────────────────────────────────────────

  private tick(): void {
    // Note: Les moteurs perceptual et nervous n'existent pas encore
    // On simule avec des données par défaut pour l'instant
    const perceptualContext = this.getSimulatedPerceptualContext();
    const nervousContext = this.getSimulatedNervousContext();

    this.state = this.computePrediction(perceptualContext, nervousContext);
    this.notifySubscribers();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // COMPUTATION PRINCIPALE
  // ───────────────────────────────────────────────────────────────────────────

  private computePrediction(
    percept: PerceptualContext,
    nervous: NervousContext
  ): PredictiveFrame {
    // 1. Prédire émotion utilisateur
    const predictedUserEmotion = this.predictEmotion(percept);

    // 2. Prédire intention utilisateur
    const predictedUserIntent = this.predictIntent(percept);

    // 3. Prédire engagement
    const predictedEngagement = this.predictEngagement(percept);

    // 4. Prédire besoin
    const predictedNeed = this.predictNeed(predictedUserEmotion, percept);

    // 5. Prédire direction conversation
    const predictedConversationDirection = this.predictDirection(
      predictedUserIntent,
      predictedEngagement
    );

    // 6. Auto-prédictions TITANE∞
    const titaneSelfPrediction = this.predictSelfState(nervous);

    // 7. Ajustements recommandés
    const recommendedAdjustments = this.computeAdjustments(predictedNeed);

    // 8. Calculer confiance
    const confidence = this.calculateConfidence(percept);

    return {
      predictedUserIntent,
      predictedUserEmotion,
      predictedEngagement,
      predictedConversationDirection,
      predictedNeed,
      titaneSelfPrediction,
      recommendedAdjustments,
      timestamp: Date.now(),
      confidence,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRÉDICTION ÉMOTION
  // ───────────────────────────────────────────────────────────────────────────

  private predictEmotion(percept: PerceptualContext): PredictedEmotion {
    // Extrapolation linéaire basée sur tendance récente
    const current = percept.userEmotionalEstimate;

    // Si historique suffisant, calculer tendance
    if (this.emotionHistory.length > 5) {
      const recent = this.emotionHistory.slice(-5);
      const valenceTrend = this.calculateTrend(recent.map(e => e.valence));
      const arousalTrend = this.calculateTrend(recent.map(e => e.arousal));

      return {
        valence: this.clamp(current.valence + valenceTrend * 0.3, -1, 1),
        arousal: this.clamp(current.arousal + arousalTrend * 0.3, 0, 1),
      };
    }

    // Sinon, légère atténuation vers neutre
    return {
      valence: current.valence * 0.9,
      arousal: current.arousal * 0.95,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRÉDICTION INTENTION
  // ───────────────────────────────────────────────────────────────────────────

  private predictIntent(percept: PerceptualContext): PredictedIntent {
    // Aucune présence → pas d'intention
    if (percept.userPresence < 0.2) return 'none';

    // Haute excitation → besoin d'expression
    if (percept.userEmotionalEstimate.arousal > 0.7) return 'express';

    // Valence négative → besoin de soutien
    if (percept.userEmotionalEstimate.valence < -0.3) return 'support';

    // Focus sur utilisateur → engagement
    if (percept.attentionFocus === 'user') return 'engage';

    // Tempo lent + énergie faible → réflexion
    if (percept.voiceTempo < 0.8 && percept.voiceEnergy < 0.4) return 'reflect';

    // Défaut
    return 'continue';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRÉDICTION ENGAGEMENT
  // ───────────────────────────────────────────────────────────────────────────

  private predictEngagement(percept: PerceptualContext): number {
    // Moyenne mobile sur historique
    this.engagementHistory.push(percept.userPresence);
    if (this.engagementHistory.length > this.HISTORY_SIZE) {
      this.engagementHistory.shift();
    }

    const _current = percept.userPresence;
    const avg = this.average(this.engagementHistory);
    const trend = this.calculateTrend(this.engagementHistory.slice(-10));

    // Prédiction = moyenne pondérée (tendance + état actuel)
    return this.clamp(avg + trend * 0.5, 0, 1);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRÉDICTION BESOIN
  // ───────────────────────────────────────────────────────────────────────────

  private predictNeed(
    emotion: PredictedEmotion,
    percept: PerceptualContext
  ): PredictedNeed {
    // Haute excitation → calme
    if (emotion.arousal > 0.7) return 'calm';

    // Valence négative → soutien
    if (emotion.valence < -0.2) return 'support';

    // Faible présence → invitation
    if (percept.userPresence < 0.3) return 'invitation';

    // Silence long → espace
    if (percept.silenceDuration > 3000) return 'silence';

    // Énergie haute + valence positive → exploration
    if (percept.voiceEnergy > 0.7 && emotion.valence > 0.3) return 'exploration';

    // Focus intense → guidage
    if (percept.attentionFocus === 'content' && percept.userPresence > 0.7)
      return 'focus';

    // Défaut → clarté
    return 'clarity';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRÉDICTION DIRECTION
  // ───────────────────────────────────────────────────────────────────────────

  private predictDirection(
    intent: PredictedIntent,
    engagement: number
  ): ConversationDirection {
    // Engagement faible → conclusion potentielle
    if (engagement < 0.3) return 'concluding';

    // Engagement élevé + express → exploration
    if (engagement > 0.7 && intent === 'express') return 'exploring';

    // Support ou reflect → approfondissement
    if (intent === 'support' || intent === 'reflect') return 'deepening';

    // Engage → pivot potentiel
    if (intent === 'engage') return 'pivoting';

    // Défaut
    return 'neutral';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // AUTO-PRÉDICTION (État interne TITANE∞)
  // ───────────────────────────────────────────────────────────────────────────

  private predictSelfState(nervous: NervousContext): TitaneSelfPrediction {
    // Entropie = dérive de cohérence
    const internalCoherenceDrift = this.entropy(nervous.tensionMap);

    // Trajectoire de charge cognitive
    const cognitiveLoadTrajectory = nervous.cognitiveDrift;

    // Trajectoire émotionnelle (simulation basée sur émotion actuelle)
    // Note: emotional engine sera intégré plus tard
    const emotionalTrajectory = 0;

    // Prévision de stabilité = inverse du bruit
    const stabilityForecast = this.clamp(1 - nervous.noiseLevel, 0, 1);

    return {
      internalCoherenceDrift,
      cognitiveLoadTrajectory,
      emotionalTrajectory,
      stabilityForecast,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // AJUSTEMENTS RECOMMANDÉS
  // ───────────────────────────────────────────────────────────────────────────

  private computeAdjustments(need: PredictedNeed): RecommendedAdjustments {
    switch (need) {
      case 'calm':
        return {
          toneShift: -0.4,
          auraShift: -0.3,
          haloShift: -0.2,
          narrativeShift: -0.2,
          rhythmShift: -0.5,
        };

      case 'support':
        return {
          toneShift: -0.3,
          auraShift: 0.2,
          haloShift: 0.1,
          narrativeShift: 0.3,
          rhythmShift: -0.2,
        };

      case 'invitation':
        return {
          toneShift: 0.2,
          auraShift: 0.3,
          haloShift: 0.2,
          narrativeShift: 0.4,
          rhythmShift: 0.3,
        };

      case 'clarity':
        return {
          toneShift: 0,
          auraShift: 0.1,
          haloShift: 0.3,
          narrativeShift: 0.5,
          rhythmShift: 0,
        };

      case 'focus':
        return {
          toneShift: 0.1,
          auraShift: 0.2,
          haloShift: 0.4,
          narrativeShift: 0.3,
          rhythmShift: 0.1,
        };

      case 'silence':
        return {
          toneShift: -0.5,
          auraShift: -0.4,
          haloShift: -0.3,
          narrativeShift: -0.6,
          rhythmShift: -0.7,
        };

      case 'exploration':
        return {
          toneShift: 0.3,
          auraShift: 0.4,
          haloShift: 0.2,
          narrativeShift: 0.5,
          rhythmShift: 0.2,
        };

      default:
        return {
          toneShift: 0,
          auraShift: 0,
          haloShift: 0,
          narrativeShift: 0,
          rhythmShift: 0,
        };
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CALCUL DE CONFIANCE
  // ───────────────────────────────────────────────────────────────────────────

  private calculateConfidence(percept: PerceptualContext): number {
    // Confiance basée sur qualité des signaux
    let confidence = 0.5;

    // Présence claire → confiance haute
    if (percept.userPresence > 0.7) confidence += 0.2;
    else if (percept.userPresence < 0.3) confidence -= 0.2;

    // Énergie vocale stable → confiance haute
    if (percept.voiceEnergy > 0.3 && percept.voiceEnergy < 0.8) confidence += 0.1;

    // Historique suffisant → confiance haute
    if (this.emotionHistory.length > 20) confidence += 0.15;

    return this.clamp(confidence, 0, 1);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UTILITAIRES
  // ───────────────────────────────────────────────────────────────────────────

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Régression linéaire simple
    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private entropy(values: Record<string, number> | null): number {
    if (!values) return 0;
    const arr = Object.values(values);
    if (arr.length === 0) return 0;
    return arr.reduce((acc, v) => acc + Math.abs(v), 0) / arr.length;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SIMULATION (temporaire jusqu'à intégration réelle)
  // ───────────────────────────────────────────────────────────────────────────

  private getSimulatedPerceptualContext(): PerceptualContext {
    return {
      userPresence: 0.7 + Math.random() * 0.2,
      userEmotionalEstimate: {
        valence: (Math.random() - 0.5) * 0.4,
        arousal: 0.3 + Math.random() * 0.3,
      },
      attentionFocus: Math.random() > 0.5 ? 'user' : 'content',
      voiceEnergy: 0.4 + Math.random() * 0.3,
      voicePitch: 150 + Math.random() * 50,
      voiceTempo: 0.9 + Math.random() * 0.2,
      silenceDuration: Math.random() * 2000,
    };
  }

  private getSimulatedNervousContext(): NervousContext {
    return {
      tensionMap: {
        cognitive: Math.random() * 0.2,
        emotional: Math.random() * 0.2,
        motor: Math.random() * 0.1,
      },
      cognitiveDrift: (Math.random() - 0.5) * 0.2,
      noiseLevel: 0.1 + Math.random() * 0.1,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ÉTAT PAR DÉFAUT
  // ───────────────────────────────────────────────────────────────────────────

  private getDefaultState(): PredictiveFrame {
    return {
      predictedUserIntent: 'none',
      predictedUserEmotion: { valence: 0, arousal: 0 },
      predictedEngagement: 0.5,
      predictedConversationDirection: 'neutral',
      predictedNeed: 'clarity',
      titaneSelfPrediction: {
        internalCoherenceDrift: 0,
        cognitiveLoadTrajectory: 0,
        emotionalTrajectory: 0,
        stabilityForecast: 1,
      },
      recommendedAdjustments: {
        toneShift: 0,
        auraShift: 0,
        haloShift: 0,
        narrativeShift: 0,
        rhythmShift: 0,
      },
      timestamp: Date.now(),
      confidence: 0.5,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // API PUBLIQUE
  // ───────────────────────────────────────────────────────────────────────────

  getState(): PredictiveFrame {
    return { ...this.state };
  }

  /**
   * Applique un contexte perceptuel externe (quand disponible)
   */
  applyPerceptualContext(context: Partial<PerceptualContext>): void {
    const simulated = this.getSimulatedPerceptualContext();
    const merged = { ...simulated, ...context };
    const nervous = this.getSimulatedNervousContext();

    this.state = this.computePrediction(merged, nervous);
    this.notifySubscribers();
  }

  /**
   * Applique un contexte nerveux externe (quand disponible)
   */
  applyNervousContext(context: Partial<NervousContext>): void {
    const percept = this.getSimulatedPerceptualContext();
    const simulated = this.getSimulatedNervousContext();
    const merged = { ...simulated, ...context };

    this.state = this.computePrediction(percept, merged);
    this.notifySubscribers();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION
  // ───────────────────────────────────────────────────────────────────────────

  subscribe(callback: (state: PredictiveFrame) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const predictiveReflectionEngine = new PredictiveReflectionEngine();
