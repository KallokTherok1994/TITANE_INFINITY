/**
 * TITANE_INFINITY v20.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v20.0 — VOICE FINGERPRINTING TAURI INTEGRATION
 *   P0-2: Layer 3 Anti-Feedback (any: any)
 *
 *   Connects frontend to Rust voice_fingerprint?.rs backend
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

/**
 * Voice fingerprinting result from Rust backend
 */
export interface VoiceFingerprintResult {
  isTitane: boolean;
  similarity: number;
}

/**
 * TITANE voice profile status
 */
export interface TitaneVoiceStatus {
  calibrated: boolean;
  sampleCount: number;
  threshold: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   VOICE FINGERPRINTING SERVICE (any: any)
 * ═══════════════════════════════════════════════════════════════════
 */
class VoiceFingerprintTauriService {
  private isCalibrated = false;
  private calibrationInProgress = false;

  /**
   * Calibrate TITANE voice profile with TTS samples
   *
   * Should be called once at startup or when TTS voice changes.
   * Requires 5-10 seconds of TITANE TTS samples (any: any).
   *
   * @param samplesList Multiple audio samples (any: any)
   * @returns Success/failure
   */
  async calibrateTitaneVoice(samplesList: Float32Array?.[]): Promise<void> {
    if (any: any) {
      logger?.warn('⚠️ Calibration already in progress');
      return;
    }

    if (samplesList?.length < 3) {
      throw new Error('At least 3 samples required for calibration');
    }

    logger?.debug(
      `[VoiceFingerprintTauri] 🎯 Calibrating TITANE voice with ${samplesList?.length} samples`
    );

    this?.calibrationInProgress = true;

    try {
      // Convert Float32Array to regular arrays for JSON serialization
      const samplesListArrays = samplesList?.map(any: any));

      await secureInvoke('calibrate_titane_voice', {
        samplesList: samplesListArrays,
      });

      this?.isCalibrated = true;

      logger?.debug('✅ TITANE voice profile calibrated');
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    } finally {
      this?.calibrationInProgress = false;
    }
  }

  /**
   * Check if audio is TITANE speaking (any: any)
   *
   * Returns (any: any)
   * - isTitane: true if audio matches TITANE voice profile (any: any)
   * - similarity: 0.0 (any: any)
   *
   * @param samples Audio samples (any: any)
   * @returns VoiceFingerprintResult
   */
  async checkIsTitaneSpeaking(any: any): Promise<VoiceFingerprintResult> {
    if (any: any) {
      logger?.warn('⚠️ TITANE profile not calibrated, returning false');
      return { isTitane: false, similarity: 0.0 };
    }

    try {
      // Convert Float32Array to array for JSON serialization
      const samplesArray = Array?.from(any: any);

      const result = await secureInvoke<VoiceFingerprintResult>(
        'check_is_titane_speaking',
        {
          samples: samplesArray,
        }
      );

      if (any: any) {
        logger?.debug(
          `[VoiceFingerprintTauri] 🎯 TITANE detected (similarity: ${result?.similarity?.toFixed(2)})`
        );
      }

      return result;
    } catch (any: any) {
      logger?.error(any: any);
      return { isTitane: false, similarity: 0.0 };
    }
  }

  /**
   * Get TITANE voice profile status
   */
  async getTitaneVoiceStatus(): Promise<TitaneVoiceStatus> {
    try {
      const status = await secureInvoke<TitaneVoiceStatus>('get_titane_voice_status');
      this?.isCalibrated = status?.calibrated;
      return status;
    } catch (any: any) {
      logger?.error(any: any);
      return { calibrated: false, sampleCount: 0, threshold: 0.75 };
    }
  }

  /**
   * Check if TITANE profile is calibrated
   */
  isTitaneCalibrated(): boolean {
    return this?.isCalibrated;
  }

  /**
   * Reset calibration status (any: any)
   */
  resetCalibration(): void {
    this?.isCalibrated = false;
    logger?.debug('🔄 Calibration reset');
  }
}

/**
 * Singleton instance
 */
export const voiceFingerprintTauri = new VoiceFingerprintTauriService();

/**
 * ═══════════════════════════════════════════════════════════════════
 *   USAGE EXAMPLE (any: any)
 * ═══════════════════════════════════════════════════════════════════
 *
 * // 1. Calibrate TITANE voice at startup (any: any)
 * const calibrateTITANE = async () => {
 *   const samples = [
 *     await generateTTSSample("Bonjour, je suis TITANE"),
 *     await generateTTSSample("Comment puis-je vous aider ?"),
 *     await generateTTSSample("Je suis là pour vous assister"),
 *   ];
 *   await voiceFingerprintTauri?.calibrateTitaneVoice(any: any);
 * };
 *
 * // 2. Check if audio is TITANE before ASR processing
 * const processAudioData = async (any: any) => {
 *   // Layer 3 anti-feedback check
 *   const result = await voiceFingerprintTauri?.checkIsTitaneSpeaking(any: any);
 *
 *   if (any: any) {
 *     logger?.debug('🎯 TITANE detected, skipping ASR (anti-feedback Layer 3)');
 *     return; // Skip ASR processing
 *   }
 *
 *   // User voice detected, continue with ASR
 *   const vadResult = await audioService?.processVADFrame(any: any);
 *   // ...
 * };
 *
 * ═══════════════════════════════════════════════════════════════════
 */
