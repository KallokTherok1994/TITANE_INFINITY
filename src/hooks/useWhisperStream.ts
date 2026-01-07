/**
 * TITANE_INFINITY v19.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3.1 — WHISPER STREAMING HOOK
 *
 *   Real-time incremental speech recognition with partial/final events
 *
 *   Architecture:
 *   Backend Rust → Tauri Events → React Hook → UI Update
 *
 *   Events:
 *   - whisper:partial → Progressive transcription (every 300ms)
 *   - whisper:final   → Finalized segment (on silence)
 *
 *   Usage:
 *   ```tsx
 *   const { partial, final, isStreaming, start, stop } = useWhisperStream();
 *   ```
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { secureInvoke } from '@/lib/security';

/**
 * Transcription event from backend
 */
interface TranscriptionEvent {
  text: string;
  type: 'partial' | 'final';
  confidence: number;
  durationMs: number;
  timestamp: number;
}

/**
 * Whisper streaming configuration
 */
export interface WhisperStreamConfig {
  /** Whisper model (tiny, base, small, medium, large) */
  model?: 'tiny' | 'base' | 'small' | 'medium' | 'large';

  /** Language code (auto, en, fr, es, etc.) */
  language?: string;

  /** Callback when partial transcription updates */
  onPartial?: (text: string, confidence: number) => void;

  /** Callback when segment is finalized */
  onFinal?: (text: string, confidence: number) => void;

  /** Callback on error */
  onError?: (error: string) => void;
}

/**
 * Whisper streaming state
 */
export interface WhisperStreamState {
  /** Current partial transcription (in progress) */
  partial: string;

  /** Last finalized segment */
  final: string;

  /** All finalized segments (history) */
  segments: string[];

  /** Full transcript (all segments joined) */
  fullTranscript: string;

  /** Is streaming active */
  isStreaming: boolean;

  /** Last confidence score */
  confidence: number;

  /** Last error */
  error: string | null;
}

export interface UseWhisperStreamReturn extends WhisperStreamState {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  reset: () => void;
  sendChunk: (
    data: Float32Array,
    sampleRate: number,
    hasSpeech: boolean,
    vadConfidence: number
  ) => Promise<void>;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   HOOK: useWhisperStream
 * ═══════════════════════════════════════════════════════════════════
 */
export function useWhisperStream(
  config: WhisperStreamConfig = {}
): UseWhisperStreamReturn {
  // State
  const [state, setState] = useState<WhisperStreamState>({
    partial: '',
    final: '',
    segments: [],
    fullTranscript: '',
    isStreaming: false,
    confidence: 0,
    error: null,
  });

  // Refs for cleanup
  const unlistenPartialRef = useRef<UnlistenFn | null>(null);
  const unlistenFinalRef = useRef<UnlistenFn | null>(null);
  const mountedRef = useRef(true);

  /**
   * Start Whisper streaming
   */
  const start = useCallback(async () => {
    try {
      logger.debug('🎙️ Starting...');

      // Start backend streaming
      await secureInvoke('start_whisper_streaming', {
        model: config.model || 'base',
        language: config.language || 'fr',
      });

      // Listen to partial events
      const unlistenPartial = await listen<TranscriptionEvent>(
        'whisper:partial',
        event => {
          const { text, confidence } = event.payload;

          logger.debug('📝 Partial:', text);

          if (mountedRef.current) {
            setState(prev => ({
              ...prev,
              partial: text,
              confidence,
              error: null,
            }));

            config.onPartial?.(text, confidence);
          }
        }
      );
      unlistenPartialRef.current = unlistenPartial;

      // Listen to final events
      const unlistenFinal = await listen<TranscriptionEvent>('whisper:final', event => {
        const { text, confidence } = event.payload;

        logger.debug('✅ Final:', text);

        if (mountedRef.current) {
          setState(prev => {
            const newSegments = [...prev.segments, text];
            return {
              ...prev,
              final: text,
              segments: newSegments,
              fullTranscript: newSegments.join(' '),
              partial: '', // Clear partial
              confidence,
              error: null,
            };
          });

          config.onFinal?.(text, confidence);
        }
      });
      unlistenFinalRef.current = unlistenFinal;

      // Update streaming state
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isStreaming: true,
          error: null,
        }));
      }

      logger.debug('✅ Started');
    } catch (error) {
      logger.error('❌ Start error:', error);

      const errorMsg = error instanceof Error ? error.message : String(error);

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isStreaming: false,
          error: errorMsg,
        }));
      }

      config.onError?.(errorMsg);
    }
  }, [config]);

  /**
   * Stop Whisper streaming
   */
  const stop = useCallback(async () => {
    try {
      logger.debug('🛑 Stopping...');

      // Stop backend streaming
      await secureInvoke('stop_whisper_streaming');

      // Unlisten events
      if (unlistenPartialRef.current) {
        unlistenPartialRef.current();
        unlistenPartialRef.current = null;
      }
      if (unlistenFinalRef.current) {
        unlistenFinalRef.current();
        unlistenFinalRef.current = null;
      }

      // Update state
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isStreaming: false,
          partial: '',
          error: null,
        }));
      }

      logger.debug('✅ Stopped');
    } catch (error) {
      logger.error('❌ Stop error:', error);

      const errorMsg = error instanceof Error ? error.message : String(error);

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: errorMsg,
        }));
      }
    }
  }, []);

  /**
   * Reset transcript
   */
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      partial: '',
      final: '',
      segments: [],
      fullTranscript: '',
      confidence: 0,
      error: null,
    }));
  }, []);

  /**
   * Send audio chunk to backend (for manual streaming)
   */
  const sendChunk = useCallback(
    async (
      data: Float32Array,
      sampleRate: number,
      hasSpeech: boolean,
      vadConfidence: number
    ) => {
      try {
        await secureInvoke('send_audio_chunk', {
          data: Array.from(data),
          sampleRate,
          hasSpeech,
          vadConfidence,
        });
      } catch (error) {
        logger.error('❌ Send chunk error:', error);
      }
    },
    []
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;

      // Unlisten events
      if (unlistenPartialRef.current) {
        unlistenPartialRef.current();
      }
      if (unlistenFinalRef.current) {
        unlistenFinalRef.current();
      }

      // Stop streaming
      secureInvoke('stop_whisper_streaming').catch(console.error);
    };
  }, []);

  return {
    // State
    ...state,

    // Actions
    start,
    stop,
    reset,
    sendChunk,
  };
}

export default useWhisperStream;
