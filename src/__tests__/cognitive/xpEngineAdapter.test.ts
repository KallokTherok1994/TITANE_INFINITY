import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = vi.hoisted(() => {
  const listeners = new Set<(state: any) => void>();
  const buildState = () => ({
    totalXp: 118,
    level: 1,
    domains: {
      chat: {
        id: 'chat',
        label: 'Chat IA',
        description: 'Interactions conversationnelles',
        xp: 113,
        level: 1,
        category: 'cognitive',
        lastUpdated: 1,
      },
      cognitive: {
        id: 'cognitive',
        label: 'Cognition',
        description: 'Analyse',
        xp: 5,
        level: 0,
        category: 'cognitive',
        lastUpdated: 1,
      },
    },
    history: [
      {
        id: 'quality-1',
        domainId: 'chat',
        amount: 8,
        source: 'chat_quality_bonus',
        metadata: { qualityTier: 'excellent' },
        timestamp: 3,
      },
      {
        id: 'message-2',
        domainId: 'chat',
        amount: 5,
        source: 'chat_message',
        timestamp: 2,
      },
      {
        id: 'message-1',
        domainId: 'chat',
        amount: 100,
        source: 'chat_message',
        timestamp: 1,
      },
      {
        id: 'response-1',
        domainId: 'cognitive',
        amount: 5,
        source: 'chat_titane_response',
        timestamp: 1,
      },
    ],
    lastUpdated: 3,
    version: '1.0.0',
  });

  return {
    listeners,
    state: buildState(),
    buildState,
    initExperienceService: vi.fn(async () => undefined),
    getExperienceState: vi.fn(() => serviceMock.state),
    awardExperience: vi.fn(async (domainId: string, amount: number, source: string, metadata?: Record<string, unknown>) => {
      serviceMock.state = {
        ...serviceMock.state,
        totalXp: serviceMock.state.totalXp + amount,
        history: [
          {
            id: 'awarded-event',
            domainId,
            amount,
            source,
            metadata,
            timestamp: 4,
          },
          ...serviceMock.state.history,
        ],
        lastUpdated: 4,
      };
      serviceMock.listeners.forEach(listener => listener(serviceMock.state));
      return serviceMock.state.domains[domainId] ?? null;
    }),
    subscribeToExperience: vi.fn((listener: (state: any) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }),
    resetExperienceState: vi.fn(async () => {
      serviceMock.state = {
        ...serviceMock.buildState(),
        totalXp: 0,
        history: [],
        lastUpdated: 5,
      };
      serviceMock.listeners.forEach(listener => listener(serviceMock.state));
    }),
  };
});

vi.mock('@/services/experienceService', () => ({
  initExperienceService: serviceMock.initExperienceService,
  getExperienceState: serviceMock.getExperienceState,
  awardExperience: serviceMock.awardExperience,
  subscribeToExperience: serviceMock.subscribeToExperience,
  resetExperienceState: serviceMock.resetExperienceState,
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('xpEngine adapter', () => {
  beforeEach(() => {
    serviceMock.state = serviceMock.buildState();
    serviceMock.listeners.clear();
    vi.clearAllMocks();
  });

  it('derives progression state from canonical ExperienceState history', async () => {
    const { createProgressionStateFromExperience } = await import(
      '@/cognitive/progression/xpEngine'
    );

    const progression = createProgressionStateFromExperience(serviceMock.state as any);

    expect(progression.totalXP).toBe(118);
    expect(progression.level).toBe(1);
    expect(progression.chatMessageCount).toBe(2);
    expect(progression.lastQualityTier).toBe('excellent');
    expect(progression.qualityTierCounts.excellent).toBe(1);
    expect(progression.unlockedMilestones).toContain('first_message');
  });

  it('delegates XP writes to experienceService without local progression persistence', async () => {
    const { xpEngine } = await import('@/cognitive/progression/xpEngine');

    await xpEngine.addXP(5, 'chat_message', 'Message test', { provider: 'vitest' });

    expect(serviceMock.awardExperience).toHaveBeenCalledWith(
      'chat',
      5,
      'chat_message',
      expect.objectContaining({
        description: 'Message test',
        provider: 'vitest',
      })
    );
    expect(localStorage.getItem('titane_progression_state')).toBeNull();
    expect(xpEngine.getState().totalXP).toBe(123);
    expect(xpEngine.getState().chatMessageCount).toBe(3);
  });
});
