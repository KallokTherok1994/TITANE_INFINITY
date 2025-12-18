/**
 * TITANE_INFINITY v∞.5 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.5 — BARGE-IN DETECTOR
 *   Détecte les interruptions vocales pendant le TTS
 *   Utilise spectrogram comparison + RMS amplitude + VAD
 * ═══════════════════════════════════════════════════════════════════
 */

import { antiEchoShield } from './antiEchoShield';

/**
 * Types d'événements d'interruption
 */
export type BargeInType =
  | 'USER_INTERRUPT' // Interruption forte (voix forte)
  | 'USER_SOFT_BARGE' // Interruption douce (voix basse) → ducking
  | 'USER_OVERLAP' // Utilisateur parle pendant début TTS
  | 'FALSE_POSITIVE'; // Bruit ambiant, pas une voix

/**
 * Événement d'interruption détecté
 */
export interface BargeInEvent {
  type: BargeInType;
  confidence: number; // 0-1
  amplitude: number; // RMS level
  timestamp: number;
  isSpeech: boolean; // VAD output
  spectralMatch: number; // 0-1 (similarity with TTS)
}

/**
 * Configuration du détecteur
 */
export interface BargeInConfig {
  /** Seuil RMS pour interruption forte (défaut: 0.15) */
  hardInterruptThreshold?: number;

  /** Seuil RMS pour interruption douce (défaut: 0.08) */
  softInterruptThreshold?: number;

  /** Seuil de similarité spectrale max (défaut: 0.7) - au-dessus = echo probable */
  echoThreshold?: number;

  /** Taille fenêtre sliding (ms, défaut: 200) */
  windowSizeMs?: number;

  /** Activer VAD WebRTC (défaut: true) */
  useVAD?: boolean;

  /** Seuil de confiance minimum pour déclencher (défaut: 0.6) */
  confidenceThreshold?: number;
}

/**
 * Résultat d'analyse audio
 */
interface AudioAnalysis {
  rmsAmplitude: number;
  spectralCentroid: number;
  zeroCrossingRate: number;
  spectralFlux: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   BARGE-IN DETECTOR
 * ═══════════════════════════════════════════════════════════════════
 */

export class BargeInDetector {
  private config: Required<BargeInConfig>;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private previousSpectrum: Float32Array | null = null;
  private ttsFingerprint: Float32Array | null = null;
  private listeners: Set<(event: BargeInEvent) => void> = new Set();

  constructor(config: BargeInConfig = {}) {
    this.config = {
      hardInterruptThreshold: config.hardInterruptThreshold ?? 0.15,
      softInterruptThreshold: config.softInterruptThreshold ?? 0.08,
      echoThreshold: config.echoThreshold ?? 0.7,
      windowSizeMs: config.windowSizeMs ?? 200,
      useVAD: config.useVAD ?? true,
      confidenceThreshold: config.confidenceThreshold ?? 0.6,
    };

    console.log('[BargeInDetector] 🎤 Initialized:', this.config);
  }

  /**
   * Initialise le contexte audio pour analyse
   */
  async initialize(mediaStream: MediaStream): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      const source = this.audioContext.createMediaStreamSource(mediaStream);
      source.connect(this.analyser);

