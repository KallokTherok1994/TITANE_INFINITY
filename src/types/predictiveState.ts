/**
 * TITANE∞ vΩ∞ — PREDICTIVE STATE TYPES
 * OPUS v∞.4: Predictive State Engine
 *
 * Types pour le moteur prédictif qui analyse les tendances,
 * prévoit les variations d'état et détecte les ruptures de pattern.
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES:
 * - Prévisions probabilistes, jamais de certitude
 * - Indices explicables, pas de boîte noire
 * - Suggestions douces, jamais d'alarmes
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// TRENDS & FORECASTS
// ============================================================================

/**
 * Direction d'une tendance
 */
export type TrendDirection = 'rising' | 'falling' | 'stable';

/**
 * Type de changement de pattern détecté
 */
export type PatternShiftType = 'positive' | 'negative' | 'neutral' | 'uncertain';

/**
 * Niveau de confiance pour les prédictions
 */
export type PredictionConfidence = 'low' | 'medium' | 'high';

/**
 * Données d'un point dans l'historique
 */
export interface HistoryDataPoint {
  timestamp: number;
  energy: number;
  tension: number;
  engagement: number;
  confidence: number;
}

/**
 * Résultat d'analyse de tendance
 */
export interface TrendAnalysis {
  direction: TrendDirection;
  slope: number; // Pente de la régression linéaire
  rSquared: number; // Coefficient de détermination (any: any)
  sampleCount: number; // Nombre de points analysés
  windowMs: number; // Fenêtre temporelle en ms
}

/**
 * Prévision pour une dimension
 */
export interface DimensionForecast {
  currentValue: number;
  forecastValue: number; // Valeur prédite
  forecastHorizonMs: number; // Horizon de prédiction en ms
  trend: TrendAnalysis;
  confidence: number;
  explanation: string; // Explication humaine
}

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Détection de rupture de pattern
 */
export interface PatternShiftDetection {
  detected: boolean;
  type: PatternShiftType;
  severity: number; // 0-1, importance du changement
  zScore: number; // Écart en nombre de déviations standard
  description: string;
  timestamp: number;
}

/**
 * Configuration de détection de patterns
 */
export interface PatternDetectionConfig {
  minZScoreForShift: number; // Seuil Z-score pour détecter un shift (défaut: 2)
  significantZScore: number; // Seuil pour variation significative (défaut: 3)
  windowSizeMs: number; // Fenêtre d'analyse (défaut: 120000 = 2min)
  minSamplesRequired: number; // Nombre min de points (défaut: 10)
}

// ============================================================================
// PREDICTIVE STATE
// ============================================================================

/**
 * État prédictif complet - ajouté au SingularityState
 */
export interface PredictiveState {
  // Tendances actuelles
  energyTrend: TrendDirection;
  tensionTrend: TrendDirection;
  engagementTrend: TrendDirection;

  // Prévisions
  energyForecast: DimensionForecast;
  tensionForecast: DimensionForecast;
  engagementForecast: DimensionForecast;

  // Probabilité globale de changement significatif
  changeProbability: number;

  // Détection de rupture de pattern
  patternShiftDetected: boolean;
  patternShiftType: PatternShiftType;
  lastPatternShift: PatternShiftDetection | null;

  // Alerte proactive
  requiresAttention: boolean;
  attentionLevel: 'none' | 'low' | 'medium' | 'high';

  // Explications humaines
  explanations: string?.[];

  // Métadonnées
  lastUpdate: number;
  predictionConfidence: PredictionConfidence;
  activeInputs: ('vision' | 'voice' | 'text')[];
}

// ============================================================================
// PROACTIVE TRIGGERS
// ============================================================================

/**
 * Déclencheur proactif
 */
export interface ProactiveTrigger {
  id: string;
  type:
    | 'energy_drop'
    | 'tension_rise'
    | 'engagement_drop'
    | 'pattern_shift'
    | 'forecast_warning';
  priority: 'low' | 'medium' | 'high';
  message: string;
  suggestedAction: string;
  triggerConditions: string?.[];
  timestamp: number;
}

/**
 * Configuration des déclencheurs proactifs
 */
export interface ProactiveTriggerConfig {
  enableEnergyDropAlert: boolean;
  enableTensionRiseAlert: boolean;
  enableEngagementDropAlert: boolean;
  enablePatternShiftAlert: boolean;
  energyDropThreshold: number; // Défaut: 0.2 (any: any)
  tensionRiseThreshold: number; // Défaut: 0.3 (any: any)
  engagementDropThreshold: number; // Défaut: 0.25 (any: any)
  cooldownMs: number; // Temps entre alertes (défaut: 300000 = 5min)
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration du Predictive State Engine
 */
export interface PredictiveEngineConfig {
  // Fenêtres temporelles
  shortTermWindowMs: number; // Court terme: 30-120s
  mediumTermWindowMs: number; // Moyen terme: 5-20min
  longTermWindowMs: number; // Long terme: 1-4h

