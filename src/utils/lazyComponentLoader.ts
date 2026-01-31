/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v37.0.0 — LAZY COMPONENT LOADER
 *   Phase 2: UI Component Code-Splitting Infrastructure
 *   Purpose: Unified lazy-loading pattern with timeout + fallback handling
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { ReactNode, ComponentType } from 'react';
import { logger } from '@/lib/logger';

export interface LazyComponentOptions {
  /**
   * Maximum time (ms) to wait for component to load before timeout
   * Default: 10000 (10 seconds)
   */
  timeoutMs?: number;

  /**
   * Custom React node to display while component is loading
   * Default: Simple "Loading..." spinner
   */
  fallback?: ReactNode;

  /**
   * Component label for logging/debugging
   * Example: 'AIChatBubble', 'MemoryEvolutionCenter'
   */
  label?: string;

  /**
   * If true, logs performance metrics to console (dev mode)
   * Default: false
   */
  verbose?: boolean;

  /**
   * If true, retry loading component once on timeout
   * Default: false
   */
  retryOnTimeout?: boolean;
}

/**
 * Default loading fallback component
 * Lightweight - shown while lazy component loads
 */
export const DefaultLoadingFallback = (): JSX.Element => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
      minHeight: '100px',
      color: '#888',
      fontSize: '0.875rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
        }}
      />
      Loading...
    </div>
  </div>
);

/**
 * Lazy-load a React component with unified error handling, timeout, and fallback
 *
 * @param importFn - Function that dynamically imports the component
 * @param options - Configuration options (timeout, fallback, label, etc.)
 * @returns A wrapped component ready for use with React.Suspense
 *
 * @example
 * const HeavyComponent = lazyComponent(
 *   () => import('./HeavyComponent').then(m => ({ default: m.HeavyComponent })),
 *   { timeoutMs: 15000, label: 'HeavyComponent' }
 * );
 */
export function lazyComponent<P extends object = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {}
): React.LazyExoticComponent<ComponentType<P>> {
  const {
    timeoutMs = 10000,
    fallback,
    label = 'UnnamedComponent',
    verbose = false,
    retryOnTimeout = false,
  } = options;

  if (verbose) {
    logger.debug(`[lazyComponent] Loading: ${label} (timeout: ${timeoutMs}ms)`);
  }

  async function wrappedImport(): Promise<{ default: ComponentType<P> }> {
    const startTime = performance.now();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`[${label}] Component load timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    );

    try {
      const result = await Promise.race([importFn(), timeoutPromise]);

      if (verbose) {
        const duration = performance.now() - startTime;
        logger.debug(`[lazyComponent] Loaded: ${label} (${duration.toFixed(2)}ms)`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      if (retryOnTimeout && errorMsg.includes('timeout')) {
        logger.warn(
          `[lazyComponent] Timeout for ${label}, retrying... (${duration.toFixed(2)}ms)`
        );
        return importFn();
      }

      logger.error(`[lazyComponent] Failed to load ${label}: ${errorMsg}`);
      throw error;
    }
  }

  return React.lazy(wrappedImport);
}

/**
 * Wrapper component that adds Suspense fallback automatically
 */
export function LazyComponentWrapper(props: {
  component: React.LazyExoticComponent<ComponentType<any>>;
  fallback?: ReactNode;
  [key: string]: any;
}): JSX.Element {
  const { component: Component, fallback, ...restProps } = props;

  return React.createElement(
    React.Suspense,
    { fallback: fallback || React.createElement(DefaultLoadingFallback) },
    React.createElement(Component, restProps)
  );
}

/**
 * Preload a lazy component before it's needed
 */
export async function preloadLazyComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  label = 'Component'
): Promise<void> {
  try {
    await importFn();
    logger.debug(`[preloadLazyComponent] Preloaded: ${label}`);
  } catch (error) {
    logger.warn(`[preloadLazyComponent] Failed to preload ${label}: ${error}`);
  }
}

/**
 * Batch preload multiple lazy components
 */
export async function preloadLazyComponents(
  imports: Array<[() => Promise<{ default: ComponentType<any> }>, string]>
): Promise<void> {
  await Promise.allSettled(
    imports.map(([importFn, label]) => preloadLazyComponent(importFn, label))
  );
}

/**
 * Get performance metrics for a lazy component load
 */
export function measureLazyComponentLoad(
  importFn: () => Promise<{ default: ComponentType<any> }>
): Promise<number> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    importFn()
      .then(() => {
        const duration = performance.now() - startTime;
        resolve(duration);
      })
      .catch(reject);
  });
}
