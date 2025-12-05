/**
 * TITANE∞ vΩ∞ — MULTIMODAL FUSION ENGINE
 * OPUS v∞.3: Vision + Voice + Text Fusion
 *
 * Combine les signaux de 3 modalités pour créer un état émotionnel
 * unifié et robuste. Poids dynamiques ajustés selon la qualité du signal.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                    MultimodalFusionEngine                          │
 * │  ┌───────────┐  ┌───────────┐  ┌───────────┐                      │
 * │  │  Vision   │  │   Voice   │  │   Text    │                      │
 * │  │ (0.4)     │  │  (0.3)    │  │  (0.3)    │                      │
 * │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘                      │
 * │        │              │              │                             │
 * │        └──────────────┼──────────────┘                             │
 * │                       ▼                                            │
 * │              ┌─────────────┐                                       │
 * │              │ FUSION      │ ← Weighted Average                    │
 * │              │ ENGINE      │ ← Signal Quality Check                │
 * │              │             │ ← Temporal Smoothing                  │
 * │              └─────┬───────┘                                       │
 * │                    ▼                                               │
 * │              MultimodalState                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES:
 * - Indices uniquement, pas de diagnostic
 * - 100% local, aucune donnée transmise
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  MultimodalState,
  BaselineFusionProfile,
  ModalityWeights,
  VoiceState,
  TextState,
  VisionModalityState,
  FusedScores,
  NormalizedScore,
  ModalityLevel,
  CorrelationMatrix,
} from '@/types/multimodalFusion';

import {
  getDefaultBaselineFusionProfile,
  getDefaultModalityWeights,
  MULTIMODAL_FUSION_CONFIG,
} from '@/types/multimodalFusion';

import { VoiceAnalysisEngine } from './VoiceAnalysisEngine';
import { TextAnalysisEngine } from './TextAnalysisEngine';

// ============================================================================
// CONFIGURATION
// ============================================================================

const FUSION_CONFIG = {
  emaAlpha: 0.2,
  minConfidenceThreshold: 0.3,
  fusionIntervalMs: 100, // 10 FPS
  maxHistorySize: 200
};

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface ModalityInput {
  vision: VisionModalityState | null;
  voice: VoiceState | null;
  text: TextState | null;
}

interface FusionHistoryEntry {
  timestamp: number;
  state: MultimodalState;
}

// ============================================================================
// MULTIMODAL FUSION ENGINE
// ============================================================================

/**
 * Moteur singleton de fusion multimodal
 * Combine Vision + Voice + Text en un état unifié
 */
class MultimodalFusionEngine {
  private static instance: MultimodalFusionEngine | null = null;

  // Sous-moteurs
  private voiceEngine: VoiceAnalysisEngine;
  private textEngine: TextAnalysisEngine;

  // Configuration
  private weights: ModalityWeights;
  private baseline: BaselineFusionProfile;

  // État
  private isRunning: boolean = false;
  private lastState: MultimodalState | null = null;
  private history: FusionHistoryEntry[] = [];

  // Timer
  private fusionInterval: ReturnType<typeof setInterval> | null = null;

  // Callback externe pour recevoir les scores vision
  private visionCallback: (() => VisionModalityState | null) | null = null;

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  private constructor() {
    this.voiceEngine = VoiceAnalysisEngine.getInstance();
    this.textEngine = TextAnalysisEngine.getInstance();

    this.weights = getDefaultModalityWeights();
    this.baseline = getDefaultBaselineFusionProfile();
  }

  public static getInstance(): MultimodalFusionEngine {
    if (!MultimodalFusionEngine.instance) {
      MultimodalFusionEngine.instance = new MultimodalFusionEngine();
    }
    return MultimodalFusionEngine.instance;
  }

  public static resetInstance(): void {
    if (MultimodalFusionEngine.instance) {
      MultimodalFusionEngine.instance.stop();
    }
    MultimodalFusionEngine.instance = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CYCLE DE VIE
  // ═══════════════════════════════════════════════════════════════════════

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('[MultimodalFusionEngine] Déjà en cours d\'exécution');
      return;
    }

