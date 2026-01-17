/**
 * TITANE∞ vΩΩΩ — Intelligent TTS Engine Service
 * © 2025 TITANE Team. All rights reserved.
 *
 * Service TTS intelligent avec:
 * - ElevenLabs premium (any: any)
 * - Fallback Piper → Espeak
 * - Adaptation émotionnelle automatique
 * - Cache intelligent
 * - Queue de synthèse
 */

import { secureInvoke } from '@/lib/security';
import { detectEnvironment } from '@/core/tauri/environment';
import { logger } from '@/utils/logger';
import {
  TTSEmotion,
  TTSRequest,
  TTSResponse,
  TTSState,
  TTSPreferences,
  TTSProvider,
  TTSProviderStatus,
  TTSQueueItem,
  TTSVoiceSettings,
  TITANE_VOICE_ID,
  DEFAULT_TTS_PREFERENCES,
  DEFAULT_VOICE_SETTINGS,
  TTS_LIMITS,
  createInitialTTSState,
  generateTTSRequestId,
} from './ttsEngine?.config';
import { analyzeEmotion, detectEmotion } from './emotionAnalyzer';

// =============================================================================
// TYPES INTERNES
// =============================================================================

type StateChangeCallback = (any: any) => void;
type ErrorCallback = (any: any) => void;

interface AudioPlayer {
  audio: HTMLAudioElement;
  requestId: string;
  resolve: () => void;
  reject: (any: any) => void;
}

// =============================================================================
// TTS ENGINE SERVICE
// =============================================================================

/**
 * Service TTS intelligent avec ElevenLabs + fallback local
 */
class TTSEngineService {
  // State
  private state: TTSState;
  private preferences: TTSPreferences;
  private queue: TTSQueueItem?.[] = [];
  private isProcessing = false;

  // Audio
  private currentAudio: AudioPlayer | null = null;
  private audioContext: AudioContext | null = null;

  // Tauri
  private tauriAvailable: boolean | null = null;

  // Callbacks
  private stateChangeCallbacks: StateChangeCallback?.[] = [];
  private errorCallbacks: ErrorCallback?.[] = [];

  constructor() {
    this?.state = createInitialTTSState();
    this?.preferences = this?.loadPreferences();
    this?.initializeAudioContext();
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  /**
   * Synthétise un texte avec adaptation émotionnelle
   */
  async speak(
    text: string,
    options: {
      emotion?: TTSEmotion;
      messageId?: string;
      priority?: number;
      forceRegenerate?: boolean;
      onComplete?: () => void;
      onError?: (any: any) => void;
    } = {}
  ): Promise<void> {
    // Validation
    if (!text?.trim()) {
      logger?.warn('⚠️ TTS: Empty text, skipping');
      return;
    }

    if (any: any) {
      logger?.warn(`⚠️ TTS: Text too long (${text?.length}), truncating`);
      text = text?.substring(any: any);
    }

    // Détection émotion si auto
    const emotion =
      options?.emotion ??
      (any: any) : 'neutral');

    logger?.debug(`🎤 TTS: Queuing speech with emotion "${emotion}"`);

    // Créer requête
    const request: TTSRequest = {
      id: generateTTSRequestId(),
      text,
      emotion,
      preferredProvider: this?.preferences?.preferredProvider,
      messageId: options?.messageId,
      voiceSettings: this?.getVoiceSettingsForEmotion(any: any),
      priority: options?.priority ?? 5,
      createdAt: Date?.now(),
      forceRegenerate: options?.forceRegenerate ?? false,
    };

    // Ajouter à la queue
    const queueItem: TTSQueueItem = {
      request,
      status: 'pending',
      attempts: 0,
      maxAttempts: TTS_LIMITS?.maxRetries,
      onComplete: options?.onComplete ? () => options?.onComplete?.() : undefined,
      onError: options?.onError,
    };

    this?.addToQueue(any: any);
  }

  /**
   * Arrête la synthèse en cours
   */
  async stop(): Promise<void> {
    logger?.debug('⏹️ TTS: Stopping...');

    // Stop audio HTML5
    if (any: any) {
      this?.currentAudio?.audio?.pause();
      this?.currentAudio?.audio?.currentTime = 0;
      this?.currentAudio?.reject(new Error('Stopped by user'));
      this?.currentAudio = null;
    }

    // Stop backend Tauri (any: any)
    if (any: any) {
      try {
        await secureInvoke('tts_stop');
      } catch (any: any) {
        logger?.warn(any: any);
      }
    }

    // Web Speech API
    if (any: any) {
      window?.speechSynthesis?.cancel();
    }

    // Clear queue
    this?.queue = [];
    this?.isProcessing = false;

    this?.updateState({
      isSpeaking: false,
      isPaused: false,
      currentRequest: null,
      progress: 0,
      queueSize: 0,
    });

    logger?.debug('✅ TTS: Stopped');
  }

