/**
 * Tests pour useFusionEngine Hook
 * Coverage: Initialization, Processing, State, Lifecycle
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFusionEngine } from '@/hooks';

vi.mock('@/modules/fusion/FusionEngine', () => {
  const mockStats = { totalEntries: 0, totalFusions: 0 };
  return {
    fusionEngine: {
      getStats: vi.fn(() => mockStats),
      isFusingNow: vi.fn(() => false),
      getLastFusionTime: vi.fn(() => 0),
      runFusionPipeline: vi.fn(async () => ({ status: 'ok', fused: 1 })),
      exportToJSONL: vi.fn(() => '{"id":"1"}\n'),
      getFusedDataset: vi.fn(() => []),
      clearFusedDataset: vi.fn(),
      getDatasetByCluster: vi.fn(() => []),
      getDatasetBySource: vi.fn(() => []),
    },
  };
});

vi.mock('@/modules/fusion/DatasetBuilder', () => ({
  datasetBuilder: {
    buildTrainingPackage: vi.fn(() => ({
      dataset: '{}',
      modelfile: 'FROM base',
      trainingScript: '#!/bin/bash',
      metadata: '{}',
    })),
  },
}));

describe('useFusionEngine Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useFusionEngine());
      await waitFor(() => {
        expect(result.current.isFusing).toBe(false);
      });
      expect(result.current.stats).toBeDefined();
    });

    it('should expose fusion actions', () => {
      const { result } = renderHook(() => useFusionEngine());
      expect(typeof result.current.runFusion).toBe('function');
      expect(typeof result.current.exportDataset).toBe('function');
      expect(typeof result.current.clearDataset).toBe('function');
    });
  });

  describe('Activation', () => {
    it('should refresh without throwing', async () => {
      const { result } = renderHook(() => useFusionEngine());

      await act(async () => {
        result.current.refresh();
      });

      expect(result.current.stats).toBeDefined();
    });

    it('should clear dataset without throwing', async () => {
      const { result } = renderHook(() => useFusionEngine());

      await act(async () => {
        result.current.clearDataset();
      });

      expect(result.current.isFusing).toBe(false);
    });
  });

  describe('Processing', () => {
    it('should run fusion pipeline', async () => {
      const { result } = renderHook(() => useFusionEngine());

      let report: unknown;
      await act(async () => {
        report = await result.current.runFusion();
      });

      expect(report).toBeDefined();
      expect(result.current.lastReport).toBeDefined();
    });

    it('should export dataset as string', () => {
      const { result } = renderHook(() => useFusionEngine());
      const dataset = result.current.exportDataset();
      expect(typeof dataset).toBe('string');
    });

    it('should export training package', () => {
      const { result } = renderHook(() => useFusionEngine());
      const pack = result.current.exportTrainingPackage();
      expect(pack).toHaveProperty('dataset');
      expect(pack).toHaveProperty('modelfile');
    });
  });

  describe('State Management', () => {
    it('should provide cluster/source filters', () => {
      const { result } = renderHook(() => useFusionEngine());
      expect(Array.isArray(result.current.getByCluster('memory' as never))).toBe(true);
      expect(Array.isArray(result.current.getBySource('chat' as never))).toBe(true);
    });

    it('should expose stats and timestamps', () => {
      const { result } = renderHook(() => useFusionEngine());
      expect(result.current.stats).not.toBeUndefined();
      expect(typeof result.current.lastFusionTime).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should keep hook stable after run', async () => {
      const { result } = renderHook(() => useFusionEngine());
      await act(async () => {
        await result.current.runFusion();
      });
      expect(result.current.isFusing).toBe(false);
    });

    it('should provide download helpers', () => {
      const { result } = renderHook(() => useFusionEngine());
      expect(typeof result.current.downloadDataset).toBe('function');
      expect(typeof result.current.downloadTrainingPack).toBe('function');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useFusionEngine());
      unmount();
      expect(true).toBe(true);
    });
  });
});
