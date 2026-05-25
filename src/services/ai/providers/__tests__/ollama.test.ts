/**
 * TITANE∞ — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, test, expect } from 'vitest';
import { pickBestModel } from '../ollama';

describe('pickBestModel', () => {
  test('selects llama3.2 over gemma2 (higher context window)', () => {
    expect(pickBestModel(['gemma2:2b', 'llama3.2:latest'])).toBe('llama3.2:latest');
  });

  test('selects qwen3 as highest priority', () => {
    expect(pickBestModel(['gemma2:2b', 'llama3.2:latest', 'qwen3:latest'])).toBe('qwen3:latest');
  });

  test('returns gemma2 when it is the only model', () => {
    expect(pickBestModel(['gemma2:2b'])).toBe('gemma2:2b');
  });

  test('falls back to first available when no priority match', () => {
    expect(pickBestModel(['custom-model:7b'])).toBe('custom-model:7b');
  });

  test('selects mistral over llama3.1 (priority rank)', () => {
    expect(pickBestModel(['llama3.1:8b', 'mistral:7b'])).toBe('mistral:7b');
  });

  test('handles model with tag suffix (model:tag format)', () => {
    expect(pickBestModel(['llama3.2:3b', 'llama3.2:latest'])).toBe('llama3.2:3b');
  });

  test('returns configured default when list is empty', () => {
    const result = pickBestModel([]);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
