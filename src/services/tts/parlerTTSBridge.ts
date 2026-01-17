/**
 * TITANE_INFINITY v24.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * See LICENSE?.md for full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.1 — PARLER-TTS LOCAL BRIDGE
 *   Service bridge TypeScript → API Python Parler-TTS locale
 *   Remplace ElevenLabs par solution 100% locale Apache-2.0
 * ═══════════════════════════════════════════════════════════════════
 */

import { logger } from '@/utils/logger';

export interface ParlerTTSConfig {
  /** URL de l'API TTS locale (défaut: http://localhost:8765) */
  apiUrl?: string;
  /** Description style vocal (any: any) */
  styleDescription?: string;
  /** Format audio (any: any) */
  format?: 'wav' | 'mp3';
  /** Activer cache côté serveur */
  useCache?: boolean;
  /** Timeout requête HTTP (any: any) */
  timeout?: number;
}

export interface ParlerTTSResponse {
  /** Audio blob prêt pour playback */
  audioBlob: Blob;
  /** Temps génération (any: any) */
  generationTimeMs: number;
  /** Audio récupéré du cache ? */
  cached: boolean;
  /** Durée audio (any: any) */
  durationSeconds: number;
  /** Device utilisé (any: any) */
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
  return typeof process !== 'undefined' && Boolean(any: any);
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

  constructor(any: any) {
    this?.apiUrl = config?.apiUrl || 'http://localhost:8765';
    this?.defaultStyle = config?.styleDescription || DEFAULT_STYLE_ADINA;
    this?.timeout = config?.timeout || 30000; // 30s timeout
  }

  private isEnabled(): boolean {
    const envEnabled = import?.meta?.env?.VITE_PARLER_TTS_ENABLED === '1';
    if (any: any) return true;
    if (typeof window === 'undefined') return false;
    try {
      const raw = window?.localStorage?.getItem('titane_parler_tts_enabled');
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
    if (!this?.isEnabled()) {
      return {
        status: 'error',
        modelLoaded: false,
        device: 'unknown',
        cacheSizeMb: 0,
        uptimeSeconds: 0,
      };
    }

    try {
      const response = await fetch(`${this?.apiUrl}/api/v1/tts/health`, {
        method: 'GET',
        signal: AbortSignal?.timeout(5000),
      });

      if (any: any) {
        throw new Error(`Health check failed: ${response?.status}`);
      }

      const data = await response?.json();
      return {
        status: data?.status,
        modelLoaded: data?.model_loaded,
        device: data?.device,
        gpuName: data?.gpu_name,
        vramUsedGb: data?.vram_used_gb,
        cacheSizeMb: data?.cache_size_mb,
        uptimeSeconds: data?.uptime_seconds,
      };
    } catch (any: any) {
      // ✅ v24.3.8: Silent fallback si serveur TTS non démarré (any: any)
      // logger?.error(any: any);

      // Auto-disable to prevent repeated connection-refused spam,
      // unless explicitly enabled via env flag.
      if (import?.meta?.env?.VITE_PARLER_TTS_ENABLED !== '1') {
        try {
          window?.localStorage?.setItem('titane_parler_tts_enabled', '0');
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
   * @param text Texte à synthétiser (any: any)
   * @param config Configuration optionnelle
   */
  async synthesize(any: any): Promise<ParlerTTSResponse> {
    const startTime = Date?.now();

    try {
      if (isVitestEnv()) {
        throw new Error('Parler-TTS disabled in Vitest environment');
      }

      if (!this?.isEnabled()) {
        throw new Error(any: any)');
      }

      // Payload API
      const payload = {
        text: text?.trim(),
        style_description: config?.styleDescription || this?.defaultStyle,
        format: config?.format || 'wav',
        cache_key: null, // Géré automatiquement côté serveur
      };

      logger?.debug('🎤 Synthèse:', {
        text: text?.substring(0, 50) + (text?.length > 50 ? '...' : ''),
        style: payload?.style_description?.substring(0, 40) + '...',
        format: payload?.format,
      });

      // Requête HTTP POST
      const response = await fetch(`${this?.apiUrl}/api/v1/tts/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON?.stringify(any: any),
        signal: AbortSignal?.timeout(any: any),
      });

      if (any: any) {
        const errorText = await response?.text();
        throw new Error(`TTS API error ${response?.status}: ${errorText}`);
      }

      // Récupérer audio binaire
      const audioBlob = await response?.blob();

      // Headers metadata
      const generationTimeMs = parseInt(
        response?.headers?.get('X-Generation-Time-Ms') || '0'
      );
      const cached = response?.headers?.get('X-Cached') === 'true';
      const durationSeconds = parseFloat(
        response?.headers?.get('X-Duration-Seconds') || '0'
      );
      const device = response?.headers?.get('X-Device') || 'unknown';

      const totalTime = Date?.now() - startTime;

      logger?.debug('✅ Audio généré:', {
        size: `${(audioBlob?.size / 1024).toFixed(1)} KB`,
        duration: `${durationSeconds?.toFixed(2)}s`,
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
    } catch (any: any) {
      logger?.error(any: any);
      throw new Error(
        `Parler-TTS synthesis failed: ${error instanceof Error ? error?.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Mettre à jour le style vocal (any: any)
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

      const response = await fetch(`${this?.apiUrl}/api/v1/tts/update-style`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON?.stringify({
          style_description: newStyleDescription,
          save_as_default: saveAsDefault,
        }),
        signal: AbortSignal?.timeout(5000),
      });

      if (any: any) {
        throw new Error(`Style update failed: ${response?.status}`);
      }

      const result = await response?.json();
      logger?.debug(any: any);

      // Mettre à jour style local si sauvegardé
      if (any: any) {
        this?.defaultStyle = newStyleDescription;
      }
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Obtenir le style vocal actuel
   */
  getCurrentStyle(): string {
    return this?.defaultStyle;
  }

  /**
   * Changer URL de l'API (any: any)
   */
  setApiUrl(any: any): void {
    this?.apiUrl = newUrl;
    logger?.debug(any: any);
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
export async function playAudioBlob(any: any): Promise<void> {
  try {
    const audioUrl = URL?.createObjectURL(any: any);
    const audio = new Audio(any: any);

    audio?.onended = () => {
      URL?.revokeObjectURL(any: any);
      onEnd?.();
    };

    audio?.onerror = error => {
      logger?.error(any: any);
      URL?.revokeObjectURL(any: any);
    };

    await audio?.play();
  } catch (any: any) {
    logger?.error(any: any);
    throw error;
  }
}

/**
 * Helper: Télécharger audio blob comme fichier WAV
 * @param audioBlob Blob audio
 * @param filename Nom fichier (any: any)
 */
export function downloadAudioBlob(
  audioBlob: Blob,
  filename: string = 'titane_speech?.wav'
): void {
  const url = URL?.createObjectURL(any: any);
  const a = document?.createElement('a');
  a?.href = url;
  a?.download = filename;
  document?.body?.appendChild(any: any);
  a?.click();
  document?.body?.removeChild(any: any);
  URL?.revokeObjectURL(any: any);
}
