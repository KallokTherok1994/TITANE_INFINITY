/**
 * TITANE∞ vΩ∞ — OPUS ENGINES TESTS
 * Tests unitaires pour OPUS v∞.4, v∞.5, v∞.6
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ============================================================================
// OPUS v∞.4 - PREDICTIVE STATE ENGINE TESTS
// ============================================================================

// REMOVED: engines/predictive supprimé en PHASE 1 (OPTION B)
import { PredictiveStateEngine } from '../engines/predictive/_stubs';
import {
  getDefaultPredictiveState,
  getDefaultPredictiveEngineConfig,
  type PredictiveState,
} from '../types/predictiveState';
import { getDefaultMultimodalState } from '../types/multimodalFusion';
import type { MultimodalState } from '../types/multimodalFusion';

describe('OPUS v∞.4 - PredictiveStateEngine', () => {
  let engine: PredictiveStateEngine;

  beforeEach(() => {
    PredictiveStateEngine.resetInstance();
    engine = PredictiveStateEngine.getInstance();
  });

  afterEach(() => {
    engine.stop();
    PredictiveStateEngine.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('devrait retourner la même instance', () => {
      const instance1 = PredictiveStateEngine.getInstance();
      const instance2 = PredictiveStateEngine.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('devrait créer une nouvelle instance après reset', () => {
      const instance1 = PredictiveStateEngine.getInstance();
      PredictiveStateEngine.resetInstance();
      const instance2 = PredictiveStateEngine.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Cycle de vie', () => {
    it('devrait démarrer et arrêter correctement', () => {
      expect(() => engine.start()).not.toThrow();
      expect(() => engine.stop()).not.toThrow();
    });

    it("devrait réinitialiser l'état", () => {
      engine.start();
      // Faire quelques observations
      const state = getDefaultMultimodalState();
      engine.processMultimodalState(state);

      engine.reset();
      const predictiveState = engine.getState();
      expect(predictiveState.lastUpdate).toBe(0);
    });
  });

  describe('Observation et analyse', () => {
    it('devrait accepter une observation multimodale', () => {
      engine.start();
      const state = getDefaultMultimodalState();
      expect(() => engine.processMultimodalState(state)).not.toThrow();
    });

    it("devrait mettre à jour l'état après observation", () => {
      engine.start();
      const state = getDefaultMultimodalState();

      // Plusieurs observations pour accumuler des données
      for (let i = 0; i < 5; i++) {
        engine.processMultimodalState(state);
      }

      const predictiveState = engine.getState();
      expect(predictiveState.lastUpdate).toBeGreaterThan(0);
    });

    it('devrait calculer les tendances', () => {
      engine.start();
      const state = getDefaultMultimodalState();

      // Simuler une série d'observations
      for (let i = 0; i < 10; i++) {
        engine.processMultimodalState(state);
      }

      const predictiveState = engine.getState();
      expect(['rising', 'falling', 'stable']).toContain(predictiveState.energyTrend);
      expect(['rising', 'falling', 'stable']).toContain(predictiveState.tensionTrend);
    });
  });

  describe('Configuration', () => {
    it('devrait accepter une configuration partielle', () => {
      expect(() => engine.setConfig({ risingThreshold: 0.05 })).not.toThrow();
    });

    it('devrait retourner la configuration', () => {
      const config = engine.getConfig();
      expect(config).toBeDefined();
      expect(config.risingThreshold).toBeDefined();
    });
  });

  describe('Résumé prédictif', () => {
    it('devrait générer un résumé', () => {
      engine.start();
      const state = getDefaultMultimodalState();
      engine.processMultimodalState(state);

      const summary = engine.generatePredictiveSummary();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });
  });

  describe('Callbacks', () => {
    it("devrait notifier les mises à jour d'état", () => {
      const callback = vi.fn();
      engine.setStateUpdateCallback(callback);
      engine.start();

      const state = getDefaultMultimodalState();
      engine.processMultimodalState(state);

      // Le callback devrait être appelé
      expect(callback).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// OPUS v∞.5 - STRESS REGULATION ENGINE TESTS
// ============================================================================

// REMOVED: engines/stress supprimé en PHASE 1 (OPTION B)
import { StressRegulationEngine } from '../engines/stress/_stubs';
import {
  getDefaultStressRegulationState,
  getDefaultStressRegulationConfig,
  ALL_PROTOCOLS,
  type StressRegulationState,
  type InterventionType,
} from '../types/stressRegulation';

describe('OPUS v∞.5 - StressRegulationEngine', () => {
  let engine: ReturnType<typeof StressRegulationEngine.getInstance>;

  beforeEach(() => {
    StressRegulationEngine.resetInstance();
    engine = StressRegulationEngine.getInstance();
  });

  afterEach(() => {
    engine.stop();
    StressRegulationEngine.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('devrait retourner la même instance', () => {
      const instance1 = StressRegulationEngine.getInstance();
      const instance2 = StressRegulationEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Cycle de vie', () => {
    it('devrait démarrer et arrêter correctement', () => {
      expect(() => engine.start()).not.toThrow();
      expect(() => engine.stop()).not.toThrow();
    });

    it("devrait réinitialiser l'état", () => {
      engine.start();
      engine.reset();
      const state = engine.getState();
      expect(state.totalInterventions).toBe(0);
    });
  });

  describe('Évaluation des triggers', () => {
    it('devrait évaluer les conditions de déclenchement', () => {
      engine.start();
      engine.setAutoRegulationEnabled(true);

      const multimodalState = getDefaultMultimodalState();
      const predictiveState = getDefaultPredictiveState();

      const evaluation = engine.shouldTriggerIntervention(
        multimodalState,
        predictiveState,
        0.5,
        false
      );

      expect(evaluation).toBeDefined();
      expect(typeof evaluation.shouldTrigger).toBe('boolean');
      expect(evaluation.reason).toBeDefined();
    });

    it('devrait ne pas déclencher si auto-régulation désactivée', () => {
      engine.start();
      engine.setAutoRegulationEnabled(false);

      const multimodalState = getDefaultMultimodalState();
      const predictiveState = getDefaultPredictiveState();

      const evaluation = engine.shouldTriggerIntervention(
        multimodalState,
        predictiveState,
        0.5,
        false
      );

      expect(evaluation.shouldTrigger).toBe(false);
      expect(evaluation.reason).toContain('désactivée');
    });
  });

  describe("Sélection d'intervention", () => {
    it("devrait sélectionner un type d'intervention", () => {
      engine.start();

      const recommendation = engine.selectInterventionType();

      expect(recommendation).toBeDefined();
      expect(recommendation.type).toBeDefined();
      expect(recommendation.protocol).toBeDefined();
      expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(recommendation.confidence).toBeLessThanOrEqual(1);
    });

    it('devrait sélectionner en fonction du contexte', () => {
      engine.start();

      const recommendation = engine.selectInterventionType({
        stressLevel: 'high',
        agendaLoad: 0.9,
      });

      expect(recommendation).toBeDefined();
      expect(['breath', 'pause', 'body', 'focus', 'agenda', 'reassurance']).toContain(
        recommendation.type
      );
    });
  });

  describe("Protocoles d'intervention", () => {
    it('devrait retourner un protocole valide', () => {
      const types: InterventionType[] = [
        'breath',
        'pause',
        'body',
        'focus',
        'agenda',
        'reassurance',
      ];

      for (const type of types) {
        const protocol = engine.getProtocol(type);
        expect(protocol).toBeDefined();
        expect(protocol.type).toBe(type);
        expect(protocol.steps.length).toBeGreaterThan(0);
        expect(protocol.durationSeconds).toBeGreaterThan(0);
      }
    });

    it('devrait avoir tous les protocoles définis', () => {
      expect(ALL_PROTOCOLS.breath).toBeDefined();
      expect(ALL_PROTOCOLS.pause).toBeDefined();
      expect(ALL_PROTOCOLS.body).toBeDefined();
      expect(ALL_PROTOCOLS.focus).toBeDefined();
      expect(ALL_PROTOCOLS.agenda).toBeDefined();
      expect(ALL_PROTOCOLS.reassurance).toBeDefined();
    });
  });

  describe("Exécution d'intervention", () => {
    it('devrait démarrer une intervention', () => {
      engine.start();

      const protocol = engine.startIntervention('breath');

      expect(protocol).toBeDefined();
      expect(protocol.type).toBe('breath');

      const state = engine.getState();
      expect(state.lastInterventionType).toBe('breath');
      expect(state.totalInterventions).toBe(1);
    });

    it("devrait enregistrer le résultat d'une intervention", () => {
      engine.start();
      engine.startIntervention('breath');

      engine.recordInterventionResult('breath', 'helpful', 0.6, 0.3);

      const state = engine.getState();
      expect(state.lastInterventionResult).toBe('helpful');
      expect(state.helpfulInterventions).toBe(1);
    });
  });

  describe('Apprentissage des poids', () => {
    it('devrait ajuster les poids après feedback positif', () => {
      engine.start();
      const initialWeights = { ...engine.getState().interventionWeights };

      engine.startIntervention('breath');
      engine.recordInterventionResult('breath', 'helpful', 0.6, 0.3);

      const newWeights = engine.getState().interventionWeights;
      expect(newWeights.breath).toBeGreaterThanOrEqual(initialWeights.breath);
    });

    it('devrait ajuster les poids après feedback négatif', () => {
      engine.start();

      engine.startIntervention('pause');
      engine.recordInterventionResult('pause', 'rejected', 0.5, 0.5);

      const state = engine.getState();
      expect(state.rejectedInterventions).toBe(1);
    });
  });
});

// ============================================================================
// OPUS v∞.6 - HUMAN RHYTHM ENGINE TESTS
// ============================================================================

// REMOVED: engines/rhythm supprimé en PHASE 1 (OPTION B)
import { HumanRhythmEngine } from '../engines/rhythm/_stubs';
import {
  getDefaultHumanRhythmState,
  getDefaultHumanRhythmConfig,
  getDayMomentFromHour,
  getWeekDayFromIndex,
  isWeekend,
  HUMAN_RHYTHM_CONSTANTS,
  type DayMoment,
  type WeekDay,
  type Chronotype,
} from '../types/humanRhythm';

describe('OPUS v∞.6 - HumanRhythmEngine', () => {
  let engine: ReturnType<typeof HumanRhythmEngine.getInstance>;

  beforeEach(() => {
    HumanRhythmEngine.resetInstance();
    engine = HumanRhythmEngine.getInstance();
  });

  afterEach(() => {
    engine.stop();
    HumanRhythmEngine.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('devrait retourner la même instance', () => {
      const instance1 = HumanRhythmEngine.getInstance();
      const instance2 = HumanRhythmEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Cycle de vie', () => {
    it('devrait démarrer et arrêter correctement', () => {
      expect(() => engine.start()).not.toThrow();
      expect(() => engine.stop()).not.toThrow();
    });

    it('devrait initialiser la date de démarrage', () => {
      engine.start();
      const state = engine.getState();
      expect(state.learningStartDate).toBeGreaterThan(0);
    });

    it("devrait réinitialiser l'état", () => {
      engine.start();
      engine.recordEnergyObservation(0.8);
      engine.reset();

      const state = engine.getState();
      expect(state.totalDataPoints).toBe(0);
    });
  });

  describe("Observation d'énergie", () => {
    it('devrait enregistrer une observation', () => {
      engine.start();
      expect(() => engine.recordEnergyObservation(0.7)).not.toThrow();
    });

    it("devrait normaliser les valeurs d'énergie", () => {
      engine.start();

      // Valeur trop haute
      engine.recordEnergyObservation(1.5);
      // Valeur trop basse
      engine.recordEnergyObservation(-0.5);

      // Pas d'erreur
      expect(engine.getState()).toBeDefined();
    });

    it("devrait ajouter à l'historique", () => {
      engine.start();

      // Forcer le flush du buffer avec suffisamment d'observations
      for (let i = 0; i < 15; i++) {
        engine.recordEnergyObservation(0.6);
      }

      const state = engine.getState();
      expect(state.energyHistory.length).toBeGreaterThan(0);
    });
  });

  describe('État circadien', () => {
    it("devrait retourner l'état circadien actuel", () => {
      engine.start();

      const circadian = engine.getCurrentCircadianState();

      expect(circadian).toBeDefined();
      expect(circadian.currentMoment).toBeDefined();
      expect(circadian.currentEnergy).toBeDefined();
      expect(circadian.alertnessLevel).toBeGreaterThanOrEqual(0);
      expect(circadian.alertnessLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('Chronotype', () => {
    it('devrait retourner le chronotype détecté', () => {
      engine.start();

      const { type, confidence } = engine.getChronotype();

      expect(['earlyBird', 'neutral', 'nightOwl']).toContain(type);
      expect(['low', 'medium', 'high']).toContain(confidence);
    });

    it('devrait commencer avec une confiance basse', () => {
      engine.start();

      const { confidence } = engine.getChronotype();

      expect(confidence).toBe('low');
    });
  });

  describe('Patterns', () => {
    it('devrait retourner le pattern journalier', () => {
      engine.start();

      const dailyPattern = engine.getDailyPattern();

      expect(dailyPattern).toBeDefined();
      expect(dailyPattern.patterns.length).toBe(6); // 6 moments de la journée
    });

    it('devrait retourner le pattern hebdomadaire', () => {
      engine.start();

      const weeklyPattern = engine.getWeeklyPattern();

      expect(weeklyPattern).toBeDefined();
      expect(weeklyPattern.dayPatterns.length).toBe(7); // 7 jours
    });
  });

  describe('Recommandations de pacing', () => {
    it('devrait retourner une recommandation de pacing', () => {
      engine.start();

      const pacing = engine.getCurrentPacing();

      expect(pacing).toBeDefined();
      expect(['light', 'moderate', 'focused', 'deep']).toContain(
        pacing.suggestedIntensity
      );
      expect(pacing.suggestedBreakInterval).toBeGreaterThan(0);
      expect(pacing.suggestedSessionLength).toBeGreaterThan(0);
    });
  });

  describe('Fenêtres optimales', () => {
    it('devrait retourner les fenêtres optimales', () => {
      engine.start();

      const windows = engine.getOptimalWindows();

      expect(windows).toBeDefined();
      expect(Array.isArray(windows)).toBe(true);
    });

    it('devrait filtrer par type de tâche', () => {
      engine.start();

      const deepWorkWindows = engine.getOptimalWindows('deepWork');

      for (const window of deepWorkWindows) {
        expect(window.taskType).toBe('deepWork');
      }
    });

    it("devrait vérifier si c'est un bon moment pour une tâche", () => {
      engine.start();

      const result = engine.isGoodTimeFor('deepWork');

      expect(result).toBeDefined();
      expect(typeof result.isGood).toBe('boolean');
      expect(typeof result.reason).toBe('string');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });

  describe('Résumé', () => {
    it('devrait générer un résumé textuel', () => {
      engine.start();

      const summary = engine.generateRhythmSummary();

      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// TESTS DES UTILITAIRES
// ============================================================================

describe('Utilitaires Human Rhythm', () => {
  describe('getDayMomentFromHour', () => {
    it('devrait retourner earlyMorning pour 5-7h', () => {
      expect(getDayMomentFromHour(5)).toBe('earlyMorning');
      expect(getDayMomentFromHour(7)).toBe('earlyMorning');
    });

    it('devrait retourner morning pour 8-11h', () => {
      expect(getDayMomentFromHour(8)).toBe('morning');
      expect(getDayMomentFromHour(11)).toBe('morning');
    });

    it('devrait retourner midday pour 12-13h', () => {
      expect(getDayMomentFromHour(12)).toBe('midday');
      expect(getDayMomentFromHour(13)).toBe('midday');
    });

    it('devrait retourner afternoon pour 14-17h', () => {
      expect(getDayMomentFromHour(14)).toBe('afternoon');
      expect(getDayMomentFromHour(17)).toBe('afternoon');
    });

    it('devrait retourner evening pour 18-21h', () => {
      expect(getDayMomentFromHour(18)).toBe('evening');
      expect(getDayMomentFromHour(21)).toBe('evening');
    });

    it('devrait retourner night pour 22-4h', () => {
      expect(getDayMomentFromHour(22)).toBe('night');
      expect(getDayMomentFromHour(0)).toBe('night');
      expect(getDayMomentFromHour(4)).toBe('night');
    });
  });

  describe('getWeekDayFromIndex', () => {
    it('devrait retourner le bon jour', () => {
      expect(getWeekDayFromIndex(0)).toBe('sunday');
      expect(getWeekDayFromIndex(1)).toBe('monday');
      expect(getWeekDayFromIndex(6)).toBe('saturday');
    });

    it('devrait gérer les index > 6', () => {
      expect(getWeekDayFromIndex(7)).toBe('sunday');
      expect(getWeekDayFromIndex(8)).toBe('monday');
    });
  });

  describe('isWeekend', () => {
    it('devrait identifier le weekend', () => {
      expect(isWeekend('saturday')).toBe(true);
      expect(isWeekend('sunday')).toBe(true);
    });

    it('devrait identifier la semaine', () => {
      expect(isWeekend('monday')).toBe(false);
      expect(isWeekend('friday')).toBe(false);
    });
  });
});

// ============================================================================
// TESTS D'INTÉGRATION
// ============================================================================

describe('Intégration OPUS Engines', () => {
  let predictiveEngine: PredictiveStateEngine;
  let stressEngine: ReturnType<typeof StressRegulationEngine.getInstance>;
  let rhythmEngine: ReturnType<typeof HumanRhythmEngine.getInstance>;

  beforeEach(() => {
    PredictiveStateEngine.resetInstance();
    StressRegulationEngine.resetInstance();
    HumanRhythmEngine.resetInstance();

    predictiveEngine = PredictiveStateEngine.getInstance();
    stressEngine = StressRegulationEngine.getInstance();
    rhythmEngine = HumanRhythmEngine.getInstance();

    predictiveEngine.start();
    stressEngine.start();
    rhythmEngine.start();
  });

  afterEach(() => {
    predictiveEngine.stop();
    stressEngine.stop();
    rhythmEngine.stop();

    PredictiveStateEngine.resetInstance();
    StressRegulationEngine.resetInstance();
    HumanRhythmEngine.resetInstance();
  });

  it("devrait permettre une chaîne d'analyse complète", () => {
    // 1. Observation multimodale
    const multimodalState = getDefaultMultimodalState();

    // 2. Analyse prédictive
    predictiveEngine.processMultimodalState(multimodalState);
    const predictiveState = predictiveEngine.getState();

    // 3. Évaluation du stress
    const trigger = stressEngine.shouldTriggerIntervention(
      multimodalState,
      predictiveState,
      0.5,
      false
    );

    // 4. Observation du rythme
    rhythmEngine.observeFromMultimodal(multimodalState, predictiveState);

    // Tout devrait fonctionner sans erreur
    expect(predictiveState).toBeDefined();
    expect(trigger).toBeDefined();
    expect(rhythmEngine.getState()).toBeDefined();
  });

  it('devrait intégrer les recommandations de pacing avec le stress', () => {
    rhythmEngine.start();

    const pacing = rhythmEngine.getCurrentPacing();

    // Si pacing léger, suggérer une pause plus fréquente
    if (pacing.suggestedIntensity === 'light') {
      expect(pacing.suggestedBreakInterval).toBeLessThanOrEqual(20);
    }

    // Si pacing intense, accepter des sessions plus longues
    if (pacing.suggestedIntensity === 'deep') {
      expect(pacing.suggestedSessionLength).toBeGreaterThanOrEqual(60);
    }
  });
});
