/**
 * TITANE_INFINITY v19.5.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.5 — WAKE WORD ENGINE v2.0 (COGNITIVE)
 *
 *   Détection wake word cognitive avec:
 *   - Voice Fingerprint Learning (adaptation timbre personnel)
 *   - Anti-Echo Shield (protection TTS)
 *   - Contextual Attention (seuils adaptatifs)
 *   - Phonetic matching (Levenshtein)
 *   - Spectral analysis (MFCC)
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  voiceFingerprintEngine,
  type VoiceAnalysis as _VoiceAnalysis,
} from './voiceFingerprint';
import { antiEchoShield, type EchoAnalysis } from './antiEchoShield';
import { contextualAttentionV2 } from './contextualAttentionV2';

export type WakeWordMode = 'wake_only' | 'one_shot';

export interface WakeWordEvent {
  detected: boolean;
  mode: WakeWordMode;
  cleanedText: string;
  confidence: number;
  matchedVariant: string;
  position: number;

  // v2.0 additions
  voiceSimilarity?: number; // Similarité avec empreinte vocale
  echoAnalysis?: EchoAnalysis; // Analyse anti-écho
  adaptiveThreshold?: number; // Seuil utilisé
  spectralMatch?: boolean; // Match spectral MFCC
}

export interface WakeWordConfig {
  confidenceThreshold?: number;
  maxTextLength?: number;
  usePhoneticMatching?: boolean;
  levenshteinThreshold?: number;
  customVariants?: string[];

  // v2.0 additions
  useVoiceFingerprint?: boolean; // Activer learning vocal
  useAntiEcho?: boolean; // Activer anti-écho
  useContextualAdaptation?: boolean; // Activer seuils adaptatifs
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   WAKE WORD ENGINE v2.0
 * ═══════════════════════════════════════════════════════════════════
 */
export class WakeWordEngineV2 {
  private config: Required<WakeWordConfig>;

  private readonly baseVariants = [
    'titane',
    'titan',
    'titanne',
    'tytane',
    'tytann',
    'ti-tane',
    'ti tane',
    'tithane',
    'tythan',
  ];

  private readonly prefixes = ['hey', 'salut', 'ok', 'dis', 'écoute', 'alors'];

  constructor(config: WakeWordConfig = {}) {
    this.config = {
      confidenceThreshold: config.confidenceThreshold ?? 0.7,
      maxTextLength: config.maxTextLength ?? 100,
      usePhoneticMatching: config.usePhoneticMatching ?? true,
      levenshteinThreshold: config.levenshteinThreshold ?? 2,
      customVariants: config.customVariants ?? [],
      useVoiceFingerprint: config.useVoiceFingerprint ?? true,
      useAntiEcho: config.useAntiEcho ?? true,
      useContextualAdaptation: config.useContextualAdaptation ?? true,
    };

    console.log('[WakeWordV2] 🧠 Initialized (Cognitive Mode)');
  }

  /**
   * Update engine configuration
   */
  setConfig(config: Partial<WakeWordConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    console.log('[WakeWordV2] ⚙️ Config updated');
  }

  // ═══ DETECTION WITH AUDIO ═══

