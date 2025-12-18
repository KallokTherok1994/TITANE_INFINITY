/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — HYBRID TTS SERVICE
 *   Service TTS hybride avec fallback Web Speech API
 *   Priorité: Tauri Backend → Web Speech API → Silence
 *   [P0.4] Intégration anti-echo avec événements TTS
 * ═══════════════════════════════════════════════════════════════════
 */

import { detectEnvironment } from '@/core/tauri/environment';
import { secureInvoke } from '@/lib/security';
import {
  chatEngineHealthCheck,
  chatEngineSpeakText,
  type ChatEngineSpeechMode,
} from '@/services/tauri';
import { audioStateMachine } from '@/services/audio/audioStateMachine';
import { parlerTTSBridge, playAudioBlob, type ParlerTTSConfig } from './parlerTTSBridge';
import { antiEchoShield } from '@/services/voice/antiEchoShield';

export interface TTSConfig {
  rate?: number; // 0.5 - 2.0
  pitch?: number; // 0.0 - 2.0
  volume?: number; // 0.0 - 1.0
  voice?: string;
  lang?: string; // 'fr-FR', 'en-US'
}

export interface TTSStatus {
  provider: 'parler-tts' | 'tauri' | 'webspeech' | 'none';
  available: boolean;
  speaking: boolean;
  parlerTTSAvailable: boolean;
  tauriAvailable: boolean;
  webSpeechAvailable: boolean;
}

/**
 * [P0.4 ANTI-ECHO] Événements TTS pour synchronisation VAD
 */
export type TTSEventType = 'start' | 'end' | 'error';
export type TTSEventListener = (event: TTSEventType) => void;

/**
 * [P1.3] Élément de la file d'attente TTS
 */
interface TTSQueueItem {
  id: string;
  text: string;
  config: TTSConfig;
  useOnline: boolean;
  priority: 'normal' | 'high';
  resolve: () => void;
  reject: (error: Error) => void;
}

/**
 * Service TTS hybride
 */
// ✨ v24.2.1: TTL cache for availability checks (30s)
const AVAILABILITY_CACHE_TTL_MS = 30000;

interface AvailabilityCache {
  value: boolean;
  timestamp: number;
}

class HybridTTSService {
  private speaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  // ✨ v24.2.1: TTL-based cache instead of permanent null-check
  private parlerTTSCache: AvailabilityCache | null = null;
  private tauriCache: AvailabilityCache | null = null;

  // [P0.4 ANTI-ECHO] Listeners pour événements TTS
  private eventListeners: Set<TTSEventListener> = new Set();

  // [P1.3] File d'attente TTS
  private queue: TTSQueueItem[] = [];
  private isProcessingQueue = false;
  private currentItemId: string | null = null;

