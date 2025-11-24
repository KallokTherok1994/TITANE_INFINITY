/**
 * Tests for useEngineSubscription Hook (v19.0 Task 6)
 *
 * Testing:
 * - Real-time engine state updates
 * - Polling mechanism
 * - Cleanup on unmount
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import * as tauriBridge from '../services/tauriBridge';

vi.mock('../services/tauriBridge');

describe('useEngineSubscription Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useEngineSubscription('nexus'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch engine data on mount', async () => {
    const mockData = { status: 'active', uptime: 1000 };
    vi.spyOn(tauriBridge, 'engineMetrics').mockResolvedValue({
      success: true,
      data: mockData,
      message: 'Success',
    });

    const { result } = renderHook(() => useEngineSubscription('nexus'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Failed to fetch engine data');
    vi.spyOn(tauriBridge, 'engineMetrics').mockRejectedValue(mockError);

    const { result } = renderHook(() => useEngineSubscription('nexus'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Failed to fetch engine data');
  });

  it('should poll for updates at specified interval', async () => {
    const mockData = { status: 'active', uptime: 1000 };
    const engineMetricsSpy = vi.spyOn(tauriBridge, 'engineMetrics').mockResolvedValue({
      success: true,
      data: mockData,
      message: 'Success',
    });

    renderHook(() => useEngineSubscription('nexus', { pollInterval: 5000 }));

    // Initial fetch
    await waitFor(() => {
      expect(engineMetricsSpy).toHaveBeenCalledTimes(1);
    });

    // Advance timer by 5 seconds
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(engineMetricsSpy).toHaveBeenCalledTimes(2);
    });

    // Advance timer by another 5 seconds
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(engineMetricsSpy).toHaveBeenCalledTimes(3);
    });
  });

  it('should cleanup polling on unmount', async () => {
    const mockData = { status: 'active', uptime: 1000 };
    const engineMetricsSpy = vi.spyOn(tauriBridge, 'engineMetrics').mockResolvedValue({
      success: true,
      data: mockData,
      message: 'Success',
    });

    const { unmount } = renderHook(() => useEngineSubscription('nexus', { pollInterval: 5000 }));

    await waitFor(() => {
      expect(engineMetricsSpy).toHaveBeenCalledTimes(1);
    });

    // Unmount hook
    unmount();

    // Advance timer - should NOT trigger another call
    vi.advanceTimersByTime(5000);

    // Should still be 1 call (no new calls after unmount)
    expect(engineMetricsSpy).toHaveBeenCalledTimes(1);
  });

  it('should respect enabled option', async () => {
    const engineMetricsSpy = vi.spyOn(tauriBridge, 'engineMetrics').mockResolvedValue({
      success: true,
      data: { status: 'active' },
      message: 'Success',
    });

    renderHook(() => useEngineSubscription('nexus', { enabled: false }));

    // Should NOT fetch when disabled
    await waitFor(() => {
      expect(engineMetricsSpy).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});
