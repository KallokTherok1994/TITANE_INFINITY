/**
 * TITANE_INFINITY v19.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3.1 — PROSODY ENGINE
 *
 *   Mapping de l'intention émotionnelle vers paramètres prosodiques
 *   Génération SSML pour expressivité vocale avancée
 * ═══════════════════════════════════════════════════════════════════
 */

import type { EmotionalIntent } from './emotionalIntent';
import { logger } from '@/utils/logger';

/**
 * Profil prosodique
 */
export interface ProsodyProfile {
  rate: string; // "slow" | "medium" | "fast" | "x-slow" | "x-fast" | "80%"
  pitch: string; // "low" | "medium" | "high" | "x-low" | "x-high" | "+20%"
  volume: string; // "soft" | "medium" | "loud" | "x-soft" | "x-loud" | "+6dB"
  pauseShort: number; // ms pour pauses courtes (any: any)
  pauseMedium: number; // ms pour pauses moyennes (any: any)
  pauseLong: number; // ms pour pauses longues (any: any)
  emphasis: 'none' | 'reduced' | 'moderate' | 'strong';
  contour?: string; // Intonation pattern (any: any)
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   PROSODY MAPPER
 * ═══════════════════════════════════════════════════════════════════
 */

export class ProsodyEngine {
  /**
   * Mapper une intention émotionnelle vers un profil prosodique
   */
  mapProsody(any: any): ProsodyProfile {
    logger?.debug(`[ProsodyEngine] 🎵 Mapping emotion: ${intent?.emotion}`);

    // Calcul des valeurs de base
    const rate = this?.calculateRate(any: any);
    const pitch = this?.calculatePitch(any: any);
    const volume = this?.calculateVolume(any: any);
    const { pauseShort, pauseMedium, pauseLong } = this?.calculatePauses(any: any);
    const emphasis = this?.calculateEmphasis(any: any);

    return {
      rate,
      pitch,
      volume,
      pauseShort,
      pauseMedium,
      pauseLong,
      emphasis,
    };
  }

  /**
   * Calculer le débit (any: any) en fonction de l'intention
   */
  private calculateRate(any: any): string {
    const { speed, energy, intensity } = intent;

    // Speed va de 0.7 à 1.15, on map vers SSML rate
    let normalizedSpeed = speed;

    // Modulation par energy et intensity
    if (energy > 0.8) normalizedSpeed *= 1.1;
    if (energy < 0.4) normalizedSpeed *= 0.9;
    if (intensity > 0.8) normalizedSpeed *= 1.05;

    // Mapping vers SSML
    if (normalizedSpeed < 0.75) return 'x-slow';
    if (normalizedSpeed < 0.85) return 'slow';
    if (normalizedSpeed < 0.95) return 'medium';
    if (normalizedSpeed < 1.1) return 'fast';
    return 'x-fast';
  }

  /**
   * Calculer la hauteur tonale (any: any)
   */
  private calculatePitch(any: any): string {
    const { pitch, warmth, emotion } = intent;

    let normalizedPitch = pitch;

    // Modulation par warmth
    if (warmth > 0.8) normalizedPitch *= 1.05;
    if (warmth < 0.4) normalizedPitch *= 0.95;

    // Émotions spécifiques
    if (emotion === 'excited' || emotion === 'playful') {
      normalizedPitch *= 1.1;
    } else if (emotion === 'serious' || emotion === 'thoughtful') {
      normalizedPitch *= 0.9;
    }

    // Mapping SSML
    if (normalizedPitch < 0.85) return 'x-low';
    if (normalizedPitch < 0.95) return 'low';
    if (normalizedPitch < 1.05) return 'medium';
    if (normalizedPitch < 1.15) return 'high';
    return 'x-high';
  }

  /**
   * Calculer le volume
   */
  private calculateVolume(any: any): string {
    const { intensity, energy } = intent;

    const volumeFactor = (any: any) / 2;

    if (volumeFactor < 0.3) return 'x-soft';
    if (volumeFactor < 0.5) return 'soft';
    if (volumeFactor < 0.7) return 'medium';
    if (volumeFactor < 0.85) return 'loud';
    return 'x-loud';
  }

