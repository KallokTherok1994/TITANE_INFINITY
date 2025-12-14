/**
 * TITANE∞ PHASE 1 (OPTION B) - Stubs pour engines/rhythm supprimés
 */

export { StressRegulationEngine } from '../stress/_stubs';

import type { MultimodalState } from '../../types/multimodalFusion';
import type { PredictiveState } from '../../types/predictiveState';
import {
  getDayMomentFromHour,
  getWeekDayFromIndex,
  getDefaultHumanRhythmConfig,
  getDefaultHumanRhythmState,
  type Chronotype,
  type ChronotypeConfidence,
  type CircadianState,
  type DayMoment,
  type HumanRhythmConfig,
  type HumanRhythmState,
  type OptimalWindow,
  type PacingRecommendation,
  type TaskType,
  type WeekDay,
} from '../../types/humanRhythm';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const perceivedEnergyFromValue = (
  value: number
): HumanRhythmState['circadianState']['currentEnergy'] => {
  if (value < 0.3) return 'low';
  if (value < 0.6) return 'medium';
  if (value < 0.85) return 'high';
  return 'peak';
};

export class HumanRhythmEngine {
  private static instance: HumanRhythmEngine | null = null;

  static getInstance(): HumanRhythmEngine {
    if (!HumanRhythmEngine.instance) {
      HumanRhythmEngine.instance = new HumanRhythmEngine();
    }
    return HumanRhythmEngine.instance;
  }

  static resetInstance(): void {
    HumanRhythmEngine.instance?.stop();
    HumanRhythmEngine.instance = null;
  }

  private running = false;
  private config: HumanRhythmConfig = getDefaultHumanRhythmConfig();
  private state: HumanRhythmState = getDefaultHumanRhythmState();

  constructor() {}

  start(): void {
    this.running = true;
    if (this.state.learningStartDate === 0) {
      const now = Date.now();
      this.state = {
        ...this.state,
        learningStartDate: now,
        lastUpdate: now,
      };
    }
  }

  stop(): void {
    this.running = false;
  }

  reset(): void {
    this.state = getDefaultHumanRhythmState();
  }

  getState(): HumanRhythmState {
    return this.state;
  }

  recordEnergyObservation(rawEnergy: number): void {
    if (!this.running) {
      this.running = true;
    }

    const energyLevel = clamp01(rawEnergy);
    const now = Date.now();
    const date = new Date(now);
    const hour = date.getHours();
    const dayIndex = date.getDay(); // 0 = dimanche

    const dayMoment: DayMoment = getDayMomentFromHour(hour);
    const weekDay: WeekDay = getWeekDayFromIndex(dayIndex);
    const perceivedEnergy = perceivedEnergyFromValue(energyLevel);

    const circadianState: CircadianState = {
      ...this.state.circadianState,
      currentMoment: dayMoment,
      currentEnergy: perceivedEnergy,
      alertnessLevel: clamp01(0.3 + energyLevel * 0.7),
      cyclePhase: clamp01(hour / 24),
      sleepPressure: clamp01(hour >= 22 || hour < 6 ? 0.8 : 0.3),
      optimalForComplexTask: perceivedEnergy === 'high' || perceivedEnergy === 'peak',
      optimalForCreativeTask: perceivedEnergy !== 'low',
    };

    this.state = {
      ...this.state,
      circadianState,
      energyHistory: [
        ...this.state.energyHistory,
        {
          timestamp: now,
          dayMoment,
          weekDay,
          energyLevel,
          perceivedEnergy,
          context: {},
        },
      ].slice(-this.config.maxHistoryEntries),
      totalDataPoints: this.state.totalDataPoints + 1,
      lastUpdate: now,
    };
  }

  getCurrentCircadianState(): CircadianState {
    return this.state.circadianState;
  }

  getChronotype(): { type: Chronotype; confidence: ChronotypeConfidence } {
    return {
      type: this.state.detectedChronotype,
      confidence: this.state.chronotypeConfidence,
    };
  }

  getDailyPattern(): HumanRhythmState['dailyPattern'] {
    return this.state.dailyPattern;
  }

  getWeeklyPattern(): HumanRhythmState['weeklyPattern'] {
    return this.state.weeklyPattern;
  }

  getCurrentPacing(): PacingRecommendation {
    return this.state.currentPacing;
  }

  getOptimalWindows(taskType?: TaskType): OptimalWindow[] {
    if (!taskType) return this.state.optimalWindows;
    return this.state.optimalWindows.filter(w => w.taskType === taskType);
  }

  isGoodTimeFor(taskType: TaskType): { isGood: boolean; reason: string; score: number } {
    const windows = this.getOptimalWindows(taskType);
    const best = windows.length > 0 ? windows[0] : null;

    return {
      isGood: best?.currentlyOptimal ?? false,
      reason: best
        ? 'Fenêtre optimale disponible (stub)'
        : 'Aucune fenêtre optimale (stub)',
      score: best ? clamp01(best.score) : 0.5,
    };
  }

  generateRhythmSummary(): string {
    const c = this.state.circadianState;
    return `Rythme: ${c.currentMoment}, énergie ${c.currentEnergy}, vigilance ${c.alertnessLevel.toFixed(2)}`;
  }

  observeFromMultimodal(
    _multimodalState: MultimodalState,
    _predictiveState: PredictiveState
  ): void {
    // Stub: on ne dérive pas réellement l'énergie, mais on marque l'activité.
    const now = Date.now();
    this.state = { ...this.state, lastUpdate: now };
  }
}
