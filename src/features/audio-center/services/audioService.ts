/**
 * TITANE_INFINITY v28.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v28.0.0 — AUDIO SERVICE
 *   Service audio avec gestion TTS, devices et tests
 *   🎤 Audio Permission Fix Applied v28.0.0
 * ═══════════════════════════════════════════════════════════════════
 */

import { tauriClient } from '@/lib/tauriClient';

// Tauri client adapter for this service.
// Audio I/O device methods use __TAURI__ directly to avoid getUserMedia()
// permission issues in WebKitGTK (v28.0.0 audio permission fix).
// All other IPC calls delegate to tauriClient so they can be properly mocked.
const simpleTauriClient = {
  async getAudioInputDevices() {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return (window as any).__TAURI__.core.invoke('get_audio_input_devices');
    }
    throw new Error('Tauri not available');
  },
  async getAudioOutputDevices() {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return (window as any).__TAURI__.core.invoke('get_audio_output_devices');
    }
    throw new Error('Tauri not available');
  },
  async testMicrophone(params: any, _options?: any) {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return (window as any).__TAURI__.core.invoke('test_microphone', params);
    }
    throw new Error('Tauri not available');
  },
  async identityGetActiveVoiceProfile() {
    return tauriClient.identityGetActiveVoiceProfile();
  },
  async identitySetActiveVoiceProfile(params: any) {
    return tauriClient.identitySetActiveVoiceProfile(params);
  },
  async hasSecret(params: any) {
    return tauriClient.hasSecret(params);
  },
  async setAudioOutputDevice(params: any) {
    return tauriClient.setAudioOutputDevice(params);
  },
  async getAudioDeviceConfig() {
    return tauriClient.getAudioDeviceConfig();
  },
  async saveAudioDeviceConfig(params: any) {
    return tauriClient.saveAudioDeviceConfig(params);
  },
  async setAudioInputDevice(params: any) {
    return tauriClient.setAudioInputDevice(params);
  },
  async testTts(params: any) {
    return tauriClient.testTts(params);
  },
  async ttsSpeak(params: any) {
    return tauriClient.ttsSpeak(params);
  },
  async stopSpeaking() {
    return tauriClient.stopSpeaking();
  },
  async ttsStop() {
    return tauriClient.ttsStop();
  },
  async pauseSpeaking() {
    return tauriClient.pauseSpeaking();
  },
  async resumeSpeaking() {
    return tauriClient.resumeSpeaking();
  },
  async isSpeaking() {
    return tauriClient.isSpeaking();
  },
  async vadGetState() {
    return tauriClient.vadGetState();
  },
  async vadProcessFrame(params: any) {
    return tauriClient.vadProcessFrame(params);
  },
  async vadConfigure(params: any) {
    return tauriClient.vadConfigure(params);
  },
  async vadReset() {
    return tauriClient.vadReset();
  },
  async vadTest() {
    return tauriClient.vadTest();
  },
};

// Simple environment detection
const isTauriEnvironment = typeof window !== 'undefined' && '__TAURI__' in window;

import {
  buildTtsSettingsFromTitaneProfile,
  normalizeTitaneVoiceProfiles,
} from '../titaneVoiceProfiles';
import {
  type TTSSettings,
  type VoiceProfile,
  type AudioDevice,
  type AudioOutputSettings,
  type AudioInputSettings,
  type AudioTestResult,
  type MicrophoneTestResult,
  type AudioConfiguration,
  DEFAULT_AUDIO_CONFIG,
  AVAILABLE_VOICES,
} from '../types';

const STORAGE_KEY = 'titane_audio_config';
const DEVICE_CACHE_TTL = 30000; // 30 secondes
const ELEVENLABS_VOICE_IDS = new Set(
  AVAILABLE_VOICES.filter(voice => voice.engine === 'elevenlabs').map(voice => voice.id)
);

export type AudioPlaybackProvider = 'tauri' | 'webspeech' | null;

export interface AudioSpeakLifecycle {
  onStart?: (provider: Exclude<AudioPlaybackProvider, null>) => void;
  onFallback?: (provider: Exclude<AudioPlaybackProvider, null>) => void;
  onComplete?: (provider: Exclude<AudioPlaybackProvider, null>) => void;
}

