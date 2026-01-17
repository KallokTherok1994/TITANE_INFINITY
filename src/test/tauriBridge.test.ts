/**
 * Tests for tauriBridge Service (v19.0 Task 6)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { batchInvoke, parallelInvoke, sequentialInvoke } from '../services/tauriBridge';

describe('tauriBridge Batch Commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute commands in parallel mode', async () => {
    const commands = [
      { command: 'test_1', id: '1' },
      { command: 'test_2', id: '2' },
    ];

    const results = await parallelInvoke(commands);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('1');
    expect(results[1].id).toBe('2');
  });

  it('should execute commands sequentially', async () => {
    const commands = [
      { command: 'test_1', id: '1' },
      { command: 'test_2', id: '2' },
    ];

    const results = await sequentialInvoke(commands);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('1');
    expect(results[1].id).toBe('2');
  });

  it('should respect atomic mode', async () => {
    const commands = [
      { command: 'test_1', id: '1' },
      { command: 'test_invalid', id: '2' }, // This will fail
      { command: 'test_3', id: '3' },
    ];

    await expect(async () => {
      await batchInvoke(commands, { atomic: true });
    }).rejects.toThrow();
  });
});
