/**
 * TITANE∞ v26.3.0 — Enhanced Lazy Import System
 * © 2025 TITANE Team. All rights reserved.
 *
 * 🚀 SYSTÈME DE CHARGEMENT LAZY AVANCÉ
 * Intégration complète : diagnostic + monitoring + performance + cache
 */

import React from 'react';
import { integrateWithLazyDiagnostic } from './advancedBootMonitor';
import { performanceOptimizer, optimizedImport } from './performanceOptimizer';

// Intégration avec le système de monitoring avancé
const monitoringIntegration = integrateWithLazyDiagnostic();

interface EnhancedLazyOptions {
  timeout?: number;
  retries?: number;
  fallback?: React.ComponentType;
  preload?: boolean;
  cacheKey?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  enableMetrics?: boolean;
}

interface LazyLoadResult<T extends React.ComponentType<any>> {
  component: React.LazyExoticComponent<T>;
  preloader: () => Promise<void>;
  getCacheInfo: () => CacheInfo | null;
}

interface CacheInfo {
  key: string;
  hitCount: number;
  lastAccess: number;
  loadTime: number;
}

interface DetailedDiagnosticInfo {
  moduleName: string;
  loadTime: number;
  timestamp: number;
  success: boolean;
  error?: Error;
  retryAttempt?: number;
  cacheHit?: boolean;
  networkCondition?: string;
  memoryUsage?: number;
  criticalPath?: boolean;
}

/**
 * Système de chargement lazy avancé avec toutes les optimisations
 */
