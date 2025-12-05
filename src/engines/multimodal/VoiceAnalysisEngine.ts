/**
 * TITANE∞ vΩ∞ — VOICE ANALYSIS ENGINE
 * OPUS v∞.3: Analyse des features vocales
 *
 * Extrait les caractéristiques acoustiques de la voix :
 * - Intensité, énergie
 * - Stabilité du ton, variation de pitch
 * - Rythme, vitesse d'élocution
 * - Pauses, respiration
 * - Tremblements
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES:
 * - Signaux purement acoustiques, non sémantiques
 * - Aucun stockage audio brut
 * - Indices uniquement, pas de diagnostic
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  VoiceFeatures,
  VoiceScores,
  VoiceState,
  NormalizedScore,
  ModalityLevel,
  BaselineVoiceProfile,
} from '@/types/multimodalFusion';

import {
  getDefaultBaselineVoiceProfile,
  MULTIMODAL_FUSION_CONFIG,
} from '@/types/multimodalFusion';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const VOICE_ANALYSIS_CONFIG = {
  // Fenêtre d'analyse
  analysisWindowMs: 2000,
  minSamplesForAnalysis: 10,

  // FFT
  fftSize: 2048,
  smoothingTimeConstant: 0.8,

  // Pitch detection
  minPitch: 80,   // Hz
  maxPitch: 400,  // Hz

  // Seuils
  silenceThreshold: 0.01,
  speechThreshold: 0.1,

  // Normalisation
  maxIntensity: 1.0,
  energySmoothing: 0.3,
} as const;

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface AudioAnalysisFrame {
  timestamp: number;
  rms: number;              // Root Mean Square (volume)
  zeroCrossingRate: number; // Taux de passage par zéro
  spectralCentroid: number; // Centre de masse spectral
  pitchEstimate: number;    // Estimation de la fréquence fondamentale
  isSpeech: boolean;        // Est-ce de la parole ?
}

interface VoiceSegment {
  startTime: number;
  endTime: number;
  frames: AudioAnalysisFrame[];
  avgRms: number;
  avgPitch: number;
  pitchVariance: number;
}

type VoiceStateUpdater = (state: VoiceState) => void;
type BaselineUpdater = (baseline: BaselineVoiceProfile) => void;

// ============================================================================
// VOICE ANALYSIS ENGINE CLASS
// ============================================================================

/**
 * VoiceAnalysisEngine v∞.3
 *
 * Analyse les caractéristiques acoustiques de la voix en temps réel
 * pour extraire des indices d'énergie, tension, stabilité.
 *
 * ⚠️ Signaux acoustiques uniquement, pas d'interprétation sémantique.
 */
export class VoiceAnalysisEngine {
  private static instance: VoiceAnalysisEngine | null = null;

  // Audio context
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  // État
  private isAnalyzing = false;
  private currentState: VoiceState | null = null;
  private baseline: BaselineVoiceProfile;

  // Buffers
  private frameBuffer: AudioAnalysisFrame[] = [];
  private recentFeatures: VoiceFeatures[] = [];
  private readonly maxBufferSize = 100;
  private readonly maxFeaturesHistory = 30;

  // Callbacks
  private stateUpdater: VoiceStateUpdater | null = null;
  private baselineUpdater: BaselineUpdater | null = null;

