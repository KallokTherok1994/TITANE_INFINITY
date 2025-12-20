/**
 * TITANE_INFINITY v26.x — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@/test-utils';
import { useAudioStreaming, useStreamingState } from '@/hooks/useAudioStreaming';

let stateListener: ((state: 'Idle' | 'Listening' | 'Recording' | 'Processing') => void) | null =
  null;
let chunkListener: ((chunk: number[]) => void) | null = null;

const unsubscribeState = vi.fn();
const unsubscribeChunk = vi.fn();

vi.mock('../services/audio/audioStreaming', () => {
  const audioStreamingService = {
    onStateChange: vi.fn((cb: (state: any) => void) => {
      stateListener = cb;
      return unsubscribeState;
    }),
    onAudioChunk: vi.fn((cb: (chunk: number[]) => void) => {
      chunkListener = cb;
      return unsubscribeChunk;
    }),

    startStreaming: vi.fn<
      (config?: Record<string, unknown>) => Promise<string>
    >().mockResolvedValue('session-1'),
    stopStreaming: vi.fn<
      () => Promise<{
        audioData: number[];
        durationMs: number;
        sampleRate: number;
        hasSpeech: boolean;
        vadConfidence: number;
      }>
    >().mockResolvedValue({
      audioData: [1, 2, 3],
      durationMs: 1000,
      sampleRate: 16000,
      hasSpeech: true,
      vadConfidence: 0.9,
    }),
    forceStop: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),

    getStats: vi.fn<
      () => Promise<{ availableSamples: number; totalWritten: number; isActive: boolean }>
    >().mockResolvedValue({
      availableSamples: 42,
      totalWritten: 100,
      isActive: true,
    }),

    isActive: vi.fn<() => boolean>().mockReturnValue(false),
  };

  return {
    audioStreamingService,
  };
});

// Import the mocked service for assertions
import { audioStreamingService } from '../services/audio/audioStreaming';

describe('useAudioStreaming', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    stateListener = null;
    chunkListener = null;

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initialise l’état par défaut', () => {
    const { result } = renderHook(() => useAudioStreaming());

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.state).toBe('Idle');
    expect(result.current.stats).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.sessionId).toBe(null);

    expect(audioStreamingService.onStateChange).toHaveBeenCalledTimes(1);
    expect(audioStreamingService.onAudioChunk).toHaveBeenCalledTimes(1);
  });

  it('ne se ré-abonne pas sur rerender et utilise la dernière callback onStateChange', async () => {
    const onStateChangeA = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }: { cb: (state: 'Idle' | 'Listening' | 'Recording' | 'Processing') => void }) =>
        useAudioStreaming({ onStateChange: cb }),
      {
        initialProps: { cb: onStateChangeA },
      }
    );

    expect(audioStreamingService.onStateChange).toHaveBeenCalledTimes(1);

    await act(async () => {
      stateListener?.('Listening');
    });

    expect(result.current.state).toBe('Listening');
    expect(onStateChangeA).toHaveBeenCalledWith('Listening');

    const onStateChangeB = vi.fn();
    rerender({ cb: onStateChangeB });

    expect(audioStreamingService.onStateChange).toHaveBeenCalledTimes(1);

    await act(async () => {
      stateListener?.('Recording');
    });

    expect(result.current.state).toBe('Recording');
    expect(onStateChangeA).toHaveBeenCalledTimes(1);
    expect(onStateChangeB).toHaveBeenCalledWith('Recording');
  });

  it('utilise la dernière callback onAudioChunk après rerender', async () => {
    const onAudioChunkA = vi.fn();
    const { rerender } = renderHook(
      ({ cb }: { cb: (chunk: number[]) => void }) => useAudioStreaming({ onAudioChunk: cb }),
      {
        initialProps: { cb: onAudioChunkA },
      }
    );

    await act(async () => {
      chunkListener?.([1, 2]);
    });
    expect(onAudioChunkA).toHaveBeenCalledWith([1, 2]);

    const onAudioChunkB = vi.fn();
    rerender({ cb: onAudioChunkB });

    await act(async () => {
      chunkListener?.([3, 4]);
    });

    expect(onAudioChunkA).toHaveBeenCalledTimes(1);
    expect(onAudioChunkB).toHaveBeenCalledWith([3, 4]);
  });

  it('startStreaming met à jour sessionId/isStreaming et lance le polling stats', async () => {
    const { result } = renderHook(() => useAudioStreaming());

    await act(async () => {
      await result.current.startStreaming();
    });

    expect(result.current.isStreaming).toBe(true);

    expect(audioStreamingService.startStreaming).toHaveBeenCalledTimes(1);
    expect(result.current.isStreaming).toBe(true);
    expect(result.current.sessionId).toBe('session-1');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(audioStreamingService.getStats).toHaveBeenCalledTimes(1);
    expect(result.current.stats).toEqual({
      availableSamples: 42,
      totalWritten: 100,
      isActive: true,
    });
  });

  it('stopStreaming retourne le résultat, reset l’état, et appelle onStreamingComplete', async () => {
    const onStreamingComplete = vi.fn();
    const { result } = renderHook(() =>
      useAudioStreaming({ onStreamingComplete })
    );

    await act(async () => {
      await result.current.startStreaming();
    });

    const stopResult = await act(async () => {
      return await result.current.stopStreaming();
    });

    expect(audioStreamingService.stopStreaming).toHaveBeenCalledTimes(1);
    expect(stopResult).toEqual({
      audioData: [1, 2, 3],
      durationMs: 1000,
      sampleRate: 16000,
      hasSpeech: true,
      vadConfidence: 0.9,
    });

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.sessionId).toBe(null);
    expect(result.current.state).toBe('Idle');

    expect(onStreamingComplete).toHaveBeenCalledWith({
      audioData: [1, 2, 3],
      durationMs: 1000,
      sampleRate: 16000,
      hasSpeech: true,
      vadConfidence: 0.9,
    });
  });

  it('forceStop reset l’état côté hook', async () => {
    const { result } = renderHook(() => useAudioStreaming());

    await act(async () => {
      await result.current.startStreaming();
    });

    await act(async () => {
      await result.current.forceStop();
    });

    expect(audioStreamingService.forceStop).toHaveBeenCalledTimes(1);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.sessionId).toBe(null);
    expect(result.current.state).toBe('Idle');
    expect(result.current.stats).toBe(null);
  });

  it('cleanup unsubscribe et stoppe le polling stats au unmount', async () => {
    const { result, unmount } = renderHook(() => useAudioStreaming());

    await act(async () => {
      await result.current.startStreaming();
    });

    expect(result.current.isStreaming).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(audioStreamingService.getStats).toHaveBeenCalledTimes(1);

    unmount();

    expect(unsubscribeState).toHaveBeenCalledTimes(1);
    expect(unsubscribeChunk).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(audioStreamingService.getStats).toHaveBeenCalledTimes(1);
  });
});

describe('useStreamingState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stateListener = null;
  });

  it('expose state + isActive, et réagit aux événements de state', async () => {
    vi.mocked(audioStreamingService.isActive).mockReturnValue(true);

    const { result } = renderHook(() => useStreamingState());

    expect(result.current.isActive).toBe(true);
    expect(result.current.state).toBe('Idle');

    await act(async () => {
      stateListener?.('Processing');
    });

    expect(result.current.state).toBe('Processing');
  });
});
