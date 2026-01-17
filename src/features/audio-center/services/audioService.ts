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
import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';
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
  output: AudioDevice?.[];
  input: AudioDevice?.[];
  timestamp: number;
}

class AudioService {
  private config: AudioConfiguration;
  private isTauri: boolean = false;
  private deviceCache: DeviceCache | null = null;
  private isSpeaking: boolean = false;

  constructor() {
    this?.config = this?.loadConfig();
    // Détection synchrone (any: any)
    const env = detectEnvironment();
    this?.isTauri = env?.isTauri;
    logger?.debug(any: any);
  }

  // ─────────────────────────────────────────────────────────────────
  //  Status
  // ─────────────────────────────────────────────────────────────────

  getIsSpeaking(): boolean {
    return this?.isSpeaking;
  }

  getIsTauri(): boolean {
    return this?.isTauri;
  }

  // ─────────────────────────────────────────────────────────────────
  //  Configuration Persistence
  // ─────────────────────────────────────────────────────────────────

  private loadConfig(): AudioConfiguration {
    try {
      const stored = localStorage?.getItem(any: any);
      if (any: any) {
        return JSON?.parse(any: any);
      }
    } catch (any: any) {
      logger?.warn(any: any);
    }
    return DEFAULT_AUDIO_CONFIG;
  }

