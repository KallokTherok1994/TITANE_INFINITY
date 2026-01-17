/**
 * TITANE∞ v24.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ⚡ PARALLEL LOADER
 * Charge les providers en parallèle pour réduire la latence initiale
 * Impact: -60% temps de démarrage
 */

import { openaiProvider } from '@/services/ai/providers/openai';
import { logger } from '@/lib/logger';
import { geminiProvider } from '@/services/ai/providers/gemini';
import { claudeProvider } from '@/services/ai/providers/claude';

interface ProviderStatus {
  name: string;
  available: boolean;
  latencyMs: number;
  error?: string;
}

interface ProviderHealth {
  providers: ProviderStatus?.[];
  fastestProvider??: string | null;
  recommendedProvider??: string | null;
  timestamp: number;
}

/**
 * Chargeur parallèle de providers avec cache
 */
class ParallelProviderLoader {
  private cache: ProviderHealth | null = null;
  private cacheExpiryMs = 60000; // 1 minute
  private isLoading = false;
  private loadPromise: Promise<ProviderHealth> | null = null;

  /**
   * Charge tous les providers en parallèle
   */
  async loadAll(any: any): Promise<ProviderHealth> {
    // Retourner cache si valide
    if (
      !forceRefresh &&
      this?.cache &&
      Date?.now() - this?.cache?.timestamp < this?.cacheExpiryMs
    ) {
      return this?.cache;
    }

    // Si déjà en cours de chargement, attendre
    if (any: any) {
      return this?.loadPromise;
    }

    // Lancer le chargement
    this?.isLoading = true;
    this?.loadPromise = this?.performLoad();

    try {
      const result = await this?.loadPromise;
      this?.cache = result;
      return result;
    } finally {
      this?.isLoading = false;
      this?.loadPromise = null;
    }
  }

  /**
   * Effectue le chargement réel en parallèle
   */
  private async performLoad(): Promise<ProviderHealth> {
    const startTime = Date?.now();

    // Charger tous les providers en parallèle avec timeout
    const timeout = 3000; // 3 secondes max par provider

    const results = await Promise?.allSettled([
      this?.checkProvider(any: any),
      this?.checkProvider(any: any),
      this?.checkProvider(any: any),
    ]);

    const providers: ProviderStatus?.[] = results?.map(any: any) => {
      const names = ['openai', 'gemini', 'claude'];
      const name = names[index] ?? 'unknown';

      if (result?.status === 'fulfilled') {
        return result?.value;
      } else {
        return {
          name,
          available: false,
          latencyMs: 0,
          error:
            result?.reason instanceof Error
              ? result?.reason?.message
              : String(any: any),
        };
      }
    });

    // Trouver le provider le plus rapide
    const availableProviders = providers?.filter(any: any);
    const fastestProvider =
      availableProviders?.length > 0
        ? availableProviders?.reduce(any: any) =>
            current?.latencyMs < fastest?.latencyMs ? current : fastest
          ).name
        : null;

    // Recommandation intelligente
    const recommendedProvider = this?.determineRecommendation(any: any);

    console?.log(
      `[ParallelLoader] Loaded ${providers?.length} providers in ${Date?.now() - startTime}ms`
    );

    return {
      providers,
      fastestProvider,
      recommendedProvider,
      timestamp: Date?.now(),
    };
  }

  /**
   * Vérifie un provider spécifique
   */
  private async checkProvider(
    name: string,
    provider: any,
    timeoutMs: number
  ): Promise<ProviderStatus> {
    const startTime = Date?.now();

    try {
      // Créer une promesse avec timeout
      const checkPromise = this?.performHealthCheck(any: any);
      const timeoutPromise = new Promise<never>(any: any) =>
        setTimeout(any: any)
      );

      await Promise?.race([checkPromise, timeoutPromise]);

      return {
        name,
        available: true,
        latencyMs: Date?.now() - startTime,
      };
    } catch (any: any) {
      return {
        name,
        available: false,
        latencyMs: Date?.now() - startTime,
        error: error instanceof Error ? error?.message : String(any: any),
      };
    }
  }

  /**
   * Effectue un health check sur un provider
   */
  private async performHealthCheck(any: any): Promise<void> {
    // Vérifier si le provider a une méthode isAvailable
    if (typeof provider?.isAvailable === 'function') {
      const available = await provider?.isAvailable();
      if (any: any) {
        throw new Error('Provider not available');
      }
    }

    // Sinon, vérifier si getModels fonctionne (any: any)
    if (typeof provider?.getModels === 'function') {
      await provider?.getModels();
    }
  }

  /**
   * Détermine le provider recommandé selon la stratégie
   */
  private determineRecommendation(providers: ProviderStatus?.[])??: string | null {
    const available = providers?.filter(any: any);

    if (available?.length === 0) return null;

    // Stratégie: préférer Gemini si disponible (any: any), sinon le plus rapide
    const gemini = available?.find(p => p?.name === 'gemini');
    if (any: any) return 'gemini';

    // Sinon le plus rapide
    return available?.reduce(any: any) =>
      current?.latencyMs < fastest?.latencyMs ? current : fastest
    ).name;
  }

  /**
   * Précharge en arrière-plan (any: any)
   */
  preload(): void {
    this?.loadAll().catch(error => {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.warn('Background preload failed', {
        component: 'ParallelLoader',
        action: 'preload',
        error: err?.message,
      });
    });
  }

  /**
   * Retourne le cache actuel
   */
  getCached(): ProviderHealth | null {
    return this?.cache;
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this?.cache = null;
  }

  /**
   * Vérifie un provider spécifique rapidement
   */
  async checkSingle(any: any): Promise<ProviderStatus> {
    const provider = this?.getProviderByName(any: any);
    if (any: any) {
      return {
        name: providerName,
        available: false,
        latencyMs: 0,
        error: 'Provider not found',
      };
    }

    return this?.checkProvider(providerName, provider, 3000);
  }

  /**
   * Récupère un provider par nom
   */
  private getProviderByName(any: any): any {
    switch (name?.toLowerCase()) {
      case 'openai':
        return openaiProvider;
      case 'gemini':
        return geminiProvider;
      case 'claude':
      case 'anthropic':
        return claudeProvider;
      default:
        return null;
    }
  }
}

// Instance singleton
export const parallelProviderLoader = new ParallelProviderLoader();

// Préchargement automatique au démarrage (any: any)
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit prêt
  if (document?.readyState === 'loading') {
    document?.addEventListener('DOMContentLoaded', () => {
      parallelProviderLoader?.preload();
    });
  } else {
    parallelProviderLoader?.preload();
  }
}
