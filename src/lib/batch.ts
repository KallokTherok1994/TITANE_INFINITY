/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.5.2 — Batch Request Client
 * P2-3: Frontend utilities for batch IPC requests
 * ═══════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface BatchRequest {
  id: string;
  command: string;
  params?: Record<string, unknown>;
}

export interface BatchResponse<T = unknown> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
  duration_ms: number;
}

export interface BatchResult<T = unknown> {
  responses: BatchResponse<T>[];
  total_duration_ms: number;
  success_count: number;
  failure_count: number;
}

// ────────────────────────────────────────────────────────────────
// Batch Executor
// ────────────────────────────────────────────────────────────────

/**
 * Execute multiple commands in a single batch request
 *
 * @example
 * ```typescript
 * const result = await batchExecute([
 *   { id: 'health', command: 'health_get_state' },
 *   { id: 'memory', command: 'memory_get_state' },
 * ]);
 *
 * const health = result.responses.find(r => r.id === 'health')?.data;
 * ```
 */
export async function batchExecute<T = unknown>(
  requests: BatchRequest[]
): Promise<BatchResult<T>> {
  return invoke<BatchResult<T>>('batch_execute', { requests });
}

/**
 * Build a batch request
 */
export class BatchRequestBuilder {
  private requests: BatchRequest[] = [];
  private idCounter = 0;

  /**
   * Add a command to the batch
   */
  add(command: string, params?: Record<string, unknown>, id?: string): this {
    this.requests.push({
      id: id || `req_${this.idCounter++}`,
      command,
      params: params || {},
    });
    return this;
  }

  /**
   * Add health state query
   */
  addHealthState(id = 'health'): this {
    return this.add('health_get_state', {}, id);
  }

  /**
   * Add memory state query
   */
  addMemoryState(id = 'memory'): this {
    return this.add('memory_get_state', {}, id);
  }

  /**
   * Add coherence state query
   */
  addCoherenceState(id = 'coherence'): this {
    return this.add('coherence_get_state', {}, id);
  }

  /**
   * Add cache metrics query
   */
  addCacheMetrics(id = 'cache'): this {
    return this.add('cache_get_metrics', {}, id);
  }

  /**
   * Execute the batch
   */
  async execute<T = unknown>(): Promise<BatchResult<T>> {
    if (this.requests.length === 0) {
      throw new Error('Batch cannot be empty');
    }
    return batchExecute<T>(this.requests);
  }

  /**
   * Get raw requests (for debugging)
   */
  getRequests(): BatchRequest[] {
    return [...this.requests];
  }
}

// ────────────────────────────────────────────────────────────────
// Preset Batches
// ────────────────────────────────────────────────────────────────

/**
 * Get complete dashboard state (health + memory + coherence + cache)
 */
export async function getDashboardState(): Promise<BatchResult> {
  return invoke<BatchResult>('batch_get_dashboard_state');
}

/**
 * Get monitoring overview (health + coherence)
 */
export async function getMonitoringOverview(): Promise<BatchResult> {
  return invoke<BatchResult>('batch_get_monitoring_overview');
}

// ────────────────────────────────────────────────────────────────
// Helper: Extract Data from Batch Result
// ────────────────────────────────────────────────────────────────

/**
 * Extract data from batch result by ID
 *
 * @example
 * ```typescript
 * const result = await getDashboardState();
 * const health = extractData(result, 'health');
 * const memory = extractData(result, 'memory');
 * ```
 */
export function extractData<T = unknown>(result: BatchResult, id: string): T | null {
  const response = result.responses.find(r => r.id === id);
  if (!response || !response.success) {
    return null;
  }
  return response.data as T;
}

/**
 * Extract all successful data as a map
 *
 * @example
 * ```typescript
 * const result = await getDashboardState();
 * const data = extractAllData(result);
 * // { health: {...}, memory: {...}, coherence: {...} }
 * ```
 */
export function extractAllData(result: BatchResult): Record<string, unknown> {
  return result.responses
    .filter(r => r.success)
    .reduce(
      (acc, r) => {
        acc[r.id] = r.data;
        return acc;
      },
      {} as Record<string, unknown>
    );
}

/**
 * Check if all requests succeeded
 */
export function allSucceeded(result: BatchResult): boolean {
  return result.failure_count === 0;
}

/**
 * Get failed request IDs
 */
export function getFailedIds(result: BatchResult): string[] {
  return result.responses.filter(r => !r.success).map(r => r.id);
}

// ────────────────────────────────────────────────────────────────
// React Hook (Optional)
// ────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

export interface UseBatchState<T = unknown> {
  data: Record<string, T> | null;
  loading: boolean;
  error: string | null;
  execute: (requests: BatchRequest[]) => Promise<void>;
  executeDashboard: () => Promise<void>;
  executeMonitoring: () => Promise<void>;
}

/**
 * React hook for batch requests
 *
 * @example
 * ```typescript
 * const { data, loading, executeDashboard } = useBatch();
 *
 * useEffect(() => {
 *   executeDashboard();
 * }, []);
 *
 * const health = data?.health;
 * ```
 */
export function useBatch<T = unknown>(): UseBatchState<T> {
  const [data, setData] = useState<Record<string, T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (requests: BatchRequest[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await batchExecute<T>(requests);

      if (result.failure_count > 0) {
        const failedIds = getFailedIds(result);
        console.warn(`Batch partial failure: ${failedIds.join(', ')}`);
      }

      setData(extractAllData(result) as Record<string, T>);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const executeDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDashboardState();
      setData(extractAllData(result) as Record<string, T>);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const executeMonitoring = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMonitoringOverview();
      setData(extractAllData(result) as Record<string, T>);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    executeDashboard,
    executeMonitoring,
  };
}
