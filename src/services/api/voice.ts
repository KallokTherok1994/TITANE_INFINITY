/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  FAST_COMMAND_OPTIONS,
  LONG_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';

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
 * Service centralisé Voice (TTS + ASR)
 * Remplace appels secureInvoke() voice_*
 */
class VoiceService {
  private recordingId: string | null = null;

  /**
   * Synthèse vocale (TTS)
   * @param text - Texte à synthétiser
   * @param config - Configuration TTS (rate, pitch, volume, voice)
   * @param useOnline - Mode online (Google TTS) vs offline (espeak/piper)
   */
  async speak(
    text: string,
    _config?: TTSConfig,
    useOnline: boolean = false
  ): Promise<void> {
    try {
      // Tauri 2.0: camelCase params (useOnline, not use_online)
      await invokeWithRetry<void>(
        'speak',
        { text, useOnline },
        { ...LONG_COMMAND_OPTIONS, context: 'Voice' }
      );
    } catch (error) {
      logger.error('Erreur TTS:', error);
      throw new Error(`Synthèse échouée: ${error}`);
    }
  }

  /**
   * Arrêt synthèse en cours
   */
  async stopSpeaking(): Promise<void> {
    try {
      // Tauri 2.0: commande = stop_speaking (pas voice_stop_speech)
      await invokeWithRetry<void>(
        'stop_speaking',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Voice' }
      );
    } catch (error) {
      logger.error('Erreur arrêt TTS:', error);
    }
  }

  /**
   * Démarrage enregistrement (ASR)
   * ✅ PRODUCTION v∞: Anti-debounce + State verification
   */
  async startRecording(config?: ASRConfig): Promise<string> {
    try {
      // Check if already recording (prevent double-call)
      if (this.recordingId) {
        logger.warn('Recording already in progress:', this.recordingId);
        throw new Error('Recording already in progress');
      }

      logger.debug('Starting recording with config:', config);

      // Tauri 2.0: commande = start_recording (pas voice_start_recording)
      this.recordingId = await invokeWithRetry<string>(
        'start_recording',
        { config: config || {} },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
      );

      logger.debug('✅ Recording started:', this.recordingId);
      return this.recordingId;
    } catch (error) {
      logger.error('❌ Erreur démarrage ASR:', error);
      this.recordingId = null; // Reset state on error
      throw new Error(`Enregistrement échoué: ${error}`);
    }
  }

  /**
   * Arrêt enregistrement + transcription finale
   * ✅ PRODUCTION v∞: Safe stop with state cleanup
   */
  async stopRecording(): Promise<ASRResult> {
    try {
      if (!this.recordingId) {
        logger.warn('No active recording to stop');
        // Return empty result instead of throwing
        return {
          transcript: '',
          confidence: 0,
          isFinal: true,
        };
      }

      const recordingId = this.recordingId;
      logger.debug('Stopping recording:', recordingId);

      // Tauri 2.0: commande = stop_recording (pas voice_stop_recording)
      const result = await invokeWithRetry<ASRResult>(
        'stop_recording',
        {},
        { ...LONG_COMMAND_OPTIONS, context: 'Voice' }
      );

      // Reset state AFTER successful stop
      this.recordingId = null;

      logger.debug('✅ Recording stopped, transcript:', result.transcript);
      return result;
    } catch (error) {
      logger.error('❌ Erreur arrêt ASR:', error);
      // Force reset state even on error
      this.recordingId = null;
      throw new Error(`Transcription échouée: ${error}`);
    }
  }

  /**
   * Annulation enregistrement
   * ✅ PRODUCTION v∞: Uses cancel_recording (not voice_cancel_recording)
   */
  async cancelRecording(): Promise<void> {
    try {
      const hadRecording = !!this.recordingId;
      logger.debug('Cancelling recording:', this.recordingId);

      // Reset local state first
      this.recordingId = null;

      // Call backend cancel (uses the real command from audio::commands)
      if (hadRecording) {
        await invokeWithRetry<void>(
          'cancel_recording',
          {},
          { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
        );
        logger.debug('✅ Recording cancelled');
      }
    } catch (error) {
      // Always reset state, even on error
      this.recordingId = null;
      logger.warn('Cancel recording completed with warning:', error);
    }
  }

  /**
   * Force reset voice engine - 🔥 HARD RESET
   * ✅ Emergency cleanup: kills all processes, resets state
   */
  async forceResetVoice(): Promise<void> {
    try {
      logger.warn('🔥 FORCE RESET VOICE ENGINE');

      // Reset local state
      this.recordingId = null;

      // Call backend force reset
      await invokeWithRetry<void>(
        'force_reset_voice',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
      );

      logger.debug('✅ Voice engine force reset complete');
    } catch (error) {
      logger.error('❌ Force reset failed:', error);
      // Force local state reset anyway
      this.recordingId = null;
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
      const [isSpeaking, isRecording] = await Promise.all([
        invokeWithRetry<boolean>(
          'is_speaking',
          {},
          { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
        ).catch(() => false),
        invokeWithRetry<boolean>(
          'is_recording',
          {},
          { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
        ).catch(() => false),
      ]);

      return {
        isRecording: isRecording || !!this.recordingId,
        isSpeaking,
        volume: 0,
        duration: 0,
      };
    } catch (error) {
      // Return safe defaults if command not available
      logger.warn('État audio fallback:', error);
      return {
        isRecording: !!this.recordingId,
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
      const models = await invokeWithRetry<string[]>(
        'voice_get_available_models',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
      );
      // Convertir les noms de modèles en format voix
      return models.map(model => ({
        id: model,
        name: model,
        language: model.includes('fr') ? 'fr-FR' : 'en-US',
      }));
    } catch (error) {
      logger.warn('Liste voix fallback:', error);
      return [
        { id: 'fr_FR-siwis-medium', name: 'Piper FR (Siwis)', language: 'fr-FR' },
        { id: 'espeak-fr', name: 'eSpeak FR', language: 'fr-FR' },
      ];
    }
  }

  /**
   * Configuration voix par défaut
   * Utilise voice_update_config qui existe
   */
  async setDefaultVoice(voiceId: string): Promise<void> {
    try {
      await invokeWithRetry<string>(
        'voice_update_config',
        {
          newConfig: {
            asr_model: 'whisper-base',
            tts_model: voiceId.includes('piper') ? 'piper' : 'espeak',
            language: voiceId.includes('fr') ? 'fr' : 'en',
            sample_rate: 16000,
            wake_word: 'TITANE',
            duplex_enabled: true,
            noise_reduction: true,
            auto_calibration: true,
          },
        },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
      );
    } catch (error) {
      logger.error('Erreur config voix:', error);
      // Non-critical, don't throw
    }
  }

  /**
   * Test audio (micro + haut-parleurs)
   * Utilise voice_test_pipeline et test_microphone qui existent
   */
  async testAudio(): Promise<{
    microphoneWorking: boolean;
    speakersWorking: boolean;
    latency: number;
  }> {
    try {
      const [micResult, pipelineResult] = await Promise.all([
        invokeWithRetry<{ success: boolean }>(
          'test_microphone',
          { durationMs: 1000 },
          { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
        ).catch(() => ({ success: false })),
        invokeWithRetry<string>(
          'voice_test_pipeline',
          {},
          { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
        ).catch(() => null),
      ]);

      return {
        microphoneWorking: micResult?.success ?? false,
        speakersWorking: pipelineResult !== null,
        latency: 50, // Estimation par défaut
      };
    } catch (error) {
      logger.error('Erreur test audio:', error);
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
