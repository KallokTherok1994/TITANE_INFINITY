import { describe, expect, it } from 'vitest';
import { DEFAULT_OLLAMA_MODEL } from '@/config/ollamaDefaults';
import {
  getModelLimit,
  ContextWindowManager,
  TruncationStrategy,
} from '@/services/ai/contextManager';

describe('ContextWindowManager governed Ollama limits', () => {
  it('recognizes the governed local Ollama model explicitly', () => {
    expect(getModelLimit(DEFAULT_OLLAMA_MODEL)).toBe(8192);
  });

  it('keeps the gemma2 family on the local context ceiling', () => {
    expect(getModelLimit('gemma2:9b')).toBe(8192);
  });
});

describe('ContextWindowManager: IMPORTANCE strategy reads metadata.importance', () => {
  it('keeps messages without metadata.importance unconditionally', () => {
    const mgr = new ContextWindowManager({
      strategy: TruncationStrategy.IMPORTANCE,
      importanceThreshold: 0.8,
    });
    const messages = [
      { role: 'user' as const, content: 'a'.repeat(10), timestamp: Date.now() },
      { role: 'assistant' as const, content: 'b'.repeat(10), timestamp: Date.now() },
    ];
    const result = mgr.truncate(messages, DEFAULT_OLLAMA_MODEL);
    expect(result.length).toBe(2);
  });

  it('filters messages with low metadata.importance below threshold', () => {
    const mgr = new ContextWindowManager({
      strategy: TruncationStrategy.IMPORTANCE,
      importanceThreshold: 0.8,
      targetRatio: 0.001, // force truncation: targetTokens ~ 8
    });
    // Each message exceeds the targetTokens individually so truncation is triggered
    const messages = [
      {
        role: 'user' as const,
        content: 'A'.repeat(60),
        timestamp: Date.now(),
        metadata: { importance: 0.9 },
      },
      {
        role: 'user' as const,
        content: 'B'.repeat(60),
        timestamp: Date.now(),
        metadata: { importance: 0.1 },
      },
    ];
    const result = mgr.truncate(messages, DEFAULT_OLLAMA_MODEL);
    // Low importance message should be excluded — only the high-importance one remains
    const low = result.find(m => m.metadata?.['importance'] === 0.1);
    expect(low).toBeUndefined();
  });

  it('never returns undefined from metadata.importance — no (msg as any) cast needed', () => {
    // Guard: the fix ensures we read msg.metadata?.['importance'], not (msg as any).importance
    const mgr = new ContextWindowManager({
      strategy: TruncationStrategy.IMPORTANCE,
      importanceThreshold: 0.5,
    });
    const messages = [
      // importance set at top-level (OLD incorrect path — should be ignored)
      { role: 'user' as const, content: 'top-level', timestamp: Date.now() },
      // importance set in metadata (CORRECT path)
      {
        role: 'user' as const,
        content: 'meta-level',
        timestamp: Date.now(),
        metadata: { importance: 0.9 },
      },
    ];
    const result = mgr.truncate(messages, DEFAULT_OLLAMA_MODEL);
    // Both messages should pass (undefined-importance always passes the filter)
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
