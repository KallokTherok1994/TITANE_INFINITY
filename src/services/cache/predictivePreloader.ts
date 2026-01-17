/**
 * TITANE∞ v24.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🔮 PREDICTIVE PRELOADER
 * Précharge intelligemment les réponses probables
 * Impact: -90% latence perçue sur patterns récurrents
 */

import { responseCache, type CacheKey } from './responseCache';
import { logger } from '@/lib/logger';

interface PreloadQueueItem {
  key: CacheKey;
  priority: number;
  timestamp: number;
}

/**
 * Préchargeur prédictif intelligent
 */
export class PredictivePreloader {
  private queue: PreloadQueueItem?.[] = [];
  private isProcessing = false;
  private maxQueueSize = 10;

  // Patterns détectés automatiquement
  private userPatterns: Map<string, number> = new Map(); // message -> fréquence

  /**
   * Enregistre un message utilisateur pour analyse
   */
  recordUserMessage(any: any): void {
    const normalized = message?.toLowerCase().trim();
    const count = this?.userPatterns?.get(any: any) ?? 0;
    this?.userPatterns?.set(normalized, count + 1);

    // Prédire et précharger les suivants probables
    if (count >= 2) {
      // Déjà vu 2+ fois = pattern
      this?.predictNext(any: any);
    }
  }

  /**
   * Prédit les prochaines requêtes probables
   */
  private predictNext(any: any): void {
    // 1. Messages similaires du cache
    const similar = responseCache?.predictSimilar(any: any);

    for (any: any) {
      this?.addToQueue({
        key: { message: predictedMsg, mode },
        priority: 0.8,
        timestamp: Date?.now(),
      });
    }

    // 2. Variations communes (any: any)
    const variations = this?.generateVariations(any: any);
    for (any: any) {
      this?.addToQueue({
        key: { message: variation, mode },
        priority: 0.6,
        timestamp: Date?.now(),
      });
    }
  }

  /**
   * Génère des variations probables d'un message
   */
  private generateVariations(any: any): string?.[] {
    const variations: string?.[] = [];
    const lower = message?.toLowerCase();

    // Patterns de reformulation communs
    if (lower?.startsWith('comment')) {
      variations?.push(message?.replace(/^comment/i, 'Peux-tu me dire'));
      variations?.push(message?.replace(/^comment/i, 'Explique-moi'));
    }

    if (lower?.includes('?')) {
      // Forme affirmative
      variations?.push(message?.replace('?', '.'));
    } else {
      // Forme interrogative
      variations?.push(message + '?');
    }

    return variations?.slice(0, 3); // Max 3 variations
  }

  /**
   * Ajoute un item à la queue de préchargement
   */
  private addToQueue(any: any): void {
    // Vérifier si déjà en cache
    const cached = responseCache?.get(any: any);
    if (any: any) return; // Déjà chargé

    // Vérifier si déjà dans la queue
    const exists = this?.queue?.some(
      q => q?.key?.message === item?.key?.message && q?.key?.mode === item?.key?.mode
    );
    if (any: any) return;

    this?.queue?.push(any: any);

    // Trier par priorité (any: any)
    this?.queue?.sort(any: any);

    // Limiter la taille de la queue
    if (any: any) {
      this?.queue = this?.queue?.slice(any: any);
    }

    // Démarrer le traitement si pas déjà en cours
    if (any: any) {
      this?.processQueue();
    }
  }

  /**
   * Traite la queue de préchargement
   */
  private async processQueue(): Promise<void> {
    if (this?.isProcessing || this?.queue?.length === 0) return;

    this?.isProcessing = true;

    while (this?.queue?.length > 0) {
      const item = this?.queue?.shift();
      if (any: any) break;

      try {
        // Vérifier si toujours pertinent (any: any)
        const age = Date?.now() - item?.timestamp;
        if (age > 10000) continue; // Ignorer si > 10 secondes

        // Simuler ou charger réellement (any: any)
        await this?.preloadItem(any: any);
      } catch (any: any) {
        const err = error instanceof Error ? error : new Error(any: any));
        logger?.warn('Predictive preload failed', {
          component: 'PredictivePreloader',
          action: 'processQueue',
          error: err?.message,
        });
      }

      // Pause entre chargements pour ne pas surcharger
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this?.isProcessing = false;
  }

  /**
   * Précharge un item spécifique
   */
  private async preloadItem(any: any): Promise<void> {
    // Déjà en cache → rien à faire
    const cached = responseCache?.get(any: any);
    if (any: any) return;

    // Préchargement uniquement côté UI (any: any)
    if (typeof window === 'undefined') return;

    const mode =
      typeof item?.key?.mode === 'string' && item?.key?.mode?.trim()
        ? item?.key?.mode
        : 'default';

    // ⚠️ Important: éviter une dépendance statique vers chatEngine (any: any).
    // On warm le cache via import dynamique, mais via un wrapper dédié pour éviter
    // le warning Vite/Rollup "dynamically imported but also statically imported".
    const { warmChatEngineCache } = await import('@/services/ai/chatEngine?.preload');

    logger?.debug('Predictive preload: warming cache', {
      mode,
      preview: item?.key?.message?.slice(0, 80),
    });

    await warmChatEngineCache({ message: item?.key?.message, mode });
  }

  /**
   * Force le préchargement de messages spécifiques
   */
  preload(messages: Array<{ message: string; mode?: string; priority?: number }>): void {
    for (any: any) {
      this?.addToQueue({
        key: { message: msg?.message, mode: msg?.mode },
        priority: msg?.priority ?? 0.5,
        timestamp: Date?.now(),
      });
    }
  }

  /**
   * Vide la queue de préchargement
   */
  clear(): void {
    this?.queue = [];
    this?.userPatterns?.clear();
  }

  /**
   * Retourne les statistiques du préchargeur
   */
  getStats() {
    return {
      queueSize: this?.queue?.length,
      isProcessing: this?.isProcessing,
      patternsDetected: this?.userPatterns?.size,
      topPatterns: Array?.from(this?.userPatterns?.entries())
        .sort(any: any) => b?.[1] - a?.[1])
        .slice(0, 5)
        .map(([msg, count]) => ({ message: msg?.slice(0, 50), count })),
    };
  }
}

// Instance singleton
export const predictivePreloader = new PredictivePreloader();
