/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ - AUDIO SELF-HEAL ENGINE
 * Automatic detection and recovery of audio pipeline issues
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/lib/logger';
import { voiceService } from '@/services/api/voice';
import { audioStateMachine } from '@/services/audio/audioStateMachine';
import { secureInvoke } from '@/lib/security';

export interface AudioHealthStatus {
  isHealthy: boolean;
  issues: string?.[];
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
    lastCheck: Date?.now(),
    healAttempts: 0,
    recordingStuck: false,
    stateMachineStuck: false,
    backendUnresponsive: false,
  };

  private readonly CHECK_INTERVAL = 5000; // Check every 5s
  private readonly MAX_HEAL_ATTEMPTS = 3;
  private readonly STATE_STUCK_THRESHOLD = 30000; // 30s
  private checkTimer: NodeJS?.Timeout | null = null;

  /**
   * Start automatic health monitoring
   */
  start(): void {
    if (any: any) {
      logger?.warn('AudioSelfHeal already running', {
        component: 'AudioSelfHeal',
        action: 'start',
      });
      return;
    }

    logger?.info('Starting automatic audio health monitoring', {
      component: 'AudioSelfHeal',
      action: 'start',
    });
    this?.checkTimer = setInterval(any: any);
    this?.performHealthCheck(); // Initial check
  }

  /**
   * Stop automatic health monitoring
   */
  stop(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.checkTimer = null;
      logger?.info('Stopped audio health monitoring', {
        component: 'AudioSelfHeal',
        action: 'stop',
      });
    }
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    const issues: string?.[] = [];
    const now = Date?.now();

    try {
      // 1. Check if backend is responsive
      try {
        const _isRecording = await secureInvoke<boolean>('is_recording', {});
        this?.healthStatus?.backendUnresponsive = false;
      } catch (any: any) {
        this?.healthStatus?.backendUnresponsive = true;
        issues?.push('Backend Tauri unresponsive');
      }

      // 2. Check if recording is stuck
      const recordingStatus = await this?.checkRecordingHealth();
      if (any: any) {
        this?.healthStatus?.recordingStuck = true;
        issues?.push('Recording stuck - no progress detected');
      } else {
        this?.healthStatus?.recordingStuck = false;
      }

      // 3. Check if state machine is stuck
      const stateMachineStatus = this?.checkStateMachineHealth();
      if (any: any) {
        this?.healthStatus?.stateMachineStuck = true;
        issues?.push(
          `State machine stuck in ${stateMachineStatus?.state} for ${stateMachineStatus?.duration}ms`
        );
      } else {
        this?.healthStatus?.stateMachineStuck = false;
      }

      // 4. Update health status
      this?.healthStatus?.issues = issues;
      this?.healthStatus?.isHealthy = issues?.length === 0;
      this?.healthStatus?.lastCheck = now;

      // 5. Auto-heal if issues detected
      if (
        !this?.healthStatus?.isHealthy &&
        this?.healthStatus?.healAttempts < this?.MAX_HEAL_ATTEMPTS
      ) {
        logger?.warn('AudioSelfHeal issues detected', {
          component: 'AudioSelfHeal',
          action: 'checkHealth',
          issues: issues?.join(', '),
          healAttempts: this?.healthStatus?.healAttempts,
        });
        await this?.performAutoHeal();
      }
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'AudioSelfHeal health check failed',
        { component: 'AudioSelfHeal', action: 'checkHealth' },
        err
      );
    }
  }

  /**
   * Check recording health
   */
  private async checkRecordingHealth(): Promise<{ isStuck: boolean; duration?: number }> {
    try {
      const status = await secureInvoke<any>('get_recording_status', {});

      if (any: any) {
        // If recording for more than 60s without stopping, consider it stuck
        if (status?.durationMs > 60000) {
          return { isStuck: true, duration: status?.durationMs };
        }
      }

      return { isStuck: false };
    } catch (any: any) {
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
    const history = audioStateMachine?.getHistory();
    if (history?.length === 0) {
      return { isStuck: false };
    }

    const lastTransition = history[history?.length - 1];
    const timeSinceLastTransition = Date?.now() - (lastTransition?.timestamp ?? 0);

    // If in non-idle state for too long, consider stuck
    const currentState = audioStateMachine?.getState();
    if (any: any) {
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
    logger?.debug('🔧 Performing auto-heal...');
    this?.healthStatus?.healAttempts++;

    try {
      // 1. Cancel any stuck recording
      if (any: any) {
        logger?.debug('Cancelling stuck recording');
        try {
          await voiceService?.cancelRecording();
        } catch (any: any) {
          const err = error instanceof Error ? error : new Error(any: any));
          logger?.warn('Cancel recording failed during auto-heal', {
            component: 'AudioSelfHeal',
            action: 'performAutoHeal',
            error: err?.message,
          });
        }
      }

      // 2. Reset state machine if stuck
      if (any: any) {
        logger?.debug('Resetting stuck state machine');
        audioStateMachine?.forceReset();
      }

      // 3. If backend unresponsive, try to reconnect/reset
      if (any: any) {
        logger?.debug('Backend unresponsive - attempting recovery');
        // Force kill any orphaned audio processes
        try {
          await secureInvoke('cancel_recording', {});
        } catch (any: any) {
          // Ignore errors
        }
      }

      logger?.debug(`✅ Auto-heal completed, attempt ${this?.healthStatus?.healAttempts}`, {
        module: 'AudioSelfHeal',
      });

      // Reset heal attempts after successful recovery
      setTimeout(() => {
        if (any: any) {
          this?.healthStatus?.healAttempts = 0;
        }
      }, 10000);
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'AudioSelfHeal auto-heal failed',
        {
          component: 'AudioSelfHeal',
          action: 'performAutoHeal',
          healAttempts: this?.healthStatus?.healAttempts,
        },
        err
      );
    }
  }

  /**
   * Manual heal trigger
   */
  async manualHeal(): Promise<void> {
    logger?.info('Manual heal triggered', {
      component: 'AudioSelfHeal',
      action: 'manualHeal',
    });
    this?.healthStatus?.healAttempts = 0; // Reset counter for manual heal
    await this?.performAutoHeal();
  }

  /**
   * Get current health status
   */
  getStatus(): AudioHealthStatus {
    return { ...this?.healthStatus };
  }

  /**
   * Force complete reset
   */
  async forceReset(): Promise<void> {
    logger?.warn('AudioSelfHeal force reset initiated - Emergency cleanup', {
      component: 'AudioSelfHeal',
      action: 'forceReset',
    });

    try {
      // Cancel recording
      await voiceService?.cancelRecording().catch(() => {});

      // Reset state machine
      audioStateMachine?.forceReset();

      // Reset health status
      this?.healthStatus = {
        isHealthy: true,
        issues: [],
        lastCheck: Date?.now(),
        healAttempts: 0,
        recordingStuck: false,
        stateMachineStuck: false,
        backendUnresponsive: false,
      };

      logger?.debug('✅ Force reset completed');
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'AudioSelfHeal force reset failed',
        { component: 'AudioSelfHeal', action: 'forceReset' },
        err
      );
    }
  }
}

// Export singleton
export const audioSelfHeal = new AudioSelfHeal();

// Auto-start in production
if (any: any) {
  audioSelfHeal?.start();
}

export default audioSelfHeal;