  /**
   * Détecter wake word avec analyse audio complète (PREFERRED)
   */
  async detectWithAudio(
    text: string,
    audioBuffer?: Float32Array,
    sampleRate: number = 16000
  ): Promise<WakeWordEvent> {
    console.log('[WakeWordV2] 🔍 Detecting with audio analysis...');

    // 1. Anti-Echo Check
    if (this.config.useAntiEcho && audioBuffer) {
      const echoAnalysis = antiEchoShield.analyzeAudio(audioBuffer);

      if (echoAnalysis.isEcho) {
        console.log('[WakeWordV2] 🛑 Echo detected, blocking');
        return {
          detected: false,
          mode: 'wake_only',
          cleanedText: text,
          confidence: 0,
          matchedVariant: '',
          position: -1,
          echoAnalysis,
        };
      }
    }

    // 2. Contextual Analysis (update environment if audio available)
    if (this.config.useContextualAdaptation && audioBuffer) {
      contextualAttentionV2.analyzeAudioContext(audioBuffer);
    }

    // 3. Get adaptive threshold
    const threshold = this.config.useContextualAdaptation
      ? contextualAttentionV2.getWakeThreshold()
      : this.config.confidenceThreshold;

    console.log(`[WakeWordV2] 🎚️ Using threshold: ${threshold.toFixed(2)}`);

    // 4. Phonetic detection (base)
    const phoneticResult = this.detectPhonetic(text);

    if (!phoneticResult.detected) {
      return {
        ...phoneticResult,
        adaptiveThreshold: threshold,
      };
    }

    // 5. Voice fingerprint similarity (if audio available)
    let voiceSimilarity: number | undefined;
    let spectralMatch = false;

    if (this.config.useVoiceFingerprint && audioBuffer) {
      if (voiceFingerprintEngine.isReady()) {
        voiceSimilarity = voiceFingerprintEngine.calculateSimilarity(
          audioBuffer,
          sampleRate
        );

        // Boost confidence if voice matches
        phoneticResult.confidence *= 0.7 + voiceSimilarity * 0.3;
        spectralMatch = voiceSimilarity > 0.75;

        console.log(`[WakeWordV2] 🎯 Voice similarity: ${voiceSimilarity.toFixed(2)}`);
      } else {
        console.log('[WakeWordV2] ⚠️ Voice fingerprint not ready, collecting samples...');
      }
    }

    // 6. Final decision with adaptive threshold
    const finalDetected = phoneticResult.confidence >= threshold;

    console.log(
      `[WakeWordV2] ${finalDetected ? '✅ DETECTED' : '❌ REJECTED'} ` +
        `(conf: ${phoneticResult.confidence.toFixed(2)}, threshold: ${threshold.toFixed(2)})`
    );

    return {
      ...phoneticResult,
      detected: finalDetected,
      voiceSimilarity,
      adaptiveThreshold: threshold,
      spectralMatch,
    };
  }

  /**
   * Détecter wake word (texte seul, legacy method)
   */
  detect(text: string): WakeWordEvent {
    const result = this.detectPhonetic(text);

    // Use adaptive threshold if enabled
    if (this.config.useContextualAdaptation) {
      const threshold = contextualAttentionV2.getWakeThreshold();
      result.detected = result.confidence >= threshold;
      result.adaptiveThreshold = threshold;
    }

    return result;
  }

  /**
   * Détection phonétique (base algorithm)
   */
  private detectPhonetic(text: string): WakeWordEvent {
    const normalized = this.normalizeText(text);

    if (normalized.length > this.config.maxTextLength) {
      return this.createNegativeResult(text);
    }

    const allVariants = [...this.baseVariants, ...this.config.customVariants];

    // Try exact match first
    for (const variant of allVariants) {
      const result = this.matchVariant(normalized, variant, text);
      if (result.detected) {
        return result;
      }
    }

    // Try phonetic matching
    if (this.config.usePhoneticMatching) {
      for (const variant of allVariants) {
        const result = this.matchPhonetic(normalized, variant, text);
        if (result.detected) {
          return result;
        }
      }
    }

    return this.createNegativeResult(text);
  }

  // ═══ MATCHING LOGIC (from v1) ═══

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private matchVariant(
    normalized: string,
    variant: string,
    originalText: string
  ): WakeWordEvent {
    const words = normalized.split(' ');

    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i];
      if (!currentWord) continue;