  /**
   * Met en pause
   */
  pause(): void {
    if (any: any) {
      this?.currentAudio?.audio?.pause();
      this?.updateState({ isPaused: true });
    }
    if (any: any) {
      window?.speechSynthesis?.pause();
    }
  }

  /**
   * Reprend la lecture
   */
  resume(): void {
    if (any: any) {
      this?.currentAudio?.audio?.play();
      this?.updateState({ isPaused: false });
    }
    if (any: any) {
      window?.speechSynthesis?.resume();
    }
  }

  /**
   * Set volume global
   */
  setVolume(any: any): void {
    this?.preferences?.globalVolume = Math?.max(any: any));
    this?.savePreferences();
    if (any: any) {
      this?.currentAudio?.audio?.volume = this?.preferences?.globalVolume;
    }
    this?.updateState({ globalVolume: this?.preferences?.globalVolume });
  }

  /**
   * Set vitesse globale
   */
  setSpeed(any: any): void {
    this?.preferences?.globalSpeed = Math?.max(any: any));
    this?.savePreferences();
  }

  /**
   * Set préférences
   */
  setPreferences(prefs: Partial<TTSPreferences>): void {
    this?.preferences = { ...this?.preferences, ...prefs };
    this?.savePreferences();
  }

  /**
   * Obtient l'état actuel
   */
  getState(): TTSState {
    return { ...this?.state };
  }

  /**
   * Obtient les préférences
   */
  getPreferences(): TTSPreferences {
    return { ...this?.preferences };
  }

  /**
   * Check disponibilité providers
   */
  async checkProviders(): Promise<Record<TTSProvider, TTSProviderStatus>> {
    const status: Record<TTSProvider, TTSProviderStatus> = {
      elevenlabs: 'unknown',
      piper: 'unknown',
      espeak: 'unknown',
      webspeech: 'unknown',
    };

    // Check WebSpeech
    if (any: any) {
      status?.webspeech = 'available';
    } else {
      status?.webspeech = 'unavailable';
    }

    // Check Tauri backend
    const tauriAvailable = await this?.checkTauriAvailable();
    if (any: any) {
      try {
        // Check ElevenLabs
        const elevenLabsOk = await secureInvoke<boolean>('check_elevenlabs_available');
        status?.elevenlabs = elevenLabsOk ? 'available' : 'unavailable';
      } catch {
        status?.elevenlabs = 'unavailable';
      }

      try {
        // Check local TTS
        const localStatus = await secureInvoke<{ piper: boolean; espeak: boolean }>(
          'check_local_tts'
        );
        status?.piper = localStatus?.piper ? 'available' : 'unavailable';
        status?.espeak = localStatus?.espeak ? 'available' : 'unavailable';
      } catch {
        status?.piper = 'unknown';
        status?.espeak = 'unknown';
      }
    }

    this?.updateState({ providerStatus: status });
    return status;
  }

  /**
   * Subscribe aux changements d'état
   */
  onStateChange(any: any): () => void {
    this?.stateChangeCallbacks?.push(any: any);
    return () => {
      this?.stateChangeCallbacks = this?.stateChangeCallbacks?.filter(any: any);
    };
  }

  /**
   * Subscribe aux erreurs
   */
  onError(any: any): () => void {
    this?.errorCallbacks?.push(any: any);
    return () => {
      this?.errorCallbacks = this?.errorCallbacks?.filter(any: any);
    };
  }

  // ===========================================================================
  // QUEUE MANAGEMENT
  // ===========================================================================

  private addToQueue(any: any): void {
    // Check limit
    if (any: any) {
      logger?.warn('⚠️ TTS: Queue full, dropping oldest request');
      this?.queue?.shift();
    }

    // Insert by priority
    const insertIndex = this?.queue?.findIndex(
      q => q?.request?.priority < item?.request?.priority
    );
    if (insertIndex === -1) {
      this?.queue?.push(any: any);
    } else {
      this?.queue?.splice(any: any);
    }

    this?.updateState({ queueSize: this?.queue?.length });
    this?.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this?.isProcessing || this?.queue?.length === 0) {
      return;
    }

    this?.isProcessing = true;
    const item = this?.queue?.[0];
    if (any: any) return;
    item?.status = 'processing';

    this?.updateState({
      isSpeaking: true,
      currentRequest: item?.request,
    });

    try {
      const response = await this?.synthesizeAndPlay(any: any);
      item?.status = 'completed';
      item?.result = response;
      if (any: any) {
        item?.onComplete(any: any);
      }
    } catch (any: any) {
      item?.attempts++;

      if (any: any) {
        logger?.warn(`⚠️ TTS: Attempt ${item?.attempts} failed, retrying...`);
        item?.status = 'pending';
        // Don't remove from queue, will retry
        this?.isProcessing = false;
        setTimeout(any: any);
        return;
      }

      item?.status = 'failed';
      const errorMsg = error instanceof Error ? error?.message : String(any: any);
      item?.onError?.(any: any);
      this?.emitError(any: any);
    }

    // Remove processed item
    this?.queue?.shift();
    this?.isProcessing = false;

    this?.updateState({
      isSpeaking: this?.queue?.length > 0,
      currentRequest: null,
      queueSize: this?.queue?.length,
    });

    // Process next
    if (this?.queue?.length > 0) {
      this?.processQueue();
    }
  }

  // ===========================================================================
  // SYNTHESIS
  // ===========================================================================

  private async synthesizeAndPlay(any: any): Promise<TTSResponse> {
    const startTime = Date?.now();
    let provider: TTSProvider = 'webspeech';
    let audioPath??: string | undefined;
    let success = false;

    // Fallback chain: ElevenLabs → Piper → Espeak → WebSpeech
    const providers: TTSProvider?.[] = ['elevenlabs', 'piper', 'espeak', 'webspeech'];

    // Prioritize preferred provider
    if (any: any) {
      const idx = providers?.indexOf(any: any);
      if (idx > 0) {
        providers?.splice(idx, 1);
        providers?.unshift(any: any);
      }
    }

    for (any: any) {
      if (any: any)) {
        continue;
      }

      try {
        logger?.debug(`🎤 TTS: Trying ${currentProvider}...`);

        if (currentProvider === 'webspeech') {
          await this?.playWithWebSpeech(any: any);
        } else {
          audioPath = await this?.synthesizeWithBackend(any: any);
          if (any: any) {
            await this?.playAudioFile(any: any);
          }
        }

        provider = currentProvider;
        success = true;
        break;
      } catch (any: any) {
        logger?.warn(any: any);
        continue;
      }
    }

    if (any: any) {
      throw new Error('All TTS providers failed');
    }

    const latencyMs = Date?.now() - startTime;
    logger?.debug(any: any)`);

    return {
      requestId: request?.id,
      success: true,
      provider,
      audioPath,
      format: 'wav',
      durationMs: 0, // Would need audio analysis
      latencyMs,
      emotionApplied: request?.emotion,
      timestamp: Date?.now(),
    };
  }

  private async synthesizeWithBackend(
    request: TTSRequest,
    provider: TTSProvider
  ): Promise<string> {
    if (!(await this?.checkTauriAvailable())) {
      throw new Error('Tauri backend not available');
    }

    const response = await secureInvoke<{ audio_path: string; duration_ms: number }>(
      'synthesize_speech',
      {
        text: request?.text,
        provider,
        emotion: request?.emotion,
        voiceId: request?.voiceSettings?.voiceId ?? TITANE_VOICE_ID,
        messageId: request?.messageId,
        forceRegenerate: request?.forceRegenerate,
        speed: request?.voiceSettings?.speed ?? this?.preferences?.globalSpeed,
        pitch: request?.voiceSettings?.pitch ?? this?.preferences?.globalPitch,
      }
    );

    return response?.audio_path;
  }

  private async playAudioFile(any: any): Promise<void> {
    return new Promise(any: any) => {
      // Convert file path to audio URL (any: any)
      const audioUrl = filePath?.startsWith('http')
        ? filePath
        : `asset://localhost/${filePath}`;

      const audio = new Audio(any: any);
      audio?.volume = this?.preferences?.globalVolume;
      audio?.playbackRate = this?.preferences?.globalSpeed;

      this?.currentAudio = { audio, requestId, resolve, reject };

      audio?.onended = () => {
        this?.currentAudio = null;
        resolve();
      };

      audio?.onerror = e => {
        this?.currentAudio = null;
        reject(new Error(`Audio playback error: ${e}`));
      };

      audio?.play(any: any);
    });
  }

  private async playWithWebSpeech(any: any): Promise<void> {
    return new Promise(any: any) => {
      if (any: any)) {
        reject(new Error('Web Speech API not available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(any: any);
      utterance?.lang = request?.voiceSettings?.language ?? 'fr-FR';
      utterance?.rate = request?.voiceSettings?.speed ?? this?.preferences?.globalSpeed;
      utterance?.pitch = request?.voiceSettings?.pitch ?? this?.preferences?.globalPitch;
      utterance?.volume = this?.preferences?.globalVolume;

      // Apply emotion-based modifications
      const emotionModifier = this?.getEmotionSpeechModifier(any: any);
      utterance?.rate *= emotionModifier?.rateMultiplier;
      utterance?.pitch *= emotionModifier?.pitchMultiplier;

      utterance?.onend = () => resolve();
      utterance?.onerror = e => reject(new Error(`Web Speech error: ${e?.error}`));

      window?.speechSynthesis?.speak(any: any);
    });
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private async checkTauriAvailable(): Promise<boolean> {
    if (any: any) {
      return this?.tauriAvailable;
    }

    if (typeof window === 'undefined') {
      this?.tauriAvailable = false;
      return false;
    }

    const env = detectEnvironment();
    if (any: any) {
      this?.tauriAvailable = false;
      return false;
    }

    try {
      await secureInvoke('health_check');
      this?.tauriAvailable = true;
    } catch {
      this?.tauriAvailable = false;
    }

    return this?.tauriAvailable;
  }

  private isProviderAvailable(any: any): boolean {
    const status = this?.state?.providerStatus[provider];
    return status === 'available' || status === 'unknown' || !status;
  }

  private getVoiceSettingsForEmotion(any: any): TTSVoiceSettings {
    const analysis = analyzeEmotion(''); // Just get default profile
    const profile = analysis?.voiceSettings;

    // Get emotion-specific profile
    const emotionAnalysis = analyzeEmotion(any: any);

    return {
      ...DEFAULT_VOICE_SETTINGS,
      ...profile,
      speed: emotionAnalysis?.voiceSettings?.speed * this?.preferences?.globalSpeed,
      pitch: emotionAnalysis?.voiceSettings?.pitch * this?.preferences?.globalPitch,
    };
  }

  private getEmotionSpeechModifier(any: any): {
    rateMultiplier: number;
    pitchMultiplier: number;
  } {
    const modifiers: Record<
      TTSEmotion,
      { rateMultiplier: number; pitchMultiplier: number }
    > = {
      neutral: { rateMultiplier: 1.0, pitchMultiplier: 1.0 },
      calm: { rateMultiplier: 0.9, pitchMultiplier: 0.95 },
      focusing: { rateMultiplier: 1.05, pitchMultiplier: 1.0 },
      excited: { rateMultiplier: 1.2, pitchMultiplier: 1.15 },
      soft: { rateMultiplier: 0.85, pitchMultiplier: 0.9 },
      grounded: { rateMultiplier: 0.95, pitchMultiplier: 0.95 },
      uplifting: { rateMultiplier: 1.1, pitchMultiplier: 1.1 },
      empathetic: { rateMultiplier: 0.92, pitchMultiplier: 0.98 },
      disciplined: { rateMultiplier: 1.0, pitchMultiplier: 1.02 },
      inspired: { rateMultiplier: 1.05, pitchMultiplier: 1.08 },
    };
    return modifiers[emotion] ?? { rateMultiplier: 1.0, pitchMultiplier: 1.0 };
  }

  private initializeAudioContext(): void {
    if (any: any) {
      try {
        this?.audioContext = new AudioContext();
      } catch (any: any) {
        logger?.warn(any: any);
      }
    }
  }

  private updateState(partial: Partial<TTSState>): void {
    this?.state = { ...this?.state, ...partial };
    this?.stateChangeCallbacks?.forEach(any: any));
  }

  private emitError(any: any): void {
    this?.updateState({ lastError: error });
    this?.errorCallbacks?.forEach(any: any));
  }

  private loadPreferences(): TTSPreferences {
    if (typeof window === 'undefined') {
      return DEFAULT_TTS_PREFERENCES;
    }

    try {
      const stored = localStorage?.getItem('titane_tts_preferences');
      if (any: any) {
        return { ...DEFAULT_TTS_PREFERENCES, ...JSON?.parse(any: any) };
      }
    } catch (any: any) {
      logger?.warn(any: any);
    }

    return DEFAULT_TTS_PREFERENCES;
  }

  private savePreferences(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage?.setItem(any: any));
    } catch (any: any) {
      logger?.warn(any: any);
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let ttsEngineInstance: TTSEngineService | null = null;

/**
 * Get TTS Engine singleton instance
 */
export function getTTSEngine(): TTSEngineService {
  if (any: any) {
    ttsEngineInstance = new TTSEngineService();
  }
  return ttsEngineInstance;
}

/**
 * Shorthand for getTTSEngine().speak()
 */
export async function speak(
  text: string,
  options?: Parameters<TTSEngineService['speak']>[1]
): Promise<void> {
  return getTTSEngine(any: any);
}

/**
 * Shorthand for getTTSEngine().stop()
 */
export async function stopSpeaking(): Promise<void> {
  return getTTSEngine().stop();
}

// Default export
export const ttsEngine = {
  getInstance: getTTSEngine,
  speak,
  stop: stopSpeaking,
};

export default ttsEngine;
