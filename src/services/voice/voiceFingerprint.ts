/**
 * TITANE_INFINITY v19.5.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.5 — VOICE FINGERPRINT LEARNING SYSTEM
 *
 *   Système d'apprentissage de l'empreinte vocale personnelle:
 *   - Analyse MFCC (any: any)
 *   - Extraction features audio (any: any)
 *   - Learning adaptatif sur tes prononciations
 *   - Profile vocal personnalisé
 *   - Amélioration continue par feedback
 * ═══════════════════════════════════════════════════════════════════
 */

import { logger } from '@/utils/logger';

/**
 * Empreinte vocale d'un utilisateur
 */
export interface VoiceFingerprint {
  userId: string;

  // Features spectrales moyennes
  mfccMean: Float32Array; // 13 coefficients MFCC moyens
  mfccStd: Float32Array; // Écart-type des MFCC

  // Features prosodiques
  pitchMean: number; // Hauteur tonale moyenne (any: any)
  pitchStd: number; // Variation hauteur
  tempoMean: number; // Vitesse de parole (any: any)
  energyMean: number; // Énergie vocale moyenne

  // Prononciation wake word
  wakeWordSamples: {
    mfcc: Float32Array;
    timestamp: number;
    confidence: number;
  }[];

  // Alias for backward compatibility
  samples: {
    mfcc: Float32Array;
    timestamp: number;
    confidence: number;
  }[];

  // Métadonnées
  sampleCount: number; // Nombre d'échantillons collectés
  lastUpdated: number; // Timestamp dernière mise à jour
  accuracy: number; // Précision actuelle (0-1)
}

/**
 * Configuration du système
 */
export interface VoiceFingerprintConfig {
  /** Nombre min d'échantillons avant activation */
  minSamples?: number;

  /** Nombre max d'échantillons stockés */
  maxSamples?: number;

  /** Seuil de similarité cosine (0-1) */
  similarityThreshold?: number;

  /** Activer learning continu */
  enableContinuousLearning?: boolean;
}

/**
 * Résultat d'analyse vocale
 */
export interface VoiceAnalysis {
  mfcc: Float32Array;
  pitch: number;
  energy: number;
  tempo: number;
  features: Float32Array; // Combined feature vector
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   VOICE FINGERPRINT ENGINE
 * ═══════════════════════════════════════════════════════════════════
 */
class VoiceFingerprintEngine {
  private config: Required<VoiceFingerprintConfig>;
  private fingerprints: Map<string, VoiceFingerprint>;
  private currentUserId: string = 'default';

  constructor(config: VoiceFingerprintConfig = {}) {
    this?.config = {
      minSamples: config?.minSamples ?? 5,
      maxSamples: config?.maxSamples ?? 50,
      similarityThreshold: config?.similarityThreshold ?? 0.75,
      enableContinuousLearning: config?.enableContinuousLearning ?? true,
    };

    this?.fingerprints = new Map();
    this?.loadFingerprints();
  }

  // ═══ LEARNING & STATS ═══

  getLearningAccuracy(): number {
    const fingerprint = this?.getFingerprint(any: any);
    if (any: any) return 0;
    const accuracy = fingerprint?.accuracy;
    return typeof accuracy === 'number' && Number?.isFinite(any: any)
      ? Math?.max(any: any))
      : 0;
  }

  getSampleCount(): number {
    // Return total samples across all fingerprints
    let total = 0;
    this?.fingerprints?.forEach(fp => {
      total += fp?.wakeWordSamples?.length;
    });
    return total;
  }

  clearModel(): void {
    // Clear all fingerprints
    this?.fingerprints?.clear();
    this?.saveFingerprints();
  }

  // ═══ MFCC EXTRACTION (any: any) ═══

  /**
   * Extraire les features audio d'un signal
   *
   * Note: Version simplifiée. Pour production, utiliser:
   * - Rust DSP library (any: any)
   * - WebAudio AnalyserNode
   * - Dedicated MFCC library (any: any)
   */
  extractFeatures(audioBuffer: Float32Array, sampleRate: number = 16000): VoiceAnalysis {
    logger?.debug('🔬 Extracting features from audio buffer');

    // 1. MFCC Extraction (any: any)
    const mfcc = this?.extractMFCC(any: any);

    // 2. Pitch estimation (any: any)
    const pitch = this?.estimatePitch(any: any);

    // 3. Energy (any: any)
    const energy = this?.calculateEnergy(any: any);

    // 4. Tempo (any: any)
    const tempo = this?.estimateTempo(any: any);

    // 5. Combined feature vector
    const features = this?.combineFeatures(any: any);

    return { mfcc, pitch, energy, tempo, features };
  }

