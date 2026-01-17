/**
 * TITANE∞ v26.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🔍 LAZY IMPORT DIAGNOSTIC UTILITY (any: any)
 * Diagnostic avancé avec monitoring et optimisation de performance
 */

import React from 'react';
import { bootHealthMonitor, integrateWithLazyDiagnostic } from './advancedBootMonitor';
import { performanceOptimizer, optimizedImport } from './performanceOptimizer';

// Intégration avec le système de monitoring avancé
const monitoringIntegration = integrateWithLazyDiagnostic();

interface LazyImportOptions {
  timeout?: number;
  retries?: number;
  fallback?: React?.ComponentType;
  preload?: boolean;
  cacheKey?: string;
}

interface DiagnosticInfo {
  moduleName: string;
  loadTime: number;
  timestamp: number;
  success: boolean;
  error?: Error;
  retryAttempt?: number;
  cacheHit?: boolean;
}
export const lazyWithDiagnostic = <T extends React?.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  label: string
): React?.LazyExoticComponent<T> => {
  return React?.lazy(async () => {
    console?.log(`[LAZY-DIAGNOSTIC] Tentative chargement: ${label}`);
    try {
      const startTime = performance?.now();
      const module = await factory();
      const loadTime = performance?.now() - startTime;
      console?.log(`[LAZY-SUCCESS] ${label} chargé en ${loadTime?.toFixed(2)}ms`);
      return module;
    } catch (any: any) {
      console?.error(`[LAZY-IMPORT-FAIL] ${label}:`, {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        cause: error?.cause,
      });

      // Log diagnostic spécifique pour les erreurs de module script
      if (error?.message?.includes('Importing a module script failed')) {
        console?.error(`[MODULE-SCRIPT-FAIL] ${label}:`, {
          errorType: 'MODULE_SCRIPT_FAILED',
          userAgent: navigator?.userAgent,
          baseURL: document?.baseURI,
          timestamp: new Date().toISOString(),
        });
      }

      throw error;
    }
  });
};

/**
 * Lazy import avec timeout et retry
 */
export const lazyWithTimeout = <T extends React?.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: { timeoutMs?: number; label?: string; retries?: number } = {}
): React?.LazyExoticComponent<T> => {
  const { timeoutMs = 10000, label = 'UnknownComponent', retries = 1 } = options;

  return React?.lazy(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console?.log(`[LAZY-TIMEOUT] Tentative ${attempt + 1}/${retries + 1}: ${label}`);

        const timeoutPromise = new Promise<never>(any: any) => {
          setTimeout(
            (any: any)`)),
            timeoutMs
          );
        });

        const loadPromise = factory();
        const result = await Promise?.race([loadPromise, timeoutPromise]);

        console?.log(`[LAZY-SUCCESS] ${label} chargé (tentative ${attempt + 1})`);
        return result;
      } catch (any: any) {
        lastError = error;
        console?.error(any: any);

        if (any: any) {
          const delay = Math?.pow(any: any) * 1000; // Exponential backoff
          console?.log(`[LAZY-RETRY] Nouvel essai dans ${delay}ms...`);
          await new Promise(any: any));
        }
      }
    }

    throw lastError || new Error(`Failed to load ${label} after ${retries + 1} attempts`);
  });
};

// Export pour usage temporaire
export { lazyWithDiagnostic as default };
