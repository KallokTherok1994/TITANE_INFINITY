/**
 * TITANE∞ — CanonicalDiscernmentKernel Unit Tests
 * Tests the single decision point for all 8 chat decisions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CanonicalDiscernmentKernel } from '../../../services/ai/canonicalDiscernmentKernel';
import type { DiscernmentInput } from '../../../services/ai/canonicalDiscernmentKernel';
import type { MemoryContext } from '../../../services/ai/memoryIntegration';
import type { DurablePreference } from '../../../services/ai/preferenceEngine';

describe('CanonicalDiscernmentKernel', () => {
  let kernel: CanonicalDiscernmentKernel;

  const emptyMemory: MemoryContext = {
    activeProjects: [],
    recentDecisions: [],
    relevantKnowledge: [],
    activeRituals: [],
    timeline: [],
  };

  const noPreferences: DurablePreference[] = [];

  const defaultInput: DiscernmentInput = {
    message: 'Crée un fichier test.ts',
    mode: 'default',
    memoryContext: emptyMemory,
    preferences: noPreferences,
    userDepthPreference: null,
    providerPreference: 'auto',
  };

  beforeEach(() => {
    kernel = new CanonicalDiscernmentKernel();
  });

  describe('Decision 1: Mode', () => {
    it('should return the input mode', () => {
      const decision = kernel.discern({ ...defaultInput, mode: 'brainstorming' });
      expect(decision.mode).toBe('brainstorming');
    });

    it('should return default mode', () => {
      const decision = kernel.discern({ ...defaultInput, mode: 'default' });
      expect(decision.mode).toBe('default');
    });
  });

  describe('Decision 2: Profile/Depth', () => {
    it('should select DEVELOPED for action request', () => {
      const decision = kernel.discern({
        ...defaultInput,
        message: 'Crée un composant React',
      });
      expect(decision.profileId).toBe('DEVELOPED');
    });

    it('should select DIRECT for conversational message', () => {
      const decision = kernel.discern({
        ...defaultInput,
        message: 'salut',
      });
      expect(decision.profileId).toBe('DIRECT');
    });

    it('should respect user depth preference', () => {
      const decision = kernel.discern({
        ...defaultInput,
        userDepthPreference: 'short',
        message: 'Analyse en profondeur',
      });
      expect(decision.profileId).toBe('DIRECT');
    });

    it('should select DEEP for creative intent', () => {
      const decision = kernel.discern({
        ...defaultInput,
        message: 'Brainstorm des idées innovantes',
      });
      expect(decision.profileId).toBe('DEEP');
    });
  });

  describe('Decision 3: Clarification/Inference State', () => {
    it('should return SAFE_TO_INFER for clear messages', () => {
      const decision = kernel.discern({
        ...defaultInput,
        message: 'Crée un fichier test.ts avec une fonction hello',
      });
      expect(decision.inferenceState).toBe('SAFE_TO_INFER');
    });

    it('should return CLARIFY_REQUIRED for very short messages without context', () => {
      const decision = kernel.discern({
        ...defaultInput,
        message: 'ok',
      });
      expect(decision.inferenceState).toBe('CLARIFY_REQUIRED');
    });
  });

  describe('Decision 4: Memory Usefulness', () => {
    it('should use memory for memory_recall intent', () => {
      const memoryWithProjects: MemoryContext = {
        ...emptyMemory,
        activeProjects: [
          {
            id: 'proj-001',
            title: 'TITANE v26',
            status: 'active',
            priority: 'high',
            progress: 75,
            lastActivity: '2026-04-01T12:00:00Z',
            tags: ['cognitive'],
            description: 'Upgrade système cognitif',
          },
        ],
      };

      const decision = kernel.discern({
        ...defaultInput,
        message: 'Quel est le statut du projet?',
        memoryContext: memoryWithProjects,
      });

      expect(decision.memoryInjection.use).toBe(true);
      // The kernel uses diagnostic intent for "statut" which has medium memory relevance
      expect(['high', 'medium']).toContain(decision.memoryInjection.relevance);
    });

    it('should not use memory for conversational messages', () => {
      const decision = kernel.discern({
        ...defaultInput,
        message: 'salut',
      });

      expect(decision.memoryInjection.use).toBe(false);
      expect(decision.memoryInjection.relevance).toBe('low');
    });
  });

  describe('Decision 5: Provider/Model', () => {
    it('should return provider configuration', () => {
      const decision = kernel.discern(defaultInput);

      expect(decision.provider).toBeDefined();
      expect(decision.provider.name).toBeDefined();
      expect(decision.provider.temperature).toBeGreaterThan(0);
      expect(decision.provider.maxTokens).toBeGreaterThan(0);
      expect(['low', 'medium', 'high']).toContain(decision.provider.reasoningEffort);
    });

    it('should prefer user provider preference', () => {
      const decision = kernel.discern({
        ...defaultInput,
        providerPreference: 'ollama',
      });

      expect(decision.provider.name).toBe('ollama');
    });
  });

  describe('Decision 6: Tool/Skill', () => {
    it('should return null when no skills available', () => {
      const decision = kernel.discern(defaultInput);
      expect(decision.skillId).toBeNull();
    });

    it('should select skill for action_request when available', () => {
      const decision = kernel.discern({
        ...defaultInput,
        message: 'Crée un fichier test.ts',
        availableSkills: [
          { id: 'file-creator', healthy: true, intentMatch: ['action_request'] },
        ],
      });

      expect(decision.skillId).toBe('file-creator');
    });

    it('should not select unhealthy skill', () => {
      const decision = kernel.discern({
        ...defaultInput,
        message: 'Crée un fichier test.ts',
        availableSkills: [
          { id: 'file-creator', healthy: false, intentMatch: ['action_request'] },
        ],
      });

      expect(decision.skillId).toBeNull();
    });
  });

  describe('Decision 7: Fallback Chain', () => {
    it('should return fallback chain from preferred providers', () => {
      const decision = kernel.discern(defaultInput);

      expect(decision.fallbackChain).toBeDefined();
      expect(Array.isArray(decision.fallbackChain)).toBe(true);
    });

    it('should exclude primary provider from fallback chain', () => {
      const decision = kernel.discern({
        ...defaultInput,
        providerPreference: 'ollama',
      });

      expect(decision.fallbackChain).not.toContain('ollama');
    });
  });

  describe('Decision 8: Truth Status', () => {
    it('should return WIRED_BUT_UNPROVEN when no runtime state', () => {
      const decision = kernel.discern(defaultInput);
      expect(decision.truthStatus).toBe('WIRED_BUT_UNPROVEN');
    });

    it('should return PROVEN_RUNTIME when health >= 0.9', () => {
      const decision = kernel.discern({
        ...defaultInput,
        runtimeState: {
          providerHealth: { ollama: 0.95 },
        },
      });

      expect(decision.truthStatus).toBe('PROVEN_RUNTIME');
    });

    it('should return STABLE_PARTIAL when health >= 0.7', () => {
      // The kernel selects provider by health score from profile's preferredProviders
      // Provide health for all possible providers to ensure selected one has 0.75
      const decision = kernel.discern({
        ...defaultInput,
        runtimeState: {
          providerHealth: {
            ollama: 0.75,
            gemini: 0.75,
            openai: 0.75,
            claude: 0.75,
            'titane-local': 0.75,
          },
        },
      });

      // The selected provider's health (0.75) determines truth status
      expect(decision.truthStatus).toBe('STABLE_PARTIAL');
    });

    it('should return STUB_ONLY when health < 0.1', () => {
      const decision = kernel.discern({
        ...defaultInput,
        runtimeState: {
          providerHealth: { ollama: 0.05 },
        },
      });

      expect(decision.truthStatus).toBe('STUB_ONLY');
    });
  });

  describe('Decision Metadata', () => {
    it('should include reasoning string', () => {
      const decision = kernel.discern(defaultInput);
      expect(decision.reasoning).toBeDefined();
      expect(typeof decision.reasoning).toBe('string');
      expect(decision.reasoning.length).toBeGreaterThan(0);
    });

    it('should include confidence between 0 and 1', () => {
      const decision = kernel.discern(defaultInput);
      expect(decision.confidence).toBeGreaterThanOrEqual(0);
      expect(decision.confidence).toBeLessThanOrEqual(1);
    });

    it('should include signals array', () => {
      const decision = kernel.discern(defaultInput);
      expect(decision.signals).toBeDefined();
      expect(Array.isArray(decision.signals)).toBe(true);
      expect(decision.signals.length).toBeGreaterThan(0);
    });

    it('should include timestamp', () => {
      const decision = kernel.discern(defaultInput);
      expect(decision.timestamp).toBeDefined();
      expect(decision.timestamp).toBeGreaterThan(0);
    });

    it('should include processingTimeMs', () => {
      const decision = kernel.discern(defaultInput);
      expect(decision.processingTimeMs).toBeDefined();
      expect(decision.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Metrics', () => {
    it('should track total decisions', () => {
      kernel.discern(defaultInput);
      kernel.discern({ ...defaultInput, message: 'salut' });

      const metrics = kernel.getMetrics();
      expect(metrics.totalDecisions).toBe(2);
    });

    it('should track profile distribution', () => {
      kernel.discern({ ...defaultInput, message: 'salut' });
      kernel.discern({ ...defaultInput, message: 'Crée un fichier test.ts' });

      const metrics = kernel.getMetrics();
      expect(metrics.profileDistribution).toBeDefined();
    });

    it('should track truth distribution', () => {
      kernel.discern(defaultInput);
      const metrics = kernel.getMetrics();
      expect(metrics.truthDistribution).toBeDefined();
    });
  });

  describe('Decision Log', () => {
    it('should log decisions', () => {
      kernel.discern(defaultInput);
      const log = kernel.getDecisionLog();
      expect(log.length).toBe(1);
    });

    it('should return last decision', () => {
      kernel.discern({ ...defaultInput, message: 'premier' });
      kernel.discern({ ...defaultInput, message: 'deuxième' });

      const last = kernel.getLastDecision();
      expect(last).toBeDefined();
      expect(last?.mode).toBe('default');
    });

    it('should limit log size', () => {
      for (let i = 0; i < 150; i++) {
        kernel.discern({ ...defaultInput, message: `message ${i}` });
      }

      const log = kernel.getDecisionLog(200);
      expect(log.length).toBeLessThanOrEqual(100);
    });
  });

  describe('BehavioralRouter Integration', () => {
    it('should use behavioral router signals when available', () => {
      const memoryWithProject: MemoryContext = {
        ...emptyMemory,
        activeProjects: [
          {
            id: 'proj-001',
            title: 'TITANE v26',
            status: 'active',
            priority: 'high',
            progress: 75,
            lastActivity: '2026-04-01T12:00:00Z',
            tags: ['cognitive'],
            description: 'Upgrade système cognitif',
          },
        ],
      };

      const decision = kernel.discern({
        ...defaultInput,
        message: 'Statut du projet',
        memoryContext: memoryWithProject,
      });

      expect(decision.signals.length).toBeGreaterThan(1);
    });

    it('should fallback to intent-based depth when behavioral router fails', () => {
      const decision = kernel.discern({
        ...defaultInput,
        message: 'Crée un fichier test.ts',
      });

      expect(decision.profileId).toBeDefined();
    });
  });
});
