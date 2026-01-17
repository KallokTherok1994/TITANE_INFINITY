/**
 * TITANE∞ vΩ∞ — HUMAN RHYTHM TYPES
 * OPUS v∞.6: Human Rhythm Engine
 *
 * Types pour le moteur de rythme humain qui détecte les patterns
 * journaliers et hebdomadaires pour adapter les interactions.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                     HUMAN RHYTHM SYSTEM                             │
 * │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
 * │  │ Circadian │  │  Weekly   │  │Chronotype │  │ Adaptive  │       │
 * │  │ Detector  │  │  Pattern  │  │ Learning  │  │   Pacer   │       │
 * │  └───────────┘  └───────────┘  └───────────┘  └───────────┘       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// DAY MOMENTS
// ============================================================================

/**
 * Moments de la journée
 */
export type DayMoment =
  | 'earlyMorning' // 05:00 - 08:00
  | 'morning' // 08:00 - 12:00
  | 'midday' // 12:00 - 14:00
  | 'afternoon' // 14:00 - 18:00
  | 'evening' // 18:00 - 22:00
  | 'night'; // 22:00 - 05:00

/**
 * Jours de la semaine
 */
export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/**
 * Période de la semaine
 */
export type WeekPeriod = 'weekday' | 'weekend';

// ============================================================================
// CHRONOTYPE
// ============================================================================

/**
 * Chronotype détecté de l'utilisateur
 */
export type Chronotype =
  | 'earlyBird' // Couche-tôt / lève-tôt
  | 'neutral' // Pas de préférence marquée
  | 'nightOwl'; // Couche-tard / lève-tard

/**
 * Confiance dans la détection du chronotype
 */
export type ChronotypeConfidence = 'low' | 'medium' | 'high';

// ============================================================================
// ENERGY LEVELS
// ============================================================================

/**
 * Niveau d'énergie détecté
 */
export type EnergyLevel = 'low' | 'medium' | 'high' | 'peak';

/**
 * Tendance de l'énergie
 */
export type EnergyTrend = 'rising' | 'falling' | 'stable' | 'peaking' | 'dipping';

// ============================================================================
// RHYTHM PATTERNS
// ============================================================================

/**
 * Pattern d'énergie pour un moment donné
 */
export interface MomentEnergyPattern {
  moment: DayMoment;
  averageEnergy: number; // 0-1
  variability: number; // Écart-type
  sampleCount: number; // Nombre d'observations
  peakProbability: number; // Probabilité d'être un pic
  dipProbability: number; // Probabilité d'être un creux
}

/**
 * Pattern journalier complet
 */
export interface DailyPattern {
  patterns: MomentEnergyPattern[];
  peakMoment: DayMoment | null;
  dipMoment: DayMoment | null;
  averageEnergy: number;
  dataPoints: number;
  lastUpdated: number;
}

/**
 * Pattern pour un jour spécifique de la semaine
 */
export interface WeekDayPattern {
  day: WeekDay;
  dailyPattern: DailyPattern;
  isWeekend: boolean;
  specialCharacteristics: string[];
}

/**
 * Pattern hebdomadaire complet
 */
export interface WeeklyPattern {
  weekdayPattern: DailyPattern; // Lundi-Vendredi agrégé
  weekendPattern: DailyPattern; // Samedi-Dimanche agrégé
  dayPatterns: WeekDayPattern[]; // Détail par jour
  weekdayPeakDay: WeekDay | null; // Jour le plus productif en semaine
  weekdayDipDay: WeekDay | null; // Jour le plus fatigant en semaine
  lastUpdated: number;
}

// ============================================================================
// CIRCADIAN RHYTHM
// ============================================================================

/**
 * État du rythme circadien détecté
 */
export interface CircadianState {
  currentMoment: DayMoment;
  currentEnergy: EnergyLevel;
  energyTrend: EnergyTrend;

  // Prédictions
  nextPeakEstimate: number | null; // Timestamp du prochain pic estimé
  nextDipEstimate: number | null; // Timestamp du prochain creux estimé

  // Phase du cycle
  cyclePhase: number; // 0-1 position dans le cycle 24h
  sleepPressure: number; // 0-1 pression de sommeil estimée

  // Alertness
  alertnessLevel: number; // 0-1 niveau de vigilance
  optimalForComplexTask: boolean; // Bon moment pour tâches complexes ?
  optimalForCreativeTask: boolean; // Bon moment pour créativité ?
}

// ============================================================================
// ADAPTIVE PACING
// ============================================================================

/**
 * Recommandation de rythme adaptative
 */
export interface PacingRecommendation {
  suggestedIntensity: 'light' | 'moderate' | 'focused' | 'deep';
  suggestedBreakInterval: number; // Minutes recommandées entre pauses
  suggestedSessionLength: number; // Minutes de travail recommandées
  reason: string;
  confidence: number; // 0-1
}