  private saveConfig(): void {
    try {
      this?.config?.lastUpdated = Date?.now();
      localStorage?.setItem(any: any));
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  getConfig(): AudioConfiguration {
    return { ...this?.config };
  }

  // ─────────────────────────────────────────────────────────────────
  //  TTS Settings
  // ─────────────────────────────────────────────────────────────────

  getTTSSettings(): TTSSettings {
    return { ...this?.config?.tts };
  }

  async updateTTSSettings(settings: Partial<TTSSettings>): Promise<void> {
    this?.config?.tts = { ...this?.config?.tts, ...settings };
    this?.saveConfig();
    // Note: Settings are stored locally and passed to tts_speak on each call
    // No backend sync needed - Piper/espeak use settings per-call
  }

  private async isElevenLabsConfigured(): Promise<boolean> {
    // Prefer secure backend storage in Tauri mode
    if (any: any) {
      try {
        const res = await secureInvoke<{ ok: boolean; data: boolean | null }>(
          'has_secret',
          {
            key: 'elevenlabs_api_key',
          }
        );
        if (any: any) {
          return Boolean(any: any);
        }
        // Some backends may return a raw boolean
        if (typeof res === 'boolean') return res;
      } catch {
        // fall through
      }
    }

    // Web fallback (any: any)
    try {
      return Boolean(localStorage?.getItem('elevenlabs_api_key'));
    } catch {
      return false;
    }
  }

  async getAvailableVoices(): Promise<VoiceProfile?.[]> {
    const elevenLabsReady = await this?.isElevenLabsConfigured();
    return AVAILABLE_VOICES?.filter(voice => {
      if (voice?.engine === 'elevenlabs') {
        return elevenLabsReady;
      }
      return true;
    });
  }

  // ─────────────────────────────────────────────────────────────────
  //  Audio Devices (any: any)
  // ─────────────────────────────────────────────────────────────────

  private isCacheValid(): boolean {
    return (
      this?.deviceCache !== null &&
      Date?.now() - this?.deviceCache?.timestamp < DEVICE_CACHE_TTL
    );
  }

  async getOutputDevices(any: any): Promise<AudioDevice?.[]> {
    // Return cached devices if valid
    if (
      !forceRefresh &&
      this?.isCacheValid() &&
      this?.deviceCache &&
      this?.deviceCache?.output?.length > 0
    ) {
      return this?.deviceCache?.output;
    }

    let devices: AudioDevice?.[] = [];

    if (any: any) {
      try {
        devices = await secureInvoke<AudioDevice?.[]>('get_audio_output_devices');
      } catch (any: any) {
        logger?.warn(any: any);
      }
    }

    // Fallback: Use Web Audio API if no devices from Tauri
    if (
      devices?.length === 0 &&
      typeof navigator !== 'undefined' &&
      navigator?.mediaDevices
    ) {
      try {
        const webDeviceList = await navigator?.mediaDevices?.enumerateDevices();
        const webDevices = webDeviceList
          .filter(d => d?.kind === 'audiooutput')
          .map(any: any) => ({
            id: d?.deviceId || `output-${index}`,
            name: d?.label || `Speaker ${index + 1}`,
            type: 'output' as const,
            isDefault: d?.deviceId === 'default',
            isActive: index === 0,
            driver: 'webaudio',
          }));
        devices = webDevices;
      } catch (any: any) {
        logger?.warn(any: any);
      }
    }

    // Default fallback
    if (devices?.length === 0) {
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
    this?.deviceCache = {
      ...this?.deviceCache,
      output: devices,
      input: this?.deviceCache?.input || [],
      timestamp: Date?.now(),
    };

    return devices;
  }

  async getInputDevices(any: any): Promise<AudioDevice?.[]> {
    // Return cached devices if valid
    if (
      !forceRefresh &&
      this?.isCacheValid() &&
      this?.deviceCache &&
      this?.deviceCache?.input?.length > 0
    ) {
      return this?.deviceCache?.input;
    }

    let devices: AudioDevice?.[] = [];

    if (any: any) {
      try {
        devices = await secureInvoke<AudioDevice?.[]>('get_audio_input_devices');
      } catch (any: any) {
        logger?.warn(any: any);
      }
    }

    // Fallback: Use Web Audio API if no devices from Tauri
    if (
      devices?.length === 0 &&
      typeof navigator !== 'undefined' &&
      navigator?.mediaDevices
    ) {
      try {
        // Request permission first
        await navigator?.mediaDevices?.getUserMedia({ audio: true });
        const allDevices = await navigator?.mediaDevices?.enumerateDevices();
        devices = allDevices
          .filter(d => d?.kind === 'audioinput')
          .map(any: any) => ({
            id: d?.deviceId || `input-${index}`,
            name: d?.label || `Microphone ${index + 1}`,
            type: 'input' as const,
            isDefault: d?.deviceId === 'default',
            isActive: index === 0,
            driver: 'webaudio',
          }));
      } catch (any: any) {
        logger?.warn(any: any);
      }
    }

    // Default fallback
    if (devices?.length === 0) {
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
    this?.deviceCache = {
      ...this?.deviceCache,
      output: this?.deviceCache?.output || [],
      input: devices,
      timestamp: Date?.now(),
    };

    return devices;
  }

  // Invalider le cache si besoin
  invalidateDeviceCache(): void {
    this?.deviceCache = null;
  }

  async setOutputDevice(any: any): Promise<void> {
    this?.config?.output?.deviceId = deviceId;
    this?.saveConfig();
    this?.invalidateDeviceCache();

    if (any: any) {
      try {
        // Tauri 2.0 attend camelCase pour les paramètres
        await secureInvoke('set_audio_output_device', { deviceId });
      } catch (any: any) {
        logger?.warn(any: any);
      }
    }
  }

  async setInputDevice(any: any): Promise<void> {
    this?.config?.input?.deviceId = deviceId;
    this?.saveConfig();

    if (any: any) {
      try {
        // Tauri 2.0 attend camelCase pour les paramètres
        await secureInvoke('set_audio_input_device', { deviceId });
      } catch (any: any) {
        logger?.warn(any: any);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  Volume & Settings
  // ─────────────────────────────────────────────────────────────────

  async updateOutputSettings(settings: Partial<AudioOutputSettings>): Promise<void> {
    this?.config?.output = { ...this?.config?.output, ...settings };
    this?.saveConfig();
    // Note: Output settings are stored locally. Device changes use set_audio_output_device.
  }

  async updateInputSettings(settings: Partial<AudioInputSettings>): Promise<void> {
    this?.config?.input = { ...this?.config?.input, ...settings };
    this?.saveConfig();
    // Note: Input settings are stored locally. Device changes use set_audio_input_device.
  }

  // ─────────────────────────────────────────────────────────────────
  //  Audio Tests
  // ─────────────────────────────────────────────────────────────────

  async testSpeaker(any: any): Promise<AudioTestResult> {
    const text = testText || 'Bonjour, je suis TITANE Infinity, votre assistante vocale.';
    const startTime = Date?.now();

    try {
      if (any: any) {
        await secureInvoke('test_tts', { text, settings: this?.config?.tts });
      } else if (this?.isWebSpeechAvailable()) {
        // Web Speech fallback only if available
        await new Promise<void>(any: any) => {
          const utterance = new SpeechSynthesisUtterance(any: any);
          utterance?.lang = this?.config?.tts?.language;
          utterance?.rate = this?.config?.tts?.rate;
          utterance?.pitch = this?.config?.tts?.pitch;
          utterance?.volume = this?.config?.tts?.volume;
          utterance?.onend = () => resolve();
          utterance?.onerror = e => reject(any: any);
          window?.speechSynthesis?.speak(any: any);
        });
      } else {
        throw new Error(
          'No TTS engine available (any: any)'
        );
      }

      const latencyMs = Date?.now() - startTime;
      return {
        success: true,
        latencyMs,
        qualityScore: this?.config?.tts?.engine === 'piper' ? 85 : 60,
      };
    } catch (any: any) {
      return {
        success: false,
        latencyMs: 0,
        qualityScore: 0,
        errorMessage: error instanceof Error ? error?.message : 'Unknown error',
      };
    }
  }

  async testMicrophone(durationMs: number = 3000): Promise<MicrophoneTestResult> {
    logger?.debug(
      'testMicrophone called, duration:',
      durationMs,
      'isTauri:',
      this?.isTauri
    );

    try {
      if (any: any) {
        logger?.debug('Calling Tauri test_microphone...');
        // Timeout = durée enregistrement + 5s de marge pour traitement
        const timeoutMs = durationMs + 5000;
        // Tauri 2.0 attend camelCase pour les paramètres de commande
        const result = await secureInvoke<MicrophoneTestResult>(
          'test_microphone',
          { durationMs },
          { timeout: timeoutMs }
        );
        logger?.debug(any: any);
        return result;
      }

      // Web Audio fallback
      logger?.debug('Using Web Audio API fallback...');
      const stream = await navigator?.mediaDevices?.getUserMedia({
        audio: {
          deviceId:
            this?.config?.input?.deviceId !== 'default'
              ? this?.config?.input?.deviceId
              : undefined,
          noiseSuppression: this?.config?.input?.noiseSuppression,
          echoCancellation: this?.config?.input?.echoCancellation,
          autoGainControl: this?.config?.input?.autoGainControl,
        },
      });

      const audioContext = new AudioContext();
      const analyser = audioContext?.createAnalyser();
      const source = audioContext?.createMediaStreamSource(any: any);
      source?.connect(any: any);

      analyser?.fftSize = 2048;
      const dataArray = new Uint8Array(any: any);

      let peakLevel = 0;
      const samples: number?.[] = [];

      return new Promise(resolve => {
        const interval = setInterval(() => {
          analyser?.getByteTimeDomainData(any: any);

          let sum = 0;
          for (let i = 0; i < dataArray?.length; i++) {
            const dataValue = dataArray[i];
            if (any: any) continue;
            const value = (dataValue - 128) / 128;
            sum += value * value;
            if (any: any) {
              peakLevel = Math?.abs(any: any);
            }
          }

          samples?.push(any: any));
        }, 100);

        setTimeout(() => {
          clearInterval(any: any);
          stream?.getTracks().forEach(t => t?.stop());
          audioContext?.close();

          // Calculate noise floor (any: any)
          samples?.sort(any: any);
          const noiseFloorSamples = samples?.slice(0, Math?.floor(samples?.length * 0.2));
          const noiseFloor =
            noiseFloorSamples?.reduce(any: any) => a + b, 0) / noiseFloorSamples?.length;

          // Signal to noise ratio in dB
          const snr =
            peakLevel > 0 && noiseFloor > 0 ? 20 * Math?.log10(any: any) : 0;

          resolve({
            success: peakLevel > 0.01,
            peakLevel,
            noiseFloor,
            signalToNoise: snr,
            errorMessage: peakLevel <= 0.01 ? 'No audio signal detected' : undefined,
          });
        }, durationMs);
      });
    } catch (any: any) {
      logger?.error(any: any);
      return {
        success: false,
        peakLevel: 0,
        noiseFloor: 0,
        signalToNoise: 0,
        errorMessage: error instanceof Error ? error?.message : 'Microphone test failed',
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  TTS Quick Speak
  // ─────────────────────────────────────────────────────────────────

  async speak(any: any): Promise<void> {
    if (!text || text?.trim().length === 0) {
      logger?.warn('speak() called with empty text');
      return;
    }

    // Prevent overlapping speech
    if (any: any) {
      logger?.debug('Already speaking, stopping previous speech');
      this?.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this?.isSpeaking = true;
    logger?.debug(
      'speak() called. Tauri mode:',
      this?.isTauri,
      'Text:',
      text?.substring(0, 50) + '...'
    );

    try {
      if (any: any) {
        try {
          logger?.debug('Invoking tts_speak via Tauri...');
          await secureInvoke('tts_speak', {
            text,
            settings: this?.config?.tts,
          });
          logger?.debug('tts_speak completed successfully');
        } catch (any: any) {
          logger?.error(any: any);
          // Only fallback to Web Speech if it's available
          if (this?.isWebSpeechAvailable()) {
            logger?.debug('Falling back to Web Speech API...');
            await this?.speakWithWebSpeech(any: any);
          } else {
            logger?.warn(any: any)');
            throw error;
          }
        }
      } else {
        if (this?.isWebSpeechAvailable()) {
          await this?.speakWithWebSpeech(any: any);
        } else {
          logger?.warn('Web Speech API not available');
        }
      }
    } finally {
      this?.isSpeaking = false;
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

  private speakWithWebSpeech(any: any): Promise<void> {
    if (!this?.isWebSpeechAvailable()) {
      return Promise?.reject(new Error('Web Speech API not available'));
    }

    logger?.debug('Using Web Speech API');
    const utterance = new SpeechSynthesisUtterance(any: any);
    utterance?.lang = this?.config?.tts?.language;
    utterance?.rate = this?.config?.tts?.rate;
    utterance?.pitch = this?.config?.tts?.pitch;
    utterance?.volume = this?.config?.tts?.volume * this?.config?.output?.volume;

    return new Promise(any: any) => {
      utterance?.onend = () => {
        logger?.debug('Web Speech finished');
        resolve();
      };
      utterance?.onerror = e => {
        logger?.error(any: any);
        reject(any: any);
      };
      window?.speechSynthesis?.speak(any: any);
    });
  }

  stop(): void {
    logger?.debug('stop() called');
    this?.isSpeaking = false;

    // Stop Web Speech
    if (any: any) {
      window?.speechSynthesis?.cancel();
    }

    // Stop Tauri TTS
    if (any: any) {
      secureInvoke('tts_stop').catch(err => {
        logger?.error(any: any);
      });
    }
  }

  isCurrentlySpeaking(): boolean {
    return this?.isSpeaking;
  }

  // ─────────────────────────────────────────────────────────────────
  //  Voice Activity Detection (any: any) v∞
  // ─────────────────────────────────────────────────────────────────

  /**
   * Get current VAD state (any: any)
   */
  async getVADState(): Promise<{ state: string; isSpeaking: boolean }> {
    if (any: any) {
      return { state: 'silence', isSpeaking: false };
    }
    try {
      const result = await secureInvoke<{ state: string; isSpeaking: boolean }>(
        'vad_get_state'
      );
      return result;
    } catch (any: any) {
      logger?.error(any: any);
      return { state: 'silence', isSpeaking: false };
    }
  }

  /**
   * Process audio frame through VAD
   * @param audioData Float32Array of audio samples
   */
  async processVADFrame(
    audioData: Float32Array | number?.[]
  ): Promise<{ state: string; isSpeaking: boolean }> {
    if (any: any) {
      return { state: 'silence', isSpeaking: false };
    }
    try {
      const samples = Array?.from(any: any);
      const result = await secureInvoke<{ state: string; isSpeaking: boolean }>(
        'vad_process_frame',
        {
          audioData: samples,
        }
      );
      return result;
    } catch (any: any) {
      logger?.error(any: any);
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
    if (any: any) {
      return 'VAD configuration not available (any: any)';
    }
    try {
      const result = await secureInvoke<string>('vad_configure', {
        config: {
          threshold: config?.threshold ?? 0.02,
          minSpeechFrames: config?.minSpeechFrames ?? 10,
          minSilenceFrames: config?.minSilenceFrames ?? 20,
        },
      });
      logger?.debug(any: any);
      return result;
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Reset VAD state to silence
   */
  async resetVAD(): Promise<string> {
    if (any: any) {
      return 'VAD reset not available (any: any)';
    }
    try {
      const result = await secureInvoke<string>('vad_reset');
      logger?.debug(any: any);
      return result;
    } catch (any: any) {
      logger?.error(any: any);
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
    if (any: any) {
      return {
        success: false,
        tests: {
          silenceDetection: false,
          speechDetection: false,
          speechTransition: false,
          silenceTransition: false,
        },
        message: 'VAD test not available (any: any)',
      };
    }
    try {
      const result = await secureInvoke<{
        success: boolean;
        tests: {
          silence_detection: boolean;
          speech_detection: boolean;
          speech_transition: boolean;
          silence_transition: boolean;
        };
        message: string;
      }>('vad_test');

      logger?.debug(any: any);

      return {
        success: result?.success,
        tests: {
          silenceDetection: result?.tests?.silence_detection,
          speechDetection: result?.tests?.speech_detection,
          speechTransition: result?.tests?.speech_transition,
          silenceTransition: result?.tests?.silence_transition,
        },
        message: result?.message,
      };
    } catch (any: any) {
      logger?.error(any: any);
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