export interface AudioPlaybackRuntimeState {
  speaking: boolean;
  paused: boolean;
  provider: AudioPlaybackProvider;
  supportsPause: boolean;
}

const waitForUiFrame = (): Promise<void> =>
  new Promise(resolve => {
    if (
      typeof window !== 'undefined' &&
      typeof window.requestAnimationFrame === 'function'
    ) {
      window.requestAnimationFrame(() => resolve());
      return;
    }

    setTimeout(resolve, 0);
  });

interface DeviceCache {
  output: AudioDevice[];
  input: AudioDevice[];
  timestamp: number;
}

class AudioService {
  private config: AudioConfiguration;
  private isTauri: boolean = false;
  private deviceCache: DeviceCache | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private activeProvider: AudioPlaybackProvider = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private runtimeVoiceProfileHydrationAttempted: boolean = false;
  private runtimeVoiceProfileHydrationPromise: Promise<void> | null = null;

  constructor() {
    this.config = this.loadConfig();
    // 🎤 AUDIO FIX v28.0.0: Simplified environment detection
    this.isTauri = isTauriEnvironment;
    const normalizedTTS = this.normalizeRuntimeCompatibleTTS(this.config.tts);
    if (
      normalizedTTS.engine !== this.config.tts.engine ||
      normalizedTTS.voiceId !== this.config.tts.voiceId ||
      normalizedTTS.language !== this.config.tts.language
    ) {
      this.config = {
        ...this.config,
        tts: normalizedTTS,
      };
      this.saveConfig();
    }
    console.log('[AudioService] Initialized. Tauri mode:', this.isTauri);
  }

  // ─────────────────────────────────────────────────────────────────
  //  Status
  // ─────────────────────────────────────────────────────────────────

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  getIsTauri(): boolean {
    return this.isTauri;
  }

  // ─────────────────────────────────────────────────────────────────
  //  Configuration Persistence
  // ─────────────────────────────────────────────────────────────────

