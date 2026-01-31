/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v37.0.0 — LAZY COMPONENT LOADER
 *   Phase 2: UI Component Code-Splitting Infrastructure
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { ReactNode, ComponentType, Suspense } from 'react';
import { logger } from '@/lib/logger';

export interface LazyComponentOptions {
  timeoutMs?: number;
  fallback?: ReactNode;
  label?: string;
  verbose?: boolean;
  retryOnTimeout?: boolean;
}

/**
 * Default loading fallback
 */
export function DefaultLoadingFallback(): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        color: '#888',
      }}
    >
      Loading...
    </div>
  );
}

/**
 * Lazy-load a React component with timeout + fallback handling
 */
export function lazyComponent<P extends object = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {}
): React.LazyExoticComponent<ComponentType<P>> {
  const { timeoutMs = 10000, label = 'Component', verbose = false, retryOnTimeout = false } =
    options;

  if (verbose) {
    logger.debug(`[lazyComponent] Loading: ${label}`);
  }

  async function wrappedImport(): Promise<{ default: ComponentType<P> }> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout loading ${label}`)), timeoutMs)
    );

    try {
      const result = await Promise.race([importFn(), timeoutPromise]);
      if (verbose) {
        logger.debug(`[lazyComponent] Loaded: ${label}`);
      }
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (retryOnTimeout && errorMsg.includes('Timeout')) {
        logger.warn(`[lazyComponent] Retrying ${label}...`);
        return importFn();
      }
      logger.error(`[lazyComponent] Failed to load ${label}: ${errorMsg}`);
      throw error;
    }
  }

  return React.lazy(wrappedImport);
}

/**
 * Wrapper component with automatic Suspense
 */
export function LazyComponentWrapper(props: {
  component: React.LazyExoticComponent<ComponentType<any>>;
  fallback?: ReactNode;
  [key: string]: any;
}): JSX.Element {
  const { component: Component, fallback, ...restProps } = props;

  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      <Component {...restProps} />
    </Suspense>
  );
}

/**
 * Preload a lazy component
 */
export async function preloadLazyComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  label = 'Component'
): Promise<void> {
  try {
    await importFn();
    logger.debug(`[preloadLazyComponent] Preloaded: ${label}`);
  } catch (error) {
    logger.warn(`[preloadLazyComponent] Failed to preload ${label}`);
  }
}

/**
 * Batch preload multiple components
 */
export async function preloadLazyComponents(
  imports: Array<[() => Promise<{ default: ComponentType<any> }>, string]>
): Promise<void> {
  await Promise.allSettled(
    imports.map(([importFn, label]) => preloadLazyComponent(importFn, label))
  );
}

/**
 * Measure lazy component load time
 */
export function measureLazyComponentLoad(
  importFn: () => Promise<{ default: ComponentType<any> }>
): Promise<number> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    importFn()
      .then(() => resolve(performance.now() - startTime))
      .catch(reject);
  });
}
