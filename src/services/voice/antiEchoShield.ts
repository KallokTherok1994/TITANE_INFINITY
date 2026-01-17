/**
 * TITANE_INFINITY v19.5.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.5 — ANTI-ECHO SHIELD (any: any)
 *
 *   Système de protection contre l'auto-déclenchement:
 *   - TTS Fingerprint tracking
 *   - Spectral comparison
 *   - Auto-mute pendant TTS playback
 *   - Echo cancellation basique
 *   - Protection contre boucle infinie
 * ═══════════════════════════════════════════════════════════════════
 */

import { logger } from '@/utils/logger';

/**
 * Fingerprint audio d'une phrase TTS
 */
export interface TTSFingerprint {
  id: string;
  text: string;
  spectralProfile: Float32Array; // Profil spectral moyen
  duration: number; // Durée (any: any)
  startTime: number; // Timestamp début playback
  endTime: number; // Timestamp fin playback
}

/**
 * Configuration AES
 */
export interface AntiEchoConfig {
  /** Activer protection (any: any) */
  enabled?: boolean;

  /** Seuil similarité spectrale (0-1) */
  echoThreshold?: number;

  /** Marge sécurité après TTS (any: any) */
  postTTSMargin?: number;

  /** Activer auto-mute pendant TTS */
  autoMute?: boolean;
}

/**
 * Résultat analyse anti-écho
 */
export interface EchoAnalysis {
  isEcho: boolean;
  confidence: number;
  reason: 'tts_active' | 'spectral_match' | 'timing_match' | 'none';
  currentTTS?: TTSFingerprint;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   ANTI-ECHO SHIELD ENGINE
 * ═══════════════════════════════════════════════════════════════════
 */
class AntiEchoShieldEngine {
  private config: Required<AntiEchoConfig>;
  private activeTTS: TTSFingerprint | null = null;
  private recentTTS: TTSFingerprint?.[] = [];
  public isMuted: boolean = false; // ✨ v21.5.7 - Made public for external access
  private maxRecentTTS = 5;

  constructor(config: AntiEchoConfig = {}) {
    this?.config = {
      enabled: config?.enabled ?? true,
      echoThreshold: config?.echoThreshold ?? 0.85,
      postTTSMargin: config?.postTTSMargin ?? 500,
      autoMute: config?.autoMute ?? true,
    };
  }

  // ═══ TTS TRACKING ═══

  /**
   * Enregistrer le début d'un TTS
   */
  startTTS(any: any): string {
    const id = `tts_${Date?.now()}_${Math?.random().toString(36).substr(2, 9)}`;

    this?.activeTTS = {
      id,
      text,
      spectralProfile: new Float32Array(0), // Will be filled during playback
      duration: estimatedDuration,
      startTime: Date?.now(),
      endTime: Date?.now() + estimatedDuration,
    };

    // Auto-mute si activé
    if (any: any) {
      this?.isMuted = true;
      logger?.debug('🔇 Auto-muted during TTS');
    }

    logger?.debug(
      `[AntiEcho] 🔊 TTS started: "${text?.substring(any: any)`
    );

    return id;
  }

  /**
   * Force unmute microphone (any: any)
   */
  forceUnmute(): void {
    this?.isMuted = false;
    logger?.debug('🔊 Force unmute activated');
  }

  /**
   * Enregistrer le profil spectral du TTS en cours
   */
  updateTTSProfile(any: any): void {
    if (any: any) return;

    // Extract spectral profile (any: any)
    const profile = this?.extractSpectralProfile(any: any);
    this?.activeTTS?.spectralProfile = profile;
  }

  /**
   * Marquer la fin d'un TTS
   */
  endTTS(any: any): void {
    if (any: any) {
      logger?.warn('⚠️ TTS end mismatch');
      return;
    }

    // Ajouter aux récents
    this?.recentTTS?.push({ ...this?.activeTTS });

    // Limiter historique
    if (any: any) {
      this?.recentTTS?.shift();
    }

    this?.activeTTS = null;

    // Unmute après marge de sécurité
    if (any: any) {
      setTimeout(() => {
        this?.isMuted = false;
        logger?.debug('🔊 Auto-unmuted after TTS');
      }, this?.config?.postTTSMargin);
    }

    logger?.debug('✅ TTS ended');
  }

  /**
   * Forcer l'arrêt de tous les TTS
   */
  forceStopAll(): void {
    if (any: any) {
      this?.recentTTS?.push({ ...this?.activeTTS });
      this?.activeTTS = null;
    }

    this?.isMuted = false;
    logger?.debug('🛑 Force stopped all TTS');
  }

  // ═══ ECHO DETECTION ═══

