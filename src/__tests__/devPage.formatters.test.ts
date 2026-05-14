import { describe, expect, it } from 'vitest';
import {
  formatDevBackendHealth,
  formatDevBestProvider,
  formatDevHealthScore,
  getDevHealthVariant,
  getDevSurfaceTruthVariant,
  toDevFiniteNumber,
} from '@/pages/devPage.formatters';

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

describe('formatDevBackendHealth', () => {
  it('extracts a display label from wrapped health objects', () => {
    expect(
      formatDevBackendHealth({
        status: 'Healthy',
        available: true,
        error: null,
        fallback: false,
        health: 'Healthy',
      })
    ).toBe('Healthy');
    expect(formatDevBackendHealth({ available: false })).toBe('Offline');
    expect(formatDevBackendHealth({ fallback: true })).toBe('Fallback');
  });
});

describe('devPage helpers', () => {
  it('classifies backend health variants safely', () => {
    expect(getDevHealthVariant('Healthy')).toBe('success');
    expect(getDevHealthVariant({ status: 'Warning' })).toBe('warning');
    expect(getDevHealthVariant({ available: false })).toBe('error');
    expect(getDevSurfaceTruthVariant({ fallback: true })).toBe('PARTIAL');
  });

  it('falls back to finite numbers for invalid inputs', () => {
    expect(toDevFiniteNumber(undefined)).toBe(0);
    expect(toDevFiniteNumber(Number.NaN, 7)).toBe(7);
    expect(toDevFiniteNumber(42)).toBe(42);
  });
});
