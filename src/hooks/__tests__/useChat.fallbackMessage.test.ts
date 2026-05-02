import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('useChat governed fallback guidance', () => {
  it('points the user to the canonical local ollama model', () => {
    const source = readFileSync('src/hooks/useChat.ts', 'utf8');

    expect(source).toContain('ollama pull gemma2:2b');
    expect(source).not.toContain('ollama pull llama3.1:latest');
  });
});
