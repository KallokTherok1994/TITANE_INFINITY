import { act, renderHook } from '@/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadForModeMock = vi.fn();
const getStatsMock = vi.fn();
const addMessageToModeMock = vi.fn();
const flushPendingSavesMock = vi.fn();
const clearModeMock = vi.fn();
const autoCleanupIfNeededMock = vi.fn();
const awardExperienceMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/services/chatMemoryCompactor', () => ({
  chatMemoryCompactor: {
    loadForMode: (...args: unknown[]) => loadForModeMock(...args),
    getStats: (...args: unknown[]) => getStatsMock(...args),
    addMessageToMode: (...args: unknown[]) => addMessageToModeMock(...args),
    flushPendingSaves: (...args: unknown[]) => flushPendingSavesMock(...args),
    clearMode: (...args: unknown[]) => clearModeMock(...args),
    autoCleanupIfNeeded: (...args: unknown[]) => autoCleanupIfNeededMock(...args),
  },
}));

vi.mock('@/services/experienceService', () => ({
  awardExperience: (...args: unknown[]) => awardExperienceMock(...args),
}));

vi.mock('@/types/experience', () => ({
  XPSource: {
    ChatMessage: 'ChatMessage',
  },
}));

describe('useChatMemory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadForModeMock.mockReturnValue([]);
    getStatsMock.mockReturnValue({ count: 0, sizeMB: 0, compressed: false });
    addMessageToModeMock.mockImplementation((_mode, message) => [message]);
    autoCleanupIfNeededMock.mockReturnValue({ cleaned: false, sizeMB: 0 });
  });

  it('loads persisted history and stats for the active chat mode', async () => {
    loadForModeMock.mockReturnValue([
      {
        id: 'msg-1',
        role: 'user',
        content: 'Bonjour TITANE',
        timestamp: 100,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'Bonjour, je m’en souviens.',
        timestamp: 200,
      },
    ]);
    getStatsMock.mockReturnValue({ count: 2, sizeMB: 0.002, compressed: false });

    const { useChatMemory } = await import('@/hooks/useChatMemory');
    const { result } = renderHook(() => useChatMemory({ mode: 'default' }));

    expect(loadForModeMock).toHaveBeenCalledWith('default');
    expect(getStatsMock).toHaveBeenCalledWith('default');
    expect(result.current.messagesForMode).toHaveLength(2);
    expect(result.current.memoryStats).toEqual({
      count: 2,
      sizeMB: 0.002,
      compressed: false,
    });
  });

  it('saves chat messages persistently and flushes immediately for durability', async () => {
    const savedMessage = {
      id: 'msg-chat-memory',
      role: 'user' as const,
      content: 'Retiens ORION-482-LICHEN pour la mémoire permanente.',
      timestamp: 123,
      metadata: { source: 'chat' },
    };

    addMessageToModeMock.mockReturnValue([savedMessage]);
    getStatsMock.mockReturnValue({ count: 1, sizeMB: 0.001, compressed: false });

    const { useChatMemory } = await import('@/hooks/useChatMemory');
    const { result } = renderHook(() => useChatMemory({ mode: 'default' }));

    act(() => {
      result.current.saveMessage(savedMessage);
    });

    expect(addMessageToModeMock).toHaveBeenCalledWith('default', savedMessage);
    expect(flushPendingSavesMock).toHaveBeenCalled();
    expect(result.current.messagesForMode.at(-1)?.content).toContain('ORION-482-LICHEN');
    expect(result.current.memoryStats.count).toBe(1);
  });

  it('clears the active mode and resets visible memory state', async () => {
    loadForModeMock.mockReturnValue([
      {
        id: 'msg-1',
        role: 'user',
        content: 'À effacer',
        timestamp: 100,
      },
    ]);
    getStatsMock.mockReturnValue({ count: 1, sizeMB: 0.001, compressed: false });

    const { useChatMemory } = await import('@/hooks/useChatMemory');
    const { result } = renderHook(() => useChatMemory({ mode: 'default' }));

    act(() => {
      result.current.clearMode();
    });

    expect(clearModeMock).toHaveBeenCalledWith('default');
    expect(result.current.messagesForMode).toEqual([]);
    expect(result.current.memoryStats).toEqual({
      count: 0,
      sizeMB: 0,
      compressed: false,
    });
  });
});
