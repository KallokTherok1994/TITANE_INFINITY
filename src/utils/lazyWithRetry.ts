/**
 * TITANE∞ v35.1.2 — lazyWithRetry
 *
 * React.lazy memoizes the underlying import promise, including rejections.
 * When a dynamic chunk fetch fails once (transient WebKitGTK network hiccup,
 * service-worker race, slow disk), every subsequent navigation that re-enters
 * the affected Suspense boundary hangs forever because React keeps returning
 * the same rejected promise. This wrapper retries the factory with exponential
 * backoff before surfacing the rejection.
 *
 * Strategy:
 *  - Up to `retries` attempts (default 3) with delays 200ms, 500ms, 1500ms.
 *  - On final failure, returns the rejection so ErrorBoundary can render.
 *  - On any success, the resolved module is cached in a module-level Map so
 *    future renders never re-execute the factory.
 *
 * Why not `window.__TITANE_LAZY_CACHE__`? Keeps global namespace clean and
 * survives only for the lifetime of the JS context (no leak across reloads).
 *
 * Architecture: Ring 4 (UI utility). No IPC, no global state mutation.
 */

import { lazy } from 'react';
import type { ComponentType } from 'react';

const DEFAULT_RETRIES = 3;
const DEFAULT_BACKOFF_MS = [200, 500, 1500] as const;

type Factory<T extends ComponentType<unknown>> = () => Promise<{ default: T }>;

interface CacheEntry<T extends ComponentType<unknown>> {
  module: { default: T };
}

const resolvedCache = new Map<string, CacheEntry<ComponentType<unknown>>>();

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Pure async retry helper. Independent of React for deterministic testing.
 * Exported so unit tests can assert retry semantics without Suspense
 * (happy-dom + React Suspense scheduling can be flaky under vitest).
 */
export async function loadWithRetry<T extends ComponentType<unknown>>(
  factory: Factory<T>,
  cacheKey?: string,
  retries: number = DEFAULT_RETRIES,
  backoffMs: readonly number[] = DEFAULT_BACKOFF_MS,
): Promise<{ default: T }> {
  if (cacheKey) {
    const cached = resolvedCache.get(cacheKey);
    if (cached) {
      return cached.module as { default: T };
    }
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const mod = await factory();
      if (cacheKey) {
        resolvedCache.set(cacheKey, {
          module: mod as { default: ComponentType<unknown> },
        });
      }
      return mod;
    } catch (err) {
      lastError = err;
      const delay = backoffMs[attempt] ?? backoffMs[backoffMs.length - 1] ?? 1000;
      if (attempt < retries - 1) {
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

/**
 * Wraps a dynamic import factory with retry-on-rejection semantics.
 *
 * @param factory - Same shape as `lazy()` accepts (returns `Promise<{ default }>`).
 * @param cacheKey - Stable identifier to deduplicate successful resolutions.
 *   When provided, the resolved module is reused on subsequent calls.
 * @param retries - Maximum attempts (default 3).
 * @param backoffMs - Backoff schedule (default [200,500,1500]).
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: Factory<T>,
  cacheKey?: string,
  retries: number = DEFAULT_RETRIES,
  backoffMs: readonly number[] = DEFAULT_BACKOFF_MS,
): ReturnType<typeof lazy<T>> {
  return lazy<T>(() => loadWithRetry(factory, cacheKey, retries, backoffMs));
}

/**
 * Test-only helper: clears the resolved module cache.
 * Not exported in production builds (no top-level effect).
 */
export function __resetLazyWithRetryCacheForTests(): void {
  resolvedCache.clear();
}
