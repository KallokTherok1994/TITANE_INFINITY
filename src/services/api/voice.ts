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
  async speak(text: string, _config?: TTSConfig, useOnline: boolean = false): Promise<void> {
    try {
      // Tauri 2.0: camelCase params (useOnline, not use_online)
      await invokeWithRetry<void>(
        'speak',
        { text, useOnline },
        { ...LONG_COMMAND_OPTIONS, context: 'Voice' }
      );
    } catch (error) {
      console.error('[VoiceService] Erreur TTS:', error);
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
      console.error('[VoiceService] Erreur arrêt TTS:', error);
    }
  }

  /**
   * Démarrage enregistrement (ASR)
   */
  async startRecording(config?: ASRConfig): Promise<string> {
    try {
      // Tauri 2.0: commande = start_recording (pas voice_start_recording)
      this.recordingId = await invokeWithRetry<string>(
        'start_recording',
        { config: config || {} },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
      );
      return this.recordingId;
    } catch (error) {
      console.error('[VoiceService] Erreur démarrage ASR:', error);
      throw new Error(`Enregistrement échoué: ${error}`);
    }
  }

  /**
   * Arrêt enregistrement + transcription finale
   */
  async stopRecording(): Promise<ASRResult> {
    try {
      if (!this.recordingId) {
        throw new Error('Aucun enregistrement actif');
      }
      // Tauri 2.0: commande = stop_recording (pas voice_stop_recording)
      const result = await invokeWithRetry<ASRResult>(
        'stop_recording',
        {},
        { ...LONG_COMMAND_OPTIONS, context: 'Voice' }
      );
      this.recordingId = null;
      return result;
    } catch (error) {
      console.error('[VoiceService] Erreur arrêt ASR:', error);
      throw new Error(`Transcription échouée: ${error}`);
    }
  }

  /**
   * Annulation enregistrement
   * NOTE: Cette commande peut ne pas exister dans tous les backends
   * Fallback silencieux si non disponible
   */
  async cancelRecording(): Promise<void> {
    try {
      // Reset local state first
      this.recordingId = null;

      // Try Tauri command, fallback silently if not available
      await invokeWithRetry<void>(
        'voice_cancel_recording',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
      );
    } catch (error) {
      // Silently handle - command may not exist in all backends
      console.warn('[VoiceService] Cancel recording fallback (command may not exist):', error);
    }
  }

  /**
   * Récupération état audio
   * NOTE: Retourne un état par défaut si la commande n'existe pas
   */
  async getAudioState(): Promise<AudioState> {
    try {
      return await invokeWithRetry<AudioState>(
        'voice_get_audio_state',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
      );
    } catch (error) {
      // Return safe defaults if command not available
      console.warn('[VoiceService] État audio fallback (command may not exist)');
      return {
        isRecording: !!this.recordingId,
        isSpeaking: false,
        volume: 0,
        duration: 0,
      };
    }
  }

  /**
   * Liste voix disponibles
   * NOTE: Retourne liste vide si la commande n'existe pas
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
      return await invokeWithRetry(
        'voice_list_voices',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Voice', retries: 1 }
      );
    } catch (error) {
      console.warn('[VoiceService] Liste voix fallback (command may not exist)');
      return [];
    }
  }

  /**
   * Configuration voix par défaut
   */
  async setDefaultVoice(voiceId: string): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'voice_set_default_voice',
        { voiceId },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
      );
    } catch (error) {
      console.error('[VoiceService] Erreur config voix:', error);
      throw new Error(`Configuration échouée: ${error}`);
    }
  }

  /**
   * Test audio (micro + haut-parleurs)
   */
  async testAudio(): Promise<{
    microphoneWorking: boolean;
    speakersWorking: boolean;
    latency: number;
  }> {
    try {
      return await invokeWithRetry(
        'voice_test_audio',
        {},
        { ...STANDARD_COMMAND_OPTIONS, context: 'Voice' }
      );
    } catch (error) {
      console.error('[VoiceService] Erreur test audio:', error);
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
