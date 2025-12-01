/**
 * TITANE∞ vΩΩΩ — Intelligent TTS Engine Service
 * © 2025 TITANE Team. All rights reserved.
 *
 * Service TTS intelligent avec:
 * - ElevenLabs premium (Voice ID: FvmvwvObRqIHojkEGh5N)
 * - Fallback Piper → Espeak
 * - Adaptation émotionnelle automatique
 * - Cache intelligent
 * - Queue de synthèse
 */

import { invoke } from '@tauri-apps/api/core';
import { detectEnvironment } from '@/core/tauri/environment';
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
} from './ttsEngine.config';
import { analyzeEmotion, detectEmotion } from './emotionAnalyzer';

// =============================================================================
// TYPES INTERNES
// =============================================================================

type StateChangeCallback = (state: TTSState) => void;
type ErrorCallback = (error: string) => void;

interface AudioPlayer {
  audio: HTMLAudioElement;
  requestId: string;
  resolve: () => void;
  reject: (error: Error) => void;
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
  private queue: TTSQueueItem[] = [];
  private isProcessing = false;

  // Audio
  private currentAudio: AudioPlayer | null = null;
  private audioContext: AudioContext | null = null;

  // Tauri
  private tauriAvailable: boolean | null = null;

  // Callbacks
  private stateChangeCallbacks: StateChangeCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];

  constructor() {
    this.state = createInitialTTSState();
    this.preferences = this.loadPreferences();
    this.initializeAudioContext();
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
      onError?: (error: string) => void;
    } = {}
  ): Promise<void> {
    // Validation
    if (!text.trim()) {
      console.warn('⚠️ TTS: Empty text, skipping');
      return;
    }

    if (text.length > TTS_LIMITS.maxTextLength) {
      console.warn(`⚠️ TTS: Text too long (${text.length}), truncating`);
      text = text.substring(0, TTS_LIMITS.maxTextLength);
    }

    // Détection émotion si auto
    const emotion = options.emotion ??
      (this.preferences.emotionalAdaptation ? detectEmotion(text) : 'neutral');

    console.log(`🎤 TTS: Queuing speech with emotion "${emotion}"`);

    // Créer requête
    const request: TTSRequest = {
      id: generateTTSRequestId(),
      text,
      emotion,
      preferredProvider: this.preferences.preferredProvider,
      messageId: options.messageId,
      voiceSettings: this.getVoiceSettingsForEmotion(emotion),
      priority: options.priority ?? 5,
      createdAt: Date.now(),
      forceRegenerate: options.forceRegenerate ?? false,
    };

    // Ajouter à la queue
    const queueItem: TTSQueueItem = {
      request,
      status: 'pending',
      attempts: 0,
      maxAttempts: TTS_LIMITS.maxRetries,
      onComplete: options.onComplete ? () => options.onComplete?.() : undefined,
      onError: options.onError,
    };

    this.addToQueue(queueItem);
  }

  /**
   * Arrête la synthèse en cours
   */
  async stop(): Promise<void> {
    console.log('⏹️ TTS: Stopping...');

    // Stop audio HTML5
    if (this.currentAudio) {
      this.currentAudio.audio.pause();
      this.currentAudio.audio.currentTime = 0;
      this.currentAudio.reject(new Error('Stopped by user'));
      this.currentAudio = null;
    }

    // Stop backend Tauri (v19.3.0: use tts_stop from audio::commands)
    if (this.tauriAvailable) {
      try {
        await invoke('tts_stop');
      } catch (error) {
        console.warn('⚠️ TTS: Backend stop failed:', error);
      }
    }

    // Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Clear queue
    this.queue = [];
    this.isProcessing = false;

    this.updateState({
      isSpeaking: false,
      isPaused: false,
      currentRequest: null,
      progress: 0,
      queueSize: 0,
    });

    console.log('✅ TTS: Stopped');
  }

  /**
   * Met en pause
   */
  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.audio.pause();
      this.updateState({ isPaused: true });
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  /**
   * Reprend la lecture
   */
  resume(): void {
    if (this.currentAudio) {
      this.currentAudio.audio.play();
      this.updateState({ isPaused: false });
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  /**
   * Set volume global
   */
  setVolume(volume: number): void {
    this.preferences.globalVolume = Math.max(0, Math.min(1, volume));
    this.savePreferences();
    if (this.currentAudio) {
      this.currentAudio.audio.volume = this.preferences.globalVolume;
    }
    this.updateState({ globalVolume: this.preferences.globalVolume });
  }

  /**
   * Set vitesse globale
   */
  setSpeed(speed: number): void {
    this.preferences.globalSpeed = Math.max(0.5, Math.min(2, speed));
    this.savePreferences();
  }

  /**
   * Set préférences
   */
  setPreferences(prefs: Partial<TTSPreferences>): void {
    this.preferences = { ...this.preferences, ...prefs };
    this.savePreferences();
  }

  /**
   * Obtient l'état actuel
   */
  getState(): TTSState {
    return { ...this.state };
  }

  /**
   * Obtient les préférences
   */
  getPreferences(): TTSPreferences {
    return { ...this.preferences };
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      status.webspeech = 'available';
    } else {
      status.webspeech = 'unavailable';
    }

    // Check Tauri backend
    const tauriAvailable = await this.checkTauriAvailable();
    if (tauriAvailable) {
      try {
        // Check ElevenLabs
        const elevenLabsOk = await invoke<boolean>('check_elevenlabs_available');
        status.elevenlabs = elevenLabsOk ? 'available' : 'unavailable';
      } catch {
        status.elevenlabs = 'unavailable';
      }

      try {
        // Check local TTS
        const localStatus = await invoke<{ piper: boolean; espeak: boolean }>('check_local_tts');
        status.piper = localStatus.piper ? 'available' : 'unavailable';
        status.espeak = localStatus.espeak ? 'available' : 'unavailable';
      } catch {
        status.piper = 'unknown';
        status.espeak = 'unknown';
      }
    }

    this.updateState({ providerStatus: status });
    return status;
  }

  /**
   * Subscribe aux changements d'état
   */
  onStateChange(callback: StateChangeCallback): () => void {
    this.stateChangeCallbacks.push(callback);
    return () => {
      this.stateChangeCallbacks = this.stateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe aux erreurs
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  // ===========================================================================
  // QUEUE MANAGEMENT
  // ===========================================================================

  private addToQueue(item: TTSQueueItem): void {
    // Check limit
    if (this.queue.length >= TTS_LIMITS.maxQueueSize) {
      console.warn('⚠️ TTS: Queue full, dropping oldest request');
      this.queue.shift();
    }

    // Insert by priority
    const insertIndex = this.queue.findIndex(q => q.request.priority < item.request.priority);
    if (insertIndex === -1) {
      this.queue.push(item);
    } else {
      this.queue.splice(insertIndex, 0, item);
    }

    this.updateState({ queueSize: this.queue.length });
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const item = this.queue[0];
    item.status = 'processing';

    this.updateState({
      isSpeaking: true,
      currentRequest: item.request,
    });

    try {
      const response = await this.synthesizeAndPlay(item.request);
      item.status = 'completed';
      item.result = response;
      if (item.onComplete) {
        item.onComplete(response);
      }
    } catch (error) {
      item.attempts++;

      if (item.attempts < item.maxAttempts) {
        console.warn(`⚠️ TTS: Attempt ${item.attempts} failed, retrying...`);
        item.status = 'pending';
        // Don't remove from queue, will retry
        this.isProcessing = false;
        setTimeout(() => this.processQueue(), TTS_LIMITS.retryDelayMs);
        return;
      }

      item.status = 'failed';
      const errorMsg = error instanceof Error ? error.message : String(error);
      item.onError?.(errorMsg);
      this.emitError(errorMsg);
    }

    // Remove processed item
    this.queue.shift();
    this.isProcessing = false;

    this.updateState({
      isSpeaking: this.queue.length > 0,
      currentRequest: null,
      queueSize: this.queue.length,
    });

    // Process next
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }

  // ===========================================================================
  // SYNTHESIS
  // ===========================================================================

  private async synthesizeAndPlay(request: TTSRequest): Promise<TTSResponse> {
    const startTime = Date.now();
    let provider: TTSProvider = 'webspeech';
    let audioPath: string | undefined;
    let success = false;

    // Fallback chain: ElevenLabs → Piper → Espeak → WebSpeech
    const providers: TTSProvider[] = ['elevenlabs', 'piper', 'espeak', 'webspeech'];

    // Prioritize preferred provider
    if (request.preferredProvider) {
      const idx = providers.indexOf(request.preferredProvider);
      if (idx > 0) {
        providers.splice(idx, 1);
        providers.unshift(request.preferredProvider);
      }
    }

    for (const currentProvider of providers) {
      if (!this.isProviderAvailable(currentProvider)) {
        continue;
      }

      try {
        console.log(`🎤 TTS: Trying ${currentProvider}...`);

        if (currentProvider === 'webspeech') {
          await this.playWithWebSpeech(request);
        } else {
          audioPath = await this.synthesizeWithBackend(request, currentProvider);
          if (audioPath) {
            await this.playAudioFile(audioPath, request.id);
          }
        }

        provider = currentProvider;
        success = true;
        break;
      } catch (error) {
        console.warn(`⚠️ TTS: ${currentProvider} failed:`, error);
        continue;
      }
    }

    if (!success) {
      throw new Error('All TTS providers failed');
    }

    const latencyMs = Date.now() - startTime;
    console.log(`✅ TTS: Synthesis complete via ${provider} (${latencyMs}ms)`);

    return {
      requestId: request.id,
      success: true,
      provider,
      audioPath,
      format: 'wav',
      durationMs: 0, // Would need audio analysis
      latencyMs,
      emotionApplied: request.emotion,
      timestamp: Date.now(),
    };
  }

  private async synthesizeWithBackend(
    request: TTSRequest,
    provider: TTSProvider
  ): Promise<string> {
    if (!await this.checkTauriAvailable()) {
      throw new Error('Tauri backend not available');
    }

    const response = await invoke<{ audio_path: string; duration_ms: number }>(
      'synthesize_speech',
      {
        text: request.text,
        provider,
        emotion: request.emotion,
        voiceId: request.voiceSettings?.voiceId ?? TITANE_VOICE_ID,
        messageId: request.messageId,
        forceRegenerate: request.forceRegenerate,
        speed: request.voiceSettings?.speed ?? this.preferences.globalSpeed,
        pitch: request.voiceSettings?.pitch ?? this.preferences.globalPitch,
      }
    );

    return response.audio_path;
  }

  private async playAudioFile(filePath: string, requestId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Convert file path to audio URL (Tauri asset protocol)
      const audioUrl = filePath.startsWith('http')
        ? filePath
        : `asset://localhost/${filePath}`;

      const audio = new Audio(audioUrl);
      audio.volume = this.preferences.globalVolume;
      audio.playbackRate = this.preferences.globalSpeed;

      this.currentAudio = { audio, requestId, resolve, reject };

      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = (e) => {
        this.currentAudio = null;
        reject(new Error(`Audio playback error: ${e}`));
      };

      audio.play().catch(reject);
    });
  }

  private async playWithWebSpeech(request: TTSRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(request.text);
      utterance.lang = request.voiceSettings?.language ?? 'fr-FR';
      utterance.rate = request.voiceSettings?.speed ?? this.preferences.globalSpeed;
      utterance.pitch = request.voiceSettings?.pitch ?? this.preferences.globalPitch;
      utterance.volume = this.preferences.globalVolume;

      // Apply emotion-based modifications
      const emotionModifier = this.getEmotionSpeechModifier(request.emotion);
      utterance.rate *= emotionModifier.rateMultiplier;
      utterance.pitch *= emotionModifier.pitchMultiplier;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(new Error(`Web Speech error: ${e.error}`));

      window.speechSynthesis.speak(utterance);
    });
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private async checkTauriAvailable(): Promise<boolean> {
    if (this.tauriAvailable !== null) {
      return this.tauriAvailable;
    }

    if (typeof window === 'undefined') {
      this.tauriAvailable = false;
      return false;
    }

    const env = detectEnvironment();
    if (!env.isTauri) {
      this.tauriAvailable = false;
      return false;
    }

    try {
      await invoke('health_check');
      this.tauriAvailable = true;
    } catch {
      this.tauriAvailable = false;
    }

    return this.tauriAvailable;
  }

  private isProviderAvailable(provider: TTSProvider): boolean {
    const status = this.state.providerStatus[provider];
    return status === 'available' || status === 'unknown';
  }

  private getVoiceSettingsForEmotion(emotion: TTSEmotion): TTSVoiceSettings {
    const analysis = analyzeEmotion(''); // Just get default profile
    const profile = analysis.voiceSettings;

    // Get emotion-specific profile
    const emotionAnalysis = analyzeEmotion(emotion);

    return {
      ...DEFAULT_VOICE_SETTINGS,
      ...profile,
      speed: emotionAnalysis.voiceSettings.speed * this.preferences.globalSpeed,
      pitch: emotionAnalysis.voiceSettings.pitch * this.preferences.globalPitch,
    };
  }

  private getEmotionSpeechModifier(emotion: TTSEmotion): { rateMultiplier: number; pitchMultiplier: number } {
    const modifiers: Record<TTSEmotion, { rateMultiplier: number; pitchMultiplier: number }> = {
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
    return modifiers[emotion];
  }

  private initializeAudioContext(): void {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        this.audioContext = new AudioContext();
      } catch (error) {
        console.warn('⚠️ TTS: Could not create AudioContext:', error);
      }
    }
  }

  private updateState(partial: Partial<TTSState>): void {
    this.state = { ...this.state, ...partial };
    this.stateChangeCallbacks.forEach(cb => cb(this.state));
  }

  private emitError(error: string): void {
    this.updateState({ lastError: error });
    this.errorCallbacks.forEach(cb => cb(error));
  }

  private loadPreferences(): TTSPreferences {
    if (typeof window === 'undefined') {
      return DEFAULT_TTS_PREFERENCES;
    }

    try {
      const stored = localStorage.getItem('titane_tts_preferences');
      if (stored) {
        return { ...DEFAULT_TTS_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('⚠️ TTS: Could not load preferences:', error);
    }

    return DEFAULT_TTS_PREFERENCES;
  }

  private savePreferences(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('titane_tts_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('⚠️ TTS: Could not save preferences:', error);
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
  if (!ttsEngineInstance) {
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
  return getTTSEngine().speak(text, options);
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
