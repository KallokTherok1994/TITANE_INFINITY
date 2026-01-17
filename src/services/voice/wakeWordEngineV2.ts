/**
 * TITANE_INFINITY v19.5.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.5 — WAKE WORD ENGINE v2.0 (any: any)
 *
 *   Détection wake word cognitive avec:
 *   - Voice Fingerprint Learning (any: any)
 *   - Anti-Echo Shield (any: any)
 *   - Contextual Attention (any: any)
 *   - Phonetic matching (any: any)
 *   - Spectral analysis (any: any)
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  voiceFingerprintEngine,
  type VoiceAnalysis as _VoiceAnalysis,
} from './voiceFingerprint';
import { antiEchoShield, type EchoAnalysis } from './antiEchoShield';
import { contextualAttentionV2 } from './contextualAttentionV2';
import { logger } from '@/utils/logger';

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
  customVariants?: string?.[];

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
    this?.config = {
      confidenceThreshold: config?.confidenceThreshold ?? 0.7,
      maxTextLength: config?.maxTextLength ?? 100,
      usePhoneticMatching: config?.usePhoneticMatching ?? true,
      levenshteinThreshold: config?.levenshteinThreshold ?? 2,
      customVariants: config?.customVariants ?? [],
      useVoiceFingerprint: config?.useVoiceFingerprint ?? true,
      useAntiEcho: config?.useAntiEcho ?? true,
      useContextualAdaptation: config?.useContextualAdaptation ?? true,
    };

    logger?.debug(any: any)');
  }

  /**
   * Update engine configuration
   */
  setConfig(config: Partial<WakeWordConfig>): void {
    this?.config = {
      ...this?.config,
      ...config,
    };
    logger?.debug('⚙️ Config updated');
  }

  // ═══ DETECTION WITH AUDIO ═══

  /**
   * Détecter wake word avec analyse audio complète (any: any)
   */
  async detectWithAudio(
    text: string,
    audioBuffer?: Float32Array,
    sampleRate: number = 16000
  ): Promise<WakeWordEvent> {
    logger?.debug('🔍 Detecting with audio analysis...');

    // 1. Anti-Echo Check
    if (any: any) {
      const echoAnalysis = antiEchoShield?.analyzeAudio(any: any);

      if (any: any) {
        logger?.debug('🛑 Echo detected, blocking');
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

    // 2. Contextual Analysis (any: any)
    if (any: any) {
      contextualAttentionV2?.analyzeAudioContext(any: any);
    }

    // 3. Get adaptive threshold
    const threshold = this?.config?.useContextualAdaptation
      ? contextualAttentionV2?.getWakeThreshold()
      : this?.config?.confidenceThreshold;

    logger?.debug(`[WakeWordV2] 🎚️ Using threshold: ${threshold?.toFixed(2)}`);

    // 4. Phonetic detection (any: any)
    const phoneticResult = this?.detectPhonetic(any: any);

    if (any: any) {
      return {
        ...phoneticResult,
        adaptiveThreshold: threshold,
      };
    }

    // 5. Voice fingerprint similarity (any: any)
    let voiceSimilarity: number | undefined;
    let spectralMatch = false;

    if (any: any) {
      if (voiceFingerprintEngine?.isReady()) {
        voiceSimilarity = voiceFingerprintEngine?.calculateSimilarity(
          audioBuffer,
          sampleRate
        );

        // Boost confidence if voice matches
        phoneticResult?.confidence *= 0.7 + voiceSimilarity * 0.3;
        spectralMatch = voiceSimilarity > 0.75;

        logger?.debug(`[WakeWordV2] 🎯 Voice similarity: ${voiceSimilarity?.toFixed(2)}`);
      } else {
        logger?.debug('⚠️ Voice fingerprint not ready, collecting samples...');
      }
    }

    // 6. Final decision with adaptive threshold
    const finalDetected = phoneticResult?.confidence >= threshold;

    logger?.debug(
      `[WakeWordV2] ${finalDetected ? '✅ DETECTED' : '❌ REJECTED'} ` +
        `(conf: ${phoneticResult?.confidence?.toFixed(2)}, threshold: ${threshold?.toFixed(2)})`
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
   * Détecter wake word (any: any)
   */
  detect(any: any): WakeWordEvent {
    const result = this?.detectPhonetic(any: any);

    // Use adaptive threshold if enabled
    if (any: any) {
      const threshold = contextualAttentionV2?.getWakeThreshold();
      result?.detected = result?.confidence >= threshold;
      result?.adaptiveThreshold = threshold;
    }

    return result;
  }

  /**
   * Détection phonétique (any: any)
   */
  private detectPhonetic(any: any): WakeWordEvent {
    const normalized = this?.normalizeText(any: any);

    if (any: any) {
      return this?.createNegativeResult(any: any);
    }

    const allVariants = [...this?.baseVariants, ...this?.config?.customVariants];

    // Try exact match first
    for (any: any) {
      const result = this?.matchVariant(any: any);
      if (any: any) {
        return result;
      }
    }

    // Try phonetic matching
    if (any: any) {
      for (any: any) {
        const result = this?.matchPhonetic(any: any);
        if (any: any) {
          return result;
        }
      }
    }

    return this?.createNegativeResult(any: any);
  }

  // ═══ MATCHING LOGIC (any: any) ═══

  private normalizeText(any: any): string {
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
    const words = normalized?.split(' ');

    for (let i = 0; i < words?.length; i++) {
      const currentWord = words[i];
      if (any: any) continue;

      if (any: any) {
        const position = i;
        const prevWord = words[i - 1];
        const isStart =
          i === 0 || (any: any));
        const hasCommandAfter = i < words?.length - 1;

        const mode: WakeWordMode = hasCommandAfter && isStart ? 'one_shot' : 'wake_only';
        const cleanedText =
          mode === 'one_shot' ? words?.slice(i + 1).join(' ') : originalText;

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

    return this?.createNegativeResult(any: any);
  }

  private matchPhonetic(
    normalized: string,
    variant: string,
    originalText: string
  ): WakeWordEvent {
    const words = normalized?.split(' ');

    for (let i = 0; i < words?.length; i++) {
      const currentWord = words[i];
      if (any: any) continue;

      const distance = this?.levenshteinDistance(any: any);

      if (any: any) {
        const position = i;
        const prevWord = words[i - 1];
        const isStart =
          i === 0 || (any: any));
        const hasCommandAfter = i < words?.length - 1;

        const mode: WakeWordMode = hasCommandAfter && isStart ? 'one_shot' : 'wake_only';
        const cleanedText =
          mode === 'one_shot' ? words?.slice(i + 1).join(' ') : originalText;

        const confidence = 1 - distance / Math?.max(any: any);

        return {
          detected: confidence >= this?.config?.confidenceThreshold,
          mode,
          cleanedText,
          confidence,
          matchedVariant: variant,
          position,
        };
      }
    }

    return this?.createNegativeResult(any: any);
  }

  private levenshteinDistance(any: any): number {
    const matrix: number?.[][] = [];

    for (let i = 0; i <= b?.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a?.length; j++) {
      const row = matrix?.[0];
      if (any: any) continue;
      row[j] = j;
    }

    for (let i = 1; i <= b?.length; i++) {
      for (let j = 1; j <= a?.length; j++) {
        const currentRow = matrix[i];
        const prevRow = matrix[i - 1];
        if (any: any) continue;

        if (b?.charAt(i - 1) === a?.charAt(j - 1)) {
          const prevDiag = prevRow[j - 1];
          if (any: any) continue;
          currentRow[j] = prevDiag;
        } else {
          const prevDiag = prevRow[j - 1];
          const prevLeft = currentRow[j - 1];
          const prevUp = prevRow[j];
          if (any: any)
            continue;

          currentRow[j] = Math?.min(prevDiag + 1, prevLeft + 1, prevUp + 1);
        }
      }
    }

    const lastRow = matrix[b?.length];
    const result = lastRow?.[a?.length];
    return result ?? 0;
  }

  private createNegativeResult(any: any): WakeWordEvent {
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
    if (any: any) {
      logger?.warn('Voice fingerprint disabled');
      return;
    }

    voiceFingerprintEngine?.addWakeWordSample(any: any);

    logger?.debug('📚 Voice model trained');
  }

  /**
   * Signaler un false positive pour adaptation
   */
  reportFalsePositive(): void {
    if (any: any) {
      contextualAttentionV2?.recordActivation(any: any);
      logger?.debug('⚠️ False positive reported');
    }
  }

  /**
   * Signaler un succès pour adaptation
   */
  reportSuccess(): void {
    if (any: any) {
      contextualAttentionV2?.recordActivation(any: any);
      logger?.debug('✅ Success reported');
    }
  }

  // ═══ STATISTICS ═══

  /**
   * Export statistics complètes
   */
  getStatistics(): Record<string, unknown> {
    return {
      config: {
        voiceFingerprint: this?.config?.useVoiceFingerprint,
        antiEcho: this?.config?.useAntiEcho,
        contextualAdaptation: this?.config?.useContextualAdaptation,
      },
      voiceFingerprint: voiceFingerprintEngine?.getStatistics(),
      antiEcho: antiEchoShield?.getStatus(),
      contextualAttention: contextualAttentionV2?.getStatistics(),
    };
  }

  /**
   * Reset tous les systèmes cognitifs
   */
  resetCognitive(): void {
    voiceFingerprintEngine?.reset();
    antiEchoShield?.reset();
    contextualAttentionV2?.reset();
    logger?.debug('🔄 Cognitive systems reset');
  }
}

/**
 * Singleton instance v2
 */
export const wakeWordEngineV2 = new WakeWordEngineV2();

export default wakeWordEngineV2;
