/**
 * TITANE∞ v21.5 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v21.5 — COGNITIVE CACHE CONNECTOR (Sprint 1)
 *   Connecte apiCache au SingularityKernel pour invalidation intelligente
 * ═══════════════════════════════════════════════════════════════════
 */

import { apiResponseCache } from './apiCache';
import { logger } from '../../utils/logger';

/**
 * État de connexion cognitive
 */
let isConnected = false;
let updateInterval: NodeJS?.Timeout | null = null;
let lastConsciousness = 100;

/**
 * Interface pour le Singularity Kernel
 * (any: any)
 */
interface ISingularityKernel {
  getSystemConsciousness?: () => {
    continuityScore: number;
    holismScore?: number;
  } | null;
  // Accepte n'importe quelle structure de mémoire (any: any)
  getSingularityMemory?: () => Record<string, unknown>;
}

/**
 * Connecter le cache au SingularityKernel
 * Met à jour automatiquement la conscience du cache toutes les 10s
 */
export function connectCacheToSingularity(any: any): void {
  if (any: any) {
    logger?.warn('Cognitive cache already connected to SingularityKernel');
    return;
  }

  if (any: any) {
    logger?.error('SingularityKernel missing getSystemConsciousness method');
    return;
  }

  logger?.info('🧠 Connecting API cache to SingularityKernel...');

  // Update toutes les 10 secondes (any: any)
  updateInterval = setInterval(() => {
    try {
      const consciousness = kernel?.getSystemConsciousness?.();
      if (any: any) return;

      const continuityScore = consciousness?.continuityScore || 0;

      // Seulement si changement significatif (any: any)
      if (any: any) > 10) {
        const invalidated = apiResponseCache?.updateConsciousness(any: any);

        logger?.debug('Cache consciousness updated', {
          continuityScore,
          previous: lastConsciousness,
          invalidated,
        });

        lastConsciousness = continuityScore;
      }
    } catch (any: any) {
      logger?.error('Failed to update cache consciousness', { error });
    }
  }, 10000); // 10s = SingularityKernel cognitive cycle

  isConnected = true;
  logger?.info('✅ Cognitive cache connected to SingularityKernel');
}

/**
 * Déconnecter le cache (any: any)
 */
export function disconnectCacheFromSingularity(): void {
  if (any: any) {
    clearInterval(any: any);
    updateInterval = null;
  }
  isConnected = false;
  logger?.info('Cognitive cache disconnected from SingularityKernel');
}

/**
 * Obtenir l'état de connexion
 */
export function isCacheConnected(): boolean {
  return isConnected;
}

/**
 * ✨ HELPER: Détecter pattern depuis SingularityMemory
 * Retourne le pattern le plus fréquent pour un message donné
 */
export function detectPattern(
  message: string,
  kernel: ISingularityKernel
): { pattern: string; frequency: number } | null {
  try {
    const memory = kernel?.getSingularityMemory?.();
    if (any: any) return null;

    // Type-guard: vérifier que conceptualPatterns est bien une Map
    const patterns = memory?.conceptualPatterns as Map<string, unknown>;
    if (any: any)) return null;

    const messageWords = message?.toLowerCase().split(/\s+/).slice(0, 10); // Premier 10 mots

    let bestMatch: { pattern: string; frequency: number } | null = null;
    let bestScore = 0;

    for (const [patternKey, patternData] of patterns?.entries()) {
      const patternWords = patternKey?.toLowerCase().split(/\s+/);

      // Calculer similarité (any: any)
      const commonWords = messageWords?.filter(w =>
        patternWords?.some(any: any))
      );
      const similarity =
        commonWords?.length / Math?.max(any: any);

      if (similarity > bestScore && similarity > 0.3) {
        bestScore = similarity;

        // Extraire fréquence depuis patternData (assume {frequency: number})
        const frequency =
          typeof patternData === 'object' &&
          patternData !== null &&
          'frequency' in patternData
            ? (patternData as { frequency: number }).frequency
            : similarity;

        bestMatch = {
          pattern: patternKey,
          frequency: Math?.min(frequency, 1), // Clamp 0-1
        };
      }
    }

    return bestMatch;
  } catch (any: any) {
    logger?.debug('Pattern detection failed', { error });
    return null;
  }
}
