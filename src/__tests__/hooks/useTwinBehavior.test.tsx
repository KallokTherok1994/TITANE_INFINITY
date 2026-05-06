import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook, waitFor } from '@/test-utils';
import { useTwinBehavior } from '@/hooks/useTwinBehavior';
import { numericTwinService } from '@/services/api/numericTwin';

vi.mock('@/services/api/numericTwin', () => ({
  numericTwinService: {
    observeValue: vi.fn(),
    observeCognitivePattern: vi.fn(),
    observeStyle: vi.fn(),
    observeEmotional: vi.fn(),
    refreshChatContextSnapshot: vi.fn(),
  },
}));

describe('useTwinBehavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refreshes the shared Twin chat snapshot after a successful observation', async () => {
    vi.mocked(numericTwinService.observeValue).mockResolvedValue('sync-value-1');
    vi.mocked(numericTwinService.refreshChatContextSnapshot).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTwinBehavior());

    await act(async () => {
      await result.current.observeValue('alignement', 'session', 0.8);
    });

    await waitFor(() => {
      expect(result.current.observations).toHaveLength(1);
    });

    expect(result.current.observations[0]).toMatchObject({
      id: 'sync-value-1',
      type: 'value',
      content: 'alignement',
      context: 'session',
      confidence: 0.8,
    });
    expect(numericTwinService.refreshChatContextSnapshot).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it('keeps the observation but surfaces a non-blocking warning when snapshot refresh fails', async () => {
    vi.mocked(numericTwinService.observeStyle).mockResolvedValue('sync-style-1');
    vi.mocked(numericTwinService.refreshChatContextSnapshot).mockRejectedValue(
      new Error('gateway down')
    );

    const { result } = renderHook(() => useTwinBehavior());

    await act(async () => {
      await result.current.observeStyle('structured framework', 'ui reasoning', 0.9);
    });

    await waitFor(() => {
      expect(result.current.observations).toHaveLength(1);
    });

    expect(result.current.observations[0]).toMatchObject({
      id: 'sync-style-1',
      type: 'style',
    });
    expect(result.current.error).toContain('Observation enregistrée, actualisation Twin en attente');
    expect(result.current.error).toContain('gateway down');
  });

  it('returns null and does not refresh the snapshot when the observation fails', async () => {
    vi.mocked(numericTwinService.observeEmotional).mockRejectedValue(new Error('observe failed'));

    const { result } = renderHook(() => useTwinBehavior());
    let returnedId: string | null = 'placeholder';

    await act(async () => {
      returnedId = await result.current.observeEmotional('apaisement', 'session', 0.6);
    });

    expect(returnedId).toBeNull();
    expect(result.current.observations).toHaveLength(0);
    expect(result.current.error).toBe('observe failed');
    expect(numericTwinService.refreshChatContextSnapshot).not.toHaveBeenCalled();
  });
});