      if (currentWord === variant) {
        const position = i;
        const prevWord = words[i - 1];
        const isStart =
          i === 0 || (prevWord !== undefined && this.prefixes.includes(prevWord));
        const hasCommandAfter = i < words.length - 1;

        const mode: WakeWordMode = hasCommandAfter && isStart ? 'one_shot' : 'wake_only';
        const cleanedText =
          mode === 'one_shot' ? words.slice(i + 1).join(' ') : originalText;

        return {
          detected: true,
          mode,
          cleanedText,
          confidence: 1.0,
          matchedVariant: variant,
          position,
        };
      }
    }

    return this.createNegativeResult(originalText);
  }

  private matchPhonetic(
    normalized: string,
    variant: string,
    originalText: string
  ): WakeWordEvent {
    const words = normalized.split(' ');

    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i];
      if (!currentWord) continue;

      const distance = this.levenshteinDistance(currentWord, variant);

      if (distance <= this.config.levenshteinThreshold) {
        const position = i;
        const prevWord = words[i - 1];
        const isStart =
          i === 0 || (prevWord !== undefined && this.prefixes.includes(prevWord));
        const hasCommandAfter = i < words.length - 1;

        const mode: WakeWordMode = hasCommandAfter && isStart ? 'one_shot' : 'wake_only';
        const cleanedText =
          mode === 'one_shot' ? words.slice(i + 1).join(' ') : originalText;

        const confidence = 1 - distance / Math.max(currentWord.length, variant.length);

        return {
          detected: confidence >= this.config.confidenceThreshold,
          mode,
          cleanedText,
          confidence,
          matchedVariant: variant,
          position,
        };
      }
    }

    return this.createNegativeResult(originalText);
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      const row = matrix[0];
      if (!row) continue;
      row[j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const currentRow = matrix[i];
        const prevRow = matrix[i - 1];
        if (!currentRow || !prevRow) continue;

        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          const prevDiag = prevRow[j - 1];
          if (prevDiag === undefined) continue;
          currentRow[j] = prevDiag;
        } else {
          const prevDiag = prevRow[j - 1];
          const prevLeft = currentRow[j - 1];
          const prevUp = prevRow[j];
          if (prevDiag === undefined || prevLeft === undefined || prevUp === undefined)
            continue;

          currentRow[j] = Math.min(prevDiag + 1, prevLeft + 1, prevUp + 1);
        }
      }
    }

    const lastRow = matrix[b.length];
    const result = lastRow?.[a.length];
    return result ?? 0;
  }

  private createNegativeResult(text: string): WakeWordEvent {
    return {
      detected: false,
      mode: 'wake_only',
      cleanedText: text,
      confidence: 0,
      matchedVariant: '',
      position: -1,
    };
  }

  // ═══ LEARNING & FEEDBACK ═══

  /**
   * Entraîner le modèle vocal avec un échantillon validé
   */
  async trainVoiceModel(
    audioBuffer: Float32Array,
    sampleRate: number = 16000,
    confidence: number = 1.0
  ): Promise<void> {
    if (!this.config.useVoiceFingerprint) {
      console.warn('[WakeWordV2] Voice fingerprint disabled');
      return;
    }

    voiceFingerprintEngine.addWakeWordSample(audioBuffer, sampleRate, confidence);

    console.log('[WakeWordV2] 📚 Voice model trained');
  }

  /**
   * Signaler un false positive pour adaptation
   */
  reportFalsePositive(): void {
    if (this.config.useContextualAdaptation) {
      contextualAttentionV2.recordActivation(false, true);
      console.log('[WakeWordV2] ⚠️ False positive reported');
    }
  }

  /**
   * Signaler un succès pour adaptation
   */
  reportSuccess(): void {
    if (this.config.useContextualAdaptation) {
      contextualAttentionV2.recordActivation(true, false);
      console.log('[WakeWordV2] ✅ Success reported');
    }
  }

  // ═══ STATISTICS ═══

  /**
   * Export statistics complètes
   */
  getStatistics(): Record<string, unknown> {
    return {
      config: {
        voiceFingerprint: this.config.useVoiceFingerprint,
        antiEcho: this.config.useAntiEcho,
        contextualAdaptation: this.config.useContextualAdaptation,
      },
      voiceFingerprint: voiceFingerprintEngine.getStatistics(),
      antiEcho: antiEchoShield.getStatus(),
      contextualAttention: contextualAttentionV2.getStatistics(),
    };
  }

  /**
   * Reset tous les systèmes cognitifs
   */
  resetCognitive(): void {
    voiceFingerprintEngine.reset();
    antiEchoShield.reset();
    contextualAttentionV2.reset();
    console.log('[WakeWordV2] 🔄 Cognitive systems reset');
  }
}

/**
 * Singleton instance v2
 */
export const wakeWordEngineV2 = new WakeWordEngineV2();

export default wakeWordEngineV2;
