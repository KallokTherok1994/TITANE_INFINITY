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
  onStateChange?: (state: StreamingState) => void;
  onAudioChunk?: (chunk: number[]) => void;
  onStreamingComplete?: (result: StreamingResult) => void;
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
  sessionId: string | null;
}

/**
 * Hook for real-time audio streaming with CPAL
 *
 * @example
 * ```tsx
 * const { isStreaming, state, startStreaming, stopStreaming } = useAudioStreaming({
 *   onStateChange: (state) => logger.debug('State:', state),
 *   onStreamingComplete: (result) => {
 *     logger.debug('Audio captured:', result.audioData.length, 'samples');
 *   },
 * });
 * ```
 */
export function useAudioStreaming(
  options: UseAudioStreamingOptions = {}
): UseAudioStreamingReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [state, setState] = useState<StreamingState>('Idle');
  const [stats, setStats] = useState<StreamingStats | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const statsIntervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // ✨ v24.2.1 FIX: Store callbacks in refs to prevent re-subscription on every render
  const onStateChangeRef = useRef(options.onStateChange);
  const onAudioChunkRef = useRef(options.onAudioChunk);

  // Keep refs updated without triggering re-subscriptions
  useEffect(() => {
    onStateChangeRef.current = options.onStateChange;
  }, [options.onStateChange]);

  useEffect(() => {
    onAudioChunkRef.current = options.onAudioChunk;
  }, [options.onAudioChunk]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (statsIntervalRef.current !== null) {
        window.clearInterval(statsIntervalRef.current);
      }
    };
  }, []);

  // ✨ v24.2.1 FIX: Single unified state listener with stable ref-based callback
  // This prevents re-subscription when parent component re-renders
  useEffect(() => {
    const unsubscribe = audioStreamingService.onStateChange(newState => {
      if (isMountedRef.current) {
        setState(newState);
        // Call user callback via ref (stable reference)
        onStateChangeRef.current?.(newState);
      }
    });

    return unsubscribe;
  }, []); // Empty deps - subscribe once, use ref for callback

  // ✨ v24.2.1 FIX: Register audio chunk listener with stable ref
  useEffect(() => {
    const unsubscribe = audioStreamingService.onAudioChunk(chunk => {
      onAudioChunkRef.current?.(chunk);
    });
    return unsubscribe;
  }, []); // Empty deps - subscribe once

  // Start monitoring stats when streaming
  useEffect(() => {
    if (isStreaming) {
      statsIntervalRef.current = window.setInterval(async () => {
        if (!isMountedRef.current) return;

        try {
          const currentStats = await audioStreamingService.getStats();
          setStats(currentStats);
        } catch (err) {
          logger.error('Stats error:', err);
        }
      }, 500); // Update every 500ms
    } else {
      if (statsIntervalRef.current !== null) {
        window.clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
      setStats(null);
    }

    return () => {
      if (statsIntervalRef.current !== null) {
        window.clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
    };
  }, [isStreaming]);

  // Auto-start if requested
  useEffect(() => {
    if (options.autoStart && !isStreaming) {
      startStreaming();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.autoStart]);

  /**
   * Start streaming
   */
  const startStreaming = useCallback(async () => {
    if (isStreaming) {
      logger.warn('Already streaming');
      return;
    }

    try {
      setError(null);
      const sid = await audioStreamingService.startStreaming(options.config);

      if (isMountedRef.current) {
        setSessionId(sid);
        setIsStreaming(true);
      }
    } catch (err) {
      logger.error('Start error:', err);
      if (isMountedRef.current) {
        setError(err as Error);
      }
    }
  }, [isStreaming, options.config]);

  /**
   * Stop streaming and get result
   */
  const stopStreaming = useCallback(async (): Promise<StreamingResult | null> => {
    if (!isStreaming) {
      logger.warn('Not streaming');
      return null;
    }

    try {
      setError(null);
      const result = await audioStreamingService.stopStreaming();

      if (isMountedRef.current) {
        setIsStreaming(false);
        setSessionId(null);
        setState('Idle');

        // Call completion callback
        if (options.onStreamingComplete) {
          options.onStreamingComplete(result);
        }
      }

      return result;
    } catch (err) {
      logger.error('Stop error:', err);
      if (isMountedRef.current) {
        setError(err as Error);
        setIsStreaming(false);
        setSessionId(null);
      }
      return null;
    }
  }, [isStreaming, options]);

  /**
   * Force stop (emergency)
   */
  const forceStop = useCallback(async () => {
    try {
      await audioStreamingService.forceStop();

      if (isMountedRef.current) {
        setIsStreaming(false);
        setSessionId(null);
        setState('Idle');
        setStats(null);
      }
    } catch (err) {
      logger.error('Force stop error:', err);
      if (isMountedRef.current) {
        setError(err as Error);
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
 * Hook for monitoring streaming state only (no control)
 * Useful for UI components that only display state
 */
export function useStreamingState(): {
  state: StreamingState;
  isActive: boolean;
} {
  const [state, setState] = useState<StreamingState>('Idle');

  useEffect(() => {
    const unsubscribe = audioStreamingService.onStateChange(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    isActive: audioStreamingService.isActive(),
  };
}
