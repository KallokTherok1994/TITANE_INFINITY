/**
 * TITANE∞ vΩ.2 — Status Cache (Singleflight + TTL + Backoff)
 * Cache minimal pour éviter les boucles d'invocation redondantes.
 */

import { createLogger } from '@/utils/logger';

export interface StatusCacheOptions {
  name: string;
  ttlMs: number;
  backoffBaseMs: number;
  backoffMaxMs: number;
}

export class StatusCache<T> {
  private value: T | null = null;
  private expiresAt = 0;
  private inFlight: Promise<T> | null = null;
  private failureCount = 0;
  private backoffUntil = 0;
  private logger: ReturnType<typeof createLogger>;

  constructor(private readonly options: StatusCacheOptions) {
    this.logger = createLogger(`StatusCache:${options.name}`);
  }

  async get(fetcher: () => Promise<T>, fallback?: () => T): Promise<T> {
    const now = Date.now();

    if (this.value !== null && now < this.expiresAt) {
      return this.value;
    }

    if (this.inFlight) {
      return this.inFlight;
    }

    if (now < this.backoffUntil) {
      if (this.value !== null) {
        return this.value;
      }
      if (fallback) {
        return fallback();
      }
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        this.value = result;
        this.expiresAt = Date.now() + this.options.ttlMs;
        this.failureCount = 0;
        this.backoffUntil = 0;
        return result;
      } catch (error) {
        this.failureCount += 1;
        const backoffMs = Math.min(
          this.options.backoffBaseMs * 2 ** (this.failureCount - 1),
          this.options.backoffMaxMs
        );
        this.backoffUntil = Date.now() + backoffMs;
        this.logger.warn('Status fetch failed, backoff applied', {
          failureCount: this.failureCount,
          backoffMs,
          error: error instanceof Error ? error.message : String(error),
        });

        if (this.value !== null) {
          return this.value;
        }
        if (fallback) {
          return fallback();
        }
        throw error;
      } finally {
        this.inFlight = null;
      }
    })();

    this.inFlight = promise;
    return promise;
  }
}
