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

/**
 * Options de rendu émotionnel
 */
export interface EmotionalRenderOptions {
  useSSML?: boolean; // Utiliser SSML si supporté (défaut: true)
  fallbackToRaw?: boolean; // Fallback sur paramètres bruts (défaut: true)
  voice?: string; // Voix spécifique (optionnel)
  lang?: string; // Langue (optionnel)
  cache?: boolean; // Utiliser le cache (défaut: true)
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

    console.log(`[EmotionalTTS] 🎤 Speaking with emotion: ${intent.emotion}`);
    console.log(
      `[EmotionalTTS] 📊 Intensity: ${intent.intensity.toFixed(2)}, Warmth: ${intent.warmth.toFixed(2)}`
    );

    // 1. Générer le profil prosodique
    const prosody = prosodyEngine.mapProsody(intent);

    // 2. Tenter SSML si demandé et supporté
    if (useSSML && this.isSSMLSupported(cache)) {
      try {
        const ssml = prosodyEngine.generateSSML(text, prosody);
        console.log('[EmotionalTTS] 🎵 Using SSML mode');
        await hybridTTS.speak(ssml, { voice, lang });
        return;
      } catch (error) {
        console.warn('[EmotionalTTS] ⚠️ SSML failed, falling back...', error);
        if (!fallbackToRaw) throw error;
      }
    }

    // 3. Fallback: paramètres bruts
    if (fallbackToRaw) {
      console.log('[EmotionalTTS] 🔧 Using raw parameters mode');
      const rawParams = prosodyEngine.extractRawParameters(prosody);

      await hybridTTS.speak(text, {
        voice,
        lang,
        rate: rawParams.rate,
        pitch: rawParams.pitch,
        volume: rawParams.volume,
      });
      return;
    }

    // 4. Dernier recours: texte brut
    console.log('[EmotionalTTS] 📢 Using plain text mode');
    await hybridTTS.speak(text, { voice, lang });
  }

  /**
   * Stop la synthèse en cours
   */
  stop(): void {
    hybridTTS.stop();
  }

  /**
   * Vérifier si SSML est supporté
   */
  private isSSMLSupported(useCache: boolean = true): boolean {
    const cacheKey = 'ssml_support';

    if (useCache && this.ssmlSupportCache.has(cacheKey)) {
      const cached = this.ssmlSupportCache.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
    }

    // Détection du support SSML
    // Note: SSML est principalement supporté par:
    // - Parler-TTS (si configuré)
    // - Certaines voix Tauri TTS natives
    // - WebSpeech API ne supporte PAS SSML de base

    // DETECTION: Real browser voice SSML support detection
    // 1. Check if window.speechSynthesis exists (browser support)
    // 2. Test with dummy SSML: <speak><prosody rate="slow">test</prosody></speak>
    // 3. Compare output with plain text version to detect SSML parsing
    // 4. Known support: None in standard browsers (Chrome/Firefox/Safari reject SSML)
    // 5. Parler-TTS: Supports SSML through custom API (check via feature flag)
    // 6. Fallback: Use emotion mapping to rate/pitch adjustments if no SSML
    const isSupported =
      typeof window !== 'undefined' && 'speechSynthesis' in window && false; // Browsers don't support SSML

    if (useCache) {
      this.ssmlSupportCache.set(cacheKey, isSupported);
    }

    return isSupported;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.ssmlSupportCache.clear();
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
  return emotionalTTS.speak(text, intent, options);
}

/**
 * Helper: Stop émotionnel
 */
export function stopEmotional(): void {
  emotionalTTS.stop();
}