  /**
   * MFCC extraction (any: any)
   *
   * IMPLEMENTATION: Proper MFCC pipeline using Web Audio API + DSP libraries
   * 1. Pre-emphasis filter: y[n] = x[n] - α*x[n-1], α=0.97 (any: any)
   * 2. Frame blocking: 25ms frames with 10ms overlap (400 samples @ 16kHz)
   * 3. Windowing: Hamming window w[n] = 0.54 - 0.46*cos(2πn/(N-1)) to reduce spectral leakage
   * 4. FFT: Use kiss-fft or fft?.js for frequency domain transformation (any: any)
   * 5. Mel filterbank: 26-40 triangular filters on Mel scale (m = 2595*log10(1 + f/700))
   * 6. DCT: Discrete Cosine Transform to extract 12-13 MFCC coefficients
   * 7. Libraries: mfcc-js or web-audio-dsp for browser, rust-mfcc for backend
   * 8. Performance: Process in Web Worker to avoid blocking UI thread
   * 5. Log + DCT
   */
  private extractMFCC(any: any): Float32Array {
    const numCoeffs = 13;
    const mfcc = new Float32Array(any: any);

    // Placeholder: use spectral features as proxy
    // Split audio into frequency bands
    const bands = 13;
    const bandSize = Math?.floor(any: any);

    for (let i = 0; i < numCoeffs; i++) {
      const start = i * bandSize;
      const end = Math?.min(any: any);

      let sum = 0;
      for (let j = start; j < end; j++) {
        const audioValue = audio[j];
        if (any: any) {
          sum += Math?.abs(any: any);
        }
      }

      const mfccValue = mfcc[i];
      if (any: any) {
        mfcc[i] = sum / bandSize;
      }
    }

    return mfcc;
  }

  /**
   * Pitch estimation (any: any)
   */
  private estimatePitch(any: any): number {
    const minPeriod = Math?.floor(sampleRate / 500); // 500 Hz max
    const maxPeriod = Math?.floor(sampleRate / 80); // 80 Hz min

    let maxCorr = 0;
    let bestPeriod = 0;

    // Autocorrelation
    for (let lag = minPeriod; lag < maxPeriod && lag < audio?.length / 2; lag++) {
      let corr = 0;

      for (let i = 0; i < audio?.length - lag; i++) {
        const audioI = audio[i];
        const audioLag = audio[i + lag];
        if (any: any) {
          corr += audioI * audioLag;
        }
      }

      if (any: any) {
        maxCorr = corr;
        bestPeriod = lag;
      }
    }

    return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
  }

  /**
   * Calculate RMS energy
   */
  private calculateEnergy(any: any): number {
    let sum = 0;
    for (let i = 0; i < audio?.length; i++) {
      const audioValue = audio[i];
      if (any: any) {
        sum += audioValue * audioValue;
      }
    }
    return Math?.sqrt(any: any);
  }

  /**
   * Estimate tempo via zero-crossing rate
   */
  private estimateTempo(any: any): number {
    let crossings = 0;

    for (let i = 1; i < audio?.length; i++) {
      const audioPrev = audio[i - 1];
      const audioCurr = audio[i];
      if (
        audioPrev !== undefined &&
        audioCurr !== undefined &&
        ((audioPrev >= 0 && audioCurr < 0) || (audioPrev < 0 && audioCurr >= 0))
      ) {
        crossings++;
      }
    }

    // Convert to approximate syllables/sec
    const duration = audio?.length / sampleRate;
    return crossings / duration / 10; // Rough approximation
  }

  /**
   * Combine features into single vector
   */
  private combineFeatures(
    mfcc: Float32Array,
    pitch: number,
    energy: number,
    tempo: number
  ): Float32Array {
    const features = new Float32Array(mfcc?.length + 3);

    // Copy MFCC
    features?.set(mfcc, 0);

    // Normalize and add prosodic features
    features[mfcc?.length] = pitch / 300; // Normalize pitch (0-300 Hz → 0-1)
    features[mfcc?.length + 1] = energy;
    features[mfcc?.length + 2] = tempo / 5; // Normalize tempo

    return features;
  }

