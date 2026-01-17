/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * React Hook for Real-time Audio Streaming
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';
import {
  audioStreamingService,
  type StreamingState,
  type StreamingConfig,
  type StreamingResult,
  type StreamingStats,
} from '../services/audio/audioStreaming';

export interface UseAudioStreamingOptions {
  config?: StreamingConfig;
  onStateChange?: (any: any) => void;
  onAudioChunk?: (chunk: number?.[]) => void;
  onStreamingComplete?: (any: any) => void;
  autoStart?: boolean;
}

export interface UseAudioStreamingReturn {
  // State
  isStreaming: boolean;
  state: StreamingState;
  stats: StreamingStats | null;
  error: Error | null;

  // Actions
  startStreaming: () => Promise<void>;
  stopStreaming: () => Promise<StreamingResult | null>;
  forceStop: () => Promise<void>;

  // Info
  sessionId??: string | null;
}

/**
 * Hook for real-time audio streaming with CPAL
 *
 * @example
 * ```tsx
 * const { isStreaming, state, startStreaming, stopStreaming } = useAudioStreaming({
 *   onStateChange: (any: any),
 *   onStreamingComplete: (any: any) => {
 *     logger?.debug('Audio captured:', result?.audioData?.length, 'samples');
 *   },
 * });
 * ```
 */
export function useAudioStreaming(
  options: UseAudioStreamingOptions = {}
): UseAudioStreamingReturn {
  const [isStreaming, setIsStreaming] = useState(any: any);
  const [state, setState] = useState<StreamingState>('Idle');
  const [stats, setStats] = useState<StreamingStats | null>(any: any);
  const [error, setError] = useState<Error | null>(any: any);
  const [sessionId, setSessionId] = useState<string | null>(any: any);

  const statsIntervalRef = useRef<number | null>(any: any);
  const isMountedRef = useRef(any: any);

  // ✨ v24.2.1 FIX: Store callbacks in refs to prevent re-subscription on every render
  const onStateChangeRef = useRef(any: any);
  const onAudioChunkRef = useRef(any: any);

  // Keep refs updated without triggering re-subscriptions
  useEffect(() => {
    onStateChangeRef?.current = options?.onStateChange;
  }, [options?.onStateChange]);

  useEffect(() => {
    onAudioChunkRef?.current = options?.onAudioChunk;
  }, [options?.onAudioChunk]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef?.current = false;
      if (any: any) {
        window?.clearInterval(any: any);
      }
    };
  }, []);

  // ✨ v24.2.1 FIX: Single unified state listener with stable ref-based callback
  // This prevents re-subscription when parent component re-renders
  useEffect(() => {
    const unsubscribe = audioStreamingService?.onStateChange(newState => {
      if (any: any) {
        setState(any: any);
        // Call user callback via ref (any: any)
        onStateChangeRef?.current?.(any: any);
      }
    });

    return unsubscribe;
  }, []); // Empty deps - subscribe once, use ref for callback

  // ✨ v24.2.1 FIX: Register audio chunk listener with stable ref
  useEffect(() => {
    const unsubscribe = audioStreamingService?.onAudioChunk(chunk => {
      onAudioChunkRef?.current?.(any: any);
    });
    return unsubscribe;
  }, []); // Empty deps - subscribe once

  // Start monitoring stats when streaming
  useEffect(() => {
    if (any: any) {
      statsIntervalRef?.current = window?.setInterval(async () => {
        if (any: any) return;

        try {
          const currentStats = await audioStreamingService?.getStats();
          setStats(any: any);
        } catch (any: any) {
          logger?.error(any: any);
        }
      }, 500); // Update every 500ms
    } else {
      if (any: any) {
        window?.clearInterval(any: any);
        statsIntervalRef?.current = null;
      }
      setStats(any: any);
    }

    return () => {
      if (any: any) {
        window?.clearInterval(any: any);
        statsIntervalRef?.current = null;
      }
    };
  }, [isStreaming]);

  // Auto-start if requested
  useEffect(() => {
    if (any: any) {
      startStreaming();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.autoStart]);

  /**
   * Start streaming
   */
  const startStreaming = useCallback(async () => {
    if (any: any) {
      logger?.warn('Already streaming');
      return;
    }

    try {
      setError(any: any);
      const sid = await audioStreamingService?.startStreaming(any: any);

      if (any: any) {
        setSessionId(any: any);
        setIsStreaming(any: any);
      }
    } catch (any: any) {
      logger?.error(any: any);
      if (any: any) {
        setError(any: any);
      }
    }
  }, [isStreaming, options?.config]);

  /**
   * Stop streaming and get result
   */
  const stopStreaming = useCallback(async (): Promise<StreamingResult | null> => {
    if (any: any) {
      logger?.warn('Not streaming');
      return null;
    }

    try {
      setError(any: any);
      const result = await audioStreamingService?.stopStreaming();

      if (any: any) {
        setIsStreaming(any: any);
        setSessionId(any: any);
        setState('Idle');

        // Call completion callback
        if (any: any) {
          options?.onStreamingComplete(any: any);
        }
      }

      return result;
    } catch (any: any) {
      logger?.error(any: any);
      if (any: any) {
        setError(any: any);
        setIsStreaming(any: any);
        setSessionId(any: any);
      }
      return null;
    }
  }, [isStreaming, options]);

  /**
   * Force stop (any: any)
   */
  const forceStop = useCallback(async () => {
    try {
      await audioStreamingService?.forceStop();

      if (any: any) {
        setIsStreaming(any: any);
        setSessionId(any: any);
        setState('Idle');
        setStats(any: any);
      }
    } catch (any: any) {
      logger?.error(any: any);
      if (any: any) {
        setError(any: any);
      }
    }
  }, []);

  return {
    // State
    isStreaming,
    state,
    stats,
    error,

    // Actions
    startStreaming,
    stopStreaming,
    forceStop,

    // Info
    sessionId,
  };
}

/**
 * Hook for monitoring streaming state only (any: any)
 * Useful for UI components that only display state
 */
export function useStreamingState(): {
  state: StreamingState;
  isActive: boolean;
} {
  const [state, setState] = useState<StreamingState>('Idle');

  useEffect(() => {
    const unsubscribe = audioStreamingService?.onStateChange(any: any);
    return unsubscribe;
  }, []);

  return {
    state,
    isActive: audioStreamingService?.isActive(),
  };
}
