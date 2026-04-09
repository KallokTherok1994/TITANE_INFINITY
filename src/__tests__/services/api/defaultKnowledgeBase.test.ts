import { beforeEach, describe, expect, it, vi } from 'vitest';

import { invokeWithRetry } from '@/lib/serviceInvoker';
import {
  getAllEntries,
  getCompactIndex,
  getRelevantPromptContext,
  resetCache,
} from '@/services/api/defaultKnowledgeBase';

vi.mock('@/lib/serviceInvoker', () => ({
  invokeWithRetry: vi.fn(),
  FAST_COMMAND_OPTIONS: {},
}));

describe('defaultKnowledgeBase', () => {
  const mockedInvokeWithRetry = vi.mocked(invokeWithRetry);

  beforeEach(() => {
    resetCache();
    vi.clearAllMocks();
  });

  it('builds a prompt-ready relevant context block from matching knowledge entries', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(
      JSON.stringify({
        system_architecture: {
          id: 'system_architecture',
          category: 'system_architecture',
          version: 'v30.0.0',
          description: 'Architecture cœur TITANE∞',
          content: {
            architecture: {
              rings: 4,
              gateway: 'One Door network governance',
            },
          },
        },
        nutrition: {
          id: 'nutrition',
          category: 'nutrition',
          version: 'v30.0.0',
          description: 'Nutrition générale',
          content: {
            tips: ['hydrate', 'sleep'],
          },
        },
      })
    );

    const promptContext = await getRelevantPromptContext(
      'Explique-moi l architecture 4 rings et le One Door de TITANE',
      2
    );

    expect(promptContext).toContain('Connaissances pertinentes TITANE∞');
    expect(promptContext).toContain('system_architecture');
    expect(promptContext).toContain('One Door network governance');
    expect(promptContext).not.toContain('nutrition');
  });

  it('reuses the cached knowledge entries between compact index and relevant context generation', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(
      JSON.stringify({
        system_architecture: {
          id: 'system_architecture',
          category: 'system_architecture',
          version: 'v30.0.0',
          description: 'Architecture cœur TITANE∞',
          content: {
            architecture: {
              rings: 4,
            },
          },
        },
      })
    );

    const compactIndex = await getCompactIndex();
    const promptContext = await getRelevantPromptContext('architecture TITANE', 1);

    expect(compactIndex).toContain('system_architecture');
    expect(promptContext).toContain('system_architecture');
    expect(mockedInvokeWithRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps a substantial bundled default knowledge base via fallback entries when IPC is unavailable', async () => {
    mockedInvokeWithRetry.mockRejectedValueOnce(new Error('ipc unavailable'));

    const entries = await getAllEntries();

    expect(entries.length).toBeGreaterThan(50);
    expect(entries.some(entry => entry.category === 'system_architecture')).toBe(true);
    expect(entries.some(entry => entry.category === 'memory_system_deep')).toBe(true);
  });
});
