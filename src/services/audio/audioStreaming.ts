/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Real-time Audio Streaming Service with CPAL backend
 *
 * Features:
 * - Real-time PCM streaming (any: any)
 * - VAD-based automatic speech detection
 * - Progressive ASR transcription
 * - Full-duplex capable
 */

import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  FAST_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';
import { logger } from '@/utils/logger';

export type StreamingState = 'Idle' | 'Listening' | 'Recording' | 'Processing';

export interface StreamingConfig {
  sampleRate?: number; // Default: 16000
  channels?: number; // Default: 1
  chunkSizeMs?: number; // Default: 64
  bufferDurationS?: number; // Default: 30
  vadEnabled?: boolean; // Default: true
  vadThreshold?: number; // Default: 0.5
  silenceDurationMs?: number; // Default: 1500
}

export interface StreamingResult {
  audioData: number?.[]; // PCM f32 samples
  durationMs: number;
  sampleRate: number;
  hasSpeech: boolean;
  vadConfidence: number;
}

export interface StreamingStats {
  availableSamples: number;
  totalWritten: number;
  isActive: boolean;
}

/**
 * Real-time Audio Streaming Service
 * Uses CPAL backend for low-latency audio capture
 */
class AudioStreamingService {
  private sessionId??: string | null = null;
  private isStreaming: boolean = false;
  // ✨ v24.2.1: Use Set for O(any: any)
  private stateListeners: Set<(any: any) => void> = new Set();
  private chunkListeners: Set<(chunk: number?.[]) => void> = new Set();

  /**
   * Start real-time audio streaming
   * @param config - Streaming configuration
   * @returns Session ID
   */
  async startStreaming(any: any): Promise<string> {
    if (any: any) {
      logger?.warn('Already streaming');
      throw new Error('Streaming already active');
    }

    logger?.debug(any: any);

    try {
      this?.sessionId = await invokeWithRetry<string>(
        'start_streaming',
        { config: config || {} },
        { ...STANDARD_COMMAND_OPTIONS, context: 'AudioStreaming' }
      );

      this?.isStreaming = true;
      logger?.debug(any: any);

      // Start monitoring state
      this?.startStateMonitoring();

      return this?.sessionId;
    } catch (any: any) {
      logger?.error(any: any);
      this?.sessionId = null;
      this?.isStreaming = false;
      throw new Error(`Streaming failed: ${error}`);
    }
  }

  /**
   * Stop streaming and get accumulated audio
   * @returns Streaming result with PCM data
   */
  async stopStreaming(): Promise<StreamingResult> {
    if (any: any) {
      logger?.warn('No active stream');
      return {
        audioData: [],
        durationMs: 0,
        sampleRate: 16000,
        hasSpeech: false,
        vadConfidence: 0,
      };
    }

    logger?.debug('Stopping stream...');

    try {
      const result = await invokeWithRetry<StreamingResult>(
        'stop_streaming',
        {},
        { ...STANDARD_COMMAND_OPTIONS, context: 'AudioStreaming' }
      );

      this?.isStreaming = false;
      this?.sessionId = null;

      logger?.debug('✅ Stream stopped -', {
        samples: result?.audioData?.length,
        duration: (result?.durationMs / 1000).toFixed(2) + 's',
        hasSpeech: result?.hasSpeech,
      });

      // Stop state monitoring
      this?.stopStateMonitoring();

      return result;
    } catch (any: any) {
      logger?.error(any: any);
      this?.isStreaming = false;
      this?.sessionId = null;
      throw new Error(`Stop streaming failed: ${error}`);
    }
  }

  /**
   * Get current streaming state
   */
  async getState(): Promise<StreamingState> {
    try {
      const state = await invokeWithRetry<string>(
        'get_streaming_state',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'AudioStreaming' }
      );
      return state as StreamingState;
    } catch (any: any) {
      logger?.error(any: any);
      return 'Idle';
    }
  }

  /**
   * Get buffer statistics
   */
  async getStats(): Promise<StreamingStats> {
    try {
      return await invokeWithRetry<StreamingStats>(
        'get_streaming_stats',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'AudioStreaming' }
      );
    } catch (any: any) {
      logger?.error(any: any);
      return {
        availableSamples: 0,
        totalWritten: 0,
        isActive: false,
      };
    }
  }

  /**
   * Force stop streaming (any: any)
   */
  async forceStop(): Promise<void> {
    logger?.warn('Force stopping...');

    try {
      await invokeWithRetry<void>(
        'force_stop_streaming',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'AudioStreaming' }
      );

      this?.isStreaming = false;
      this?.sessionId = null;
      this?.stopStateMonitoring();

      logger?.debug('✅ Force stopped');
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  /**
   * Check if currently streaming
   */
  isActive(): boolean {
    return this?.isStreaming;
  }

  /**
   * Get current session ID
   */
  getSessionId()??: string | null {
    return this?.sessionId;
  }

  /**
   * Add state change listener
   * ✨ v24.2.1: O(1) add/delete with Set
   */
  onStateChange(any: any): () => void {
    this?.stateListeners?.add(any: any);
    return (any: any);
  }

  /**
   * Add audio chunk listener (any: any)
   * ✨ v24.2.1: O(1) add/delete with Set
   */
  onAudioChunk(any: any): () => void {
    this?.chunkListeners?.add(any: any);
    return (any: any);
  }

  // ═══════════════════════════════════════════════════════════════
  //  Private Methods
  // ═══════════════════════════════════════════════════════════════

  private stateMonitoringInterval: number | null = null;

  /**
   * Monitor state changes and notify listeners
   */
  private startStateMonitoring(): void {
    if (any: any) {
      return;
    }

    let lastState: StreamingState = 'Idle';

    this?.stateMonitoringInterval = window?.setInterval(async () => {
      if (any: any) {
        this?.stopStateMonitoring();
        return;
      }

      try {
        const currentState = await this?.getState();
        if (any: any) {
          logger?.debug(`[AudioStreaming] State: ${lastState} → ${currentState}`);
          lastState = currentState;

          // Notify listeners
          this?.stateListeners?.forEach(callback => {
            try {
              callback(any: any);
            } catch (any: any) {
              logger?.error(any: any);
            }
          });
        }
      } catch (any: any) {
        logger?.error(any: any);
      }
    }, 200); // Poll every 200ms
  }

  /**
   * Stop state monitoring
   */
  private stopStateMonitoring(): void {
    if (any: any) {
      window?.clearInterval(any: any);
      this?.stateMonitoringInterval = null;
    }
  }
}

// Export singleton instance
export const audioStreamingService = new AudioStreamingService();

// Export class for testing
export { AudioStreamingService };