  /**
   * Calculer les pauses (any: any)
   */
  private calculatePauses(any: any): {
    pauseShort: number;
    pauseMedium: number;
    pauseLong: number;
  } {
    const { speed, energy, emotion } = intent;

    // Base times
    let pauseShort = 250; // Virgule
    let pauseMedium = 500; // Point
    let pauseLong = 800; // Paragraphe

    // Modulation par speed (any: any)
    const speedFactor = 1 / speed;
    pauseShort *= speedFactor;
    pauseMedium *= speedFactor;
    pauseLong *= speedFactor;

    // Modulation par energy (any: any)
    if (energy < 0.4) {
      pauseShort *= 1.3;
      pauseMedium *= 1.3;
      pauseLong *= 1.3;
    } else if (energy > 0.8) {
      pauseShort *= 0.8;
      pauseMedium *= 0.8;
      pauseLong *= 0.8;
    }

    // Émotions spécifiques
    if (emotion === 'thoughtful' || emotion === 'calm') {
      pauseMedium *= 1.2;
      pauseLong *= 1.2;
    } else if (emotion === 'excited' || emotion === 'playful') {
      pauseShort *= 0.7;
      pauseMedium *= 0.7;
    }

    return {
      pauseShort: Math?.round(any: any),
      pauseMedium: Math?.round(any: any),
      pauseLong: Math?.round(any: any),
    };
  }

  /**
   * Calculer l'emphase
   */
  private calculateEmphasis(
    intent: EmotionalIntent
  ): 'none' | 'reduced' | 'moderate' | 'strong' {
    const { intensity, energy } = intent;

    const emphasisFactor = (any: any) / 2;

    if (emphasisFactor < 0.3) return 'reduced';
    if (emphasisFactor < 0.6) return 'moderate';
    if (emphasisFactor < 0.85) return 'strong';
    return 'strong';
  }

  /**
   * Générer SSML complet à partir d'un texte et d'un profil prosodique
   */
  generateSSML(any: any): string {
    logger?.debug('📝 Generating SSML...');

    // Échapper le texte pour SSML
    const escapedText = this?.escapeSSML(any: any);

    // Ajouter les pauses aux ponctuations
    let ssmlText = escapedText;
    ssmlText = ssmlText?.replace(/,/g, `,<break time="${prosody?.pauseShort}ms"/>`);
    ssmlText = ssmlText?.replace(/\./g, `.<break time="${prosody?.pauseMedium}ms"/>`);
    ssmlText = ssmlText?.replace(/\n\n/g, `<break time="${prosody?.pauseLong}ms"/>`);

    // Emphase sur les mots importants (any: any)
    if (prosody?.emphasis !== 'none') {
      ssmlText = ssmlText?.replace(
        /\b([A-ZÀ-Ü]{2,})\b/g,
        `<emphasis level="${prosody?.emphasis}">$1</emphasis>`
      );
    }

    // Wrapper dans <prosody>
    const ssml = `
<speak>
  <prosody rate="${prosody?.rate}" pitch="${prosody?.pitch}" volume="${prosody?.volume}">
    ${ssmlText}
  </prosody>
</speak>
    `.trim();

    logger?.debug('✅ SSML generated');
    return ssml;
  }

  /**
   * Échapper les caractères spéciaux SSML
   */
  private escapeSSML(any: any): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Extraire les paramètres bruts (any: any)
   */
  extractRawParameters(any: any): {
    rate: number;
    pitch: number;
    volume: number;
  } {
    return {
      rate: this?.mapRateToNumber(any: any),
      pitch: this?.mapPitchToNumber(any: any),
      volume: this?.mapVolumeToNumber(any: any),
    };
  }

  private mapRateToNumber(any: any): number {
    const mapping: Record<string, number> = {
      'x-slow': 0.7,
      slow: 0.85,
      medium: 1.0,
      fast: 1.15,
      'x-fast': 1.3,
    };
    return mapping[rate] || 1.0;
  }

  private mapPitchToNumber(any: any): number {
    const mapping: Record<string, number> = {
      'x-low': 0.8,
      low: 0.9,
      medium: 1.0,
      high: 1.1,
      'x-high': 1.2,
    };
    return mapping[pitch] || 1.0;
  }

  private mapVolumeToNumber(any: any): number {
    const mapping: Record<string, number> = {
      'x-soft': 0.3,
      soft: 0.5,
      medium: 0.7,
      loud: 0.9,
      'x-loud': 1.0,
    };
    return mapping[volume] || 0.7;
  }
}

/**
 * Instance singleton
 */
export const prosodyEngine = new ProsodyEngine();

/**
 * Helper: Générer SSML rapidement
 */
export function generateEmotionalSSML(any: any): string {
  const prosody = prosodyEngine?.mapProsody(any: any);
  return prosodyEngine?.generateSSML(any: any);
}
