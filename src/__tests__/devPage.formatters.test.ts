import { describe, expect, it } from 'vitest';
import { formatDevBestProvider, formatDevHealthScore } from '@/pages/devPage.formatters';

describe('formatDevHealthScore', () => {
  it('returns N/A for null', () => {
    expect(formatDevHealthScore(null)).toBe('N/A');
  });

  it('formats finite values with one decimal', () => {
    expect(formatDevHealthScore(92)).toBe('92.0%');
    expect(formatDevHealthScore(81.37)).toBe('81.4%');
  });
});

describe('formatDevBestProvider', () => {
  it('returns N/A when orchestration data is missing or empty', () => {
    expect(formatDevBestProvider(null)).toBe('N/A');
    expect(formatDevBestProvider({})).toBe('N/A');
    expect(formatDevBestProvider({ multiAi: null })).toBe('N/A');
    expect(formatDevBestProvider({ multiAi: { bestProvider: '' } })).toBe('N/A');
  });

  it('returns provider name when available', () => {
    expect(formatDevBestProvider({ multiAi: { bestProvider: 'ollama' } })).toBe('ollama');
  });
});
