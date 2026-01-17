/**
 * TITANE_INFINITY v20.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v20.0 — VOICE FINGERPRINTING TAURI INTEGRATION
 *   P0-2: Layer 3 Anti-Feedback (MFCC-based acoustic detection)
 *
 *   Connects frontend to Rust voice_fingerprint.rs backend
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
 *   VOICE FINGERPRINTING SERVICE (Tauri Backend)
 * ═══════════════════════════════════════════════════════════════════
 */
class VoiceFingerprintTauriService {
  private isCalibrated = false;
  private calibrationInProgress = false;

  /**
   * Calibrate TITANE voice profile with TTS samples
   *
   * Should be called once at startup or when TTS voice changes.
   * Requires 5-10 seconds of TITANE TTS samples (various phrases).
   *
   * @param samplesList Multiple audio samples (16kHz mono Float32Array)
   * @returns Success/failure
   */
  async calibrateTitaneVoice(samplesList: Float32Array[]): Promise<void> {
    if (this.calibrationInProgress) {
      logger.warn('⚠️ Calibration already in progress');
      return;
    }

    if (samplesList.length < 3) {
      throw new Error('At least 3 samples required for calibration');
    }

    logger.debug(
      `[VoiceFingerprintTauri] 🎯 Calibrating TITANE voice with ${samplesList.length} samples`
    );

    this.calibrationInProgress = true;

    try {
      // Convert Float32Array to regular arrays for JSON serialization
      const samplesListArrays = samplesList.map(samples => Array.from(samples));

      await secureInvoke('calibrate_titane_voice', {
        samplesList: samplesListArrays,
      });

      this.isCalibrated = true;

      logger.debug('✅ TITANE voice profile calibrated');
    } catch (error) {
      logger.error('❌ Calibration failed:', error);
      throw error;
    } finally {
      this.calibrationInProgress = false;
    }
  }

  /**
   * Check if audio is TITANE speaking (Layer 3 anti-feedback detection)
   *
   * Returns (isTitane, similarity)
   * - isTitane: true if audio matches TITANE voice profile (similarity >= threshold)
   * - similarity: 0.0 (different) to 1.0 (identical)
   *
   * @param samples Audio samples (16kHz mono Float32Array)
   * @returns VoiceFingerprintResult
   */
  async checkIsTitaneSpeaking(samples: Float32Array): Promise<VoiceFingerprintResult> {
    if (!this.isCalibrated) {
      logger.warn('⚠️ TITANE profile not calibrated, returning false');
      return { isTitane: false, similarity: 0.0 };
    }

    try {
      // Convert Float32Array to array for JSON serialization
      const samplesArray = Array.from(samples);

      const result = await secureInvoke<VoiceFingerprintResult>(
        'check_is_titane_speaking',
        {
          samples: samplesArray,
        }
      );

      if (result.isTitane) {
        logger.debug(
          `[VoiceFingerprintTauri] 🎯 TITANE detected (similarity: ${result.similarity.toFixed(2)})`
        );
      }

      return result;
    } catch (error) {
      logger.error('❌ Detection failed:', error);
      return { isTitane: false, similarity: 0.0 };
    }
  }

  /**
   * Get TITANE voice profile status
   */
  async getTitaneVoiceStatus(): Promise<TitaneVoiceStatus> {
    try {
      const status = await secureInvoke<TitaneVoiceStatus>('get_titane_voice_status');
      this.isCalibrated = status.calibrated;
      return status;
    } catch (error) {
      logger.error('❌ Failed to get status:', error);
      return { calibrated: false, sampleCount: 0, threshold: 0.75 };
    }
  }

  /**
   * Check if TITANE profile is calibrated
   */
  isTitaneCalibrated(): boolean {
    return this.isCalibrated;
  }

  /**
   * Reset calibration status (for testing)
   */
  resetCalibration(): void {
    this.isCalibrated = false;
    logger.debug('🔄 Calibration reset');
  }
}

/**
 * Singleton instance
 */
export const voiceFingerprintTauri = new VoiceFingerprintTauriService();

/**
 * ═══════════════════════════════════════════════════════════════════
 *   USAGE EXAMPLE (Integration in useVAD.ts)
 * ═══════════════════════════════════════════════════════════════════
 *
 * // 1. Calibrate TITANE voice at startup (once)
 * const calibrateTITANE = async () => {
 *   const samples = [
 *     await generateTTSSample("Bonjour, je suis TITANE"),
 *     await generateTTSSample("Comment puis-je vous aider ?"),
 *     await generateTTSSample("Je suis là pour vous assister"),
 *   ];
 *   await voiceFingerprintTauri.calibrateTitaneVoice(samples);
 * };
 *
 * // 2. Check if audio is TITANE before ASR processing
 * const processAudioData = async (audioData: Float32Array) => {
 *   // Layer 3 anti-feedback check
 *   const result = await voiceFingerprintTauri.checkIsTitaneSpeaking(audioData);
 *
 *   if (result.isTitane) {
 *     logger.debug('🎯 TITANE detected, skipping ASR (anti-feedback Layer 3)');
 *     return; // Skip ASR processing
 *   }
 *
 *   // User voice detected, continue with ASR
 *   const vadResult = await audioService.processVADFrame(audioData);
 *   // ...
 * };
 *
 * ═══════════════════════════════════════════════════════════════════
 */
