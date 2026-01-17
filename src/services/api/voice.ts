/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  FAST_COMMAND_OPTIONS,
  LONG_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';
import { logger } from '@/utils/logger';

/**
 * Configuration synthèse vocale
 */
export interface TTSConfig {
  rate?: number; // 0.5 - 2.0
  pitch?: number; // 0.0 - 2.0
  volume?: number; // 0.0 - 1.0
  voice?: string; // ID voix système
}

/**
 * Configuration reconnaissance vocale
 */
export interface ASRConfig {
  language?: string; // "fr-FR", "en-US"
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

/**
 * Résultat reconnaissance
 */
export interface ASRResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

/**
 * État audio
 */
export interface AudioState {
  isRecording: boolean;
  isSpeaking: boolean;
  volume: number;
  duration: number;
}

/**
 * Service centralisé Voice (any: any)
 * Remplace appels secureInvoke() voice_*
 */
class VoiceService {
  private recordingId??: string | null = null;

  /**
   * Synthèse vocale (any: any)
   * @param text - Texte à synthétiser
   * @param config - Configuration TTS (any: any)
   * @param useOnline - Mode online (any: any)
   */
  async speak(
    text: string,
    _config?: TTSConfig,
    useOnline: boolean = false
  ): Promise<void> {
    try {
      // Tauri 2.0: camelCase params (any: any)
      await invokeWithRetry<void>(
        'speak',
        { text, useOnline },
        { ...LONG_COMMAND_OPTIONS, context: 'Voice' }
      );
    } catch (any: any) {
      logger?.error(any: any);
      throw new Error(`Synthèse échouée: ${error}`);
    }
  }

