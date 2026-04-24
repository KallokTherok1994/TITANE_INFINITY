import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadBrowserExperienceService() {
  vi.resetModules();
  vi.doMock('@/utils/tauriProtector', () => ({
    isTauriRuntimeAvailable: () => false,
  }));

  return import('@/services/experienceService');
}

async function loadTauriExperienceService(secureInvokeMock: ReturnType<typeof vi.fn>) {
  vi.resetModules();
  vi.doMock('@/utils/tauriProtector', () => ({
    isTauriRuntimeAvailable: () => true,
  }));
  vi.doMock('@/lib/security', () => ({
    secureInvoke: secureInvokeMock,
  }));

  return import('@/services/experienceService');
}

async function createStoredExperienceState(totalChatXp: number) {
  const { createDefaultExperienceState } = await import('@/types/experience');
  const state = createDefaultExperienceState();
  state.domains.chat.xp = totalChatXp;
  state.domains.chat.level = 0;
  state.totalXp = totalChatXp;
  state.level = 99;
  state.history = [
    {
      id: 'stored-chat-xp',
      domainId: 'chat',
      amount: totalChatXp,
      source: 'chat_message',
      timestamp: Date.now() - 1000,
    },
  ];
  return state;
}

describe('experienceService chat XP synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('loads existing local XP before awarding chat XP', async () => {
    localStorage.setItem(
      'titane_experience',
      JSON.stringify(await createStoredExperienceState(40))
    );

    const service = await loadBrowserExperienceService();

    await service.awardExperience('chat', 5, 'chat_message', {
      messageLength: 28,
    });

    const state = service.getExperienceState();
    expect(state.totalXp).toBe(45);
    expect(state.domains.chat?.xp).toBe(45);
    expect(state.level).toBe(0);
    expect(state.history[0]).toEqual(
      expect.objectContaining({
        domainId: 'chat',
        amount: 5,
        source: 'chat_message',
      })
    );
  });

  it('does not wipe chat-awarded XP when the XP page initializes afterward', async () => {
    const service = await loadBrowserExperienceService();

    await service.awardExperience('chat', 5, 'chat_message');
    await service.awardExperience('chat', 8, 'chat_quality_bonus');
    await service.awardExperience('cognitive', 5, 'chat_titane_response');
    await service.initExperienceService();

    const state = service.getExperienceState();
    expect(state.totalXp).toBe(18);
    expect(state.domains.chat?.xp).toBe(13);
    expect(state.domains.cognitive?.xp).toBe(5);
    expect(state.history.map(event => event.source)).toEqual([
      'chat_titane_response',
      'chat_quality_bonus',
      'chat_message',
    ]);

    const persisted = JSON.parse(localStorage.getItem('titane_experience') ?? '{}');
    expect(persisted.totalXp).toBe(18);
  });

  it('normalizes stale stored totals and levels from domain XP', async () => {
    localStorage.setItem(
      'titane_experience',
      JSON.stringify(await createStoredExperienceState(145))
    );

    const service = await loadBrowserExperienceService();

    await service.initExperienceService();

    const state = service.getExperienceState();
    expect(state.totalXp).toBe(145);
    expect(state.level).toBe(1);
    expect(state.domains.chat?.level).toBe(1);
  });

  it('keeps local chat XP when Tauri returns an empty persisted state', async () => {
    const backendDefaultState = await createStoredExperienceState(0);
    backendDefaultState.history = [];
    backendDefaultState.lastUpdated = Date.now() - 5000;

    const localState = await createStoredExperienceState(90);
    localState.lastUpdated = Date.now();
    localStorage.setItem('titane_experience', JSON.stringify(localState));

    let syncedBackendState: unknown = null;
    const secureInvokeMock = vi.fn(
      async (cmd: string, payload?: Record<string, unknown>) => {
        if (cmd === 'experience_get_state') {
          return backendDefaultState;
        }
        if (cmd === 'experience_update_state') {
          syncedBackendState = payload?.state;
          return { ok: true, content: null, error: null };
        }
        return null;
      }
    );

    const service = await loadTauriExperienceService(secureInvokeMock);

    await service.initExperienceService();

    const state = service.getExperienceState();
    expect(state.totalXp).toBe(90);
    expect(state.domains.chat?.xp).toBe(90);
    expect(syncedBackendState).toEqual(
      expect.objectContaining({
        totalXp: 90,
      })
    );
    expect(JSON.parse(localStorage.getItem('titane_experience') ?? '{}')).toEqual(
      expect.objectContaining({
        totalXp: 90,
      })
    );
  });
});
