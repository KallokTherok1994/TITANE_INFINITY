/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ - AUDIO SELF-HEAL ENGINE
 * Automatic detection and recovery of audio pipeline issues
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { voiceService } from '@/services/api/voice';
import { audioStateMachine } from '@/services/audio/audioStateMachine';
import { secureInvoke } from '@/lib/security';

export interface AudioHealthStatus {
  isHealthy: boolean;
  issues: string[];
  lastCheck: number;
  healAttempts: number;
  recordingStuck: boolean;
  stateMachineStuck: boolean;
  backendUnresponsive: boolean;
}

/**
 * Audio Self-Heal Engine
 * Automatically detects and fixes common audio pipeline issues
 */
class AudioSelfHeal {
  private healthStatus: AudioHealthStatus = {
    isHealthy: true,
    issues: [],
    lastCheck: Date.now(),
    healAttempts: 0,
    recordingStuck: false,
    stateMachineStuck: false,
    backendUnresponsive: false,
  };

  private readonly CHECK_INTERVAL = 5000; // Check every 5s
  private readonly MAX_HEAL_ATTEMPTS = 3;
  private readonly STATE_STUCK_THRESHOLD = 30000; // 30s
  private checkTimer: NodeJS.Timeout | null = null;

  /**
   * Start automatic health monitoring
   */
  start(): void {
    if (this.checkTimer) {
      console.warn('[AudioSelfHeal] Already running');
      return;
    }

    console.log('[AudioSelfHeal] 🛡️ Starting automatic health monitoring');
    this.checkTimer = setInterval(() => this.performHealthCheck(), this.CHECK_INTERVAL);
    this.performHealthCheck(); // Initial check
  }

  /**
   * Stop automatic health monitoring
   */
  stop(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
      console.log('[AudioSelfHeal] Stopped health monitoring');
    }
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    const issues: string[] = [];
    const now = Date.now();

    try {
      // 1. Check if backend is responsive
      try {
        const _isRecording = await secureInvoke<boolean>('is_recording', {});
        this.healthStatus.backendUnresponsive = false;
      } catch (error) {
        this.healthStatus.backendUnresponsive = true;
        issues.push('Backend Tauri unresponsive');
      }

      // 2. Check if recording is stuck
      const recordingStatus = await this.checkRecordingHealth();
      if (recordingStatus.isStuck) {
        this.healthStatus.recordingStuck = true;
        issues.push('Recording stuck - no progress detected');
      } else {
        this.healthStatus.recordingStuck = false;
      }

      // 3. Check if state machine is stuck
      const stateMachineStatus = this.checkStateMachineHealth();
      if (stateMachineStatus.isStuck) {
        this.healthStatus.stateMachineStuck = true;
        issues.push(
          `State machine stuck in ${stateMachineStatus.state} for ${stateMachineStatus.duration}ms`
        );
      } else {
        this.healthStatus.stateMachineStuck = false;
      }

      // 4. Update health status
      this.healthStatus.issues = issues;
      this.healthStatus.isHealthy = issues.length === 0;
      this.healthStatus.lastCheck = now;

      // 5. Auto-heal if issues detected
      if (
        !this.healthStatus.isHealthy &&
        this.healthStatus.healAttempts < this.MAX_HEAL_ATTEMPTS
      ) {
        console.warn('[AudioSelfHeal] 🚨 Issues detected:', issues);
        await this.performAutoHeal();
      }
    } catch (error) {
      console.error('[AudioSelfHeal] Health check error:', error);
    }
  }

  /**
   * Check recording health
   */
  private async checkRecordingHealth(): Promise<{ isStuck: boolean; duration?: number }> {
    try {
      const status = await secureInvoke<any>('get_recording_status', {});

      if (status.isRecording && status.durationMs) {
        // If recording for more than 60s without stopping, consider it stuck
        if (status.durationMs > 60000) {
          return { isStuck: true, duration: status.durationMs };
        }
      }

      return { isStuck: false };
    } catch (error) {
      // Command may not exist in all versions
      return { isStuck: false };
    }
  }

  /**
   * Check state machine health
   */
  private checkStateMachineHealth(): {
    isStuck: boolean;
    state?: string;
    duration?: number;
  } {
    const history = audioStateMachine.getHistory();
    if (history.length === 0) {
      return { isStuck: false };
    }

    const lastTransition = history[history.length - 1];
    const timeSinceLastTransition = Date.now() - lastTransition.timestamp;

    // If in non-idle state for too long, consider stuck
    const currentState = audioStateMachine.getState();
    if (currentState !== 'idle' && timeSinceLastTransition > this.STATE_STUCK_THRESHOLD) {
      return {
        isStuck: true,
        state: currentState,
        duration: timeSinceLastTransition,
      };
    }

    return { isStuck: false };
  }

  /**
   * Perform automatic healing
   */
  private async performAutoHeal(): Promise<void> {
    console.log('[AudioSelfHeal] 🔧 Performing auto-heal...');
    this.healthStatus.healAttempts++;

    try {
      // 1. Cancel any stuck recording
      if (this.healthStatus.recordingStuck) {
        console.log('[AudioSelfHeal] Cancelling stuck recording');
        try {
          await voiceService.cancelRecording();
        } catch (error) {
          console.warn('[AudioSelfHeal] Cancel recording failed:', error);
        }
      }

      // 2. Reset state machine if stuck
      if (this.healthStatus.stateMachineStuck) {
        console.log('[AudioSelfHeal] Resetting stuck state machine');
        audioStateMachine.forceReset();
      }

      // 3. If backend unresponsive, try to reconnect/reset
      if (this.healthStatus.backendUnresponsive) {
        console.log('[AudioSelfHeal] Backend unresponsive - attempting recovery');
        // Force kill any orphaned audio processes
        try {
          await secureInvoke('cancel_recording', {});
        } catch (error) {
          // Ignore errors
        }
      }

      console.log(
        '[AudioSelfHeal] ✅ Auto-heal completed, attempt',
        this.healthStatus.healAttempts
      );

      // Reset heal attempts after successful recovery
      setTimeout(() => {
        if (this.healthStatus.isHealthy) {
          this.healthStatus.healAttempts = 0;
        }
      }, 10000);
    } catch (error) {
      console.error('[AudioSelfHeal] Auto-heal error:', error);
    }
  }

  /**
   * Manual heal trigger
   */
  async manualHeal(): Promise<void> {
    console.log('[AudioSelfHeal] 🔧 Manual heal triggered');
    this.healthStatus.healAttempts = 0; // Reset counter for manual heal
    await this.performAutoHeal();
  }

  /**
   * Get current health status
   */
  getStatus(): AudioHealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Force complete reset
   */
  async forceReset(): Promise<void> {
    console.warn('[AudioSelfHeal] 🚨 FORCE RESET - Emergency cleanup');

    try {
      // Cancel recording
      await voiceService.cancelRecording().catch(() => {});

      // Reset state machine
      audioStateMachine.forceReset();

      // Reset health status
      this.healthStatus = {
        isHealthy: true,
        issues: [],
        lastCheck: Date.now(),
        healAttempts: 0,
        recordingStuck: false,
        stateMachineStuck: false,
        backendUnresponsive: false,
      };

      console.log('[AudioSelfHeal] ✅ Force reset completed');
    } catch (error) {
      console.error('[AudioSelfHeal] Force reset error:', error);
    }
  }
}

// Export singleton
export const audioSelfHeal = new AudioSelfHeal();

// Auto-start in production
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  audioSelfHeal.start();
}

export default audioSelfHeal;
