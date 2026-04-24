/**
 * TITANE∞ — BehavioralRouter Unit Tests
 * Tests the unified decision-making controller
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BehavioralRouter } from '@/services/ai/behavioralRouter';
import type { BehavioralSignal } from '@/services/ai/behavioralRouter';
import type { MemoryContext } from '@/services/ai/memoryIntegration';
import type { DurablePreference } from '@/services/ai/preferenceEngine';
import type { IntentClassification } from '@/services/ai/responsePolicy';

describe('BehavioralRouter', () => {
  let router: BehavioralRouter;

  const emptyMemory: MemoryContext = {
    activeProjects: [],
    recentDecisions: [],
    relevantKnowledge: [],
    activeRituals: [],
    timeline: [],
  };

  const noPreferences: DurablePreference[] = [];

  const defaultIntent: IntentClassification = {
    intent: 'information_request',
    confidence: 0.8,
    signals: ['test_signal'],
    freshnessRequired: 'stable',
    memoryRelevance: 'medium',
  };

  beforeEach(() => {
    router = new BehavioralRouter();
  });

  describe('EVAL A — Low ambiguity / action request', () => {
    it('should select DEVELOPED profile for action request', () => {
      const intent: IntentClassification = {
        intent: 'action_request',
        confidence: 0.9,
        signals: ['crée', 'fais'],
        freshnessRequired: 'stable',
        memoryRelevance: 'high',
      };

      const decision = router.route(
        'Crée un fichier test.ts',
        emptyMemory,
        noPreferences,
        intent,
        'default'
      );

      expect(decision.profileId).toBe('DEVELOPED');
      expect(decision.confidence).toBeGreaterThan(0.5);
      expect(decision.reasoning).toContain('action_request');
    });
  });

  describe('EVAL B — Preference reuse', () => {
    it('should respect user depth preference over intent', () => {
      const prefShort: DurablePreference[] = [
        {
          id: 'depth:short',
          category: 'depth',
          value: 'short',
          durability: 0.9,
          confidence: 0.9,
          lastSeen: Date.now(),
          firstSeen: Date.now(),
          source: 'explicit',
          timesConfirmed: 5,
        },
      ];

      const decision = router.route(
        'Analyse en profondeur',
        emptyMemory,
        prefShort,
        defaultIntent,
        'default'
      );

      // Preference should override intent-based DEEP
      expect(decision.profileId).toBe('DIRECT');
      expect(decision.reasoning).toContain('préférence');
    });
  });

  describe('EVAL C — Memory-first response', () => {
    it('should boost depth when memory is relevant', () => {
      const memoryWithProject: MemoryContext = {
        activeProjects: [
          {
            id: 'proj-001',
            title: 'TITANE v26',
            status: 'active',
            priority: 'high',
            progress: 75,
            lastActivity: '2026-04-01T12:00:00Z',
            tags: ['cognitive', 'upgrade'],
            description: 'Upgrade du système cognitif',
          },
        ],
        recentDecisions: [],
        relevantKnowledge: [],
        activeRituals: [],
        timeline: [],
      };

      const intentHighMemory: IntentClassification = {
        intent: 'memory_recall',
        confidence: 0.85,
        signals: ['souviens'],
        freshnessRequired: 'stable',
        memoryRelevance: 'high',
      };

      const signals = router.collectSignals(
        'Quel est le statut du projet TITANE?',
        memoryWithProject,
        noPreferences,
        intentHighMemory
      );

      // Should have memory context signal
      const memorySignals = signals.filter(s => s.source === 'memory');
      expect(memorySignals.length).toBeGreaterThan(0);
    });
  });

  describe('EVAL D — Research analysis depth', () => {
    it('should select DEEP profile for research_analysis intent', () => {
      const intentResearch: IntentClassification = {
        intent: 'research_analysis',
        confidence: 0.85,
        signals: ['recherche', 'internet'],
        freshnessRequired: 'current',
        memoryRelevance: 'low',
      };

      const decision = router.route(
        'Recherche sur internet les dernières avancées en IA',
        emptyMemory,
        noPreferences,
        intentResearch,
        'default'
      );

      expect(decision.profileId).toBe('DEEP');
      expect(decision.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('EVAL E — Ambiguity threshold', () => {
    it('should select DIRECT for short messages', () => {
      const intentConversational: IntentClassification = {
        intent: 'conversational',
        confidence: 0.9,
        signals: ['salut'],
        freshnessRequired: 'stable',
        memoryRelevance: 'low',
      };

      const decision = router.route(
        'salut',
        emptyMemory,
        noPreferences,
        intentConversational,
        'default'
      );

      expect(decision.profileId).toBe('DIRECT');
    });
  });

  describe('Conflict resolution', () => {
    it('should resolve conflicts with preference priority', () => {
      const signals: BehavioralSignal[] = [
        {
          source: 'intent',
          type: 'depth_hint',
          value: 'DEEP',
          confidence: 0.8,
          timestamp: Date.now(),
        },
        {
          source: 'preference',
          type: 'depth_hint',
          value: 'DIRECT',
          confidence: 0.9,
          timestamp: Date.now(),
        },
        {
          source: 'memory',
          type: 'depth_hint',
          value: 'DEVELOPED',
          confidence: 0.7,
          timestamp: Date.now(),
        },
      ];

      const resolved = router.resolveConflicts(signals);

      // Preference (priority 4) should win over memory (3) and intent (2)
      const depthSignal = resolved.find(s => s.type === 'depth_hint');
      expect(depthSignal?.source).toBe('preference');
      expect(depthSignal?.value).toBe('DIRECT');
    });
  });

  describe('Initiative detection', () => {
    it('should detect stagnant project and suggest reminder', () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      const memoryWithStagnantProject: MemoryContext = {
        activeProjects: [
          {
            id: 'proj-001',
            title: 'TITANE v26',
            status: 'active',
            priority: 'high',
            progress: 30,
            lastActivity: eightDaysAgo,
            tags: ['cognitive'],
            description: 'Upgrade système cognitif',
          },
        ],
        recentDecisions: [],
        relevantKnowledge: [],
        activeRituals: [],
        timeline: [],
      };

      const decision = router.route(
        'Quoi de neuf ?',
        memoryWithStagnantProject,
        noPreferences,
        defaultIntent,
        'default'
      );

      expect(decision.initiativeAction).toBeDefined();
      expect(decision.initiativeAction?.type).toBe('remind');
      expect(decision.initiativeAction?.trigger).toBe('stagnant_project');
      expect(decision.initiativeAction?.priority).toBe('high');
    });

    it('should detect pending high-impact decision', () => {
      const memoryWithPendingDecision: MemoryContext = {
        activeProjects: [],
        recentDecisions: [
          {
            id: 'dec-001',
            title: 'Choix du provider IA',
            timestamp: '2026-03-20',
            category: 'strategic',
            impact: 'high',
            status: 'pending',
            rationale: 'Comparaison Gemini vs Claude',
          },
        ],
        relevantKnowledge: [],
        activeRituals: [],
        timeline: [],
      };

      const decision = router.route(
        'Comment ça va ?',
        memoryWithPendingDecision,
        noPreferences,
        defaultIntent,
        'default'
      );

      expect(decision.initiativeAction).toBeDefined();
      expect(decision.initiativeAction?.type).toBe('remind');
      expect(decision.initiativeAction?.trigger).toBe('pending_decision');
    });

    it('should not detect initiative when disabled', () => {
      const disabledRouter = new BehavioralRouter({ enableInitiative: false });

      const decision = disabledRouter.route(
        'Quoi de neuf ?',
        emptyMemory,
        noPreferences,
        defaultIntent,
        'default'
      );

      expect(decision.initiativeAction).toBeUndefined();
    });
  });
});
