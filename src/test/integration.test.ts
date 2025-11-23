/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Integration Tests Phase 3 Robustness
 * Tests serviceInvoker + serviceMetrics
 * ═══════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invokeWithRetry } from '../lib/serviceInvoker';
import { ServiceMetrics } from '../lib/serviceMetrics';
import * as tauriCore from '@tauri-apps/api/core';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core');
const mockInvoke = vi.mocked(tauriCore.invoke);

describe('Phase 3 Integration - Robustness Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ServiceMetrics.clear();
  });

  it('devrait tracer métriques sur succès', async () => {
    mockInvoke.mockResolvedValueOnce({ data: 'success' });

    const metricId = ServiceMetrics.startMetric('test_command', 'memory');
    const result = await invokeWithRetry('test_command', {}, { retries: 3 });
    ServiceMetrics.endMetric(metricId, true, undefined, 0);

    expect(result).toEqual({ data: 'success' });

    const stats = ServiceMetrics.getServiceStats('memory');
    expect(stats.totalCalls).toBeGreaterThan(0);
    expect(stats.successfulCalls).toBeGreaterThan(0);
  });

  it('devrait tracer métriques sur retry puis succès', async () => {
    mockInvoke
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: 'success' });

    const metricId = ServiceMetrics.startMetric('test_command', 'memory');
    const result = await invokeWithRetry('test_command', {}, {
      retries: 3,
      retryDelay: 10,
      backoffFactor: 1,
    });
    ServiceMetrics.endMetric(metricId, true, undefined, 2); // 2 retries

    expect(result).toEqual({ data: 'success' });

    const stats = ServiceMetrics.getServiceStats('memory');
    expect(stats.successfulCalls).toBe(1);
    expect(stats.totalRetries).toBe(2);
  });

  it('devrait tracer métriques sur échec après retries', async () => {
    mockInvoke
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockRejectedValueOnce(new Error('Error 3'));

    const metricId = ServiceMetrics.startMetric('test_command', 'memory');

    try {
      await invokeWithRetry('test_command', {}, {
        retries: 3,
        retryDelay: 10,
        backoffFactor: 1,
      });
    } catch (error) {
      ServiceMetrics.endMetric(metricId, false, String(error), 3);
    }

    const stats = ServiceMetrics.getServiceStats('memory');
    expect(stats.failedCalls).toBe(1);
    expect(stats.totalRetries).toBe(3);
  });

  it('devrait calculer métriques agrégées correctement', async () => {
    // Simuler 3 appels: 2 succès, 1 échec
    mockInvoke.mockResolvedValueOnce({ data: 'success1' });
    mockInvoke.mockResolvedValueOnce({ data: 'success2' });
    mockInvoke.mockRejectedValueOnce(new Error('Failed'));

    // Appel 1: succès
    let metricId = ServiceMetrics.startMetric('test_command', 'memory');
    await invokeWithRetry('test_command', {}, { retries: 3 });
    ServiceMetrics.endMetric(metricId, true, undefined, 0);

    // Appel 2: succès
    metricId = ServiceMetrics.startMetric('test_command', 'memory');
    await invokeWithRetry('test_command', {}, { retries: 3 });
    ServiceMetrics.endMetric(metricId, true, undefined, 0);

    // Appel 3: échec
    metricId = ServiceMetrics.startMetric('test_command', 'memory');
    try {
      await invokeWithRetry('test_command', {}, { retries: 1, retryDelay: 10 });
    } catch {
      ServiceMetrics.endMetric(metricId, false, 'Failed', 1);
    }

    // Vérifier agrégations
    const globalStats = ServiceMetrics.getGlobalStats();
    expect(globalStats.totalMetrics).toBe(3);
    expect(globalStats.totalRetries).toBe(1);
    expect(globalStats.globalErrorRate).toBeCloseTo(0.333, 2);
  });

  it('devrait obtenir top commandes', async () => {
    mockInvoke.mockResolvedValue({ data: 'success' });

    // Appels multiples
    for (let i = 0; i < 5; i++) {
      const metricId = ServiceMetrics.startMetric('get_projects', 'memory');
      await invokeWithRetry('get_projects', {}, { retries: 3 });
      ServiceMetrics.endMetric(metricId, true, undefined, 0);
    }

    const topCommands = ServiceMetrics.getTopCommands(5);
    expect(topCommands.length).toBeGreaterThan(0);
    expect(topCommands[0].calls).toBe(5);
  });

  it('devrait exporter métriques en JSON', async () => {
    mockInvoke.mockResolvedValueOnce({ data: 'success' });

    const metricId = ServiceMetrics.startMetric('test_command', 'memory');
    await invokeWithRetry('test_command', {}, { retries: 3 });
    ServiceMetrics.endMetric(metricId, true, undefined, 0);

    const exported = ServiceMetrics.export();
    expect(exported.length).toBe(1);
    expect(exported[0].command).toBe('test_command');
    expect(exported[0].service).toBe('memory');
    expect(exported[0].success).toBe(true);
  });

  it('devrait calculer statistiques service', async () => {
    mockInvoke.mockResolvedValueOnce({ data: 'success' });

    const metricId = ServiceMetrics.startMetric('test_command', 'memory');
    await invokeWithRetry('test_command', {}, { retries: 3 });
    ServiceMetrics.endMetric(metricId, true, undefined, 0);

    const stats = ServiceMetrics.getServiceStats('memory');
    expect(stats.totalCalls).toBe(1);
    expect(stats.successfulCalls).toBe(1);
    expect(stats.failedCalls).toBe(0);
  });
});

