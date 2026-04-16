/**
 * TITANE∞ — BehavioralRouter Integration Tests
 * Verifies the router's decision actually flows into profile selection
 */

import { describe, it, expect } from 'vitest';
import { behavioralRouter } from '../../../services/ai/behavioralRouter';
import { getEffectiveProfile } from '../../../services/ai/responsePolicy';
import type { MemoryContext } from '../../../services/ai/memoryIntegration';
import type { DurablePreference } from '../../../services/ai/preferenceEngine';
import type { IntentClassification } from '../../../services/ai/responsePolicy';

describe('BehavioralRouter → Profile Selection Integration', () => {
  const emptyMemory: MemoryContext = {
    activeProjects: [],
    recentDecisions: [],
    relevantKnowledge: [],
    activeRituals: [],
    timeline: [],
  };

  it('should flow DIRECT preference through router to getEffectiveProfile', () => {
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

    const intent: IntentClassification = {
      intent: 'creative',
      confidence: 0.8,
      signals: ['idée'],
      freshnessRequired: 'stable',
      memoryRelevance: 'medium',
    };

    // Router decides DIRECT (preference overrides creative → DEEP)
    const decision = behavioralRouter.route(
      'Donne-moi une idée',
      emptyMemory,
      prefShort,
      intent,
      'default'
    );

    expect(decision.profileId).toBe('DIRECT');

    // Flow into getEffectiveProfile with router's decision as override
    const { profile } = getEffectiveProfile(
      'default',
      'Donne-moi une idée',
      undefined,
      undefined,
      decision.profileId
    );

    expect(profile.id).toBe('DIRECT');
    expect(profile.maxTokens).toBe(1024);
  });

  it('should flow DEVELOPED intent through router to getEffectiveProfile', () => {
    const intent: IntentClassification = {
      intent: 'action_request',
      confidence: 0.9,
      signals: ['crée'],
      freshnessRequired: 'stable',
      memoryRelevance: 'high',
    };

    const decision = behavioralRouter.route(
      'Crée un composant React',
      emptyMemory,
      [],
      intent,
      'default'
    );

    expect(decision.profileId).toBe('DEVELOPED');

    const { profile } = getEffectiveProfile(
      'default',
      'Crée un composant React',
      undefined,
      undefined,
      decision.profileId
    );

    expect(profile.id).toBe('DEVELOPED');
    expect(profile.maxTokens).toBe(32768);
    expect(profile.reasoningEffort).toBe('high');
  });

  it('should flow DEEP intent through router to getEffectiveProfile', () => {
    const intent: IntentClassification = {
      intent: 'creative',
      confidence: 0.85,
      signals: ['brainstorm'],
      freshnessRequired: 'stable',
      memoryRelevance: 'medium',
    };

    const decision = behavioralRouter.route(
      'Brainstorm des idées innovantes',
      emptyMemory,
      [],
      intent,
      'default'
    );

    expect(decision.profileId).toBe('DEEP');

    const { profile } = getEffectiveProfile(
      'default',
      'Brainstorm des idées innovantes',
      undefined,
      undefined,
      decision.profileId
    );

    expect(profile.id).toBe('DEEP');
    expect(profile.maxTokens).toBe(24576);
  });
});