  // Timers
  private analysisInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.baseline = getDefaultBaselineVoiceProfile();
  }

  /**
   * Singleton pattern
   */
  static getInstance(): VoiceAnalysisEngine {
    if (!VoiceAnalysisEngine.instance) {
      VoiceAnalysisEngine.instance = new VoiceAnalysisEngine();
    }
    return VoiceAnalysisEngine.instance;
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  setStateUpdater(updater: VoiceStateUpdater): void {
    this.stateUpdater = updater;
  }

  setBaselineUpdater(updater: BaselineUpdater): void {
    this.baselineUpdater = updater;
  }

  setBaseline(baseline: BaselineVoiceProfile): void {
    this.baseline = baseline;
  }

  getBaseline(): BaselineVoiceProfile {
    return this.baseline;
  }

  // ============================================================================
  // INITIALISATION AUDIO
  // ============================================================================

  /**
   * Initialise l'analyse audio avec le microphone
   */
  async initialize(): Promise<boolean> {
    try {
      // Demander l'accès au microphone
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Créer le contexte audio
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = VOICE_ANALYSIS_CONFIG.fftSize;
      this.analyser.smoothingTimeConstant = VOICE_ANALYSIS_CONFIG.smoothingTimeConstant;

      // Connecter le flux audio
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.analyser);

      console.log('[VoiceAnalysisEngine] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[VoiceAnalysisEngine] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Libère les ressources audio
   */
  dispose(): void {
    this.stopAnalysis();

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    console.log('[VoiceAnalysisEngine] Disposed');
  }

  // ============================================================================
  // ANALYSE EN TEMPS RÉEL
  // ============================================================================

  /**
   * Démarre l'analyse vocale en temps réel
   */
  startAnalysis(): void {
    if (this.isAnalyzing || !this.analyser) {
      return;
    }

    this.isAnalyzing = true;
    this.frameBuffer = [];

    // Analyse périodique
    this.analysisInterval = setInterval(() => {
      this.analyzeFrame();
    }, 50); // ~20 FPS

    console.log('[VoiceAnalysisEngine] Analysis started');
  }

  /**
   * Arrête l'analyse
   */
  stopAnalysis(): void {
    this.isAnalyzing = false;

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    console.log('[VoiceAnalysisEngine] Analysis stopped');
  }

  /**
   * Analyse une frame audio
   */
  private analyzeFrame(): void {
    if (!this.analyser || !this.isAnalyzing) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const timeData = new Float32Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    this.analyser.getFloatTimeDomainData(timeData);
    this.analyser.getByteFrequencyData(freqData);

    // Calculer les métriques de base
    const rms = this.computeRMS(timeData);
    const zcr = this.computeZeroCrossingRate(timeData);
    const spectralCentroid = this.computeSpectralCentroid(freqData);
    const pitchEstimate = this.estimatePitch(timeData);

    const isSpeech = rms > VOICE_ANALYSIS_CONFIG.speechThreshold;

    const frame: AudioAnalysisFrame = {
      timestamp: Date.now(),
      rms,
      zeroCrossingRate: zcr,
      spectralCentroid,
      pitchEstimate,
      isSpeech,
    };

    // Ajouter au buffer
    this.frameBuffer.push(frame);
    if (this.frameBuffer.length > this.maxBufferSize) {
      this.frameBuffer.shift();
    }

    // Calculer les features si assez de données
    if (this.frameBuffer.length >= VOICE_ANALYSIS_CONFIG.minSamplesForAnalysis) {
      this.computeAndUpdateFeatures();
    }
  }

  // ============================================================================
  // CALCULS AUDIO DE BASE
  // ============================================================================

  /**
   * Calcule le RMS (Root Mean Square) - indicateur de volume
   */
  private computeRMS(timeData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += timeData[i] * timeData[i];
    }
    return Math.sqrt(sum / timeData.length);
  }

  /**
   * Calcule le taux de passage par zéro - indicateur de bruit/parole
   */
  private computeZeroCrossingRate(timeData: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < timeData.length; i++) {
      if ((timeData[i] >= 0 && timeData[i - 1] < 0) ||
          (timeData[i] < 0 && timeData[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / timeData.length;
  }

  /**
   * Calcule le centroïde spectral - indicateur de "brillance"
   */
  private computeSpectralCentroid(freqData: Uint8Array): number {
    let weightedSum = 0;
    let totalMagnitude = 0;

    for (let i = 0; i < freqData.length; i++) {
      weightedSum += i * freqData[i];
      totalMagnitude += freqData[i];
    }

    return totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;
  }

  /**
   * Estime la fréquence fondamentale (pitch) via autocorrélation
   */
  private estimatePitch(timeData: Float32Array): number {
    if (!this.audioContext) return 0;

    const sampleRate = this.audioContext.sampleRate;
    const minLag = Math.floor(sampleRate / VOICE_ANALYSIS_CONFIG.maxPitch);
    const maxLag = Math.floor(sampleRate / VOICE_ANALYSIS_CONFIG.minPitch);

    let bestCorrelation = 0;
    let bestLag = 0;

    for (let lag = minLag; lag < maxLag && lag < timeData.length; lag++) {
      let correlation = 0;
      for (let i = 0; i < timeData.length - lag; i++) {
        correlation += timeData[i] * timeData[i + lag];
      }

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    return bestLag > 0 ? sampleRate / bestLag : 0;
  }

  // ============================================================================
  // EXTRACTION DE FEATURES
  // ============================================================================

  /**
   * Calcule les features vocales à partir du buffer
   */
  private computeAndUpdateFeatures(): void {
    const speechFrames = this.frameBuffer.filter(f => f.isSpeech);

    if (speechFrames.length < 5) {
      return; // Pas assez de parole détectée
    }

    const features = this.extractFeatures(speechFrames);
    const scores = this.computeScores(features);
    const state = this.createVoiceState(features, scores);

    // Mettre à jour l'historique
    this.recentFeatures.push(features);
    if (this.recentFeatures.length > this.maxFeaturesHistory) {
      this.recentFeatures.shift();
    }

    this.currentState = state;
    this.notifyStateUpdate();
  }

  /**
   * Extrait les features vocales
   */
  private extractFeatures(frames: AudioAnalysisFrame[]): VoiceFeatures {
    const rmsValues = frames.map(f => f.rms);
    const pitchValues = frames.map(f => f.pitchEstimate).filter(p => p > 0);
    const _zcrValues = frames.map(f => f.zeroCrossingRate);

    // Intensité et énergie
    const avgRms = this.average(rmsValues);
    const intensity = Math.min(1, avgRms / VOICE_ANALYSIS_CONFIG.maxIntensity);
    const energy = this.computeEnergyFromRMS(rmsValues);

    // Stabilité du ton
    const _pitchMean = pitchValues.length > 0 ? this.average(pitchValues) : 0;
    const pitchStd = pitchValues.length > 0 ? this.stdDev(pitchValues) : 0;
    const toneStability = pitchValues.length > 0 ? Math.max(0, 1 - pitchStd / 50) : 0.5;
    const pitchVariation = Math.min(1, pitchStd / 30);

    // Tremblements (variation haute fréquence du RMS)
    const tremor = this.computeTremor(rmsValues);

    // Rythme et vitesse
    const speechRate = this.estimateSpeechRate(frames);
    const rhythm = this.computeRhythmRegularity(frames);
    const pauseFrequency = this.computePauseFrequency(frames);

    // Respiration
    const breathingLoad = this.estimateBreathingLoad(frames);
    const breathPauses = this.computeBreathPauses(frames);

    return {
      intensity,
      energy,
      toneStability,
      pitchVariation,
      tremor,
      speechRate,
      rhythm,
      pauseFrequency,
      breathingLoad,
      breathPauses,
      confidence: Math.min(1, frames.length / 50),
      durationMs: frames.length * 50,
      sampleCount: frames.length,
    };
  }

  /**
   * Calcule l'énergie à partir des valeurs RMS
   */
  private computeEnergyFromRMS(rmsValues: number[]): number {
    const avgRms = this.average(rmsValues);
    const peakRms = Math.max(...rmsValues);
    return Math.min(1, (avgRms * 0.7 + peakRms * 0.3) * 3);
  }

  /**
   * Calcule le tremor (micro-variations)
   */
  private computeTremor(rmsValues: number[]): number {
    if (rmsValues.length < 5) return 0;

    const diffs: number[] = [];
    for (let i = 1; i < rmsValues.length; i++) {
      diffs.push(Math.abs(rmsValues[i] - rmsValues[i - 1]));
    }

    return Math.min(1, this.average(diffs) * 20);
  }

  /**
   * Estime la vitesse de parole
   */
  private estimateSpeechRate(frames: AudioAnalysisFrame[]): number {
    // Approximation basée sur les variations de ZCR
    const speechSegments = this.findSpeechSegments(frames);
    if (speechSegments.length === 0) return 0.5;

    const avgSegmentDuration = this.average(
      speechSegments.map(s => s.endTime - s.startTime)
    );

    // Normaliser : ~300ms par segment = parole normale
    return Math.min(1, 300 / (avgSegmentDuration || 300));
  }

  /**
   * Calcule la régularité du rythme
   */
  private computeRhythmRegularity(frames: AudioAnalysisFrame[]): number {
    const speechSegments = this.findSpeechSegments(frames);
    if (speechSegments.length < 2) return 0.5;

    const durations = speechSegments.map(s => s.endTime - s.startTime);
    const std = this.stdDev(durations);
    const mean = this.average(durations);

    // CV (coefficient de variation) faible = rythme régulier
    const cv = mean > 0 ? std / mean : 0;
    return Math.max(0, 1 - cv);
  }

  /**
   * Calcule la fréquence des pauses
   */
  private computePauseFrequency(frames: AudioAnalysisFrame[]): number {
    let pauses = 0;
    let inPause = false;

    for (const frame of frames) {
      if (!frame.isSpeech && !inPause) {
        pauses++;
        inPause = true;
      } else if (frame.isSpeech) {
        inPause = false;
      }
    }

    return Math.min(1, pauses / (frames.length / 20)); // Normaliser
  }

  /**
   * Estime la charge respiratoire
   */
  private estimateBreathingLoad(frames: AudioAnalysisFrame[]): number {
    // Basé sur les pauses longues et les variations d'intensité
    const pauseFreq = this.computePauseFrequency(frames);
    const intensityVar = this.stdDev(frames.map(f => f.rms));
    return Math.min(1, pauseFreq * 0.5 + intensityVar * 5);
  }

  /**
   * Calcule les pauses respiratoires
   */
  private computeBreathPauses(frames: AudioAnalysisFrame[]): number {
    const segments = this.findSpeechSegments(frames);
    if (segments.length < 2) return 0;

    let breathPauses = 0;
    for (let i = 1; i < segments.length; i++) {
      const gap = segments[i].startTime - segments[i - 1].endTime;
      if (gap > 500 && gap < 2000) { // Pause typique de respiration
        breathPauses++;
      }
    }

    return Math.min(1, breathPauses / segments.length);
  }

  /**
   * Trouve les segments de parole
   */
  private findSpeechSegments(frames: AudioAnalysisFrame[]): VoiceSegment[] {
    const segments: VoiceSegment[] = [];
    let currentSegment: AudioAnalysisFrame[] = [];
    let segmentStart = 0;

    for (let i = 0; i < frames.length; i++) {
      if (frames[i].isSpeech) {
        if (currentSegment.length === 0) {
          segmentStart = frames[i].timestamp;
        }
        currentSegment.push(frames[i]);
      } else if (currentSegment.length > 0) {
        segments.push({
          startTime: segmentStart,
          endTime: frames[i - 1].timestamp,
          frames: currentSegment,
          avgRms: this.average(currentSegment.map(f => f.rms)),
          avgPitch: this.average(currentSegment.map(f => f.pitchEstimate)),
          pitchVariance: this.variance(currentSegment.map(f => f.pitchEstimate)),
        });
        currentSegment = [];
      }
    }

    return segments;
  }

  // ============================================================================
  // SCORES ET ÉTAT
  // ============================================================================

  /**
   * Calcule les scores normalisés
   */
  private computeScores(features: VoiceFeatures): VoiceScores {
    const timestamp = Date.now();

    // Énergie vocale
    const a_energy: NormalizedScore = {
      value: features.energy,
      confidence: features.confidence,
      variance: this.computeRecentVariance('energy'),
      origin: 'voice',
      timestamp,
    };

    // Tension (basée sur tremor + pitch variation)
    const tensionValue = features.tremor * 0.4 + features.pitchVariation * 0.3 +
                         (1 - features.toneStability) * 0.3;
    const a_tension: NormalizedScore = {
      value: Math.min(1, tensionValue),
      confidence: features.confidence,
      variance: this.computeRecentVariance('tension'),
      origin: 'voice',
      timestamp,
    };

    // Stabilité
    const stabilityValue = features.toneStability * 0.5 + features.rhythm * 0.3 +
                           (1 - features.tremor) * 0.2;
    const a_stability: NormalizedScore = {
      value: stabilityValue,
      confidence: features.confidence,
      variance: this.computeRecentVariance('stability'),
      origin: 'voice',
      timestamp,
    };

    // Charge respiratoire
    const a_breathing_load: NormalizedScore = {
      value: features.breathingLoad,
      confidence: features.confidence,
      variance: 0.1,
      origin: 'voice',
      timestamp,
    };

    return { a_energy, a_tension, a_stability, a_breathing_load };
  }

  /**
   * Calcule la variance récente pour un score
   */
  private computeRecentVariance(scoreType: string): number {
    if (this.recentFeatures.length < 3) return 0.1;

    let values: number[];
    switch (scoreType) {
      case 'energy':
        values = this.recentFeatures.map(f => f.energy);
        break;
      case 'tension':
        values = this.recentFeatures.map(f => f.tremor);
        break;
      case 'stability':
        values = this.recentFeatures.map(f => f.toneStability);
        break;
      default:
        return 0.1;
    }

    return this.variance(values);
  }

  /**
   * Crée l'état vocal complet
   */
  private createVoiceState(features: VoiceFeatures, scores: VoiceScores): VoiceState {
    const { lowThreshold, highThreshold } = MULTIMODAL_FUSION_CONFIG.thresholds;

    const scoreToLevel = (score: number): ModalityLevel => {
      if (score < lowThreshold) return 'low';
      if (score > highThreshold) return 'high';
      return 'medium';
    };

    return {
      features,
      scores,
      energyLevel: scoreToLevel(scores.a_energy.value),
      tensionLevel: scoreToLevel(scores.a_tension.value),
      stabilityLevel: scoreToLevel(scores.a_stability.value),
      confidence: features.confidence,
      timestamp: Date.now(),
    };
  }

  // ============================================================================
  // ANALYSE PONCTUELLE (POUR UN SEGMENT AUDIO)
  // ============================================================================

  /**
   * Analyse un buffer audio unique (pour enregistrement/snapshot)
   */
  analyzeAudioBuffer(audioBuffer: AudioBuffer): VoiceFeatures {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Découper en frames
    const frameSize = Math.floor(sampleRate * 0.05); // 50ms frames
    const frames: AudioAnalysisFrame[] = [];

    for (let i = 0; i < channelData.length - frameSize; i += frameSize) {
      const frameData = channelData.slice(i, i + frameSize);
      const floatArray = new Float32Array(frameData);

      const rms = this.computeRMS(floatArray);
      const zcr = this.computeZeroCrossingRate(floatArray);

      frames.push({
        timestamp: (i / sampleRate) * 1000,
        rms,
        zeroCrossingRate: zcr,
        spectralCentroid: 0, // Simplifié
        pitchEstimate: this.estimatePitchFromArray(floatArray, sampleRate),
        isSpeech: rms > VOICE_ANALYSIS_CONFIG.speechThreshold,
      });
    }

    return this.extractFeatures(frames.filter(f => f.isSpeech));
  }

  /**
   * Estime le pitch à partir d'un tableau
   */
  private estimatePitchFromArray(data: Float32Array, sampleRate: number): number {
    const minLag = Math.floor(sampleRate / VOICE_ANALYSIS_CONFIG.maxPitch);
    const maxLag = Math.floor(sampleRate / VOICE_ANALYSIS_CONFIG.minPitch);

    let bestCorrelation = 0;
    let bestLag = 0;

    for (let lag = minLag; lag < maxLag && lag < data.length; lag++) {
      let correlation = 0;
      for (let i = 0; i < data.length - lag; i++) {
        correlation += data[i] * data[i + lag];
      }

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    return bestLag > 0 ? sampleRate / bestLag : 0;
  }

  // ============================================================================
  // UTILITAIRES STATISTIQUES
  // ============================================================================

  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private variance(arr: number[]): number {
    if (arr.length < 2) return 0;
    const mean = this.average(arr);
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  }

  private stdDev(arr: number[]): number {
    return Math.sqrt(this.variance(arr));
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  private notifyStateUpdate(): void {
    if (this.stateUpdater && this.currentState) {
      this.stateUpdater(this.currentState);
    }
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  getCurrentState(): VoiceState | null {
    return this.currentState;
  }

  isActive(): boolean {
    return this.isAnalyzing;
  }

  getRecentFeatures(): VoiceFeatures[] {
    return [...this.recentFeatures];
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const voiceAnalysisEngine = VoiceAnalysisEngine.getInstance();

export function getVoiceAnalysisEngine(): VoiceAnalysisEngine {
  return VoiceAnalysisEngine.getInstance();
}
