import { describe, expect, it } from 'vitest';
import { DEFAULT_OLLAMA_MODEL } from '@/config/ollamaDefaults';
import { getModelLimit } from '@/services/ai/contextManager';

describe('ContextWindowManager governed Ollama limits', () => {
  it('recognizes the governed local Ollama model explicitly', () => {
    expect(getModelLimit(DEFAULT_OLLAMA_MODEL)).toBe(8192);
  });

  it('keeps the gemma2 family on the local context ceiling', () => {
    expect(getModelLimit('gemma2:9b')).toBe(8192);
  });
});