    console.log('[MultimodalFusionEngine] Démarrage...');

    // Démarrer les sous-moteurs
    await this.voiceEngine.initialize();
    this.voiceEngine.startAnalysis();
    this.textEngine.startAnalysis();

    // Démarrer la boucle de fusion
    this.fusionInterval = setInterval(() => {
      this.fusionLoop();
    }, FUSION_CONFIG.fusionIntervalMs);

    this.isRunning = true;
    console.log('[MultimodalFusionEngine] Démarré avec succès');
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('[MultimodalFusionEngine] Arrêt...');

    if (this.fusionInterval) {
      clearInterval(this.fusionInterval);
      this.fusionInterval = null;
    }

    this.voiceEngine.stopAnalysis();
    this.textEngine.stopAnalysis();

    this.isRunning = false;
    console.log('[MultimodalFusionEngine] Arrêté');
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════

  public setVisionCallback(callback: () => VisionModalityState | null): void {
    this.visionCallback = callback;
  }

  public feedText(text: string): void {
    this.textEngine.analyzeText(text);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ÉTAT
  // ═══════════════════════════════════════════════════════════════════════

  public getLastFusedState(): MultimodalState | null {
    return this.lastState;
  }

  public getWeights(): ModalityWeights {
    return { ...this.weights };
  }

  public setWeights(weights: Partial<ModalityWeights>): void {
    this.weights = {
      ...this.weights,
      ...weights
    };
    this.normalizeWeights();
    console.log('[MultimodalFusionEngine] Poids mis à jour:', this.weights);
  }

  public getBaseline(): BaselineFusionProfile {
    return { ...this.baseline };
  }

  public getCorrelationMatrix(): CorrelationMatrix {
    return { ...this.baseline.multimodalCorrelationMatrix };
  }

  public getHistory(): FusionHistoryEntry[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
    this.lastState = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BOUCLE DE FUSION
  // ═══════════════════════════════════════════════════════════════════════

  private fusionLoop(): void {
    const inputs = this.collectInputs();

    // Vérifier si au moins une modalité a des données
    if (!inputs.vision && !inputs.voice && !inputs.text) {
      return;
    }

    // Calculer les poids dynamiques basés sur la confiance
    const dynamicWeights = this.computeDynamicWeights(inputs);

    // Fusionner les états
    const fusedState = this.fuse(inputs, dynamicWeights);

    // Lisser avec EMA si précédent existe
    if (this.lastState) {
      this.lastState = this.applyTemporalSmoothing(this.lastState, fusedState);
    } else {
      this.lastState = fusedState;
    }

    // Enregistrer dans l'historique
    this.recordHistory(this.lastState);
  }

  private collectInputs(): ModalityInput {
    return {
      vision: this.visionCallback ? this.visionCallback() : null,
      voice: this.voiceEngine.getCurrentState(),
      text: this.textEngine.getLastState()
    };
  }

  private computeDynamicWeights(inputs: ModalityInput): ModalityWeights {
    const threshold = FUSION_CONFIG.minConfidenceThreshold;

    const visionConf = inputs.vision?.confidence ?? 0;
    const voiceConf = inputs.voice?.confidence ?? 0;
    const textConf = inputs.text?.confidence ?? 0;

    const visionW = visionConf >= threshold ? this.weights.vision * visionConf : 0;
    const voiceW = voiceConf >= threshold ? this.weights.voice * voiceConf : 0;
    const textW = textConf >= threshold ? this.weights.text * textConf : 0;

    const total = visionW + voiceW + textW;

    if (total === 0) {
      return { ...this.weights };
    }

    return {
      vision: visionW / total,
      voice: voiceW / total,
      text: textW / total
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ALGORITHME DE FUSION
  // ═══════════════════════════════════════════════════════════════════════

  private fuse(inputs: ModalityInput, weights: ModalityWeights): MultimodalState {
    const now = Date.now();

    // Extraire les valeurs de chaque modalité
    const visionEnergy = inputs.vision?.v_energy.value ?? 0.5;
    const visionTension = inputs.vision?.v_tension.value ?? 0.5;
    const visionEngagement = inputs.vision?.v_engagement.value ?? 0.5;
    const visionStability = inputs.vision?.v_stability.value ?? 0.5;

    const voiceEnergy = inputs.voice?.scores.a_energy.value ?? 0.5;
    const voiceTension = inputs.voice?.scores.a_tension.value ?? 0.5;
    const voiceStability = inputs.voice?.scores.a_stability.value ?? 0.5;

    const textEnergy = inputs.text?.scores.t_energy.value ?? 0.5;
    const textCharge = inputs.text?.scores.t_charge.value ?? 0.5;
    const textEngagement = inputs.text?.scores.t_engagement_verbal.value ?? 0.5;
    const textClarity = inputs.text?.scores.t_clarity.value ?? 0.5;

    // Fusion pondérée
    const fusedEnergy = this.weightedAverage(
      [visionEnergy, voiceEnergy, textEnergy],
      [weights.vision, weights.voice, weights.text]
    );

    const fusedTension = this.weightedAverage(
      [visionTension, voiceTension, textCharge],
      [weights.vision, weights.voice, weights.text]
    );

    const fusedEngagement = this.weightedAverage(
      [visionEngagement, voiceStability, textEngagement],
      [weights.vision, weights.voice, weights.text]
    );

    const fusedStability = this.weightedAverage(
      [visionStability, voiceStability, textClarity],
      [weights.vision, weights.voice, weights.text]
    );

    // Confiance globale
    const overallConfidence = this.weightedAverage(
      [inputs.vision?.confidence ?? 0, inputs.voice?.confidence ?? 0, inputs.text?.confidence ?? 0],
      [weights.vision, weights.voice, weights.text]
    );

    // Corriger par rapport au baseline
    const energyDeviation = fusedEnergy - this.baseline.globalEnergyCurve.hourlyMeans[new Date().getHours()];
    const tensionDeviation = fusedTension - this.baseline.globalTensionCurve.hourlyMeans[new Date().getHours()];

    // Construire les scores fusionnés
    const fusedScores: FusedScores = {
      globalEnergy: this.createNormalizedScore(fusedEnergy, overallConfidence, now),
      globalTension: this.createNormalizedScore(fusedTension, overallConfidence, now),
      globalEngagement: this.createNormalizedScore(fusedEngagement, overallConfidence, now),
      globalStability: this.createNormalizedScore(fusedStability, overallConfidence, now),
      correctedEnergy: fusedEnergy + energyDeviation * 0.5,
      correctedTension: fusedTension + tensionDeviation * 0.5,
      correctedEngagement: fusedEngagement
    };

    // Déterminer les modalités actives
    const activeModalities: ('vision' | 'voice' | 'text' | 'fusion')[] = [];
    if (inputs.vision) activeModalities.push('vision');
    if (inputs.voice) activeModalities.push('voice');
    if (inputs.text) activeModalities.push('text');

    return {
      visionState: inputs.vision,
      voiceState: inputs.voice,
      textState: inputs.text,
      fusedScores,
      globalEnergyLevel: this.toLevel(fusedEnergy),
      globalTensionLevel: this.toLevel(fusedTension),
      globalEngagementLevel: this.toLevel(fusedEngagement),
      globalStabilityLevel: this.toLevel(fusedStability),
      appliedWeights: weights,
      overallConfidence,
      activeModalities,
      timestamp: now,
      baselineDeviation: {
        energyDeviation,
        tensionDeviation,
        engagementDeviation: 0,
        isSignificant: Math.abs(energyDeviation) > 0.2 || Math.abs(tensionDeviation) > 0.2,
        description: this.describeDeviation(energyDeviation, tensionDeviation)
      }
    };
  }

  private createNormalizedScore(value: number, confidence: number, timestamp: number): NormalizedScore {
    return {
      value,
      confidence,
      variance: 0,
      origin: 'fusion',
      timestamp
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LISSAGE TEMPOREL
  // ═══════════════════════════════════════════════════════════════════════

  private applyTemporalSmoothing(previous: MultimodalState, current: MultimodalState): MultimodalState {
    const alpha = FUSION_CONFIG.emaAlpha;
    const blend = (prev: number, curr: number) => alpha * curr + (1 - alpha) * prev;

    return {
      ...current,
      fusedScores: {
        ...current.fusedScores,
        globalEnergy: {
          ...current.fusedScores.globalEnergy,
          value: blend(previous.fusedScores.globalEnergy.value, current.fusedScores.globalEnergy.value)
        },
        globalTension: {
          ...current.fusedScores.globalTension,
          value: blend(previous.fusedScores.globalTension.value, current.fusedScores.globalTension.value)
        },
        globalEngagement: {
          ...current.fusedScores.globalEngagement,
          value: blend(previous.fusedScores.globalEngagement.value, current.fusedScores.globalEngagement.value)
        },
        globalStability: {
          ...current.fusedScores.globalStability,
          value: blend(previous.fusedScores.globalStability.value, current.fusedScores.globalStability.value)
        }
      },
      overallConfidence: blend(previous.overallConfidence, current.overallConfidence)
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HISTORIQUE
  // ═══════════════════════════════════════════════════════════════════════

  private recordHistory(state: MultimodalState): void {
    this.history.push({
      timestamp: Date.now(),
      state
    });

    if (this.history.length > FUSION_CONFIG.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Calibre le baseline à partir de l'historique
   */
  public calibrateBaseline(): BaselineFusionProfile {
    if (this.history.length < 20) {
      console.warn('[MultimodalFusionEngine] Historique insuffisant pour calibration');
      return this.baseline;
    }

    const recent = this.history.slice(-50);
    const energies = recent.map(h => h.state.fusedScores.globalEnergy.value);
    const tensions = recent.map(h => h.state.fusedScores.globalTension.value);

    // Mettre à jour les courbes horaires
    const hour = new Date().getHours();
    this.baseline.globalEnergyCurve.hourlyMeans[hour] = this.mean(energies);
    this.baseline.globalTensionCurve.hourlyMeans[hour] = this.mean(tensions);
    this.baseline.globalEnergyCurve.samplesPerHour[hour] += recent.length;
    this.baseline.globalTensionCurve.samplesPerHour[hour] += recent.length;

    this.baseline.totalSamplesCount += recent.length;
    this.baseline.lastUpdated = Date.now();
    this.baseline.isCalibrated = this.baseline.totalSamplesCount > 100;

    console.log('[MultimodalFusionEngine] Baseline calibré');
    return this.baseline;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITAIRES
  // ═══════════════════════════════════════════════════════════════════════

  private weightedAverage(values: number[], weights: number[]): number {
    let sum = 0;
    let weightSum = 0;

    for (let i = 0; i < values.length; i++) {
      sum += values[i] * weights[i];
      weightSum += weights[i];
    }

    return weightSum > 0 ? sum / weightSum : 0.5;
  }

  private mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private normalizeWeights(): void {
    const total = this.weights.vision + this.weights.voice + this.weights.text;
    if (total > 0) {
      this.weights.vision /= total;
      this.weights.voice /= total;
      this.weights.text /= total;
    }
  }

  private toLevel(value: number): ModalityLevel {
    if (value < MULTIMODAL_FUSION_CONFIG.thresholds.lowThreshold) return 'low';
    if (value > MULTIMODAL_FUSION_CONFIG.thresholds.highThreshold) return 'high';
    return 'medium';
  }

  private describeDeviation(energyDev: number, tensionDev: number): string {
    const parts: string[] = [];

    if (Math.abs(energyDev) > 0.2) {
      parts.push(energyDev > 0 ? 'énergie au-dessus du baseline' : 'énergie en-dessous du baseline');
    }
    if (Math.abs(tensionDev) > 0.2) {
      parts.push(tensionDev > 0 ? 'tension au-dessus du baseline' : 'tension en-dessous du baseline');
    }

    return parts.length > 0 ? parts.join(', ') : 'dans la norme';
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export { MultimodalFusionEngine };
export default MultimodalFusionEngine;
