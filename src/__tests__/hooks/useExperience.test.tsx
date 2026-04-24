import { act, renderHook, waitFor } from '@/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExperienceState } from '@/types/experience';

let currentState: ExperienceState;
let experienceListener: ((state: ExperienceState) => void) | null = null;

const initExperienceServiceMock = vi.fn(async () => undefined);
const awardExperienceMock = vi.fn(async () => null);
const getDomainMock = vi.fn();

const buildState = (chatXp: number, cognitiveXp: number): ExperienceState => ({
  totalXp: chatXp + cognitiveXp,
  level: chatXp + cognitiveXp >= 100 ? 1 : 0,
  domains: {
    chat: {
      id: 'chat',
      label: 'Chat IA',
      description: 'Interactions conversationnelles',
      xp: chatXp,
      level: chatXp >= 100 ? 1 : 0,
      category: 'cognitive',
      lastUpdated: 1,
      icon: '💬',
    },
    cognitive: {
      id: 'cognitive',
      label: 'Cognition',
      description: 'Analyse',
      xp: cognitiveXp,
      level: cognitiveXp >= 100 ? 1 : 0,
      category: 'cognitive',
      lastUpdated: 1,
      icon: '🧠',
    },
  },
  history: [],
  lastUpdated: 1,
  version: '1.0.0',
});

vi.mock('@/services/experienceService', () => ({
  initExperienceService: initExperienceServiceMock,
  getExperienceState: () => currentState,
  awardExperience: awardExperienceMock,
  subscribeToExperience: (listener: (state: ExperienceState) => void) => {
    experienceListener = listener;
    return () => {
      experienceListener = null;
    };
  },
  getDomain: getDomainMock,
}));

describe('useExperience', () => {
  beforeEach(() => {
    currentState = buildState(0, 0);
    experienceListener = null;
    initExperienceServiceMock.mockClear();
    awardExperienceMock.mockClear();
    getDomainMock.mockClear();
  });

  it('derives page XP values from the subscribed state update', async () => {
    const { useExperience } = await import('@/hooks/useExperience');
    const { result } = renderHook(() => useExperience());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updatedState = buildState(90, 15);
    act(() => {
      experienceListener?.(updatedState);
    });

    expect(result.current.totalXp).toBe(105);
    expect(result.current.level).toBe(1);
    expect(result.current.domains.map(domain => domain.id)).toEqual([
      'chat',
      'cognitive',
    ]);
    expect(result.current.xpForNextLevel).toBe(400);
    expect(result.current.progress).toBeGreaterThan(0);
  });
});
