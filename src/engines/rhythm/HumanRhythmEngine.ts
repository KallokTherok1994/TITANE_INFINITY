/**
 * TITANE∞ vΩ∞ — HUMAN RHYTHM ENGINE
 * OPUS v∞.6: Cycle journalier/hebdomadaire + chronotype
 *
 * Ce moteur apprend les rythmes circadiens de l'utilisateur pour
 * adapter le pacing des interactions et suggérer des fenêtres optimales.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                      HumanRhythmEngine                              │
 * │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
 * │  │ Circadian │  │  Weekly   │  │Chronotype │  │ Adaptive  │       │
 * │  │ Detector  │  │  Pattern  │  │ Learning  │  │   Pacer   │       │
 * │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘       │
 * │        │              │              │              │              │
 * │        └──────────────┴──────────────┴──────────────┘              │
 * │                             │                                       │
 * │                             ▼                                       │
 * │                    HumanRhythmState                                 │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Fonctionnalités:
 * - Détection du chronotype (lève-tôt / neutre / couche-tard)
 * - Apprentissage des patterns d'énergie journaliers
 * - Détection des variations hebdomadaires
 * - Recommandations de pacing adaptatives
 * - Fenêtres optimales par type de tâche
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  HumanRhythmState,
  HumanRhythmConfig,
  DayMoment,
  WeekDay,
  Chronotype,
  ChronotypeConfidence,
  EnergyLevel,
  EnergyTrend,
  DailyPattern,
  WeeklyPattern,
  CircadianState,
  PacingRecommendation,
  OptimalWindow,
  TaskType,
  EnergyHistoryEntry,
} from '@/types/humanRhythm';

import {
  getDefaultHumanRhythmState,
  getDefaultHumanRhythmConfig,
  getDayMomentFromHour,
  getWeekDayFromIndex,
  isWeekend,
  HUMAN_RHYTHM_CONSTANTS,
} from '@/types/humanRhythm';

import type { MultimodalState } from '@/types/multimodalFusion';
import type { PredictiveState } from '@/types/predictiveState';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface StateUpdateCallback {
  (state: HumanRhythmState): void;
}

interface ChronotypeDetectionResult {
  chronotype: Chronotype;
  confidence: ChronotypeConfidence;
  morningScore: number;
  eveningScore: number;
}

interface EnergyObservation {
  timestamp: number;
  energy: number;
  moment: DayMoment;
  weekDay: WeekDay;
}

// ============================================================================
// HUMAN RHYTHM ENGINE
// ============================================================================

/**
 * Moteur de rythme humain singleton
 * Apprend les cycles circadiens pour adapter les interactions
 */
class HumanRhythmEngine {
  private static instance: HumanRhythmEngine | null = null;

  // Configuration
  private config: HumanRhythmConfig;

  // État
  private state: HumanRhythmState;
  private isRunning: boolean = false;

  // Callback
  private stateUpdateCallback: StateUpdateCallback | null = null;

  // Buffer d'observations pour batch processing
  private observationBuffer: EnergyObservation[] = [];
  private readonly BUFFER_SIZE = 10;

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  private constructor() {
    this.config = getDefaultHumanRhythmConfig();
    this.state = getDefaultHumanRhythmState();
  }

  public static getInstance(): HumanRhythmEngine {
    if (!HumanRhythmEngine.instance) {
      HumanRhythmEngine.instance = new HumanRhythmEngine();
    }
    return HumanRhythmEngine.instance;
  }