  private loadConfig(): AudioConfiguration {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load audio config:', error);
    }
    return DEFAULT_AUDIO_CONFIG;
  }

  private saveConfig(): void {
    try {
      this.config.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save audio config:', error);
    }
  }

  getConfig(): AudioConfiguration {
    return { ...this.config };
  }

  // ─────────────────────────────────────────────────────────────────
  //  TTS Settings
  // ─────────────────────────────────────────────────────────────────

  getTTSSettings(): TTSSettings {
    return { ...this.config.tts };
  }

  private shouldHydrateVoiceProfileFromRuntime(): boolean {
    const { tts } = this.config;

    return (
      !tts.voiceProfileId &&
      tts.engine === DEFAULT_AUDIO_CONFIG.tts.engine &&
      tts.voiceId === DEFAULT_AUDIO_CONFIG.tts.voiceId &&
      tts.language === DEFAULT_AUDIO_CONFIG.tts.language &&
      tts.rate === DEFAULT_AUDIO_CONFIG.tts.rate &&
      tts.pitch === DEFAULT_AUDIO_CONFIG.tts.pitch &&
      tts.volume === DEFAULT_AUDIO_CONFIG.tts.volume
    );
  }

  private async ensureRuntimeVoiceProfileHydrated(): Promise<void> {
    if (!this.isTauri || this.runtimeVoiceProfileHydrationAttempted) {
      return;
    }

    if (!this.shouldHydrateVoiceProfileFromRuntime()) {
      this.runtimeVoiceProfileHydrationAttempted = true;
      return;
    }

    if (this.runtimeVoiceProfileHydrationPromise) {
      return this.runtimeVoiceProfileHydrationPromise;
    }

    this.runtimeVoiceProfileHydrationAttempted = true;
    this.runtimeVoiceProfileHydrationPromise =
      this.hydrateActiveVoiceProfileFromRuntime().finally(() => {
        this.runtimeVoiceProfileHydrationPromise = null;
      });

    return this.runtimeVoiceProfileHydrationPromise;
  }

  private async hydrateActiveVoiceProfileFromRuntime(): Promise<void> {
    try {
      const rawActiveProfile = await simpleTauriClient.identityGetActiveVoiceProfile();
      const activeProfile = normalizeTitaneVoiceProfiles(
        rawActiveProfile == null ? [] : [rawActiveProfile]
      )[0];

      if (!activeProfile || !this.shouldHydrateVoiceProfileFromRuntime()) {
        return;
      }

      this.config = {
        ...this.config,
        tts: this.normalizeRuntimeCompatibleTTS({
          ...this.config.tts,
          ...buildTtsSettingsFromTitaneProfile(activeProfile, this.config.tts),
        }),
      };
      this.saveConfig();
    } catch (error) {
      console.warn(
        '[AudioService] Failed to hydrate TITANE active voice profile:',
        error
      );
    }
  }

  private normalizeRuntimeCompatibleTTS(settings: TTSSettings): TTSSettings {
    if (!this.isTauri || settings.engine !== 'elevenlabs') {
      return settings;
    }

    const shouldResetVoiceId =
      !settings.voiceId || ELEVENLABS_VOICE_IDS.has(settings.voiceId);

    return {
      ...settings,
      engine: 'piper',
      voiceId: shouldResetVoiceId ? DEFAULT_AUDIO_CONFIG.tts.voiceId : settings.voiceId,
      language: settings.language || DEFAULT_AUDIO_CONFIG.tts.language,
    };
  }

  async updateTTSSettings(settings: Partial<TTSSettings>): Promise<void> {
    this.config.tts = this.normalizeRuntimeCompatibleTTS({
      ...this.config.tts,
      ...settings,
    });
    this.saveConfig();
    if (settings.voiceProfileId !== undefined) {
      await this.syncVoiceIdentityProfile(settings.voiceProfileId);
    }
    // Note: Settings are stored locally and passed to tts_speak on each call
    // No backend sync needed - Piper/espeak use settings per-call
  }

  private buildRuntimeTTSSettings(): TTSSettings & { outputDeviceId?: string } {
    const runtimeTTS = this.normalizeRuntimeCompatibleTTS(this.config.tts);
    return {
      engine: runtimeTTS.engine,
      voiceId: runtimeTTS.voiceId,
      rate: runtimeTTS.rate,
      pitch: runtimeTTS.pitch,
      volume: runtimeTTS.volume,
      language: runtimeTTS.language,
      emotionEnabled: runtimeTTS.emotionEnabled,
      autoFallback: runtimeTTS.autoFallback,
      outputDeviceId: this.config.output.deviceId || undefined,
    };
  }

  private async syncVoiceIdentityProfile(voiceProfileId?: string): Promise<void> {
    if (!this.isTauri || !voiceProfileId) {
      return;
    }

    try {
      await simpleTauriClient.identitySetActiveVoiceProfile({ voiceProfileId });
    } catch (error) {
      console.warn('[AudioService] Failed to sync TITANE voice profile:', error);
    }
  }

  private async isElevenLabsConfigured(): Promise<boolean> {
    // Prefer secure backend storage in Tauri mode
    if (this.isTauri) {
      try {
        const res = (await simpleTauriClient.hasSecret({
          key: 'elevenlabs_api_key',
        })) as { ok: boolean; data: boolean | null } | boolean;
        if (res && typeof res === 'object' && 'data' in res) {
          return Boolean((res as { data: boolean | null }).data);
        }
        // Some backends may return a raw boolean
        if (typeof res === 'boolean') return res;
      } catch {
        // fall through
      }
    }

    // Web fallback (legacy)
    try {
      return Boolean(localStorage.getItem('elevenlabs_api_key'));
    } catch {
      return false;
    }
  }

  async getAvailableVoices(): Promise<VoiceProfile[]> {
    await this.ensureRuntimeVoiceProfileHydrated();
    const elevenLabsReady = await this.isElevenLabsConfigured();
    return AVAILABLE_VOICES.filter(voice => {
      if (voice.engine === 'elevenlabs') {
        return elevenLabsReady && !this.isTauri;
      }
      return true;
    });
  }

  // ─────────────────────────────────────────────────────────────────
  //  Audio Devices (with cache)
  // ─────────────────────────────────────────────────────────────────

  private isCacheValid(): boolean {
    return (
      this.deviceCache !== null &&
      Date.now() - this.deviceCache.timestamp < DEVICE_CACHE_TTL
    );
  }

  async getOutputDevices(forceRefresh = false): Promise<AudioDevice[]> {
    // Return cached devices if valid
    if (
      !forceRefresh &&
      this.isCacheValid() &&
      this.deviceCache &&
      this.deviceCache.output.length > 0
    ) {
      return this.deviceCache.output;
    }

    let devices: AudioDevice[] = [];

    if (this.isTauri) {
      try {
        devices = (await simpleTauriClient.getAudioOutputDevices()) as AudioDevice[];
      } catch (error) {
        console.warn('Failed to get output devices from Tauri:', error);
      }
    }

    // Fallback: Use Web Audio API if no devices from Tauri
    if (
      devices.length === 0 &&
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices
    ) {
      try {
        const webDeviceList = await navigator.mediaDevices.enumerateDevices();
        const webDevices = webDeviceList
          .filter(d => d.kind === 'audiooutput')
          .map((d, index) => ({
            id: d.deviceId || `output-${index}`,
            name: d.label || `Speaker ${index + 1}`,
            type: 'output' as const,
            isDefault: d.deviceId === 'default',
            isActive: index === 0,
            driver: 'webaudio',
          }));
        devices = webDevices;
      } catch (error) {
        console.warn('Failed to enumerate devices:', error);
      }
    }

    // No fake fallback: return empty array so UI can show real "no devices" state
    if (devices.length === 0) {
      console.warn('[AudioService] No output audio devices found');
    }

    // Update cache
    this.deviceCache = {
      ...this.deviceCache,
      output: devices,
      input: this.deviceCache?.input || [],
      timestamp: Date.now(),
    };

    return devices;
  }

  async getInputDevices(forceRefresh = false): Promise<AudioDevice[]> {
    // Return cached devices if valid
    if (
      !forceRefresh &&
      this.isCacheValid() &&
      this.deviceCache &&
      this.deviceCache.input.length > 0
    ) {
      return this.deviceCache.input;
    }

    let devices: AudioDevice[] = [];

    if (this.isTauri) {
      try {
        devices = (await simpleTauriClient.getAudioInputDevices()) as AudioDevice[];
      } catch (error) {
        console.warn('Failed to get input devices from Tauri:', error);
      }
    }

    // Fallback: Use Web Audio API if no devices from Tauri
    if (
      devices.length === 0 &&
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices
    ) {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        devices = allDevices
          .filter(d => d.kind === 'audioinput')
          .map((d, index) => ({
            id: d.deviceId || `input-${index}`,
            name: d.label || `Microphone ${index + 1}`,
            type: 'input' as const,
            isDefault: d.deviceId === 'default',
            isActive: index === 0,
            driver: 'webaudio',
          }));
      } catch (error) {
        console.warn('Failed to enumerate input devices:', error);
      }
    }

    // No fake fallback: return empty array so UI can show real "no devices" state
    if (devices.length === 0) {
      console.warn('[AudioService] No input audio devices found');
    }

    // Update cache
    this.deviceCache = {
      ...this.deviceCache,
      output: this.deviceCache?.output || [],
      input: devices,
      timestamp: Date.now(),
    };

    return devices;
  }

  // Invalider le cache si besoin
  invalidateDeviceCache(): void {
    this.deviceCache = null;
  }

  async setOutputDevice(deviceId: string): Promise<void> {
    this.config.output.deviceId = deviceId;
    this.saveConfig();
    this.invalidateDeviceCache();

    if (this.isTauri) {
      try {
        // Tauri 2.0 attend camelCase pour les paramètres
        await simpleTauriClient.setAudioOutputDevice({ deviceId });
      } catch (error) {
        console.warn('Failed to set output device:', error);
      }

      // Persist to canonical audio device config
      try {
        const deviceLabel = await this._resolveDeviceLabel(deviceId, 'output');
        const current = (await simpleTauriClient.getAudioDeviceConfig()) as Record<
          string,
          unknown
        >;
        await simpleTauriClient.saveAudioDeviceConfig({
          ...(current || {}),
          outputDeviceId: deviceId,
          outputDeviceLabel: deviceLabel,
        });
      } catch (e) {
        console.warn('[AudioService] canonical audio config save failed:', e);
      }
    }
  }

  async setInputDevice(deviceId: string): Promise<void> {
    this.config.input.deviceId = deviceId;
    this.saveConfig();

    if (this.isTauri) {
      try {
        // Tauri 2.0 attend camelCase pour les paramètres
        await simpleTauriClient.setAudioInputDevice({ deviceId });
      } catch (error) {
        console.warn('Failed to set input device:', error);
      }

      // Persist to canonical audio device config
      try {
        const deviceLabel = await this._resolveDeviceLabel(deviceId, 'input');
        const current = (await simpleTauriClient.getAudioDeviceConfig()) as Record<
          string,
          unknown
        >;
        await simpleTauriClient.saveAudioDeviceConfig({
          ...(current || {}),
          inputDeviceId: deviceId,
          inputDeviceLabel: deviceLabel,
        });
      } catch (e) {
        console.warn('[AudioService] canonical audio config save failed:', e);
      }
    }
  }

  /** Resolves a device ID to its label using the cached device list. */
  private async _resolveDeviceLabel(
    deviceId: string,
    type: 'input' | 'output'
  ): Promise<string> {
    try {
      const devices =
        type === 'output' ? await this.getOutputDevices() : await this.getInputDevices();
      return devices.find(d => d.id === deviceId)?.name ?? deviceId;
    } catch {
      return deviceId;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  Volume & Settings
  // ─────────────────────────────────────────────────────────────────

  async updateOutputSettings(settings: Partial<AudioOutputSettings>): Promise<void> {
    this.config.output = { ...this.config.output, ...settings };
    this.saveConfig();
    // Note: Output settings are stored locally. Device changes use set_audio_output_device.
  }

  async updateInputSettings(settings: Partial<AudioInputSettings>): Promise<void> {
    this.config.input = { ...this.config.input, ...settings };
    this.saveConfig();
    // Note: Input settings are stored locally. Device changes use set_audio_input_device.
  }

  // ─────────────────────────────────────────────────────────────────
  //  Audio Tests
  // ─────────────────────────────────────────────────────────────────

  async testSpeaker(testText?: string): Promise<AudioTestResult> {
    const text = testText || 'Bonjour, je suis TITANE Infinity, votre assistante vocale.';
    const startTime = Date.now();

    try {
      if (this.isTauri) {
        await this.ensureRuntimeVoiceProfileHydrated();
        await this.syncVoiceIdentityProfile(this.config.tts.voiceProfileId);
        await simpleTauriClient.testTts({
          text,
          settings: this.buildRuntimeTTSSettings(),
        });
      } else if (this.isWebSpeechAvailable()) {
        // Web Speech fallback only if available
        await new Promise<void>((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = this.config.tts.language;
          utterance.rate = this.config.tts.rate;
          utterance.pitch = this.config.tts.pitch;
          utterance.volume = this.config.tts.volume;
          utterance.onend = () => resolve();
          utterance.onerror = e => reject(e);
          window.speechSynthesis.speak(utterance);
        });
      } else {
        throw new Error(
          'No TTS engine available (Web Speech API not supported in WebKitGTK)'
        );
      }

      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        latencyMs,
        qualityScore: this.config.tts.engine === 'piper' ? 85 : 60,
      };
    } catch (error) {
      return {
        success: false,
        latencyMs: 0,
        qualityScore: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async testMicrophone(durationMs: number = 3000): Promise<MicrophoneTestResult> {
    console.log(
      '[AudioService] testMicrophone called, duration:',
      durationMs,
      'isTauri:',
      this.isTauri
    );

    try {
      if (this.isTauri) {
        console.log('[AudioService] Calling Tauri test_microphone...');
        // Timeout = durée enregistrement + 5s de marge pour traitement
        const timeoutMs = durationMs + 5000;
        // Tauri 2.0 attend camelCase pour les paramètres de commande
        const result = (await simpleTauriClient.testMicrophone(
          { durationMs, deviceId: this.config.input.deviceId || undefined },
          { timeout: timeoutMs }
        )) as MicrophoneTestResult;
        console.log('[AudioService] test_microphone result:', result);
        return result;
      }

      // Web Audio fallback - seulement en mode Web pur (pas Tauri)
      console.log('[AudioService] Using Web Audio API fallback...');

      // IMPORTANT: En mode Tauri, éviter getUserMedia car WebKitGTK peut causer des problèmes
      if (this.isTauri) {
        console.warn('[AudioService] Tauri fallback attempted - avoiding Web APIs');
        return {
          success: false,
          peakLevel: 0,
          noiseFloor: 0,
          signalToNoise: 0,
          errorMessage: 'Microphone test failed in Tauri mode. Check system permissions.',
        };
      }

      // Vérifier si les APIs sont disponibles
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          success: false,
          peakLevel: 0,
          noiseFloor: 0,
          signalToNoise: 0,
          errorMessage: 'Web Audio API not supported',
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId:
            this.config.input.deviceId !== 'default'
              ? this.config.input.deviceId
              : undefined,
          noiseSuppression: this.config.input.noiseSuppression,
          echoCancellation: this.config.input.echoCancellation,
          autoGainControl: this.config.input.autoGainControl,
        },
      });

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 2048;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      let peakLevel = 0;
      const samples: number[] = [];

      return new Promise(resolve => {
        const interval = setInterval(() => {
          analyser.getByteTimeDomainData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const dataValue = dataArray[i];
            if (dataValue === undefined) continue;
            const value = (dataValue - 128) / 128;
            sum += value * value;
            if (Math.abs(value) > peakLevel) {
              peakLevel = Math.abs(value);
            }
          }

          samples.push(Math.sqrt(sum / dataArray.length));
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          stream.getTracks().forEach(t => t.stop());
          audioContext.close().catch(console.warn);

          // Calculate noise floor (average of lowest 20% of samples)
          samples.sort((a, b) => a - b);
          const noiseFloorSamples = samples.slice(0, Math.floor(samples.length * 0.2));
          const noiseFloor =
            noiseFloorSamples.reduce((a, b) => a + b, 0) / noiseFloorSamples.length;

          // Signal to noise ratio in dB
          const snr =
            peakLevel > 0 && noiseFloor > 0 ? 20 * Math.log10(peakLevel / noiseFloor) : 0;

          resolve({
            success: peakLevel > 0.01,
            peakLevel,
            noiseFloor,
            signalToNoise: snr,
            errorMessage: peakLevel <= 0.01 ? 'No audio signal detected' : undefined,
          });
        }, durationMs);
      });
    } catch (error) {
      console.error('[AudioService] testMicrophone error:', error);

      // Amélioration des messages d'erreur
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Traduire les erreurs communes
        if (
          errorMessage.includes('Permission denied') ||
          errorMessage.includes('NotAllowedError')
        ) {
          errorMessage =
            'Permission microphone refusée. Vérifiez les paramètres du navigateur.';
        } else if (
          errorMessage.includes('NotFoundError') ||
          errorMessage.includes('DevicesNotFoundError')
        ) {
          errorMessage =
            'Aucun microphone détecté. Vérifiez la connexion du périphérique.';
        } else if (errorMessage.includes('not allowed by the user agent')) {
          errorMessage =
            'Accès microphone bloqué par le navigateur. En mode Tauri, utilisez les paramètres système.';
        }
      }

      return {
        success: false,
        peakLevel: 0,
        noiseFloor: 0,
        signalToNoise: 0,
        errorMessage: error instanceof Error ? error.message : 'Microphone test failed',
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  TTS Quick Speak
  // ─────────────────────────────────────────────────────────────────

  async speak(text: string, lifecycle?: AudioSpeakLifecycle): Promise<void> {
    if (!text || text.trim().length === 0) {
      console.warn('[AudioService] speak() called with empty text');
      return;
    }

    // Prevent overlapping speech
    if (this.isSpeaking) {
      console.log('[AudioService] Already speaking, stopping previous speech');
      await this.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isSpeaking = true;
    this.isPaused = false;
    this.activeProvider = null;
    console.log(
      '[AudioService] speak() called. Tauri mode:',
      this.isTauri,
      'Text:',
      text.substring(0, 50) + '...'
    );

    try {
      if (this.isTauri) {
        try {
          await this.ensureRuntimeVoiceProfileHydrated();
          await this.syncVoiceIdentityProfile(this.config.tts.voiceProfileId);
          this.activeProvider = 'tauri';
          lifecycle?.onStart?.('tauri');
          await waitForUiFrame();
          console.log('[AudioService] Invoking tts_speak via Tauri...');
          await simpleTauriClient.ttsSpeak({
            text,
            settings: this.buildRuntimeTTSSettings(),
          });
          console.log('[AudioService] tts_speak completed successfully');
          lifecycle?.onComplete?.('tauri');
        } catch (error) {
          console.error('[AudioService] tts_speak error:', error);
          // Only fallback to Web Speech if it's available
          if (this.config.tts.autoFallback && this.isWebSpeechAvailable()) {
            console.log('[AudioService] Falling back to Web Speech API...');
            lifecycle?.onFallback?.('webspeech');
            await this.speakWithWebSpeech(text, lifecycle);
          } else {
            console.warn(
              '[AudioService] No TTS available (Tauri failed, Web Speech not supported)'
            );
            throw error;
          }
        }
      } else {
        if (this.isWebSpeechAvailable()) {
          await this.speakWithWebSpeech(text, lifecycle);
        } else {
          throw new Error('Web Speech API non disponible');
        }
      }
    } finally {
      this.isSpeaking = false;
      this.isPaused = false;
      this.activeProvider = null;
      this.currentUtterance = null;
    }
  }

  /**
   * Check if Web Speech API is available
   */
  private isWebSpeechAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    );
  }

  private speakWithWebSpeech(
    text: string,
    lifecycle?: AudioSpeakLifecycle
  ): Promise<void> {
    if (!this.isWebSpeechAvailable()) {
      return Promise.reject(new Error('Web Speech API not available'));
    }

    console.log('[AudioService] Using Web Speech API');
    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;
    utterance.lang = this.config.tts.language;
    utterance.rate = this.config.tts.rate;
    utterance.pitch = this.config.tts.pitch;
    utterance.volume = this.config.tts.volume * this.config.output.volume;

    return new Promise((resolve, reject) => {
      utterance.onstart = () => {
        this.activeProvider = 'webspeech';
        this.isPaused = false;
        lifecycle?.onStart?.('webspeech');
      };
      utterance.onend = () => {
        console.log('[AudioService] Web Speech finished');
        lifecycle?.onComplete?.('webspeech');
        resolve();
      };
      utterance.onerror = e => {
        console.error('[AudioService] Web Speech error:', e);
        reject(e);
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  async stop(): Promise<void> {
    console.log('[AudioService] stop() called');
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.activeProvider = null;

    // Stop Web Speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Stop Tauri TTS
    if (this.isTauri) {
      try {
        await simpleTauriClient.stopSpeaking();
      } catch (err) {
        console.error('[AudioService] stop_speaking error:', err);
        await simpleTauriClient.ttsStop().catch(fallbackErr => {
          console.error('[AudioService] tts_stop error:', fallbackErr);
        });
      }
    }
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  async pause(): Promise<void> {
    if (!this.isSpeaking) {
      throw new Error('Aucune lecture audio en cours');
    }

    if (this.activeProvider === 'webspeech' && typeof window !== 'undefined') {
      window.speechSynthesis.pause();
      this.isPaused = true;
      return;
    }

    if (this.activeProvider === 'tauri') {
      await simpleTauriClient.pauseSpeaking();
      this.isPaused = true;
      return;
    }

    throw new Error('Pause audio indisponible pour ce provider');
  }

  async resume(): Promise<void> {
    if (!this.isSpeaking) {
      throw new Error('Aucune lecture audio en cours');
    }

    if (this.activeProvider === 'webspeech' && typeof window !== 'undefined') {
      window.speechSynthesis.resume();
      this.isPaused = false;
      return;
    }

    if (this.activeProvider === 'tauri') {
      await simpleTauriClient.resumeSpeaking();
      this.isPaused = false;
      return;
    }

    throw new Error('Reprise audio indisponible pour ce provider');
  }

  async getPlaybackRuntimeState(): Promise<AudioPlaybackRuntimeState> {
    if (this.activeProvider === 'tauri' && this.isTauri) {
      try {
        const speaking = Boolean(await simpleTauriClient.isSpeaking());
        return {
          speaking,
          paused: speaking ? this.isPaused : false,
          provider: speaking || this.isPaused ? 'tauri' : null,
          supportsPause: true,
        };
      } catch (error) {
        console.warn('[AudioService] Failed to query Tauri speaking state:', error);
      }
    }

    if (this.isWebSpeechAvailable()) {
      const speaking = window.speechSynthesis.speaking;
      const paused = window.speechSynthesis.paused;
      return {
        speaking,
        paused,
        provider: speaking || paused ? 'webspeech' : null,
        supportsPause: true,
      };
    }

    return {
      speaking: this.isSpeaking && !this.isPaused,
      paused: this.isPaused,
      provider: this.activeProvider,
      supportsPause: this.isTauri,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  //  Voice Activity Detection (VAD) v∞
  // ─────────────────────────────────────────────────────────────────

  /**
   * Get current VAD state (silence/speech)
   */
  async getVADState(): Promise<{ state: string; isSpeaking: boolean }> {
    if (!this.isTauri) {
      return { state: 'silence', isSpeaking: false };
    }
    try {
      const result = (await simpleTauriClient.vadGetState()) as {
        state: string;
        isSpeaking: boolean;
      };
      return result;
    } catch (error) {
      console.error('[AudioService] VAD get state error:', error);
      return { state: 'silence', isSpeaking: false };
    }
  }

  /**
   * Process audio frame through VAD
   * @param audioData Float32Array of audio samples
   */
  async processVADFrame(
    audioData: Float32Array | number[]
  ): Promise<{ state: string; isSpeaking: boolean }> {
    if (!this.isTauri) {
      return { state: 'silence', isSpeaking: false };
    }
    try {
      const samples = Array.from(audioData);
      const result = (await simpleTauriClient.vadProcessFrame({
        audioData: samples,
      })) as { state: string; isSpeaking: boolean };
      return result;
    } catch (error) {
      console.error('[AudioService] VAD process frame error:', error);
      return { state: 'silence', isSpeaking: false };
    }
  }

  /**
   * Configure VAD parameters
   */
  async configureVAD(config: {
    threshold?: number;
    minSpeechFrames?: number;
    minSilenceFrames?: number;
  }): Promise<string> {
    if (!this.isTauri) {
      return 'VAD configuration not available (browser mode)';
    }
    try {
      const result = (await simpleTauriClient.vadConfigure({
        config: {
          threshold: config.threshold ?? 0.02,
          minSpeechFrames: config.minSpeechFrames ?? 10,
          minSilenceFrames: config.minSilenceFrames ?? 20,
        },
      })) as string;
      console.log('[AudioService] VAD configured:', result);
      return result;
    } catch (error) {
      console.error('[AudioService] VAD configure error:', error);
      throw error;
    }
  }

  /**
   * Reset VAD state to silence
   */
  async resetVAD(): Promise<string> {
    if (!this.isTauri) {
      return 'VAD reset not available (browser mode)';
    }
    try {
      const result = (await simpleTauriClient.vadReset()) as string;
      console.log('[AudioService] VAD reset:', result);
      return result;
    } catch (error) {
      console.error('[AudioService] VAD reset error:', error);
      throw error;
    }
  }

  /**
   * Run VAD self-test
   */
  async testVAD(): Promise<{
    success: boolean;
    tests: {
      silenceDetection: boolean;
      speechDetection: boolean;
      speechTransition: boolean;
      silenceTransition: boolean;
    };
    message: string;
  }> {
    if (!this.isTauri) {
      return {
        success: false,
        tests: {
          silenceDetection: false,
          speechDetection: false,
          speechTransition: false,
          silenceTransition: false,
        },
        message: 'VAD test not available (browser mode)',
      };
    }
    try {
      const result = (await (simpleTauriClient.vadTest?.() ||
        Promise.resolve({
          success: false,
          tests: {
            silence_detection: false,
            speech_detection: false,
            speech_transition: false,
            silenceTransition: false,
          },
          message: 'vad_test command not available',
        }))) as {
        success: boolean;
        tests: {
          silence_detection: boolean;
          speech_detection: boolean;
          speech_transition: boolean;
          silence_transition: boolean;
        };
        message: string;
      };

      console.log('[AudioService] VAD test result:', result);

      return {
        success: result.success,
        tests: {
          silenceDetection: result.tests.silence_detection,
          speechDetection: result.tests.speech_detection,
          speechTransition: result.tests.speech_transition,
          silenceTransition: result.tests.silence_transition,
        },
        message: result.message,
      };
    } catch (error) {
      console.error('[AudioService] VAD test error:', error);
      return {
        success: false,
        tests: {
          silenceDetection: false,
          speechDetection: false,
          speechTransition: false,
          silenceTransition: false,
        },
        message: `VAD test error: ${error}`,
      };
    }
  }
}

// Singleton export
export const audioService = new AudioService();
export default audioService;
