import { describe, expect, it } from 'vitest';
import { DEFAULT_OLLAMA_MODEL } from '@/config/ollamaDefaults';
import { TokenCounterService } from '../tokenCounter';

describe('TokenCounterService governed Ollama limits', () => {
  const service = new TokenCounterService();

  it('resolves gemma2:2b to the governed local context window', () => {
    expect(service.getModelLimits(DEFAULT_OLLAMA_MODEL)).toMatchObject({
      model: DEFAULT_OLLAMA_MODEL,
      maxTokens: 8192,
      warningThreshold: 0.75,
    });
  });

  it('uses the governed local context ceiling in usage checks', () => {
    const messages = [
      {
        id: 'u-1',
        role: 'user' as const,
        content: 'mot '.repeat(2000),
        timestamp: Date.now(),
      },
    ];

    const usage = service.checkContextUsage(messages, DEFAULT_OLLAMA_MODEL);

    expect(usage.limit).toBe(8192);
    expect(usage.percentage).toBeGreaterThan(0);
    expect(usage.percentage).toBeLessThan(1);
  });
});
