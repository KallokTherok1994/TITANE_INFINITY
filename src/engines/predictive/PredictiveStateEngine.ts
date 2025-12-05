/**
 * TITANE∞ vΩ∞ — PREDICTIVE STATE ENGINE
 * OPUS v∞.4: Détection proactive + Prévisions + Divergences d'état
 *
 * Ce moteur analyse l'évolution temporelle de l'état multimodal,
 * détecte les tendances, prévoit les variations et signale les ruptures.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                    PredictiveStateEngine                            │
 * │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
 * │  │ History   │  │  Trend    │  │ Forecast  │  │  Pattern  │       │
 * │  │ Buffer    │  │ Analyzer  │  │ Engine    │  │ Detector  │       │
 * │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘       │
 * │        │              │              │              │              │
 * │        └──────────────┴──────────────┴──────────────┘              │
 * │                             │                                       │
 * │                             ▼                                       │
 * │                    PredictiveState                                  │
 * │                    (energyTrend, forecasts, patterns)               │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES:
 * - Prévisions probabilistes, jamais de certitude
 * - Toujours explicable
 * - Suggestions douces, pas d'alarmes
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  PredictiveState,
  PredictiveEngineConfig,
  TrendDirection,
  TrendAnalysis,
  DimensionForecast,
  PatternShiftDetection,
  PatternShiftType,
  HistoryDataPoint,
  ProactiveTrigger,
  PredictionConfidence,
} from '@/types/predictiveState';

import {
  getDefaultPredictiveState,
  getDefaultPredictiveEngineConfig,
  getDefaultTrendAnalysis,
  getDefaultDimensionForecast,
  PREDICTIVE_ENGINE_CONSTANTS,
} from '@/types/predictiveState';

import type { MultimodalState } from '@/types/multimodalFusion';
import type { BaselineFusionProfile } from '@/types/multimodalFusion';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ENGINE_CONFIG = {
  updateIntervalMs: 1000,        // Mise à jour toutes les secondes
  maxHistorySize: 500,           // Max 500 points d'historique
  minPointsForTrend: 5,          // Min 5 points pour calculer une tendance
  minPointsForForecast: 10,      // Min 10 points pour une prévision
} as const;

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
}

interface StateUpdateCallback {
  (state: PredictiveState): void;
}

// ============================================================================
// PREDICTIVE STATE ENGINE
// ============================================================================

/**
 * Moteur prédictif singleton
 * Analyse les tendances et prévoit les variations d'état
 */
class PredictiveStateEngine {
  private static instance: PredictiveStateEngine | null = null;

  // Configuration
  private config: PredictiveEngineConfig;

  // Historique des données
  private history: HistoryDataPoint[] = [];

  // État actuel
  private currentState: PredictiveState;
  private isRunning: boolean = false;

  // Timer
  private updateInterval: ReturnType<typeof setInterval> | null = null;

  // Callbacks
  private stateUpdateCallback: StateUpdateCallback | null = null;

  // Dernière alerte pour cooldown
  private lastTriggerTimestamp: number = 0;

  // Référence au baseline (injecté)
  private baseline: BaselineFusionProfile | null = null;

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  private constructor() {
    this.config = getDefaultPredictiveEngineConfig();
    this.currentState = getDefaultPredictiveState();
  }

  public static getInstance(): PredictiveStateEngine {
    if (!PredictiveStateEngine.instance) {
      PredictiveStateEngine.instance = new PredictiveStateEngine();
    }
    return PredictiveStateEngine.instance;
  }

