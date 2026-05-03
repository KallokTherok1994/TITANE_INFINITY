/**
 * Unit tests — validateChampionAvailability()
 * v31.2.13 — Champion runtime validation vs Ollama /api/tags
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock secureInvoke via canonical door (One Door — no direct @tauri-apps/api/core)
vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  }),
}));

import { secureInvoke } from '../../../../src/lib/security';
import {
  validateChampionAvailability,
  resetRegistryCache,
} from '../../../../src/services/ai/championChallenger';

const mockSecureInvoke = vi.mocked(secureInvoke);

beforeEach(() => {
  vi.clearAllMocks();
  resetRegistryCache();
});

describe('validateChampionAvailability', () => {
  it('returns available=true when champion gemma2:2b is in Ollama list', async () => {
    mockSecureInvoke.mockResolvedValueOnce({
      ok: true,
      content: { models: ['gemma2:2b', 'llama3.2:latest'] },
    });

    const result = await validateChampionAvailability('DIRECT');
    expect(result.available).toBe(true);
    expect(result.championModel).toBe('gemma2:2b');
    expect(result.warning).toBeNull();
  });

  it('returns available=false with CHAMPION_MODEL_NOT_INSTALLED when model absent', async () => {
    mockSecureInvoke.mockResolvedValueOnce({
      ok: true,
      content: { models: ['llama3.2:latest', 'mistral:7b'] },
    });

    const result = await validateChampionAvailability('DIRECT');
    expect(result.available).toBe(false);
    expect(result.warning).toBe('CHAMPION_MODEL_NOT_INSTALLED');
    expect(result.installedModels).toContain('llama3.2:latest');
  });

  it('returns available=false with OLLAMA_OFFLINE when Ollama is unreachable', async () => {
    mockSecureInvoke.mockResolvedValueOnce({ ok: false });

    const result = await validateChampionAvailability('DIRECT');
    expect(result.available).toBe(false);
    expect(result.warning).toBe('OLLAMA_OFFLINE');
    expect(result.installedModels).toHaveLength(0);
  });

  it('returns available=false with VALIDATION_ERROR on secureInvoke throw', async () => {
    mockSecureInvoke.mockRejectedValueOnce(new Error('IPC timeout'));

    const result = await validateChampionAvailability('DIRECT');
    expect(result.available).toBe(false);
    expect(result.warning).toBe('VALIDATION_ERROR');
  });

  it('matches champion by family prefix (gemma2 matches gemma2:latest)', async () => {
    mockSecureInvoke.mockResolvedValueOnce({
      ok: true,
      content: { models: ['gemma2:latest'] },
    });

    const result = await validateChampionAvailability('DIRECT');
    // gemma2:2b prefix "gemma2" matches "gemma2:latest"
    expect(result.available).toBe(true);
    expect(result.warning).toBeNull();
  });

  it('handles missing models array as not installed (non-crashing)', async () => {
    mockSecureInvoke.mockResolvedValueOnce({
      ok: true,
      content: {},
    });

    const result = await validateChampionAvailability('DIRECT');
    expect(result.available).toBe(false);
    expect(result.warning).toBe('CHAMPION_MODEL_NOT_INSTALLED');
    expect(result.installedModels).toEqual([]);
  });

  it('matches champion case-insensitively', async () => {
    mockSecureInvoke.mockResolvedValueOnce({
      ok: true,
      content: { models: ['GEMMA2:2B'] },
    });

    const result = await validateChampionAvailability('DIRECT');
    expect(result.available).toBe(true);
    expect(result.warning).toBeNull();
  });
});
