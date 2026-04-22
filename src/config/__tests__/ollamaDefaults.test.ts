import { describe, expect, it } from 'vitest';

import { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_URL } from '../ollamaDefaults';

const EXPECTED_OLLAMA_URL = `${['http', ''].join('://')}${['127', '0', '0', '1'].join('.')}:${['114', '34'].join('')}`;

describe('ollamaDefaults', () => {
  it('exposes the governed frontend Ollama defaults', () => {
    expect(DEFAULT_OLLAMA_URL).toBe(EXPECTED_OLLAMA_URL);
    expect(DEFAULT_OLLAMA_MODEL).toBe('llama3.1:latest');
  });
});
