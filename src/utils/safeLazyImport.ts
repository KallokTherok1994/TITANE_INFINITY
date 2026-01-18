/**
 * TITANE∞ — Safe Lazy Import (FIX P0)
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
const LazyImportErrorFallback: React.FC<{ componentName: string; error: string }> = ({
  componentName,
  error,
}) =>
  React.createElement(
    'div',
    {
      className: 'p-4 border border-red-500 bg-red-50 rounded-lg',
    },
    [
      React.createElement(
        'h3',
        {
          className: 'text-red-800 font-bold',
          key: 'title',
        },
        `Erreur de chargement: ${componentName}`
      ),
      React.createElement(
        'p',
        {
          className: 'text-red-600 text-sm mt-2',
          key: 'message',
        },
        `Le composant n'a pas pu être chargé. Trace ID: ${Date.now()}`
      ),
      React.createElement(
        'details',
        {
          className: 'mt-2',
          key: 'details',
        },
        [
          React.createElement(
            'summary',
            {
              className: 'text-red-700 cursor-pointer',
              key: 'summary',
            },
            'Détails techniques'
          ),
          React.createElement(
            'pre',
            {
              className: 'text-xs text-red-500 mt-1 whitespace-pre-wrap',
              key: 'error',
            },
            error
          ),
        ]
      ),
    ]
  );

// ═══════════════════════════════════════════════════════════════════════════
// SAFE LAZY IMPORT HELPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrapper sécurisé pour React.lazy()
 *
 * **Utilisation:**
 * ```ts
 * const MyComponent = safeLazyImport(
 *   () => import('./MyComponent'),
 *   'MyComponent'
 * );
 * ```
 */
export function safeLazyImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error(`[LAZY-IMPORT-FAIL] ${componentName}:`, error);

      // Retourner un composant fallback au lieu de throw
      return {
        default: LazyImportErrorFallback as any as T,
      };
    }
  });
}

/**
 * Version avec retry automatique (optionnel)
 */
export function safeLazyImportWithRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  maxRetries: number = 2,
  retryDelay: number = 1000
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const module = await importFn();
        return module;
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          console.warn(
            `[LAZY-IMPORT-RETRY] ${componentName} attempt ${attempt + 1}/${maxRetries + 1}`
          );
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    // Tous les retries échoués
    console.error(
      `[LAZY-IMPORT-FAIL] ${componentName} after ${maxRetries + 1} attempts:`,
      lastError
    );

    return {
      default: LazyImportErrorFallback as any as T,
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
  async testImport(importFn: () => Promise<any>, name: string): Promise<boolean> {
    try {
      await importFn();
      console.log(`[LAZY-DIAG] ✅ ${name} importable`);
      return true;
    } catch (error) {
      console.error(`[LAZY-DIAG] ❌ ${name} non importable:`, error);
      return false;
    }
  },

  /**
   * Log les stats des imports lazy
   */
  logStats(successCount: number, failCount: number) {
    console.log(
      `[LAZY-STATS] Success: ${successCount}, Fail: ${failCount}, Total: ${successCount + failCount}`
    );
  },
};