  /**
   * [P0.4 ANTI-ECHO] S'abonner aux événements TTS (start/end/error)
   * Utilisé par useVAD pour suspendre pendant la lecture TTS
   */
  onTTSEvent(listener: TTSEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * [P0.4 ANTI-ECHO] Émettre un événement TTS
   */
  private emitEvent(event: TTSEventType): void {
    console.log(`[HybridTTS] 📢 Event: ${event}`);
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('[HybridTTS] Listener error:', e);
      }
    });
  }

  /**
   * ✨ v24.2.1: Check if cache is still valid (within TTL)
   */
  private isCacheValid(cache: AvailabilityCache | null): boolean {
    if (!cache) return false;
    return Date.now() - cache.timestamp < AVAILABILITY_CACHE_TTL_MS;
  }

  /**
   * [v24.1 PARLER-TTS] Vérifie disponibilité Parler-TTS local
   * ✨ v24.2.1: Uses 30s TTL cache instead of permanent cache
   */
  private async checkParlerTTSAvailable(): Promise<boolean> {
    // ✨ v24.2.1: Return cached value if within TTL
    if (this.isCacheValid(this.parlerTTSCache) && this.parlerTTSCache) {
      return this.parlerTTSCache.value;
    }

    try {
      const health = await parlerTTSBridge.healthCheck();
      const available = health.status === 'healthy' && health.modelLoaded;

      // ✨ v24.2.1: Store with timestamp
      this.parlerTTSCache = { value: available, timestamp: Date.now() };

      if (available) {
        console.log('✅ TTS: Parler-TTS local available');
        console.log(
          `   Device: ${health.device}${health.gpuName ? ` (${health.gpuName})` : ''}`
        );
        console.log(`   Cache: ${health.cacheSizeMb.toFixed(1)} MB`);
      } else {
        console.warn('⚠️ TTS: Parler-TTS local unavailable or initializing');
      }

      return available;
    } catch (error) {
      // ✨ v24.3.8: Silent fallback si serveur TTS optionnel non démarré
      // Cache failure with shorter TTL (10s) to retry sooner
      this.parlerTTSCache = {
        value: false,
        timestamp: Date.now() - AVAILABILITY_CACHE_TTL_MS + 10000,
      };
      // Silent: console.warn('⚠️ TTS: Parler-TTS connection failed, falling back to other providers', error);
      return false;
    }
  }

  /**
   * Vérifie disponibilité Tauri Backend
   * ✨ v24.2.1: Uses 30s TTL cache instead of permanent cache
   */
  private async checkTauriAvailable(): Promise<boolean> {
    // ✨ v24.2.1: Return cached value if within TTL
    if (this.isCacheValid(this.tauriCache) && this.tauriCache) {
      return this.tauriCache.value;
    }

    if (typeof window === 'undefined') {
      this.tauriCache = { value: false, timestamp: Date.now() };
      return false;
    }

    const env = detectEnvironment();
    if (!env.isTauri) {
      // ✨ v24.2.1: Long cache for non-Tauri environment (won't change)
      this.tauriCache = { value: false, timestamp: Date.now() };
      return false;
    }

    try {
      await chatEngineHealthCheck();
      this.tauriCache = { value: true, timestamp: Date.now() };
      console.log('✅ TTS: Tauri backend available');
      return true;
    } catch (error) {
      // ✨ v24.2.1: Cache failure with shorter TTL (10s) to retry sooner
      this.tauriCache = {
        value: false,
        timestamp: Date.now() - AVAILABILITY_CACHE_TTL_MS + 10000,
      };
      console.warn(
        '⚠️ TTS: Tauri backend unavailable, using Web Speech API fallback',
        error
      );
      return false;
    }
  }

  /**
   * Vérifie disponibilité Web Speech API
   */
  private checkWebSpeechAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * [v24.1 PARLER-TTS] Synthétise texte via Parler-TTS local
   */
  private async speakParlerTTS(text: string, config: TTSConfig = {}): Promise<void> {
    try {
      console.log('🎤 TTS (Parler-TTS): Synthesizing...');
      console.log(`📡 Mode: Local API (http://localhost:8765)`);
      console.log(`⚙️  Style: ${config.voice || 'Adina default'}`);
      this.speaking = true;

      // Configuration Parler-TTS
      const parlerConfig: ParlerTTSConfig = {
        styleDescription: config.voice, // 'voice' utilisé comme description style
        format: 'wav',
        useCache: true,
      };

      // Synthétiser
      const result = await parlerTTSBridge.synthesize(text, parlerConfig);

      console.log(
        `✅ TTS (Parler-TTS): Generated ${result.durationSeconds.toFixed(2)}s audio`
      );
      console.log(`   Generation time: ${result.generationTimeMs}ms`);
      console.log(`   Cached: ${result.cached}`);
      console.log(`   Device: ${result.device}`);

      // [v19.5.0 ANTI-ECHO] Register TTS fingerprint AVANT playback
      // Extract audio as Float32Array for fingerprinting
      const audioContext = new AudioContext();
      const arrayBuffer = await result.audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const _audioData = audioBuffer.getChannelData(0); // Mono channel
      const _sampleRate = audioBuffer.sampleRate;

      const ttsId = antiEchoShield.startTTS(text, result.durationSeconds * 1000);

      // Jouer audio
      await playAudioBlob(result.audioBlob);

      // [v19.5.0 ANTI-ECHO] End TTS tracking
      antiEchoShield.endTTS(ttsId);

      console.log('✅ TTS (Parler-TTS): Playback complete');
    } catch (error) {
      console.error('❌ TTS (Parler-TTS): Error:', error);
      // [v19.5.0 ANTI-ECHO] Manual unmute on error
      antiEchoShield.endTTS('error');
      throw error;
    } finally {
      this.speaking = false;
    }
  }

  /**
   * Synthétise texte via Tauri Backend
   */
  private async speakTauri(
    text: string,
    config: TTSConfig = {},
    useOnline: boolean = false
  ): Promise<void> {
    try {
      console.log('🎤 TTS (Tauri): Synthesizing...');
      console.log(
        `📡 Mode: ${useOnline ? 'Online (Google TTS)' : 'Local (espeak/piper)'}`
      );
      console.log(
        `⚙️  Config: rate=${config.rate || 1.0}, pitch=${config.pitch || 1.0}, voice=${config.voice || 'default'}`
      );
      this.speaking = true;

      const mode: ChatEngineSpeechMode = useOnline ? 'online' : 'auto';
      const speed = Math.min(Math.max(config.rate ?? 1.0, 0.5), 2.0);
      const pitch = Math.min(Math.max(config.pitch ?? 1.0, 0.5), 2.0);

      // [v19.5.0 ANTI-ECHO] Start TTS tracking (no audio buffer available for Tauri)
      // Note: For Tauri, we don't have audio buffer, estimate duration from text length
      const estimatedDuration = text.length * 50; // ~50ms per character
      const ttsId = antiEchoShield.startTTS(text, estimatedDuration);

      await chatEngineSpeakText({
        text,
        mode,
        speed,
        pitch,
        voice: config.voice ?? null,
      });

      // [v19.5.0 ANTI-ECHO] End TTS tracking
      antiEchoShield.endTTS(ttsId);

      console.log('✅ TTS (Tauri): Success');
    } catch (error) {
      console.error('❌ TTS (Tauri): Error:', error);
      // [v19.5.0 ANTI-ECHO] Manual unmute on error
      antiEchoShield.endTTS('error');
      throw error;
    } finally {
      this.speaking = false;
    }
  }

  /**
   * Synthétise texte via Web Speech API
   */
  private async speakWebSpeech(text: string, config: TTSConfig = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.checkWebSpeechAvailable()) {
        reject(new Error('Web Speech API not available'));
        return;
      }

      console.log('🌐 TTS (Web Speech API): Synthesizing...');
      this.speaking = true;

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Configuration
      utterance.lang = config.lang || 'fr-FR';
      utterance.rate = config.rate || 1.0;
      utterance.pitch = config.pitch || 1.0;
      utterance.volume = config.volume || 1.0;

      // Sélection voix si spécifiée
      if (config.voice) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(
          v => v.name === config.voice || v.lang === config.lang
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // [v19.5.0 ANTI-ECHO] Start TTS tracking (no audio buffer for Web Speech API)
      const estimatedDuration = text.length * 50; // ~50ms per character
      const ttsId = antiEchoShield.startTTS(text, estimatedDuration);

      // Callbacks
      utterance.onend = () => {
        console.log('✅ TTS (Web Speech API): Success');
        this.speaking = false;
        this.currentUtterance = null;
        // [v19.5.0 ANTI-ECHO] End TTS tracking
        antiEchoShield.endTTS(ttsId);
        resolve();
      };

      utterance.onerror = event => {
        console.error('❌ TTS (Web Speech API): Error:', event.error);
        this.speaking = false;
        this.currentUtterance = null;
        // [v19.5.0 ANTI-ECHO] Manual unmute on error
        antiEchoShield.endTTS('error');
        reject(new Error(`Web Speech API error: ${event.error}`));
      };

      // Synthèse
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Synthétise texte (avec fallback automatique)
   * [P0.4 ANTI-ECHO] Émet events start/end/error pour synchronisation VAD
   * [v24.1] Priorité: Parler-TTS → Tauri → Web Speech API
   */
  async speak(
    text: string,
    config: TTSConfig = {},
    useOnline: boolean = false
  ): Promise<void> {
    if (!text.trim()) {
      console.warn('⚠️ TTS: Empty text, skipping');
      return;
    }

    console.log('\n🔊 TTS: Starting synthesis...');
    console.log(`📝 Text: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`);
    console.log(`🌐 Mode: ${useOnline ? 'Online' : 'Offline First'}`);

    // [P0.4 ANTI-ECHO] Notifier début TTS
    this.emitEvent('start');
    // [P1.1 STATE MACHINE] Transition vers ai_speaking
    audioStateMachine.transition('TTS_START');

    try {
      // Stratégie 1: Parler-TTS local (PRIORITAIRE v24.1)
      const parlerTTSAvailable = await this.checkParlerTTSAvailable();
      if (parlerTTSAvailable && !useOnline) {
        try {
          await this.speakParlerTTS(text, config);
          // [P0.4 ANTI-ECHO] Notifier fin TTS
          this.emitEvent('end');
          // [P1.1 STATE MACHINE] Transition vers idle
          audioStateMachine.transition('TTS_END');
          return;
        } catch (error) {
          console.warn('⚠️ TTS: Parler-TTS failed, falling back to Tauri backend');
        }
      }

      // Stratégie 2: Tauri Backend (fallback)
      const tauriAvailable = await this.checkTauriAvailable();
      if (tauriAvailable) {
        try {
          await this.speakTauri(text, config, useOnline);
          // [P0.4 ANTI-ECHO] Notifier fin TTS
          this.emitEvent('end');
          // [P1.1 STATE MACHINE] Transition vers idle
          audioStateMachine.transition('TTS_END');
          return;
        } catch (error) {
          console.warn('⚠️ TTS: Tauri failed, falling back to Web Speech API');
        }
      }

      // Stratégie 3: Web Speech API (fallback final)
      if (this.checkWebSpeechAvailable()) {
        try {
          await this.speakWebSpeech(text, config);
          // [P0.4 ANTI-ECHO] Notifier fin TTS
          this.emitEvent('end');
          // [P1.1 STATE MACHINE] Transition vers idle
          audioStateMachine.transition('TTS_END');
          return;
        } catch (error) {
          console.warn('⚠️ TTS: Web Speech API failed');
        }
      }

      // Stratégie 4: Silent mode (dernier recours)
      console.log('🔇 TTS: No provider available, silent mode');
      // [P0.4 ANTI-ECHO] Notifier fin même en mode silence
      this.emitEvent('end');
      // [P1.1 STATE MACHINE] Transition vers idle
      audioStateMachine.transition('TTS_END');
    } catch (error) {
      // [P0.4 ANTI-ECHO] Notifier erreur
      this.emitEvent('error');
      // [P1.1 STATE MACHINE] Transition vers error
      audioStateMachine.transition('TTS_ERROR');
      throw error;
    }
  }

  /**
   * Arrête synthèse en cours
   * [P0.4 ANTI-ECHO] Émet event 'end' pour reprendre VAD
   */
  async stop(): Promise<void> {
    console.log('⏹️ TTS: Stopping...');

    // v19.3.0: Arrêt Tauri via commande tts_stop (audio::commands)
    // ✨ v24.2.1: Check cached value instead of property
    if (this.tauriCache?.value) {
      try {
        await secureInvoke('tts_stop');
        console.log('✅ TTS: Tauri backend stopped');
      } catch (error) {
        console.warn('⚠️ TTS: Tauri stop failed:', error);
      }
    }

    // Arrêt Web Speech API
    if (this.checkWebSpeechAvailable()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }

    this.speaking = false;
    console.log('✅ TTS: Stopped');

    // [P0.4 ANTI-ECHO] Notifier fin TTS (pour reprendre VAD)
    this.emitEvent('end');

    // [P1.3] Vider la queue si on arrête manuellement
    this.clearQueue();
  }

  /**
   * [P1.3] Ajouter à la file d'attente TTS
   * @param text - Texte à synthétiser
   * @param config - Configuration TTS
   * @param useOnline - Mode online
   * @param priority - 'high' pour passer devant la queue
   */
  async enqueue(
    text: string,
    config: TTSConfig = {},
    useOnline: boolean = false,
    priority: 'normal' | 'high' = 'normal'
  ): Promise<void> {
    if (!text.trim()) {
      return;
    }

    return new Promise((resolve, reject) => {
      const item: TTSQueueItem = {
        id: `tts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text,
        config,
        useOnline,
        priority,
        resolve,
        reject,
      };

      if (priority === 'high') {
        // Insérer après l'élément en cours (s'il y en a un)
        const insertIndex = this.currentItemId ? 1 : 0;
        this.queue.splice(insertIndex, 0, item);
        console.log(`[HybridTTS] ⚡ HIGH priority item added at position ${insertIndex}`);
      } else {
        this.queue.push(item);
      }

      console.log(
        `[HybridTTS] 📥 Queued: "${text.substring(0, 30)}..." (queue size: ${this.queue.length})`
      );

      // Démarrer le traitement si pas en cours
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * [P1.3] Traiter la file d'attente
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.queue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;
      this.currentItemId = item.id;

      try {
        console.log(`[HybridTTS] 🔄 Processing: "${item.text.substring(0, 30)}..."`);
        await this.speak(item.text, item.config, item.useOnline);
        item.resolve();
      } catch (error) {
        console.error(`[HybridTTS] ❌ Queue item failed:`, error);
        item.reject(error instanceof Error ? error : new Error(String(error)));
      }

      this.currentItemId = null;
    }

    this.isProcessingQueue = false;
    console.log('[HybridTTS] ✅ Queue empty');
  }

  /**
   * [P1.3] Vider la file d'attente
   */
  clearQueue(): void {
    const count = this.queue.length;
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    this.currentItemId = null;
    if (count > 0) {
      console.log(`[HybridTTS] 🗑️ Queue cleared (${count} items removed)`);
    }
  }

  /**
   * [P1.3] Obtenir la taille de la queue
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * [P1.3] Vérifier si la queue est en cours de traitement
   */
  isQueueProcessing(): boolean {
    return this.isProcessingQueue;
  }

  /**
   * Obtient statut TTS
   */
  async getStatus(): Promise<TTSStatus> {
    const parlerTTSAvailable = await this.checkParlerTTSAvailable();
    const tauriAvailable = await this.checkTauriAvailable();
    const webSpeechAvailable = this.checkWebSpeechAvailable();

    // v24.1: Priorité Parler-TTS → Tauri → Web Speech API
    let provider: 'parler-tts' | 'tauri' | 'webspeech' | 'none' = 'none';
    let available = false;

    if (parlerTTSAvailable) {
      provider = 'parler-tts';
      available = true;
    } else if (tauriAvailable) {
      provider = 'tauri';
      available = true;
    } else if (webSpeechAvailable) {
      provider = 'webspeech';
      available = true;
    }

    return {
      provider,
      available,
      speaking: this.speaking,
      parlerTTSAvailable,
      tauriAvailable,
      webSpeechAvailable,
    };
  }

  /**
   * Obtient voix disponibles
   */
  async getAvailableVoices(): Promise<Array<{ name: string; lang: string }>> {
    // Web Speech API (plus fiable que backend Tauri pour liste voix)
    if (this.checkWebSpeechAvailable()) {
      const voices = window.speechSynthesis.getVoices();
      return voices.map(v => ({
        name: v.name,
        lang: v.lang,
      }));
    }

    return [];
  }

  /**
   * Reset cache Tauri et Parler-TTS disponibilité
   * ✨ v24.2.1: Clears TTL cache to force fresh checks
   */
  resetCache(): void {
    this.parlerTTSCache = null;
    this.tauriCache = null;
  }

  /**
   * [v24.1] Modifier style vocal Parler-TTS via TITANE IA
   * Permet au chat IA de corriger/améliorer/optimiser la voix
   */
  async updateVoiceStyle(
    newStyleDescription: string,
    saveAsDefault: boolean = true
  ): Promise<void> {
    console.log('[HybridTTS] 🎨 Updating voice style...');
    console.log(`   New style: ${newStyleDescription.substring(0, 60)}...`);
    console.log(`   Save as default: ${saveAsDefault}`);

    try {
      await parlerTTSBridge.updateVoiceStyle(newStyleDescription, saveAsDefault);
      console.log('[HybridTTS] ✅ Voice style updated successfully');

      // Reset cache pour forcer re-check
      this.parlerTTSCache = null;
    } catch (error) {
      console.error('[HybridTTS] ❌ Failed to update voice style:', error);
      throw error;
    }
  }

  /**
   * [v24.1] Obtenir style vocal actuel
   */
  getCurrentVoiceStyle(): string {
    return parlerTTSBridge.getCurrentStyle();
  }
}

// Export singleton
export const hybridTTS = new HybridTTSService();
export default hybridTTS;
