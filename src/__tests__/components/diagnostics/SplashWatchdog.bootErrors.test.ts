import { describe, expect, it } from 'vitest';
import { normalizeBootErrorForDisplay } from '@/components/diagnostics/SplashWatchdog';

describe('SplashWatchdog boot error normalization', () => {
  it('returns a plain string untouched', () => {
    expect(normalizeBootErrorForDisplay('boot failed')).toBe('boot failed');
  });

  it('uses msg from window.onerror-like payload', () => {
    const payload = {
      msg: 'window.onerror payload',
      url: '/app.js',
      line: 10,
      col: 20,
      source: 'window.onerror',
    };

    expect(normalizeBootErrorForDisplay(payload)).toBe('window.onerror payload');
  });

  it('falls back to JSON string when no message field is present', () => {
    const payload = { foo: 'bar', code: 42 };

    expect(normalizeBootErrorForDisplay(payload)).toBe(JSON.stringify(payload));
  });
});
