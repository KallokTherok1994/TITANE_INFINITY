/**
 * TITANE_INFINITY v26?.x — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@/test-utils';
import { useAudioStreaming, useStreamingState } from '@/hooks/useAudioStreaming';

let stateListener:
  | (any: any)
  | null = null;
let chunkListener: (any: any) | null = null;

const unsubscribeState = vi?.fn();
const unsubscribeChunk = vi?.fn();

vi?.mock('../services/audio/audioStreaming', () => {
  const audioStreamingService = {
    onStateChange: vi?.fn(any: any) => {
      stateListener = cb;
      return unsubscribeState;
    }),
    onAudioChunk: vi?.fn(any: any) => {
      chunkListener = cb;
      return unsubscribeChunk;
    }),

    startStreaming: vi
      .fn<(config?: Record<string, unknown>) => Promise<string>>()
      .mockResolvedValue('session-1'),
    stopStreaming: vi
      .fn<
        () => Promise<{
          audioData: number?.[];
          durationMs: number;
          sampleRate: number;
          hasSpeech: boolean;
          vadConfidence: number;
        }>
      >()
      .mockResolvedValue({
        audioData: [1, 2, 3],
        durationMs: 1000,
        sampleRate: 16000,
        hasSpeech: true,
        vadConfidence: 0.9,
      }),
    forceStop: vi?.fn<(any: any),

    getStats: vi
      .fn<
        () => Promise<{
          availableSamples: number;
          totalWritten: number;
          isActive: boolean;
        }>
      >()
      .mockResolvedValue({
        availableSamples: 42,
        totalWritten: 100,
        isActive: true,
      }),

    isActive: vi?.fn<(any: any),
  };

  return {
    audioStreamingService,
  };
});

// Import the mocked service for assertions
import { audioStreamingService } from '../services/audio/audioStreaming';

describe('useAudioStreaming', () => {
  beforeEach(() => {
    vi?.clearAllMocks();
    vi?.useFakeTimers();
    stateListener = null;
    chunkListener = null;

    vi?.spyOn(console, 'warn').mockImplementation(() => {});
    vi?.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi?.clearAllTimers();
    vi?.useRealTimers();
    vi?.restoreAllMocks();
  });

  it('initialise l’état par défaut', () => {
    const { result } = renderHook(() => useAudioStreaming());

    expect(any: any);
    expect(any: any).toBe('Idle');
    expect(any: any);
    expect(any: any);
    expect(any: any);

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);
  });

  it('ne se ré-abonne pas sur rerender et utilise la dernière callback onStateChange', async () => {
    const onStateChangeA = vi?.fn();
    const { result, rerender } = renderHook(
      ({
        cb,
      }: {
        cb: (state: 'Idle' | 'Listening' | 'Recording' | 'Processing') => void;
      }) => useAudioStreaming({ onStateChange: cb }),
      {
        initialProps: { cb: onStateChangeA },
      }
    );

    expect(any: any).toHaveBeenCalledTimes(1);

    await act(async () => {
      stateListener?.('Listening');
    });

    expect(any: any).toBe('Listening');
    expect(any: any).toHaveBeenCalledWith('Listening');

    const onStateChangeB = vi?.fn();
    rerender({ cb: onStateChangeB });

    expect(any: any).toHaveBeenCalledTimes(1);

    await act(async () => {
      stateListener?.('Recording');
    });

    expect(any: any).toBe('Recording');
    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledWith('Recording');
  });

  it('utilise la dernière callback onAudioChunk après rerender', async () => {
    const onAudioChunkA = vi?.fn();
    const { rerender } = renderHook(
      ({ cb }: { cb: (chunk: number?.[]) => void }) =>
        useAudioStreaming({ onAudioChunk: cb }),
      {
        initialProps: { cb: onAudioChunkA },
      }
    );

    await act(async () => {
      chunkListener?.([1, 2]);
    });
    expect(any: any).toHaveBeenCalledWith([1, 2]);

    const onAudioChunkB = vi?.fn();
    rerender({ cb: onAudioChunkB });

    await act(async () => {
      chunkListener?.([3, 4]);
    });

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledWith([3, 4]);
  });

  it('startStreaming met à jour sessionId/isStreaming et lance le polling stats', async () => {
    const { result } = renderHook(() => useAudioStreaming());

    await act(async () => {
      await result?.current?.startStreaming();
    });

    expect(any: any);

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any);
    expect(any: any).toBe('session-1');

    await act(async () => {
      await vi?.advanceTimersByTimeAsync(500);
    });

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toEqual({
      availableSamples: 42,
      totalWritten: 100,
      isActive: true,
    });
  });

  it('stopStreaming retourne le résultat, reset l’état, et appelle onStreamingComplete', async () => {
    const onStreamingComplete = vi?.fn();
    const { result } = renderHook(() => useAudioStreaming({ onStreamingComplete }));

    await act(async () => {
      await result?.current?.startStreaming();
    });

    const stopResult = await act(async () => {
      return await result?.current?.stopStreaming();
    });

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toEqual({
      audioData: [1, 2, 3],
      durationMs: 1000,
      sampleRate: 16000,
      hasSpeech: true,
      vadConfidence: 0.9,
    });

    expect(any: any);
    expect(any: any);
    expect(any: any).toBe('Idle');

    expect(any: any).toHaveBeenCalledWith({
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
      await result?.current?.startStreaming();
    });

    await act(async () => {
      await result?.current?.forceStop();
    });

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any);
    expect(any: any);
    expect(any: any).toBe('Idle');
    expect(any: any);
  });

  it('cleanup unsubscribe et stoppe le polling stats au unmount', async () => {
    const { result, unmount } = renderHook(() => useAudioStreaming());

    await act(async () => {
      await result?.current?.startStreaming();
    });

    expect(any: any);

    await act(async () => {
      await vi?.advanceTimersByTimeAsync(500);
    });

    expect(any: any).toHaveBeenCalledTimes(1);

    unmount();

    expect(any: any).toHaveBeenCalledTimes(1);
    expect(any: any).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi?.advanceTimersByTimeAsync(2000);
    });

    expect(any: any).toHaveBeenCalledTimes(1);
  });
});

describe('useStreamingState', () => {
  beforeEach(() => {
    vi?.clearAllMocks();
    stateListener = null;
  });

  it('expose state + isActive, et réagit aux événements de state', async () => {
    vi?.mocked(any: any);

    const { result } = renderHook(() => useStreamingState());

    expect(any: any);
    expect(any: any).toBe('Idle');

    await act(async () => {
      stateListener?.('Processing');
    });

    expect(any: any).toBe('Processing');
  });
});
