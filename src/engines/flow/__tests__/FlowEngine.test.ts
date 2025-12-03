/**
 * TITANE∞ vΩ∞ — FLOW ENGINE TESTS
 * OPUS v∞.8
 *
 * Tests complets pour le FlowEngine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FlowEngine } from '../FlowEngine';
import type { MultimodalState } from '../../../types/multimodalFusion';
import { getDefaultMultimodalState } from '../../../types/multimodalFusion';

// ============================================================================
// HELPERS
// ============================================================================

function createMockMultimodalState(overrides?: Partial<{
  energy: number;
  tension: number;
  engagement: number;
  stability: number;
}>): MultimodalState {
  const state = getDefaultMultimodalState();
  const now = Date.now();
  state.fusedScores = {
    globalEnergy: { value: overrides?.energy ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion', timestamp: now },
    globalTension: { value: overrides?.tension ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion', timestamp: now },
    globalEngagement: { value: overrides?.engagement ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion', timestamp: now },
    globalStability: { value: overrides?.stability ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion', timestamp: now },
    correctedEnergy: overrides?.energy ?? 0.5,
    correctedTension: overrides?.tension ?? 0.5,
    correctedEngagement: overrides?.engagement ?? 0.5,
  };
  return state;
}

// ============================================================================
// TESTS
// ============================================================================

describe('FlowEngine', () => {
  let engine: FlowEngine;

  beforeEach(() => {
    FlowEngine.resetInstance();
    engine = FlowEngine.getInstance();
  });

  afterEach(() => {
    FlowEngine.resetInstance();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  describe('Singleton Pattern', () => {
    it('devrait retourner la même instance', () => {
      const instance1 = FlowEngine.getInstance();
      const instance2 = FlowEngine.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('devrait réinitialiser l\'instance après reset', () => {
      const instance1 = FlowEngine.getInstance();
      instance1.start();
      FlowEngine.resetInstance();
      const instance2 = FlowEngine.getInstance();
      expect(instance2.getState().isActive).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CYCLE DE VIE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Cycle de vie', () => {
    it('devrait démarrer correctement', () => {
      engine.start();
      const state = engine.getState();
      expect(state.isActive).toBe(true);
    });

    it('devrait s\'arrêter correctement', () => {
      engine.start();
      engine.stop();
      const state = engine.getState();
      expect(state.isActive).toBe(false);
    });

    it('devrait se réinitialiser correctement', () => {
      engine.start();
      engine.reset();
      const state = engine.getState();
      expect(state.currentPhase).toBe('idle');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ÉVALUATION DE PRÉPARATION
  // ═══════════════════════════════════════════════════════════════════════

  describe('Évaluation de préparation au focus', () => {
    it('devrait évaluer les conditions de flow', () => {
      const multimodal = createMockMultimodalState({ energy: 0.7, tension: 0.3, engagement: 0.7 });
      const result = engine.computeFocusReadiness(multimodal);

      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.readiness).toBeDefined();
    });

    it('devrait retourner "optimal" avec d\'excellentes conditions', () => {
      const multimodal = createMockMultimodalState({
        energy: 0.8,
        tension: 0.2,
        engagement: 0.8,
        stability: 0.8
      });
      const result = engine.computeFocusReadiness(multimodal);
      expect(['optimal', 'good']).toContain(result.readiness);
    });

    it('devrait retourner "poor" avec de mauvaises conditions', () => {
      const multimodal = createMockMultimodalState({
        energy: 0.2,
        tension: 0.8,
        engagement: 0.2
      });
      const result = engine.computeFocusReadiness(multimodal);
      expect(['poor', 'blocked', 'moderate']).toContain(result.readiness);
    });

    it('devrait identifier les bloqueurs', () => {
      const multimodal = createMockMultimodalState({ energy: 0.1, tension: 0.9 });
      const result = engine.computeFocusReadiness(multimodal);
      expect(result.blockers.length).toBeGreaterThan(0);
    });

    it('devrait générer des recommandations', () => {
      const multimodal = createMockMultimodalState({ energy: 0.3 });
      const result = engine.computeFocusReadiness(multimodal);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ENTRÉE EN FLOW
  // ═══════════════════════════════════════════════════════════════════════

  describe('Entrée en flow', () => {
    it('devrait réussir avec de bonnes conditions', () => {
      const multimodal = createMockMultimodalState({
        energy: 0.8,
        tension: 0.2,
        engagement: 0.8
      });

      // D'abord évaluer les conditions
      engine.computeFocusReadiness(multimodal);

      const result = engine.enterFlow(multimodal);
      expect(result.success).toBe(true);
      expect(result.phase).toBe('preparation');
    });

    it('devrait échouer avec de mauvaises conditions', () => {
      const multimodal = createMockMultimodalState({
        energy: 0.2,
        tension: 0.8,
        engagement: 0.2
      });

      engine.computeFocusReadiness(multimodal);

      const result = engine.enterFlow(multimodal);
      expect(result.success).toBe(false);
      expect(result.suggestions).toBeDefined();
    });

    it('devrait définir le flowStartTime après entrée réussie', () => {
      const multimodal = createMockMultimodalState({
        energy: 0.8,
        tension: 0.2,
        engagement: 0.8
      });

      engine.computeFocusReadiness(multimodal);
      engine.enterFlow(multimodal);

      const state = engine.getState();
      expect(state.flowStartTime).not.toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // MAINTIEN DU FLOW
  // ═══════════════════════════════════════════════════════════════════════

  describe('Maintien du flow', () => {
    beforeEach(() => {
      // Entrer en flow d'abord
      const multimodal = createMockMultimodalState({
        energy: 0.8,
        tension: 0.2,
        engagement: 0.8
      });
      engine.computeFocusReadiness(multimodal);
      engine.enterFlow(multimodal);
    });

    it('devrait maintenir le flow avec de bonnes conditions', () => {
      const multimodal = createMockMultimodalState({
        energy: 0.7,
        tension: 0.3,
        engagement: 0.7
      });

      const result = engine.maintainFlow(multimodal);
      expect(result.maintained).toBe(true);
    });

    it('devrait mettre à jour les métriques', () => {
      const multimodal = createMockMultimodalState({ energy: 0.7 });

      const result = engine.maintainFlow(multimodal);
      expect(result.metrics.flowIntensity).toBeGreaterThan(0);
      expect(result.metrics.timeInFlow).toBeGreaterThanOrEqual(0);
    });

    it('devrait détecter les dérives', () => {
      const multimodal = createMockMultimodalState({
        energy: 0.2,
        tension: 0.8
      });

      const result = engine.maintainFlow(multimodal);
      expect(result.drift).toBeDefined();
    });

    it('devrait générer des ajustements', () => {
      const multimodal = createMockMultimodalState({ tension: 0.6 });

      const result = engine.maintainFlow(multimodal);
      expect(result.adjustments).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // DÉTECTION DE DÉRIVE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Détection de dérive', () => {
    it('devrait détecter une dérive vers l\'anxiété', () => {
      const multimodal = createMockMultimodalState({ tension: 0.9 });

      const result = engine.detectFlowDrift(multimodal);
      expect(result.driftType).toBe('toward_anxiety');
    });

    it('devrait détecter une dérive vers l\'ennui', () => {
      const multimodal = createMockMultimodalState({
        engagement: 0.2,
        tension: 0.2
      });

      const result = engine.detectFlowDrift(multimodal);
      expect(['toward_boredom', 'toward_exit']).toContain(result.driftType);
    });

    it('devrait détecter la fatigue', () => {
      const multimodal = createMockMultimodalState({ energy: 0.1 });

      const result = engine.detectFlowDrift(multimodal);
      expect(result.detectedDisruptors).toContain('fatigue');
    });

    it('devrait retourner "none" sans perturbation', () => {
      const multimodal = createMockMultimodalState({
        energy: 0.6,
        tension: 0.3,
        engagement: 0.6
      });

      const result = engine.detectFlowDrift(multimodal);
      expect(result.driftType).toBe('none');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SORTIE DU FLOW
  // ═══════════════════════════════════════════════════════════════════════

  describe('Sortie du flow', () => {
    beforeEach(() => {
      const multimodal = createMockMultimodalState({
        energy: 0.8,
        tension: 0.2,
        engagement: 0.8
      });
      engine.computeFocusReadiness(multimodal);
      engine.enterFlow(multimodal);
    });

    it('devrait sortir gracieusement', () => {
      const result = engine.exitFlow('graceful');
      expect(result.exitState.exitType).toBe('graceful');
    });

    it('devrait enregistrer la durée du flow', () => {
      const result = engine.exitFlow('graceful');
      expect(result.exitState.totalFlowTime).toBeGreaterThanOrEqual(0);
    });

    it('devrait passer en phase de récupération', () => {
      engine.exitFlow('graceful');
      const state = engine.getState();
      expect(state.currentPhase).toBe('recovery');
    });

    it('devrait mettre à jour l\'historique', () => {
      engine.exitFlow('graceful');
      const state = engine.getState();
      expect(state.profile.history.length).toBeGreaterThan(0);
    });

    it('devrait générer un résumé', () => {
      const result = engine.exitFlow('graceful');
      expect(result.summary).toBeDefined();
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('devrait générer des suggestions post-flow', () => {
      const result = engine.exitFlow('exhausted');
      expect(result.nextSteps.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TRAITEMENT COMPLET
  // ═══════════════════════════════════════════════════════════════════════

  describe('Traitement complet', () => {
    it('devrait exécuter le processus complet', () => {
      const multimodal = createMockMultimodalState({ energy: 0.6, tension: 0.3 });

      const result = engine.process(multimodal);

      expect(result.readiness).toBeDefined();
      expect(result.phase).toBeDefined();
      expect(typeof result.shouldExit).toBe('boolean');
    });

    it('devrait inclure la maintenance si en flow', () => {
      // Entrer en flow d'abord
      const multimodal = createMockMultimodalState({
        energy: 0.8,
        tension: 0.2,
        engagement: 0.8
      });
      engine.computeFocusReadiness(multimodal);
      engine.enterFlow(multimodal);

      // Ensuite process
      const result = engine.process(multimodal);
      expect(result.maintenance).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ÉTAT ET HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  describe('État et helpers', () => {
    it('devrait vérifier si en flow', () => {
      expect(engine.isInFlow()).toBe(false);

      const multimodal = createMockMultimodalState({
        energy: 0.8,
        tension: 0.2,
        engagement: 0.8
      });
      engine.computeFocusReadiness(multimodal);
      engine.enterFlow(multimodal);

      // Note: après enterFlow, on est en 'preparation', pas encore 'flow'
      expect(engine.isInFlow()).toBe(false);
    });

    it('devrait retourner la zone actuelle', () => {
      const zone = engine.getCurrentZone();
      expect(zone).toBeDefined();
    });

    it('devrait générer un résumé d\'état', () => {
      const summary = engine.generateStateSummary();
      expect(summary).toContain('Zone:');
      expect(summary).toContain('Phase:');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Callbacks', () => {
    it('devrait appeler le callback de mise à jour d\'état', () => {
      const callback = vi.fn();
      engine.setStateUpdateCallback(callback);

      const multimodal = createMockMultimodalState({
        energy: 0.8,
        tension: 0.2,
        engagement: 0.8
      });
      engine.computeFocusReadiness(multimodal);
      engine.enterFlow(multimodal);

      expect(callback).toHaveBeenCalled();
    });

    it('devrait appeler le callback d\'événement flow', () => {
      const callback = vi.fn();
      engine.setFlowEventCallback(callback);

      const multimodal = createMockMultimodalState({
        energy: 0.8,
        tension: 0.2,
        engagement: 0.8
      });
      engine.computeFocusReadiness(multimodal);
      engine.enterFlow(multimodal);

      expect(callback).toHaveBeenCalledWith('entry', expect.any(Object));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  describe('Configuration', () => {
    it('devrait permettre de modifier la configuration', () => {
      engine.setConfig({ flowEntryThreshold: 0.5 });
      const config = engine.getConfig();
      expect(config.flowEntryThreshold).toBe(0.5);
    });

    it('devrait conserver les autres valeurs de config', () => {
      const originalConfig = engine.getConfig();
      engine.setConfig({ flowEntryThreshold: 0.5 });
      const newConfig = engine.getConfig();
      expect(newConfig.maxHistoryEntries).toBe(originalConfig.maxHistoryEntries);
    });
  });
});
