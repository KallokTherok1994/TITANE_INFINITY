/**
 * TITANE∞ PHASE 1 (OPTION B) - Stubs pour engines/stress et rhythm supprimés
 */

import type { MultimodalState } from '../../types/multimodalFusion';
import type { PredictiveState } from '../../types/predictiveState';
import {
  ALL_PROTOCOLS,
  getDefaultStressRegulationConfig,
  getDefaultStressRegulationState,
  type InterventionProtocol,
  type InterventionRecommendation,
  type InterventionResult,
  type InterventionType,
  type StressRegulationConfig,
  type StressRegulationState,
  type TriggerEvaluation,
} from '../../types/stressRegulation';

export class StressRegulationEngine {
  private static instance: StressRegulationEngine | null = null;

  static getInstance(): StressRegulationEngine {
    if (!StressRegulationEngine.instance) {
      StressRegulationEngine.instance = new StressRegulationEngine();
    }
    return StressRegulationEngine.instance;
  }

  static resetInstance(): void {
    StressRegulationEngine.instance?.stop();
    StressRegulationEngine.instance = null;
  }

  private running = false;
  private config: StressRegulationConfig = getDefaultStressRegulationConfig();
  private state: StressRegulationState = getDefaultStressRegulationState();

  constructor() {}

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  reset(): void {
    this.state = getDefaultStressRegulationState();
  }

  getState(): StressRegulationState {
    return this.state;
  }

  setAutoRegulationEnabled(enabled: boolean): void {
    this.state = {
      ...this.state,
      autoRegulationEnabled: enabled,
      lastUpdate: Date.now(),
    };
  }

  shouldTriggerIntervention(
    _multimodalState: MultimodalState,
    _predictiveState: PredictiveState,
    _baselineTension: number,
    _userDeclaredStress: boolean
  ): TriggerEvaluation {
    if (!this.state.autoRegulationEnabled) {
      return {
        shouldTrigger: false,
        reason: 'Auto-régulation désactivée',
        priority: 'low',
        suggestedType: 'pause',
        conditions: {
          tensionAboveBaseline: false,
          tensionRising: false,
          changeProbabilityHigh: false,
          requiresAttention: false,
          userDeclaredStress: false,
          agendaOverloaded: false,
        },
      };
    }

    return {
      shouldTrigger: false,
      reason: 'Conditions insuffisantes (stub)',
      priority: 'low',
      suggestedType: 'pause',
      conditions: {
        tensionAboveBaseline: false,
        tensionRising: false,
        changeProbabilityHigh: false,
        requiresAttention: false,
        userDeclaredStress: false,
        agendaOverloaded: false,
      },
    };
  }

  selectInterventionType(context?: {
    stressLevel?: StressRegulationState['currentLevel'];
    agendaLoad?: number;
  }): InterventionRecommendation {
    const stressLevel = context?.stressLevel ?? this.state.currentLevel;
    const agendaLoad = context?.agendaLoad ?? 0;

    const type: InterventionType =
      stressLevel === 'high' && agendaLoad >= 0.8
        ? 'agenda'
        : stressLevel === 'high'
          ? 'breath'
          : 'pause';

    const protocol = this.getProtocol(type);

    return {
      type,
      protocol,
      confidence: 0.7,
      reason: 'Sélection simple (stub)',
      alternatives: ['breath', 'pause', 'body', 'focus', 'agenda', 'reassurance'].filter(
        (t): t is InterventionType => t !== type
      ),
    };
  }

  getProtocol(type: InterventionType): InterventionProtocol {
    return ALL_PROTOCOLS[type];
  }

  startIntervention(type: InterventionType): InterventionProtocol {
    if (!this.running) {
      this.running = true;
    }

    const now = Date.now();
    const protocol = this.getProtocol(type);

    this.state = {
      ...this.state,
      lastInterventionType: type,
      lastInterventionTimestamp: now,
      totalInterventions: this.state.totalInterventions + 1,
      cooldownActive: true,
      cooldownEndsAt: now + this.state.cooldownMs,
      lastUpdate: now,
    };

    return protocol;
  }

  recordInterventionResult(
    type: InterventionType,
    result: InterventionResult,
    tensionBefore: number,
    tensionAfter: number
  ): void {
    const now = Date.now();
    const learningRate = this.config.learningRate;
    const minW = this.config.minWeightValue;
    const maxW = this.config.maxWeightValue;

    const previous = this.state.interventionWeights[type];
    const delta =
      result === 'helpful' ? learningRate : result === 'rejected' ? -learningRate : 0;
    const updated = Math.min(maxW, Math.max(minW, previous + delta));

    const interventionWeights = {
      ...this.state.interventionWeights,
      [type]: updated,
    };

    this.state = {
      ...this.state,
      lastInterventionType: type,
      lastInterventionTimestamp: now,
      lastInterventionResult: result,
      helpfulInterventions:
        this.state.helpfulInterventions + (result === 'helpful' ? 1 : 0),
      rejectedInterventions:
        this.state.rejectedInterventions + (result === 'rejected' ? 1 : 0),
      interventionWeights,
      interventionHistory: [
        ...this.state.interventionHistory,
        {
          timestamp: now,
          type,
          duration: this.getProtocol(type).durationSeconds,
          completed: result !== 'rejected',
          perceivedEffect: result,
          tensionBefore,
          tensionAfter,
          context: {
            stressLevel: this.state.currentLevel,
            hourOfDay: new Date(now).getHours(),
            agendaLoad: 0,
          },
        },
      ].slice(-100),
      lastUpdate: now,
    };
  }
}

export class HumanRhythmEngine {
  constructor() {}
  start() {}
  stop() {}
  getState() {
    return {};
  }
}
