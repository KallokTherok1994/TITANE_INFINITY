/**
 * Tests for useBatchCommands Hook (v19.0 Task 6)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBatchCommands } from '../hooks/useBatchCommands';
import * as tauriBridge from '../services/tauriBridge';

vi.mock('../services/tauriBridge');

describe('useBatchCommands Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute batch commands in parallel', async () => {
    const mockResults = [
      { success: true, data: 'result1', duration: 100 },
      { success: true, data: 'result2', duration: 150 },
    ];

    vi.spyOn(tauriBridge, 'batchInvoke').mockResolvedValue(mockResults);

    const { result } = renderHook(() => useBatchCommands());

    const commands = [
      { command: 'test_command_1', params: { id: 1 } },
      { command: 'test_command_2', params: { id: 2 } },
    ];

    const batchResult = await result.current.executeBatch(commands, { mode: 'parallel' });

    expect(batchResult).toEqual(mockResults);
    await waitFor(() => {
      expect(result.current.results).toEqual(mockResults);
    });
    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should track progress during execution', async () => {
    const mockProgress = { completed: 1, total: 2, percentage: 50 };

    vi.spyOn(tauriBridge, 'batchInvoke').mockImplementation(async (commands, options) => {
      if (options?.onProgress) {
        options.onProgress(mockProgress);
      }
      return [
        { success: true, data: 'result1', duration: 100 },
        { success: true, data: 'result2', duration: 150 },
      ];
    });

    const { result } = renderHook(() => useBatchCommands());

    const commands = [
      { command: 'test_command_1' },
      { command: 'test_command_2' },
    ];

    await waitFor(async () => {
      await result.current.executeBatch(commands);
    });

    expect(result.current.progress).toBeDefined();
    expect(result.current.progress?.percentage).toBe(100);
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Batch execution failed');
    vi.spyOn(tauriBridge, 'batchInvoke').mockRejectedValue(mockError);

    const { result } = renderHook(() => useBatchCommands());

    const commands = [{ command: 'test_command' }];

    await expect(async () => {
      await result.current.executeBatch(commands);
    }).rejects.toThrow('Batch execution failed');

    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toBe('Batch execution failed');
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useBatchCommands());

    // Manually set some state
    result.current.reset();

    expect(result.current.isExecuting).toBe(false);
    expect(result.current.progress).toBeNull();
    expect(result.current.results).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
