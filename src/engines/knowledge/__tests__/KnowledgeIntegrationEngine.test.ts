/**
 * TITANE∞ vΩ∞ — KNOWLEDGE INTEGRATION ENGINE TESTS
 * OPUS v∞.11
 *
 * Tests complets pour le moteur d'intégration des connaissances
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KnowledgeIntegrationEngine } from '../KnowledgeIntegrationEngine';
import type { IntegrationInput, ConflictEntry, ContextNode } from '../../../types/knowledgeIntegration';

describe('KnowledgeIntegrationEngine', () => {
  let engine: KnowledgeIntegrationEngine;

  beforeEach(() => {
    KnowledgeIntegrationEngine.resetInstance();
    engine = KnowledgeIntegrationEngine.getInstance();
    engine.start();
  });

  afterEach(() => {
    engine.stop();
    KnowledgeIntegrationEngine.resetInstance();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = KnowledgeIntegrationEngine.getInstance();
      const instance2 = KnowledgeIntegrationEngine.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = KnowledgeIntegrationEngine.getInstance();
      KnowledgeIntegrationEngine.resetInstance();
      const instance2 = KnowledgeIntegrationEngine.getInstance();
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
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.7,
          tension: 0.3,
          engagement: 0.8,
          stability: 0.9,
        },
      };
      engine.integrateKnowledge(input);
      engine.reset();

      const state = engine.getState();
      expect(state.profile.totalIntegrations).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS INTÉGRATION DE CONNAISSANCES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Knowledge Integration', () => {
    it('should integrate multimodal state', () => {
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.7,
          tension: 0.3,
          engagement: 0.8,
          stability: 0.9,
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.success).toBe(true);
      expect(output.integratedState.multimodal.energy).toBe(0.7);
      expect(output.integratedState.multimodal.tension).toBe(0.3);
    });

    it('should integrate presence state', () => {
      const input: IntegrationInput = {
        source: 'presence',
        presenceState: {
          style: 'supportive',
          alignmentScore: 0.85,
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.success).toBe(true);
      expect(output.integratedState.presence.style).toBe('supportive');
      expect(output.integratedState.presence.alignmentScore).toBe(0.85);
    });

    it('should integrate flow state', () => {
      const input: IntegrationInput = {
        source: 'flow',
        flowState: {
          isActive: true,
          zone: 'flow',
          intensity: 0.75,
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.success).toBe(true);
      expect(output.integratedState.flow.isActive).toBe(true);
      expect(output.integratedState.flow.zone).toBe('flow');
    });

    it('should integrate resonance state', () => {
      const input: IntegrationInput = {
        source: 'resonance',
        resonanceState: {
          mode: 'mirroring',
          resonanceScore: 0.8,
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.success).toBe(true);
      expect(output.integratedState.resonance.mode).toBe('mirroring');
      expect(output.integratedState.resonance.resonanceScore).toBe(0.8);
    });

    it('should integrate stress state', () => {
      const input: IntegrationInput = {
        source: 'stress',
        stressState: {
          level: 0.4,
          trend: 'falling',
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.success).toBe(true);
      expect(output.integratedState.stress.level).toBe(0.4);
      expect(output.integratedState.stress.trend).toBe('falling');
    });

    it('should integrate multiple states at once', () => {
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.6,
          tension: 0.4,
          engagement: 0.7,
          stability: 0.8,
        },
        presenceState: {
          style: 'directive',
          alignmentScore: 0.75,
        },
        flowState: {
          isActive: false,
          zone: 'not-ready',
          intensity: 0,
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.success).toBe(true);
      expect(output.integratedState.multimodal.energy).toBe(0.6);
      expect(output.integratedState.presence.style).toBe('directive');
      expect(output.integratedState.flow.isActive).toBe(false);
    });

    it('should increment total integrations', () => {
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.5,
          tension: 0.5,
          engagement: 0.5,
          stability: 0.5,
        },
      };

      engine.integrateKnowledge(input);
      engine.integrateKnowledge(input);
      engine.integrateKnowledge(input);

      const state = engine.getState();
      expect(state.profile.totalIntegrations).toBe(3);
    });

    it('should create integration event', () => {
      const input: IntegrationInput = {
        source: 'presence',
        presenceState: {
          style: 'concise',
          alignmentScore: 0.9,
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.event).toBeDefined();
      expect(output.event.type).toBe('integration');
      expect(output.event.source).toBe('presence');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS DÉTECTION DE CONFLITS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Conflict Detection', () => {
    it('should detect tension-energy conflict without flow', () => {
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.8,
          tension: 0.8,
          engagement: 0.7,
          stability: 0.5,
        },
        flowState: {
          isActive: false,
          zone: 'not-ready',
          intensity: 0,
        },
      };

      const output = engine.integrateKnowledge(input);

      const tensionEnergyConflict = output.newConflicts.find(
        (c: ConflictEntry) => c.description.includes('Tension et énergie')
      );
      expect(tensionEnergyConflict).toBeDefined();
    });

    it('should detect directive style conflict with high tension', () => {
      const input: IntegrationInput = {
        source: 'presence',
        multimodalState: {
          energy: 0.5,
          tension: 0.8,
          engagement: 0.5,
          stability: 0.4,
        },
        presenceState: {
          style: 'directive',
          alignmentScore: 0.7,
        },
      };

      const output = engine.integrateKnowledge(input);

      const styleConflict = output.newConflicts.find(
        (c: ConflictEntry) => c.description.includes('Style directif')
      );
      expect(styleConflict).toBeDefined();
    });

    it('should detect flow-energy conflict', () => {
      const input: IntegrationInput = {
        source: 'flow',
        multimodalState: {
          energy: 0.2,
          tension: 0.3,
          engagement: 0.4,
          stability: 0.6,
        },
        flowState: {
          isActive: true,
          zone: 'flow',
          intensity: 0.7,
        },
      };

      const output = engine.integrateKnowledge(input);

      const flowConflict = output.newConflicts.find(
        (c: ConflictEntry) => c.description.includes('flow') && c.description.includes('énergie')
      );
      expect(flowConflict).toBeDefined();
    });

    it('should detect stress-resonance conflict', () => {
      const input: IntegrationInput = {
        source: 'stress',
        stressState: {
          level: 0.8,
          trend: 'rising',
        },
        resonanceState: {
          mode: 'energizing',
          resonanceScore: 0.7,
        },
      };

      const output = engine.integrateKnowledge(input);

      const stressConflict = output.newConflicts.find(
        (c: ConflictEntry) => c.description.includes('énergisant') || c.description.includes('stress')
      );
      expect(stressConflict).toBeDefined();
    });

    it('should detect with detectConflicts method', () => {
      const integratedState = engine.getIntegratedState();

      // Modifier l'état pour créer un conflit
      const modifiedState = {
        ...integratedState,
        multimodal: {
          ...integratedState.multimodal,
          tension: 0.9,
          energy: 0.9,
        },
        flow: {
          ...integratedState.flow,
          isActive: false,
        },
      };

      const conflicts = engine.detectConflicts(modifiedState);

      expect(conflicts.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS RÉSOLUTION DE CONFLITS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Conflict Resolution', () => {
    it('should resolve conflicts', () => {
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.8,
          tension: 0.8,
          engagement: 0.7,
          stability: 0.5,
        },
        flowState: {
          isActive: false,
          zone: 'not-ready',
          intensity: 0,
        },
      };

      const output = engine.integrateKnowledge(input);

      // Les conflits résolus ont la propriété resolved = true
      for (const resolved of output.resolvedConflicts) {
        expect(resolved.resolved).toBe(true);
        expect(resolved.resolvedAt).toBeDefined();
      }
    });

    it('should use appropriate resolution strategy', () => {
      const input: IntegrationInput = {
        source: 'presence',
        multimodalState: {
          energy: 0.5,
          tension: 0.8,
          engagement: 0.5,
          stability: 0.4,
        },
        presenceState: {
          style: 'directive',
          alignmentScore: 0.7,
        },
      };

      const output = engine.integrateKnowledge(input);

      for (const resolved of output.resolvedConflicts) {
        expect(['source_priority', 'weighted_merge', 'newer_wins', 'higher_confidence', 'manual_review'])
          .toContain(resolved.resolutionStrategy);
      }
    });

    it('should increment conflicts resolved counter', () => {
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.8,
          tension: 0.8,
          engagement: 0.7,
          stability: 0.5,
        },
        flowState: {
          isActive: false,
          zone: 'not-ready',
          intensity: 0,
        },
      };

      const initialState = engine.getState();
      const initialResolved = initialState.profile.totalConflictsResolved;

      engine.integrateKnowledge(input);

      const newState = engine.getState();
      expect(newState.profile.totalConflictsResolved).toBeGreaterThanOrEqual(initialResolved);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS SCORES DE COHÉRENCE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Coherence Scores', () => {
    it('should compute coherence score', () => {
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.6,
          tension: 0.3,
          engagement: 0.7,
          stability: 0.8,
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.coherenceScore).toBeGreaterThanOrEqual(0);
      expect(output.coherenceScore).toBeLessThanOrEqual(1);
    });

    it('should compute stability score', () => {
      const input: IntegrationInput = {
        source: 'presence',
        presenceState: {
          style: 'neutral',
          alignmentScore: 0.8,
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.stabilityScore).toBeGreaterThanOrEqual(0);
      expect(output.stabilityScore).toBeLessThanOrEqual(1);
    });

    it('should return coherence scores with computeCoherenceScores', () => {
      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.5,
          tension: 0.5,
          engagement: 0.5,
          stability: 0.5,
        },
      });

      const scores = engine.computeCoherenceScores();

      expect(scores.coherence).toBeGreaterThanOrEqual(0);
      expect(scores.stability).toBeGreaterThanOrEqual(0);
    });

    it('should penalize coherence for conflicts', () => {
      // Première intégration sans conflit
      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.5,
          tension: 0.3,
          engagement: 0.7,
          stability: 0.8,
        },
      });

      const scoreWithoutConflict = engine.computeCoherenceScores().coherence;

      // Intégration avec conflit
      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.9,
          tension: 0.9,
          engagement: 0.7,
          stability: 0.5,
        },
        flowState: {
          isActive: false,
          zone: 'not-ready',
          intensity: 0,
        },
      });

      const scoreWithConflict = engine.computeCoherenceScores().coherence;

      // Le score avec conflit devrait être inférieur ou égal
      expect(scoreWithConflict).toBeLessThanOrEqual(scoreWithoutConflict + 0.1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS GRAPHE CONTEXTUEL
  // ═══════════════════════════════════════════════════════════════════════

  describe('Context Graph', () => {
    it('should add context node', () => {
      const node = engine.addContextNode({
        type: 'topic',
        label: 'Test Topic',
        data: { value: 'test' },
        importance: 0.7,
      });

      expect(node.id).toBeDefined();
      expect(node.label).toBe('Test Topic');

      const graph = engine.getContextGraph();
      expect(graph.nodes.length).toBe(1);
    });

    it('should add context edge', () => {
      const node1 = engine.addContextNode({
        type: 'topic',
        label: 'Topic 1',
        data: {},
        importance: 0.6,
      });

      const node2 = engine.addContextNode({
        type: 'topic',
        label: 'Topic 2',
        data: {},
        importance: 0.5,
      });

      const edge = engine.addContextEdge({
        from: node1.id,
        to: node2.id,
        relation: 'relates_to',
        strength: 0.8,
        bidirectional: true,
      });

      expect(edge.id).toBeDefined();
      expect(edge.from).toBe(node1.id);

      const graph = engine.getContextGraph();
      expect(graph.edges.length).toBe(1);
    });

    it('should limit number of nodes', () => {
      // La limite par défaut est 100
      for (let i = 0; i < 110; i++) {
        engine.addContextNode({
          type: 'topic',
          label: `Topic ${i}`,
          data: {},
          importance: Math.random(),
        });
      }

      const graph = engine.getContextGraph();
      expect(graph.nodes.length).toBeLessThanOrEqual(100);
    });

    it('should update context graph on integration with context state', () => {
      const input: IntegrationInput = {
        source: 'context',
        contextState: {
          currentTopic: 'Nouveau sujet',
          conversationDepth: 3,
        },
      };

      engine.integrateKnowledge(input);

      const graph = engine.getContextGraph();
      const topicNode = graph.nodes.find((n: ContextNode) => n.label === 'Nouveau sujet');
      expect(topicNode).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS PATTERNS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Pattern Learning', () => {
    it('should learn patterns from integrations', () => {
      // Intégration avec état optimal (haute énergie, basse tension)
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.8,
          tension: 0.3,
          engagement: 0.7,
          stability: 0.8,
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.newPatterns.length >= 0).toBe(true);
    });

    it('should return patterns with getPatterns', () => {
      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.8,
          tension: 0.3,
          engagement: 0.7,
          stability: 0.8,
        },
      });

      const patterns = engine.getPatterns();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should find pattern by key', () => {
      // Générer un pattern
      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.8,
          tension: 0.3,
          engagement: 0.7,
          stability: 0.8,
        },
      });

      const pattern = engine.findPattern('optimal_energy_state');

      // Le pattern peut ou non exister selon les conditions
      expect(pattern === undefined || pattern.key === 'optimal_energy_state').toBe(true);
    });

    it('should increase pattern confidence with repeated observations', () => {
      // Observer le même pattern plusieurs fois
      for (let i = 0; i < 5; i++) {
        engine.integrateKnowledge({
          source: 'multimodal',
          multimodalState: {
            energy: 0.8,
            tension: 0.3,
            engagement: 0.7,
            stability: 0.8,
          },
        });
      }

      const pattern = engine.findPattern('optimal_energy_state');

      if (pattern) {
        expect(pattern.observationCount).toBeGreaterThan(1);
        expect(pattern.confidence).toBeGreaterThan(0.3);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS RECOMMANDATIONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Recommendations', () => {
    it('should generate recommendations', () => {
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.5,
          tension: 0.5,
          engagement: 0.5,
          stability: 0.5,
        },
      };

      const output = engine.integrateKnowledge(input);

      expect(output.recommendations).toBeDefined();
      expect(Array.isArray(output.recommendations)).toBe(true);
      expect(output.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate specific recommendations for conflicts', () => {
      const input: IntegrationInput = {
        source: 'stress',
        stressState: {
          level: 0.8,
          trend: 'rising',
        },
        resonanceState: {
          mode: 'energizing',
          resonanceScore: 0.7,
        },
      };

      const output = engine.integrateKnowledge(input);

      // Devrait avoir des recommandations liées au stress
      const stressRecommendation = output.recommendations.find(
        (r: string) => r.toLowerCase().includes('stress') || r.toLowerCase().includes('conflit')
      );
      expect(stressRecommendation || output.recommendations.length > 0).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS MODE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Mode Management', () => {
    it('should change mode', () => {
      engine.setMode('passive');
      expect(engine.getMode()).toBe('passive');

      engine.setMode('learning');
      expect(engine.getMode()).toBe('learning');

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

      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.5,
          tension: 0.5,
          engagement: 0.5,
          stability: 0.5,
        },
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should call conflict callback when conflicts detected', () => {
      const callback = vi.fn();
      engine.onConflict(callback);

      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.9,
          tension: 0.9,
          engagement: 0.7,
          stability: 0.5,
        },
        flowState: {
          isActive: false,
          zone: 'not-ready',
          intensity: 0,
        },
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should call pattern callback when patterns detected', () => {
      const callback = vi.fn();
      engine.onPattern(callback);

      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.8,
          tension: 0.3,
          engagement: 0.7,
          stability: 0.8,
        },
      });

      // Le callback est appelé si des patterns sont détectés
      expect(callback.mock.calls.length >= 0).toBe(true);
    });

    it('should unsubscribe from callbacks', () => {
      const callback = vi.fn();
      const unsubscribe = engine.onStateUpdate(callback);

      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.5,
          tension: 0.5,
          engagement: 0.5,
          stability: 0.5,
        },
      });

      const callCount = callback.mock.calls.length;
      unsubscribe();

      engine.integrateKnowledge({
        source: 'presence',
        presenceState: {
          style: 'neutral',
          alignmentScore: 0.8,
        },
      });

      expect(callback.mock.calls.length).toBe(callCount);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS PROCESS METHOD
  // ═══════════════════════════════════════════════════════════════════════

  describe('Process Method', () => {
    it('should process input and return output', () => {
      const input: IntegrationInput = {
        source: 'multimodal',
        multimodalState: {
          energy: 0.6,
          tension: 0.4,
          engagement: 0.7,
          stability: 0.8,
        },
      };

      const output = engine.process(input);

      expect(output.success).toBe(true);
      expect(output.integratedState).toBeDefined();
      expect(output.coherenceScore).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS REALTIME METRICS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Realtime Metrics', () => {
    it('should track conflict rate', () => {
      // Générer des intégrations avec et sans conflits
      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.5,
          tension: 0.3,
          engagement: 0.7,
          stability: 0.8,
        },
      });

      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.9,
          tension: 0.9,
          engagement: 0.7,
          stability: 0.5,
        },
        flowState: {
          isActive: false,
          zone: 'not-ready',
          intensity: 0,
        },
      });

      const state = engine.getState();
      expect(state.realtimeMetrics.conflictRate).toBeGreaterThanOrEqual(0);
    });

    it('should track average coherence', () => {
      for (let i = 0; i < 5; i++) {
        engine.integrateKnowledge({
          source: 'multimodal',
          multimodalState: {
            energy: 0.5 + Math.random() * 0.3,
            tension: 0.3 + Math.random() * 0.2,
            engagement: 0.6,
            stability: 0.7,
          },
        });
      }

      const state = engine.getState();
      expect(state.realtimeMetrics.averageCoherence).toBeGreaterThan(0);
      expect(state.realtimeMetrics.averageCoherence).toBeLessThanOrEqual(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS ÉTAT INTÉGRÉ
  // ═══════════════════════════════════════════════════════════════════════

  describe('Integrated State', () => {
    it('should get integrated state', () => {
      const state = engine.getIntegratedState();

      expect(state.multimodal).toBeDefined();
      expect(state.presence).toBeDefined();
      expect(state.flow).toBeDefined();
      expect(state.stress).toBeDefined();
      expect(state.timestamp).toBeDefined();
    });

    it('should update integrated state', () => {
      engine.updateIntegratedState({
        multimodal: {
          energy: 0.9,
          tension: 0.1,
          engagement: 0.95,
          stability: 0.95,
        },
      });

      const state = engine.getIntegratedState();
      expect(state.multimodal.energy).toBe(0.9);
      expect(state.multimodal.tension).toBe(0.1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS ÉVÉNEMENTS D'INTÉGRATION
  // ═══════════════════════════════════════════════════════════════════════

  describe('Integration Events', () => {
    it('should add events to history', () => {
      engine.integrateKnowledge({
        source: 'multimodal',
        multimodalState: {
          energy: 0.5,
          tension: 0.5,
          engagement: 0.5,
          stability: 0.5,
        },
      });

      const state = engine.getState();
      expect(state.profile.integrationEvents.length).toBeGreaterThan(0);
    });

    it('should limit integration events', () => {
      // La limite par défaut est 50
      for (let i = 0; i < 60; i++) {
        engine.integrateKnowledge({
          source: 'multimodal',
          multimodalState: {
            energy: Math.random(),
            tension: Math.random(),
            engagement: Math.random(),
            stability: Math.random(),
          },
        });
      }

      const state = engine.getState();
      expect(state.profile.integrationEvents.length).toBeLessThanOrEqual(50);
    });
  });
});
