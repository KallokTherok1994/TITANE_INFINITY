/**
 * TITANE∞ vΩ∞ — PRESENCE ENGINE TESTS
 * OPUS v∞.7
 *
 * Tests complets pour le PresenceEngine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PresenceEngine } from '../PresenceEngine';
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
    globalEnergy: { value: overrides?.energy ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion' as const, timestamp: now },
    globalTension: { value: overrides?.tension ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion' as const, timestamp: now },
    globalEngagement: { value: overrides?.engagement ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion' as const, timestamp: now },
    globalStability: { value: overrides?.stability ?? 0.5, confidence: 0.8, variance: 0.1, origin: 'fusion' as const, timestamp: now },
    correctedEnergy: overrides?.energy ?? 0.5,
    correctedTension: overrides?.tension ?? 0.5,
    correctedEngagement: overrides?.engagement ?? 0.5,
  };
  return state;
}

// ============================================================================
// TESTS
// ============================================================================

describe('PresenceEngine', () => {
  let engine: PresenceEngine;

  beforeEach(() => {
    PresenceEngine.resetInstance();
    engine = PresenceEngine.getInstance();
  });

  afterEach(() => {
    PresenceEngine.resetInstance();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  describe('Singleton Pattern', () => {
    it('devrait retourner la même instance', () => {
      const instance1 = PresenceEngine.getInstance();
      const instance2 = PresenceEngine.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('devrait réinitialiser l\'instance après reset', () => {
      const instance1 = PresenceEngine.getInstance();
      instance1.start();
      PresenceEngine.resetInstance();
      const instance2 = PresenceEngine.getInstance();
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
      const multimodal = createMockMultimodalState();
      engine.updatePresenceProfile(multimodal, 'test');
      engine.reset();
      const state = engine.getState();
      expect(state.profile.totalInteractions).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // DÉTECTION D'INTENTION
  // ═══════════════════════════════════════════════════════════════════════

  describe('Détection d\'intention', () => {
    it('devrait détecter l\'intention "advance" avec des verbes d\'action', () => {
      const multimodal = createMockMultimodalState({ energy: 0.7, engagement: 0.7 });
      const result = engine.inferEmergentIntent(multimodal, 'Allons-y, faisons avancer ce projet !');
      expect(result.intent).toBe('advance');
    });

    it('devrait détecter l\'intention "organize" avec des mots d\'organisation', () => {
      const multimodal = createMockMultimodalState();
      const result = engine.inferEmergentIntent(multimodal, 'Je veux faire un plan et organiser mes priorités');
      expect(result.intent).toBe('organize');
    });

    it('devrait détecter l\'intention "slow" avec basse énergie', () => {
      const multimodal = createMockMultimodalState({ energy: 0.2 });
      const result = engine.inferEmergentIntent(multimodal, 'Je sais pas trop, peut-être...');
      expect(result.intent).toBe('slow');
    });

    it('devrait détecter l\'intention "anchor" avec haute tension', () => {
      const multimodal = createMockMultimodalState({ tension: 0.8, stability: 0.3 });
      const result = engine.inferEmergentIntent(multimodal, 'Je me sens stressé');
      expect(['anchor', 'express']).toContain(result.intent);
    });

    it('devrait retourner une confiance appropriée', () => {
      const multimodal = createMockMultimodalState({ energy: 0.8, engagement: 0.8 });
      const result = engine.inferEmergentIntent(multimodal, 'Allons-y, faisons avancer, commençons !');
      expect(['high', 'medium', 'low']).toContain(result.confidence);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CALCUL DU STYLE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Calcul du style de présence', () => {
    it('devrait retourner "supportive" pour haute tension', () => {
      const result = engine.computePresenceStyle('advance', 0.8, 0.5);
      expect(result.style).toBe('supportive');
    });

    it('devrait retourner "concise" pour basse énergie', () => {
      const result = engine.computePresenceStyle('advance', 0.3, 0.2);
      expect(result.style).toBe('concise');
    });

    it('devrait retourner "directive" pour haute énergie et intention advance', () => {
      // Besoin de laisser le temps au style de changer
      engine.setConfig({ minStyleDurationMs: 0 });
      const result = engine.computePresenceStyle('advance', 0.2, 0.85);
      expect(result.style).toBe('directive');
    });

    it('devrait retourner "structured" pour intention organize', () => {
      engine.setConfig({ minStyleDurationMs: 0 });
      const result = engine.computePresenceStyle('organize', 0.3, 0.5);
      expect(result.style).toBe('structured');
    });

    it('devrait inclure des ajustements', () => {
      const result = engine.computePresenceStyle('advance', 0.5, 0.6);
      expect(result.adjustments).toBeDefined();
      expect(typeof result.adjustments.verbosity).toBe('number');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ALIGNEMENT
  // ═══════════════════════════════════════════════════════════════════════

  describe('Calcul d\'alignement', () => {
    it('devrait calculer un score d\'alignement global', () => {
      const multimodal = createMockMultimodalState({ energy: 0.6, tension: 0.3, engagement: 0.7 });
      const result = engine.computeAlignmentScore(multimodal, 'directive');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
    });

    it('devrait calculer toutes les dimensions d\'alignement', () => {
      const multimodal = createMockMultimodalState();
      const result = engine.computeAlignmentScore(multimodal, 'supportive');
      expect(result.intentAlignment).toBeDefined();
      expect(result.energyAlignment).toBeDefined();
      expect(result.rhythmAlignment).toBeDefined();
      expect(result.styleAlignment).toBeDefined();
    });

    it('devrait retourner un bon alignement pour style approprié à la tension', () => {
      const multimodal = createMockMultimodalState({ tension: 0.8 });
      const result = engine.computeAlignmentScore(multimodal, 'supportive');
      expect(result.styleAlignment).toBe(1.0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // MODULATION DE RÉPONSE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Modulation de réponse', () => {
    it('devrait calculer les paramètres de modulation', () => {
      const multimodal = createMockMultimodalState({ energy: 0.3, tension: 0.4 });
      const result = engine.computeResponseModulation(multimodal);
      expect(result.targetLength).toBeDefined();
      expect(result.tone).toBeDefined();
      expect(result.density).toBeDefined();
    });

    it('devrait suggérer une réponse courte pour basse énergie', () => {
      const multimodal = createMockMultimodalState({ energy: 0.2 });
      const result = engine.computeResponseModulation(multimodal);
      expect(['very_short', 'short']).toContain(result.targetLength);
    });

    it('devrait suggérer un ton warm pour style supportive', () => {
      // D'abord définir le style
      engine.setConfig({ minStyleDurationMs: 0 });
      engine.computePresenceStyle('anchor', 0.8, 0.5); // Force supportive

      const multimodal = createMockMultimodalState({ tension: 0.8 });
      const result = engine.computeResponseModulation(multimodal);
      expect(result.tone).toBe('warm');
    });

    it('devrait activer les listes pour intention organize', () => {
      const multimodal = createMockMultimodalState();
      engine.inferEmergentIntent(multimodal, 'Je veux organiser et planifier');
      const result = engine.computeResponseModulation(multimodal);
      expect(result.useLists).toBe(true);
    });

    it('devrait activer le breathing pour haute tension', () => {
      const multimodal = createMockMultimodalState({ tension: 0.8 });
      const result = engine.computeResponseModulation(multimodal);
      expect(result.addBreathing).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // MISE À JOUR DU PROFIL
  // ═══════════════════════════════════════════════════════════════════════

  describe('Mise à jour du profil', () => {
    it('devrait incrémenter le nombre d\'interactions', () => {
      const multimodal = createMockMultimodalState();
      engine.updatePresenceProfile(multimodal, 'test');
      const profile = engine.getProfile();
      expect(profile.totalInteractions).toBe(1);
    });

    it('devrait ajouter à l\'historique', () => {
      const multimodal = createMockMultimodalState();
      engine.updatePresenceProfile(multimodal, 'test');
      const profile = engine.getProfile();
      expect(profile.history.length).toBe(1);
    });

    it('devrait mettre à jour le lastUpdate', () => {
      const before = Date.now();
      const multimodal = createMockMultimodalState();
      engine.updatePresenceProfile(multimodal, 'test');
      const profile = engine.getProfile();
      expect(profile.lastUpdate).toBeGreaterThanOrEqual(before);
    });

    it('devrait calculer la continuité', () => {
      const multimodal = createMockMultimodalState();
      engine.updatePresenceProfile(multimodal, 'test1');
      engine.updatePresenceProfile(multimodal, 'test2');
      const profile = engine.getProfile();
      expect(profile.continuityLevel).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TRAITEMENT COMPLET
  // ═══════════════════════════════════════════════════════════════════════

  describe('Traitement complet', () => {
    it('devrait exécuter le processus complet', () => {
      const multimodal = createMockMultimodalState({ energy: 0.6, tension: 0.3 });
      const result = engine.process(multimodal, 'Je veux avancer sur ce projet');

      expect(result.intent).toBeDefined();
      expect(result.style).toBeDefined();
      expect(result.alignment).toBeDefined();
      expect(result.modulation).toBeDefined();
    });

    it('devrait retourner des résultats cohérents', () => {
      const multimodal = createMockMultimodalState({ energy: 0.7, engagement: 0.8 });
      const result = engine.process(multimodal, 'Allons-y, faisons avancer les choses !');

      expect(result.intent.intent).toBe('advance');
      expect(result.alignment.overallScore).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Callbacks', () => {
    it('devrait appeler le callback de mise à jour d\'état', () => {
      const callback = vi.fn();
      engine.setStateUpdateCallback(callback);

      const multimodal = createMockMultimodalState();
      engine.updatePresenceProfile(multimodal, 'test');

      expect(callback).toHaveBeenCalled();
    });

    it('devrait appeler le callback de changement de style', () => {
      const callback = vi.fn();
      engine.setStyleChangeCallback(callback);
      engine.setConfig({ minStyleDurationMs: 0 });

      // Forcer un changement de style
      engine.computePresenceStyle('anchor', 0.9, 0.5); // supportive

      expect(callback).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // RÉSUMÉ
  // ═══════════════════════════════════════════════════════════════════════

  describe('Génération de résumé', () => {
    it('devrait générer un résumé lisible', () => {
      const multimodal = createMockMultimodalState();
      engine.process(multimodal, 'Test message');

      const summary = engine.generatePresenceSummary();
      expect(summary).toContain('Intention:');
      expect(summary).toContain('Style:');
      expect(summary).toContain('Alignement:');
    });
  });
});
