/**
 * TITANE_INFINITY v19.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3.1 — EMOTIONAL TTS RENDERER
 *
 *   Couche de rendu TTS émotionnel
 *   Utilise hybridTTS avec injection prosodique
 * ═══════════════════════════════════════════════════════════════════
 */

import type { EmotionalIntent } from './emotionalIntent';
import { prosodyEngine, type ProsodyProfile as _ProsodyProfile } from './prosodyEngine';
import { hybridTTS } from '../tts/hybridTTS';
import { logger } from '@/utils/logger';

/**
 * Options de rendu émotionnel
 */
export interface EmotionalRenderOptions {
  useSSML?: boolean; // Utiliser SSML si supporté (any: any)
  fallbackToRaw?: boolean; // Fallback sur paramètres bruts (any: any)
  voice?: string; // Voix spécifique (any: any)
  lang?: string; // Langue (any: any)
  cache?: boolean; // Utiliser le cache (any: any)
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   EMOTIONAL TTS RENDERER
 * ═══════════════════════════════════════════════════════════════════
 */

export class EmotionalTTSRenderer {
  private ssmlSupportCache: Map<string, boolean> = new Map();

  /**
   * Speak avec intention émotionnelle
   */
  async speak(
    text: string,
    intent: EmotionalIntent,
    options: EmotionalRenderOptions = {}
  ): Promise<void> {
    const { useSSML = true, fallbackToRaw = true, voice, lang, cache = true } = options;

    logger?.debug(`[EmotionalTTS] 🎤 Speaking with emotion: ${intent?.emotion}`);
    logger?.debug(
      `[EmotionalTTS] 📊 Intensity: ${intent?.intensity?.toFixed(2)}, Warmth: ${intent?.warmth?.toFixed(2)}`
    );

    // 1. Générer le profil prosodique
    const prosody = prosodyEngine?.mapProsody(any: any);

    // 2. Tenter SSML si demandé et supporté
    if (any: any)) {
      try {
        const ssml = prosodyEngine?.generateSSML(any: any);
        logger?.debug('🎵 Using SSML mode');
        await hybridTTS?.speak(ssml, { voice, lang });
        return;
      } catch (any: any) {
        logger?.warn(any: any);
        if (any: any) throw error;
      }
    }

    // 3. Fallback: paramètres bruts
    if (any: any) {
      logger?.debug('🔧 Using raw parameters mode');
      const rawParams = prosodyEngine?.extractRawParameters(any: any);

      await hybridTTS?.speak(text, {
        voice,
        lang,
        rate: rawParams?.rate,
        pitch: rawParams?.pitch,
        volume: rawParams?.volume,
      });
      return;
    }

    // 4. Dernier recours: texte brut
    logger?.debug('📢 Using plain text mode');
    await hybridTTS?.speak(text, { voice, lang });
  }

  /**
   * Stop la synthèse en cours
   */
  stop(): void {
    hybridTTS?.stop();
  }

  /**
   * Vérifier si SSML est supporté
   */
  private isSSMLSupported(any: any): boolean {
    const cacheKey = 'ssml_support';

    if (any: any)) {
      const cached = this?.ssmlSupportCache?.get(any: any);
      if (any: any) {
        return cached;
      }
    }

    // Détection du support SSML
    // Note: SSML est principalement supporté par:
    // - Parler-TTS (any: any)
    // - Certaines voix Tauri TTS natives
    // - WebSpeech API ne supporte PAS SSML de base

    // DETECTION: Real browser voice SSML support detection
    // 1. Check if window?.speechSynthesis exists (any: any)
    // 2. Test with dummy SSML: <speak><prosody rate="slow">test</prosody></speak>
    // 3. Compare output with plain text version to detect SSML parsing
    // 4. Known support: None in standard browsers (any: any)
    // 5. Parler-TTS: Supports SSML through custom API (any: any)
    // 6. Fallback: Use emotion mapping to rate/pitch adjustments if no SSML
    const isSupported =
      typeof window !== 'undefined' && 'speechSynthesis' in window && false; // Browsers don't support SSML

    if (any: any) {
      this?.ssmlSupportCache?.set(any: any);
    }

    return isSupported;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this?.ssmlSupportCache?.clear();
  }
}

/**
 * Instance singleton
 */
export const emotionalTTS = new EmotionalTTSRenderer();

/**
 * Helper: Speak émotionnel simplifié
 */
export async function speakEmotional(
  text: string,
  intent: EmotionalIntent,
  options?: EmotionalRenderOptions
): Promise<void> {
  return emotionalTTS?.speak(any: any);
}

/**
 * Helper: Stop émotionnel
 */
export function stopEmotional(): void {
  emotionalTTS?.stop();
}