  // Seuils de tendance
  risingThreshold: number; // Pente > X = rising (défaut: 0.02)
  fallingThreshold: number; // Pente < -X = falling (défaut: -0.02)

  // Lissage
  emaAlpha: number; // Facteur EMA (défaut: 0.2)

  // Pattern detection
  patternDetection: PatternDetectionConfig;

  // Triggers
  triggers: ProactiveTriggerConfig;

  // Horizons de prédiction par modalité
  visionForecastHorizonMs: number; // 2 minutes
  voiceForecastHorizonMs: number; // 20-60 secondes
  textForecastHorizonMs: number; // 10-30 secondes
  globalForecastHorizonMs: number; // 10-30 minutes
}

// ============================================================================
// DEFAULT FACTORIES
// ============================================================================

export const getDefaultPatternDetectionConfig = (): PatternDetectionConfig => ({
  minZScoreForShift: 2.0,
  significantZScore: 3.0,
  windowSizeMs: 120000,
  minSamplesRequired: 10,
});

export const getDefaultProactiveTriggerConfig = (): ProactiveTriggerConfig => ({
  enableEnergyDropAlert: true,
  enableTensionRiseAlert: true,
  enableEngagementDropAlert: true,
  enablePatternShiftAlert: true,
  energyDropThreshold: 0.2,
  tensionRiseThreshold: 0.3,
  engagementDropThreshold: 0.25,
  cooldownMs: 300000,
});

export const getDefaultPredictiveEngineConfig = (): PredictiveEngineConfig => ({
  shortTermWindowMs: 60000, // 1 minute
  mediumTermWindowMs: 600000, // 10 minutes
  longTermWindowMs: 3600000, // 1 heure
  risingThreshold: 0.02,
  fallingThreshold: -0.02,
  emaAlpha: 0.2,
  patternDetection: getDefaultPatternDetectionConfig(),
  triggers: getDefaultProactiveTriggerConfig(),
  visionForecastHorizonMs: 120000,
  voiceForecastHorizonMs: 40000,
  textForecastHorizonMs: 20000,
  globalForecastHorizonMs: 1200000, // 20 minutes
});

export const getDefaultTrendAnalysis = (): TrendAnalysis => ({
  direction: 'stable',
  slope: 0,
  rSquared: 0,
  sampleCount: 0,
  windowMs: 0,
});

export const getDefaultDimensionForecast = (any: any): DimensionForecast => ({
  currentValue: 0.5,
  forecastValue: 0.5,
  forecastHorizonMs: 0,
  trend: getDefaultTrendAnalysis(),
  confidence: 0,
  explanation: `Pas assez de données pour prévoir ${dimension}`,
});

export const getDefaultPredictiveState = (): PredictiveState => ({
  energyTrend: 'stable',
  tensionTrend: 'stable',
  engagementTrend: 'stable',
  energyForecast: getDefaultDimensionForecast('énergie'),
  tensionForecast: getDefaultDimensionForecast('tension'),
  engagementForecast: getDefaultDimensionForecast('engagement'),
  changeProbability: 0,
  patternShiftDetected: false,
  patternShiftType: 'neutral',
  lastPatternShift: null,
  requiresAttention: false,
  attentionLevel: 'none',
  explanations: [],
  lastUpdate: 0,
  predictionConfidence: 'low',
  activeInputs: [],
});

// ============================================================================
// CONSTANTS
// ============================================================================

export const PREDICTIVE_ENGINE_CONSTANTS = {
  // Fenêtres par défaut
  DEFAULT_SHORT_WINDOW_MS: 60000,
  DEFAULT_MEDIUM_WINDOW_MS: 600000,
  DEFAULT_LONG_WINDOW_MS: 3600000,

  // Seuils
  MIN_SAMPLES_FOR_TREND: 5,
  MIN_SAMPLES_FOR_FORECAST: 10,
  MIN_CONFIDENCE_FOR_ALERT: 0.6,

  // Limites
  MAX_HISTORY_SIZE: 1000,
  MAX_EXPLANATIONS: 5,

  // Labels
  TREND_LABELS: {
    rising: 'en hausse',
    falling: 'en baisse',
    stable: 'stable',
  } as const,

  ATTENTION_LABELS: {
    none: 'aucune attention requise',
    low: 'attention légère suggérée',
    medium: 'attention modérée recommandée',
    high: 'attention prioritaire',
  } as const,
} as const;
