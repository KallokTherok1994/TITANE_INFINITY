/**
 * TITANE_INFINITY v19.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2 — AUDIO SERVICE
 *   Service audio avec gestion TTS, devices et tests
 * ═══════════════════════════════════════════════════════════════════
 */

import { detectEnvironment } from '@/core/tauri/environment';
import { tauriClient } from '@/lib/tauriClient';
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

  constructor() {
    this.config = this.loadConfig();
    // Détection synchrone (detectEnvironment est sync malgré son nom)
    const env = detectEnvironment();
    this.isTauri = env.isTauri;
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

  async updateTTSSettings(settings: Partial<TTSSettings>): Promise<void> {
    this.config.tts = { ...this.config.tts, ...settings };
    this.saveConfig();
    // Note: Settings are stored locally and passed to tts_speak on each call
    // No backend sync needed - Piper/espeak use settings per-call
  }

  private async isElevenLabsConfigured(): Promise<boolean> {
    // Prefer secure backend storage in Tauri mode
    if (this.isTauri) {
      try {
        const res = (await tauriClient.hasSecret({
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
    const elevenLabsReady = await this.isElevenLabsConfigured();
    return AVAILABLE_VOICES.filter(voice => {
      if (voice.engine === 'elevenlabs') {
        return elevenLabsReady;
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
        devices = (await tauriClient.getAudioOutputDevices()) as AudioDevice[];
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

    // Default fallback
    if (devices.length === 0) {
      devices = [
        {
          id: 'default',
          name: 'Default Speaker',
          type: 'output',
          isDefault: true,
          isActive: true,
          driver: 'unknown',
        },
      ];
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
        devices = (await tauriClient.getAudioInputDevices()) as AudioDevice[];
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

    // Default fallback
    if (devices.length === 0) {
      devices = [
        {
          id: 'default',
          name: 'Default Microphone',
          type: 'input',
          isDefault: true,
          isActive: false,
          driver: 'unknown',
        },
      ];
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
        await tauriClient.setAudioOutputDevice({ deviceId });
      } catch (error) {
        console.warn('Failed to set output device:', error);
      }
    }
  }

  async setInputDevice(deviceId: string): Promise<void> {
    this.config.input.deviceId = deviceId;
    this.saveConfig();

    if (this.isTauri) {
      try {
        // Tauri 2.0 attend camelCase pour les paramètres
        await tauriClient.setAudioInputDevice({ deviceId });
      } catch (error) {
        console.warn('Failed to set input device:', error);
      }
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
        await tauriClient.testTts({ text, settings: this.config.tts });
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
        const result = (await tauriClient.testMicrophone(
          { durationMs },
          { timeout: timeoutMs }
        )) as MicrophoneTestResult;
        console.log('[AudioService] test_microphone result:', result);
        return result;
      }

      // Web Audio fallback
      console.log('[AudioService] Using Web Audio API fallback...');
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
          audioContext.close();

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

  async speak(text: string): Promise<void> {
    if (!text || text.trim().length === 0) {
      console.warn('[AudioService] speak() called with empty text');
      return;
    }

    // Prevent overlapping speech
    if (this.isSpeaking) {
      console.log('[AudioService] Already speaking, stopping previous speech');
      this.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isSpeaking = true;
    console.log(
      '[AudioService] speak() called. Tauri mode:',
      this.isTauri,
      'Text:',
      text.substring(0, 50) + '...'
    );

    try {
      if (this.isTauri) {
        try {
          console.log('[AudioService] Invoking tts_speak via Tauri...');
          await tauriClient.ttsSpeak({
            text,
            settings: this.config.tts,
          });
          console.log('[AudioService] tts_speak completed successfully');
        } catch (error) {
          console.error('[AudioService] tts_speak error:', error);
          // Only fallback to Web Speech if it's available
          if (this.isWebSpeechAvailable()) {
            console.log('[AudioService] Falling back to Web Speech API...');
            await this.speakWithWebSpeech(text);
          } else {
            console.warn(
              '[AudioService] No TTS available (Tauri failed, Web Speech not supported)'
            );
            throw error;
          }
        }
      } else {
        if (this.isWebSpeechAvailable()) {
          await this.speakWithWebSpeech(text);
        } else {
          console.warn('[AudioService] Web Speech API not available');
        }
      }
    } finally {
      this.isSpeaking = false;
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

  private speakWithWebSpeech(text: string): Promise<void> {
    if (!this.isWebSpeechAvailable()) {
      return Promise.reject(new Error('Web Speech API not available'));
    }

    console.log('[AudioService] Using Web Speech API');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.config.tts.language;
    utterance.rate = this.config.tts.rate;
    utterance.pitch = this.config.tts.pitch;
    utterance.volume = this.config.tts.volume * this.config.output.volume;

    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        console.log('[AudioService] Web Speech finished');
        resolve();
      };
      utterance.onerror = e => {
        console.error('[AudioService] Web Speech error:', e);
        reject(e);
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    console.log('[AudioService] stop() called');
    this.isSpeaking = false;

    // Stop Web Speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Stop Tauri TTS
    if (this.isTauri) {
      tauriClient.ttsStop().catch(err => {
        console.error('[AudioService] tts_stop error:', err);
      });
    }
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
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
      const result = (await tauriClient.vadGetState()) as {
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
      const result = (await tauriClient.vadProcessFrame({
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
      const result = (await tauriClient.vadConfigure({
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
      const result = await tauriClient.vadReset() as string;
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
      const result = await (tauriClient.vadTest?.() || Promise.resolve({
        success: false,
        tests: {
          silence_detection: false,
          speech_detection: false,
          speech_transition: false,
          silenceTransition: false,
        },
        message: 'vad_test command not available',
      })) as {
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
