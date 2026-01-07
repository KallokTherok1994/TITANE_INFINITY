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

/**
 * Profil prosodique
 */
export interface ProsodyProfile {
  rate: string; // "slow" | "medium" | "fast" | "x-slow" | "x-fast" | "80%"
  pitch: string; // "low" | "medium" | "high" | "x-low" | "x-high" | "+20%"
  volume: string; // "soft" | "medium" | "loud" | "x-soft" | "x-loud" | "+6dB"
  pauseShort: number; // ms pour pauses courtes (virgules)
  pauseMedium: number; // ms pour pauses moyennes (phrases)
  pauseLong: number; // ms pour pauses longues (paragraphes)
  emphasis: 'none' | 'reduced' | 'moderate' | 'strong';
  contour?: string; // Intonation pattern (optionnel, SSML avancé)
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
  mapProsody(intent: EmotionalIntent): ProsodyProfile {
    logger.debug(`[ProsodyEngine] 🎵 Mapping emotion: ${intent.emotion}`);

    // Calcul des valeurs de base
    const rate = this.calculateRate(intent);
    const pitch = this.calculatePitch(intent);
    const volume = this.calculateVolume(intent);
    const { pauseShort, pauseMedium, pauseLong } = this.calculatePauses(intent);
    const emphasis = this.calculateEmphasis(intent);

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
   * Calculer le débit (rate) en fonction de l'intention
   */
  private calculateRate(intent: EmotionalIntent): string {
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
   * Calculer la hauteur tonale (pitch)
   */
  private calculatePitch(intent: EmotionalIntent): string {
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
  private calculateVolume(intent: EmotionalIntent): string {
    const { intensity, energy } = intent;

    const volumeFactor = (intensity + energy) / 2;

    if (volumeFactor < 0.3) return 'x-soft';
    if (volumeFactor < 0.5) return 'soft';
    if (volumeFactor < 0.7) return 'medium';
    if (volumeFactor < 0.85) return 'loud';
    return 'x-loud';
  }

  /**
   * Calculer les pauses (en millisecondes)
   */
  private calculatePauses(intent: EmotionalIntent): {
    pauseShort: number;
    pauseMedium: number;
    pauseLong: number;
  } {
    const { speed, energy, emotion } = intent;

    // Base times
    let pauseShort = 250; // Virgule
    let pauseMedium = 500; // Point
    let pauseLong = 800; // Paragraphe

    // Modulation par speed (inverse)
    const speedFactor = 1 / speed;
    pauseShort *= speedFactor;
    pauseMedium *= speedFactor;
    pauseLong *= speedFactor;

    // Modulation par energy (faible énergie = pauses plus longues)
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
      pauseShort: Math.round(pauseShort),
      pauseMedium: Math.round(pauseMedium),
      pauseLong: Math.round(pauseLong),
    };
  }

  /**
   * Calculer l'emphase
   */
  private calculateEmphasis(
    intent: EmotionalIntent
  ): 'none' | 'reduced' | 'moderate' | 'strong' {
    const { intensity, energy } = intent;

    const emphasisFactor = (intensity + energy) / 2;

    if (emphasisFactor < 0.3) return 'reduced';
    if (emphasisFactor < 0.6) return 'moderate';
    if (emphasisFactor < 0.85) return 'strong';
    return 'strong';
  }

  /**
   * Générer SSML complet à partir d'un texte et d'un profil prosodique
   */
  generateSSML(text: string, prosody: ProsodyProfile): string {
    logger.debug('📝 Generating SSML...');

    // Échapper le texte pour SSML
    const escapedText = this.escapeSSML(text);

    // Ajouter les pauses aux ponctuations
    let ssmlText = escapedText;
    ssmlText = ssmlText.replace(/,/g, `,<break time="${prosody.pauseShort}ms"/>`);
    ssmlText = ssmlText.replace(/\./g, `.<break time="${prosody.pauseMedium}ms"/>`);
    ssmlText = ssmlText.replace(/\n\n/g, `<break time="${prosody.pauseLong}ms"/>`);

    // Emphase sur les mots importants (CAPS, mots-clés)
    if (prosody.emphasis !== 'none') {
      ssmlText = ssmlText.replace(
        /\b([A-ZÀ-Ü]{2,})\b/g,
        `<emphasis level="${prosody.emphasis}">$1</emphasis>`
      );
    }

    // Wrapper dans <prosody>
    const ssml = `
<speak>
  <prosody rate="${prosody.rate}" pitch="${prosody.pitch}" volume="${prosody.volume}">
    ${ssmlText}
  </prosody>
</speak>
    `.trim();

    logger.debug('✅ SSML generated');
    return ssml;
  }

  /**
   * Échapper les caractères spéciaux SSML
   */
  private escapeSSML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Extraire les paramètres bruts (pour fallback sans SSML)
   */
  extractRawParameters(prosody: ProsodyProfile): {
    rate: number;
    pitch: number;
    volume: number;
  } {
    return {
      rate: this.mapRateToNumber(prosody.rate),
      pitch: this.mapPitchToNumber(prosody.pitch),
      volume: this.mapVolumeToNumber(prosody.volume),
    };
  }

  private mapRateToNumber(rate: string): number {
    const mapping: Record<string, number> = {
      'x-slow': 0.7,
      slow: 0.85,
      medium: 1.0,
      fast: 1.15,
      'x-fast': 1.3,
    };
    return mapping[rate] || 1.0;
  }

  private mapPitchToNumber(pitch: string): number {
    const mapping: Record<string, number> = {
      'x-low': 0.8,
      low: 0.9,
      medium: 1.0,
      high: 1.1,
      'x-high': 1.2,
    };
    return mapping[pitch] || 1.0;
  }

  private mapVolumeToNumber(volume: string): number {
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
export function generateEmotionalSSML(text: string, intent: EmotionalIntent): string {
  const prosody = prosodyEngine.mapProsody(intent);
  return prosodyEngine.generateSSML(text, prosody);
}