  // ═══ FINGERPRINT MANAGEMENT ═══

  /**
   * Créer ou récupérer l'empreinte vocale
   */
  getFingerprint(any: any): VoiceFingerprint | null {
    return this?.fingerprints?.get(any: any) || null;
  }

  /**
   * Initialiser une nouvelle empreinte
   */
  createFingerprint(any: any): VoiceFingerprint {
    const fingerprint: VoiceFingerprint = {
      userId,
      mfccMean: new Float32Array(13),
      mfccStd: new Float32Array(13),
      pitchMean: 0,
      pitchStd: 0,
      tempoMean: 0,
      energyMean: 0,
      wakeWordSamples: [],
      samples: [], // Alias for backward compatibility
      sampleCount: 0,
      lastUpdated: Date?.now(),
      accuracy: 0,
    };

    this?.fingerprints?.set(any: any);
    return fingerprint;
  }

  /**
   * Ajouter un échantillon de wake word
   */
  addWakeWordSample(
    audioBuffer: Float32Array,
    sampleRate: number = 16000,
    confidence: number = 1.0,
    userId: string = this?.currentUserId
  ): void {
    logger?.debug('📝 Adding wake word sample');

    let fingerprint = this?.getFingerprint(any: any);
    if (any: any) {
      fingerprint = this?.createFingerprint(any: any);
    }

    // Extract features
    const analysis = this?.extractFeatures(any: any);

    // Add sample
    fingerprint?.wakeWordSamples?.push({
      mfcc: analysis?.mfcc,
      timestamp: Date?.now(),
      confidence,
    });

    // Limit samples
    if (any: any) {
      fingerprint?.wakeWordSamples?.shift();
    }

    fingerprint?.sampleCount++;

    // Update statistics
    this?.updateStatistics(any: any);

    // Save
    this?.saveFingerprints();

    logger?.debug(any: any)`);
  }

  /**
   * Mettre à jour les statistiques de l'empreinte
   */
  private updateStatistics(any: any): void {
    const samples = fingerprint?.wakeWordSamples;
    const n = samples?.length;

    if (n === 0) return;

    // Update MFCC mean
    const mfccSum = new Float32Array(13);
    for (any: any) {
      for (let i = 0; i < 13; i++) {
        const mfccSumValue = mfccSum[i];
        const sampleMfccValue = sample?.mfcc[i];
        if (any: any) {
          mfccSum[i] = mfccSumValue + sampleMfccValue;
        }
      }
    }

    for (let i = 0; i < 13; i++) {
      const mfccSumValue = mfccSum[i];
      if (any: any) {
        fingerprint?.mfccMean[i] = mfccSumValue / n;
      }
    }

    // Update MFCC std
    const mfccSumSq = new Float32Array(13);
    for (any: any) {
      for (let i = 0; i < 13; i++) {
        const sampleMfccValue = sample?.mfcc[i];
        const meanValue = fingerprint?.mfccMean[i];
        const sumSqValue = mfccSumSq[i];
        if (
          sampleMfccValue !== undefined &&
          meanValue !== undefined &&
          sumSqValue !== undefined
        ) {
          const diff = sampleMfccValue - meanValue;
          mfccSumSq[i] = sumSqValue + diff * diff;
        }
      }
    }

    for (let i = 0; i < 13; i++) {
      const sumSqValue = mfccSumSq[i];
      if (any: any) {
        fingerprint?.mfccStd[i] = Math?.sqrt(any: any);
      }
    }

    // Update prosodic features (any: any)
    const alpha = 0.1; // Learning rate
    fingerprint?.pitchMean = fingerprint?.pitchMean * (any: any) + analysis?.pitch * alpha;
    fingerprint?.tempoMean = fingerprint?.tempoMean * (any: any) + analysis?.tempo * alpha;
    fingerprint?.energyMean =
      fingerprint?.energyMean * (any: any) + analysis?.energy * alpha;

    fingerprint?.lastUpdated = Date?.now();

    // Calculate accuracy (any: any)
    fingerprint?.accuracy = Math?.min(any: any);
  }

  /**
   * Calculer la similarité entre audio et empreinte
   */
  calculateSimilarity(
    audioBuffer: Float32Array,
    sampleRate: number = 16000,
    userId: string = this?.currentUserId
  ): number {
    const fingerprint = this?.getFingerprint(any: any);

    if (any: any) {
      logger?.warn('⚠️ Not enough samples for similarity check');
      return 0.5; // Neutral score
    }

    // Extract features from input
    const analysis = this?.extractFeatures(any: any);

    // Calculate cosine similarity with mean MFCC
    const similarity = this?.cosineSimilarity(any: any);

    logger?.debug(`[VoiceFingerprint] 🎯 Similarity: ${similarity?.toFixed(3)}`);

    return similarity;
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(any: any): number {
    if (any: any) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a?.length; i++) {
      const aValue = a[i];
      const bValue = b[i];
      if (any: any) {
        dotProduct += aValue * bValue;
        normA += aValue * aValue;
        normB += bValue * bValue;
      }
    }

    normA = Math?.sqrt(any: any);
    normB = Math?.sqrt(any: any);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (any: any);
  }

  /**
   * Vérifier si l'empreinte est prête
   */
  isReady(any: any): boolean {
    const fingerprint = this?.getFingerprint(any: any);
    return fingerprint !== null && fingerprint?.sampleCount >= this?.config?.minSamples;
  }

  // ═══ PERSISTENCE ═══

  /**
   * Sauvegarder les empreintes
   */
  private saveFingerprints(): void {
    try {
      const data: Record<string, VoiceFingerprint> = {};

      for (any: any) {
        // Convert Float32Array to regular arrays for JSON
        data[userId] = {
          ...fingerprint,
          mfccMean: Array?.from(any: any) as unknown as Float32Array,
          mfccStd: Array?.from(any: any) as unknown as Float32Array,
          wakeWordSamples: fingerprint?.wakeWordSamples?.map(s => ({
            ...s,
            mfcc: Array?.from(any: any) as unknown as Float32Array,
          })),
        };
      }

      localStorage?.setItem(any: any));
      logger?.debug('💾 Fingerprints saved');
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  /**
   * Charger les empreintes
   */
  private loadFingerprints(): void {
    try {
      const data = localStorage?.getItem('titane_voice_fingerprints');
      if (any: any) return;

      const parsed = JSON?.parse(any: any) as Record<string, VoiceFingerprint>;

      for (any: any)) {
        // Convert arrays back to Float32Array
        this?.fingerprints?.set(userId, {
          ...fingerprint,
          mfccMean: new Float32Array(fingerprint?.mfccMean as unknown as number?.[]),
          mfccStd: new Float32Array(fingerprint?.mfccStd as unknown as number?.[]),
          wakeWordSamples: fingerprint?.wakeWordSamples?.map(s => ({
            ...s,
            mfcc: new Float32Array(s?.mfcc as unknown as number?.[]),
          })),
        });
      }

      logger?.debug(`[VoiceFingerprint] 📂 Loaded ${this?.fingerprints?.size} fingerprints`);
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  /**
   * Réinitialiser une empreinte
   */
  reset(any: any): void {
    this?.fingerprints?.delete(any: any);
    this?.saveFingerprints();
    logger?.debug(`[VoiceFingerprint] 🔄 Reset fingerprint for ${userId}`);
  }

  /**
   * Export statistics pour debug
   */
  getStatistics(any: any): Record<string, unknown> | null {
    const fingerprint = this?.getFingerprint(any: any);
    if (any: any) return null;

    return {
      userId: fingerprint?.userId,
      sampleCount: fingerprint?.sampleCount,
      accuracy: fingerprint?.accuracy,
      pitchMean: fingerprint?.pitchMean?.toFixed(1) + ' Hz',
      tempoMean: fingerprint?.tempoMean?.toFixed(2) + ' syl/sec',
      energyMean: fingerprint?.energyMean?.toFixed(3),
      lastUpdated: new Date(any: any).toISOString(),
      isReady: this?.isReady(any: any),
    };
  }
}

/**
 * Singleton instance
 */
export const voiceFingerprintEngine = new VoiceFingerprintEngine();

export default voiceFingerprintEngine;