      console.log('[BargeInDetector] ✅ Audio analysis ready');
    } catch (error) {
      console.error('[BargeInDetector] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Enregistre l'empreinte spectrale du TTS pour comparaison
   */
  registerTTSFingerprint(audioData: Float32Array): void {
    if (!this.audioContext) {
      console.warn('[BargeInDetector] AudioContext not initialized');
      return;
    }

    this.ttsFingerprint = this.extractSpectrum(audioData);
    console.log('[BargeInDetector] 📊 TTS fingerprint registered');
  }

  /**
   * Détecte une interruption à partir d'un chunk audio
   * @returns BargeInEvent si interruption détectée, null sinon
   */
  detectInterrupt(audioChunk: Float32Array): BargeInEvent | null {
    if (!this.analyser) {
      console.warn('[BargeInDetector] Analyser not initialized');
      return null;
    }

    // 1. Analyse audio
    const analysis = this.analyzeAudioChunk(audioChunk);

    // 2. Check si TTS actif (anti-echo shield)
    const isTTSSpeaking = antiEchoShield.shouldBlockListening();

    // 3. VAD simple (zero-crossing rate + RMS)
    const isSpeech = this.simpleVAD(analysis);

    // 4. Spectral comparison avec TTS fingerprint
    const spectrum = this.extractSpectrum(audioChunk);
    const spectralMatch = this.ttsFingerprint
      ? this.computeSpectralSimilarity(spectrum, this.ttsFingerprint)
      : 0;

    // 5. Détection interruption
    const isEcho = spectralMatch > this.config.echoThreshold;
    const amplitude = analysis.rmsAmplitude;

    // Filtrer les échos
    if (isEcho) {
      return {
        type: 'FALSE_POSITIVE',
        confidence: 1.0 - spectralMatch,
        amplitude,
        timestamp: Date.now(),
        isSpeech,
        spectralMatch,
      };
    }

    // Interruption forte
    if (amplitude > this.config.hardInterruptThreshold && isSpeech && isTTSSpeaking) {
      const event: BargeInEvent = {
        type: 'USER_INTERRUPT',
        confidence: Math.min(amplitude / this.config.hardInterruptThreshold, 1.0),
        amplitude,
        timestamp: Date.now(),
        isSpeech: true,
        spectralMatch,
      };

      this.emitEvent(event);
      return event;
    }

    // Interruption douce (ducking)
    if (
      amplitude > this.config.softInterruptThreshold &&
      amplitude <= this.config.hardInterruptThreshold &&
      isSpeech &&
      isTTSSpeaking
    ) {
      const event: BargeInEvent = {
        type: 'USER_SOFT_BARGE',
        confidence: amplitude / this.config.hardInterruptThreshold,
        amplitude,
        timestamp: Date.now(),
        isSpeech: true,
        spectralMatch,
      };

      this.emitEvent(event);
      return event;
    }

    // Overlap (début de phrase simultané)
    if (isSpeech && amplitude > this.config.softInterruptThreshold) {
      const event: BargeInEvent = {
        type: 'USER_OVERLAP',
        confidence: 0.7,
        amplitude,
        timestamp: Date.now(),
        isSpeech: true,
        spectralMatch,
      };

      return event;
    }

    return null;
  }

  /**
   * Détecte overlap entre voix utilisateur et TTS
   */
  detectOverlap(userInput: Float32Array, ttsSignal: Float32Array): boolean {
    const userSpectrum = this.extractSpectrum(userInput);
    const ttsSpectrum = this.extractSpectrum(ttsSignal);

    const similarity = this.computeSpectralSimilarity(userSpectrum, ttsSpectrum);

    // Si similarité basse → voix différentes → overlap
    return similarity < 0.5;
  }

  /**
   * Subscribe to barge-in events
   */
  onBargeIn(listener: (event: BargeInEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Émet un événement d'interruption
   */
  private emitEvent(event: BargeInEvent): void {
    if (event.confidence < this.config.confidenceThreshold) {
      return;
    }

    console.log(
      `[BargeInDetector] 🚨 ${event.type} detected (confidence: ${event.confidence.toFixed(2)})`
    );

    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[BargeInDetector] Listener error:', error);
      }
    });
  }

  /**
   * Analyse un chunk audio
   */
  private analyzeAudioChunk(audioChunk: Float32Array): AudioAnalysis {
    // RMS amplitude
    let sum = 0;
    for (let i = 0; i < audioChunk.length; i++) {
      const sample = audioChunk[i];
      if (sample === undefined) continue;
      sum += sample * sample;
    }
    const rmsAmplitude = Math.sqrt(sum / audioChunk.length);

    // Zero-crossing rate
    let zeroCrossings = 0;
    for (let i = 1; i < audioChunk.length; i++) {
      const current = audioChunk[i];
      const previous = audioChunk[i - 1];
      if (current === undefined || previous === undefined) continue;

      if ((current >= 0 && previous < 0) || (current < 0 && previous >= 0)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / audioChunk.length;

    // Spectral centroid & flux (simplifié)
    const spectrum = this.extractSpectrum(audioChunk);
    let weightedSum = 0;
    let spectrumSum = 0;

    for (let i = 0; i < spectrum.length; i++) {
      const value = spectrum[i];
      if (value === undefined) continue;
      weightedSum += i * value;
      spectrumSum += value;
    }

    const spectralCentroid = spectrumSum > 0 ? weightedSum / spectrumSum : 0;

    // Spectral flux
    let spectralFlux = 0;
    if (this.previousSpectrum) {
      for (let i = 0; i < spectrum.length && i < this.previousSpectrum.length; i++) {
        const current = spectrum[i];
        const previous = this.previousSpectrum[i];
        if (current === undefined || previous === undefined) continue;
        const diff = current - previous;
        spectralFlux += diff * diff;
      }
      spectralFlux = Math.sqrt(spectralFlux);
    }
    this.previousSpectrum = spectrum;

    return {
      rmsAmplitude,
      spectralCentroid,
      zeroCrossingRate,
      spectralFlux,
    };
  }

  /**
   * Extrait le spectre fréquentiel d'un signal
   */
  private extractSpectrum(_audioData: Float32Array): Float32Array {
    if (!this.analyser) {
      return new Float32Array(0);
    }

    const spectrum = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatFrequencyData(spectrum);
    return spectrum;
  }

  /**
   * Calcule la similarité spectrale entre deux signaux (0-1)
   */
  private computeSpectralSimilarity(
    spectrum1: Float32Array,
    spectrum2: Float32Array
  ): number {
    const minLength = Math.min(spectrum1.length, spectrum2.length);
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < minLength; i++) {
      const val1 = spectrum1[i];
      const val2 = spectrum2[i];
      if (val1 === undefined || val2 === undefined) continue;

      dotProduct += val1 * val2;
      mag1 += val1 * val1;
      mag2 += val2 * val2;
    }

    const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * VAD simple basé sur RMS + zero-crossing
   */
  private simpleVAD(analysis: AudioAnalysis): boolean {
    const speechThreshold = 0.02; // RMS minimum pour la parole
    const zcrThreshold = 0.05; // ZCR minimum pour la parole

    return (
      analysis.rmsAmplitude > speechThreshold && analysis.zeroCrossingRate > zcrThreshold
    );
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.listeners.clear();
    console.log('[BargeInDetector] 🔌 Destroyed');
  }
}

/**
 * Singleton instance
 */
export const bargeInDetector = new BargeInDetector();
