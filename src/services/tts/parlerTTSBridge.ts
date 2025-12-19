/**
 * TITANE_INFINITY v24.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * See LICENSE.md for full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.1 — PARLER-TTS LOCAL BRIDGE
 *   Service bridge TypeScript → API Python Parler-TTS locale
 *   Remplace ElevenLabs par solution 100% locale Apache-2.0
 * ═══════════════════════════════════════════════════════════════════
 */

export interface ParlerTTSConfig {
  /** URL de l'API TTS locale (défaut: http://localhost:8765) */
  apiUrl?: string;
  /** Description style vocal (remplace voice_id ElevenLabs) */
  styleDescription?: string;
  /** Format audio (wav ou mp3) */
  format?: 'wav' | 'mp3';
  /** Activer cache côté serveur */
  useCache?: boolean;
  /** Timeout requête HTTP (ms) */
  timeout?: number;
}

export interface ParlerTTSResponse {
  /** Audio blob prêt pour playback */
  audioBlob: Blob;
  /** Temps génération (ms) */
  generationTimeMs: number;
  /** Audio récupéré du cache ? */
  cached: boolean;
  /** Durée audio (secondes) */
  durationSeconds: number;
  /** Device utilisé (cuda/cpu) */
  device: string;
}

export interface ParlerHealthStatus {
  status: 'healthy' | 'initializing' | 'error';
  modelLoaded: boolean;
  device: string;
  gpuName?: string;
  vramUsedGb?: number;
  cacheSizeMb: number;
  uptimeSeconds: number;
}

function isVitestEnv(): boolean {
  return typeof process !== 'undefined' && Boolean((process as any)?.env?.VITEST);
}

/**
 * Style vocal par défaut "Adina-like"
 * Modifiable dynamiquement via TITANE IA Chat
 */
const DEFAULT_STYLE_ADINA = `Une voix féminine française, chaleureuse et claire, avec une articulation précise et un rythme modéré, légèrement expressive et bienveillante.`;

/**
 * Service Bridge pour Parler-TTS Mini Multilingual v1.1
 */
class ParlerTTSBridge {
  private apiUrl: string;
  private defaultStyle: string;
  private timeout: number;

  constructor(config?: ParlerTTSConfig) {
    this.apiUrl = config?.apiUrl || 'http://localhost:8765';
    this.defaultStyle = config?.styleDescription || DEFAULT_STYLE_ADINA;
    this.timeout = config?.timeout || 30000; // 30s timeout
  }

