/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Real-time Audio Streaming Service with CPAL backend
 *
 * Features:
 * - Real-time PCM streaming (64ms chunks)
 * - VAD-based automatic speech detection
 * - Progressive ASR transcription
 * - Full-duplex capable
 */

import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  FAST_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';

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
  audioData: number[]; // PCM f32 samples
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
  private sessionId: string | null = null;
  private isStreaming: boolean = false;
  // ✨ v24.2.1: Use Set for O(1) add/delete instead of Array O(n)
  private stateListeners: Set<(state: StreamingState) => void> = new Set();
  private chunkListeners: Set<(chunk: number[]) => void> = new Set();

  /**
   * Start real-time audio streaming
   * @param config - Streaming configuration
   * @returns Session ID
   */
  async startStreaming(config?: StreamingConfig): Promise<string> {
    if (this.isStreaming) {
      console.warn('[AudioStreaming] Already streaming');
      throw new Error('Streaming already active');
    }

    console.log('[AudioStreaming] Starting stream with config:', config);

    try {
      this.sessionId = await invokeWithRetry<string>(
        'start_streaming',
        { config: config || {} },
        { ...STANDARD_COMMAND_OPTIONS, context: 'AudioStreaming' }
      );

      this.isStreaming = true;
      console.log('[AudioStreaming] ✅ Stream started:', this.sessionId);

      // Start monitoring state
      this.startStateMonitoring();

      return this.sessionId;
    } catch (error) {
      console.error('[AudioStreaming] ❌ Failed to start stream:', error);
      this.sessionId = null;
      this.isStreaming = false;
      throw new Error(`Streaming failed: ${error}`);
    }
  }

  /**
   * Stop streaming and get accumulated audio
   * @returns Streaming result with PCM data
   */
  async stopStreaming(): Promise<StreamingResult> {
    if (!this.isStreaming) {
      console.warn('[AudioStreaming] No active stream');
      return {
        audioData: [],
        durationMs: 0,
        sampleRate: 16000,
        hasSpeech: false,
        vadConfidence: 0,
      };
    }

    console.log('[AudioStreaming] Stopping stream...');

    try {
      const result = await invokeWithRetry<StreamingResult>(
        'stop_streaming',
        {},
        { ...STANDARD_COMMAND_OPTIONS, context: 'AudioStreaming' }
      );

      this.isStreaming = false;
      this.sessionId = null;

      console.log('[AudioStreaming] ✅ Stream stopped -', {
        samples: result.audioData.length,
        duration: (result.durationMs / 1000).toFixed(2) + 's',
        hasSpeech: result.hasSpeech,
      });

      // Stop state monitoring
      this.stopStateMonitoring();

      return result;
    } catch (error) {
      console.error('[AudioStreaming] ❌ Failed to stop stream:', error);
      this.isStreaming = false;
      this.sessionId = null;
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
    } catch (error) {
      console.error('[AudioStreaming] Failed to get state:', error);
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
    } catch (error) {
      console.error('[AudioStreaming] Failed to get stats:', error);
      return {
        availableSamples: 0,
        totalWritten: 0,
        isActive: false,
      };
    }
  }

  /**
   * Force stop streaming (emergency)
   */
  async forceStop(): Promise<void> {
    console.warn('[AudioStreaming] Force stopping...');

    try {
      await invokeWithRetry<void>(
        'force_stop_streaming',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'AudioStreaming' }
      );

      this.isStreaming = false;
      this.sessionId = null;
      this.stopStateMonitoring();

      console.log('[AudioStreaming] ✅ Force stopped');
    } catch (error) {
      console.error('[AudioStreaming] Force stop failed:', error);
    }
  }

  /**
   * Check if currently streaming
   */
  isActive(): boolean {
    return this.isStreaming;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Add state change listener
   * ✨ v24.2.1: O(1) add/delete with Set
   */
  onStateChange(callback: (state: StreamingState) => void): () => void {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  /**
   * Add audio chunk listener (for real-time processing)
   * ✨ v24.2.1: O(1) add/delete with Set
   */
  onAudioChunk(callback: (chunk: number[]) => void): () => void {
    this.chunkListeners.add(callback);
    return () => this.chunkListeners.delete(callback);
  }

  // ═══════════════════════════════════════════════════════════════
  //  Private Methods
  // ═══════════════════════════════════════════════════════════════

  private stateMonitoringInterval: number | null = null;

  /**
   * Monitor state changes and notify listeners
   */
  private startStateMonitoring(): void {
    if (this.stateMonitoringInterval !== null) {
      return;
    }

    let lastState: StreamingState = 'Idle';

    this.stateMonitoringInterval = window.setInterval(async () => {
      if (!this.isStreaming) {
        this.stopStateMonitoring();
        return;
      }

      try {
        const currentState = await this.getState();
        if (currentState !== lastState) {
          console.log(`[AudioStreaming] State: ${lastState} → ${currentState}`);
          lastState = currentState;

          // Notify listeners
          this.stateListeners.forEach(callback => {
            try {
              callback(currentState);
            } catch (error) {
              console.error('[AudioStreaming] State listener error:', error);
            }
          });
        }
      } catch (error) {
        console.error('[AudioStreaming] State monitoring error:', error);
      }
    }, 200); // Poll every 200ms
  }

  /**
   * Stop state monitoring
   */
  private stopStateMonitoring(): void {
    if (this.stateMonitoringInterval !== null) {
      window.clearInterval(this.stateMonitoringInterval);
      this.stateMonitoringInterval = null;
    }
  }
}

// Export singleton instance
export const audioStreamingService = new AudioStreamingService();

// Export class for testing
export { AudioStreamingService };