export const createEnhancedLazyComponent = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  moduleName: string,
  options: EnhancedLazyOptions = {}
): LazyLoadResult<T> => {
  const {
    timeout = 10000,
    retries = 3,
    cacheKey,
    priority = 'medium',
    enableMetrics = true,
    preload = false,
  } = options;

  const finalCacheKey = cacheKey || `enhanced-lazy:${moduleName}`;

  // Composant lazy avec tous les systèmes intégrés
  const lazyComponent = React.lazy(async () => {
    console.log(`[ENHANCED-LAZY] 🚀 Loading: ${moduleName} (priority: ${priority})`);

    if (enableMetrics) {
      monitoringIntegration.recordStart();
    }

    let retryCount = 0;
    const maxRetries = retries;
    let lastError: Error | null = null;

    // Vérifier le cache optimisé d'abord
    const cached = performanceOptimizer.getCachedResource(finalCacheKey);
    if (cached) {
      console.log(`[ENHANCED-LAZY] 💾 Cache hit: ${moduleName}`);

      if (enableMetrics) {
        monitoringIntegration.recordSuccess(moduleName, 0);
        recordDetailedDiagnostic({
          moduleName,
          loadTime: 0,
          timestamp: Date.now(),
          success: true,
          cacheHit: true,
          criticalPath: priority === 'critical',
        });
      }

      return cached;
    }

    // Boucle de retry avec backoff intelligent
    while (retryCount <= maxRetries) {
      try {
        const startTime = performance.now();

        // Promise avec timeout
        const loadPromise = optimizedImport(factory, finalCacheKey);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Timeout loading ${moduleName} after ${timeout}ms`)),
            timeout
          );
        });

        const moduleResult = await Promise.race([loadPromise, timeoutPromise]);
        const loadTime = performance.now() - startTime;

        // Métriques de succès
        if (enableMetrics) {
          monitoringIntegration.recordSuccess(moduleName, loadTime);
          performanceOptimizer.recordBenchmark('enhanced_lazy_import', loadTime, {
            module: moduleName,
            priority,
            retryAttempt: retryCount,
          });

          recordDetailedDiagnostic({
            moduleName,
            loadTime,
            timestamp: Date.now(),
            success: true,
            retryAttempt: retryCount,
            cacheHit: false,
            criticalPath: priority === 'critical',
            networkCondition: getNetworkCondition(),
            memoryUsage: getMemoryUsage(),
          });
        }

        // Mise en cache avec priorité appropriée
        performanceOptimizer.cacheResource(finalCacheKey, moduleResult, priority);

        console.log(
          `[ENHANCED-LAZY] ✅ Success: ${moduleName} in ${loadTime.toFixed(2)}ms (attempt: ${retryCount + 1})`
        );
        return moduleResult;
      } catch (error) {
        retryCount++;
        lastError = error as Error;

        console.error(
          `[ENHANCED-LAZY] ❌ Attempt ${retryCount} failed for ${moduleName}:`,
          lastError.message
        );

        if (enableMetrics) {
          monitoringIntegration.recordFailure(moduleName, lastError);
        }

        if (retryCount > maxRetries) {
          // Diagnostic final d'échec
          if (enableMetrics) {
            recordDetailedDiagnostic({
              moduleName,
              loadTime: 0,
              timestamp: Date.now(),
              success: false,
              error: lastError,
              retryAttempt: retryCount - 1,
              criticalPath: priority === 'critical',
            });

            monitoringIntegration.recordEnd(false);
          }

          console.error(
            `[ENHANCED-LAZY] 💥 Final failure for ${moduleName} after ${retryCount - 1} retries`
          );

          // Si c'est un module critique, essayer une stratégie de fallback
          if (priority === 'critical') {
            return await attemptCriticalFallback(moduleName, lastError);
          }

          throw lastError;
        }

        // Backoff exponentiel adaptatif
        const backoffTime = calculateAdaptiveBackoff(retryCount, priority);
        await new Promise(resolve => setTimeout(resolve, backoffTime));

        console.log(
          `[ENHANCED-LAZY] 🔄 Retrying ${moduleName} in ${backoffTime}ms (attempt ${retryCount + 1})`
        );
      }
    }

    // Cette ligne ne devrait jamais être atteinte
    throw lastError || new Error(`[ENHANCED-LAZY] Unexpected failure for ${moduleName}`);
  });

  // Fonction de préchargement
  const preloader = async (): Promise<void> => {
    try {
      console.log(`[ENHANCED-LAZY] 🎯 Preloading: ${moduleName}`);
      const startTime = performance.now();

      const moduleResult = await optimizedImport(factory, finalCacheKey);
      const loadTime = performance.now() - startTime;

      performanceOptimizer.cacheResource(finalCacheKey, moduleResult, priority);
      console.log(
        `[ENHANCED-LAZY] ✅ Preloaded: ${moduleName} in ${loadTime.toFixed(2)}ms`
      );
    } catch (error) {
      console.warn(`[ENHANCED-LAZY] ⚠️ Preload failed for ${moduleName}:`, error);
    }
  };

  // Fonction pour obtenir les infos de cache
  const getCacheInfo = (): CacheInfo | null => {
    const cached = performanceOptimizer.getCachedResource(finalCacheKey);
    if (!cached) return null;

    return {
      key: finalCacheKey,
      hitCount: cached.hitCount || 0,
      lastAccess: cached.lastAccess || 0,
      loadTime: cached.loadTime || 0,
    };
  };

  // Auto-preload si demandé
  if (preload) {
    // Précharger au prochain tick pour éviter de bloquer le thread principal
    setTimeout(() => {
      preloader().catch(err =>
        console.warn(`Auto-preload failed for ${moduleName}:`, err)
      );
    }, 100);
  }

  return {
    component: lazyComponent as any,
    preloader,
    getCacheInfo,
  };
};

/**
 * Fonction simplifiée pour maintenir la compatibilité
 */
export const lazyWithAdvancedDiagnostic = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  moduleName: string,
  options: EnhancedLazyOptions = {}
): React.LazyExoticComponent<T> => {
  return createEnhancedLazyComponent(factory, moduleName, options).component;
};

/**
 * Tentative de fallback pour les modules critiques
 */
async function attemptCriticalFallback<T>(
  moduleName: string,
  originalError: Error
): Promise<{ default: T }> {
  console.log(`[ENHANCED-LAZY] 🆘 Attempting critical fallback for ${moduleName}`);

  try {
    // Stratégie 1: Forcer la recréation du composant
    await new Promise(resolve => setTimeout(resolve, 500));

    // Stratégie 2: Nettoyer tous les caches liés à ce module
    const cacheKeys = [
      `enhanced-lazy:${moduleName}`,
      `lazy:${moduleName}`,
      `preload:${moduleName}`,
    ];
    cacheKeys.forEach(key => {
      performanceOptimizer.getCachedResource(key); // Cela va potentiellement nettoyer le cache expiré
    });

    // Stratégie 3: Retourner un composant d'erreur fonctionnel
    const ErrorComponent = () =>
      React.createElement(
        'div',
        {
          style: {
            padding: '20px',
            margin: '10px',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: '#ffe0e0',
            color: '#d63031',
            textAlign: 'center' as const,
          },
        },
        [
          React.createElement('h3', { key: 'title' }, `⚠️ Module Error: ${moduleName}`),
          React.createElement(
            'p',
            { key: 'message' },
            'This component failed to load. Please refresh the page.'
          ),
          React.createElement('details', { key: 'details' }, [
            React.createElement('summary', { key: 'summary' }, 'Error Details'),
            React.createElement(
              'pre',
              {
                key: 'error',
                style: {
                  fontSize: '12px',
                  textAlign: 'left' as const,
                  marginTop: '10px',
                },
              },
              originalError.message
            ),
          ]),
        ]
      );

    return { default: ErrorComponent as T };
  } catch (fallbackError) {
    console.error(
      `[ENHANCED-LAZY] 💥 Critical fallback also failed for ${moduleName}:`,
      fallbackError
    );
    throw originalError; // Retourner l'erreur originale
  }
}

/**
 * Calcule un backoff adaptatif selon la priorité et les conditions
 */
function calculateAdaptiveBackoff(
  retryCount: number,
  priority: EnhancedLazyOptions['priority']
): number {
  const basePriority =
    priority === 'critical'
      ? 0.5
      : priority === 'high'
        ? 1
        : priority === 'medium'
          ? 1.5
          : 2;

  const networkMultiplier = getNetworkCondition() === 'slow' ? 2 : 1;
  const baseDelay = 500 * basePriority * networkMultiplier;

  return Math.min(baseDelay * Math.pow(1.5, retryCount - 1), 10000);
}

/**
 * Obtient la condition réseau actuelle
 */
function getNetworkCondition(): string {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown';
  }

  const connection = (navigator as any).connection;
  if (!connection) return 'unknown';

  const effectiveType = connection.effectiveType || 'unknown';

  return ['slow-2g', '2g'].includes(effectiveType)
    ? 'slow'
    : ['3g'].includes(effectiveType)
      ? 'medium'
      : 'fast';
}

/**
 * Obtient l'usage mémoire actuel
 */
function getMemoryUsage(): number {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return 0;
  }

  const memory = (window.performance as any).memory;
  return memory ? memory.usedJSHeapSize / 1024 / 1024 : 0; // MB
}

/**
 * Enregistre des diagnostics détaillés
 */
function recordDetailedDiagnostic(info: DetailedDiagnosticInfo): void {
  console.log(`[ENHANCED-LAZY-METRICS] 📊`, {
    module: info.moduleName,
    success: info.success,
    loadTime: `${info.loadTime.toFixed(2)}ms`,
    cacheHit: info.cacheHit,
    retries: info.retryAttempt,
    network: info.networkCondition,
    memory: info.memoryUsage ? `${info.memoryUsage.toFixed(1)}MB` : 'unknown',
    critical: info.criticalPath,
    timestamp: new Date(info.timestamp).toISOString(),
  });

  // Envoyer à un système d'analytics si configuré
  if (typeof window !== 'undefined' && (window as any).TITANE_ANALYTICS) {
    try {
      (window as any).TITANE_ANALYTICS.track('lazy_load_diagnostic', info);
    } catch (error) {
      console.warn('Failed to send analytics:', error);
    }
  }
}

/**
 * Utilitaire pour précharger plusieurs modules en parallèle
 */
export const preloadModules = async (
  modules: Array<{
    factory: () => Promise<any>;
    name: string;
    priority?: EnhancedLazyOptions['priority'];
  }>
): Promise<void> => {
  console.log(`[ENHANCED-LAZY] 🎯 Batch preloading ${modules.length} modules`);

  const preloadPromises = modules.map(async ({ factory, name, priority = 'medium' }) => {
    try {
      const { preloader } = createEnhancedLazyComponent(factory, name, {
        priority,
        preload: false,
      });
      await preloader();
    } catch (error) {
      console.warn(`[ENHANCED-LAZY] Preload failed for ${name}:`, error);
    }
  });

  await Promise.allSettled(preloadPromises);
  console.log(`[ENHANCED-LAZY] ✅ Batch preload completed`);
};

// Export pour compatibilité avec le système existant
export { lazyWithDiagnostic } from './lazyImportDiagnostic';

// Export par défaut
export default {
  createEnhancedLazyComponent,
  lazyWithAdvancedDiagnostic,
  preloadModules,
};