/**
 * Type de tâche pour l'optimisation
 */
export type TaskType =
  | 'deepWork' // Travail en profondeur, concentration intense
  | 'creative' // Tâches créatives, brainstorming
  | 'routine' // Tâches routinières, admin
  | 'meetings' // Réunions, collaboration
  | 'learning'; // Apprentissage, lecture

/**
 * Fenêtre optimale pour un type de tâche
 */
export interface OptimalWindow {
  taskType: TaskType;
  startHour: number;
  endHour: number;
  score: number; // 0-1 pertinence de cette fenêtre
  currentlyOptimal: boolean; // Est-ce maintenant ?
}

// ============================================================================
// HUMAN RHYTHM STATE
// ============================================================================

/**
 * État complet du Human Rhythm Engine
 */
export interface HumanRhythmState {
  // Chronotype
  detectedChronotype: Chronotype;
  chronotypeConfidence: ChronotypeConfidence;

  // État circadien actuel
  circadianState: CircadianState;

  // Patterns appris
  dailyPattern: DailyPattern;
  weeklyPattern: WeeklyPattern;

  // Recommandations
  currentPacing: PacingRecommendation;
  optimalWindows: OptimalWindow[];

  // Historique
  energyHistory: EnergyHistoryEntry[];

  // Métadonnées
  learningStartDate: number;
  totalDataPoints: number;
  lastUpdate: number;
}

/**
 * Entrée d'historique d'énergie
 */
export interface EnergyHistoryEntry {
  timestamp: number;
  dayMoment: DayMoment;
  weekDay: WeekDay;
  energyLevel: number; // 0-1 valeur brute
  perceivedEnergy: EnergyLevel; // Niveau discret
  context: {
    sleepQuality?: number; // 0-1 si connu
    caffeine?: boolean;
    exercise?: boolean;
    mealRecent?: boolean;
  };
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration du Human Rhythm Engine
 */
export interface HumanRhythmConfig {
  // Apprentissage
  learningRate: number; // Vitesse d'adaptation
  minDataPointsForPattern: number; // Minimum de points pour un pattern
  patternDecayDays: number; // Jours avant décroissance des patterns

  // Chronotype
  chronotypeMinDataPoints: number; // Points minimum pour détecter chronotype
  chronotypeAdaptationDays: number; // Jours pour adapter le chronotype

  // Pacing
  defaultBreakInterval: number; // Minutes par défaut entre pauses
  defaultSessionLength: number; // Minutes de session par défaut

  // Historique
  maxHistoryEntries: number; // Taille max de l'historique
  historyRetentionDays: number; // Jours de rétention