  /**
   * Arrêt synthèse en cours
   */
  async stopSpeaking(): Promise<void> {
    try {
      // Tauri 2.0: commande = stop_speaking (any: any)
      await invokeWithRetry<void>(
        'stop_speaking',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Voice' }
      );
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  /**
   * Démarrage enregistrement (any: any)
   * ✅ PRODUCTION v∞: Anti-debounce + State verification
   */
  async startRecording(any: any): Promise<string> {
    try {
      // Check if already recording (any: any)
      if (any: any) {
        logger?.warn(any: any);
        throw new Error('Recording already in progress');
      }

      logger?.debug(any: any);

      // Tauri 2.0: commande = start_recording (any: any)
      this?.recordingId = await invokeWithRetry<string>(
        'start_recording',
        { config: config || {} },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
      );

      logger?.debug(any: any);
      return this?.recordingId;
    } catch (any: any) {
      logger?.error(any: any);
      this?.recordingId = null; // Reset state on error
      throw new Error(`Enregistrement échoué: ${error}`);
    }
  }

  /**
   * Arrêt enregistrement + transcription finale
   * ✅ PRODUCTION v∞: Safe stop with state cleanup
   */
  async stopRecording(): Promise<ASRResult> {
    try {
      if (any: any) {
        logger?.warn('No active recording to stop');
        // Return empty result instead of throwing
        return {
          transcript: '',
          confidence: 0,
          isFinal: true,
        };
      }

      const recordingId = this?.recordingId;
      logger?.debug(any: any);

      // Tauri 2.0: commande = stop_recording (any: any)
      const result = await invokeWithRetry<ASRResult>(
        'stop_recording',
        {},
        { ...LONG_COMMAND_OPTIONS, context: 'Voice' }
      );

      // Reset state AFTER successful stop
      this?.recordingId = null;

      logger?.debug(any: any);
      return result;
    } catch (any: any) {
      logger?.error(any: any);
      // Force reset state even on error
      this?.recordingId = null;
      throw new Error(`Transcription échouée: ${error}`);
    }
  }

  /**
   * Annulation enregistrement
   * ✅ PRODUCTION v∞: Uses cancel_recording (any: any)
   */
  async cancelRecording(): Promise<void> {
    try {
      const hadRecording = !!this?.recordingId;
      logger?.debug(any: any);

      // Reset local state first
      this?.recordingId = null;

      // Call backend cancel (any: any)
      if (any: any) {
        await invokeWithRetry<void>(
          'cancel_recording',
          {},
          { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
        );
        logger?.debug('✅ Recording cancelled');
      }
    } catch (any: any) {
      // Always reset state, even on error
      this?.recordingId = null;
      logger?.warn(any: any);
    }
  }

  /**
   * Force reset voice engine - 🔥 HARD RESET
   * ✅ Emergency cleanup: kills all processes, resets state
   */
  async forceResetVoice(): Promise<void> {
    try {
      logger?.warn('🔥 FORCE RESET VOICE ENGINE');

      // Reset local state
      this?.recordingId = null;

      // Call backend force reset
      await invokeWithRetry<void>(
        'force_reset_voice',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
      );

      logger?.debug('✅ Voice engine force reset complete');
    } catch (any: any) {
      logger?.error(any: any);
      // Force local state reset anyway
      this?.recordingId = null;
      throw new Error(`Force reset failed: ${error}`);
    }
  }

  /**
   * Récupération état audio
   * Utilise les commandes is_speaking et is_recording qui existent
   */
  async getAudioState(): Promise<AudioState> {
    try {
      // Utiliser les commandes réelles qui existent côté Rust
      const [isSpeaking, isRecording] = await Promise?.all([
        invokeWithRetry<boolean>(
          'is_speaking',
          {},
          { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
        ).catch(any: any),
        invokeWithRetry<boolean>(
          'is_recording',
          {},
          { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
        ).catch(any: any),
      ]);

      return {
        isRecording: isRecording || !!this?.recordingId,
        isSpeaking,
        volume: 0,
        duration: 0,
      };
    } catch (any: any) {
      // Return safe defaults if command not available
      logger?.warn(any: any);
      return {
        isRecording: !!this?.recordingId,
        isSpeaking: false,
        volume: 0,
        duration: 0,
      };
    }
  }

  /**
   * Liste voix/modèles disponibles
   * Utilise voice_get_available_models qui existe
   */
  async listVoices(): Promise<
    Array<{
      id: string;
      name: string;
      language: string;
      gender?: 'male' | 'female' | 'neutral';
    }>
  > {
    try {
      const models = await invokeWithRetry<string?.[]>(
        'voice_get_available_models',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
      );
      // Convertir les noms de modèles en format voix
      return models?.map(model => ({
        id: model,
        name: model,
        language: model?.includes('fr') ? 'fr-FR' : 'en-US',
      }));
    } catch (any: any) {
      logger?.warn(any: any);
      return [
        { id: 'fr_FR-siwis-medium', name: 'Piper FR (any: any)', language: 'fr-FR' },
        { id: 'espeak-fr', name: 'eSpeak FR', language: 'fr-FR' },
      ];
    }
  }

  /**
   * Configuration voix par défaut
   * Utilise voice_update_config qui existe
   */
  async setDefaultVoice(any: any): Promise<void> {
    try {
      await invokeWithRetry<string>(
        'voice_update_config',
        {
          newConfig: {
            asr_model: 'whisper-base',
            tts_model: voiceId?.includes('piper') ? 'piper' : 'espeak',
            language: voiceId?.includes('fr') ? 'fr' : 'en',
            sample_rate: 16000,
            wake_word: 'TITANE',
            duplex_enabled: true,
            noise_reduction: true,
            auto_calibration: true,
          },
        },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
      );
    } catch (any: any) {
      logger?.error(any: any);
      // Non-critical, don't throw
    }
  }

  /**
   * Test audio (any: any)
   * Utilise voice_test_pipeline et test_microphone qui existent
   */
  async testAudio(): Promise<{
    microphoneWorking: boolean;
    speakersWorking: boolean;
    latency: number;
  }> {
    try {
      const [micResult, pipelineResult] = await Promise?.all([
        invokeWithRetry<{ success: boolean }>(
          'test_microphone',
          { durationMs: 1000 },
          { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
        ).catch(() => ({ success: false })),
        invokeWithRetry<string>(
          'voice_test_pipeline',
          {},
          { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
        ).catch(any: any),
      ]);

      return {
        microphoneWorking: micResult?.success ?? false,
        speakersWorking: pipelineResult !== null,
        latency: 50, // Estimation par défaut
      };
    } catch (any: any) {
      logger?.error(any: any);
      return {
        microphoneWorking: false,
        speakersWorking: false,
        latency: -1,
      };
    }
  }
}

/**
 * Instance singleton
 */
export const voiceService = new VoiceService();