  public static resetInstance(): void {
    if (HumanRhythmEngine.instance) {
      HumanRhythmEngine.instance.stop();
    }
    HumanRhythmEngine.instance = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CYCLE DE VIE
  // ═══════════════════════════════════════════════════════════════════════

  public start(): void {
    if (this.isRunning) {
      console.warn('[HumanRhythmEngine] Déjà en cours d\'exécution');
      return;
    }

    console.log('[HumanRhythmEngine] Démarrage...');
    this.isRunning = true;

    if (this.state.learningStartDate === 0) {
      this.state.learningStartDate = Date.now();
    }

    // Initialiser l'état circadien actuel
    this.updateCurrentMoment();
  }

  public stop(): void {
    if (!this.isRunning) return;

    console.log('[HumanRhythmEngine] Arrêt...');

    // Traiter les observations en attente
    this.flushObservationBuffer();

    this.isRunning = false;
  }

  public reset(): void {
    this.state = getDefaultHumanRhythmState();
    this.observationBuffer = [];
    console.log('[HumanRhythmEngine] État réinitialisé');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  public setConfig(config: Partial<HumanRhythmConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): HumanRhythmConfig {
    return { ...this.config };
  }

  public setStateUpdateCallback(callback: StateUpdateCallback): void {
    this.stateUpdateCallback = callback;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - OBSERVATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Enregistre une observation d'énergie
   */
  public recordEnergyObservation(
    energy: number,
    context?: Partial<EnergyHistoryEntry['context']>
  ): void {
    const now = Date.now();
    const date = new Date(now);
    const hour = date.getHours();
    const dayIndex = date.getDay();

    const moment = getDayMomentFromHour(hour);
    const weekDay = getWeekDayFromIndex(dayIndex);

    // Ajouter au buffer
    this.observationBuffer.push({
      timestamp: now,
      energy: Math.max(0, Math.min(1, energy)),
      moment,
      weekDay,
    });

    // Ajouter à l'historique
    this.addToHistory({
      timestamp: now,
      dayMoment: moment,
      weekDay,
      energyLevel: energy,
      perceivedEnergy: this.energyToLevel(energy),
      context: context ?? {},
    });

    // Traiter le buffer si plein
    if (this.observationBuffer.length >= this.BUFFER_SIZE) {
      this.flushObservationBuffer();
    }
  }

  /**
   * Enregistre une observation à partir de l'état multimodal
   */
  public observeFromMultimodal(
    multimodalState: MultimodalState,
    predictiveState?: PredictiveState
  ): void {
    // Extraire un proxy d'énergie depuis l'état multimodal
    const energy = this.extractEnergyFromMultimodal(multimodalState, predictiveState);
    this.recordEnergyObservation(energy);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ANALYSE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Obtient l'état du rythme circadien actuel
   */
  public getCurrentCircadianState(): CircadianState {
    this.updateCurrentMoment();
    return { ...this.state.circadianState };
  }

  /**
   * Obtient le chronotype détecté
   */
  public getChronotype(): { type: Chronotype; confidence: ChronotypeConfidence } {
    return {
      type: this.state.detectedChronotype,
      confidence: this.state.chronotypeConfidence,
    };
  }

  /**
   * Obtient le pattern journalier appris
   */
  public getDailyPattern(): DailyPattern {
    return { ...this.state.dailyPattern };
  }

  /**
   * Obtient le pattern hebdomadaire appris
   */
  public getWeeklyPattern(): WeeklyPattern {
    return { ...this.state.weeklyPattern };
  }

  /**
   * Obtient le pacing recommandé actuellement
   */
  public getCurrentPacing(): PacingRecommendation {
    this.updatePacingRecommendation();
    return { ...this.state.currentPacing };
  }

  /**
   * Obtient les fenêtres optimales pour un type de tâche
   */
  public getOptimalWindows(taskType?: TaskType): OptimalWindow[] {
    this.computeOptimalWindows();

    if (taskType) {
      return this.state.optimalWindows.filter(w => w.taskType === taskType);
    }
    return [...this.state.optimalWindows];
  }

  /**
   * Vérifie si c'est un bon moment pour un type de tâche
   */
  public isGoodTimeFor(taskType: TaskType): { isGood: boolean; reason: string; score: number } {
    const windows = this.getOptimalWindows(taskType);
    const currentHour = new Date().getHours();

    for (const window of windows) {
      if (window.currentlyOptimal) {
        return {
          isGood: true,
          reason: `Fenêtre optimale pour ${HUMAN_RHYTHM_CONSTANTS.TASK_TYPE_LABELS[taskType]}`,
          score: window.score,
        };
      }
    }

    // Vérifier si proche d'une fenêtre optimale
    for (const window of windows) {
      if (Math.abs(window.startHour - currentHour) <= 1) {
        return {
          isGood: false,
          reason: `Fenêtre optimale commence bientôt (${window.startHour}h)`,
          score: window.score * 0.7,
        };
      }
    }

    return {
      isGood: false,
      reason: 'Pas de fenêtre optimale actuellement',
      score: 0.3,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - RÉSUMÉ
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Génère un résumé textuel de l'état du rythme
   */
  public generateRhythmSummary(): string {
    const { circadianState, detectedChronotype, chronotypeConfidence } = this.state;

    const lines: string[] = [];

    // Chronotype
    const chronoLabel = HUMAN_RHYTHM_CONSTANTS.CHRONOTYPE_LABELS[detectedChronotype];
    lines.push(`Chronotype: ${chronoLabel} (confiance: ${chronotypeConfidence})`);

    // Moment actuel
    const momentLabel = HUMAN_RHYTHM_CONSTANTS.MOMENT_LABELS[circadianState.currentMoment];
    const energyLabel = HUMAN_RHYTHM_CONSTANTS.ENERGY_LABELS[circadianState.currentEnergy];
    lines.push(`Moment: ${momentLabel}, énergie ${energyLabel}`);

    // Recommandation
    const pacing = this.state.currentPacing;
    lines.push(`Rythme suggéré: ${pacing.suggestedIntensity}`);
    lines.push(`Pause toutes les ${pacing.suggestedBreakInterval} min`);

    // Fenêtre optimale actuelle
    const currentOptimal = this.state.optimalWindows.find(w => w.currentlyOptimal);
    if (currentOptimal) {
      const taskLabel = HUMAN_RHYTHM_CONSTANTS.TASK_TYPE_LABELS[currentOptimal.taskType];
      lines.push(`Bon moment pour: ${taskLabel}`);
    }

    return lines.join('\n');
  }

  /**
   * Obtient l'état complet (lecture seule)
   */
  public getState(): HumanRhythmState {
    return { ...this.state };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - MISE À JOUR DU MOMENT
  // ═══════════════════════════════════════════════════════════════════════

  private updateCurrentMoment(): void {
    const now = new Date();
    const hour = now.getHours();
    const moment = getDayMomentFromHour(hour);

    const circadian = this.state.circadianState;
    const previousMoment = circadian.currentMoment;

    // Mettre à jour le moment
    circadian.currentMoment = moment;

    // Calculer la phase du cycle (0-1 sur 24h)
    circadian.cyclePhase = hour / 24;

    // Estimer la pression de sommeil
    circadian.sleepPressure = this.estimateSleepPressure(hour);

    // Estimer le niveau de vigilance
    circadian.alertnessLevel = this.estimateAlertness(hour);

    // Mettre à jour l'énergie basée sur le pattern appris
    const pattern = this.state.dailyPattern.patterns.find(p => p.moment === moment);
    if (pattern && pattern.sampleCount > 0) {
      circadian.currentEnergy = this.energyToLevel(pattern.averageEnergy);

      // Déterminer la tendance
      circadian.energyTrend = this.computeEnergyTrend(moment);
    }

    // Déterminer les moments optimaux pour les tâches
    circadian.optimalForComplexTask = this.isOptimalForDeepWork(hour);
    circadian.optimalForCreativeTask = this.isOptimalForCreative(hour);

    // Estimer les prochains pics et creux
    this.estimateNextPeakAndDip();

    // Notifier si le moment a changé
    if (previousMoment !== moment) {
      this.state.lastUpdate = Date.now();
      this.notifyStateUpdate();
    }
  }

  private estimateSleepPressure(hour: number): number {
    // Modèle simplifié: pression augmente au fil de la journée
    // Reset supposé vers 7h du matin
    const hoursAwake = hour >= 7 ? hour - 7 : hour + 17;
    return Math.min(1, hoursAwake / 16);
  }

  private estimateAlertness(hour: number): number {
    // Courbe circadienne typique avec dip post-prandial
    const { detectedChronotype } = this.state;
    const peaks = HUMAN_RHYTHM_CONSTANTS.CHRONOTYPE_PEAKS[detectedChronotype];

    const distanceFromPeak = Math.min(
      Math.abs(hour - peaks.peakHour),
      Math.abs(hour - peaks.peakHour + 24),
      Math.abs(hour - peaks.peakHour - 24)
    );

    const distanceFromDip = Math.min(
      Math.abs(hour - peaks.dipHour),
      Math.abs(hour - peaks.dipHour + 24),
      Math.abs(hour - peaks.dipHour - 24)
    );

    // Plus proche du pic = plus de vigilance
    const peakInfluence = Math.max(0, 1 - distanceFromPeak / 6);
    const dipInfluence = Math.max(0, 1 - distanceFromDip / 4);

    return Math.max(0.2, Math.min(1, 0.5 + peakInfluence * 0.5 - dipInfluence * 0.3));
  }

  private computeEnergyTrend(currentMoment: DayMoment): EnergyTrend {
    const moments: DayMoment[] = ['earlyMorning', 'morning', 'midday', 'afternoon', 'evening', 'night'];
    const currentIndex = moments.indexOf(currentMoment);

    if (currentIndex <= 0) return 'stable';

    const patterns = this.state.dailyPattern.patterns;
    const currentPattern = patterns.find(p => p.moment === currentMoment);
    const previousPattern = patterns.find(p => p.moment === moments[currentIndex - 1]);

    if (!currentPattern || !previousPattern) return 'stable';
    if (currentPattern.sampleCount < 3 || previousPattern.sampleCount < 3) return 'stable';

    const diff = currentPattern.averageEnergy - previousPattern.averageEnergy;
    const threshold = 0.1;

    if (currentPattern.peakProbability > 0.7) return 'peaking';
    if (currentPattern.dipProbability > 0.7) return 'dipping';
    if (diff > threshold) return 'rising';
    if (diff < -threshold) return 'falling';
    return 'stable';
  }

  private isOptimalForDeepWork(hour: number): boolean {
    const { detectedChronotype } = this.state;
    const peaks = HUMAN_RHYTHM_CONSTANTS.CHRONOTYPE_PEAKS[detectedChronotype];

    // Optimal autour du pic matinal (±2h)
    const distanceFromPeak = Math.min(
      Math.abs(hour - peaks.peakHour),
      Math.abs(hour - peaks.peakHour + 24)
    );

    return distanceFromPeak <= 2;
  }

  private isOptimalForCreative(hour: number): boolean {
    // La créativité est souvent meilleure quand on est légèrement fatigué
    // ou en fin d'après-midi
    return (hour >= 14 && hour <= 17) || (hour >= 20 && hour <= 22);
  }

  private estimateNextPeakAndDip(): void {
    const { detectedChronotype, circadianState } = this.state;
    const peaks = HUMAN_RHYTHM_CONSTANTS.CHRONOTYPE_PEAKS[detectedChronotype];
    const currentHour = new Date().getHours();

    // Calculer le prochain pic
    let nextPeakHour = peaks.peakHour;
    if (nextPeakHour <= currentHour) {
      nextPeakHour += 24; // Demain
    }

    const now = new Date();
    const nextPeak = new Date(now);
    nextPeak.setHours(nextPeakHour % 24, 0, 0, 0);
    if (nextPeakHour >= 24) {
      nextPeak.setDate(nextPeak.getDate() + 1);
    }
    circadianState.nextPeakEstimate = nextPeak.getTime();

    // Calculer le prochain creux
    let nextDipHour = peaks.dipHour;
    if (nextDipHour <= currentHour) {
      nextDipHour += 24;
    }

    const nextDip = new Date(now);
    nextDip.setHours(nextDipHour % 24, 0, 0, 0);
    if (nextDipHour >= 24) {
      nextDip.setDate(nextDip.getDate() + 1);
    }
    circadianState.nextDipEstimate = nextDip.getTime();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - APPRENTISSAGE DES PATTERNS
  // ═══════════════════════════════════════════════════════════════════════

  private flushObservationBuffer(): void {
    if (this.observationBuffer.length === 0) return;

    // Regrouper par moment et jour
    const grouped = new Map<string, EnergyObservation[]>();

    for (const obs of this.observationBuffer) {
      const key = `${obs.moment}-${obs.weekDay}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      const group = grouped.get(key);
      if (group) {
        group.push(obs);
      }
    }

    // Mettre à jour les patterns
    for (const [key, observations] of grouped) {
      const [moment, weekDay] = key.split('-') as [DayMoment, WeekDay];
      const avgEnergy = observations.reduce((s, o) => s + o.energy, 0) / observations.length;

      this.updateMomentPattern(moment, avgEnergy);
      this.updateWeekDayPattern(weekDay, moment, avgEnergy);
    }

    // Réévaluer le chronotype
    this.updateChronotypeDetection();

    // Mettre à jour les statistiques
    this.state.totalDataPoints += this.observationBuffer.length;
    this.state.lastUpdate = Date.now();

    // Vider le buffer
    this.observationBuffer = [];

    // Notifier
    this.notifyStateUpdate();
  }

  private updateMomentPattern(moment: DayMoment, energy: number): void {
    const pattern = this.state.dailyPattern.patterns.find(p => p.moment === moment);
    if (!pattern) return;

    const alpha = this.config.learningRate;

    // EMA pour l'énergie moyenne
    if (pattern.sampleCount === 0) {
      pattern.averageEnergy = energy;
    } else {
      pattern.averageEnergy = alpha * energy + (1 - alpha) * pattern.averageEnergy;
    }

    // Mise à jour de la variabilité (Welford's algorithm simplifié)
    const delta = energy - pattern.averageEnergy;
    pattern.variability = alpha * Math.abs(delta) + (1 - alpha) * pattern.variability;

    pattern.sampleCount++;

    // Recalculer les probabilités de pic/creux
    this.updatePeakDipProbabilities();

    // Mettre à jour le pattern journalier global
    this.state.dailyPattern.dataPoints++;
    this.state.dailyPattern.lastUpdated = Date.now();
    this.updateDailyPatternStats();
  }

  private updateWeekDayPattern(weekDay: WeekDay, moment: DayMoment, energy: number): void {
    const dayPattern = this.state.weeklyPattern.dayPatterns.find(d => d.day === weekDay);
    if (!dayPattern) return;

    const momentPattern = dayPattern.dailyPattern.patterns.find(p => p.moment === moment);
    if (!momentPattern) return;

    const alpha = this.config.learningRate;

    if (momentPattern.sampleCount === 0) {
      momentPattern.averageEnergy = energy;
    } else {
      momentPattern.averageEnergy = alpha * energy + (1 - alpha) * momentPattern.averageEnergy;
    }

    momentPattern.sampleCount++;
    dayPattern.dailyPattern.dataPoints++;
    dayPattern.dailyPattern.lastUpdated = Date.now();

    // Mettre à jour les patterns weekday/weekend agrégés
    if (isWeekend(weekDay)) {
      this.aggregateWeekendPattern();
    } else {
      this.aggregateWeekdayPattern();
    }

    this.state.weeklyPattern.lastUpdated = Date.now();
  }

  private updatePeakDipProbabilities(): void {
    const patterns = this.state.dailyPattern.patterns;

    // Trouver les énergies min et max
    let maxEnergy = 0;
    let minEnergy = 1;

    for (const p of patterns) {
      if (p.sampleCount > 0) {
        if (p.averageEnergy > maxEnergy) maxEnergy = p.averageEnergy;
        if (p.averageEnergy < minEnergy) minEnergy = p.averageEnergy;
      }
    }

    const range = maxEnergy - minEnergy;
    if (range < 0.1) return;

    // Calculer les probabilités
    for (const p of patterns) {
      if (p.sampleCount > 0) {
        const normalized = (p.averageEnergy - minEnergy) / range;
        p.peakProbability = Math.pow(normalized, 2);
        p.dipProbability = Math.pow(1 - normalized, 2);
      }
    }

    // Identifier le pic et le creux
    let peakMoment: DayMoment | null = null;
    let dipMoment: DayMoment | null = null;
    let peakProb = 0;
    let dipProb = 0;

    for (const p of patterns) {
      if (p.peakProbability > peakProb) {
        peakProb = p.peakProbability;
        peakMoment = p.moment;
      }
      if (p.dipProbability > dipProb) {
        dipProb = p.dipProbability;
        dipMoment = p.moment;
      }
    }

    this.state.dailyPattern.peakMoment = peakMoment;
    this.state.dailyPattern.dipMoment = dipMoment;
  }

  private updateDailyPatternStats(): void {
    const patterns = this.state.dailyPattern.patterns;
    let sum = 0;
    let count = 0;

    for (const p of patterns) {
      if (p.sampleCount > 0) {
        sum += p.averageEnergy;
        count++;
      }
    }

    if (count > 0) {
      this.state.dailyPattern.averageEnergy = sum / count;
    }
  }

  private aggregateWeekdayPattern(): void {
    const weekdays = this.state.weeklyPattern.dayPatterns.filter(d => !d.isWeekend);
    this.aggregatePatterns(weekdays, this.state.weeklyPattern.weekdayPattern);
  }

  private aggregateWeekendPattern(): void {
    const weekends = this.state.weeklyPattern.dayPatterns.filter(d => d.isWeekend);
    this.aggregatePatterns(weekends, this.state.weeklyPattern.weekendPattern);
  }

  private aggregatePatterns(dayPatterns: { dailyPattern: DailyPattern }[], target: DailyPattern): void {
    const moments: DayMoment[] = ['earlyMorning', 'morning', 'midday', 'afternoon', 'evening', 'night'];

    for (const moment of moments) {
      const targetPattern = target.patterns.find(p => p.moment === moment);
      if (!targetPattern) continue;

      let sum = 0;
      let count = 0;

      for (const dp of dayPatterns) {
        const mp = dp.dailyPattern.patterns.find(p => p.moment === moment);
        if (mp && mp.sampleCount > 0) {
          sum += mp.averageEnergy;
          count++;
        }
      }

      if (count > 0) {
        targetPattern.averageEnergy = sum / count;
        targetPattern.sampleCount = count;
      }
    }

    target.lastUpdated = Date.now();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - DÉTECTION CHRONOTYPE
  // ═══════════════════════════════════════════════════════════════════════

  private updateChronotypeDetection(): void {
    const history = this.state.energyHistory;

    if (history.length < this.config.chronotypeMinDataPoints) {
      this.state.chronotypeConfidence = 'low';
      return;
    }

    const result = this.detectChronotype(history);

    this.state.detectedChronotype = result.chronotype;
    this.state.chronotypeConfidence = result.confidence;
  }

  private detectChronotype(history: EnergyHistoryEntry[]): ChronotypeDetectionResult {
    // Calculer les scores matin/soir
    let morningEnergy = 0;
    let morningCount = 0;
    let eveningEnergy = 0;
    let eveningCount = 0;

    for (const entry of history) {
      if (entry.dayMoment === 'earlyMorning' || entry.dayMoment === 'morning') {
        morningEnergy += entry.energyLevel;
        morningCount++;
      } else if (entry.dayMoment === 'evening' || entry.dayMoment === 'night') {
        eveningEnergy += entry.energyLevel;
        eveningCount++;
      }
    }

    const morningScore = morningCount > 0 ? morningEnergy / morningCount : 0.5;
    const eveningScore = eveningCount > 0 ? eveningEnergy / eveningCount : 0.5;

    const diff = morningScore - eveningScore;
    const threshold = 0.15;

    let chronotype: Chronotype;
    let confidence: ChronotypeConfidence;

    if (diff > threshold * 2) {
      chronotype = 'earlyBird';
      confidence = 'high';
    } else if (diff > threshold) {
      chronotype = 'earlyBird';
      confidence = 'medium';
    } else if (diff < -threshold * 2) {
      chronotype = 'nightOwl';
      confidence = 'high';
    } else if (diff < -threshold) {
      chronotype = 'nightOwl';
      confidence = 'medium';
    } else {
      chronotype = 'neutral';
      confidence = history.length > 50 ? 'high' : 'medium';
    }

    return { chronotype, confidence, morningScore, eveningScore };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - RECOMMANDATIONS
  // ═══════════════════════════════════════════════════════════════════════

  private updatePacingRecommendation(): void {
    const { circadianState } = this.state;
    const pacing = this.state.currentPacing;

    // Déterminer l'intensité suggérée
    if (circadianState.currentEnergy === 'peak' || circadianState.alertnessLevel > 0.8) {
      pacing.suggestedIntensity = 'deep';
      pacing.suggestedBreakInterval = 45;
      pacing.suggestedSessionLength = 90;
      pacing.reason = 'Énergie optimale pour travail en profondeur';
    } else if (circadianState.currentEnergy === 'high' || circadianState.alertnessLevel > 0.6) {
      pacing.suggestedIntensity = 'focused';
      pacing.suggestedBreakInterval = 35;
      pacing.suggestedSessionLength = 60;
      pacing.reason = 'Bonne énergie pour concentration';
    } else if (circadianState.currentEnergy === 'medium') {
      pacing.suggestedIntensity = 'moderate';
      pacing.suggestedBreakInterval = 25;
      pacing.suggestedSessionLength = 50;
      pacing.reason = 'Énergie modérée, pauses régulières recommandées';
    } else {
      pacing.suggestedIntensity = 'light';
      pacing.suggestedBreakInterval = 15;
      pacing.suggestedSessionLength = 30;
      pacing.reason = 'Énergie faible, privilégier tâches légères';
    }

    // Ajuster la confiance
    pacing.confidence = this.state.dailyPattern.dataPoints > 20 ? 0.8 : 0.5;
  }

  private computeOptimalWindows(): void {
    const windows: OptimalWindow[] = [];
    const currentHour = new Date().getHours();

    const taskTypes: TaskType[] = ['deepWork', 'creative', 'routine', 'meetings', 'learning'];

    for (const taskType of taskTypes) {
      const window = this.computeWindowForTask(taskType, currentHour);
      if (window) {
        windows.push(window);
      }
    }

    this.state.optimalWindows = windows;
  }

  private computeWindowForTask(taskType: TaskType, currentHour: number): OptimalWindow | null {
    const { detectedChronotype } = this.state;
    const peaks = HUMAN_RHYTHM_CONSTANTS.CHRONOTYPE_PEAKS[detectedChronotype];

    let startHour: number;
    let endHour: number;
    let score: number;

    switch (taskType) {
      case 'deepWork':
        // Autour du pic d'énergie
        startHour = peaks.peakHour - 1;
        endHour = peaks.peakHour + 2;
        score = 0.9;
        break;

      case 'creative':
        // Après-midi tard ou soir (fatigue légère favorise créativité)
        startHour = 15;
        endHour = 18;
        score = 0.75;
        break;

      case 'routine':
        // Creux énergétique (économiser la bonne énergie)
        startHour = peaks.dipHour - 1;
        endHour = peaks.dipHour + 1;
        score = 0.7;
        break;

      case 'meetings':
        // Fin de matinée (éveillé mais pas au pic)
        startHour = 10;
        endHour = 12;
        score = 0.8;
        break;

      case 'learning':
        // Matin tôt (mémoire optimale)
        startHour = detectedChronotype === 'nightOwl' ? 11 : 8;
        endHour = startHour + 2;
        score = 0.85;
        break;

      default:
        return null;
    }

    // Normaliser les heures
    startHour = (startHour + 24) % 24;
    endHour = (endHour + 24) % 24;

    const currentlyOptimal = currentHour >= startHour && currentHour < endHour;

    return {
      taskType,
      startHour,
      endHour,
      score,
      currentlyOptimal,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - UTILITAIRES
  // ═══════════════════════════════════════════════════════════════════════

  private extractEnergyFromMultimodal(
    multimodalState: MultimodalState,
    predictiveState?: PredictiveState
  ): number {
    // Combiner différents signaux pour estimer l'énergie
    let energy = 0.5;

    // Utiliser le score d'énergie fusionné
    if (multimodalState.fusedScores?.globalEnergy?.value !== undefined) {
      energy = multimodalState.fusedScores.globalEnergy.value;
    }

    // Ajuster avec la confiance globale
    if (multimodalState.overallConfidence !== undefined) {
      // Pondérer par la confiance
      energy = energy * 0.8 + (energy * multimodalState.overallConfidence * 0.2);
    }

    // Utiliser les tendances prédictives si disponibles
    if (predictiveState) {
      // Ajuster selon la tendance d'énergie
      if (predictiveState.energyTrend === 'rising') {
        energy *= 1.1;
      } else if (predictiveState.energyTrend === 'falling') {
        energy *= 0.9;
      }

      // Haute tension = moins d'énergie disponible
      if (predictiveState.tensionForecast?.forecastValue !== undefined) {
        energy *= (1 - predictiveState.tensionForecast.forecastValue * 0.2);
      }
    }

    return Math.max(0, Math.min(1, energy));
  }

  private energyToLevel(energy: number): EnergyLevel {
    if (energy >= 0.8) return 'peak';
    if (energy >= 0.6) return 'high';
    if (energy >= 0.4) return 'medium';
    return 'low';
  }

  private addToHistory(entry: EnergyHistoryEntry): void {
    this.state.energyHistory.push(entry);

    // Limiter la taille
    if (this.state.energyHistory.length > this.config.maxHistoryEntries) {
      this.state.energyHistory = this.state.energyHistory.slice(
        -this.config.maxHistoryEntries
      );
    }

    // Nettoyer les anciennes entrées
    const cutoff = Date.now() - this.config.historyRetentionDays * 24 * 60 * 60 * 1000;
    this.state.energyHistory = this.state.energyHistory.filter(
      e => e.timestamp > cutoff
    );
  }

  private notifyStateUpdate(): void {
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback({ ...this.state });
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { HumanRhythmEngine };
export default HumanRhythmEngine.getInstance();