  public static resetInstance(): void {
    if (PredictiveStateEngine.instance) {
      PredictiveStateEngine.instance.stop();
    }
    PredictiveStateEngine.instance = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CYCLE DE VIE
  // ═══════════════════════════════════════════════════════════════════════

  public start(): void {
    if (this.isRunning) {
      console.warn('[PredictiveStateEngine] Déjà en cours d\'exécution');
      return;
    }

    console.log('[PredictiveStateEngine] Démarrage...');
    this.isRunning = true;

    // Pas de timer automatique - mis à jour manuellement via processMultimodalState
  }

  public stop(): void {
    if (!this.isRunning) return;

    console.log('[PredictiveStateEngine] Arrêt...');
    this.isRunning = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public reset(): void {
    this.history = [];
    this.currentState = getDefaultPredictiveState();
    this.lastTriggerTimestamp = 0;
    console.log('[PredictiveStateEngine] État réinitialisé');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  public setConfig(config: Partial<PredictiveEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public setBaseline(baseline: BaselineFusionProfile): void {
    this.baseline = baseline;
  }

  public setStateUpdateCallback(callback: StateUpdateCallback): void {
    this.stateUpdateCallback = callback;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - TRAITEMENT
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Traite un nouvel état multimodal et met à jour les prédictions
   */
  public processMultimodalState(state: MultimodalState): PredictiveState {
    const now = Date.now();

    // 1. Extraire les données
    const dataPoint = this.extractDataPoint(state, now);

    // 2. Ajouter à l'historique
    this.addToHistory(dataPoint);

    // 3. Calculer les tendances
    const energyTrend = this.computeTrend(this.getEnergyHistory());
    const tensionTrend = this.computeTrend(this.getTensionHistory());
    const engagementTrend = this.computeTrend(this.getEngagementHistory());

    // 4. Calculer les prévisions
    const energyForecast = this.forecastDimension(
      'énergie',
      this.getEnergyHistory(),
      this.config.globalForecastHorizonMs
    );
    const tensionForecast = this.forecastDimension(
      'tension',
      this.getTensionHistory(),
      this.config.globalForecastHorizonMs
    );
    const engagementForecast = this.forecastDimension(
      'engagement',
      this.getEngagementHistory(),
      this.config.globalForecastHorizonMs
    );

    // 5. Détecter les ruptures de pattern
    const patternShift = this.detectPatternShift(dataPoint);

    // 6. Calculer la probabilité de changement
    const changeProbability = this.computeChangeProbability(
      energyTrend,
      tensionTrend,
      engagementTrend,
      patternShift
    );

    // 7. Déterminer si attention requise
    const { requiresAttention, attentionLevel } = this.evaluateAttention(
      energyTrend,
      tensionTrend,
      engagementTrend,
      patternShift,
      changeProbability
    );

    // 8. Générer les explications
    const explanations = this.generateExplanations(
      energyTrend,
      tensionTrend,
      engagementTrend,
      patternShift,
      energyForecast,
      tensionForecast
    );

    // 9. Déterminer la confiance globale
    const predictionConfidence = this.computePredictionConfidence();

    // 10. Déterminer les inputs actifs
    const activeInputs = this.getActiveInputs(state);

    // 11. Mettre à jour l'état
    this.currentState = {
      energyTrend: energyTrend.direction,
      tensionTrend: tensionTrend.direction,
      engagementTrend: engagementTrend.direction,
      energyForecast,
      tensionForecast,
      engagementForecast,
      changeProbability,
      patternShiftDetected: patternShift.detected,
      patternShiftType: patternShift.type,
      lastPatternShift: patternShift.detected ? patternShift : this.currentState.lastPatternShift,
      requiresAttention,
      attentionLevel,
      explanations,
      lastUpdate: now,
      predictionConfidence,
      activeInputs,
    };

    // 12. Notifier
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback(this.currentState);
    }

    return this.currentState;
  }

  /**
   * Obtient l'état prédictif actuel
   */
  public getState(): PredictiveState {
    return { ...this.currentState };
  }

  /**
   * Génère un résumé textuel pour le Chat IA
   */
  public generatePredictiveSummary(): string {
    const state = this.currentState;
    const parts: string[] = [];

    // Tendances
    if (state.energyTrend !== 'stable') {
      parts.push(`Énergie ${PREDICTIVE_ENGINE_CONSTANTS.TREND_LABELS[state.energyTrend]}`);
    }
    if (state.tensionTrend !== 'stable') {
      parts.push(`Tension ${PREDICTIVE_ENGINE_CONSTANTS.TREND_LABELS[state.tensionTrend]}`);
    }
    if (state.engagementTrend !== 'stable') {
      parts.push(`Engagement ${PREDICTIVE_ENGINE_CONSTANTS.TREND_LABELS[state.engagementTrend]}`);
    }

    // Pattern shift
    if (state.patternShiftDetected) {
      parts.push(`Changement de pattern détecté (${state.patternShiftType})`);
    }

    // Attention
    if (state.requiresAttention) {
      parts.push(PREDICTIVE_ENGINE_CONSTANTS.ATTENTION_LABELS[state.attentionLevel]);
    }

    if (parts.length === 0) {
      return 'État stable, pas de variation significative détectée.';
    }

    return parts.join('. ') + '.';
  }

  /**
   * Vérifie si un déclencheur proactif doit être émis
   */
  public checkProactiveTrigger(): ProactiveTrigger | null {
    const now = Date.now();
    const { triggers } = this.config;

    // Vérifier cooldown
    if (now - this.lastTriggerTimestamp < triggers.cooldownMs) {
      return null;
    }

    const state = this.currentState;

    // Vérifier chute d'énergie
    if (
      triggers.enableEnergyDropAlert &&
      state.energyTrend === 'falling' &&
      state.energyForecast.trend.slope < -triggers.energyDropThreshold
    ) {
      this.lastTriggerTimestamp = now;
      return {
        id: `trigger-energy-${now}`,
        type: 'energy_drop',
        priority: 'medium',
        message: 'Ton niveau d\'énergie descend progressivement.',
        suggestedAction: 'Veux-tu qu\'on ralentisse le rythme ?',
        triggerConditions: ['energyTrend=falling', `slope=${state.energyForecast.trend.slope.toFixed(3)}`],
        timestamp: now,
      };
    }

    // Vérifier montée de tension
    if (
      triggers.enableTensionRiseAlert &&
      state.tensionTrend === 'rising' &&
      state.tensionForecast.trend.slope > triggers.tensionRiseThreshold
    ) {
      this.lastTriggerTimestamp = now;
      return {
        id: `trigger-tension-${now}`,
        type: 'tension_rise',
        priority: 'medium',
        message: 'Ta tension semble monter par rapport à ton niveau habituel.',
        suggestedAction: 'On peut prendre un moment si tu veux.',
        triggerConditions: ['tensionTrend=rising', `slope=${state.tensionForecast.trend.slope.toFixed(3)}`],
        timestamp: now,
      };
    }

    // Vérifier chute d'engagement
    if (
      triggers.enableEngagementDropAlert &&
      state.engagementTrend === 'falling' &&
      state.engagementForecast.trend.slope < -triggers.engagementDropThreshold
    ) {
      this.lastTriggerTimestamp = now;
      return {
        id: `trigger-engagement-${now}`,
        type: 'engagement_drop',
        priority: 'low',
        message: 'Ton niveau d\'attention semble diminuer.',
        suggestedAction: 'Souhaites-tu faire une pause ou changer d\'approche ?',
        triggerConditions: ['engagementTrend=falling'],
        timestamp: now,
      };
    }

    // Vérifier pattern shift
    if (
      triggers.enablePatternShiftAlert &&
      state.patternShiftDetected &&
      state.patternShiftType === 'negative'
    ) {
      this.lastTriggerTimestamp = now;
      return {
        id: `trigger-pattern-${now}`,
        type: 'pattern_shift',
        priority: 'high',
        message: 'Je perçois un changement inhabituel dans ton état.',
        suggestedAction: 'Dis-moi si tout va bien.',
        triggerConditions: [`patternShiftType=${state.patternShiftType}`],
        timestamp: now,
      };
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════

  private extractDataPoint(state: MultimodalState, timestamp: number): HistoryDataPoint {
    return {
      timestamp,
      energy: state.fusedScores.correctedEnergy,
      tension: state.fusedScores.correctedTension,
      engagement: state.fusedScores.correctedEngagement,
      confidence: state.overallConfidence,
    };
  }

  private addToHistory(point: HistoryDataPoint): void {
    this.history.push(point);

    // Limiter la taille
    if (this.history.length > ENGINE_CONFIG.maxHistorySize) {
      this.history = this.history.slice(-ENGINE_CONFIG.maxHistorySize);
    }
  }

  private getEnergyHistory(): { timestamp: number; value: number }[] {
    return this.history.map(h => ({ timestamp: h.timestamp, value: h.energy }));
  }

  private getTensionHistory(): { timestamp: number; value: number }[] {
    return this.history.map(h => ({ timestamp: h.timestamp, value: h.tension }));
  }

  private getEngagementHistory(): { timestamp: number; value: number }[] {
    return this.history.map(h => ({ timestamp: h.timestamp, value: h.engagement }));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - TENDANCES
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Calcule la tendance à partir d'un historique
   */
  public computeTrend(
    data: { timestamp: number; value: number }[],
    windowMs: number = this.config.shortTermWindowMs
  ): TrendAnalysis {
    if (data.length < ENGINE_CONFIG.minPointsForTrend) {
      return getDefaultTrendAnalysis();
    }

    const now = Date.now();
    const windowStart = now - windowMs;

    // Filtrer les données dans la fenêtre
    const windowData = data.filter(d => d.timestamp >= windowStart);

    if (windowData.length < ENGINE_CONFIG.minPointsForTrend) {
      return getDefaultTrendAnalysis();
    }

    // Régression linéaire
    const regression = this.linearRegression(windowData);

    // Déterminer la direction
    let direction: TrendDirection = 'stable';
    if (regression.slope > this.config.risingThreshold) {
      direction = 'rising';
    } else if (regression.slope < this.config.fallingThreshold) {
      direction = 'falling';
    }

    return {
      direction,
      slope: regression.slope,
      rSquared: regression.rSquared,
      sampleCount: windowData.length,
      windowMs,
    };
  }

  /**
   * Régression linéaire simple
   */
  private linearRegression(data: { timestamp: number; value: number }[]): LinearRegressionResult {
    const n = data.length;
    if (n < 2) {
      return { slope: 0, intercept: 0, rSquared: 0 };
    }

    // Normaliser les timestamps (en secondes depuis le premier point)
    const t0 = data[0].timestamp;
    const normalizedData = data.map(d => ({
      x: (d.timestamp - t0) / 1000,
      y: d.value,
    }));

    // Calculer les moyennes
    const sumX = normalizedData.reduce((sum, d) => sum + d.x, 0);
    const sumY = normalizedData.reduce((sum, d) => sum + d.y, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    // Calculer les sommes pour la régression
    let ssXY = 0;
    let ssXX = 0;
    let ssYY = 0;

    for (const d of normalizedData) {
      const dx = d.x - meanX;
      const dy = d.y - meanY;
      ssXY += dx * dy;
      ssXX += dx * dx;
      ssYY += dy * dy;
    }

    // Pente et intercept
    const slope = ssXX !== 0 ? ssXY / ssXX : 0;
    const intercept = meanY - slope * meanX;

    // R² (coefficient de détermination)
    const rSquared = ssYY !== 0 ? (ssXY * ssXY) / (ssXX * ssYY) : 0;

    return { slope, intercept, rSquared };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - PRÉVISIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Prévoit la valeur d'une dimension
   */
  public forecastDimension(
    name: string,
    data: { timestamp: number; value: number }[],
    horizonMs: number
  ): DimensionForecast {
    if (data.length < ENGINE_CONFIG.minPointsForForecast) {
      return getDefaultDimensionForecast(name);
    }

    // Calculer la tendance
    const trend = this.computeTrend(data);

    // Valeur actuelle
    const currentValue = data[data.length - 1].value;

    // Extrapolation linéaire
    const horizonSec = horizonMs / 1000;
    let forecastValue = currentValue + trend.slope * horizonSec;

    // Borner entre 0 et 1
    forecastValue = Math.max(0, Math.min(1, forecastValue));

    // Calculer la confiance basée sur R²
    const confidence = Math.min(trend.rSquared * (data.length / 20), 1);

    // Générer l'explication
    const explanation = this.generateForecastExplanation(name, trend, forecastValue, horizonMs);

    return {
      currentValue,
      forecastValue,
      forecastHorizonMs: horizonMs,
      trend,
      confidence,
      explanation,
    };
  }

  private generateForecastExplanation(
    name: string,
    trend: TrendAnalysis,
    forecastValue: number,
    _horizonMs: number
  ): string {
    const trendLabel = PREDICTIVE_ENGINE_CONSTANTS.TREND_LABELS[trend.direction];

    if (trend.direction === 'stable') {
      return `${name} devrait rester stable autour de ${(forecastValue * 100).toFixed(0)}%.`;
    }

    return `${name} ${trendLabel}, prévision à ${(forecastValue * 100).toFixed(0)}%.`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - DÉTECTION DE PATTERNS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Détecte une rupture de pattern par rapport au baseline
   */
  public detectPatternShift(current: HistoryDataPoint): PatternShiftDetection {
    const { patternDetection } = this.config;

    // Besoin d'assez d'historique
    if (this.history.length < patternDetection.minSamplesRequired) {
      return {
        detected: false,
        type: 'neutral',
        severity: 0,
        zScore: 0,
        description: 'Pas assez de données pour détecter un pattern shift',
        timestamp: current.timestamp,
      };
    }

    // Calculer la moyenne et l'écart-type de l'historique récent
    const windowStart = current.timestamp - patternDetection.windowSizeMs;
    const recentHistory = this.history.filter(h => h.timestamp >= windowStart && h.timestamp < current.timestamp);

    if (recentHistory.length < patternDetection.minSamplesRequired) {
      return {
        detected: false,
        type: 'neutral',
        severity: 0,
        zScore: 0,
        description: 'Pas assez de données dans la fenêtre',
        timestamp: current.timestamp,
      };
    }

    // Calculer les statistiques pour chaque dimension
    const energyStats = this.computeStats(recentHistory.map(h => h.energy));
    const tensionStats = this.computeStats(recentHistory.map(h => h.tension));
    const engagementStats = this.computeStats(recentHistory.map(h => h.engagement));

    // Calculer les Z-scores
    const energyZ = energyStats.std > 0 ? (current.energy - energyStats.mean) / energyStats.std : 0;
    const tensionZ = tensionStats.std > 0 ? (current.tension - tensionStats.mean) / tensionStats.std : 0;
    const engagementZ = engagementStats.std > 0 ? (current.engagement - engagementStats.mean) / engagementStats.std : 0;

    // Z-score maximum
    const maxZ = Math.max(Math.abs(energyZ), Math.abs(tensionZ), Math.abs(engagementZ));

    // Détecter le shift
    const detected = maxZ >= patternDetection.minZScoreForShift;
    const severity = Math.min(maxZ / patternDetection.significantZScore, 1);

    // Déterminer le type
    let type: PatternShiftType = 'neutral';
    if (detected) {
      // Positif si énergie monte ou tension baisse
      const positiveSignal = energyZ > patternDetection.minZScoreForShift || tensionZ < -patternDetection.minZScoreForShift;
      const negativeSignal = energyZ < -patternDetection.minZScoreForShift || tensionZ > patternDetection.minZScoreForShift;

      if (positiveSignal && !negativeSignal) {
        type = 'positive';
      } else if (negativeSignal && !positiveSignal) {
        type = 'negative';
      } else if (positiveSignal && negativeSignal) {
        type = 'uncertain';
      }
    }

    // Description
    const description = this.generatePatternShiftDescription(detected, type, energyZ, tensionZ, engagementZ);

    return {
      detected,
      type,
      severity,
      zScore: maxZ,
      description,
      timestamp: current.timestamp,
    };
  }

  private computeStats(values: number[]): { mean: number; std: number } {
    if (values.length === 0) return { mean: 0, std: 0 };

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance);

    return { mean, std };
  }

  private generatePatternShiftDescription(
    detected: boolean,
    type: PatternShiftType,
    energyZ: number,
    tensionZ: number,
    engagementZ: number
  ): string {
    if (!detected) {
      return 'État dans les variations habituelles';
    }

    const parts: string[] = [];

    if (Math.abs(energyZ) >= this.config.patternDetection.minZScoreForShift) {
      parts.push(`énergie ${energyZ > 0 ? 'inhabituellement haute' : 'inhabituellement basse'}`);
    }
    if (Math.abs(tensionZ) >= this.config.patternDetection.minZScoreForShift) {
      parts.push(`tension ${tensionZ > 0 ? 'inhabituellement haute' : 'inhabituellement basse'}`);
    }
    if (Math.abs(engagementZ) >= this.config.patternDetection.minZScoreForShift) {
      parts.push(`engagement ${engagementZ > 0 ? 'inhabituellement haut' : 'inhabituellement bas'}`);
    }

    return `Pattern shift ${type}: ${parts.join(', ')}.`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - ÉVALUATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Calcule la probabilité globale de changement significatif
   */
  public computeChangeProbability(
    energyTrend: TrendAnalysis,
    tensionTrend: TrendAnalysis,
    engagementTrend: TrendAnalysis,
    patternShift: PatternShiftDetection
  ): number {
    let probability = 0;

    // Contribution des tendances non-stables
    if (energyTrend.direction !== 'stable') {
      probability += 0.2 * energyTrend.rSquared;
    }
    if (tensionTrend.direction !== 'stable') {
      probability += 0.25 * tensionTrend.rSquared;
    }
    if (engagementTrend.direction !== 'stable') {
      probability += 0.15 * engagementTrend.rSquared;
    }

    // Contribution du pattern shift
    if (patternShift.detected) {
      probability += 0.4 * patternShift.severity;
    }

    return Math.min(probability, 1);
  }

  private evaluateAttention(
    energyTrend: TrendAnalysis,
    tensionTrend: TrendAnalysis,
    engagementTrend: TrendAnalysis,
    patternShift: PatternShiftDetection,
    changeProbability: number
  ): { requiresAttention: boolean; attentionLevel: 'none' | 'low' | 'medium' | 'high' } {
    // High attention
    if (
      patternShift.detected &&
      patternShift.type === 'negative' &&
      patternShift.severity > 0.7
    ) {
      return { requiresAttention: true, attentionLevel: 'high' };
    }

    // Medium attention
    if (
      changeProbability > 0.6 ||
      (tensionTrend.direction === 'rising' && tensionTrend.slope > 0.05)
    ) {
      return { requiresAttention: true, attentionLevel: 'medium' };
    }

    // Low attention
    if (
      changeProbability > 0.3 ||
      energyTrend.direction === 'falling' ||
      engagementTrend.direction === 'falling'
    ) {
      return { requiresAttention: true, attentionLevel: 'low' };
    }

    return { requiresAttention: false, attentionLevel: 'none' };
  }

  private generateExplanations(
    energyTrend: TrendAnalysis,
    tensionTrend: TrendAnalysis,
    engagementTrend: TrendAnalysis,
    patternShift: PatternShiftDetection,
    energyForecast: DimensionForecast,
    tensionForecast: DimensionForecast
  ): string[] {
    const explanations: string[] = [];

    // Tendance énergie
    if (energyTrend.direction === 'falling') {
      explanations.push(
        `Énergie en baisse (pente: ${(energyTrend.slope * 100).toFixed(1)}%/min)`
      );
    } else if (energyTrend.direction === 'rising') {
      explanations.push(
        `Énergie en hausse (pente: ${(energyTrend.slope * 100).toFixed(1)}%/min)`
      );
    }

    // Tendance tension
    if (tensionTrend.direction === 'rising') {
      explanations.push(
        `Tension en montée (pente: ${(tensionTrend.slope * 100).toFixed(1)}%/min)`
      );
    }

    // Prévisions significatives
    if (energyForecast.confidence > 0.5 && energyForecast.forecastValue < 0.3) {
      explanations.push('Prévision: énergie pourrait être basse prochainement');
    }
    if (tensionForecast.confidence > 0.5 && tensionForecast.forecastValue > 0.7) {
      explanations.push('Prévision: tension pourrait monter');
    }

    // Pattern shift
    if (patternShift.detected) {
      explanations.push(patternShift.description);
    }

    // Limiter le nombre d'explications
    return explanations.slice(0, PREDICTIVE_ENGINE_CONSTANTS.MAX_EXPLANATIONS);
  }

  private computePredictionConfidence(): PredictionConfidence {
    const dataCount = this.history.length;

    if (dataCount < 10) return 'low';
    if (dataCount < 30) return 'medium';
    return 'high';
  }

  private getActiveInputs(state: MultimodalState): ('vision' | 'voice' | 'text')[] {
    const inputs: ('vision' | 'voice' | 'text')[] = [];

    if (state.visionState !== null) inputs.push('vision');
    if (state.voiceState !== null) inputs.push('voice');
    if (state.textState !== null) inputs.push('text');

    return inputs;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PUBLIQUES - UTILITAIRES
  // ═══════════════════════════════════════════════════════════════════════

  public getHistoryLength(): number {
    return this.history.length;
  }

  public isInitialized(): boolean {
    return this.history.length >= ENGINE_CONFIG.minPointsForTrend;
  }

  public getConfig(): PredictiveEngineConfig {
    return { ...this.config };
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export { PredictiveStateEngine };
export default PredictiveStateEngine.getInstance();
