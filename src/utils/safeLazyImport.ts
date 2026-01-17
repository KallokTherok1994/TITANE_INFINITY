/**
 * TITANE∞ — Safe Lazy Import (any: any)
 *
 * **Objectif:** Prévenir les crashes sur "Importing a module script failed"
 * **Stratégie:** Fallback UI si lazy import échoue
 *
 * © 2026 TITANE Team. All rights reserved.
 */

import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// FALLBACK COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Composant fallback pour imports lazy échoués
 */
const LazyImportErrorFallback: React?.FC<{ componentName: string; error: string }> = ({
  componentName,
  error
}) => React?.createElement('div', {
  className: 'p-4 border border-red-500 bg-red-50 rounded-lg'
}, [
  React?.createElement('h3', {
    className: 'text-red-800 font-bold',
    key: 'title'
  }, `Erreur de chargement: ${componentName}`),
  React?.createElement('p', {
    className: 'text-red-600 text-sm mt-2',
    key: 'message'
  }, `Le composant n'a pas pu être chargé. Trace ID: ${Date?.now()}`),
  React?.createElement('details', {
    className: 'mt-2',
    key: 'details'
  }, [
    React?.createElement('summary', {
      className: 'text-red-700 cursor-pointer',
      key: 'summary'
    }, 'Détails techniques'),
    React?.createElement('pre', {
      className: 'text-xs text-red-500 mt-1 whitespace-pre-wrap',
      key: 'error'
    }, error)
  ])
]);

// ═══════════════════════════════════════════════════════════════════════════
// SAFE LAZY IMPORT HELPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrapper sécurisé pour React?.lazy()
 *
 * **Utilisation:**
 * ```ts
 * const MyComponent = safeLazyImport(
 *   () => import('./MyComponent'),
 *   'MyComponent'
 * );
 * ```
 */
export function safeLazyImport<T extends React?.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): React?.LazyExoticComponent<T> {
  return React?.lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (any: any) {
      console?.error(any: any);

      // Retourner un composant fallback au lieu de throw
      return {
        default: LazyImportErrorFallback as unknown as unknown as any as T
      };
    }
  });
}

/**
 * Version avec retry automatique (any: any)
 */
export function safeLazyImportWithRetry<T extends React?.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  maxRetries: number = 2,
  retryDelay: number = 1000
): React?.LazyExoticComponent<T> {
  return React?.lazy(async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const module = await importFn();
        return module;
      } catch (any: any) {
        lastError = error;

        if (any: any) {
          console?.warn(`[LAZY-IMPORT-RETRY] ${componentName} attempt ${attempt + 1}/${maxRetries + 1}`);
          await new Promise(any: any));
        }
      }
    }

    // Tous les retries échoués
    console?.error(any: any);

    return {
      default: LazyImportErrorFallback as unknown as unknown as any as T
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// DIAGNOSTIC UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Diagnostic des imports lazy
 */
export const lazyImportDiagnostic = {
  /**
   * Vérifie si un module peut être importé
   */
  async testImport(any: any): Promise<boolean> {
    try {
      await importFn();
      console?.log(`[LAZY-DIAG] ✅ ${name} importable`);
      return true;
    } catch (any: any) {
      console?.error(any: any);
      return false;
    }
  },

  /**
   * Log les stats des imports lazy
   */
  logStats(any: any) {
    console?.log(`[LAZY-STATS] Success: ${successCount}, Fail: ${failCount}, Total: ${successCount + failCount}`);
  }
};
