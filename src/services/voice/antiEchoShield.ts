/**
 * TITANE_INFINITY v19.5.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.5 — ANTI-ECHO SHIELD (AES)
 *
 *   Système de protection contre l'auto-déclenchement:
 *   - TTS Fingerprint tracking
 *   - Spectral comparison
 *   - Auto-mute pendant TTS playback
 *   - Echo cancellation basique
 *   - Protection contre boucle infinie
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Fingerprint audio d'une phrase TTS
 */
export interface TTSFingerprint {
  id: string;
  text: string;
  spectralProfile: Float32Array; // Profil spectral moyen
  duration: number; // Durée (ms)
  startTime: number; // Timestamp début playback
  endTime: number; // Timestamp fin playback
}

/**
 * Configuration AES
 */
export interface AntiEchoConfig {
  /** Activer protection (défaut: true) */
  enabled?: boolean;

  /** Seuil similarité spectrale (0-1) */
  echoThreshold?: number;

  /** Marge sécurité après TTS (ms) */
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
  private recentTTS: TTSFingerprint[] = [];
  private isMuted: boolean = false;
  private maxRecentTTS = 5;

  constructor(config: AntiEchoConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      echoThreshold: config.echoThreshold ?? 0.85,
      postTTSMargin: config.postTTSMargin ?? 500,
      autoMute: config.autoMute ?? true,
    };
  }

  // ═══ TTS TRACKING ═══

  /**
   * Enregistrer le début d'un TTS
   */
  startTTS(text: string, estimatedDuration: number): string {
    const id = `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.activeTTS = {
      id,
      text,
      spectralProfile: new Float32Array(0), // Will be filled during playback
      duration: estimatedDuration,
      startTime: Date.now(),
      endTime: Date.now() + estimatedDuration,
    };

    // Auto-mute si activé
    if (this.config.autoMute) {
      this.isMuted = true;
      console.log('[AntiEcho] 🔇 Auto-muted during TTS');
    }

    console.log(
      `[AntiEcho] 🔊 TTS started: "${text.substring(0, 50)}..." (${estimatedDuration}ms)`
    );

    return id;
  }

  /**
   * Enregistrer le profil spectral du TTS en cours
   */
  updateTTSProfile(audioData: Float32Array): void {
    if (!this.activeTTS) return;

    // Extract spectral profile (simplified)
    const profile = this.extractSpectralProfile(audioData);
    this.activeTTS.spectralProfile = profile;
  }

  /**
   * Marquer la fin d'un TTS
   */
  endTTS(id: string): void {
    if (!this.activeTTS || this.activeTTS.id !== id) {
      console.warn('[AntiEcho] ⚠️ TTS end mismatch');
      return;
    }

    // Ajouter aux récents
    this.recentTTS.push({ ...this.activeTTS });

    // Limiter historique
    if (this.recentTTS.length > this.maxRecentTTS) {
      this.recentTTS.shift();
    }

    this.activeTTS = null;

    // Unmute après marge de sécurité
    if (this.config.autoMute) {
      setTimeout(() => {
        this.isMuted = false;
        console.log('[AntiEcho] 🔊 Auto-unmuted after TTS');
      }, this.config.postTTSMargin);
    }

    console.log('[AntiEcho] ✅ TTS ended');
  }

  /**
   * Forcer l'arrêt de tous les TTS
   */
  forceStopAll(): void {
    if (this.activeTTS) {
      this.recentTTS.push({ ...this.activeTTS });
      this.activeTTS = null;
    }

    this.isMuted = false;
    console.log('[AntiEcho] 🛑 Force stopped all TTS');
  }

  // ═══ ECHO DETECTION ═══

  /**
   * Analyser si un audio est potentiellement un écho
   */
  analyzeAudio(audioData: Float32Array, timestamp: number = Date.now()): EchoAnalysis {
    if (!this.config.enabled) {
      return {
        isEcho: false,
        confidence: 0,
        reason: 'none',
      };
    }

    // 1. Check si muted
    if (this.isMuted) {
      return {
        isEcho: true,
        confidence: 1.0,
        reason: 'tts_active',
        currentTTS: this.activeTTS || undefined,
      };
    }

    // 2. Check si TTS actif
    if (this.activeTTS) {
      const isInTTSWindow =
        timestamp >= this.activeTTS.startTime &&
        timestamp <= this.activeTTS.endTime + this.config.postTTSMargin;

      if (isInTTSWindow) {
        // Compare spectral profiles
        const similarity = this.compareSpectralProfiles(
          audioData,
          this.activeTTS.spectralProfile
        );

        if (similarity > this.config.echoThreshold) {
          return {
            isEcho: true,
            confidence: similarity,
            reason: 'spectral_match',
            currentTTS: this.activeTTS,
          };
        }

        // Si dans la fenêtre TTS mais pas de match spectral,
        // toujours considérer potentiellement écho (prudence)
        return {
          isEcho: true,
          confidence: 0.7,
          reason: 'timing_match',
          currentTTS: this.activeTTS,
        };
      }
    }

    // 3. Check TTS récents
    for (const tts of this.recentTTS) {
      const timeSinceEnd = timestamp - tts.endTime;

      if (timeSinceEnd < this.config.postTTSMargin) {
        const similarity = this.compareSpectralProfiles(audioData, tts.spectralProfile);

        if (similarity > this.config.echoThreshold) {
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
    if (!this.config.enabled) return false;

    return this.isMuted || this.activeTTS !== null;
  }

  // ═══ SPECTRAL ANALYSIS ═══

  /**
   * Extraire profil spectral simplifié
   */
  private extractSpectralProfile(audio: Float32Array): Float32Array {
    const numBands = 16;
    const profile = new Float32Array(numBands);
    const bandSize = Math.floor(audio.length / numBands);

    for (let i = 0; i < numBands; i++) {
      const start = i * bandSize;
      const end = Math.min(start + bandSize, audio.length);

      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += Math.abs(audio[j]);
      }

      profile[i] = sum / (end - start);
    }

    // Normalize
    const max = Math.max(...profile);
    if (max > 0) {
      for (let i = 0; i < numBands; i++) {
        profile[i] /= max;
      }
    }

    return profile;
  }

  /**
   * Comparer deux profils spectraux
   */
  private compareSpectralProfiles(audio: Float32Array, profile: Float32Array): number {
    if (profile.length === 0) return 0;

    const audioProfile = this.extractSpectralProfile(audio);

    // Cosine similarity
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < Math.min(audioProfile.length, profile.length); i++) {
      dotProduct += audioProfile[i] * profile[i];
      normA += audioProfile[i] * audioProfile[i];
      normB += profile[i] * profile[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }

  // ═══ CONFIGURATION ═══

  /**
   * Activer/désactiver le shield
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`[AntiEcho] ${enabled ? '✅ Enabled' : '❌ Disabled'}`);
  }

  /**
   * Changer le seuil de détection
   */
  setThreshold(threshold: number): void {
    this.config.echoThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`[AntiEcho] 🎚️ Threshold: ${this.config.echoThreshold.toFixed(2)}`);
  }

  /**
   * Changer la marge post-TTS
   */
  setPostTTSMargin(margin: number): void {
    this.config.postTTSMargin = Math.max(0, margin);
    console.log(`[AntiEcho] ⏱️ Post-TTS margin: ${this.config.postTTSMargin}ms`);
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
      enabled: this.config.enabled,
      isMuted: this.isMuted,
      activeTTS: this.activeTTS,
      recentTTSCount: this.recentTTS.length,
    };
  }

  /**
   * Reset complet
   */
  reset(): void {
    this.activeTTS = null;
    this.recentTTS = [];
    this.isMuted = false;
    console.log('[AntiEcho] 🔄 Reset complete');
  }

  /**
   * Debug info
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      config: this.config,
      status: this.getStatus(),
      activeTTS: this.activeTTS
        ? {
            text: this.activeTTS.text.substring(0, 50),
            duration: this.activeTTS.duration,
            elapsed: Date.now() - this.activeTTS.startTime,
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