  private isEnabled(): boolean {
    const envEnabled = import.meta.env.VITE_PARLER_TTS_ENABLED === '1';
    if (envEnabled) return true;
    if (typeof window === 'undefined') return false;
    try {
      const raw = window.localStorage.getItem('titane_parler_tts_enabled');
      return raw === '1' || raw === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Vérifier santé du service TTS
   */
  async healthCheck(): Promise<ParlerHealthStatus> {
    if (isVitestEnv()) {
      return {
        status: 'error',
        modelLoaded: false,
        device: 'unknown',
        cacheSizeMb: 0,
        uptimeSeconds: 0,
      };
    }

    // Opt-in only: avoid noisy localhost requests when the optional service isn't used.
    if (!this.isEnabled()) {
      return {
        status: 'error',
        modelLoaded: false,
        device: 'unknown',
        cacheSizeMb: 0,
        uptimeSeconds: 0,
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/tts/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: data.status,
        modelLoaded: data.model_loaded,
        device: data.device,
        gpuName: data.gpu_name,
        vramUsedGb: data.vram_used_gb,
        cacheSizeMb: data.cache_size_mb,
        uptimeSeconds: data.uptime_seconds,
      };
    } catch (error) {
      // ✅ v24.3.8: Silent fallback si serveur TTS non démarré (optionnel)
      // console.error('[ParlerTTS] Health check error:', error);

      // Auto-disable to prevent repeated connection-refused spam,
      // unless explicitly enabled via env flag.
      if (import.meta.env.VITE_PARLER_TTS_ENABLED !== '1') {
        try {
          window.localStorage.setItem('titane_parler_tts_enabled', '0');
        } catch {
          // ignore
        }
      }

      return {
        status: 'error',
        modelLoaded: false,
        device: 'unknown',
        cacheSizeMb: 0,
        uptimeSeconds: 0,
      };
    }
  }

  /**
   * Synthétiser texte → audio WAV
   * @param text Texte à synthétiser (français)
   * @param config Configuration optionnelle
   */
  async synthesize(text: string, config?: ParlerTTSConfig): Promise<ParlerTTSResponse> {
    const startTime = Date.now();

    try {
      if (isVitestEnv()) {
        throw new Error('Parler-TTS disabled in Vitest environment');
      }

      if (!this.isEnabled()) {
        throw new Error('Parler-TTS disabled (opt-in)');
      }

      // Payload API
      const payload = {
        text: text.trim(),
        style_description: config?.styleDescription || this.defaultStyle,
        format: config?.format || 'wav',
        cache_key: null, // Géré automatiquement côté serveur
      };

      console.log('[ParlerTTS] 🎤 Synthèse:', {
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        style: payload.style_description.substring(0, 40) + '...',
        format: payload.format,
      });

      // Requête HTTP POST
      const response = await fetch(`${this.apiUrl}/api/v1/tts/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API error ${response.status}: ${errorText}`);
      }

      // Récupérer audio binaire
      const audioBlob = await response.blob();

      // Headers metadata
      const generationTimeMs = parseInt(
        response.headers.get('X-Generation-Time-Ms') || '0'
      );
      const cached = response.headers.get('X-Cached') === 'true';
      const durationSeconds = parseFloat(
        response.headers.get('X-Duration-Seconds') || '0'
      );
      const device = response.headers.get('X-Device') || 'unknown';

      const totalTime = Date.now() - startTime;

      console.log('[ParlerTTS] ✅ Audio généré:', {
        size: `${(audioBlob.size / 1024).toFixed(1)} KB`,
        duration: `${durationSeconds.toFixed(2)}s`,
        generationTime: `${generationTimeMs}ms`,
        totalTime: `${totalTime}ms`,
        cached,
        device,
      });

      return {
        audioBlob,
        generationTimeMs,
        cached,
        durationSeconds,
        device,
      };
    } catch (error) {
      console.error('[ParlerTTS] ❌ Erreur synthèse:', error);
      throw new Error(
        `Parler-TTS synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Mettre à jour le style vocal (appelé par TITANE IA)
   * @param newStyleDescription Nouvelle description style
   * @param saveAsDefault Sauvegarder comme défaut permanent ?
   */
  async updateVoiceStyle(
    newStyleDescription: string,
    saveAsDefault: boolean = false
  ): Promise<void> {
    try {
      if (isVitestEnv()) {
        throw new Error('Parler-TTS disabled in Vitest environment');
      }

      const response = await fetch(`${this.apiUrl}/api/v1/tts/update-style`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          style_description: newStyleDescription,
          save_as_default: saveAsDefault,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Style update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('[ParlerTTS] ✅ Style vocal mis à jour:', result);

      // Mettre à jour style local si sauvegardé
      if (saveAsDefault) {
        this.defaultStyle = newStyleDescription;
      }
    } catch (error) {
      console.error('[ParlerTTS] ❌ Erreur update style:', error);
      throw error;
    }
  }

  /**
   * Obtenir le style vocal actuel
   */
  getCurrentStyle(): string {
    return this.defaultStyle;
  }

  /**
   * Changer URL de l'API (pour tests ou deployment custom)
   */
  setApiUrl(newUrl: string): void {
    this.apiUrl = newUrl;
    console.log('[ParlerTTS] API URL updated:', newUrl);
  }
}

/**
 * Instance singleton
 */
export const parlerTTSBridge = new ParlerTTSBridge();

/**
 * Helper: Jouer audio blob via Web Audio API
 * @param audioBlob Blob audio retourné par synthesize()
 * @param onEnd Callback fin de lecture
 */
export async function playAudioBlob(audioBlob: Blob, onEnd?: () => void): Promise<void> {
  try {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      onEnd?.();
    };

    audio.onerror = error => {
      console.error('[ParlerTTS] Audio playback error:', error);
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();
  } catch (error) {
    console.error('[ParlerTTS] Failed to play audio:', error);
    throw error;
  }
}

/**
 * Helper: Télécharger audio blob comme fichier WAV
 * @param audioBlob Blob audio
 * @param filename Nom fichier (défaut: titane_speech.wav)
 */
export function downloadAudioBlob(
  audioBlob: Blob,
  filename: string = 'titane_speech.wav'
): void {
  const url = URL.createObjectURL(audioBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