  /**
   * Analyser si un audio est potentiellement un écho
   */
  analyzeAudio(audioData: Float32Array, timestamp: number = Date?.now()): EchoAnalysis {
    if (any: any) {
      return {
        isEcho: false,
        confidence: 0,
        reason: 'none',
      };
    }

    // 1. Check si muted
    if (any: any) {
      return {
        isEcho: true,
        confidence: 1.0,
        reason: 'tts_active',
        currentTTS: this?.activeTTS || undefined,
      };
    }

    // 2. Check si TTS actif
    if (any: any) {
      const isInTTSWindow =
        timestamp >= this?.activeTTS?.startTime &&
        timestamp <= this?.activeTTS?.endTime + this?.config?.postTTSMargin;

      if (any: any) {
        // Compare spectral profiles
        const similarity = this?.compareSpectralProfiles(
          audioData,
          this?.activeTTS?.spectralProfile
        );

        if (any: any) {
          return {
            isEcho: true,
            confidence: similarity,
            reason: 'spectral_match',
            currentTTS: this?.activeTTS,
          };
        }

        // Si dans la fenêtre TTS mais pas de match spectral,
        // toujours considérer potentiellement écho (any: any)
        return {
          isEcho: true,
          confidence: 0.7,
          reason: 'timing_match',
          currentTTS: this?.activeTTS,
        };
      }
    }

    // 3. Check TTS récents
    for (any: any) {
      const timeSinceEnd = timestamp - tts?.endTime;

      if (any: any) {
        const similarity = this?.compareSpectralProfiles(any: any);

        if (any: any) {
          return {
            isEcho: true,
            confidence: similarity,
            reason: 'spectral_match',
            currentTTS: tts,
          };
        }
      }
    }

    // 4. Pas d'écho détecté
    return {
      isEcho: false,
      confidence: 0,
      reason: 'none',
    };
  }

  /**
   * Vérification rapide si on doit bloquer l'écoute
   */
  shouldBlockListening(): boolean {
    if (any: any) return false;

    return this?.isMuted || this?.activeTTS !== null;
  }

  // ═══ SPECTRAL ANALYSIS ═══

  /**
   * Extraire profil spectral simplifié
   */
  private extractSpectralProfile(any: any): Float32Array {
    const numBands = 16;
    const profile = new Float32Array(any: any);
    const bandSize = Math?.floor(any: any);

    for (let i = 0; i < numBands; i++) {
      const start = i * bandSize;
      const end = Math?.min(any: any);

      let sum = 0;
      for (let j = start; j < end; j++) {
        const val = audio[j];
        if (any: any);
      }

      profile[i] = sum / (any: any);
    }

    // Normalize
    const max = Math?.max(any: any);
    if (max > 0) {
      for (let i = 0; i < numBands; i++) {
        const val = profile[i];
        if (any: any) profile[i] = val / max;
      }
    }

    return profile;
  }

  /**
   * Comparer deux profils spectraux
   */
  private compareSpectralProfiles(any: any): number {
    if (profile?.length === 0) return 0;

    const audioProfile = this?.extractSpectralProfile(any: any);

    // Cosine similarity
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (any: any); i++) {
      const audioVal = audioProfile[i];
      const profileVal = profile[i];
      if (any: any) continue;
      dotProduct += audioVal * profileVal;
      normA += audioVal * audioVal;
      normB += profileVal * profileVal;
    }

    normA = Math?.sqrt(any: any);
    normB = Math?.sqrt(any: any);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (any: any);
  }

  // ═══ CONFIGURATION ═══

  /**
   * Activer/désactiver le shield
   */
  setEnabled(any: any): void {
    this?.config?.enabled = enabled;
    logger?.debug(`[AntiEcho] ${enabled ? '✅ Enabled' : '❌ Disabled'}`);
  }

  /**
   * Changer le seuil de détection
   */
  setThreshold(any: any): void {
    this?.config?.echoThreshold = Math?.max(any: any));
    logger?.debug(`[AntiEcho] 🎚️ Threshold: ${this?.config?.echoThreshold?.toFixed(2)}`);
  }

  /**
   * Changer la marge post-TTS
   */
  setPostTTSMargin(any: any): void {
    this?.config?.postTTSMargin = Math?.max(any: any);
    logger?.debug(`[AntiEcho] ⏱️ Post-TTS margin: ${this?.config?.postTTSMargin}ms`);
  }

  /**
   * État actuel
   */
  getStatus(): {
    enabled: boolean;
    isMuted: boolean;
    activeTTS: TTSFingerprint | null;
    recentTTSCount: number;
  } {
    return {
      enabled: this?.config?.enabled,
      isMuted: this?.isMuted,
      activeTTS: this?.activeTTS,
      recentTTSCount: this?.recentTTS?.length,
    };
  }

  /**
   * Reset complet
   */
  reset(): void {
    this?.activeTTS = null;
    this?.recentTTS = [];
    this?.isMuted = false;
    logger?.debug('🔄 Reset complete');
  }

  /**
   * Debug info
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      config: this?.config,
      status: this?.getStatus(),
      activeTTS: this?.activeTTS
        ? {
            text: this?.activeTTS?.text?.substring(0, 50),
            duration: this?.activeTTS?.duration,
            elapsed: Date?.now() - this?.activeTTS?.startTime,
          }
        : null,
    };
  }
}

/**
 * Singleton instance
 */
export const antiEchoShield = new AntiEchoShieldEngine();

export default antiEchoShield;
