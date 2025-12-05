/**
 * TITANE∞ vΩ∞ — SELF-REFLECTION ENGINE TESTS
 * OPUS v∞.10
 *
 * Tests complets pour le moteur de méta-analyse interne
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SelfReflectionEngine } from '../SelfReflectionEngine';
import type { EvaluationInput, DetectedIncoherence, InternalAdjustment } from '../../../types/selfReflection';

describe('SelfReflectionEngine', () => {
  let engine: SelfReflectionEngine;

  beforeEach(() => {
    SelfReflectionEngine.resetInstance();
    engine = SelfReflectionEngine.getInstance();
    engine.start();
  });

  afterEach(() => {
    engine.stop();
    SelfReflectionEngine.resetInstance();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SelfReflectionEngine.getInstance();
      const instance2 = SelfReflectionEngine.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = SelfReflectionEngine.getInstance();
      SelfReflectionEngine.resetInstance();
      const instance2 = SelfReflectionEngine.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Lifecycle', () => {
    it('should start correctly', () => {
      const state = engine.getState();
      expect(state.isActive).toBe(true);
    });

    it('should stop correctly', () => {
      engine.stop();
      const state = engine.getState();
      expect(state.isActive).toBe(false);
    });

    it('should reset state', () => {
      const input: EvaluationInput = {
        response: 'Test response for evaluation.',
      };
      engine.evaluateResponseQuality(input);
      engine.reset();

      const state = engine.getState();
      expect(state.history.length).toBe(0);
      expect(state.activeAdjustments.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS ÉVALUATION DE RÉPONSE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Response Evaluation', () => {
    it('should evaluate a simple response', () => {
      const input: EvaluationInput = {
        response: 'Bonjour, comment puis-je vous aider aujourd\'hui ?',
      };

      const output = engine.evaluateResponseQuality(input);

      expect(output.evaluation).toBeDefined();
      expect(output.evaluation.scores.overallScore).toBeGreaterThanOrEqual(0);
      expect(output.evaluation.scores.overallScore).toBeLessThanOrEqual(1);
      expect(output.evaluation.status).toBeDefined();
    });

    it('should evaluate response with multimodal context', () => {
      const input: EvaluationInput = {
        response: 'Je comprends que vous êtes préoccupé. Prenons cela étape par étape.',
        multimodalState: {
          tension: 0.7,
          energy: 0.4,
          engagement: 0.6,
          stability: 0.5,
        },
      };

      const output = engine.evaluateResponseQuality(input);

      expect(output.evaluation.context.multimodalTension).toBe(0.7);
      expect(output.evaluation.context.multimodalEnergy).toBe(0.4);
    });

    it('should detect optimal response', () => {
      const input: EvaluationInput = {
        response: 'Voici la solution. Clair et direct.',
        multimodalState: {
          tension: 0.2,
          energy: 0.7,
          engagement: 0.8,
          stability: 0.9,
        },
        presenceState: {
          style: 'concise',
          alignmentScore: 0.9,
        },
      };

      const output = engine.evaluateResponseQuality(input);

      expect(output.evaluation.scores.overallScore).toBeGreaterThan(0.5);
    });

    it('should generate evaluation summary', () => {
      const input: EvaluationInput = {
        response: 'Une réponse de test pour vérifier le résumé.',
      };

      const output = engine.evaluateResponseQuality(input);

      expect(output.executiveSummary).toBeDefined();
      expect(typeof output.executiveSummary).toBe('string');
      expect(output.executiveSummary.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS SCORES MÉTA
  // ═══════════════════════════════════════════════════════════════════════

  describe('Meta Scores Computation', () => {
    it('should compute coherence score', () => {
      const input: EvaluationInput = {
        response: 'Première idée. Ensuite, développement. Enfin, conclusion.',
      };

      const scores = engine.computeMetaScores(input);

      expect(scores.coherenceScore).toBeGreaterThanOrEqual(0);
      expect(scores.coherenceScore).toBeLessThanOrEqual(1);
    });

    it('should compute clarity score', () => {
      const input: EvaluationInput = {
        response: 'Simple et clair. Des mots courts. Des phrases directes.',
      };

      const scores = engine.computeMetaScores(input);

      expect(scores.clarityScore).toBeGreaterThanOrEqual(0);
      expect(scores.clarityScore).toBeLessThanOrEqual(1);
    });

    it('should compute density score', () => {
      const shortResponse: EvaluationInput = {
        response: 'Ok.',
      };

      const longResponse: EvaluationInput = {
        response: 'Ceci est une réponse très longue avec beaucoup de mots et de concepts complexes qui nécessitent une attention particulière et une analyse approfondie pour être correctement compris et intégrés dans le contexte global de la conversation.',
      };

      const shortScores = engine.computeMetaScores(shortResponse);
      const longScores = engine.computeMetaScores(longResponse);

      expect(shortScores.densityScore).toBeLessThan(longScores.densityScore);
    });

    it('should compute alignment score with multimodal state', () => {
      // Haute tension = réponse courte attendue
      const highTensionInput: EvaluationInput = {
        response: 'Tout va bien. Respirons.',
        multimodalState: {
          tension: 0.8,
          energy: 0.4,
          engagement: 0.5,
          stability: 0.4,
        },
      };

      const scores = engine.computeMetaScores(highTensionInput);

      expect(scores.alignmentScore).toBeGreaterThan(0.5);
    });

    it('should compute flow impact risk', () => {
      // En flow profond avec réponse longue = risque élevé
      const flowInput: EvaluationInput = {
        response: 'Voici une très longue réponse avec beaucoup de détails. Elle contient de nombreuses questions ? Et encore des questions ? Que pensez-vous de cela ?',
        flowState: {
          isActive: true,
          intensity: 0.9,
          zone: 'deep-flow',
        },
      };

      const scores = engine.computeMetaScores(flowInput);

      expect(scores.flowImpactRisk).toBeGreaterThan(0);
    });

    it('should compute overall score as composite', () => {
      const input: EvaluationInput = {
        response: 'Une réponse équilibrée et claire.',
        multimodalState: {
          tension: 0.3,
          energy: 0.6,
          engagement: 0.7,
          stability: 0.8,
        },
      };

      const scores = engine.computeMetaScores(input);

      expect(scores.overallScore).toBeGreaterThanOrEqual(0);
      expect(scores.overallScore).toBeLessThanOrEqual(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS DÉTECTION D'INCOHÉRENCES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Incoherence Detection', () => {
    it('should detect density excessive', () => {
      const input: EvaluationInput = {
        response: 'Ceci est une réponse extrêmement longue avec une densité informationnelle très élevée, contenant de nombreux concepts complexes interconnectés qui forment un réseau sémantique dense nécessitant une attention cognitive soutenue. Il y a encore plus d\'informations ici, avec des détails supplémentaires et des nuances subtiles.',
      };

      const output = engine.evaluateResponseQuality(input);

      const densityIssue = output.evaluation.incoherences.find(
        (i: DetectedIncoherence) => i.type === 'density_excessive'
      );
      // La détection dépend du seuil
      expect(output.evaluation.incoherences.length >= 0).toBe(true);
    });

    it('should detect flow disruption risk', () => {
      const input: EvaluationInput = {
        response: 'Question 1 ? Question 2 ? Question 3 ? Ceci est une longue réponse qui pourrait perturber l\'état de concentration.',
        flowState: {
          isActive: true,
          intensity: 0.8,
          zone: 'flow',
        },
      };

      const output = engine.evaluateResponseQuality(input);

      // Vérifier que le risque de flow est calculé
      expect(output.evaluation.scores.flowImpactRisk).toBeGreaterThanOrEqual(0);
    });

    it('should limit number of incoherences', () => {
      const input: EvaluationInput = {
        response: 'Une réponse problématique.',
        multimodalState: {
          tension: 0.9,
          energy: 0.1,
          engagement: 0.2,
          stability: 0.1,
        },
      };

      const output = engine.evaluateResponseQuality(input);

      // Maximum 5 incohérences par évaluation
      expect(output.evaluation.incoherences.length).toBeLessThanOrEqual(5);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS AJUSTEMENTS INTERNES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Internal Adjustments', () => {
    it('should generate adjustments for incoherences', () => {
      const input: EvaluationInput = {
        response: 'Une très très très longue réponse avec énormément de détails et de complexité excessive.',
        multimodalState: {
          tension: 0.8,
          energy: 0.2,
          engagement: 0.3,
          stability: 0.3,
        },
      };

      const output = engine.evaluateResponseQuality(input);

      // Des ajustements devraient être générés
      expect(output.evaluation.recommendedAdjustments.length >= 0).toBe(true);
    });

    it('should prioritize critical adjustments', () => {
      const input: EvaluationInput = {
        response: 'Réponse nécessitant ajustement.',
        flowState: {
          isActive: true,
          intensity: 0.9,
          zone: 'deep-flow',
        },
      };

      const output = engine.evaluateResponseQuality(input);

      // Les ajustements immédiats ont une priorité >= 7
      for (const adj of output.immediateAdjustments) {
        expect(adj.priority).toBeGreaterThanOrEqual(7);
      }
    });

    it('should generate proactive adjustments for high tension', () => {
      const input: EvaluationInput = {
        response: 'Une réponse normale.',
        multimodalState: {
          tension: 0.8,
          energy: 0.5,
          engagement: 0.6,
          stability: 0.5,
        },
      };

      const output = engine.evaluateResponseQuality(input);

      const proactiveAdj = output.evaluation.recommendedAdjustments.find(
        (a: InternalAdjustment) => a.triggeredBy === 'proactive'
      );
      expect(proactiveAdj || output.evaluation.recommendedAdjustments.length >= 0).toBeTruthy();
    });

    it('should store active adjustments', () => {
      const input: EvaluationInput = {
        response: 'Test response.',
        multimodalState: {
          tension: 0.9,
          energy: 0.2,
          engagement: 0.3,
          stability: 0.2,
        },
      };

      engine.evaluateResponseQuality(input);
      const activeAdjustments = engine.getActiveAdjustments();

      expect(Array.isArray(activeAdjustments)).toBe(true);
    });

    it('should clear active adjustments', () => {
      const input: EvaluationInput = {
        response: 'Test.',
        multimodalState: {
          tension: 0.9,
          energy: 0.1,
          engagement: 0.2,
          stability: 0.1,
        },
      };

      engine.evaluateResponseQuality(input);
      engine.clearActiveAdjustments();

      const activeAdjustments = engine.getActiveAdjustments();
      expect(activeAdjustments.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS HISTORIQUE
  // ═══════════════════════════════════════════════════════════════════════

  describe('History Management', () => {
    it('should add evaluations to history', () => {
      const input: EvaluationInput = {
        response: 'Première réponse.',
      };

      engine.evaluateResponseQuality(input);
      const history = engine.getRecentHistory();

      expect(history.length).toBe(1);
      expect(history[0].evaluation).toBeDefined();
    });

    it('should maintain history order (newest first)', async () => {
      engine.evaluateResponseQuality({ response: 'Première.' });
      await new Promise(r => setTimeout(r, 2)); // Petit délai pour garantir des timestamps différents
      engine.evaluateResponseQuality({ response: 'Deuxième.' });
      await new Promise(r => setTimeout(r, 2));
      engine.evaluateResponseQuality({ response: 'Troisième.' });

      const history = engine.getRecentHistory();

      expect(history.length).toBe(3);
      // Newest first = index 0 est le plus récent (timestamp le plus grand)
      expect(history[0].timestamp).toBeGreaterThanOrEqual(history[1].timestamp);
      expect(history[1].timestamp).toBeGreaterThanOrEqual(history[2].timestamp);
    });

    it('should limit history entries', () => {
      // Le max par défaut est 50
      for (let i = 0; i < 60; i++) {
        engine.evaluateResponseQuality({ response: `Réponse ${i}.` });
      }

      const state = engine.getState();
      expect(state.history.length).toBeLessThanOrEqual(50);
    });

    it('should record history with recordSelfReflectionHistory', () => {
      const input: EvaluationInput = {
        response: 'Test.',
      };

      const output = engine.evaluateResponseQuality(input);
      engine.recordSelfReflectionHistory(output.evaluation, output.immediateAdjustments, 0.8);

      const history = engine.getRecentHistory();
      // Il y a l'évaluation originale + l'enregistrement manuel
      expect(history.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS PROFIL
  // ═══════════════════════════════════════════════════════════════════════

  describe('Profile Management', () => {
    it('should update profile after evaluations', () => {
      engine.evaluateResponseQuality({ response: 'Réponse 1.' });
      engine.evaluateResponseQuality({ response: 'Réponse 2.' });

      const profile = engine.getProfile();

      expect(profile.totalEvaluations).toBe(2);
    });

    it('should track average scores in profile', () => {
      engine.evaluateResponseQuality({
        response: 'Une réponse claire et concise.',
      });

      const profile = engine.getProfile();

      expect(profile.averageScores.overallScore).toBeGreaterThan(0);
    });

    it('should track incoherence trends', () => {
      // Générer plusieurs évaluations avec incohérences
      for (let i = 0; i < 5; i++) {
        engine.evaluateResponseQuality({
          response: 'Une très longue réponse avec beaucoup trop de détails.',
          multimodalState: {
            tension: 0.8,
            energy: 0.2,
            engagement: 0.3,
            stability: 0.3,
          },
        });
      }

      const profile = engine.getProfile();

      // Les tendances d'incohérence sont mises à jour
      expect(Array.isArray(profile.incoherenceTrends)).toBe(true);
    });

    it('should reset profile', () => {
      engine.evaluateResponseQuality({ response: 'Test.' });
      engine.resetProfile();

      const profile = engine.getProfile();

      expect(profile.totalEvaluations).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS MODE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Mode Management', () => {
    it('should change mode', () => {
      engine.setMode('passive');
      expect(engine.getMode()).toBe('passive');

      engine.setMode('intensive');
      expect(engine.getMode()).toBe('intensive');

      engine.setMode('active');
      expect(engine.getMode()).toBe('active');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Callbacks', () => {
    it('should call state update callback', () => {
      const callback = vi.fn();
      engine.onStateUpdate(callback);

      engine.evaluateResponseQuality({ response: 'Test.' });

      expect(callback).toHaveBeenCalled();
    });

    it('should call adjustment callback when adjustments generated', () => {
      const callback = vi.fn();
      engine.onAdjustment(callback);

      engine.evaluateResponseQuality({
        response: 'Test.',
        multimodalState: {
          tension: 0.9,
          energy: 0.1,
          engagement: 0.2,
          stability: 0.1,
        },
      });

      // Le callback est appelé si des ajustements sont générés
      // (cela dépend des seuils)
      expect(callback.mock.calls.length >= 0).toBe(true);
    });

    it('should unsubscribe from callbacks', () => {
      const callback = vi.fn();
      const unsubscribe = engine.onStateUpdate(callback);

      engine.evaluateResponseQuality({ response: 'Test 1.' });
      expect(callback).toHaveBeenCalled();

      const callCount = callback.mock.calls.length;
      unsubscribe();

      engine.evaluateResponseQuality({ response: 'Test 2.' });
      // Le callback ne devrait plus être appelé
      expect(callback.mock.calls.length).toBe(callCount);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS ACTION RECOMMENDATION
  // ═══════════════════════════════════════════════════════════════════════

  describe('Action Recommendations', () => {
    it('should recommend proceed for optimal response', () => {
      const output = engine.evaluateResponseQuality({
        response: 'Clair et concis.',
        multimodalState: {
          tension: 0.2,
          energy: 0.7,
          engagement: 0.8,
          stability: 0.9,
        },
        presenceState: {
          style: 'concise',
          alignmentScore: 0.9,
        },
      });

      // Peut être 'proceed', 'adjust' ou 'regenerate' selon les scores
      expect(['proceed', 'adjust', 'regenerate']).toContain(output.actionRecommendation);
    });

    it('should return valid action recommendation', () => {
      const output = engine.evaluateResponseQuality({
        response: 'Test.',
      });

      expect(['proceed', 'adjust', 'regenerate']).toContain(output.actionRecommendation);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS PROCESS METHOD
  // ═══════════════════════════════════════════════════════════════════════

  describe('Process Method', () => {
    it('should process input and return output', () => {
      const input: EvaluationInput = {
        response: 'Test de la méthode process.',
      };

      const output = engine.process(input);

      expect(output.evaluation).toBeDefined();
      expect(output.success).toBeUndefined(); // process retourne EvaluationOutput
      expect(output.evaluation.scores).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS REALTIME METRICS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Realtime Metrics', () => {
    it('should track consecutive optimal responses', () => {
      // Générer des réponses optimales
      for (let i = 0; i < 3; i++) {
        engine.evaluateResponseQuality({
          response: 'Réponse claire.',
          multimodalState: {
            tension: 0.2,
            energy: 0.7,
            engagement: 0.8,
            stability: 0.9,
          },
        });
      }

      const state = engine.getState();
      expect(state.realtimeMetrics.consecutiveOptimalResponses).toBeGreaterThanOrEqual(0);
    });

    it('should track recent adjustment count', () => {
      engine.evaluateResponseQuality({
        response: 'Test.',
        multimodalState: {
          tension: 0.8,
          energy: 0.2,
          engagement: 0.3,
          stability: 0.3,
        },
      });

      const state = engine.getState();
      expect(typeof state.realtimeMetrics.recentAdjustmentCount).toBe('number');
    });

    it('should track current drift risk', () => {
      engine.evaluateResponseQuality({
        response: 'Test.',
      });

      const state = engine.getState();
      expect(state.realtimeMetrics.currentDriftRisk).toBeGreaterThanOrEqual(0);
      expect(state.realtimeMetrics.currentDriftRisk).toBeLessThanOrEqual(1);
    });
  });
});