  // Fenêtres optimales
  enableOptimalWindows: boolean;
  windowSuggestionThreshold: number; // Score min pour suggérer une fenêtre
}

// ============================================================================
// DEFAULT FACTORIES
// ============================================================================

/**
 * Crée une configuration par défaut
 */
export const getDefaultHumanRhythmConfig = (): HumanRhythmConfig => ({
  learningRate: 0.1,
  minDataPointsForPattern: 5,
  patternDecayDays: 30,
  chronotypeMinDataPoints: 20,
  chronotypeAdaptationDays: 14,
  defaultBreakInterval: 25,
  defaultSessionLength: 50,
  maxHistoryEntries: 500,
  historyRetentionDays: 90,
  enableOptimalWindows: true,
  windowSuggestionThreshold: 0.7,
});

/**
 * Crée un pattern de moment vide
 */
export const getDefaultMomentPattern = (moment: DayMoment): MomentEnergyPattern => ({
  moment,
  averageEnergy: 0.5,
  variability: 0,
  sampleCount: 0,
  peakProbability: 0,
  dipProbability: 0,
});

/**
 * Crée un pattern journalier vide
 */
export const getDefaultDailyPattern = (): DailyPattern => ({
  patterns: [
    getDefaultMomentPattern('earlyMorning'),
    getDefaultMomentPattern('morning'),
    getDefaultMomentPattern('midday'),
    getDefaultMomentPattern('afternoon'),
    getDefaultMomentPattern('evening'),
    getDefaultMomentPattern('night'),
  ],
  peakMoment: null,
  dipMoment: null,
  averageEnergy: 0.5,
  dataPoints: 0,
  lastUpdated: 0,
});

/**
 * Crée un pattern hebdomadaire vide
 */
export const getDefaultWeeklyPattern = (): WeeklyPattern => ({
  weekdayPattern: getDefaultDailyPattern(),
  weekendPattern: getDefaultDailyPattern(),
  dayPatterns: [
    {
      day: 'monday',
      dailyPattern: getDefaultDailyPattern(),
      isWeekend: false,
      specialCharacteristics: [],
    },
    {
      day: 'tuesday',
      dailyPattern: getDefaultDailyPattern(),
      isWeekend: false,
      specialCharacteristics: [],
    },
    {
      day: 'wednesday',
      dailyPattern: getDefaultDailyPattern(),
      isWeekend: false,
      specialCharacteristics: [],
    },
    {
      day: 'thursday',
      dailyPattern: getDefaultDailyPattern(),
      isWeekend: false,
      specialCharacteristics: [],
    },
    {
      day: 'friday',
      dailyPattern: getDefaultDailyPattern(),
      isWeekend: false,
      specialCharacteristics: [],
    },
    {
      day: 'saturday',
      dailyPattern: getDefaultDailyPattern(),
      isWeekend: true,
      specialCharacteristics: [],
    },
    {
      day: 'sunday',
      dailyPattern: getDefaultDailyPattern(),
      isWeekend: true,
      specialCharacteristics: [],
    },
  ],
  weekdayPeakDay: null,
  weekdayDipDay: null,
  lastUpdated: 0,
});

/**
 * Crée un état circadien par défaut
 */
export const getDefaultCircadianState = (): CircadianState => ({
  currentMoment: 'morning',
  currentEnergy: 'medium',
  energyTrend: 'stable',
  nextPeakEstimate: null,
  nextDipEstimate: null,
  cyclePhase: 0.5,
  sleepPressure: 0.3,
  alertnessLevel: 0.7,
  optimalForComplexTask: true,
  optimalForCreativeTask: true,
});

/**
 * Crée un pacing par défaut
 */
export const getDefaultPacingRecommendation = (): PacingRecommendation => ({
  suggestedIntensity: 'moderate',
  suggestedBreakInterval: 25,
  suggestedSessionLength: 50,
  reason: 'Configuration par défaut',
  confidence: 0.5,
});

/**
 * Crée un état complet par défaut
 */
export const getDefaultHumanRhythmState = (): HumanRhythmState => ({
  detectedChronotype: 'neutral',
  chronotypeConfidence: 'low',
  circadianState: getDefaultCircadianState(),
  dailyPattern: getDefaultDailyPattern(),
  weeklyPattern: getDefaultWeeklyPattern(),
  currentPacing: getDefaultPacingRecommendation(),
  optimalWindows: [],
  energyHistory: [],
  learningStartDate: 0,
  totalDataPoints: 0,
  lastUpdate: 0,
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Détermine le moment de la journée à partir d'une heure
 */
export const getDayMomentFromHour = (hour: number): DayMoment => {
  if (hour >= 5 && hour < 8) return 'earlyMorning';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

/**
 * Détermine le jour de la semaine à partir d'un index (0 = dimanche)
 */
export const getWeekDayFromIndex = (index: number): WeekDay => {
  const days: WeekDay[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const dayIndex = index % 7;
  return days[dayIndex] ?? 'sunday'; // Fallback to sunday if somehow undefined
};

/**
 * Vérifie si un jour est un weekend
 */
export const isWeekend = (day: WeekDay): boolean => {
  return day === 'saturday' || day === 'sunday';
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const HUMAN_RHYTHM_CONSTANTS = {
  // Bornes horaires des moments
  MOMENT_BOUNDARIES: {
    earlyMorning: { start: 5, end: 8 },
    morning: { start: 8, end: 12 },
    midday: { start: 12, end: 14 },
    afternoon: { start: 14, end: 18 },
    evening: { start: 18, end: 22 },
    night: { start: 22, end: 5 },
  } as const,

  // Labels français
  MOMENT_LABELS: {
    earlyMorning: 'tôt le matin',
    morning: 'matin',
    midday: 'midi',
    afternoon: 'après-midi',
    evening: 'soir',
    night: 'nuit',
  } as const,

  DAY_LABELS: {
    monday: 'lundi',
    tuesday: 'mardi',
    wednesday: 'mercredi',
    thursday: 'jeudi',
    friday: 'vendredi',
    saturday: 'samedi',
    sunday: 'dimanche',
  } as const,

  CHRONOTYPE_LABELS: {
    earlyBird: 'lève-tôt',
    neutral: 'neutre',
    nightOwl: 'couche-tard',
  } as const,

  ENERGY_LABELS: {
    low: 'faible',
    medium: 'modéré',
    high: 'élevé',
    peak: 'optimal',
  } as const,

  TASK_TYPE_LABELS: {
    deepWork: 'travail en profondeur',
    creative: 'tâche créative',
    routine: 'tâche routinière',
    meetings: 'réunions',
    learning: 'apprentissage',
  } as const,

  // Valeurs typiques par chronotype
  CHRONOTYPE_PEAKS: {
    earlyBird: { peakHour: 9, dipHour: 15 },
    neutral: { peakHour: 10, dipHour: 14 },
    nightOwl: { peakHour: 15, dipHour: 9 },
  } as const,
} as const;
